import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from './ImageUpload';
import { Plus, Trash2, Edit, GripVertical, Image, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link: string | null;
  button_text: string | null;
  position: number;
  is_active: boolean;
}

interface StoreBannerManagerProps {
  storeId: string;
}

export function StoreBannerManager({ storeId }: StoreBannerManagerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link: '',
    button_text: '',
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBanners();
  }, [storeId]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('store_banners')
        .select('*')
        .eq('store_id', storeId)
        .order('position', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.image_url) {
      toast({ title: 'Error', description: 'Please upload an image.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('store_banners')
          .update({
            title: form.title || null,
            subtitle: form.subtitle || null,
            image_url: form.image_url,
            link: form.link || null,
            button_text: form.button_text || null,
            is_active: form.is_active,
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast({ title: 'Banner updated' });
      } else {
        const { error } = await supabase
          .from('store_banners')
          .insert({
            store_id: storeId,
            title: form.title || null,
            subtitle: form.subtitle || null,
            image_url: form.image_url,
            link: form.link || null,
            button_text: form.button_text || null,
            is_active: form.is_active,
            position: banners.length,
          });

        if (error) throw error;
        toast({ title: 'Banner added' });
      }

      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({ title: 'Error', description: 'Failed to save banner.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('store_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBanners(banners.filter(b => b.id !== id));
      toast({ title: 'Banner deleted' });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({ title: 'Error', description: 'Failed to delete banner.', variant: 'destructive' });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link: banner.link || '',
      button_text: banner.button_text || '',
      is_active: banner.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      image_url: '',
      link: '',
      button_text: '',
      is_active: true,
    });
    setEditingBanner(null);
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('store_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      setBanners(banners.map(b => 
        b.id === banner.id ? { ...b, is_active: !b.is_active } : b
      ));
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Hero Banners / Slides
            </CardTitle>
            <CardDescription>
              Create slideshow banners for your storefront
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <ImageUpload
                  label="Banner Image *"
                  onUpload={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                  currentUrl={form.image_url || null}
                  folder="banners"
                  aspectRatio="banner"
                />
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Summer Sale"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    placeholder="Up to 50% off on selected items"
                    value={form.subtitle}
                    onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      placeholder="Shop Now"
                      value={form.button_text}
                      onChange={(e) => setForm(prev => ({ ...prev, button_text: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link</Label>
                    <Input
                      placeholder="/collections/sale"
                      value={form.link}
                      onChange={(e) => setForm(prev => ({ ...prev, link: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="w-full">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingBanner ? 'Update Banner' : 'Add Banner'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {banners.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No banners yet. Add your first banner!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center gap-4 p-4 bg-secondary rounded-lg"
              >
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                <div className="w-24 h-16 rounded-md overflow-hidden bg-muted">
                  <img
                    src={banner.image_url}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{banner.title || 'Untitled'}</h4>
                  <p className="text-sm text-muted-foreground truncate">{banner.subtitle || 'No subtitle'}</p>
                </div>
                <Switch
                  checked={banner.is_active}
                  onCheckedChange={() => toggleActive(banner)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
