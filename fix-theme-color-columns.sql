-- Verify and add theme color columns to stores table
-- Run this in your Supabase SQL Editor

-- Check if columns exist (you'll see results if they exist)
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND table_schema = 'public'
AND column_name IN (
  'heading_text_color',
  'body_text_color', 
  'hero_title_text_color',
  'hero_subtitle_text_color',
  'announcement_bar_text_color'
)
ORDER BY column_name;

-- Add columns if they don't exist (safe to run multiple times)
DO $$ 
BEGIN
  -- Add heading_text_color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'heading_text_color'
  ) THEN
    ALTER TABLE public.stores 
    ADD COLUMN heading_text_color VARCHAR(7) DEFAULT '#000000';
  END IF;

  -- Add body_text_color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'body_text_color'
  ) THEN
    ALTER TABLE public.stores 
    ADD COLUMN body_text_color VARCHAR(7) DEFAULT '#333333';
  END IF;

  -- Add hero_title_text_color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'hero_title_text_color'
  ) THEN
    ALTER TABLE public.stores 
    ADD COLUMN hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF';
  END IF;

  -- Add hero_subtitle_text_color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'hero_subtitle_text_color'
  ) THEN
    ALTER TABLE public.stores 
    ADD COLUMN hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB';
  END IF;

  -- Add announcement_bar_text_color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'announcement_bar_text_color'
  ) THEN
    ALTER TABLE public.stores 
    ADD COLUMN announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF';
  END IF;
END $$;

-- Create index for faster theme loading (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_stores_text_colors 
ON public.stores(heading_text_color, body_text_color);

-- Add helpful comments
COMMENT ON COLUMN public.stores.heading_text_color IS 'Color for product headings and section titles';
COMMENT ON COLUMN public.stores.body_text_color IS 'Color for product descriptions and body text';
COMMENT ON COLUMN public.stores.hero_title_text_color IS 'Color for hero section title text';
COMMENT ON COLUMN public.stores.hero_subtitle_text_color IS 'Color for hero section subtitle text';
COMMENT ON COLUMN public.stores.announcement_bar_text_color IS 'Color for announcement bar text';

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  column_default,
  CASE 
    WHEN column_default IS NOT NULL THEN '✓ Has Default'
    ELSE '✗ No Default'
  END as status
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND table_schema = 'public'
AND column_name IN (
  'heading_text_color',
  'body_text_color', 
  'hero_title_text_color',
  'hero_subtitle_text_color',
  'announcement_bar_text_color'
)
ORDER BY column_name;
