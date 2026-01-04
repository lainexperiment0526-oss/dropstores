import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PaymentModal, OrderForm } from '@/components/store/PaymentModal';
import { StoreReportModal } from '@/components/store/StoreReportModal';
import { StoreThemeCustomizer } from '@/components/store/StoreThemeCustomizer';
import { createPiPayment, initPiSdk } from '@/lib/pi-sdk';
import { RewardedAdButton } from '@/components/ads/RewardedAdButton';
import { InterstitialAdTrigger } from '@/components/ads/InterstitialAdTrigger';
import {
  Store,
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
  Package,
  X,
  Mail,
  Phone,
  MapPin,
  Eye,
  Settings,
  Palette,
  Heart,
  Repeat2,
  Award,
  FileText,
  Facebook,
  Instagram,
  Twitter,
  Music,
  AlertCircle,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
  payout_wallet: string | null;
  store_type: string | null;
  // Theme customization fields
  font_heading?: string | null;
  font_body?: string | null;
  layout_style?: string | null;
  header_style?: string | null;
  footer_style?: string | null;
  show_announcement_bar?: boolean;
  announcement_text?: string | null;
  announcement_link?: string | null;
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

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  category: string | null;
  inventory_count: number | null;
  product_type: string | null;
  digital_file_url: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productViewCount, setProductViewCount] = useState(0);
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    initPiSdk(false); // Mainnet mode for production
    if (slug) {
      fetchStore();
    }
  }, [slug]);

  const fetchStore = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setStore(storeData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching store:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast({ title: 'Added to cart', description: product.name });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async (orderForm: OrderForm) => {
    if (!store || cart.length === 0) return;

    setSubmitting(true);

    // Allow free orders without payment
    try {
      const orderItems = cart.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        product_type: item.product.product_type,
        digital_file_url: item.product.digital_file_url,
      }));

      // Check if any digital products
      const hasDigitalProducts = cart.some(item => item.product.product_type === 'digital');
      const downloadExpiresAt = hasDigitalProducts 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
        : null;
      
      await supabase.from('orders').insert({
        store_id: store.id,
        customer_name: orderForm.name.trim(),
        customer_email: orderForm.email.trim(),
        customer_phone: orderForm.phone.trim() || null,
        shipping_address: orderForm.address.trim() || null,
        notes: orderForm.notes.trim() || null,
        items: orderItems,
        total: cartTotal,
        status: 'paid',
        pi_payment_id: null,
        pi_txid: null,
        payout_status: 'pending',
        download_expires_at: downloadExpiresAt,
      });

      toast({
        title: 'Order placed successfully!',
        description: hasDigitalProducts 
          ? 'Check your email for download links.' 
          : 'Thank you for your purchase!',
      });
      
      setCart([]);
      setCartOpen(false);
      setPaymentModalOpen(false);
      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitting(false);
      toast({
        title: 'Order failed',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }

    return;

    // Old Pi payment code (disabled)
    /*
    if (!store.payout_wallet) {
      toast({
        title: 'Store not ready',
        description: 'This store has not configured payment settings yet.',
        variant: 'destructive',
      });
      throw new Error('No payout wallet configured');
    }

    return new Promise<void>((resolve, reject) => {
      createPiPayment(
        {
          amount: cartTotal,
          memo: `Order from ${store.name}`,
          metadata: {
            store_id: store.id,
            merchant_wallet: store.payout_wallet,
            customer_name: orderForm.name.trim(),
            customer_email: orderForm.email.trim(),
            items: cart.map((item) => ({
              product_id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              product_type: item.product.product_type,
              digital_file_url: item.product.digital_file_url,
            })),
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            try {
              const response = await supabase.functions.invoke('pi-payment-approve', {
                body: { paymentId }
              });
              if (response.error) {
                console.error('Payment approval error:', response.error);
              }
            } catch (error) {
              console.error('Error approving payment:', error);
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              await supabase.functions.invoke('pi-payment-complete', {
                body: { 
                  paymentId, 
                  txid,
                  planType: 'product_purchase',
                  storeId: store.id
                }
              });

              const orderItems = cart.map((item) => ({
                product_id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                product_type: item.product.product_type,
                digital_file_url: item.product.digital_file_url,
              }));

              // Check if any digital products
              const hasDigitalProducts = cart.some(item => item.product.product_type === 'digital');
              const downloadExpiresAt = hasDigitalProducts 
                ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
                : null;
              
              await supabase.from('orders').insert({
                store_id: store.id,
                customer_name: orderForm.name.trim(),
                customer_email: orderForm.email.trim(),
                customer_phone: orderForm.phone.trim() || null,
                shipping_address: orderForm.address.trim() || null,
                notes: orderForm.notes.trim() || null,
                items: orderItems,
                total: cartTotal,
                status: 'paid',
                pi_payment_id: paymentId,
                pi_txid: txid,
                payout_status: 'pending',
                download_expires_at: downloadExpiresAt,
              });

              toast({
                title: 'Order placed successfully!',
                description: hasDigitalProducts 
                  ? 'Check your email for download links.' 
                  : 'Thank you for your purchase!',
              });
              
              setCart([]);
              setCartOpen(false);
              setPaymentModalOpen(false);
              setSubmitting(false);
              resolve();
            } catch (error) {
              console.error('Error submitting order:', error);
              setSubmitting(false);
              reject(error);
            }
          },
          onCancel: () => {
            setSubmitting(false);
            toast({
              title: 'Payment cancelled',
              description: 'You cancelled the Pi payment.',
              variant: 'destructive',
            });
            reject(new Error('Payment cancelled'));
          },
          onError: (error) => {
            setSubmitting(false);
            toast({
              title: 'Payment error',
              description: error.message,
              variant: 'destructive',
            });
            reject(error);
          },
        }
      );
    });
    */
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Store Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This store doesn't exist or is not published yet.
          </p>
          <Button asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = store.primary_color || '#0EA5E9';

  return (
    <>
      {/* Show interstitial ad every 5 product views */}
      <InterstitialAdTrigger actionCount={productViewCount} showEvery={5} delay={1500} />
      
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="border-b border-border sticky top-0 z-50"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 min-w-0">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-display font-bold text-white truncate">
                {store.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <StoreReportModal
                storeId={store.id}
                storeName={store.name}
              />
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-white hover:bg-white/20 flex-shrink-0"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-xs font-bold rounded-full flex items-center justify-center"
                        style={{ color: primaryColor }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Your Cart ({cartCount})</SheetTitle>
                </SheetHeader>

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                        >
                          <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images && item.product.images[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-primary font-bold">
                              {item.product.price.toFixed(2)} π
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-7 h-7"
                              onClick={() => updateQuantity(item.product.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-7 h-7"
                              onClick={() => updateQuantity(item.product.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-destructive"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between text-lg font-bold mb-4">
                        <span>Total:</span>
                        <span style={{ color: primaryColor }}>{cartTotal.toFixed(2)} π</span>
                      </div>
                      
                      {/* Rewarded Ad Button - Earn discount */}
                      <div className="mb-3">
                        <RewardedAdButton
                          onReward={async (adId) => {
                            console.log('User earned reward by watching ad:', adId);
                            toast({ title: '🎉 Discount Applied!', description: 'You earned 5% off for watching the ad!' });
                          }}
                          buttonText="Watch Ad for 5% Off"
                          rewardText="🎉 You earned 5% off!"
                          className="w-full"
                        />
                      </div>
                      
                      <Button
                        className="w-full"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => {
                          setCartOpen(false);
                          setPaymentModalOpen(true);
                        }}
                      >
                        Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      {store.description && (
        <section
          className="py-12"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {store.description}
            </p>
          </div>
        </section>
      )}

      {/* Hero Section */}
      {store.hero_title && (
        <section className="py-16 px-4" style={{ backgroundColor: store.primary_color }}>
          <div className="container mx-auto max-w-4xl text-center text-white">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {store.hero_title}
            </h1>
            {store.hero_subtitle && (
              <p className="text-lg md:text-xl mb-8 opacity-90">
                {store.hero_subtitle}
              </p>
            )}
            {store.hero_button_text && store.hero_button_link && (
              <Button
                size="lg"
                asChild
                className="bg-white text-foreground hover:bg-gray-100"
              >
                <Link to={store.hero_button_link}>
                  {store.hero_button_text}
                </Link>
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Store Features Section */}
      {(store.show_product_reviews || store.enable_wishlist || store.enable_compare || store.show_stock_count || store.show_sold_count) && (
        <section className="py-12 px-4 bg-muted/50 border-y border-border">
          <div className="container mx-auto">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8 text-center">
              Store Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {store.show_product_reviews && (
                <Card className="text-center p-4">
                  <Award className="w-8 h-8 mx-auto mb-2" style={{ color: store.primary_color }} />
                  <h3 className="font-semibold text-foreground">Product Reviews</h3>
                  <p className="text-sm text-muted-foreground mt-1">Customer reviews</p>
                </Card>
              )}
              {store.enable_wishlist && (
                <Card className="text-center p-4">
                  <Heart className="w-8 h-8 mx-auto mb-2" style={{ color: store.primary_color }} />
                  <h3 className="font-semibold text-foreground">Wishlist</h3>
                  <p className="text-sm text-muted-foreground mt-1">Save favorites</p>
                </Card>
              )}
              {store.enable_compare && (
                <Card className="text-center p-4">
                  <Repeat2 className="w-8 h-8 mx-auto mb-2" style={{ color: store.primary_color }} />
                  <h3 className="font-semibold text-foreground">Compare</h3>
                  <p className="text-sm text-muted-foreground mt-1">Compare products</p>
                </Card>
              )}
              {store.show_stock_count && (
                <Card className="text-center p-4">
                  <Package className="w-8 h-8 mx-auto mb-2" style={{ color: store.primary_color }} />
                  <h3 className="font-semibold text-foreground">Stock</h3>
                  <p className="text-sm text-muted-foreground mt-1">Availability shown</p>
                </Card>
              )}
              {store.show_sold_count && (
                <Card className="text-center p-4">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2" style={{ color: store.primary_color }} />
                  <h3 className="font-semibold text-foreground">Popular</h3>
                  <p className="text-sm text-muted-foreground mt-1">Sales count shown</p>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-display font-bold text-foreground mb-8">
          Products
        </h2>

        {products.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products available
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new products!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group cursor-pointer" onClick={() => {
                setSelectedProduct(product);
                setProductViewCount(prev => prev + 1);
              }}>
                <div className="aspect-square bg-secondary overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3 md:pt-4">
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2 hidden sm:block">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span
                        className="font-bold text-base md:text-lg"
                        style={{ color: primaryColor }}
                      >
                        {product.price.toFixed(2)} π
                      </span>
                      {product.compare_at_price && (
                        <span className="text-muted-foreground line-through ml-1 text-xs hidden md:inline">
                          {product.compare_at_price.toFixed(2)} π
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => { e.stopPropagation(); setSelectedProduct(product); setProductViewCount(prev => prev + 1); }}
                        className="px-2 md:px-3"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        style={{ backgroundColor: primaryColor }}
                        onClick={e => { e.stopPropagation(); addToCart(product); }}
                        className="px-2 md:px-3"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={open => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          {selectedProduct && (
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-square bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                {selectedProduct.images && selectedProduct.images[0] ? (
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
              <div className="text-lg font-bold" style={{ color: primaryColor }}>
                {selectedProduct.price.toFixed(2)} π
                {selectedProduct.compare_at_price && (
                  <span className="text-muted-foreground line-through ml-2 text-base">
                    {selectedProduct.compare_at_price.toFixed(2)} π
                  </span>
                )}
              </div>
              {selectedProduct.product_type === 'digital' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium w-fit">
                  Digital Download
                </span>
              )}
              {selectedProduct.description && (
                <p className="text-muted-foreground">{selectedProduct.description}</p>
              )}
              <div className="flex flex-col gap-2">
                <Button style={{ backgroundColor: primaryColor }} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => { 
                    addToCart(selectedProduct); 
                    setSelectedProduct(null); 
                    setPaymentModalOpen(true); 
                  }}
                >
                  Buy Now
                </Button>
                <div className="pt-2 border-t mt-2">
                  <StoreReportModal
                    storeId={store.id}
                    storeName={store.name}
                    productId={selectedProduct.id}
                    productName={selectedProduct.name}
                    variant="inline"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal - Shopify Style */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        cart={cart}
        cartTotal={cartTotal}
        storeName={store.name}
        primaryColor={primaryColor}
        onSubmit={handleSubmitOrder}
        submitting={submitting}
      />

      {/* About Section */}
      {store.about_page && (
        <section className="py-12 px-4 bg-background border-b border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">About Us</h2>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {store.about_page}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {(store.contact_page || store.contact_email || store.contact_phone || store.address) && (
        <section className="py-12 px-4 bg-muted/50 border-b border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8">Contact Us</h2>
            <div className="space-y-4">
              {store.contact_page && (
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-6">
                  {store.contact_page}
                </div>
              )}
              <div className="grid md:grid-cols-3 gap-6">
                {store.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                    <div>
                      <p className="font-medium text-foreground text-sm">Email</p>
                      <a href={`mailto:${store.contact_email}`} className="text-muted-foreground hover:text-foreground transition-colors">
                        {store.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                {store.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                    <div>
                      <p className="font-medium text-foreground text-sm">Phone</p>
                      <a href={`tel:${store.contact_phone}`} className="text-muted-foreground hover:text-foreground transition-colors">
                        {store.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                {store.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                    <div>
                      <p className="font-medium text-foreground text-sm">Address</p>
                      <p className="text-muted-foreground">{store.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Social Media Section */}
      {(store.social_facebook || store.social_instagram || store.social_twitter || store.social_tiktok) && (
        <section className="py-12 px-4 bg-background border-b border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8 text-center">Follow Us</h2>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              {store.social_facebook && (
                <a
                  href={store.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                  title="Follow on Facebook"
                >
                  <Facebook className="w-6 h-6" style={{ color: primaryColor }} />
                </a>
              )}
              {store.social_instagram && (
                <a
                  href={store.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                  title="Follow on Instagram"
                >
                  <Instagram className="w-6 h-6" style={{ color: primaryColor }} />
                </a>
              )}
              {store.social_twitter && (
                <a
                  href={store.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                  title="Follow on Twitter"
                >
                  <Twitter className="w-6 h-6" style={{ color: primaryColor }} />
                </a>
              )}
              {store.social_tiktok && (
                <a
                  href={store.social_tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                  title="Follow on TikTok"
                >
                  <Music className="w-6 h-6" style={{ color: primaryColor }} />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Policies Section */}
      {(store.shipping_policy || store.refund_policy || store.privacy_policy || store.terms_of_service) && (
        <section className="py-12 px-4 bg-muted/50 border-b border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8">Store Policies</h2>
            <div className="space-y-8">
              {store.shipping_policy && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: primaryColor }} />
                    Shipping Policy
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                    {store.shipping_policy}
                  </p>
                </div>
              )}
              {store.refund_policy && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: primaryColor }} />
                    Refund Policy
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                    {store.refund_policy}
                  </p>
                </div>
              )}
              {store.privacy_policy && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: primaryColor }} />
                    Privacy Policy
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                    {store.privacy_policy}
                  </p>
                </div>
              )}
              {store.terms_of_service && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: primaryColor }} />
                    Terms of Service
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                    {store.terms_of_service}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Announcement Bar */}
      {store.show_announcement_bar && store.announcement_text && (
        <section className="py-3 px-4 bg-muted border-b border-border">
          <div className="container mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-foreground">
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
              {store.announcement_link ? (
                <a href={store.announcement_link} className="hover:underline font-medium">
                  {store.announcement_text}
                </a>
              ) : (
                <span>{store.announcement_text}</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Store className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-display font-bold text-foreground">
                {store.name}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
              {store.contact_email && (
                <a
                  href={`mailto:${store.contact_email}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">{store.contact_email}</span>
                </a>
              )}
              {store.contact_phone && (
                <a
                  href={`tel:${store.contact_phone}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">{store.contact_phone}</span>
                </a>
              )}
            </div>
          </div>

          {store.address && (
            <div className="mt-4 flex items-start gap-1 text-sm text-muted-foreground justify-center md:justify-start">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {store.address}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            Powered by{' '}
            <Link to="/" className="font-medium hover:text-foreground">
              Drop Store
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}