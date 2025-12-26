import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit, GripVertical, Menu, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NavItem {
  id: string;
  title: string;
  link: string;
  position: number;
  is_visible: boolean;
  parent_id: string | null;
}

interface StoreNavigationManagerProps {
  storeId: string;
}

export function StoreNavigationManager({ storeId }: StoreNavigationManagerProps) {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [form, setForm] = useState({
    title: '',
    link: '',
    is_visible: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNavItems();
  }, [storeId]);

  const fetchNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('store_navigation')
        .select('*')
        .eq('store_id', storeId)
        .order('position', { ascending: true });

      if (error) throw error;
      setNavItems(data || []);
    } catch (error) {
      console.error('Error fetching navigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.link.trim()) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('store_navigation')
          .update({
            title: form.title.trim(),
            link: form.link.trim(),
            is_visible: form.is_visible,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: 'Navigation item updated' });
      } else {
        const { error } = await supabase
          .from('store_navigation')
          .insert({
            store_id: storeId,
            title: form.title.trim(),
            link: form.link.trim(),
            is_visible: form.is_visible,
            position: navItems.length,
          });

        if (error) throw error;
        toast({ title: 'Navigation item added' });
      }

      setDialogOpen(false);
      resetForm();
      fetchNavItems();
    } catch (error) {
      console.error('Error saving navigation:', error);
      toast({ title: 'Error', description: 'Failed to save navigation item.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('store_navigation')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNavItems(navItems.filter(item => item.id !== id));
      toast({ title: 'Navigation item deleted' });
    } catch (error) {
      console.error('Error deleting navigation:', error);
      toast({ title: 'Error', description: 'Failed to delete item.', variant: 'destructive' });
    }
  };

  const handleEdit = (item: NavItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      link: item.link,
      is_visible: item.is_visible,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setForm({
      title: '',
      link: '',
      is_visible: true,
    });
    setEditingItem(null);
  };

  const toggleVisible = async (item: NavItem) => {
    try {
      const { error } = await supabase
        .from('store_navigation')
        .update({ is_visible: !item.is_visible })
        .eq('id', item.id);

      if (error) throw error;
      setNavItems(navItems.map(n => 
        n.id === item.id ? { ...n, is_visible: !n.is_visible } : n
      ));
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const addDefaultNavItems = async () => {
    const defaults = [
      { title: 'Home', link: '/' },
      { title: 'Products', link: '#products' },
      { title: 'About', link: '#about' },
      { title: 'Contact', link: '#contact' },
    ];

    setSaving(true);
    try {
      for (let i = 0; i < defaults.length; i++) {
        await supabase.from('store_navigation').insert({
          store_id: storeId,
          title: defaults[i].title,
          link: defaults[i].link,
          position: i,
          is_visible: true,
        });
      }
      toast({ title: 'Default navigation added' });
      fetchNavItems();
    } catch (error) {
      console.error('Error adding defaults:', error);
      toast({ title: 'Error', description: 'Failed to add default navigation.', variant: 'destructive' });
    } finally {
      setSaving(false);
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
              <Menu className="w-5 h-5" />
              Navigation Menu
            </CardTitle>
            <CardDescription>
              Customize your store's navigation links
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {navItems.length === 0 && (
              <Button variant="outline" onClick={addDefaultNavItems} disabled={saving}>
                Add Defaults
              </Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Navigation Link' : 'Add Navigation Link'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      placeholder="Products"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link *</Label>
                    <Input
                      placeholder="#products or /collections/all"
                      value={form.link}
                      onChange={(e) => setForm(prev => ({ ...prev, link: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use # for page sections or full URLs for external links
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Visible</Label>
                    <Switch
                      checked={form.is_visible}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_visible: checked }))}
                    />
                  </div>
                  <Button onClick={handleSubmit} disabled={saving} className="w-full">
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingItem ? 'Update Link' : 'Add Link'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {navItems.length === 0 ? (
          <div className="text-center py-12">
            <Menu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No navigation links yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add links or use default navigation.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
              >
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{item.link}</p>
                </div>
                <Switch
                  checked={item.is_visible}
                  onCheckedChange={() => toggleVisible(item)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
