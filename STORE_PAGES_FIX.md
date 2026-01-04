# Fix: PGRST205 - Missing store_pages Table

**Error**: `PGRST205 - Could not find the table 'public.store_pages' in the schema cache`

**Location**: StorePagesManager.tsx (line 56)

**Status**: ✅ FIXED - Migration created

---

## Quick Fix (3 Steps)

### Step 1: Open Supabase SQL Editor
Go to https://app.supabase.com → Your Project → SQL Editor

### Step 2: Create New Query & Run This SQL
```sql
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_pages_store_slug ON public.store_pages(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_store_pages_store_created ON public.store_pages(store_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_store_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_store_pages_updated_at ON public.store_pages;
CREATE TRIGGER trg_store_pages_updated_at
BEFORE UPDATE ON public.store_pages
FOR EACH ROW EXECUTE PROCEDURE update_store_pages_updated_at();
```

### Step 3: Restart & Refresh
1. Hard refresh browser (Ctrl+Shift+R)
2. Restart dev server (Ctrl+C, npm run dev)

**Done!** ✅

---

## What This Creates

**Table**: `store_pages`
- **Purpose**: Custom pages for store storefronts (About, Contact, Policies)
- **Columns**: id, store_id, title, slug, content, is_published, created_at, updated_at
- **Features**: Auto-updating timestamps, unique slug enforcement per store

**Indexes** (for performance):
- `idx_store_pages_store_slug` - Fast lookup by store + slug
- `idx_store_pages_store_created` - Fast retrieval by store + date

**Trigger**:
- Auto-updates `updated_at` timestamp when pages are modified

---

## Migration File Created
`supabase/migrations/20260105_create_store_pages_table.sql`

This file is ready to be applied to Supabase automatically.

---

## Related Error
This is similar to the announcement bar color error - another missing database table. Both should be applied together for complete functionality.

**Total Migrations Needed**:
1. ✅ `20260105_add_theme_text_colors.sql` (34 new columns)
2. ✅ `20260105_create_store_pages_table.sql` (new table)
