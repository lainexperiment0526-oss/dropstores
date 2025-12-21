import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Package, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FlashSaleManagerProps {
  storeId: string;
}

interface FlashSale {
  id: string;
  title: string;
  description: string;
  product_id: string;
  discount_percentage: number;
  quantity_limit: number;
  quantity_sold: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  products?: {
    name: string;
    price: number;
    image_url: string;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export function FlashSaleManager({ storeId }: FlashSaleManagerProps) {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [storeId]);

  const fetchSales = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('flash_sales')
        .select(`
          *,
          products (
            name,
            price,
            image_url
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales((data as any) || []);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      toast.error('Failed to load flash sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDelete = async (saleId: string) => {
    if (!confirm('Are you sure you want to delete this flash sale?')) return;

    try {
      const { error } = await (supabase as any)
        .from('flash_sales')
        .delete()
        .eq('id', saleId);

      if (error) throw error;
      toast.success('Flash sale deleted successfully');
      fetchSales();
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      toast.error('Failed to delete flash sale');
    }
  };

  const handleToggleActive = async (saleId: string, isActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('flash_sales')
        .update({ is_active: !isActive })
        .eq('id', saleId);

      if (error) throw error;
      toast.success(`Flash sale ${!isActive ? 'activated' : 'deactivated'}`);
      fetchSales();
    } catch (error) {
      console.error('Error toggling flash sale:', error);
      toast.error('Failed to update flash sale');
    }
  };

  const calculateTimeLeft = (endsAt: string) => {
    const now = new Date().getTime();
    const end = new Date(endsAt).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    return `${hours}h ${minutes}m left`;
  };

  const calculateSalePrice = (sale: FlashSale) => {
    const originalPrice = sale.products?.price || 0;
    return (originalPrice * (1 - sale.discount_percentage / 100)).toFixed(2);
  };

  const getProgressPercentage = (sale: FlashSale) => {
    return (sale.quantity_sold / sale.quantity_limit) * 100;
  };

  const isLive = (sale: FlashSale) => {
    const now = new Date();
    const start = new Date(sale.starts_at);
    const end = new Date(sale.ends_at);
    return sale.is_active && now >= start && now <= end;
  };

  const isUpcoming = (sale: FlashSale) => {
    return new Date(sale.starts_at) > new Date();
  };

  const isEnded = (sale: FlashSale) => {
    return new Date(sale.ends_at) < new Date();
  };

  if (loading) {
    return <div>Loading flash sales...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flash Sales</h2>
          <p className="text-muted-foreground">Create limited-time offers with countdown timers</p>
        </div>
        <Button onClick={() => { setEditingSale(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Flash Sale
        </Button>
      </div>

      {sales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Flash Sales Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create limited-time offers to boost sales and create urgency
            </p>
            <Button onClick={() => { setEditingSale(null); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Flash Sale
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sales.map((sale) => (
            <Card key={sale.id} className={!sale.is_active ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      {sale.title}
                    </CardTitle>
                    {sale.description && (
                      <CardDescription className="text-sm mt-1">
                        {sale.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Product Info */}
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{sale.products?.name}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-wrap gap-2">
                    {isLive(sale) && (
                      <Badge variant="default" className="bg-green-500">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE NOW
                        </div>
                      </Badge>
                    )}
                    {isUpcoming(sale) && (
                      <Badge variant="secondary">Upcoming</Badge>
                    )}
                    {isEnded(sale) && (
                      <Badge variant="destructive">Ended</Badge>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {calculateSalePrice(sale)} π
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {sale.products?.price} π
                    </span>
                    <Badge variant="secondary">
                      {sale.discount_percentage}% OFF
                    </Badge>
                  </div>

                  {/* Time Remaining */}
                  {!isEnded(sale) && (
                    <div className="flex items-center text-sm font-medium">
                      <Clock className="w-4 h-4 mr-1 text-orange-500" />
                      {calculateTimeLeft(sale.ends_at)}
                    </div>
                  )}

                  {/* Quantity Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sold</span>
                      <span className="font-medium">
                        {sale.quantity_sold} / {sale.quantity_limit}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(getProgressPercentage(sale), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Starts: {new Date(sale.starts_at).toLocaleString()}</div>
                    <div>Ends: {new Date(sale.ends_at).toLocaleString()}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleActive(sale.id, sale.is_active)}
                    >
                      {sale.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSale(sale);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(sale.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dialogOpen && (
        <FlashSaleDialog
          storeId={storeId}
          products={products}
          sale={editingSale}
          onClose={() => {
            setDialogOpen(false);
            setEditingSale(null);
            fetchSales();
          }}
        />
      )}
    </div>
  );
}

interface FlashSaleDialogProps {
  storeId: string;
  products: Product[];
  sale: FlashSale | null;
  onClose: () => void;
}

function FlashSaleDialog({ storeId, products, sale, onClose }: FlashSaleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(sale?.title || '');
  const [description, setDescription] = useState(sale?.description || '');
  const [productId, setProductId] = useState(sale?.product_id || '');
  const [discountPercentage, setDiscountPercentage] = useState(sale?.discount_percentage?.toString() || '');
  const [quantityLimit, setQuantityLimit] = useState(sale?.quantity_limit?.toString() || '');
  const [startsAt, setStartsAt] = useState(sale?.starts_at || new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(sale?.ends_at || '');
  const [isActive, setIsActive] = useState(sale?.is_active ?? true);

  const selectedProduct = products.find(p => p.id === productId);

  const calculateSalePrice = () => {
    if (!selectedProduct || !discountPercentage) return null;
    return (selectedProduct.price * (1 - parseFloat(discountPercentage) / 100)).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !productId || !discountPercentage || !quantityLimit || !endsAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    const discount = parseFloat(discountPercentage);
    if (discount <= 0 || discount >= 100) {
      toast.error('Discount must be between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        store_id: storeId,
        title: title.trim(),
        description,
        product_id: productId,
        discount_percentage: discount,
        quantity_limit: parseInt(quantityLimit),
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: isActive,
      };

      if (sale) {
        const { error } = await (supabase as any)
          .from('flash_sales')
          .update(saleData)
          .eq('id', sale.id);

        if (error) throw error;
        toast.success('Flash sale updated successfully');
      } else {
        const { error } = await (supabase as any)
          .from('flash_sales')
          .insert({ ...saleData, quantity_sold: 0 });

        if (error) throw error;
        toast.success('Flash sale created successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error saving flash sale:', error);
      toast.error('Failed to save flash sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Flash Sale' : 'Create New Flash Sale'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Flash Sale: 50% OFF Limited Stock!"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hurry! Limited quantities available..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Product *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {product.price} π
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount Percentage * (0-100)</Label>
            <Input
              id="discount"
              type="number"
              min="1"
              max="99"
              step="1"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              placeholder="50"
              required
            />
            {selectedProduct && discountPercentage && (
              <p className="text-sm text-muted-foreground">
                Sale Price: <span className="font-bold text-primary">{calculateSalePrice()} π</span>
                {' '}(Original: {selectedProduct.price} π)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Limit *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantityLimit}
              onChange={(e) => setQuantityLimit(e.target.value)}
              placeholder="100"
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of units available for this flash sale
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date & Time *</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date & Time *</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">Enable this flash sale</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : sale ? 'Update Flash Sale' : 'Create Flash Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
