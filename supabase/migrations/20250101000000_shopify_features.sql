-- Add Product Variants Support
-- This enables Shopify-like product variants (size, color, etc.)

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, -- e.g., "Size", "Color"
  variant_value TEXT NOT NULL, -- e.g., "Large", "Red"
  sku TEXT, -- Stock Keeping Unit
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- +/- from base product price
  inventory_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, variant_name, variant_value)
);

-- Add indexes
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active variants"
ON product_variants FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Merchants can manage variants"
ON product_variants FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN stores s ON s.id = p.store_id
    WHERE s.owner_id = auth.uid()
  )
);

-- Add Discount Codes Support
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- e.g., "SUMMER20"
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2), -- Minimum purchase amount required
  max_uses INTEGER, -- Maximum total uses (null = unlimited)
  max_uses_per_customer INTEGER DEFAULT 1, -- Max uses per customer
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, code)
);

-- Add indexes
CREATE INDEX idx_discount_codes_store_id ON discount_codes(store_id);
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Merchants can manage discount codes"
ON discount_codes FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- Track discount code usage
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_discount_usage_code_id ON discount_code_usage(discount_code_id);
CREATE INDEX idx_discount_usage_customer ON discount_code_usage(customer_email);

-- Enable RLS
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view discount usage"
ON discount_code_usage FOR SELECT
USING (
  discount_code_id IN (
    SELECT dc.id FROM discount_codes dc
    JOIN stores s ON s.id = dc.store_id
    WHERE s.owner_id = auth.uid()
  )
);

-- Add Price Rules Support
CREATE TABLE IF NOT EXISTS price_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('buy_x_get_y', 'bulk_discount', 'cart_value', 'flash_sale', 'customer_group')),
  
  -- Conditions
  conditions JSONB DEFAULT '{}', -- Flexible conditions storage
  -- Example structures:
  -- buy_x_get_y: {"buy_quantity": 2, "get_quantity": 1, "product_ids": ["uuid1"]}
  -- bulk_discount: {"min_quantity": 3, "product_ids": ["uuid1", "uuid2"]}
  -- cart_value: {"min_cart_value": 100}
  -- flash_sale: {"product_ids": ["uuid1"]}
  -- customer_group: {"customer_tags": ["vip", "wholesale"]}
  
  -- Discount
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_item')),
  discount_value DECIMAL(10,2) NOT NULL,
  
  -- Time restrictions
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Priority (higher number = higher priority)
  priority INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_price_rules_store_id ON price_rules(store_id);
CREATE INDEX idx_price_rules_active ON price_rules(is_active);
CREATE INDEX idx_price_rules_dates ON price_rules(starts_at, ends_at);

-- Enable RLS
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Merchants can manage price rules"
ON price_rules FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view active price rules"
ON price_rules FOR SELECT
TO public
USING (
  is_active = true AND
  (starts_at IS NULL OR starts_at <= NOW()) AND
  (ends_at IS NULL OR ends_at >= NOW())
);

-- Add discount tracking to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS applied_price_rules JSONB DEFAULT '[]';

-- Update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Make triggers idempotent: drop if they already exist, then create
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discount_codes_updated_at ON discount_codes;
CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_price_rules_updated_at ON price_rules;
CREATE TRIGGER update_price_rules_updated_at BEFORE UPDATE ON price_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_store_id UUID,
  p_code TEXT,
  p_customer_email TEXT,
  p_cart_total DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_id UUID,
  discount_value DECIMAL,
  discount_type TEXT,
  message TEXT
) AS $$
DECLARE
  v_discount discount_codes%ROWTYPE;
  v_usage_count INTEGER;
  v_customer_usage_count INTEGER;
BEGIN
  -- Find the discount code
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE store_id = p_store_id
    AND code = p_code
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW());

  -- Code not found or expired
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, ''::TEXT, 'Invalid or expired discount code';
    RETURN;
  END IF;

  -- Check minimum purchase
  IF v_discount.min_purchase IS NOT NULL AND p_cart_total < v_discount.min_purchase THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, ''::TEXT, 
      format('Minimum purchase of %s π required', v_discount.min_purchase);
    RETURN;
  END IF;

  -- Check max total uses
  IF v_discount.max_uses IS NOT NULL AND v_discount.used_count >= v_discount.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, ''::TEXT, 'Discount code has reached maximum uses';
    RETURN;
  END IF;

  -- Check max uses per customer
  SELECT COUNT(*) INTO v_customer_usage_count
  FROM discount_code_usage
  WHERE discount_code_id = v_discount.id
    AND customer_email = p_customer_email;

  IF v_discount.max_uses_per_customer IS NOT NULL 
     AND v_customer_usage_count >= v_discount.max_uses_per_customer THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, ''::TEXT, 
      'You have already used this discount code';
    RETURN;
  END IF;

  -- Valid! Return discount details
  RETURN QUERY SELECT true, v_discount.id, v_discount.discount_value, 
    v_discount.discount_type::TEXT, 'Discount code applied successfully!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION validate_discount_code TO authenticated, anon;

-- Comments for documentation
COMMENT ON TABLE product_variants IS 'Product variants for size, color, etc. like Shopify';
COMMENT ON TABLE discount_codes IS 'Discount codes (coupon codes) for stores';
COMMENT ON TABLE discount_code_usage IS 'Tracks usage of discount codes per customer';
COMMENT ON TABLE price_rules IS 'Automatic pricing rules (bulk discounts, BOGO, etc.)';
