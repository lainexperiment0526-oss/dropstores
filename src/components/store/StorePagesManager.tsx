import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Plus, Edit, Trash2, Link as LinkIcon, Loader2, Copy } from 'lucide-react';

interface StorePagesManagerProps {
  storeId: string;
  storeSlug: string;
}

interface StorePage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  is_published: boolean;
  created_at?: string;
}

export function StorePagesManager({ storeId, storeSlug }: StorePagesManagerProps) {
  const [pages, setPages] = useState<StorePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StorePage | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    is_published: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, [storeId]);

  const fetchPages = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('store_pages')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading pages:', error);
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          toast({ 
            title: 'Database Setup Required', 
            description: 'The store_pages table needs to be created. Please run the migration SQL in your Supabase dashboard.', 
            variant: 'destructive' 
          });
        } else if (error.message?.includes('permission') || error.message?.includes('denied')) {
          toast({ 
            title: 'Permission Error', 
            description: 'Unable to access store pages. Please check database permissions.', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Error', 
            description: `Failed to load pages: ${error.message}`, 
            variant: 'destructive' 
          });
        }
        throw error;
      }
      setPages((data as StorePage[]) || []);
    } catch (error) {
      console.error('Error loading pages', error);
      // Already showed specific toast above
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: '', slug: '', content: '', is_published: true });
    setEditing(null);
  };

  const slugFromTitle = useMemo(() => {
    if (!form.title) return '';
    return form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, [form.title]);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title required', description: 'Please add a page title.', variant: 'destructive' });
      return;
    }

    const slug = (form.slug || slugFromTitle || form.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!slug) {
      toast({ title: 'Slug required', description: 'Please enter a valid slug.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const { error } = await (supabase as any)
          .from('store_pages')
          .update({
            title: form.title.trim(),
            slug,
            content: form.content,
            is_published: form.is_published,
          })
          .eq('id', editing.id);

        if (error) throw error;
        toast({ title: 'Page updated' });
      } else {
        const { error } = await (supabase as any)
          .from('store_pages')
          .insert({
            store_id: storeId,
            title: form.title.trim(),
            slug,
            content: form.content,
            is_published: form.is_published,
          });

        if (error) throw error;
        toast({ title: 'Page created' });
      }

      setDialogOpen(false);
      resetForm();
      fetchPages();
    } catch (error) {
      console.error('Error saving page', error);
      const isDuplicate = error?.code === '23505';
      toast({
        title: isDuplicate ? 'Slug already exists' : 'Error',
        description: isDuplicate
          ? 'Choose a different slug or edit the existing page.'
          : 'Failed to save page. Please retry.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (page: StorePage) => {
    setEditing(page);
    setForm({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      is_published: page.is_published,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await (supabase as any).from('store_pages').delete().eq('id', id);
      if (error) throw error;
      setPages((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Page deleted' });
    } catch (error) {
      console.error('Error deleting page', error);
      toast({ title: 'Error', description: 'Failed to delete page', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async (page: StorePage) => {
    const url = `${window.location.origin}/shop/${storeSlug}/page/${page.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: url });
    } catch (error) {
      console.error('Clipboard error', error);
      toast({ title: 'Error', description: 'Could not copy link', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Custom Pages
            </CardTitle>
            <CardDescription>Create standalone pages (e.g., About, FAQ) and link them from your navigation.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Page' : 'Add Page'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="About Us"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={form.slug || slugFromTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="about-us"
                  />
                  <p className="text-xs text-muted-foreground">URL: /shop/{storeSlug}/page/{form.slug || slugFromTitle || 'your-slug'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    rows={8}
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your page content here..."
                  />
                  <p className="text-xs text-muted-foreground">Supports plain text. Line breaks are preserved on the public page.</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_published}
                      onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_published: checked }))}
                    />
                    <span className="text-sm">Published</span>
                  </div>
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editing ? 'Update Page' : 'Create Page'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No pages yet.</p>
            <p className="text-sm text-muted-foreground">Create an About, FAQ, or policy page.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <div key={page.id} className="p-4 bg-secondary rounded-lg flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold leading-tight">{page.title}</h4>
                    {!page.is_published && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">Draft</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">/shop/{storeSlug}/page/{page.slug}</p>
                  {page.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{page.content}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => copyLink(page)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
