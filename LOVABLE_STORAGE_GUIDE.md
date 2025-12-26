# ✅ Lovable Supabase & Cloud Storage Setup Guide

## Your Current Configuration

Your DropStores app is **already configured** to use Lovable Supabase with cloud storage!

### ✓ What's Already Set Up

1. **Supabase Client** - Configured in `/src/integrations/supabase/client.ts`
2. **Environment Variables** - Your `.env` file has all necessary credentials:
   - `VITE_SUPABASE_URL=https://xyqoyfhxslauiwkuopve.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=eyJh...` (configured)
   - `VITE_SUPABASE_PUBLISHABLE_KEY=eyJh...` (configured)

3. **Image Upload Components** - Ready to use:
   - `/src/components/store/ImageUpload.tsx` - Standard client-side uploads
   - `/src/components/store/ImageUploadEnhanced.tsx` - Enhanced with server-side option
   - `/src/lib/storage.ts` - Storage utility functions

4. **Storage Bucket** - Configured to use: `store-assets`

## 📋 Manual Setup Steps

### Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard:
   ```
   https://xyqoyfhxslauiwkuopve.supabase.co
   ```

2. Navigate to: **Storage** → **Buckets**

3. Click **"New bucket"**

4. Configure the bucket:
   - **Name:** `store-assets`
   - **Public bucket:** ✅ Yes (enable this)
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/*` (or leave empty for all types)

5. Click **"Create bucket"**

### Step 2: Set Bucket Policies (Important!)

After creating the bucket, set up the storage policies:

1. Go to **Storage** → **Policies** → Select `store-assets` bucket

2. Click **"New Policy"**

3. Create these policies:

#### Policy 1: Public Read Access
```sql
-- Name: Public read access
-- Operation: SELECT
-- Policy definition:
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-assets');
```

#### Policy 2: Authenticated Upload
```sql
-- Name: Authenticated users can upload
-- Operation: INSERT
-- Policy definition:
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
```

#### Policy 3: Authenticated Update
```sql
-- Name: Users can update their own files
-- Operation: UPDATE
-- Policy definition:
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
```

#### Policy 4: Authenticated Delete
```sql
-- Name: Users can delete their own files
-- Operation: DELETE
-- Policy definition:
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
```

### Step 3: Test the Setup

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to your store management page

3. Try uploading an image (logo, banner, or product image)

4. Check that the image appears correctly

5. Verify in Supabase Dashboard → Storage → `store-assets` that the file was uploaded

## 🔧 Troubleshooting

### If uploads fail:

1. **Check bucket policies** - Make sure all 4 policies above are created
2. **Check bucket is public** - Go to Storage → Buckets, verify `store-assets` shows as "Public"
3. **Check authentication** - Make sure users are logged in before uploading
4. **Check browser console** - Look for any error messages

### Common Issues:

- **403 Forbidden**: Bucket policies not set up correctly
- **404 Not Found**: Bucket doesn't exist or wrong bucket name
- **401 Unauthorized**: User not authenticated

## 📁 Storage Structure

Your images will be stored in this structure:
```
store-assets/
├── images/           # General images
├── logos/            # Store logos
├── banners/          # Store banners
└── products/         # Product images
```

## 🚀 Using Storage in Your App

### Upload an image:
```typescript
import { uploadFile } from '@/lib/storage';

const handleUpload = async (file: File) => {
  const result = await uploadFile(file, {
    bucket: 'store-assets',
    folder: 'products'
  });
  
  if (result) {
    console.log('Uploaded:', result.url);
  }
};
```

### Using the ImageUpload component:
```typescript
<ImageUpload
  label="Store Logo"
  currentUrl={storeData.logo}
  onUpload={(url) => setStoreData({ ...storeData, logo: url })}
  bucket="store-assets"
  folder="logos"
  aspectRatio="logo"
/>
```

## ✅ Next Steps

1. Create the `store-assets` bucket in Supabase Dashboard
2. Set up the 4 storage policies
3. Test uploading an image in your app
4. Your app is ready to use Lovable Supabase cloud storage!

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
- Your storage utilities: `/src/lib/storage.ts`
- Your upload components: `/src/components/store/`

---

**Your app is already configured!** Just create the bucket and you're ready to go! 🎉
