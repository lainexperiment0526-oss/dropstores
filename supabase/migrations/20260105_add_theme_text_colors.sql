-- Add Theme Text Color Fields to Stores Table
-- This migration adds support for custom text colors in store theming

-- Add color fields to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS heading_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS body_text_color VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB',
ADD COLUMN IF NOT EXISTS announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF';

-- Add additional theme columns that might be missing
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS font_heading VARCHAR(50) DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS font_body VARCHAR(50) DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS layout_style VARCHAR(50) DEFAULT 'grid',
ADD COLUMN IF NOT EXISTS header_style VARCHAR(50) DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS footer_style VARCHAR(50) DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS show_announcement_bar BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS announcement_text TEXT,
ADD COLUMN IF NOT EXISTS announcement_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(500),
ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(500),
ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(500),
ADD COLUMN IF NOT EXISTS social_tiktok VARCHAR(500),
ADD COLUMN IF NOT EXISTS about_page TEXT,
ADD COLUMN IF NOT EXISTS contact_page TEXT,
ADD COLUMN IF NOT EXISTS shipping_policy TEXT,
ADD COLUMN IF NOT EXISTS refund_policy TEXT,
ADD COLUMN IF NOT EXISTS privacy_policy TEXT,
ADD COLUMN IF NOT EXISTS terms_of_service TEXT,
ADD COLUMN IF NOT EXISTS show_product_reviews BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_wishlist BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_compare BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS products_per_page INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS show_stock_count BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_sold_count BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hero_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_button_text VARCHAR(100) DEFAULT 'Shop Now',
ADD COLUMN IF NOT EXISTS hero_button_link VARCHAR(500);

-- Create indexes for faster theme loading
CREATE INDEX IF NOT EXISTS idx_stores_colors ON public.stores(primary_color, secondary_color);
CREATE INDEX IF NOT EXISTS idx_stores_text_colors ON public.stores(heading_text_color, body_text_color);

-- Add comments explaining the color fields
COMMENT ON COLUMN public.stores.heading_text_color IS 'Color for product headings and section titles';
COMMENT ON COLUMN public.stores.body_text_color IS 'Color for product descriptions and body text';
COMMENT ON COLUMN public.stores.hero_title_text_color IS 'Color for hero section title text';
COMMENT ON COLUMN public.stores.hero_subtitle_text_color IS 'Color for hero section subtitle text';
COMMENT ON COLUMN public.stores.announcement_bar_text_color IS 'Color for announcement bar text';
COMMENT ON COLUMN public.stores.font_heading IS 'Font family for headings';
COMMENT ON COLUMN public.stores.font_body IS 'Font family for body text';
COMMENT ON COLUMN public.stores.layout_style IS 'Product layout style (grid, list, masonry)';
COMMENT ON COLUMN public.stores.show_announcement_bar IS 'Whether to display the announcement bar';
COMMENT ON COLUMN public.stores.show_product_reviews IS 'Whether to enable product reviews';
COMMENT ON COLUMN public.stores.enable_wishlist IS 'Whether to enable wishlist feature';
COMMENT ON COLUMN public.stores.enable_compare IS 'Whether to enable product comparison';
COMMENT ON COLUMN public.stores.products_per_page IS 'Number of products to display per page';
COMMENT ON COLUMN public.stores.show_stock_count IS 'Whether to display available stock count';
COMMENT ON COLUMN public.stores.show_sold_count IS 'Whether to display number of items sold';
