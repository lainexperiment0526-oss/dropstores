import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { StoreTypeInstructions } from '@/components/store/StoreTypeSelector';
import { AnalyticsCards, OrderStatusCards } from '@/components/dashboard/AnalyticsCards';
import { ImageUpload } from '@/components/store/ImageUpload';
import { MerchantPayouts } from '@/components/store/MerchantPayouts';
import { StoreQRCode } from '@/components/store/StoreQRCode';
import {
  Store,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  Plus,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  Save,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Image as ImageIcon,
  Banknote,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  is_published: boolean;
  template_id: string | null;
  payout_wallet: string | null;
  store_type: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  category: string | null;
  inventory_count: number | null;
  is_active: boolean;
  product_type: string | null;
  digital_file_url: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  total: number;
  items: unknown;
  created_at: string;
}

export default function StoreManagement() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    category: '',
    inventory_count: '',
    images: [] as string[],
    product_type: 'physical',
    digital_file_url: '',
  });

  const handleProductImageUpload = (url: string) => {
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
  };

  const handleRemoveProductImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && storeId) {
      fetchStoreData();
    }
  }, [user, storeId]);

  const fetchStoreData = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .maybeSingle();

      if (storeError) throw storeError;
      if (!storeData) {
        toast({
          title: 'Store not found',
          description: 'The store you are looking for does not exist.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setStore(storeData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching store:', error);
      toast({
        title: 'Error',
        description: 'Failed to load store data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!store) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: store.name,
          description: store.description,
          contact_email: store.contact_email,
          contact_phone: store.contact_phone,
          address: store.address,
          primary_color: store.primary_color,
          payout_wallet: store.payout_wallet,
          logo_url: store.logo_url,
          banner_url: store.banner_url,
        })
        .eq('id', store.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Your store settings have been updated.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!store) return;

    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_published: !store.is_published })
        .eq('id', store.id);

      if (error) throw error;

      setStore({ ...store, is_published: !store.is_published });
      toast({
        title: store.is_published ? 'Store unpublished' : 'Store published',
        description: store.is_published
          ? 'Your store is now hidden from the public.'
          : 'Your store is now live and accessible to customers!',
      });
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({
        title: 'Error',
        description: 'Failed to update store status.',
        variant: 'destructive',
      });
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      compare_at_price: '',
      category: '',
      inventory_count: '',
      images: [],
      product_type: store?.store_type === 'digital' ? 'digital' : 'physical',
      digital_file_url: '',
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      category: product.category || '',
      inventory_count: product.inventory_count?.toString() || '',
      images: product.images || [],
      product_type: product.product_type || 'physical',
      digital_file_url: product.digital_file_url || '',
    });
    setShowProductDialog(true);
  };

  const handleSaveProduct = async () => {
    if (!store || !productForm.name.trim() || !productForm.price) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in product name and price.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const productData = {
        store_id: store.id,
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        price: parseFloat(productForm.price) || 0,
        compare_at_price: productForm.compare_at_price
          ? parseFloat(productForm.compare_at_price)
          : null,
        category: productForm.category.trim() || null,
        inventory_count: productForm.inventory_count
          ? parseInt(productForm.inventory_count)
          : 0,
        images: productForm.images.length > 0 ? productForm.images : [],
        product_type: productForm.product_type,
        digital_file_url: productForm.product_type === 'digital' ? productForm.digital_file_url.trim() || null : null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'Product updated' });
      } else {
        const { error } = await supabase.from('products').insert(productData);

        if (error) throw error;
        toast({ title: 'Product added' });
      }

      setShowProductDialog(false);
      resetProductForm();
      fetchStoreData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== productId));
      toast({ title: 'Product deleted' });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast({ title: 'Order status updated' });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return null;
  }

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

  const analyticsData = {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    revenueChange: 12,
    ordersChange: 8,
    pendingOrders,
    completedOrders,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground hidden md:inline">
                  Drop Store
                </span>
              </Link>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="font-medium text-foreground truncate">{store.name}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Label htmlFor="publish" className="text-sm text-muted-foreground hidden sm:inline">
                  {store.is_published ? 'Live' : 'Draft'}
                </Label>
                <Switch
                  id="publish"
                  checked={store.is_published || false}
                  onCheckedChange={handleTogglePublish}
                />
              </div>
              <StoreQRCode
                storeUrl={`${window.location.origin}/shop/${store.slug}`}
                storeName={store.name}
                storeDescription={store.description || undefined}
                storeLogo={store.logo_url || undefined}
              />
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/shop/${store.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">View Store</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Analytics */}
        <div className="mb-6">
          <AnalyticsCards data={analyticsData} />
        </div>

        {/* Order Status */}
        <div className="mb-6">
          <OrderStatusCards pending={pendingOrders} completed={completedOrders} />
        </div>

        {/* Store Type Instructions */}
        {store.store_type && (
          <div className="mb-6">
            <StoreTypeInstructions storeType={store.store_type} />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              <span className="hidden sm:inline">Payouts</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-display font-bold text-foreground">
                Products ({products.length})
              </h2>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="gradient-hero shadow-glow hover:opacity-90 w-full sm:w-auto"
                    onClick={resetProductForm}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the product details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Product Type Selection */}
                    <div className="space-y-2">
                      <Label>Product Type</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={productForm.product_type === 'physical' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setProductForm({ ...productForm, product_type: 'physical' })}
                          className="flex-1"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Physical
                        </Button>
                        <Button
                          type="button"
                          variant={productForm.product_type === 'digital' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setProductForm({ ...productForm, product_type: 'digital' })}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Digital
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product-name">Product Name *</Label>
                      <Input
                        id="product-name"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm({ ...productForm, name: e.target.value })
                        }
                        placeholder="Product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-desc">Description</Label>
                      <Textarea
                        id="product-desc"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Product description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-price">Price (π) *</Label>
                        <Input
                          id="product-price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              price: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-compare">Compare at</Label>
                        <Input
                          id="product-compare"
                          type="number"
                          step="0.01"
                          value={productForm.compare_at_price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              compare_at_price: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Digital Product URL */}
                    {productForm.product_type === 'digital' && (
                      <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Label htmlFor="digital-url" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Digital File URL *
                        </Label>
                        <Input
                          id="digital-url"
                          value={productForm.digital_file_url}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              digital_file_url: e.target.value,
                            })
                          }
                          placeholder="https://example.com/file.pdf"
                        />
                        <p className="text-xs text-muted-foreground">
                          URL to the downloadable file. Customers will receive this link after payment.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-category">Category</Label>
                        <Input
                          id="product-category"
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              category: e.target.value,
                            })
                          }
                          placeholder="e.g. Electronics"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-inventory">Inventory</Label>
                        <Input
                          id="product-inventory"
                          type="number"
                          value={productForm.inventory_count}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              inventory_count: e.target.value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Product Images</Label>
                      <div className="space-y-3">
                        {/* Image preview grid */}
                        {productForm.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {productForm.images.map((img, index) => (
                              <div key={index} className="relative aspect-square bg-muted rounded overflow-hidden border">
                                <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 w-5 h-5"
                                  onClick={() => handleRemoveProductImage(index)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Upload component */}
                        <ImageUpload
                          label="Add Image"
                          onUpload={handleProductImageUpload}
                          bucket="store-assets"
                          folder={`products/${store?.id}`}
                          aspectRatio="square"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      className="gradient-hero"
                      onClick={handleSaveProduct}
                      disabled={saving}
                    >
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingProduct ? 'Update' : 'Add'} Product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {products.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No products yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add your first product to start selling.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="pt-6">
                      <div className="aspect-square bg-secondary rounded-lg mb-4 overflow-hidden relative">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        {product.product_type === 'digital' && (
                          <span className="absolute top-2 left-2 px-2 py-1 rounded bg-blue-500 text-white text-xs font-medium">
                            Digital
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-primary font-bold mb-2">
                        {product.price.toFixed(2)} π
                        {product.compare_at_price && (
                          <span className="text-muted-foreground line-through ml-2 font-normal text-sm">
                            {product.compare_at_price.toFixed(2)} π
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-xl font-display font-bold text-foreground mb-6">
              Orders ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No orders yet
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Orders will appear here when customers make purchases.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {order.customer_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-primary">
                            {order.total.toFixed(2)} π
                          </p>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value)
                            }
                            className="px-2 py-1 text-sm rounded border border-border bg-background"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <h2 className="text-xl font-display font-bold text-foreground mb-6">
              Payouts & Withdrawals
            </h2>
            <MerchantPayouts storeId={store.id} payoutWallet={store.payout_wallet} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <h2 className="text-xl font-display font-bold text-foreground mb-6">
              Analytics Overview
            </h2>
            <AnalyticsCards data={analyticsData} />
            <div className="mt-6">
              <OrderStatusCards pending={pendingOrders} completed={completedOrders} />
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>
                  Update your store information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo & Banner Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-secondary/30 rounded-lg">
                  <ImageUpload
                    label="Store Logo"
                    currentUrl={store.logo_url}
                    onUpload={(url) => setStore({ ...store, logo_url: url })}
                    onRemove={() => setStore({ ...store, logo_url: null })}
                    folder={`stores/${store.id}/logo`}
                    aspectRatio="logo"
                  />
                  <ImageUpload
                    label="Store Banner"
                    currentUrl={store.banner_url}
                    onUpload={(url) => setStore({ ...store, banner_url: url })}
                    onRemove={() => setStore({ ...store, banner_url: null })}
                    folder={`stores/${store.id}/banner`}
                    aspectRatio="banner"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input
                    id="store-name"
                    value={store.name}
                    onChange={(e) =>
                      setStore({ ...store, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-desc">Description</Label>
                  <Textarea
                    id="store-desc"
                    value={store.description || ''}
                    onChange={(e) =>
                      setStore({ ...store, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-email">Contact Email</Label>
                    <Input
                      id="store-email"
                      type="email"
                      value={store.contact_email || ''}
                      onChange={(e) =>
                        setStore({ ...store, contact_email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Contact Phone</Label>
                    <Input
                      id="store-phone"
                      value={store.contact_phone || ''}
                      onChange={(e) =>
                        setStore({ ...store, contact_phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-address">Address</Label>
                  <Textarea
                    id="store-address"
                    value={store.address || ''}
                    onChange={(e) =>
                      setStore({ ...store, address: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="store-color"
                      type="color"
                      value={store.primary_color || '#0EA5E9'}
                      onChange={(e) =>
                        setStore({ ...store, primary_color: e.target.value })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={store.primary_color || '#0EA5E9'}
                      onChange={(e) =>
                        setStore({ ...store, primary_color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Payout Wallet Section */}
                <div className="pt-4 border-t border-border">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Payout Settings</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Set your Pi wallet address to receive payments from customer orders.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="payout-wallet">Pi Wallet Address</Label>
                      <Input
                        id="payout-wallet"
                        value={store.payout_wallet || ''}
                        onChange={(e) =>
                          setStore({ ...store, payout_wallet: e.target.value })
                        }
                        placeholder="G..."
                        className="font-mono text-sm"
                      />
                    </div>
                    {store.payout_wallet ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-400">Wallet configured - ready to receive payments</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700 dark:text-yellow-400">Add your wallet to receive customer payments</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">Store URL</p>
                      <p className="text-sm text-muted-foreground">
                        /shop/{store.slug}
                      </p>
                    </div>
                    {store.is_published && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`/shop/${store.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open Store
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full sm:w-auto gradient-hero shadow-glow hover:opacity-90"
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}