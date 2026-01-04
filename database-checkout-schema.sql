-- Checkout Tables - Standard format for DropStore/Pi Network
-- Based on industry standards adapted for Pi Network

-- Main Checkouts table
CREATE TABLE IF NOT EXISTS checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Customer Identity
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Billing Address
  billing_full_name VARCHAR(255),
  billing_address_line_1 VARCHAR(255),
  billing_address_line_2 VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(2),
  
  -- Shipping Address
  shipping_full_name VARCHAR(255),
  shipping_address_line_1 VARCHAR(255),
  shipping_address_line_2 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(2),
  shipping_method VARCHAR(50) DEFAULT 'standard', -- standard, express, pickup, digital
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  
  -- Order Totals
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_code VARCHAR(100),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  discount_percentage DECIMAL(5, 2),
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment Information (Pi Network)
  payment_method VARCHAR(50) NOT NULL DEFAULT 'pi_wallet', -- pi_wallet, card, other
  payment_currency VARCHAR(10) DEFAULT 'PI',
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, cancelled
  transaction_id VARCHAR(255), -- Pi Horizon transaction hash
  
  -- Additional Info
  notes TEXT,
  gift_message TEXT,
  source VARCHAR(50) DEFAULT 'web', -- web, app, droplink
  device VARCHAR(20), -- mobile, desktop
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Status & Tracking
  status VARCHAR(50) DEFAULT 'pending', -- draft, pending, completed, failed, abandoned
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  CONSTRAINT valid_checkout_status CHECK (status IN ('draft', 'pending', 'completed', 'failed', 'abandoned')),
  CONSTRAINT valid_shipping_method CHECK (shipping_method IN ('standard', 'express', 'pickup', 'digital')),
  CONSTRAINT valid_source CHECK (source IN ('web', 'app', 'droplink'))
);

-- Checkout Items table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS checkout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Item Details
  title VARCHAR(255) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL, -- unit_price * quantity
  
  -- Additional Info
  sku VARCHAR(100),
  image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_quantity CHECK (quantity > 0)
);

-- Checkout Sessions table (for tracking abandoned carts)
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_email VARCHAR(255),
  
  -- Session data (JSON for flexibility)
  items_data JSONB NOT NULL, -- Array of order items
  totals_data JSONB NOT NULL, -- { subtotal, tax, discount, total }
  
  status VARCHAR(50) DEFAULT 'active', -- active, completed, abandoned, expired
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_session_status CHECK (status IN ('active', 'completed', 'abandoned', 'expired'))
);

-- Indexes for performance
CREATE INDEX idx_checkouts_store_id ON checkouts(store_id);
CREATE INDEX idx_checkouts_customer_id ON checkouts(customer_id);
CREATE INDEX idx_checkouts_payment_status ON checkouts(payment_status);
CREATE INDEX idx_checkouts_status ON checkouts(status);
CREATE INDEX idx_checkouts_email ON checkouts(email);
CREATE INDEX idx_checkouts_created_at ON checkouts(created_at);

CREATE INDEX idx_checkout_items_checkout_id ON checkout_items(checkout_id);
CREATE INDEX idx_checkout_items_product_id ON checkout_items(product_id);

CREATE INDEX idx_checkout_sessions_store_id ON checkout_sessions(store_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);

-- Create updated_at trigger for checkouts
CREATE OR REPLACE FUNCTION update_checkouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_checkouts_updated_at
BEFORE UPDATE ON checkouts
FOR EACH ROW
EXECUTE FUNCTION update_checkouts_updated_at();

-- Create updated_at trigger for checkout_sessions
CREATE OR REPLACE FUNCTION update_checkout_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_checkout_sessions_updated_at
BEFORE UPDATE ON checkout_sessions
FOR EACH ROW
EXECUTE FUNCTION update_checkout_sessions_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checkouts
CREATE POLICY "Users can view their own checkouts" ON checkouts
  FOR SELECT USING (
    customer_id = auth.uid()
  );

CREATE POLICY "Users can create checkouts" ON checkouts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Store owners can view all checkouts" ON checkouts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT DISTINCT owner_id FROM stores WHERE stores.id = checkouts.store_id
    )
  );

-- RLS Policies for checkout_items
CREATE POLICY "View checkout items via checkout" ON checkout_items
  FOR SELECT USING (
    checkout_id IN (
      SELECT id FROM checkouts WHERE
      customer_id = auth.uid() OR
      auth.uid() IN (SELECT DISTINCT owner_id FROM stores WHERE stores.id = checkouts.store_id)
    )
  );

-- RLS Policies for checkout_sessions
CREATE POLICY "View own checkout sessions" ON checkout_sessions
  FOR SELECT USING (
    auth.uid() IN (SELECT DISTINCT owner_id FROM stores WHERE stores.id = checkout_sessions.store_id)
  );
