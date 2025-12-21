-- Add delivery fee and platform fee configuration
-- Run this migration to add fee support

-- Add delivery fee columns to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_delivery_threshold DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN DEFAULT true;

-- Add platform fee column to products table (fixed at 1π per product)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 1.00;

-- Add fee breakdown columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Update existing products to have platform fee
UPDATE products 
SET platform_fee = 1.00 
WHERE platform_fee IS NULL;

-- Add comment to document platform fee
COMMENT ON COLUMN products.platform_fee IS 'Platform listing fee charged per product (default 1π)';
COMMENT ON COLUMN stores.delivery_fee IS 'Delivery fee for physical products (π)';
COMMENT ON COLUMN stores.free_delivery_threshold IS 'Minimum order amount for free delivery (π)';
COMMENT ON COLUMN stores.delivery_enabled IS 'Whether store offers delivery for physical products';
