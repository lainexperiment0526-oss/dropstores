-- Migration: Add product variants support
-- Date: 2026-01-04
-- Description: Adds has_variants column to products table for Shopify-style variant management

-- Add has_variants column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;

-- Update existing products to have has_variants = false if null
UPDATE public.products 
SET has_variants = false 
WHERE has_variants IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.products.has_variants IS 'Indicates if this product has multiple variants (sizes, colors, etc.)';

-- The product_variants table already exists in the schema, but here's the reference:
-- Variants are stored in the product_variants table with:
-- - title (variant name like "Large / Red")
-- - sku (stock keeping unit)
-- - price (variant-specific price)
-- - inventory_quantity (stock for this variant)
-- - option1, option2, option3 (for size, color, material, etc.)

-- No changes needed to product_variants table as it already exists with all required columns

SELECT 'Migration completed: has_variants column added to products table' AS status;
