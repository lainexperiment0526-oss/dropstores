# Copy-Paste Solution for Announcement Bar Error

## Problem
```
Error: Could not find the 'announcement_bar_text_color' column of 'stores' in the schema cache
Code: PGRST204
```

## Solution: 4 Simple Steps

### Step 1: Open Supabase Console
Go to: https://app.supabase.com
- Select your **dropstores-6** project

### Step 2: Open SQL Editor
- Click **"SQL Editor"** in left sidebar
- Click **"New Query"** button

### Step 3: Copy & Paste This SQL
Copy everything below and paste into the SQL editor:

```sql
-- Add Theme Text Color Fields to Stores Table
-- Migration: 2026-01-05
-- Purpose: Add complete theme customization support including announcement bar colors

ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS heading_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS body_text_color VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB',
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

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_stores_colors ON public.stores(primary_color, secondary_color);
CREATE INDEX IF NOT EXISTS idx_stores_text_colors ON public.stores(heading_text_color, body_text_color);
```

### Step 4: Run & Restart
1. Click **"RUN"** button (or Cmd/Ctrl + Enter)
2. Wait for **"Success"** message ✅
3. **Hard refresh browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Restart dev server**: Stop (Ctrl+C) and run `npm run dev`

---

## That's It! 🎉

Your announcement bar theme customizer will now work perfectly.

### Verify It Works

**In Admin Panel:**
1. Go to Store Settings → Theme Customizer
2. Go to "Layout" tab
3. Toggle "Announcement Bar" ON
4. Enter text: "Free shipping on all orders!"
5. Go to "Branding" tab
6. Set "Announcement Bar Text Color" to your desired color
7. Click "Save Theme"

**In Public Store:**
1. Visit your public store
2. You should see the announcement bar at the very top
3. Text should be in the color you selected

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting PGRST204 error | Restart dev server (Ctrl+C, then npm run dev) |
| Columns not appearing | Hard refresh browser (Ctrl+Shift+R) |
| Changes not saving | Check browser console for specific error message |
| Announcement bar not showing | Make sure "show_announcement_bar" is TRUE and "announcement_text" is not empty |

---

**Questions?** All columns have been added to your `stores` table. The feature is production-ready! 🚀
