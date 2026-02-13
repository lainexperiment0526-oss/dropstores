-- Add has_variants flag to products for variant support
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS has_variants boolean DEFAULT false;
