-- Create custom store pages table for public storefronts
-- This allows stores to have custom pages like About, Contact, etc.

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

-- Enforce unique slugs per store (can't have duplicate page slugs in same store)
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_pages_store_slug ON public.store_pages(store_id, slug);

-- Index for fast retrieval of pages by store and creation date
CREATE INDEX IF NOT EXISTS idx_store_pages_store_created ON public.store_pages(store_id, created_at DESC);

-- Auto-update the updated_at timestamp on modifications
CREATE OR REPLACE FUNCTION update_store_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trg_store_pages_updated_at ON public.store_pages;

-- Create trigger to auto-update timestamp
CREATE TRIGGER trg_store_pages_updated_at
BEFORE UPDATE ON public.store_pages
FOR EACH ROW EXECUTE PROCEDURE update_store_pages_updated_at();

-- Add column comments
COMMENT ON TABLE public.store_pages IS 'Custom pages for store storefronts (About, Contact, Policies, etc)';
COMMENT ON COLUMN public.store_pages.id IS 'Unique page identifier';
COMMENT ON COLUMN public.store_pages.store_id IS 'Reference to the store this page belongs to';
COMMENT ON COLUMN public.store_pages.title IS 'Display title of the page';
COMMENT ON COLUMN public.store_pages.slug IS 'URL-friendly identifier (must be unique per store)';
COMMENT ON COLUMN public.store_pages.content IS 'HTML/Markdown content of the page';
COMMENT ON COLUMN public.store_pages.is_published IS 'Whether the page is visible to customers';
COMMENT ON COLUMN public.store_pages.created_at IS 'When the page was created';
COMMENT ON COLUMN public.store_pages.updated_at IS 'When the page was last modified';
