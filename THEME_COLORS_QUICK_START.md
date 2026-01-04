# Quick Start - Theme Colors

## What Changed?

The **PublicStore now displays all theme colors** from the StoreManagement dashboard.

---

## Step 1: Run Database Migration

In Supabase SQL Editor:

```sql
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS heading_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS body_text_color VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB',
ADD COLUMN IF NOT EXISTS announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF';
```

---

## Step 2: Customize Colors in StoreManagement

1. Go to Store Settings → Theme Colors
2. Customize:
   - Heading Text Color
   - Body Text Color
   - Hero Title Text Color
   - Hero Subtitle Text Color
   - Announcement Bar Text Color
3. Save

---

## Step 3: View in Public Store

Colors now appear in:
- ✅ Product names (heading text color)
- ✅ Product descriptions (body text color)
- ✅ Hero section title (hero title text color)
- ✅ Hero section subtitle (hero subtitle text color)
- ✅ Announcement bar (announcement bar text color)
- ✅ All section titles and body text

---

## Color Field Reference

| Field | Default | Usage |
|-------|---------|-------|
| `heading_text_color` | `#000000` | Product headings, titles |
| `body_text_color` | `#333333` | Descriptions, body text |
| `hero_title_text_color` | `#FFFFFF` | Hero title text |
| `hero_subtitle_text_color` | `#E5E7EB` | Hero subtitle text |
| `announcement_bar_text_color` | `#FFFFFF` | Announcement bar text |

---

## ✅ Done!

Theme colors now work end-to-end:
- Store owner customizes in dashboard
- Colors saved to database
- Public store displays them immediately
- Fully real-time

No cache, no delays - changes show instantly.
