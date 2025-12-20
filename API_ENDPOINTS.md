# 📡 API Endpoints Reference

## Base URL
- **Local**: http://localhost:3000
- **Vercel Preview**: https://your-project.vercel.app
- **Vercel Production**: https://your-domain.com

## Endpoints

### 1. Upload File

**Endpoint**: `POST /api/upload`

**Description**: Upload file to Supabase Storage with base64 encoding

**Request**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file": "base64-encoded-file-data",
    "bucket": "store-assets",
    "folder": "products/123"
  }'
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | string | Yes | Base64-encoded file data |
| bucket | string | Yes | Storage bucket name (e.g., "store-assets") |
| folder | string | No | Folder path (e.g., "products/123") |

**Response** (200 OK):
```json
{
  "success": true,
  "url": "https://xyqoyfhxslauiwkuopve.supabase.co/storage/v1/object/public/store-assets/products/123/1234567-abc.jpg",
  "path": "products/123/1234567-abc.jpg"
}
```

**Error Response** (400/500):
```json
{
  "error": "Upload failed",
  "details": "File size exceeds limit"
}
```

**Example (JavaScript)**:
```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const reader = new FileReader();
reader.readAsDataURL(file);
reader.onload = async () => {
  const base64 = reader.result.split(',')[1];
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: base64,
      bucket: 'store-assets',
      folder: 'products/123'
    })
  });
  
  const data = await response.json();
  console.log('Image URL:', data.url);
};
```

---

### 2. Delete File

**Endpoint**: `POST /api/delete`

**Description**: Delete file from Supabase Storage

**Request**:
```bash
curl -X POST http://localhost:3000/api/delete \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "store-assets",
    "path": "products/123/1234567-abc.jpg"
  }'
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| bucket | string | Yes | Storage bucket name |
| path | string | Yes | Full file path in bucket |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "File deleted: products/123/1234567-abc.jpg"
}
```

**Error Response** (400/500):
```json
{
  "error": "Delete failed",
  "details": "File not found"
}
```

**Example (JavaScript)**:
```javascript
async function deleteFile(bucket, path) {
  const response = await fetch('/api/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, path })
  });
  
  const data = await response.json();
  return data.success;
}

// Usage
await deleteFile('store-assets', 'products/123/image.jpg');
```

---

### 3. Image Optimization

**Endpoint**: `GET /api/image`

**Description**: Optimize and cache images (redirects to optimized image)

**Request**:
```bash
curl "http://localhost:3000/api/image?url=<image-url>&w=800&q=75&f=webp"
```

**Parameters**:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| url | string | - | Original image URL (required) |
| w | number | 800 | Width in pixels |
| q | number | 75 | Quality (1-100) |
| f | string | webp | Format (webp, jpeg, png) |

**Response**:
- Redirects (301) to optimized image URL
- Sets `Cache-Control: public, max-age=31536000, immutable`

**Example**:
```javascript
// Generate optimized image URL
const originalUrl = 'https://xyqoyfhxslauiwkuopve.supabase.co/...';
const optimizedUrl = `/api/image?url=${encodeURIComponent(originalUrl)}&w=400&q=80`;

// Use in image tag
const img = document.createElement('img');
img.src = optimizedUrl;
```

---

## Storage Utilities

### JavaScript/TypeScript

**Import**:
```typescript
import { 
  uploadFile,
  deleteFile,
  listFiles,
  getPublicUrl,
  validateFile,
  fileToBase64,
  formatFileSize
} from '@/lib/storage';
```

**Upload**:
```typescript
const result = await uploadFile(file, {
  bucket: 'store-assets',
  folder: 'products/123',
  useServerUpload: true
});
console.log('URL:', result.url);
```

**Delete**:
```typescript
await deleteFile('store-assets', 'products/123/image.jpg');
```

**List Files**:
```typescript
const files = await listFiles('store-assets', 'products/123');
files.forEach(f => console.log(f.name));
```

**Get Public URL**:
```typescript
const url = getPublicUrl('store-assets', 'products/123/image.jpg');
```

**Validate File**:
```typescript
const result = validateFile(file, {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/']
});
if (!result.valid) {
  console.error(result.error);
}
```

---

## Components

### ImageUploadEnhanced

**Location**: `src/components/store/ImageUploadEnhanced.tsx`

**Props**:
```typescript
interface ImageUploadProps {
  label: string;                    // Input label
  currentUrl?: string | null;       // Initial image URL
  onUpload: (url: string) => void;  // Upload callback
  onRemove?: () => void;            // Remove callback
  bucket?: string;                  // Storage bucket
  folder?: string;                  // Storage folder
  aspectRatio?: 'square' | 'banner' | 'logo';
  useServerUpload?: boolean;        // Use Vercel API
}
```

**Usage**:
```tsx
import { ImageUploadEnhanced } from '@/components/store/ImageUploadEnhanced';

<ImageUploadEnhanced
  label="Product Image"
  onUpload={(url) => {
    console.log('Uploaded:', url);
    setProductImage(url);
  }}
  onRemove={() => setProductImage(null)}
  bucket="store-assets"
  folder="products"
  useServerUpload={true}
/>
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Missing or invalid parameters |
| 403 | Forbidden | No permission (check RLS policies) |
| 404 | Not Found | File/bucket doesn't exist |
| 413 | Payload Too Large | File exceeds size limit (5MB) |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

Currently no rate limiting is enforced. For production, implement:

```typescript
// Example rate limiting middleware
const rateLimit = {
  uploads: '100 per hour',
  deletes: '50 per hour',
  requests: '1000 per hour'
};
```

---

## Caching Strategy

**Supabase Storage**:
- Cache Control: 3600 seconds (1 hour)
- CDN: Cloudflare (automatic)
- Public buckets: Cached globally

**API Routes**:
- Cache Control: 31536000 seconds (1 year) for images
- Immutable flag for versioned assets

---

## Security Headers

All API responses include:
```
Access-Control-Allow-Origin: * (or configured)
Content-Type: application/json
Cache-Control: (configured per endpoint)
```

---

## Monitoring

### Logs Location
- **Vercel**: Dashboard → Deployments → Logs
- **Supabase**: Dashboard → Logs → Edge Functions
- **Local**: Browser console + terminal

### Metrics to Track
- Upload success rate
- Average upload time
- File size distribution
- Storage usage by bucket

---

## Testing

**Test Upload**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file": "iVBORw0KGgoAAAANS...",
    "bucket": "store-assets",
    "folder": "test"
  }'
```

**Test Delete**:
```bash
curl -X POST http://localhost:3000/api/delete \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "store-assets",
    "path": "test/image.jpg"
  }'
```

**Health Check**:
```bash
curl http://localhost:3000/api/image?url=https://example.com/image.jpg
```

---

## Common Patterns

### Upload with Progress
```typescript
const handleUpload = async (file: File) => {
  try {
    // Validate
    const { valid, error } = validateFile(file);
    if (!valid) throw new Error(error);
    
    // Upload
    const result = await uploadFile(file, {
      bucket: 'store-assets',
      folder: 'products'
    });
    
    // Use
    setImageUrl(result.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Batch Upload
```typescript
const uploadMultiple = async (files: File[]) => {
  const results = await Promise.all(
    files.map(f => uploadFile(f, { bucket: 'store-assets' }))
  );
  return results.map(r => r.url);
};
```

### Cleanup Old Files
```typescript
const deleteOldImages = async (bucket: string) => {
  const files = await listFiles(bucket, 'temp');
  for (const file of files) {
    await deleteFile(bucket, file.name);
  }
};
```

---

**Last Updated**: December 20, 2025  
**API Version**: 1.0  
**Status**: Production Ready
