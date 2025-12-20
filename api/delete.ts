import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Delete a file from Supabase Storage
 * POST /api/delete
 * 
 * Body:
 * {
 *   "bucket": "store-assets",
 *   "path": "products/123-abc.jpg"
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bucket, path } = req.body;

    if (!bucket || !path) {
      return res.status(400).json({ error: 'Missing bucket or path' });
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    // Log deletion in database
    const { error: logError } = await supabase
      .from('file_uploads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('file_path', path)
      .eq('bucket_id', bucket);

    if (logError) {
      console.warn('Failed to log deletion:', logError);
    }

    return res.status(200).json({
      success: true,
      message: `File deleted: ${path}`,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      error: 'Delete failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
