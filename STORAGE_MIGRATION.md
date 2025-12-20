# Cloud Storage Migration: Loveble → Supabase + Vercel

## Overview
Your DropStore application is being migrated from Loveble cloud storage to a fully self-hosted solution using:
- **Supabase Storage** for file hosting
- **Vercel** for serverless APIs and deployment
- **PostgreSQL (Supabase)** for database

## Current Status ✅

### Already Configured
- ✅ Supabase Storage client initialized
- ✅ Image upload component using `supabase.storage`
- ✅ Environment variables set in `.env`
- ✅ Vercel deployment configuration

## Step-by-Step Migration

### 1. Supabase Storage Setup

#### Create Buckets
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `xyqoyfhxslauiwkuopve`
3. Navigate to **Storage** → **Buckets**
4. Create these buckets:
   - `store-assets` (for product images, logos)
   - `user-uploads` (for user-generated content)
   - `temp-files` (for temporary uploads)

#### Set Bucket Policies
```sql
-- For store-assets bucket (public read)
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'store-assets');

CREATE POLICY "Authenticated Upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Own File Delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'store-assets' AND 
  owner = auth.uid()
);
```

### 2. Vercel Deployment Setup

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Link Project to Vercel
```bash
vercel link
# Follow prompts to connect your GitHub repo
```

#### Add Environment Variables to Vercel
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Or in Vercel Dashboard:
1. Go to your project settings
2. Environment Variables
3. Add:
   - `VITE_SUPABASE_URL` = `https://xyqoyfhxslauiwkuopve.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = Your anon key from `.env`
   - `SUPABASE_SERVICE_ROLE_KEY` = From Supabase project settings

### 3. API Routes Structure

Create API handlers in `/api` directory:

```
api/
├── upload.ts          # File upload handler
├── delete.ts          # File deletion handler
└── optimize.ts        # Image optimization
```

#### File Upload API (`api/upload.ts`)
```typescript
// Already created - handles both direct and optimized uploads
```

### 4. Update Image Upload Component

Use the enhanced `ImageUploadEnhanced.tsx` component that supports:
- Direct Supabase uploads (client-side)
- Server-side uploads via Vercel API
- Automatic image optimization
- Error handling and retry logic

**Usage:**
```tsx
import { ImageUploadEnhanced } from '@/components/store/ImageUploadEnhanced';

<ImageUploadEnhanced
  label="Product Image"
  onUpload={(url) => setImageUrl(url)}
  bucket="store-assets"
  folder="products"
  useServerUpload={true}  // Use Vercel API
/>
```

### 5. Database Updates

Create tables for tracking uploads:

```sql
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  bucket_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_user_uploads ON file_uploads(user_id);
CREATE INDEX idx_bucket_uploads ON file_uploads(bucket_id);
```

### 6. Migration Checklist

- [ ] Create Supabase Storage buckets
- [ ] Set bucket policies in Supabase
- [ ] Connect project to Vercel
- [ ] Add environment variables to Vercel
- [ ] Deploy API routes
- [ ] Test file uploads locally: `npm run dev`
- [ ] Test file uploads on Vercel preview deployment
- [ ] Migrate existing images from Loveble
- [ ] Update all image URLs in database
- [ ] Deploy to production
- [ ] Monitor storage usage in Supabase

### 7. Migrate Existing Images

Create a migration script:

```typescript
// scripts/migrate-images.ts
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrateImages() {
  // 1. Fetch all products with Loveble URLs
  const { data: products } = await supabase
    .from('products')
    .select('id, images')
    .filter('images', 'ilike', '%loveble%');

  // 2. For each image URL:
  for (const product of products) {
    for (const imageUrl of product.images) {
      // 3. Download image from Loveble
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();

      // 4. Upload to Supabase Storage
      const { data } = await supabase.storage
        .from('store-assets')
        .upload(`migrated/${Date.now()}.jpg`, buffer);

      // 5. Get public URL
      const { data: urlData } = supabase.storage
        .from('store-assets')
        .getPublicUrl(data.path);

      // 6. Update product in database
      await supabase
        .from('products')
        .update({
          images: product.images.map(url =>
            url === imageUrl ? urlData.publicUrl : url
          ),
        })
        .eq('id', product.id);
    }
  }
}

migrateImages().then(() => console.log('Migration complete!'));
```

Run migration:
```bash
npx ts-node scripts/migrate-images.ts
```

### 8. Verify Configuration

**Check Supabase Storage:**
```typescript
const { data, error } = await supabase.storage
  .from('store-assets')
  .list('products');

console.log('Files in store-assets:', data);
```

**Test Vercel API:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"file":"base64data","bucket":"store-assets"}'
```

## Environment Variables Reference

### `.env` (Client-side)
```env
VITE_SUPABASE_URL=https://xyqoyfhxslauiwkuopve.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel Environment (Server-side)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://xyqoyfhxslauiwkuopve.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Storage Pricing (Supabase)

- **Free Tier**: 1 GB storage included
- **Pro Plan**: $25/month + $5 per 100 GB
- **Enterprise**: Custom pricing

## Monitoring

### Check Storage Usage
```typescript
const { data } = await supabase.storage.listBuckets();
console.log('Storage buckets:', data);
```

### Set Up Alerts
In Supabase Dashboard → Storage → Settings:
- Set storage quotas
- Enable email notifications

## Troubleshooting

### Issue: 403 Forbidden Error
**Solution**: Check bucket policies in Supabase RLS settings

### Issue: Files Not Accessible
**Solution**: Verify bucket is set to "Public" in Storage settings

### Issue: Upload Timeout
**Solution**: Increase timeout in vercel.json:
```json
{
  "functions": {
    "api/**": {
      "maxDuration": 60
    }
  }
}
```

## Next Steps

1. ✅ **Phase 1**: Set up Supabase Storage buckets
2. ✅ **Phase 2**: Configure Vercel API routes
3. ⏳ **Phase 3**: Test uploads locally
4. ⏳ **Phase 4**: Deploy to Vercel preview
5. ⏳ **Phase 5**: Migrate existing images
6. ⏳ **Phase 6**: Production deployment

## Support

- Supabase Docs: https://supabase.com/docs/guides/storage
- Vercel Docs: https://vercel.com/docs/serverless-functions
- Supabase Community: https://discord.supabase.io
