-- Storage Bucket Setup for DropStores
-- Run this in Supabase SQL Editor

-- Create storage bucket for store assets
-- Note: This creates the bucket in the storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Storage policies must be created through the Supabase Dashboard
-- Go to: Storage → store-assets → Policies

/*
IMPORTANT: Create these policies in the Supabase Dashboard:

1. Policy for Public Read Access:
   - Name: "Public Access for store-assets"
   - Operation: SELECT
   - Target roles: public
   - Policy definition: bucket_id = 'store-assets'

2. Policy for Authenticated Upload:
   - Name: "Authenticated users can upload"
   - Operation: INSERT
   - Target roles: authenticated
   - Policy definition: bucket_id = 'store-assets'

3. Policy for Authenticated Update (Optional):
   - Name: "Authenticated users can update"
   - Operation: UPDATE
   - Target roles: authenticated
   - Policy definition: bucket_id = 'store-assets'

4. Policy for Authenticated Delete (Optional):
   - Name: "Authenticated users can delete"
   - Operation: DELETE
   - Target roles: authenticated
   - Policy definition: bucket_id = 'store-assets'

OR use the simple policy builder:
   - For SELECT: Use template "Allow public read access"
   - For INSERT: Use template "Allow authenticated uploads"
   - For UPDATE/DELETE: Use template "Allow authenticated operations"
*/

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'store-assets';
