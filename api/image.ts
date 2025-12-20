import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Image optimization and caching
 * This endpoint can be used with Next.js Image component
 * 
 * Usage:
 * GET /api/image?url=<image-url>&w=<width>&q=<quality>
 * 
 * Parameters:
 * - url: The image URL from Supabase Storage
 * - w: Width in pixels (default: 800)
 * - q: Quality 1-100 (default: 75)
 * - f: Format: webp, jpeg, png (default: webp)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url, w = 800, q = 75, f = 'webp' } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url parameter' });
  }

  try {
    // For now, redirect to the original image
    // In production, use a service like Cloudinary or imgproxy
    
    // Set cache headers for optimal performance
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', 'image/webp');

    // Redirect to original URL (implement image optimization service as needed)
    return res.redirect(301, url);
  } catch (error) {
    console.error('Image optimization error:', error);
    return res.status(500).json({
      error: 'Image optimization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
