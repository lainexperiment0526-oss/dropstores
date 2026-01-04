# Theme Color Customization - Fix & Setup Guide

## ✅ Issue Fixed

**Problem**: "Failed to save theme settings" error when trying to save theme colors.

**Root Cause**: Mismatch between database column names and the code:
- Database columns: `hero_title_text_color`, `hero_subtitle_text_color`
- Code was using: `hero_title_color`, `hero_subtitle_color`

**Solution**: Updated `StoreThemeCustomizer.tsx` to use correct column names.

---

## 🔧 How Theme Color Customization Works

### Step 1: Customize Colors in Dashboard
1. Go to **Store Management** → Your Store
2. Click the **Branding** tab
3. Customize these colors:
   - **Primary Color**: Main brand color (buttons, accents)
   - **Secondary Color**: Secondary brand color
   - **Heading Text Color**: For product names & titles
   - **Body Text Color**: For descriptions & body copy
   - **Hero Title Text Color**: Hero section heading
   - **Hero Subtitle Text Color**: Hero section subheading
   - **Announcement Bar Text Color**: Announcement text

### Step 2: Save Theme
- Click **"Save Theme"** button
- Should see success message: "Theme saved - Your store theme has been updated."

### Step 3: View in Public Store
- Colors update in **real-time** on your public store
- Visit `/shop/{store-slug}` to see changes

---

## 📊 Color Field Reference

| Field | Database Column | Usage | Default |
|-------|-----------------|-------|---------|
| Primary Color | `primary_color` | Buttons, links, accents | #0EA5E9 (Sky Blue) |
| Secondary Color | `secondary_color` | Secondary elements | #64748B (Slate) |
| Heading Text Color | `heading_text_color` | Product names, titles | #000000 (Black) |
| Body Text Color | `body_text_color` | Descriptions, body | #333333 (Dark Gray) |
| Hero Title Color | `hero_title_text_color` | Hero section title | #FFFFFF (White) |
| Hero Subtitle Color | `hero_subtitle_text_color` | Hero section subtitle | #E5E7EB (Light Gray) |
| Announcement Bar Color | `announcement_bar_text_color` | Announcement text | #FFFFFF (White) |

---

## 🔄 Data Flow

```
Store Manager
    ↓
Edit Theme Colors in StoreManagement
    ↓
Click "Save Theme"
    ↓
StoreThemeCustomizer.handleSave()
    ↓
Send UPDATE to stores table
    ↓
Colors saved in Supabase
    ↓
PublicStore fetches store data
    ↓
useEffect applies colors as CSS variables
    ↓
Inline styles apply to HTML elements
    ↓
Colors visible in public store
```

---

## ✨ What's Now Displayed With Custom Colors

### In Hero Section:
- ✅ Hero title uses `hero_title_text_color`
- ✅ Hero subtitle uses `hero_subtitle_text_color`

### In Product Grid:
- ✅ Product names use `heading_text_color`
- ✅ Product descriptions use `body_text_color`

### In Announcement Bar:
- ✅ Announcement text uses `announcement_bar_text_color`

### In Section Titles:
- ✅ All section headings use `heading_text_color`

### In Body Text:
- ✅ All descriptions use `body_text_color`

---

## 🎯 Troubleshooting

### If "Failed to save theme settings" appears:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Reload page (Ctrl+R)
3. Try saving again
4. Check Supabase database:
   - Go to SQL Editor
   - Run: `SELECT * FROM stores WHERE id = 'your-store-id';`
   - Verify columns exist (should show `heading_text_color`, etc.)

### If colors don't show in public store:
1. Hard refresh public store (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
2. Check browser console for errors (F12)
3. Verify store data is being fetched:
   - Open DevTools → Network tab
   - Look for `/stores` API call
   - Check if color fields are present in response

### If database columns don't exist:
1. Run migration in Supabase SQL Editor:
```sql
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS heading_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS body_text_color VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB',
ADD COLUMN IF NOT EXISTS announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF';
```

---

## 📝 Implementation Details

### Files Updated:
- `src/components/store/StoreThemeCustomizer.tsx` - Fixed field name mappings
- `src/pages/PublicStore.tsx` - Applies colors correctly (already working)

### How PublicStore Applies Colors:

```typescript
// Colors are extracted from store data
const headingTextColor = store?.heading_text_color || '#000000';
const bodyTextColor = store?.body_text_color || '#333333';
const heroTitleTextColor = store?.hero_title_text_color || '#FFFFFF';
const heroSubtitleTextColor = store?.hero_subtitle_text_color || '#E5E7EB';

// Applied as inline styles
<h2 style={{ color: headingTextColor }}>Product Title</h2>
<p style={{ color: bodyTextColor }}>Description</p>

// Also applied as CSS variables
root.style.setProperty('--heading-text-color', headingTextColor);
```

---

## ✅ Verification Checklist

- [x] `StoreThemeCustomizer.tsx` uses correct field names
- [x] Save operation includes all color fields
- [x] Database columns exist (or migration created)
- [x] `PublicStore.tsx` reads color fields correctly
- [x] Colors applied to all relevant sections
- [x] No TypeScript errors
- [x] No runtime errors

---

## 🚀 Summary

Theme color customization is now **fully functional**:
1. ✅ Merchants can customize all colors
2. ✅ Colors save to database without errors
3. ✅ Colors display immediately in public store
4. ✅ All sections use custom colors (hero, products, text, etc.)
5. ✅ Fully responsive and mobile-friendly

**How to Test**:
1. Go to Store Management
2. Change theme colors
3. Click "Save Theme"
4. Visit public store
5. See colors change in real-time
