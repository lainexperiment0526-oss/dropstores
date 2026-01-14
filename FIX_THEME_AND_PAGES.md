# Fix Theme Customizer & Store Pages Errors

## Problems Identified

1. **"Failed to load pages" Error**: The `store_pages` table likely doesn't exist or has incorrect RLS policies
2. **Theme Colors Not Saving**: Theme color columns might be missing from the stores table

## Solution

### Step 1: Run the Database Migration

Go to your **Supabase Dashboard** → **SQL Editor** and run the SQL file: `fix-store-pages-table.sql`

This will:
- Create the `store_pages` table if it doesn't exist
- Set up proper Row Level Security (RLS) policies
- Add necessary indexes
- Create triggers for auto-updating timestamps

### Step 2: Verify Theme Color Columns

Run this SQL to check if theme color columns exist:

```sql
-- Check if theme color columns exist
SELECT column_name 
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

If any columns are missing, run this SQL:

```sql
-- Add theme color columns if they don't exist
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS heading_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS body_text_color VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS hero_title_text_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_subtitle_text_color VARCHAR(7) DEFAULT '#E5E7EB',
ADD COLUMN IF NOT EXISTS announcement_bar_text_color VARCHAR(7) DEFAULT '#FFFFFF';
```

### Step 3: Refresh the Application

After running the SQL:
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check the browser console for any errors
3. Try saving theme colors again

## Why This Happens

- The `store_pages` table might not have been created during initial setup
- RLS policies may be blocking access to the table
- Theme color columns may be missing from older database schemas

## Testing

After applying the fix:

1. **Test Pages**: Go to Store Management → Pages tab. The error should be gone.
2. **Test Theme Colors**: 
   - Go to Store Management → Theme tab
   - Change the heading text color
   - Click "Save Theme"
   - Refresh the page
   - The color should persist

## Browser Console Debugging

If errors persist, check the browser console (F12) for:
- Supabase API errors
- Network errors (failed requests)
- JavaScript errors

Look for error messages containing:
- "store_pages"
- "Failed to load"
- "permission denied"
- "relation does not exist"

## Common Issues

### "relation 'store_pages' does not exist"
→ Run `fix-store-pages-table.sql` in Supabase SQL Editor

### "permission denied for table store_pages"
→ The RLS policies in the SQL file will fix this

### Theme colors revert after save
→ Check if color columns exist in stores table (Step 2)

### Console shows "Failed to save theme settings"
→ Check browser console for detailed error message
