#!/usr/bin/env ts-node
/**
 * Migration Script: Migrate images from Loveble to Supabase Storage
 * 
 * Usage: npx ts-node scripts/migrate-images.ts
 * 
 * This script:
 * 1. Finds all products with Loveble image URLs
 * 2. Downloads images from Loveble
 * 3. Uploads them to Supabase Storage
 * 4. Updates database with new URLs
 * 5. Logs migration progress
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MigrationLog {
  timestamp: string;
  status: 'success' | 'error' | 'skipped';
  productId: string;
  oldUrl: string;
  newUrl?: string;
  error?: string;
}

const migrationLogs: MigrationLog[] = [];

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error);
    return null;
  }
}

async function uploadToSupabase(
  buffer: Buffer,
  bucket: string,
  folder: string
): Promise<string | null> {
  try {
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload to Supabase:', error);
    return null;
  }
}

async function migrateProductImages() {
  console.log('🚀 Starting image migration from Loveble to Supabase...\n');

  try {
    // Fetch all products with Loveble URLs
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, images, store_id');

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      console.log('No products found to migrate');
      return;
    }

    console.log(`Found ${products.length} products. Migrating images...\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const product of products) {
      if (!product.images || product.images.length === 0) {
        skipCount++;
        continue;
      }

      const images = Array.isArray(product.images) ? product.images : [product.images];
      const migratedImages: string[] = [];

      for (const imageUrl of images) {
        if (!imageUrl) {
          migratedImages.push(imageUrl);
          continue;
        }

        // Check if already migrated (Supabase URL)
        if (imageUrl.includes('supabase.co') || !imageUrl.includes('loveble')) {
          migratedImages.push(imageUrl);
          skipCount++;
          console.log(`⏭️  Skipped (already migrated): ${product.id}`);
          continue;
        }

        try {
          console.log(`⬇️  Downloading: ${imageUrl.substring(0, 50)}...`);
          const buffer = await downloadImage(imageUrl);

          if (!buffer) {
            throw new Error('Failed to download image');
          }

          console.log(`⬆️  Uploading to Supabase...`);
          const newUrl = await uploadToSupabase(
            buffer,
            'store-assets',
            `products/${product.store_id || 'unknown'}`
          );

          if (!newUrl) {
            throw new Error('Failed to upload to Supabase');
          }

          migratedImages.push(newUrl);
          successCount++;

          migrationLogs.push({
            timestamp: new Date().toISOString(),
            status: 'success',
            productId: product.id,
            oldUrl: imageUrl,
            newUrl,
          });

          console.log(`✅ Migrated: ${product.name} (${product.id})\n`);
        } catch (error) {
          errorCount++;
          migratedImages.push(imageUrl); // Keep old URL if migration fails
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';

          migrationLogs.push({
            timestamp: new Date().toISOString(),
            status: 'error',
            productId: product.id,
            oldUrl: imageUrl,
            error: errorMsg,
          });

          console.error(`❌ Error migrating ${product.id}: ${errorMsg}\n`);
        }
      }

      // Update product with new image URLs
      if (migratedImages.some(img => img.includes('supabase.co'))) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: migratedImages })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Failed to update product ${product.id}:`, updateError);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Skipped (already migrated): ${skipCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📦 Total: ${successCount + skipCount + errorCount}`);
    console.log('='.repeat(50) + '\n');

    // Save migration log
    const logPath = path.join(process.cwd(), 'migration-log.json');
    fs.writeFileSync(logPath, JSON.stringify(migrationLogs, null, 2));
    console.log(`📝 Migration log saved to: ${logPath}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateProductImages().then(() => {
  console.log('\n✨ Migration complete!');
  process.exit(0);
});
