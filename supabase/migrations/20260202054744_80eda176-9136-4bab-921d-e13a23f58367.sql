-- Create store_pages table for custom store pages
CREATE TABLE IF NOT EXISTS public.store_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index for slug per store
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_pages_store_slug 
ON public.store_pages(store_id, slug);

-- Create index for fast page retrieval
CREATE INDEX IF NOT EXISTS idx_store_pages_store_created 
ON public.store_pages(store_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.store_pages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view published pages
CREATE POLICY "Store pages are viewable by everyone"
ON public.store_pages FOR SELECT
USING (is_published = true);

-- Allow store owners to manage their pages
CREATE POLICY "Store owners can manage their pages"
ON public.store_pages FOR ALL
USING (
  store_id IN (
    SELECT id FROM public.stores WHERE owner_id = auth.uid()
  )
);

-- Add missing theme color columns to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS heading_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS body_text_color VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB';

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_store_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trg_store_pages_updated_at ON public.store_pages;
CREATE TRIGGER trg_store_pages_updated_at
BEFORE UPDATE ON public.store_pages
FOR EACH ROW EXECUTE FUNCTION update_store_pages_updated_at();