-- Add enhanced store customization fields for Shopify-like features
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS font_heading text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS font_body text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS layout_style text DEFAULT 'grid',
ADD COLUMN IF NOT EXISTS header_style text DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS footer_style text DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS show_announcement_bar boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS announcement_text text,
ADD COLUMN IF NOT EXISTS announcement_link text,
ADD COLUMN IF NOT EXISTS social_facebook text,
ADD COLUMN IF NOT EXISTS social_instagram text,
ADD COLUMN IF NOT EXISTS social_twitter text,
ADD COLUMN IF NOT EXISTS social_tiktok text,
ADD COLUMN IF NOT EXISTS about_page text,
ADD COLUMN IF NOT EXISTS contact_page text,
ADD COLUMN IF NOT EXISTS shipping_policy text,
ADD COLUMN IF NOT EXISTS refund_policy text,
ADD COLUMN IF NOT EXISTS privacy_policy text,
ADD COLUMN IF NOT EXISTS terms_of_service text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'π',
ADD COLUMN IF NOT EXISTS show_product_reviews boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_wishlist boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_compare boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS products_per_page integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS show_stock_count boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_sold_count boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_title text,
ADD COLUMN IF NOT EXISTS hero_subtitle text,
ADD COLUMN IF NOT EXISTS hero_button_text text DEFAULT 'Shop Now',
ADD COLUMN IF NOT EXISTS hero_button_link text,
ADD COLUMN IF NOT EXISTS featured_collection_id uuid,
ADD COLUMN IF NOT EXISTS show_featured_collection boolean DEFAULT false;

-- Add product tags and SEO fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS vendor text,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS weight_unit text DEFAULT 'kg',
ADD COLUMN IF NOT EXISTS requires_shipping boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Create store navigation table
CREATE TABLE IF NOT EXISTS public.store_navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  link text NOT NULL,
  position integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  parent_id uuid REFERENCES store_navigation(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for store navigation
ALTER TABLE public.store_navigation ENABLE ROW LEVEL SECURITY;

-- RLS policies for store navigation
CREATE POLICY "Store navigation viewable for published stores"
ON public.store_navigation FOR SELECT
USING (EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = store_navigation.store_id 
  AND stores.is_published = true
));

CREATE POLICY "Store owners can manage navigation"
ON public.store_navigation FOR ALL
USING (EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = store_navigation.store_id 
  AND stores.owner_id = auth.uid()
));

-- Create product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for product reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for product reviews
CREATE POLICY "Approved reviews are viewable"
ON public.product_reviews FOR SELECT
USING (is_approved = true);

CREATE POLICY "Anyone can submit reviews"
ON public.product_reviews FOR INSERT
WITH CHECK (true);

CREATE POLICY "Store owners can manage reviews"
ON public.product_reviews FOR ALL
USING (EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = product_reviews.store_id 
  AND stores.owner_id = auth.uid()
));

-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(store_id, product_id, customer_email)
);

-- Enable RLS for wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlists
CREATE POLICY "Anyone can manage wishlists"
ON public.wishlists FOR ALL
USING (true);

-- Create store banners/slides table
CREATE TABLE IF NOT EXISTS public.store_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title text,
  subtitle text,
  image_url text NOT NULL,
  link text,
  button_text text,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for store banners
ALTER TABLE public.store_banners ENABLE ROW LEVEL SECURITY;

-- RLS policies for store banners
CREATE POLICY "Banners viewable for published stores"
ON public.store_banners FOR SELECT
USING (is_active = true AND EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = store_banners.store_id 
  AND stores.is_published = true
));

CREATE POLICY "Store owners can manage banners"
ON public.store_banners FOR ALL
USING (EXISTS (
  SELECT 1 FROM stores 
  WHERE stores.id = store_banners.store_id 
  AND stores.owner_id = auth.uid()
));