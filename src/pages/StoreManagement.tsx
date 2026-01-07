import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
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
import { StoreThemeCustomizer } from '@/components/store/StoreThemeCustomizer';
import { StoreBannerManager } from '@/components/store/StoreBannerManager';
import { StoreNavigationManager } from '@/components/store/StoreNavigationManager';
import { StorePagesManager } from '@/components/store/StorePagesManager';
import { ProductReviewsManager } from '@/components/store/ProductReviewsManager';
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
  Palette,
  Grid3x3,
  List,
} from 'lucide-react';
import { FloatingAISupport } from '@/components/FloatingAISupport';
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
  // Theme customization fields (optional until migration applied)
  font_heading?: string;
  font_body?: string;
  layout_style?: string;
  header_style?: string;
  footer_style?: string;
  show_announcement_bar?: boolean;
  announcement_text?: string | null;
  announcement_link?: string | null;
  heading_text_color?: string | null;
  body_text_color?: string | null;
  hero_title_text_color?: string | null;
  hero_subtitle_text_color?: string | null;
  announcement_bar_text_color?: string | null;
  social_facebook?: string | null;
  social_instagram?: string | null;
  social_twitter?: string | null;
  social_tiktok?: string | null;
  about_page?: string | null;
  contact_page?: string | null;
  shipping_policy?: string | null;
  refund_policy?: string | null;
  privacy_policy?: string | null;
  terms_of_service?: string | null;
  show_product_reviews?: boolean;
  enable_wishlist?: boolean;
  enable_compare?: boolean;
  products_per_page?: number;
  show_stock_count?: boolean;
  show_sold_count?: boolean;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_button_text?: string;
  hero_button_link?: string | null;
}

interface ProductVariant {
  id?: string;
  title: string;
  sku: string;
  price: string;
  compare_at_price: string;
  inventory_quantity: string;
  option1?: string;
  option2?: string;
  option3?: string;
  image_url?: string;
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
  has_variants?: boolean;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  notes: string | null;
  status: string;
  total: number;
  items: any;
  created_at: string;
  pi_payment_id: string | null;
  pi_txid: string | null;
}

export default function StoreManagement() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { isActive, canAddProduct } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [productView, setProductView] = useState<'grid' | 'list'>('grid');
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
    has_variants: false,
    variants: [] as ProductVariant[],
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

      // Set store with defaults for missing theme fields (cast to any since columns may not exist yet)
      const data = storeData as any;
      setStore({
        ...storeData,
        font_heading: data.font_heading || 'Inter',
        font_body: data.font_body || 'Inter',
        layout_style: data.layout_style || 'grid',
        header_style: data.header_style || 'simple',
        footer_style: data.footer_style || 'simple',
        show_announcement_bar: data.show_announcement_bar ?? false,
        heading_text_color: data.heading_text_color || '#000000',
        body_text_color: data.body_text_color || '#333333',
        hero_title_text_color: data.hero_title_text_color || '#FFFFFF',
        hero_subtitle_text_color: data.hero_subtitle_text_color || '#E5E7EB',
        announcement_bar_text_color: data.announcement_bar_text_color || '#FFFFFF',
        show_product_reviews: data.show_product_reviews ?? true,
        enable_wishlist: data.enable_wishlist ?? true,
        enable_compare: data.enable_compare ?? true,
        products_per_page: data.products_per_page || 12,
        show_stock_count: data.show_stock_count ?? true,
        show_sold_count: data.show_sold_count ?? false,
        hero_button_text: data.hero_button_text || 'Shop Now',
      });

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
      has_variants: false,
      variants: [],
    });
    setEditingProduct(null);
  };

  const handleEditProduct = async (product: Product) => {
    setEditingProduct(product);
    
    // Load variants if product has variants
    let variants: ProductVariant[] = [];
    if (product.has_variants) {
      try {
        const { data: variantsData, error } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id)
          .order('position', { ascending: true });
        
        if (!error && variantsData) {
          variants = variantsData.map(v => ({
            id: v.id,
            title: v.title,
            sku: v.sku || '',
            price: v.price.toString(),
            compare_at_price: v.compare_at_price?.toString() || '',
            inventory_quantity: v.inventory_quantity?.toString() || '0',
            option1: v.option1 || '',
            option2: v.option2 || '',
            option3: v.option3 || '',
            image_url: v.image_url || '',
          }));
        }
      } catch (error) {
        console.error('Error loading variants:', error);
      }
    }
    
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
      has_variants: product.has_variants || false,
      variants: variants,
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

    // Check if user has subscription for new products (not editing)
    if (!editingProduct && !isActive) {
      toast({
        title: 'Subscription required',
        description: 'You need an active subscription to add products. Subscribe to unlock this feature.',
        variant: 'destructive',
      });
      navigate('/subscription');
      return;
    }

    // Check if user can add more products
    if (!editingProduct && !canAddProduct(products.length)) {
      toast({
        title: 'Product limit reached',
        description: 'You have reached the product limit for your plan. Upgrade to add more products.',
        variant: 'destructive',
      });
      navigate('/subscription');
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
        has_variants: productForm.has_variants,
      };

      let savedProductId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        // Delete existing variants if has_variants is now false
        if (!productForm.has_variants) {
          await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', editingProduct.id);
        }
        
        toast({ title: 'Product updated' });
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        savedProductId = newProduct.id;
        toast({ title: 'Product added' });
      }

      // Save variants if enabled
      if (productForm.has_variants && productForm.variants.length > 0 && savedProductId) {
        // Delete existing variants for this product
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', savedProductId);

        // Insert new variants
        const variantsData = productForm.variants.map((variant, index) => ({
          product_id: savedProductId,
          title: variant.title.trim(),
          sku: variant.sku.trim() || null,
          price: parseFloat(variant.price) || 0,
          compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
          inventory_quantity: parseInt(variant.inventory_quantity) || 0,
          option1: variant.option1?.trim() || null,
          option2: variant.option2?.trim() || null,
          option3: variant.option3?.trim() || null,
          position: index,
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsData);

        if (variantsError) {
          console.error('Error saving variants:', variantsError);
          toast({
            title: 'Warning',
            description: 'Product saved but variants failed to save.',
            variant: 'destructive',
          });
        }
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent">
                  <img src="https://i.ibb.co/rRN0sS7y/favicon.png" alt="App Logo" className="w-10 h-10 object-contain" />
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
          <TabsList className="mb-6 w-full overflow-x-auto flex-wrap h-auto gap-1">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Design</span>
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
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* View Toggle */}
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <Button
                    variant={productView === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProductView('grid')}
                    className="rounded-r-none border-r-0"
                  >
                    <Grid3x3 className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Grid</span>
                  </Button>
                  <Button
                    variant={productView === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProductView('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">List</span>
                  </Button>
                </div>
                {/* Add Product Dialog */}
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
                    {/* Product Type Selection - Conditional based on store type */}
                    {store?.store_type === 'online' && (
                      <div className="space-y-2">
                        <Label>Product Type</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={productForm.product_type === 'physical' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setProductForm({ ...productForm, product_type: 'physical' })}
                            className="flex-1"
                            disabled={productForm.has_variants && productForm.product_type === 'digital'}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Physical
                          </Button>
                          <Button
                            type="button"
                            variant={productForm.product_type === 'digital' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setProductForm({ ...productForm, product_type: 'digital', has_variants: false, variants: [] })}
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Digital
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Show store type badge if not online */}
                    {store?.store_type !== 'online' && (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        {store?.store_type === 'physical' ? (
                          <>
                            <Package className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Physical Store - Adding Physical Products</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Digital Store - Adding Digital Products</span>
                          </>
                        )}
                      </div>
                    )}

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

                    {/* Product Variants - Only for physical products */}
                    {productForm.product_type === 'physical' && (
                      <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base">Product Variants</Label>
                            <p className="text-xs text-muted-foreground">
                              Add variants like sizes, colors, materials, etc.
                            </p>
                          </div>
                          <Switch
                            checked={productForm.has_variants}
                            onCheckedChange={(checked) => {
                              setProductForm({
                                ...productForm,
                                has_variants: checked,
                                variants: checked ? [{ title: '', sku: '', price: productForm.price, compare_at_price: '', inventory_quantity: '0', option1: '', option2: '', option3: '' }] : []
                              });
                            }}
                          />
                        </div>

                        {productForm.has_variants && (
                          <div className="space-y-3 mt-3">
                            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                              💡 When using variants, the base price above will be used as default. Each variant can override the price.
                            </div>
                            
                            {productForm.variants.map((variant, index) => (
                              <Card key={index} className="p-3">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">Variant {index + 1}</h4>
                                    {productForm.variants.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => {
                                          const newVariants = productForm.variants.filter((_, i) => i !== index);
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Variant Title *</Label>
                                      <Input
                                        placeholder="e.g., Large / Red"
                                        value={variant.title}
                                        onChange={(e) => {
                                          const newVariants = [...productForm.variants];
                                          newVariants[index].title = e.target.value;
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">SKU</Label>
                                      <Input
                                        placeholder="SKU-001"
                                        value={variant.sku}
                                        onChange={(e) => {
                                          const newVariants = [...productForm.variants];
                                          newVariants[index].sku = e.target.value;
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Price (π)</Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={variant.price}
                                        onChange={(e) => {
                                          const newVariants = [...productForm.variants];
                                          newVariants[index].price = e.target.value;
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Compare</Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={variant.compare_at_price}
                                        onChange={(e) => {
                                          const newVariants = [...productForm.variants];
                                          newVariants[index].compare_at_price = e.target.value;
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Inventory</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={variant.inventory_quantity}
                                        onChange={(e) => {
                                          const newVariants = [...productForm.variants];
                                          newVariants[index].inventory_quantity = e.target.value;
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Option 1 (e.g., Size)</Label>
                                      <Input
                                        placeholder="Large"
                                        value={variant.option1}
                                        onChange={(e) => {
                                          const newVariants = [...productForm.variants];
                                          newVariants[index].option1 = e.target.value;
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Option 2 (e.g., Color)</Label>
                                      <Input
                                        placeholder="Red"
                                        value={variant.option2}
                                        onChange={(e) => {
                                          const newVariants = [...productForm.variants];
                                          newVariants[index].option2 = e.target.value;
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Option 3 (e.g., Material)</Label>
                                      <Input
                                        placeholder="Cotton"
                                        value={variant.option3}
                                        onChange={(e) => {
                                          const newVariants = [...productForm.variants];
                                          newVariants[index].option3 = e.target.value;
                                          setProductForm({ ...productForm, variants: newVariants });
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProductForm({
                                  ...productForm,
                                  variants: [
                                    ...productForm.variants,
                                    { title: '', sku: '', price: productForm.price, compare_at_price: '', inventory_quantity: '0', option1: '', option2: '', option3: '' }
                                  ]
                                });
                              }}
                              className="w-full"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Another Variant
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Product Images</Label>
                        <span className="text-xs text-muted-foreground">
                          {productForm.images.length}/10 images
                        </span>
                      </div>
                      <div className="space-y-3">
                        {/* Image preview grid */}
                        {productForm.images.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded flex items-center gap-2">
                              <ImageIcon className="w-3 h-3" />
                              First image will be the featured image shown in listings
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                              {productForm.images.map((img, index) => (
                                <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 hover:border-primary transition-colors group">
                                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                  {index === 0 && (
                                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                      Featured
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    {index > 0 && (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="w-6 h-6"
                                        onClick={() => {
                                          const newImages = [...productForm.images];
                                          const temp = newImages[index];
                                          newImages[index] = newImages[0];
                                          newImages[0] = temp;
                                          setProductForm({ ...productForm, images: newImages });
                                        }}
                                        title="Set as featured"
                                      >
                                        <ImageIcon className="w-3 h-3" />
                                      </Button>
                                    )}
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() => handleRemoveProductImage(index)}
                                      title="Remove image"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Upload component */}
                        {productForm.images.length < 10 && (
                          <ImageUpload
                            label={productForm.images.length === 0 ? "Add Product Images" : "Add More Images"}
                            onUpload={handleProductImageUpload}
                            bucket="store-assets"
                            folder={`products/${store?.id}`}
                            aspectRatio="square"
                          />
                        )}
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
              <>
                {/* Grid View */}
                {productView === 'grid' && (
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

                {/* List View */}
                {productView === 'list' && (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0 relative">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              {product.product_type === 'digital' && (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-blue-500 text-white text-xs font-medium">
                                  Digital
                                </span>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-primary font-bold">
                                  {product.price.toFixed(2)} π
                                </span>
                                {product.compare_at_price && (
                                  <span className="text-muted-foreground line-through text-sm">
                                    {product.compare_at_price.toFixed(2)} π
                                  </span>
                                )}
                                {product.inventory_count !== null && (
                                  <span className="text-xs text-muted-foreground">
                                    • Stock: {product.inventory_count}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Edit</span>
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
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
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {order.customer_name}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">📧 {order.customer_email}</p>
                            {order.customer_phone && (
                              <p className="text-muted-foreground">📱 {order.customer_phone}</p>
                            )}
                            {order.shipping_address && (
                              <p className="text-muted-foreground">📍 {order.shipping_address}</p>
                            )}
                            {order.notes && (
                              <p className="text-muted-foreground">📝 {order.notes}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-bold text-lg text-primary">
                              {order.total.toFixed(2)} π
                            </p>
                          </div>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value)
                            }
                            className="px-3 py-2 text-sm rounded-lg border border-border bg-background font-medium"
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

                      {/* Order Items */}
                      {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-sm text-foreground mb-3">Items ({order.items.length})</h4>
                          <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-start p-2 bg-muted/30 rounded text-sm">
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{item.name}</p>
                                  {item.variant_name && (
                                    <p className="text-xs text-muted-foreground">Variant: {item.variant_name}</p>
                                  )}
                                  {item.gift_message && (
                                    <p className="text-xs text-muted-foreground">🎁 Gift: {item.gift_message}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-foreground">
                                  {(item.price * item.quantity).toFixed(2)} π
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <StoreThemeCustomizer
              storeId={store.id}
              theme={store as any}
              onUpdate={(updated) => setStore({ ...store, ...updated })}
            />
            <StoreBannerManager storeId={store.id} />
            <StoreNavigationManager storeId={store.id} />
            <StorePagesManager storeId={store.id} storeSlug={store.slug} />
            <ProductReviewsManager storeId={store.id} />
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <MerchantPayouts 
              storeId={store?.id || ''} 
              payoutWallet={store?.payout_wallet || ''}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Store Analytics</CardTitle>
                    <CardDescription>
                      Track your store performance and sales metrics.
                    </CardDescription>
                  </div>
                  <Link to={`/store/${storeId}/analytics`}>
                    <Button className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Advanced Analytics
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnalyticsCards data={analyticsData} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OrderStatusCards pending={pendingOrders} completed={completedOrders} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-muted-foreground">Total Revenue</span>
                        <span className="text-2xl font-bold text-primary">{totalRevenue.toFixed(2)} π</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="text-2xl font-bold">{orders.length}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <span className="text-muted-foreground">Total Products</span>
                        <span className="text-2xl font-bold">{products.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average Order Value</span>
                        <span className="text-2xl font-bold">{(orders.length > 0 ? totalRevenue / orders.length : 0).toFixed(2)} π</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
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
      
      {/* Floating AI Support for store management assistance */}
      <FloatingAISupport />
    </div>
  );
}