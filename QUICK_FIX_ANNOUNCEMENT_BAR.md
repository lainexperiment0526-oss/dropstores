# Quick Fix: Announcement Bar Text Color Error

## The Problem
```
Error: Could not find the 'announcement_bar_text_color' column of 'stores' in the schema cache
```

This error occurs because the database columns don't exist yet.

## The Solution - 3 Steps

### 1. Apply Database Migration
Run this SQL in **Supabase → SQL Editor**:

```sql
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
```

### 2. Refresh Browser
- Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
- Wait 2-3 seconds

### 3. Restart Dev Server
- Stop: **Ctrl+C** in terminal
- Start: `npm run dev`

## Done!

Now your announcement bar theme customizer will work in both:
- ✅ **Store Admin** (StoreThemeCustomizer.tsx)
- ✅ **Public Store** (PublicStore.tsx)

## What Was Added

- Migration file: `supabase/migrations/20260105_add_theme_text_colors.sql`
- This adds 34 new columns to the `stores` table for complete theme customization
