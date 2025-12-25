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
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view active variants" ON product_variants;
CREATE POLICY "Public can view active variants"
ON product_variants FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Merchants can manage variants" ON product_variants;
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
CREATE INDEX IF NOT EXISTS idx_discount_codes_store_id ON discount_codes(store_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Merchants can manage discount codes" ON discount_codes;
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
CREATE INDEX IF NOT EXISTS idx_discount_usage_code_id ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_customer ON discount_code_usage(customer_email);

-- Enable RLS
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can view discount usage" ON discount_code_usage;
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
CREATE INDEX IF NOT EXISTS idx_price_rules_store_id ON price_rules(store_id);
CREATE INDEX IF NOT EXISTS idx_price_rules_active ON price_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_price_rules_dates ON price_rules(starts_at, ends_at);

-- Enable RLS
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Merchants can manage price rules" ON price_rules;
CREATE POLICY "Merchants can manage price rules"
ON price_rules FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Public can view active price rules" ON price_rules;
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

-- =============================================
-- Shopify-like Core Features (Phase 1)
-- Collections, Options, Inventory, Customers,
-- Carts/Checkout, Shipping/Tax, Tags, Metafields
-- =============================================

-- Collections (product grouping)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_collections_store_id ON collections(store_id);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active collections" ON collections;
CREATE POLICY "Public can view active collections"
ON collections FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Merchants can manage collections" ON collections;
CREATE POLICY "Merchants can manage collections"
ON collections FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- Product ↔ Collections mapping
CREATE TABLE IF NOT EXISTS product_collections (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_product ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection ON product_collections(collection_id);

ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage product collections" ON product_collections;
CREATE POLICY "Merchants manage product collections"
ON product_collections FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN stores s ON s.id = p.store_id
    WHERE s.owner_id = auth.uid()
  )
);

-- Product Options (e.g., Size, Color)
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, name)
);

CREATE INDEX IF NOT EXISTS idx_product_options_product ON product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_options_active ON product_options(is_active);

ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage product options" ON product_options;
CREATE POLICY "Merchants manage product options"
ON product_options FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN stores s ON s.id = p.store_id
    WHERE s.owner_id = auth.uid()
  )
);

-- Option Values (e.g., Large, Red)
CREATE TABLE IF NOT EXISTS product_option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(option_id, value)
);

CREATE INDEX IF NOT EXISTS idx_product_option_values_option ON product_option_values(option_id);
CREATE INDEX IF NOT EXISTS idx_product_option_values_active ON product_option_values(is_active);

ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage product option values" ON product_option_values;
CREATE POLICY "Merchants manage product option values"
ON product_option_values FOR ALL
USING (
  option_id IN (
    SELECT o.id FROM product_options o
    JOIN products p ON p.id = o.product_id
    JOIN stores s ON s.id = p.store_id
    WHERE s.owner_id = auth.uid()
  )
);

-- Link Variant to Option/value snapshot for quick filtering
CREATE TABLE IF NOT EXISTS product_variant_options (
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  option_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (variant_id, option_name)
);

CREATE INDEX IF NOT EXISTS idx_product_variant_options_variant ON product_variant_options(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variant_options_active ON product_variant_options(is_active);

ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage variant options" ON product_variant_options;
CREATE POLICY "Merchants manage variant options"
ON product_variant_options FOR ALL
USING (
  variant_id IN (
    SELECT v.id FROM product_variants v
    JOIN products p ON p.id = v.product_id
    JOIN stores s ON s.id = p.store_id
    WHERE s.owner_id = auth.uid()
  )
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_active ON product_images(is_active);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active product images" ON product_images;
CREATE POLICY "Public can view active product images"
ON product_images FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Merchants can manage product images" ON product_images;
CREATE POLICY "Merchants can manage product images"
ON product_images FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN stores s ON s.id = p.store_id
    WHERE s.owner_id = auth.uid()
  )
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_store ON tags(store_id);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage tags" ON tags;
CREATE POLICY "Merchants manage tags"
ON tags FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- Product ↔ Tags
CREATE TABLE IF NOT EXISTS product_tags (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage product tags" ON product_tags;
CREATE POLICY "Merchants manage product tags"
ON product_tags FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN stores s ON s.id = p.store_id
    WHERE s.owner_id = auth.uid()
  )
);

-- Metafields (generic extensibility)
CREATE TABLE IF NOT EXISTS metafields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('store','product','variant','collection')),
  owner_id UUID NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_type, owner_id, namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_metafields_owner ON metafields(owner_type, owner_id);

ALTER TABLE metafields ENABLE ROW LEVEL SECURITY;

-- Merchant can manage metafields they own
DROP POLICY IF EXISTS "Merchants manage metafields" ON metafields;
CREATE POLICY "Merchants manage metafields"
ON metafields FOR ALL
USING (
  (
    owner_type = 'store' AND owner_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  ) OR (
    owner_type = 'product' AND owner_id IN (
      SELECT p.id FROM products p JOIN stores s ON s.id = p.store_id WHERE s.owner_id = auth.uid()
    )
  ) OR (
    owner_type = 'variant' AND owner_id IN (
      SELECT v.id FROM product_variants v JOIN products p ON p.id = v.product_id JOIN stores s ON s.id = p.store_id WHERE s.owner_id = auth.uid()
    )
  ) OR (
    owner_type = 'collection' AND owner_id IN (
      SELECT c.id FROM collections c JOIN stores s ON s.id = c.store_id WHERE s.owner_id = auth.uid()
    )
  )
);

-- Inventory Locations
CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  postal_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_locations_store ON inventory_locations(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_active ON inventory_locations(is_active);

ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage inventory locations" ON inventory_locations;
CREATE POLICY "Merchants manage inventory locations"
ON inventory_locations FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- Inventory Items (per variant per location)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  available INTEGER DEFAULT 0,
  reserved INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_variant ON inventory_items(variant_id);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage inventory items" ON inventory_items;
CREATE POLICY "Merchants manage inventory items"
ON inventory_items FOR ALL
USING (
  location_id IN (
    SELECT l.id FROM inventory_locations l JOIN stores s ON s.id = l.store_id WHERE s.owner_id = auth.uid()
  )
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  tags JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, email)
);

CREATE INDEX IF NOT EXISTS idx_customers_store ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage customers" ON customers;
CREATE POLICY "Merchants manage customers"
ON customers FOR ALL
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_active ON customer_addresses(is_active);

ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants or customer manage addresses" ON customer_addresses;
CREATE POLICY "Merchants or customer manage addresses"
ON customer_addresses FOR ALL
USING (
  customer_id IN (
    SELECT c.id FROM customers c WHERE c.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  ) OR customer_id IN (
    SELECT c.id FROM customers c WHERE c.user_id = auth.uid()
  )
);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('open','converted','abandoned')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_store ON carts(store_id);
CREATE INDEX IF NOT EXISTS idx_carts_customer ON carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(session_id);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own carts" ON carts;
CREATE POLICY "Customers can view own carts"
ON carts FOR SELECT
USING (
  customer_id IN (SELECT c.id FROM customers c WHERE c.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Merchants manage store carts" ON carts;
CREATE POLICY "Merchants manage store carts"
ON carts FOR ALL
USING (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_active ON cart_items(is_active);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers or merchants manage cart items" ON cart_items;
CREATE POLICY "Customers or merchants manage cart items"
ON cart_items FOR ALL
USING (
  cart_id IN (
    SELECT ca.id FROM carts ca WHERE ca.customer_id IN (SELECT c.id FROM customers c WHERE c.user_id = auth.uid())
  ) OR cart_id IN (
    SELECT ca.id FROM carts ca WHERE ca.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  )
);

-- Checkouts
CREATE TABLE IF NOT EXISTS checkouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending','paid','failed','cancelled')) DEFAULT 'pending',
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkouts_cart ON checkouts(cart_id);

ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers or merchants manage checkouts" ON checkouts;
CREATE POLICY "Customers or merchants manage checkouts"
ON checkouts FOR ALL
USING (
  cart_id IN (
    SELECT ca.id FROM carts ca WHERE ca.customer_id IN (SELECT c.id FROM customers c WHERE c.user_id = auth.uid())
  ) OR cart_id IN (
    SELECT ca.id FROM carts ca WHERE ca.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  )
);

-- Shipping Rates (flat/simple)
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  country TEXT,
  region TEXT,
  min_cart_value DECIMAL(10,2),
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_rates_store ON shipping_rates(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_active ON shipping_rates(is_active);

ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active shipping rates" ON shipping_rates;
CREATE POLICY "Public can view active shipping rates"
ON shipping_rates FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Merchants manage shipping rates" ON shipping_rates;
CREATE POLICY "Merchants manage shipping rates"
ON shipping_rates FOR ALL
USING (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

-- Tax Rates (simple store-level setup)
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  country TEXT,
  region TEXT,
  rate DECIMAL(5,4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_rates_store ON tax_rates(store_id);
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON tax_rates(is_active);

ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active tax rates" ON tax_rates;
CREATE POLICY "Public can view active tax rates"
ON tax_rates FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Merchants manage tax rates" ON tax_rates;
CREATE POLICY "Merchants manage tax rates"
ON tax_rates FOR ALL
USING (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

-- Fulfillments (basic)
CREATE TABLE IF NOT EXISTS fulfillments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending','shipped','delivered','cancelled')) DEFAULT 'pending',
  tracking_number TEXT,
  carrier TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fulfillments_order ON fulfillments(order_id);

ALTER TABLE fulfillments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage fulfillments" ON fulfillments;
CREATE POLICY "Merchants manage fulfillments"
ON fulfillments FOR ALL
USING (
  order_id IN (
    SELECT o.id FROM orders o JOIN stores s ON s.id = o.store_id WHERE s.owner_id = auth.uid()
  )
);

-- Refunds (basic)
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants manage refunds" ON refunds;
CREATE POLICY "Merchants manage refunds"
ON refunds FOR ALL
USING (
  order_id IN (
    SELECT o.id FROM orders o JOIN stores s ON s.id = o.store_id WHERE s.owner_id = auth.uid()
  )
);

-- Unified updated_at trigger for new tables
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_options_updated_at ON product_options;
CREATE TRIGGER update_product_options_updated_at BEFORE UPDATE ON product_options
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_option_values_updated_at ON product_option_values;
CREATE TRIGGER update_product_option_values_updated_at BEFORE UPDATE ON product_option_values
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_images_updated_at ON product_images;
CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON product_images
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_metafields_updated_at ON metafields;
CREATE TRIGGER update_metafields_updated_at BEFORE UPDATE ON metafields
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_locations_updated_at ON inventory_locations;
CREATE TRIGGER update_inventory_locations_updated_at BEFORE UPDATE ON inventory_locations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_addresses_updated_at ON customer_addresses;
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_checkouts_updated_at ON checkouts;
CREATE TRIGGER update_checkouts_updated_at BEFORE UPDATE ON checkouts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_rates_updated_at ON shipping_rates;
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON shipping_rates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tax_rates_updated_at ON tax_rates;
CREATE TRIGGER update_tax_rates_updated_at BEFORE UPDATE ON tax_rates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fulfillments_updated_at ON fulfillments;
CREATE TRIGGER update_fulfillments_updated_at BEFORE UPDATE ON fulfillments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper: Calculate cart totals (basic)
CREATE OR REPLACE FUNCTION calculate_cart_totals(
  p_cart_id UUID
)
RETURNS TABLE (
  subtotal DECIMAL,
  discount DECIMAL,
  tax DECIMAL,
  shipping DECIMAL,
  total DECIMAL
) AS $$
DECLARE
  v_subtotal DECIMAL := 0;
BEGIN
  SELECT COALESCE(SUM(ci.unit_price * ci.quantity), 0) INTO v_subtotal
  FROM cart_items ci
  WHERE ci.cart_id = p_cart_id;

  RETURN QUERY SELECT v_subtotal, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL, v_subtotal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION calculate_cart_totals TO authenticated, anon;

-- Comments
COMMENT ON TABLE collections IS 'Product collections/groups similar to Shopify collections';
COMMENT ON TABLE product_options IS 'Options per product (e.g., Size, Color)';
COMMENT ON TABLE product_option_values IS 'Available values for a product option';
COMMENT ON TABLE product_variant_options IS 'Snapshot of variant options for filtering';
COMMENT ON TABLE product_images IS 'Images attached to products';
COMMENT ON TABLE tags IS 'Store-level tags';
COMMENT ON TABLE product_tags IS 'Mapping between products and tags';
COMMENT ON TABLE metafields IS 'Generic extensibility fields across entities';
COMMENT ON TABLE inventory_locations IS 'Locations (warehouses/stores) holding inventory';
COMMENT ON TABLE inventory_items IS 'Inventory per variant per location';
COMMENT ON TABLE customers IS 'Store customers linked to auth.users when possible';
COMMENT ON TABLE customer_addresses IS 'Addresses for customers';
COMMENT ON TABLE carts IS 'Shopping carts linked to store/customer/session';
COMMENT ON TABLE cart_items IS 'Items within a cart';
COMMENT ON TABLE checkouts IS 'Checkout computations and payment status';
COMMENT ON TABLE shipping_rates IS 'Simple shipping rate rules';
COMMENT ON TABLE tax_rates IS 'Simple tax rate rules';
COMMENT ON TABLE fulfillments IS 'Order shipment tracking';
COMMENT ON TABLE refunds IS 'Order refunds tracking';
