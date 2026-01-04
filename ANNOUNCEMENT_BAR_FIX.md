## Announcement Bar Theme Color - Complete Fix Guide

### Problem
Supabase is returning error `PGRST204`: "Could not find the 'announcement_bar_text_color' column of 'stores' in the schema cache"

This means the database columns don't exist yet - the migration hasn't been applied.

### Solution

#### Step 1: Apply the Database Migration

1. **Go to Supabase Console**: https://app.supabase.com
2. **Select your project** (dropstores-6)
3. **Navigate to SQL Editor** (left sidebar)
4. **Create a new query** and paste this SQL:

```sql
-- Add Theme Text Color Fields to Stores Table
-- This migration adds support for custom text colors in store theming

-- Add color fields to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS heading_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS body_text_color VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB',
ADD COLUMN IF NOT EXISTS announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF';

-- Add additional theme columns
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stores_colors ON public.stores(primary_color, secondary_color);
CREATE INDEX IF NOT EXISTS idx_stores_text_colors ON public.stores(heading_text_color, body_text_color);
```

5. **Click "Run"** button to execute the migration
6. **Wait for completion** - you should see "Success" message

#### Step 2: Refresh Supabase Schema Cache

After running the migration:

1. **Go to Database → Tables** in Supabase console
2. **Refresh the page** (Cmd/Ctrl + R) to reload the schema
3. Or **click any refresh icon** if available in the interface

#### Step 3: Restart Your Development Server

```bash
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Implementation Details

#### Component: StoreThemeCustomizer.tsx
- ✅ Already has all fields defined
- ✅ Properly handles `announcement_bar_text_color`
- ✅ Saves to Supabase with correct mapping

#### Component: PublicStore.tsx
- ✅ Already renders announcement bar correctly
- ✅ Uses `store.announcement_bar_text_color` from database
- ✅ Properly displays when `show_announcement_bar` is true

#### Database Schema
The new migration adds 34 new columns to the `stores` table to support complete theme customization:
- **Text Color Columns**: heading_text_color, body_text_color, hero_title_text_color, hero_subtitle_text_color, announcement_bar_text_color
- **Typography Columns**: font_heading, font_body
- **Layout Columns**: layout_style, header_style, footer_style
- **Feature Toggles**: show_announcement_bar, show_product_reviews, enable_wishlist, enable_compare, show_stock_count, show_sold_count
- **Content Columns**: announcement_text, announcement_link, about_page, contact_page, shipping_policy, refund_policy, privacy_policy, terms_of_service
- **Social Media**: social_facebook, social_instagram, social_twitter, social_tiktok
- **Hero Section**: hero_title, hero_subtitle, hero_button_text, hero_button_link

### Verification

After applying the migration, verify with this SQL query:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'stores' 
AND column_name IN (
  'heading_text_color', 
  'body_text_color', 
  'hero_title_text_color', 
  'hero_subtitle_text_color', 
  'announcement_bar_text_color'
)
ORDER BY ordinal_position;
```

You should see 5 rows returned with VARCHAR(7) data types.

### Testing the Announcement Bar

1. Go to your **Store Settings** page
2. Navigate to **Theme Customizer** → **Layout** tab
3. Toggle **"Announcement Bar"** ON
4. Enter announcement text (e.g., "Free shipping on orders over $50")
5. Set **Announcement Bar Text Color** (in **Branding** tab)
6. Click **"Save Theme"**
7. Visit your **Public Store** - the announcement bar should appear at the top

### Troubleshooting

**Still getting PGRST204 error?**
- Ensure you ran the SQL migration in Supabase SQL Editor
- Check that the migration completed successfully (look for success message)
- Restart your dev server to refresh schema cache on the client

**Announcement bar not showing?**
- Verify `show_announcement_bar` is set to TRUE
- Verify `announcement_text` is not empty
- Check that `announcement_bar_text_color` has a valid hex color value

**Columns showing in Supabase but still failing?**
- Hard refresh your browser (Ctrl+Shift+R on Windows/Linux or Cmd+Shift+R on Mac)
- Clear browser cache
- Restart dev server
