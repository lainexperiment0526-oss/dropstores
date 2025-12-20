# Cloud Storage Migration: Loveble → Supabase + Vercel

## 🎯 Overview

Your DropStore application has been configured to use **Supabase Storage** (instead of Loveble) with **Vercel** for serverless APIs and backend functions.

## ✅ What's Ready

### Core Files Created
1. **API Routes** (Vercel Functions)
   - `api/upload.ts` - Server-side file uploads
   - `api/delete.ts` - File deletion 
   - `api/image.ts` - Image optimization

2. **Enhanced Components**
   - `src/components/store/ImageUploadEnhanced.tsx` - Flexible upload component
   - Can use client-side or server-side uploads

3. **Utility Library**
   - `src/lib/storage.ts` - Helper functions for storage operations
   - Upload, delete, list, validate files

4. **Migration Tools**
   - `scripts/migrate-images.ts` - Auto-migrate from Loveble
   - Progress tracking and error logging

5. **Documentation**
   - `STORAGE_MIGRATION.md` - Complete migration guide
   - `STORAGE_SETUP.md` - Quick start guide

## 🚀 Quick Start (5 minutes)

### 1. Create Storage Bucket in Supabase
```
Dashboard → Storage → Create Bucket
Name: store-assets
Set to: Public
```

### 2. Deploy to Vercel
```bash
# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel
```

### 3. Test Locally
```bash
npm run dev
# Upload a test image
# Check Supabase Dashboard for the file
```

## 📊 File Structure

```
dropstores/
├── api/
│   ├── upload.ts          ← Server-side uploads
│   ├── delete.ts          ← File deletion
│   └── image.ts           ← Image optimization
│
├── scripts/
│   └── migrate-images.ts  ← Loveble → Supabase migration
│
├── src/
│   ├── components/store/
│   │   ├── ImageUpload.tsx ← Original (client-side)
│   │   └── ImageUploadEnhanced.tsx ← New (flexible)
│   │
│   └── lib/
│       └── storage.ts      ← Storage utilities
│
├── STORAGE_MIGRATION.md
└── STORAGE_SETUP.md
```

## 🔧 Configuration

### Environment Variables

**Local Development (.env)**
```env
VITE_SUPABASE_URL=https://xyqoyfhxslauiwkuopve.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (from .env)
```

**Vercel Production**
- Add via Dashboard or CLI
- `SUPABASE_SERVICE_ROLE_KEY` needed for server functions

### Supabase Storage Bucket Setup

```sql
-- Public read access
CREATE POLICY "Public Read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'store-assets');

-- Authenticated upload
CREATE POLICY "Authenticated Upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets' AND 
  auth.role() = 'authenticated'
);

-- User owns their files
CREATE POLICY "User Delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'store-assets' AND 
  owner = auth.uid()
);
```

## 💻 Usage Examples

### Basic Upload (Client-Side)
```tsx
import { uploadFile } from '@/lib/storage';

const handleUpload = async (file: File) => {
  try {
    const result = await uploadFile(file, {
      bucket: 'store-assets',
      folder: 'products/123'
    });
    console.log('Uploaded:', result.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Upload via Vercel API
```tsx
import { ImageUploadEnhanced } from '@/components/store/ImageUploadEnhanced';

<ImageUploadEnhanced
  label="Product Image"
  onUpload={(url) => setImageUrl(url)}
  bucket="store-assets"
  folder="products"
  useServerUpload={true}  // Route through /api/upload
/>
```

### Delete File
```tsx
import { deleteFile } from '@/lib/storage';

await deleteFile('store-assets', 'products/123/image.jpg');
```

### List Files
```tsx
import { listFiles } from '@/lib/storage';

const files = await listFiles('store-assets', 'products/123');
console.log('Files:', files);
```

## 🔄 Migrate Existing Images

If you have images in Loveble that need to be migrated:

```bash
# Set environment variables
export VITE_SUPABASE_URL="https://xyqoyfhxslauiwkuopve.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"

# Run migration
npx ts-node scripts/migrate-images.ts

# Results saved to migration-log.json
```

## 📈 Storage Pricing

| Plan | Storage | Price |
|------|---------|-------|
| Free | 1 GB | Free |
| Pro | 5 GB + more | $25/month |

Your free tier includes 1 GB which is plenty for getting started.

## 🔐 Security

✅ **Built-in:**
- RLS (Row Level Security)
- API key management
- File type validation
- Size limits (5MB)
- Unique file naming

## 🐛 Troubleshooting

### "403 Forbidden" Error
→ Check RLS policies in Supabase Dashboard

### Images not loading
→ Verify bucket is set to "Public"

### Upload hangs
→ Check file size (5MB limit)

### Slow uploads
→ Use `useServerUpload={true}` for Vercel optimization

## 📚 Documentation

- [Full Migration Guide](./STORAGE_MIGRATION.md) - Detailed walkthrough
- [Setup Guide](./STORAGE_SETUP.md) - Quick reference
- [Supabase Docs](https://supabase.com/docs/guides/storage)
- [Vercel Docs](https://vercel.com/docs/serverless-functions)

## ✨ Next Steps

1. ✅ Create `store-assets` bucket
2. ✅ Set RLS policies
3. ✅ Add environment variables to Vercel
4. ✅ Deploy with `vercel`
5. ✅ Test file uploads
6. ✅ (Optional) Run migration script

## 📞 Support

- Issues? Check [STORAGE_MIGRATION.md](./STORAGE_MIGRATION.md#troubleshooting)
- Need help? [Supabase Discord](https://discord.supabase.io)
- Found a bug? Report in Supabase GitHub

---

**Status**: ✅ Ready for deployment
**Last Updated**: December 20, 2025
