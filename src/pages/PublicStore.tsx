import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PaymentModalEnhanced, OrderForm } from '@/components/store/PaymentModalEnhanced';
import { StoreReportModal } from '@/components/store/StoreReportModal';
import { StoreThemeCustomizer } from '@/components/store/StoreThemeCustomizer';
import { createPiPayment, initPiSdk } from '@/lib/pi-sdk';
import { RewardedAdButton } from '@/components/ads/RewardedAdButton';
import { InterstitialAdTrigger } from '@/components/ads/InterstitialAdTrigger';
import { usePiAdNetwork } from '@/hooks/usePiAdNetwork';
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
  Gift,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  checkout_payment_mode?: 'pi_only' | 'manual_only' | 'both' | null;
  manual_pi_wallet_address?: string | null;
  manual_pi_wallet_username?: string | null;
  store_type: string | null;
  owner_id: string;
  // Theme customization fields - Colors
  heading_text_color?: string | null;
  body_text_color?: string | null;
  hero_title_text_color?: string | null;
  hero_subtitle_text_color?: string | null;
  announcement_bar_text_color?: string | null;
  // Theme customization fields - Typography & Layout
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
  variants?: Array<any> | null;
  sku?: string | null;
  weight?: number | null;
  dimensions?: { length: number; width: number; height: number } | null;
}

interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  price?: number;
  inventory_count?: number;
  image_url?: string;
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
  option3_name?: string;
  option3_value?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant | null;
  giftMessage?: string | null;
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
  const [selectedProductVariant, setSelectedProductVariant] = useState<ProductVariant | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [showGiftOptions, setShowGiftOptions] = useState(false);
  const { showInterstitialAd } = usePiAdNetwork();

  useEffect(() => {
    initPiSdk(false); // Mainnet mode for production
    if (slug) {
      fetchStore();
    }
  }, [slug]);

  // Show ad on page visit
  useEffect(() => {
    if (store) {
      showInterstitialAd().catch((err) => {
        console.log('Ad not shown on store page:', err);
      });
    }
  }, [store, showInterstitialAd]);

  // Apply theme colors
  useEffect(() => {
    if (!store) return;
    
    const root = document.documentElement;
    const primary = store?.primary_color || '#0EA5E9';
    const secondary = store?.secondary_color || '#64748B';
    const headingColor = store?.heading_text_color || '#000000';
    const bodyColor = store?.body_text_color || '#333333';
    const heroTitleColor = store?.hero_title_text_color || '#FFFFFF';
    const heroSubtitleColor = store?.hero_subtitle_text_color || '#E5E7EB';
    const announcementColor = store?.announcement_bar_text_color || '#FFFFFF';
    const headingFont = store?.font_heading || 'Inter';
    const bodyFont = store?.font_body || 'Inter';

    console.log('🎨 Applying theme colors:', {
      primary,
      secondary, 
      heading: headingColor,
      body: bodyColor,
      heroTitle: heroTitleColor,
      heroSubtitle: heroSubtitleColor,
      announcement: announcementColor
    });

    // Apply CSS variables for theme colors so shadcn text utilities pick them up
    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--secondary-color', secondary);
    root.style.setProperty('--heading-text-color', headingColor);
    root.style.setProperty('--body-text-color', bodyColor);
    root.style.setProperty('--hero-title-text-color', heroTitleColor);
    root.style.setProperty('--hero-subtitle-text-color', heroSubtitleColor);
    root.style.setProperty('--announcement-bar-text-color', announcementColor);
    root.style.setProperty('--foreground', headingColor);
    root.style.setProperty('--muted-foreground', bodyColor);

    // Apply typography defaults
    root.style.setProperty('--font-heading', headingFont);
    root.style.setProperty('--font-body', bodyFont);

    // Apply theme to document body for global styling
    document.body.style.setProperty('--store-primary', primary);
    document.body.style.setProperty('--store-secondary', secondary);
    document.body.style.setProperty('--store-heading-color', headingColor);
    document.body.style.setProperty('--store-body-color', bodyColor);
  }, [store]);

  const fetchStore = async () => {
    try {
      console.log('🔍 Fetching store data for slug:', slug);
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
      
      // Fetch variants for all products
      if (productsData && productsData.length > 0) {
        const productIds = productsData.map(p => p.id);
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds)
          .order('created_at', { ascending: true });

        if (variantsError) throw variantsError;

        // Map variants to products
        const productsWithVariants = productsData.map(product => ({
          ...product,
          variants: variantsData?.filter(v => v.product_id === product.id) || null,
        }));

        setProducts(productsWithVariants);
      } else {
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, variant?: ProductVariant | null, gift?: string) => {
    setCart((prev) => {
      const variantKey = variant?.id || 'no-variant';
      const existing = prev.find(
        (item) => item.product.id === product.id && (item.selectedVariant?.id || 'no-variant') === variantKey
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && (item.selectedVariant?.id || 'no-variant') === variantKey
            ? { ...item, quantity: item.quantity + 1, giftMessage: gift || item.giftMessage }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant || null, giftMessage: gift || null }];
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

  const handleSubmitOrder = async (
    orderForm: OrderForm,
    paymentMethod: string,
    paymentData?: { manualTxid?: string }
  ) => {
    if (!store || cart.length === 0) return;

    setSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.product.id,
        variant_id: item.selectedVariant?.id || null,
        name: item.product.name,
        price: item.selectedVariant?.price || item.product.price,
        quantity: item.quantity,
        product_type: item.product.product_type,
        digital_file_url: item.product.digital_file_url,
        variant_name: item.selectedVariant?.name || null,
        gift_message: item.giftMessage || null,
      }));

      // Check if any digital products
      const hasDigitalProducts = cart.some(item => item.product.product_type === 'digital');
      const downloadExpiresAt = hasDigitalProducts 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
        : null;

      const createPaidOrder = async (txid: string, paymentId?: string) => {
        const { data: orderData, error: orderError } = await supabase.from('orders').insert({
          store_id: store.id,
          customer_name: orderForm.name.trim(),
          customer_email: orderForm.email.trim(),
          customer_phone: orderForm.phone.trim() || null,
          shipping_address: orderForm.address.trim() || null,
          notes: orderForm.notes.trim() || null,
          items: orderItems,
          total: cartTotal,
          status: 'paid',
          pi_payment_id: paymentId || null,
          pi_txid: txid,
          payout_status: 'pending',
          download_expires_at: downloadExpiresAt,
        }).select('id').single();

        if (orderError) throw orderError;

        if (cartTotal > 0) {
          const platformFee = cartTotal * 0.02;
          const netAmount = cartTotal - platformFee;

          await supabase.from('merchant_sales').insert({
            store_id: store.id,
            order_id: orderData.id,
            owner_id: store.owner_id,
            amount: cartTotal,
            platform_fee: platformFee,
            net_amount: netAmount,
            pi_txid: txid,
            payout_status: 'pending',
          });
        }
      };

      if (cartTotal <= 0) {
        await createPaidOrder('free-order');
      } else if (paymentMethod === 'pi_payment') {
        await new Promise<void>((resolve, reject) => {
          let approvalPassed = false;
          let settled = false;
          const safeResolve = () => {
            if (!settled) {
              settled = true;
              resolve();
            }
          };
          const safeReject = (error: Error) => {
            if (!settled) {
              settled = true;
              reject(error);
            }
          };

          createPiPayment(
            {
              amount: cartTotal,
              memo: `Order from ${store.name}`,
              metadata: {
                store_id: store.id,
                merchant_wallet: store.payout_wallet || '',
                customer_name: orderForm.name.trim(),
                customer_email: orderForm.email.trim(),
                items: orderItems,
              },
            },
            {
              onReadyForServerApproval: async (paymentId) => {
                try {
                  const { data, error } = await supabase.functions.invoke('pi-payment-approve', {
                    body: { paymentId }
                  });

                  if (error || !data?.success) {
                    throw new Error('Payment approval failed');
                  }

                  approvalPassed = true;
                } catch (error) {
                  safeReject(error instanceof Error ? error : new Error('Payment approval failed'));
                }
              },
              onReadyForServerCompletion: async (paymentId, txid) => {
                try {
                  if (!approvalPassed) {
                    throw new Error('Payment is not approved yet. Cannot complete checkout.');
                  }

                  const { data, error } = await supabase.functions.invoke('pi-payment-complete', {
                    body: { paymentId, txid }
                  });

                  if (error || !data?.success) {
                    throw new Error('Payment completion failed');
                  }

                  await createPaidOrder(txid, paymentId);
                  safeResolve();
                } catch (error) {
                  safeReject(error instanceof Error ? error : new Error('Failed to complete payment'));
                }
              },
              onCancel: () => {
                safeReject(new Error('Payment cancelled by user'));
              },
              onError: (error) => {
                safeReject(error instanceof Error ? error : new Error('Payment failed'));
              },
            }
          );
        });
      } else if (paymentMethod === 'manual_wallet') {
        const manualTxid = paymentData?.manualTxid?.trim();
        const merchantWallet = (store.manual_pi_wallet_address || store.payout_wallet || '').trim();

        if (!manualTxid) {
          throw new Error('Manual transaction ID is required');
        }
        if (!merchantWallet) {
          throw new Error('Merchant manual wallet is not configured');
        }

        const { data, error } = await supabase.functions.invoke('verify-pi-transaction', {
          body: {
            transaction_hash: manualTxid,
            expected_amount: cartTotal,
            expected_recipient: merchantWallet,
            auto_release: false,
          },
        });

        if (error || !data?.verified) {
          throw new Error(data?.error || 'Manual payment verification failed');
        }

        await createPaidOrder(manualTxid);
      } else {
        throw new Error('Unsupported payment method');
      }

      toast({
        title: 'Payment successful!',
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

  const primaryColor = store?.primary_color || '#0EA5E9';
  const secondaryColor = store?.secondary_color || '#64748B';
  const headingTextColor = store?.heading_text_color || '#000000';
  const bodyTextColor = store?.body_text_color || '#333333';
  const heroTitleTextColor = store?.hero_title_text_color || '#FFFFFF';
  const heroSubtitleTextColor = store?.hero_subtitle_text_color || '#E5E7EB';
  const announcementBarTextColor = store?.announcement_bar_text_color || '#FFFFFF';
  const headingFont = store?.font_heading || 'Inter';
  const bodyFont = store?.font_body || 'Inter';
  const checkoutPaymentMode = store.checkout_payment_mode || 'pi_only';
  const manualWalletAddress = store.manual_pi_wallet_address || store.payout_wallet || '';
  const checkoutPaymentMethods = [
    ...(checkoutPaymentMode === 'pi_only' || checkoutPaymentMode === 'both'
      ? [{
          id: 'pi',
          method_type: 'pi_payment' as const,
          display_name: 'Pi Payment',
          instructions: 'Pay instantly with Pi Network',
        }]
      : []),
    ...((checkoutPaymentMode === 'manual_only' || checkoutPaymentMode === 'both') && manualWalletAddress
      ? [{
          id: 'manual',
          method_type: 'manual_wallet' as const,
          wallet_address: manualWalletAddress,
          merchant_username: store.manual_pi_wallet_username || undefined,
          display_name: 'Manual Pi Transfer',
          instructions: 'Scan QR or copy wallet address and send Pi manually',
        }]
      : []),
  ];

  return (
    <>
      <div className="min-h-screen bg-background overflow-x-hidden" style={{ color: bodyTextColor, fontFamily: bodyFont }}>
        {/* Announcement Bar - Top Priority */}
        {store.show_announcement_bar && store.announcement_text && (
          <div className="py-3 px-4 bg-muted border-b border-border">
            <div className="container mx-auto">
              <div className="flex items-center justify-center gap-2 text-sm font-medium flex-wrap" style={{ color: announcementBarTextColor }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: announcementBarTextColor }} />
                {store.announcement_link ? (
                  <a href={store.announcement_link} className="hover:underline" style={{ color: announcementBarTextColor }}>
                    {store.announcement_text}
                  </a>
                ) : (
                  <span>{store.announcement_text}</span>
                )}
              </div>
            </div>
          </div>
        )}

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

      {/* Store Description Banner */}
      {store.description && (
        <section
          className="py-8 px-4 border-b border-border"
          style={{ backgroundColor: `${primaryColor}08` }}
        >
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed" style={{ color: bodyTextColor, fontFamily: bodyFont }}>
              {store.description}
            </p>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════ */}
      {/* MAIN STORE SECTIONS */}
      {/* ════════════════════════════════════════ */}

      {/* Hero Section */}
      {store.hero_title && (
        <section 
          className="relative py-24 px-4 overflow-hidden"
          style={{ backgroundColor: store.banner_url ? 'transparent' : store.primary_color }}
        >
          {store.banner_url && (
            <div className="absolute inset-0">
              <img 
                src={store.banner_url} 
                alt="Hero Background" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="container mx-auto max-w-4xl relative z-10 text-center">
            <h1 
              className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight"
              style={{ color: heroTitleTextColor, fontFamily: headingFont }}
            >
              {store.hero_title}
            </h1>
            {store.hero_subtitle && (
              <p 
                className="text-xl md:text-2xl mb-10 font-light"
                style={{ color: heroSubtitleTextColor, fontFamily: bodyFont }}
              >
                {store.hero_subtitle}
              </p>
            )}
            {store.hero_button_text && store.hero_button_link && (
              <Button
                size="lg"
                asChild
                className="bg-white text-foreground hover:bg-gray-100 font-semibold"
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
        <section className="py-16 px-4 bg-muted/30 border-b border-border">
          <div className="container mx-auto">
            <h2 
              className="text-3xl md:text-4xl font-display font-bold text-foreground mb-12 text-center"
              style={{ color: headingTextColor, fontFamily: headingFont }}
            >
              Why Shop With Us
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
              {store.show_product_reviews && (
                <Card className="text-center p-6 border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <Award className="w-10 h-10 mx-auto mb-3" style={{ color: store.primary_color }} />
                  <h3 className="font-display font-semibold text-foreground text-sm md:text-base">Product Reviews</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Verified buyer feedback</p>
                </Card>
              )}
              {store.enable_wishlist && (
                <Card className="text-center p-6 border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <Heart className="w-10 h-10 mx-auto mb-3" style={{ color: store.primary_color }} />
                  <h3 className="font-display font-semibold text-foreground text-sm md:text-base">Wishlist</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Save your favorites</p>
                </Card>
              )}
              {store.enable_compare && (
                <Card className="text-center p-6 border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <Repeat2 className="w-10 h-10 mx-auto mb-3" style={{ color: store.primary_color }} />
                  <h3 className="font-display font-semibold text-foreground text-sm md:text-base">Compare</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Side-by-side comparison</p>
                </Card>
              )}
              {store.show_stock_count && (
                <Card className="text-center p-6 border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <Package className="w-10 h-10 mx-auto mb-3" style={{ color: store.primary_color }} />
                  <h3 className="font-display font-semibold text-foreground text-sm md:text-base">Real Stock</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Live inventory shown</p>
                </Card>
              )}
              {store.show_sold_count && (
                <Card className="text-center p-6 border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3" style={{ color: store.primary_color }} />
                  <h3 className="font-display font-semibold text-foreground text-sm md:text-base">Popular Items</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Trusted by customers</p>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Products Section - Main Shop */}
      <main className="container mx-auto px-4 py-16 lg:py-20">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 
                className="text-3xl md:text-4xl font-display font-bold"
                style={{ color: headingTextColor, fontFamily: headingFont }}
              >
                Shop Products
              </h2>
              <p className="mt-2" style={{ color: bodyTextColor }}>
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to={`/shop/${store.slug}`}>View All</Link>
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                No products available
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                We're working on our product catalog. Check back soon for new and exciting items!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => {
                setSelectedProduct(product);
              }}>
                <div className="aspect-square bg-secondary overflow-hidden relative">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <div 
                      className="absolute top-3 right-3 px-2 py-1 rounded text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Sale
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 
                    className="font-semibold mb-2 text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors"
                    style={{ color: headingTextColor, fontFamily: headingFont }}
                  >
                    {product.name}
                  </h3>
                  {product.description && (
                    <p 
                      className="text-xs md:text-sm mb-3 line-clamp-2 hidden sm:block"
                      style={{ color: bodyTextColor, fontFamily: bodyFont }}
                    >
                      {product.description}
                    </p>
                  )}
                  
                  {/* Price Section */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-bold text-lg md:text-xl"
                        style={{ color: primaryColor }}
                      >
                        {product.price.toFixed(2)} π
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-muted-foreground line-through text-xs md:text-sm">
                          {product.compare_at_price.toFixed(2)} π
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Status */}
                  {store.show_stock_count && product.inventory_count !== null && (
                    <div className="text-xs mb-3">
                      {product.inventory_count > 10 ? (
                        <span className="text-green-600 font-medium">In Stock</span>
                      ) : product.inventory_count > 0 ? (
                        <span className="text-amber-600 font-medium">Only {product.inventory_count} left</span>
                      ) : (
                        <span className="text-destructive font-medium">Out of Stock</span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={e => { e.stopPropagation(); setSelectedProduct(product); }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      style={{ backgroundColor: primaryColor }}
                      onClick={e => { e.stopPropagation(); addToCart(product); }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={open => {
        if (!open) {
          setSelectedProduct(null);
          setSelectedProductVariant(null);
          setGiftMessage('');
          setShowGiftOptions(false);
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Product details and purchase options
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col gap-4">
                <div className="w-full aspect-square bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                  {selectedProduct.images && selectedProduct.images[0] ? (
                    <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="text-lg font-bold" style={{ color: primaryColor }}>
                  {(selectedProductVariant?.price || selectedProduct.price).toFixed(2)} π
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
                  <p className="text-muted-foreground text-sm">{selectedProduct.description}</p>
                )}
              {/* Product Variants */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-medium">Options:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedProductVariant(variant)}
                        className={`p-2 text-xs border rounded transition-colors ${
                          selectedProductVariant?.id === variant.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {variant.name}
                        {variant.price && variant.price !== selectedProduct.price && (
                          <div className="text-xs text-muted-foreground">{variant.price.toFixed(2)} π</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gift Message Option */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowGiftOptions(!showGiftOptions)}
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  {showGiftOptions ? 'Hide' : 'Add'} Gift Message
                </button>
                {showGiftOptions && (
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    className="w-full mt-2 p-2 text-sm border border-border rounded resize-none"
                    rows={3}
                    maxLength={200}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2 border-t pt-4">
                <Button 
                  style={{ backgroundColor: primaryColor }} 
                  onClick={() => { 
                    addToCart(selectedProduct, selectedProductVariant, giftMessage);
                    setSelectedProduct(null);
                    setSelectedProductVariant(null);
                    setGiftMessage('');
                    setShowGiftOptions(false);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => { 
                    addToCart(selectedProduct, selectedProductVariant, giftMessage);
                    setSelectedProduct(null);
                    setSelectedProductVariant(null);
                    setGiftMessage('');
                    setShowGiftOptions(false);
                    setPaymentModalOpen(true); 
                  }}
                >
                  Buy Now
                </Button>
                <div className="pt-2 border-t">
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
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal - Shopify Style */}
      <PaymentModalEnhanced
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        cart={cart}
        cartTotal={cartTotal}
        storeId={store.id}
        storeName={store.name}
        primaryColor={primaryColor}
        merchantWallet={manualWalletAddress}
        merchantUsername={store.manual_pi_wallet_username || undefined}
        paymentMethods={checkoutPaymentMethods}
        includeAdditionalFees={false}
        onSubmit={handleSubmitOrder}
        submitting={submitting}
      />

      {/* ════════════════════════════════════════ */}
      {/* MERCHANT INFORMATION SECTIONS */}
      {/* ════════════════════════════════════════ */}

      {/* About Section */}
      {store.about_page && (
        <section className="py-16 px-4 bg-background border-b border-border">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm border border-border">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">About Our Store</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                  {store.about_page}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {(store.contact_page || store.contact_email || store.contact_phone || store.address) && (
        <section className="py-16 px-4 bg-muted/30 border-b border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-12 text-center">Get in Touch</h2>
            <div className="space-y-8">
              {store.contact_page && (
                <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {store.contact_page}
                  </p>
                </div>
              )}
              {(store.contact_email || store.contact_phone || store.address) && (
                <div className="grid md:grid-cols-3 gap-6">
                  {store.contact_email && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-border text-center">
                      <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
                      <h3 className="font-semibold text-foreground mb-2">Email</h3>
                      <a href={`mailto:${store.contact_email}`} className="text-muted-foreground hover:text-foreground transition-colors break-all text-sm">
                        {store.contact_email}
                      </a>
                    </div>
                  )}
                  {store.contact_phone && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-border text-center">
                      <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
                      <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                      <a href={`tel:${store.contact_phone}`} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                        {store.contact_phone}
                      </a>
                    </div>
                  )}
                  {store.address && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-border text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
                      <h3 className="font-semibold text-foreground mb-2">Address</h3>
                      <p className="text-muted-foreground text-sm">{store.address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Social Media Section */}
      {(store.social_facebook || store.social_instagram || store.social_twitter || store.social_tiktok) && (
        <section className="py-16 px-4 bg-background border-b border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-12 text-center">Connect With Us</h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {store.social_facebook && (
                <a
                  href={store.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  title="Follow on Facebook"
                >
                  <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors duration-300">
                    <Facebook className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap">Facebook</span>
                </a>
              )}
              {store.social_instagram && (
                <a
                  href={store.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  title="Follow on Instagram"
                >
                  <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors duration-300">
                    <Instagram className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap">Instagram</span>
                </a>
              )}
              {store.social_twitter && (
                <a
                  href={store.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  title="Follow on Twitter"
                >
                  <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors duration-300">
                    <Twitter className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap">Twitter</span>
                </a>
              )}
              {store.social_tiktok && (
                <a
                  href={store.social_tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  title="Follow on TikTok"
                >
                  <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors duration-300">
                    <Music className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap">TikTok</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════ */}
      {/* POLICIES & LEGAL SECTION */}
      {/* ════════════════════════════════════════ */}

      {/* Policies Section */}
      {(store.shipping_policy || store.refund_policy || store.privacy_policy || store.terms_of_service) && (
        <section className="py-16 px-4 bg-muted/30 border-b border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-12 text-center">Store Policies</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {store.shipping_policy && (
                <AccordionItem value="shipping" className="bg-white rounded-lg border border-border shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <FileText className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-lg font-display font-semibold text-foreground">Shipping Policy</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {store.shipping_policy}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
              {store.refund_policy && (
                <AccordionItem value="refund" className="bg-white rounded-lg border border-border shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <FileText className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-lg font-display font-semibold text-foreground">Refund & Return Policy</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {store.refund_policy}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
              {store.privacy_policy && (
                <AccordionItem value="privacy" className="bg-white rounded-lg border border-border shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <FileText className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-lg font-display font-semibold text-foreground">Privacy Policy</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {store.privacy_policy}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
              {store.terms_of_service && (
                <AccordionItem value="terms" className="bg-white rounded-lg border border-border shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <FileText className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-lg font-display font-semibold text-foreground">Terms of Service</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {store.terms_of_service}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
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
