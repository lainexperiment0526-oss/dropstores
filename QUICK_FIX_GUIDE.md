# Quick Fix Guide - Theme Customizer & Store Pages

## 🔴 Problem Summary
- **Error**: "Failed to load pages" in Store Management
- **Issue**: Theme colors not saving properly
- **Cause**: Missing database tables or columns

---

## ✅ Solution (3 Steps - Takes 2 Minutes)

### Step 1️⃣: Fix Store Pages Table

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click "New Query"
4. Copy and paste the contents of **`fix-store-pages-table.sql`**
5. Click **"Run"** or press `Ctrl+Enter`
6. Wait for "Success" message

**What this does:**
- Creates the `store_pages` table
- Sets up security policies (RLS)
- Adds indexes for fast loading

---

### Step 2️⃣: Fix Theme Color Columns

1. In **Supabase SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of **`fix-theme-color-columns.sql`**
4. Click **"Run"** or press `Ctrl+Enter`
5. Check the results - you should see 5 color columns listed

**What this does:**
- Adds missing color columns to stores table
- Sets default colors
- Adds database comments

---

### Step 3️⃣: Test the Fixes

1. **Hard refresh your browser**:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Test Pages**:
   - Go to Store Management
   - Click "Pages" tab
   - Error should be gone ✓

3. **Test Theme Colors**:
   - Go to "Theme" tab
   - Change "Heading Text Color"
   - Click "Save Theme"
   - Refresh page
   - Color should persist ✓

---

## 🔍 How to Check if It Worked

### Check Browser Console (F12):
- **Before Fix**: Red errors like "relation 'store_pages' does not exist"
- **After Fix**: No errors, or logs showing "✅ Theme saved successfully"

### Check Store Management:
- **Before Fix**: "Failed to load pages" error message
- **After Fix**: Empty pages list or your existing pages

### Check Theme Customizer:
- **Before Fix**: Colors don't save or revert after refresh
- **After Fix**: Colors persist after saving and refreshing

---

## ❌ If Still Not Working

### Run This Diagnostic SQL:

```sql
-- Check if store_pages table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'store_pages'
) as store_pages_exists;

-- Check if theme color columns exist
SELECT 
  CASE WHEN COUNT(*) = 5 THEN 'All 5 columns exist ✓'
       ELSE 'Missing ' || (5 - COUNT(*)) || ' columns ✗'
  END as color_columns_status,
  STRING_AGG(column_name, ', ') as found_columns
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND column_name IN (
  'heading_text_color',
  'body_text_color', 
  'hero_title_text_color',
  'hero_subtitle_text_color',
  'announcement_bar_text_color'
);
```

### Expected Results:
```
store_pages_exists: true
color_columns_status: "All 5 columns exist ✓"
```

### If Results Show FALSE or Missing Columns:
1. Re-run the SQL files from Steps 1 & 2
2. Check Supabase dashboard for any error messages
3. Make sure you're in the correct project

---

## 🐛 Common Errors & Solutions

| Error Message | Solution |
|--------------|----------|
| "relation 'store_pages' does not exist" | Run `fix-store-pages-table.sql` |
| "column does not exist" | Run `fix-theme-color-columns.sql` |
| "permission denied" | RLS policies issue - run Step 1 again |
| Theme colors revert after save | Run `fix-theme-color-columns.sql` |
| "Failed to load pages" still shows | Hard refresh browser (Ctrl+Shift+R) |

---

## 📝 What Each File Does

1. **`fix-store-pages-table.sql`**
   - Creates store_pages table
   - Sets up RLS (Row Level Security) policies
   - Adds indexes and triggers
   - Allows store owners to manage pages

2. **`fix-theme-color-columns.sql`**
   - Adds 5 color columns to stores table
   - Sets default color values
   - Creates index for faster loading
   - Includes verification query

---

## ✨ After Successful Fix

You should be able to:
- ✅ View the "Pages" tab without errors
- ✅ Create custom pages (About, Contact, etc.)
- ✅ Save theme colors and see them persist
- ✅ Edit all 5 text color options
- ✅ See accurate color previews

---

## 🆘 Still Need Help?

1. Open browser console (F12)
2. Take a screenshot of any errors
3. Check Supabase logs for API errors
4. Verify you're logged in as the store owner

**Most common issue**: Running SQL in wrong Supabase project
- Make sure you're in the correct project dashboard
- Check project URL matches your app's Supabase URL
