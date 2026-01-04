-- Add Theme Color Fields to Stores Table
-- This migration adds support for custom text colors in the public store

-- Add color fields to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS heading_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS body_text_color VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB',
ADD COLUMN IF NOT EXISTS announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF';

-- Create indexes for faster theme loading
CREATE INDEX IF NOT EXISTS idx_stores_colors ON stores(primary_color, secondary_color);

-- Add comment explaining the color fields
COMMENT ON COLUMN stores.heading_text_color IS 'Color for product headings and section titles';
COMMENT ON COLUMN stores.body_text_color IS 'Color for product descriptions and body text';
COMMENT ON COLUMN stores.hero_title_text_color IS 'Color for hero section title text';
COMMENT ON COLUMN stores.hero_subtitle_text_color IS 'Color for hero section subtitle text';
COMMENT ON COLUMN stores.announcement_bar_text_color IS 'Color for announcement bar text';

-- Verify the migration
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'stores' 
AND column_name IN ('heading_text_color', 'body_text_color', 'hero_title_text_color', 'hero_subtitle_text_color', 'announcement_bar_text_color')
ORDER BY ordinal_position;
