import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  bucket?: string;
  folder?: string;
  aspectRatio?: 'square' | 'banner' | 'logo';
}

export function ImageUpload({
  label,
  currentUrl,
  onUpload,
  onRemove,
  bucket = 'store-assets',
  folder = 'images',
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const aspectClasses = {
    square: 'aspect-square',
    banner: 'aspect-[3/1]',
    logo: 'aspect-square w-24 h-24',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onUpload(urlData.publicUrl);
      setPreview(urlData.publicUrl);

      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      setPreview(currentUrl || null);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        <div
          className={`relative bg-muted rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border ${aspectClasses[aspectRatio]} ${aspectRatio !== 'logo' ? 'w-full max-w-xs' : ''}`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt={label}
                className="w-full h-full object-cover"
              />
              {onRemove && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6"
                  onClick={handleRemove}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
              <ImageIcon className="w-8 h-8 mb-2" />
              <span className="text-xs text-center">No image</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`upload-${label.replace(/\s/g, '-')}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
