/**
 * Storage Utility Functions
 * Helper functions for interacting with Supabase Storage and Vercel APIs
 */

import { supabase } from '@/integrations/supabase/client';

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  useServerUpload?: boolean;
  onProgress?: (progress: number) => void;
}

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata?: Record<string, any>;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<{ url: string; path: string } | null> {
  const {
    bucket = 'store-assets',
    folder = 'uploads',
    useServerUpload = false,
  } = options;

  try {
    if (useServerUpload) {
      // Use Vercel API
      const base64 = await fileToBase64(file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64,
          bucket,
          folder,
        }),
      });

      if (!response.ok) {
        throw new Error('Server upload failed');
      }

      const data = await response.json();
      return { url: data.url, path: data.path };
    } else {
      // Direct Supabase upload
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${getFileExtension(file.name)}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl, path: data.path };
    }
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket, path }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

/**
 * List files in a bucket folder
 */
export async function listFiles(
  bucket: string,
  folder: string
): Promise<StorageFile[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('List files error:', error);
    throw error;
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(
  bucket: string,
  path: string
): string | null {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Get URL error:', error);
    return null;
  }
}

/**
 * Convert File to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext || 'bin';
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/'] } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large (max ${maxSize / 1024 / 1024}MB)`,
    };
  }

  const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
  if (!isAllowed) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Get storage bucket info
 */
export async function getBucketInfo(
  bucket: string
): Promise<{ name: string; public: boolean; created_at: string } | null> {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) throw error;

    const bucketInfo = data?.find(b => b.name === bucket);
    return bucketInfo || null;
  } catch (error) {
    console.error('Get bucket info error:', error);
    return null;
  }
}

/**
 * Calculate total storage used in a bucket
 */
export async function calculateStorageUsed(
  bucket: string,
  folder: string = ''
): Promise<number> {
  try {
    const files = await listFiles(bucket, folder);
    return files.reduce((total, file) => {
      return total + (file.metadata?.size || 0);
    }, 0);
  } catch (error) {
    console.error('Calculate storage error:', error);
    return 0;
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
