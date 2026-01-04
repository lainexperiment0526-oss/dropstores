# ⚡ QUICK FIX - Theme Colors Not Saving

**Problem**: "Failed to save theme settings" error

**Why**: Database columns don't exist yet

**Fix**: Copy-paste SQL → Click RUN → Done

---

## 🚀 Fix in 2 Minutes

### 1️⃣ Go to Supabase SQL Editor
https://app.supabase.com → Project → SQL Editor → New Query

### 2️⃣ Copy & Paste This

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

CREATE INDEX IF NOT EXISTS idx_stores_colors ON public.stores(primary_color, secondary_color);
CREATE INDEX IF NOT EXISTS idx_stores_text_colors ON public.stores(heading_text_color, body_text_color);
```

### 3️⃣ Click "RUN"

**Wait for**: ✅ "Success"

---

## 🔄 Refresh & Test

```bash
# In browser
Ctrl+Shift+R  (Windows) or Cmd+Shift+R (Mac)

# In terminal
Ctrl+C        (stop dev server)
npm run dev   (start dev server)
```

---

## ✅ Test It Works

1. Go to **Store Settings** → **Theme Customizer**
2. Set **Announcement Bar Text Color** = Red (#FF0000)
3. Click **Save Theme**
4. Should see: ✅ "Theme saved"
5. Visit **Public Store**
6. Announcement bar should be **RED** ✅

---

## 🎯 What Was Missing

| Item | Before | After |
|------|--------|-------|
| **announcement_bar_text_color** | ❌ Doesn't exist | ✅ Exists |
| **heading_text_color** | ❌ Doesn't exist | ✅ Exists |
| **body_text_color** | ❌ Doesn't exist | ✅ Exists |
| **+ 31 more columns** | ❌ Don't exist | ✅ Exist |
| **Saving colors** | ❌ Fails | ✅ Works |
| **Public store display** | ❌ Broken | ✅ Works |

---

**Status**: ✅ Ready to deploy!

Run the SQL above and your theme colors will work perfectly! 🎨
