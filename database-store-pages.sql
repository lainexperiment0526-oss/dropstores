-- Create custom store pages table for public storefronts
CREATE TABLE IF NOT EXISTS store_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enforce unique slugs per store
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_pages_store_slug ON store_pages(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_store_pages_store_created ON store_pages(store_id, created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_store_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_store_pages_updated_at ON store_pages;
CREATE TRIGGER trg_store_pages_updated_at
BEFORE UPDATE ON store_pages
FOR EACH ROW EXECUTE PROCEDURE update_store_pages_updated_at();
