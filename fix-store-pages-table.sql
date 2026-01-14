-- Fix store_pages table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Create the table if it doesn't exist
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

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_store_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS trg_store_pages_updated_at ON public.store_pages;

CREATE TRIGGER trg_store_pages_updated_at
BEFORE UPDATE ON public.store_pages
FOR EACH ROW EXECUTE PROCEDURE update_store_pages_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.store_pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Store pages are viewable by everyone" ON public.store_pages;
DROP POLICY IF EXISTS "Store owners can manage their pages" ON public.store_pages;

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

-- Add helpful comments
COMMENT ON TABLE public.store_pages IS 'Custom pages for store storefronts (About, Contact, Policies, etc)';
COMMENT ON COLUMN public.store_pages.id IS 'Unique page identifier';
COMMENT ON COLUMN public.store_pages.store_id IS 'Reference to the store this page belongs to';
COMMENT ON COLUMN public.store_pages.title IS 'Display title of the page';
COMMENT ON COLUMN public.store_pages.slug IS 'URL-friendly identifier (must be unique per store)';
COMMENT ON COLUMN public.store_pages.content IS 'HTML/Markdown content of the page';
COMMENT ON COLUMN public.store_pages.is_published IS 'Whether the page is visible to customers';
COMMENT ON COLUMN public.store_pages.created_at IS 'When the page was created';
COMMENT ON COLUMN public.store_pages.updated_at IS 'When the page was last modified';
