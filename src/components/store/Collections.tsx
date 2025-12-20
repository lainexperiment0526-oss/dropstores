import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Collection {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  handle: string | null;
  sort_order: string;
  is_published: boolean;
  products_count?: number;
}

interface Product {
  id: string;
  name: string;
  images: string[] | null;
  price: number;
}

interface CollectionsProps {
  storeId: string;
}

export function Collections({ storeId }: CollectionsProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    handle: '',
    sort_order: 'manual',
    is_published: true,
  });

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, [storeId]);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          collection_products(count)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const collectionsWithCount = (data || []).map((c: any) => ({
        ...c,
        products_count: c.collection_products?.[0]?.count || 0,
      }));

      setCollections(collectionsWithCount);
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, images, price')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCollectionProducts = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('collection_products')
        .select('product_id')
        .eq('collection_id', collectionId);

      if (error) throw error;
      setSelectedProducts((data || []).map((cp) => cp.product_id));
    } catch (error: any) {
      console.error('Error fetching collection products:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      handle: '',
      sort_order: 'manual',
      is_published: true,
    });
    setEditingCollection(null);
  };

  const generateHandle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const openDialog = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        title: collection.title,
        description: collection.description || '',
        image_url: collection.image_url || '',
        handle: collection.handle || '',
        sort_order: collection.sort_order,
        is_published: collection.is_published,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const openProductsDialog = async (collection: Collection) => {
    setEditingCollection(collection);
    await fetchCollectionProducts(collection.id);
    setIsProductsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Collection title is required');
      return;
    }

    try {
      const payload = {
        store_id: storeId,
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        handle: formData.handle || generateHandle(formData.title),
        sort_order: formData.sort_order,
        is_published: formData.is_published,
      };

      if (editingCollection) {
        const { error } = await supabase
          .from('collections')
          .update(payload)
          .eq('id', editingCollection.id);

        if (error) throw error;
        toast.success('Collection updated');
      } else {
        const { error } = await supabase.from('collections').insert(payload);

        if (error) throw error;
        toast.success('Collection created');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCollections();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      toast.error(error.message || 'Failed to save collection');
    }
  };

  const handleSaveProducts = async () => {
    if (!editingCollection) return;

    try {
      // Delete existing collection products
      await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', editingCollection.id);

      // Insert new collection products
      if (selectedProducts.length > 0) {
        const { error } = await supabase.from('collection_products').insert(
          selectedProducts.map((productId, index) => ({
            collection_id: editingCollection.id,
            product_id: productId,
            position: index,
          }))
        );

        if (error) throw error;
      }

      toast.success('Collection products updated');
      setIsProductsDialogOpen(false);
      fetchCollections();
    } catch (error: any) {
      console.error('Error saving collection products:', error);
      toast.error('Failed to update collection products');
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const { error } = await supabase.from('collections').delete().eq('id', id);

      if (error) throw error;
      toast.success('Collection deleted');
      fetchCollections();
    } catch (error: any) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Collections</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                Create Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCollection ? 'Edit Collection' : 'Create Collection'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        handle: generateHandle(e.target.value),
                      });
                    }}
                    placeholder="e.g., Summer Collection"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this collection..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Handle (URL slug)</Label>
                  <Input
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    placeholder="summer-collection"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Select
                    value={formData.sort_order}
                    onValueChange={(v) => setFormData({ ...formData, sort_order: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="best-selling">Best Selling</SelectItem>
                      <SelectItem value="alpha-asc">Alphabetically (A-Z)</SelectItem>
                      <SelectItem value="alpha-desc">Alphabetically (Z-A)</SelectItem>
                      <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                      <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                      <SelectItem value="created-desc">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_published: checked })
                      }
                    />
                    <Label>Published</Label>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingCollection ? 'Update Collection' : 'Create Collection'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading...</p>
        ) : collections.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No collections yet. Create one to organize your products!
          </p>
        ) : (
          <div className="space-y-3">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{collection.title}</span>
                      {!collection.is_published && <Badge variant="secondary">Draft</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {collection.products_count || 0} products
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openProductsDialog(collection)}
                  >
                    Manage Products
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDialog(collection)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCollection(collection.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Selection Dialog */}
        <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                Manage Products in "{editingCollection?.title}"
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {products.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No products available
                </p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleProductSelection(product.id)}
                  >
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                    <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.price}π</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pt-4 border-t">
              <Button onClick={handleSaveProducts} className="w-full">
                Save ({selectedProducts.length} selected)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
