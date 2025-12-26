# Storage Setup Guide - Step by Step

## ✅ Quick Setup (5 minutes)

### Step 1: Run SQL Script

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project: `kvqfnmdkxaclsnyuzkyp`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `setup-storage-bucket.sql`
6. Click **Run** or press `Ctrl+Enter`

✅ You should see: `SELECT 1` - Bucket created!

---

### Step 2: Set Up Storage Policies (Dashboard Method)

1. Click **Storage** in the left sidebar
2. You should see `store-assets` bucket
3. Click on the **store-assets** bucket
4. Click the **Policies** tab at the top

#### Create Policy 1: Public Read Access

1. Click **New Policy**
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Public read access`
   - **Allowed operation**: `SELECT` ✅
   - **Target roles**: `public`
   - **USING expression**: 
     ```sql
     bucket_id = 'store-assets'
     ```
4. Click **Review** → **Save policy**

#### Create Policy 2: Authenticated Upload

1. Click **New Policy** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated upload`
   - **Allowed operation**: `INSERT` ✅
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**: 
     ```sql
     bucket_id = 'store-assets'
     ```
4. Click **Review** → **Save policy**

#### Create Policy 3: Authenticated Update (Optional)

1. Click **New Policy**
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated update`
   - **Allowed operation**: `UPDATE` ✅
   - **Target roles**: `authenticated`
   - **USING expression**: 
     ```sql
     bucket_id = 'store-assets'
     ```
4. Click **Review** → **Save policy**

#### Create Policy 4: Authenticated Delete (Optional)

1. Click **New Policy**
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated delete`
   - **Allowed operation**: `DELETE` ✅
   - **Target roles**: `authenticated`
   - **USING expression**: 
     ```sql
     bucket_id = 'store-assets'
     ```
4. Click **Review** → **Save policy**

---

### Step 3: Verify Setup

1. Go back to **Storage** → **store-assets**
2. Check:
   - ✅ Bucket is marked as **Public**
   - ✅ You see 4 policies in the Policies tab
   - ✅ File size limit: 5 MB
   - ✅ Allowed MIME types include images

---

### Step 4: Test Upload

1. Start your dev server:
   ```powershell
   npm run dev
   ```

2. Open the app in your browser

3. Log in and go to **Store Management**

4. Try uploading a product image or logo

5. ✅ **Success**: Image uploads and displays
6. ❌ **Failed**: Check browser console (F12) for errors

---

## 🔧 Alternative: Use Policy Templates (Easier)

If the manual policy creation is confusing, use templates:

### For Public Read:
1. New Policy → **"Get started quickly"**
2. Select template: **"Allow public read access"**
3. Click **Use this template** → **Save**

### For Authenticated Upload:
1. New Policy → **"Get started quickly"**
2. Select template: **"Allow authenticated uploads"**
3. Click **Use this template** → **Save**

---

## 🐛 Troubleshooting

### Error: "Bucket not found"
- Run the SQL script again
- Check Storage dashboard for `store-assets` bucket
- Bucket name must be exactly: `store-assets`

### Error: "Permission denied"
- Make sure you created all 4 policies
- Check that policies target correct roles (public/authenticated)
- Verify bucket is set to **Public**

### Upload still not working?
- Clear browser cache and cookies
- Check if user is logged in (authenticated)
- Verify file is under 5MB
- Check file type is an image
- Open browser console (F12) for detailed errors

### Images not displaying?
- Check the URL format in the database
- Should look like: `https://kvqfnmdkxaclsnyuzkyp.supabase.co/storage/v1/object/public/store-assets/...`
- Verify bucket is set to **Public**

---

## 📊 Current Status

Your Supabase project:
- **Project ID**: `kvqfnmdkxaclsnyuzkyp`
- **Storage URL**: `https://kvqfnmdkxaclsnyuzkyp.supabase.co/storage/v1/s3`
- **Required Bucket**: `store-assets`

---

## ✨ After Setup

Once storage is configured:
- ✅ Images upload to Supabase Storage
- ✅ Public URLs are generated automatically
- ✅ Images are permanently stored
- ✅ No more "temporary storage" warnings
- ✅ Fast CDN delivery
- ✅ 5MB file size limit enforced

---

## 🎯 Summary

1. Run SQL script → Creates bucket
2. Add 4 policies → Enables access
3. Test upload → Verify it works
4. Done! 🎉

**Estimated time**: 5-10 minutes

Need help? Check the browser console for error messages!
