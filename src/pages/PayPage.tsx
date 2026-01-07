import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Zap, CheckCircle, XCircle, Loader2, Shield, RefreshCw, ShoppingCart, CreditCard, Download, ExternalLink, User, Mail, Copy, AlertTriangle, Gift, Users, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';
import { FloatingAISupport } from '@/components/FloatingAISupport';

interface PaymentLink {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  slug: string;
  merchant_id: string;
  payment_type: string;
  redirect_url: string | null;
  cancel_redirect_url?: string | null;
  checkout_image?: string | null;
  content_file: string | null;
  access_type: string;
  pricing_type?: string;
  checkout_template?: string;
  enable_waitlist?: boolean;
  ask_questions?: boolean;
  checkout_questions?: unknown;
  stock?: number | null;
  is_unlimited_stock?: boolean;
  min_amount?: number | null;
  suggested_amounts?: number[] | null;
  merchants: {
    business_name: string | null;
    pi_username: string | null;
    wallet_address: string | null;
  };
  // Checkout-link specific (optional)
  currency?: string;
  category?: string;
  features?: string[];
  is_checkout_link?: boolean;
  link?: string;
  qrData?: string;
}

interface PiUser {
  uid: string;
  username: string;
  wallet_address?: string;
}

type PaymentStatus = 'idle' | 'authenticating' | 'awaiting_email' | 'processing' | 'verifying' | 'completed' | 'cancelled' | 'error';

const paymentTypeIcons = {
  one_time: CreditCard,
  recurring: RefreshCw,
  checkout: ShoppingCart,
};

export default function PayPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [merchantUsername, setMerchantUsername] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [linkImage, setLinkImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [checkoutResponses, setCheckoutResponses] = useState<Record<number, string>>({});
  const [waitlistEmail, setWaitlistEmail] = useState('');

  useEffect(() => {
    // Check if running in Pi Browser (user agent fallback + Pi SDK check)
    if (typeof window !== 'undefined') {
      const ua = window.navigator?.userAgent || '';
      const hasPiSdk = Boolean((window as any).Pi);
      const inPiBrowser = hasPiSdk || ua.includes('PiBrowser');
      setIsPiBrowser(inPiBrowser);
    }
    // Check for image param in URL
    const params = new URLSearchParams(window.location.search);
    const imageParam = params.get('image');
    if (imageParam) {
      setLinkImage(decodeURIComponent(imageParam));
    }
    if (slug) {
      fetchPaymentLink();
    }
  }, [slug]);

  // Fetch merchant username separately
  useEffect(() => {
    const fetchMerchantUsername = async () => {
      if (!paymentLink?.merchant_id) {
        console.log('No merchant_id available');
        return;
      }

      try {
        // First try to get from merchants table
        const { data, error } = await supabase
          .from('merchants')
          .select('pi_username')
          .eq('id', paymentLink.merchant_id)
          .maybeSingle();

        if (data?.pi_username) {
          console.log('✅ Merchant username found in DB:', data.pi_username);
          setMerchantUsername(data.pi_username);
          return;
        }

        // Fallback: check if paymentLink has merchants.pi_username
        if (paymentLink.merchants?.pi_username) {
          console.log('✅ Merchant username found in link object:', paymentLink.merchants.pi_username);
          setMerchantUsername(paymentLink.merchants.pi_username);
          return;
        }

        // Final fallback: get from localStorage if merchant_id matches current user
        const storedUser = localStorage.getItem('pi_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.uid === paymentLink.merchant_id) {
              console.log('✅ Using stored user username:', user.username);
              setMerchantUsername(user.username);
              return;
            }
          } catch (e) {
            console.warn('Could not parse stored user:', e);
          }
        }

        console.warn('⚠️ Could not determine merchant username for merchant_id:', paymentLink.merchant_id);
      } catch (error) {
        console.error('Error fetching merchant username:', error);
      }
    };

    fetchMerchantUsername();
  }, [paymentLink?.merchant_id, paymentLink?.merchants?.pi_username]);

  const fetchPaymentLink = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching payment link for slug:', slug);
      
      // 1) Fetch payment_links without merchant join (we use piUser.uid as merchant_id)
      const { data: payData, error: payError } = await supabase
        .from('payment_links')
        .select('*')
        .eq('slug', slug)
        .maybeSingle() as { data: any; error: any };

      if (payError) {
        console.error('payment_links lookup error:', payError.message);
      }

      if (payData) {
        // Fetch merchant info separately if merchant_id exists
        let merchantInfo = {
          business_name: null,
          pi_username: null,
          wallet_address: null,
        };

        if (payData.merchant_id) {
          const { data: merchantData } = await supabase
            .from('merchants')
            .select('business_name, pi_username, wallet_address')
            .eq('id', payData.merchant_id)
            .maybeSingle();

          if (merchantData) {
            merchantInfo = merchantData;
            // Set merchant username immediately if found
            if (merchantData.pi_username) {
              console.log('✅ Setting merchant username from DB:', merchantData.pi_username);
              setMerchantUsername(merchantData.pi_username);
            }
          }
        }

        const linkData = {
          ...payData,
          merchants: merchantInfo
        };
        setPaymentLink(linkData as any);
        
        // Set checkout image if present
        if (payData.checkout_image) {
          setLinkImage(payData.checkout_image);
        }
        
        // Increment views
        supabase.rpc('increment_views', { link_id: payData.id });
        console.log('✅ Payment link loaded:', payData.slug, 'by', merchantInfo.pi_username);
        return;
      }

      // 2) Try checkout_links table (fallback for legacy checkout links)
      const { data: checkoutData, error: checkoutError } = await supabase
        .from('checkout_links')
        .select('*')
        .eq('slug', slug)
        .maybeSingle() as { data: any; error: any };

      if (checkoutError) {
        console.error('checkout_links lookup error:', checkoutError.message);
      }

      if (checkoutData) {
        const checkout = checkoutData;
        
        // Fetch merchant info for checkout link too
        let merchantInfo = {
          business_name: null,
          pi_username: null,
          wallet_address: null,
        };

        if (checkout.merchant_id) {
          const { data: merchantData } = await supabase
            .from('merchants')
            .select('business_name, pi_username, wallet_address')
            .eq('id', checkout.merchant_id)
            .maybeSingle();

          if (merchantData) {
            merchantInfo = merchantData;
            // Set merchant username immediately if found
            if (merchantData.pi_username) {
              console.log('✅ Setting merchant username from checkout DB:', merchantData.pi_username);
              setMerchantUsername(merchantData.pi_username);
            }
          }
        }

        setPaymentLink({
          id: checkout.id,
          title: checkout.title,
          description: checkout.description,
          amount: checkout.amount,
          slug: checkout.slug,
          merchant_id: checkout.merchant_id,
          payment_type: 'checkout',
          redirect_url: checkout.redirect_after_checkout || null,
          cancel_redirect_url: checkout.cancel_redirect_url || null,
          checkout_image: checkout.checkout_image || null,
          content_file: null,
          access_type: checkout.expire_access ? 'expires' : 'permanent',
          pricing_type: 'one_time',
          enable_waitlist: checkout.add_waitlist || false,
          ask_questions: checkout.ask_questions || false,
          checkout_questions: null,
          stock: checkout.stock || null,
          is_unlimited_stock: checkout.stock === null || checkout.stock === 0,
          min_amount: null,
          suggested_amounts: null,
          merchants: merchantInfo,
          currency: checkout.currency || 'Pi',
          category: checkout.category,
          features: checkout.features || [],
          is_checkout_link: true,
        } as PaymentLink);
        
        // Set checkout image if present
        if (checkout.checkout_image) {
          setLinkImage(checkout.checkout_image);
        }
        
        // Increment views for checkout links too
        const { error: viewError } = await supabase
          .from('checkout_links')
          .update({ views: (checkout.views || 0) + 1 })
          .eq('id', checkout.id);
        
        if (viewError) {
          console.warn('Failed to increment checkout link views:', viewError);
        }
        
        console.log('✅ Checkout link loaded:', checkout.slug);
        return;
      }

      // 3) Link not found
      console.warn('❌ Payment link not found for slug:', slug);

    } catch (error) {
      console.error('Error fetching payment link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithPi = async () => {
    if (!isPiBrowser) {
      toast.error('Please open this payment link in Pi Browser to continue.');
      return false;
    }

    setPaymentStatus('authenticating');
    try {
      console.log('🔐 Starting Pi authentication for payment...');
      const Pi = (window as any).Pi;
      
      // Pi SDK is already initialized in AuthContext - do not re-initialize
      const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
      console.log('💳 Using Pi SDK with config:', { sandbox: sandboxMode, mainnet: !sandboxMode });
      
      const scopes = ['username', 'payments', 'wallet_address'];
      console.log('📋 Requesting authentication scopes:', scopes);
      
      const authResult = await Pi.authenticate(scopes, (payment: any) => {
        // Handle incomplete payment as per Pi documentation
        console.log('⚠️ Incomplete payment found:', payment);
        toast.info('You have an incomplete payment. Please complete it first.');
      });

      if (authResult) {
        console.log('✅ Pi authentication successful for payment', {
          username: authResult.user.username,
          uid: authResult.user.uid,
          hasWalletAddress: !!authResult.user.wallet_address
        });
        
        setPiUser({
          uid: authResult.user.uid,
          username: authResult.user.username,
          wallet_address: authResult.user.wallet_address,
        });
        toast.success(`Welcome, @${authResult.user.username}!`);
        
        // If content file exists, ask for email
        if (paymentLink?.content_file) {
          setPaymentStatus('awaiting_email');
        } else {
          setPaymentStatus('idle');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Pi authentication error:', error);
      toast.error('Authentication failed. Please try again.');
      setPaymentStatus('error');
      return false;
    }
  };

  const handlePayment = async () => {
    if (!paymentLink) return;

    // Require Pi authentication first
    if (!piUser) {
      const authenticated = await authenticateWithPi();
      if (!authenticated) return;
      // If awaiting email, don't proceed to payment yet
      if (paymentLink.content_file) return;
    }

    // If there's a content file and we're awaiting email, validate email first
    if (paymentLink.content_file && paymentStatus === 'awaiting_email') {
      if (!buyerEmail || !buyerEmail.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setPaymentStatus('processing');

    try {
      if (isPiBrowser && (window as any).Pi) {
        console.log('🚀 Processing Pi payment for payment link:', paymentLink.title);
        const Pi = (window as any).Pi;
        
        // Pi SDK is already initialized in AuthContext with correct mainnet config
        const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
        console.log('💳 Creating payment with config:', { sandbox: sandboxMode, mainnet: !sandboxMode });

        const paymentAmount = paymentLink.pricing_type === 'free'
          ? 0.01 // Pi Network minimum
          : paymentLink.pricing_type === 'donation' && customAmount 
          ? parseFloat(customAmount) * 1.02 // Add 2% platform fee for donations
          : paymentLink.pricing_type === 'donation'
          ? paymentLink.amount * 1.02 // Add 2% platform fee for donation with set amount
          : paymentLink.amount; // Amount already includes platform fee for paid links

        const paymentData = {
          amount: paymentAmount,
          memo: `Payment for: ${paymentLink.title}`,
          metadata: {
            payment_link_id: paymentLink.id,
            merchant_id: paymentLink.merchant_id,
            payer_username: piUser?.username,
            buyer_email: buyerEmail || null,
            is_checkout_link: paymentLink.is_checkout_link || false,
            checkout_category: paymentLink.category || null,
            payment_type: paymentLink.payment_type || 'payment_link',
            is_subscription: paymentLink.payment_type === 'recurring',
            link_title: paymentLink.title,
          },
        };

        console.log('💳 Creating payment:', paymentData);

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              console.log('📡 Approving payment with Pi Network API...');
              const response = await supabase.functions.invoke('approve-payment', {
                body: { 
                  paymentId, 
                  paymentLinkId: paymentLink.id,
                  isCheckoutLink: paymentLink.is_checkout_link || false,
                  isSubscription: paymentData.metadata.is_subscription
                },
              });

              if (response.error) {
                console.error('❌ Approval failed:', response.error);
                throw response.error;
              }
              console.log('✅ Payment approved by Pi Network');
            } catch (error) {
              console.error('❌ Error approving payment:', error);
              setPaymentStatus('error');
              toast.error('Payment approval failed. Please try again.');
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              console.log('🔄 Completing payment on Pi Network...', { paymentId, txid });
              
              // Complete the payment with Pi Network and track merchant earnings
              const response = await supabase.functions.invoke('complete-payment', {
                body: { 
                  paymentId, 
                  txid, 
                  paymentLinkId: paymentLink.id,
                  payerUsername: piUser?.username,
                  buyerEmail: buyerEmail || null,
                  amount: paymentAmount,
                  isCheckoutLink: paymentLink.is_checkout_link || false,
                  isSubscription: paymentData.metadata.is_subscription,
                  paymentType: paymentLink.payment_type,
                },
              });
              
              if (response.error) {
                console.error('❌ Payment completion failed:', response.error);
                throw response.error;
              }
              
              console.log('✅ Payment completed on Pi Network:', response.data);

              // Store transaction ID for email sending
              if (response.data?.transactionId) {
                setTransactionId(response.data.transactionId);
              }

              // Handle content access after payment
              if (paymentLink.content_file) {
                try {
                  // Get signed URL for the content file (24 hour expiry for email)
                  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                    .from('payment-content')
                    .createSignedUrl(paymentLink.content_file, 86400); // 24 hours

                  if (signedUrlError) {
                    console.error('❌ Error creating signed URL:', signedUrlError);
                    toast.error('Failed to generate download link');
                  } else if (signedUrlData?.signedUrl) {
                    // Validate the signed URL
                    const downloadUrl = signedUrlData.signedUrl;
                    console.log('✅ Content download URL generated:', downloadUrl);
                    setContentUrl(downloadUrl);
                    
                    // Send email with download link if email was provided
                    if (buyerEmail && transactionId) {
                      try {
                        await supabase.functions.invoke('send-download-email', {
                          body: {
                            transactionId: transactionId,
                            buyerEmail: buyerEmail,
                            paymentLinkId: paymentLink.id,
                            downloadUrl: downloadUrl,
                            productTitle: paymentLink.title,
                          }
                        });
                        toast.success('Download link sent to your email!');
                      } catch (error) {
                        console.error('Error sending email:', error);
                      }
                    }
                  }
                } catch (error) {
                  console.error('❌ Error handling content file:', error);
                  toast.error('Failed to process downloadable content');
                }
              }

              setPaymentStatus('completed');
              toast.success('Payment completed successfully!');

              // Handle redirect if specified
              if (paymentLink.redirect_url) {
                toast.success('Payment successful! Redirecting...');
                setTimeout(() => {
                  window.location.href = paymentLink.redirect_url!;
                }, 2000);
              }
            } catch (error) {
              console.error('Error completing payment:', error);
              setPaymentStatus('error');
              toast.error('Payment completion failed');
            }
          },
          onCancel: (paymentId: string) => {
            console.log('Payment cancelled:', paymentId);
            setPaymentStatus('cancelled');
            toast.error('Payment was cancelled');
            
            // Redirect to cancel URL if specified
            if (paymentLink.cancel_redirect_url) {
              setTimeout(() => {
                window.location.href = paymentLink.cancel_redirect_url!;
              }, 2000);
            }
          },
          onError: (error: any, payment: any) => {
            console.error('Payment error:', error, payment);
            setPaymentStatus('error');
            toast.error('Payment failed. Please try again.');
            
            // Redirect to cancel URL on error if specified
            if (paymentLink.cancel_redirect_url) {
              setTimeout(() => {
                window.location.href = paymentLink.cancel_redirect_url!;
              }, 2000);
            }
          },
        };

        await Pi.createPayment(paymentData, callbacks);
      } else {
        toast.error('Payments must be completed in Pi Browser. Copy the link and open it there.');
        setPaymentStatus('idle');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error('Payment failed. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Link Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This payment link doesn't exist or has been deactivated.
            </p>
            <Button asChild>
              <Link to="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TypeIcon = paymentTypeIcons[paymentLink.payment_type as keyof typeof paymentTypeIcons] || CreditCard;
  const displayCurrency = paymentLink.currency || 'Pi';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 overflow-x-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="max-w-md w-full border shadow-lg">
        <CardHeader className="text-center bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="DropPay Logo" 
                className="w-10 h-10 rounded-xl object-cover"
                onError={(e) => {
                  // Fallback if logo doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold text-foreground">DropPay</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(window.location.href)}
              title="Copy payment link"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <TypeIcon className="w-4 h-4" />
            <span className="capitalize">{paymentLink.payment_type.replace('_', ' ')} Payment</span>
          </div>
          <CardTitle className="text-2xl">{paymentLink.title}</CardTitle>
          {paymentLink.description && (
            <CardDescription>{paymentLink.description}</CardDescription>
          )}
          {paymentLink.features && paymentLink.features.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {paymentLink.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
          {linkImage && (
            <div className="flex justify-center mt-4">
              <img src={linkImage} alt="Link" className="rounded max-h-40" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentStatus === 'completed' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-4">
                Thank you for your payment.
              </p>

              {contentUrl && (
                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-4">
                  <h3 className="font-medium text-foreground">Your Content</h3>
                  
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm text-amber-600 font-medium">
                          Download not available in Pi Browser
                        </p>
                        <p className="text-xs text-amber-600/80">
                          Pi Browser doesn't support file downloads. Please copy the link below and paste it in another browser.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Download Link</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={contentUrl} 
                        readOnly 
                        className="text-xs font-mono"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(contentUrl)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <a href={contentUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Open Download Link
                    </a>
                  </Button>

                  {buyerEmail && (
                    <p className="text-xs text-muted-foreground text-center">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Download link also sent to {buyerEmail}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : paymentStatus === 'cancelled' ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Cancelled
              </h2>
              <p className="text-muted-foreground mb-4">
                Your payment was not completed.
              </p>
              <Button onClick={() => setPaymentStatus('idle')}>Try Again</Button>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Failed
              </h2>
              <p className="text-muted-foreground mb-4">
                Something went wrong. Please try again.
              </p>
              <Button onClick={() => setPaymentStatus('idle')}>Try Again</Button>
            </div>
          ) : (
            <>
              {/* Pi Browser Warning */}
              {!isPiBrowser && (
                <div className="p-4 rounded-lg bg-orange-500/15 border-2 border-orange-500/40 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0 animate-pulse" />
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="font-bold text-lg text-orange-900 dark:text-orange-200">
                          ⚠️ Payments Only Work in Pi Browser
                        </h3>
                        <p className="text-sm text-orange-800 dark:text-orange-300 mt-2 font-semibold">
                          This payment link <strong>MUST</strong> be opened in the <strong>Pi Browser</strong> app to process payment.
                        </p>
                      </div>
                      
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full justify-center font-bold text-base py-2 bg-orange-600 hover:bg-orange-700"
                        onClick={() => copyToClipboard(window.location.href)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Payment Link for Pi Browser
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* User Info */}
              {piUser && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">@{piUser.username}</p>
                    <p className="text-xs text-muted-foreground">Authenticated with Pi</p>
                  </div>
                </div>
              )}

              {/* Email Input for file delivery */}
              {piUser && paymentLink.content_file && (
                <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <Label htmlFor="buyerEmail" className="font-medium">
                      Email for Download Link
                    </Label>
                  </div>
                  <Input
                    id="buyerEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}

              {/* Amount Display */}
              {paymentLink.pricing_type === 'donation' ? (
                <div className="space-y-4 p-6 rounded-2xl bg-secondary/50">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Choose Your Donation Amount</p>
                    <p className="text-2xl font-bold text-foreground">
                      {customAmount ? `π ${Number(customAmount).toFixed(2)}` : `π ${Number(paymentLink.min_amount || 0).toFixed(2)}`}
                    </p>
                  </div>

                  {/* Custom Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="customAmount" className="text-sm font-medium">Enter Amount:</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">π</span>
                      <Input
                        id="customAmount"
                        type="number"
                        placeholder={`Minimum ${Number(paymentLink.min_amount || 0).toFixed(2)}`}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-8 h-12 text-lg"
                        min={paymentLink.min_amount || 0}
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {/* Platform Fee Breakdown for Donations */}
                  {(customAmount && parseFloat(customAmount) > 0) && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-blue-600">
                          💡 Platform Fee Breakdown (2% for maintenance & future features)
                        </p>
                        <PlatformFeeModal>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            Why fees?
                          </Button>
                        </PlatformFeeModal>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Your donation:</span>
                          <span className="font-medium">π {Number(customAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform fee (2%):</span>
                          <span className="font-medium text-blue-600">+π {(Number(customAmount) * 0.02).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-1.5 mt-1.5">
                          <span className="font-semibold">Total you pay:</span>
                          <span className="font-bold text-foreground">π {(Number(customAmount) * 1.02).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 rounded-2xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    {paymentLink.pricing_type === 'free' ? 'Price' : 'Amount to Pay'}
                  </p>
                  <p className="text-5xl font-bold text-foreground">
                    {paymentLink.pricing_type === 'free' || paymentLink.amount === 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <Gift className="w-10 h-10 text-primary" />
                        Free
                      </span>
                    ) : (
                      `${displayCurrency === 'Pi' ? 'π' : displayCurrency} ${Number(paymentLink.amount).toFixed(2)}`
                    )}
                  </p>
                  {paymentLink.payment_type === 'recurring' && paymentLink.amount > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">per month</p>
                  )}
                </div>
              )}

              {/* Merchant Info */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <span className="text-muted-foreground">Paying to</span>
                <span className="font-medium text-foreground">
                  {paymentLink.merchants?.business_name ||
                    (merchantUsername ? `@${merchantUsername}` : 'Merchant')}
                </span>
              </div>

              {/* Auth & Pay Button */}
              {!piUser ? (
                <Button
                  onClick={authenticateWithPi}
                  disabled={paymentStatus === 'authenticating'}
                  className="w-full h-14 text-lg"
                  variant="outline"
                >
                  {paymentStatus === 'authenticating' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-5 w-5" />
                      Connect Pi Wallet
                    </>
                  )}
                </Button>
              ) : paymentLink.pricing_type === 'free' || paymentLink.amount === 0 ? (
                <Button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'processing' || (paymentLink.content_file && !buyerEmail)}
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-5 w-5" />
                      Get Free Access
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'processing' || paymentStatus === 'verifying' || (paymentLink.content_file && !buyerEmail) || (paymentLink.pricing_type === 'donation' && (!customAmount || parseFloat(customAmount) < (paymentLink.min_amount || 0)))}
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentLink.pricing_type === 'donation' ? (
                        <>
                          Donate π {((customAmount ? Number(customAmount) : Number(paymentLink.amount)) * 1.02).toFixed(2)}
                          <span className="text-xs ml-1">(inc. fee)</span>
                        </>
                      ) : (
                        `Pay ${displayCurrency === 'Pi' ? 'π' : displayCurrency} ${Number(paymentLink.amount).toFixed(2)}`
                      )}
                    </>
                  )}
                </Button>
              )}

              <p className="text-center text-xs text-muted-foreground">
                Powered by{' '}
                <Link to="/" className="text-primary hover:underline">
                  DropPay
                </Link>
                {' • '}
                <a
                  href="https://blockexplorer.minepi.com/mainnet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Verified on Pi Blockchain
                </a>
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Floating AI Support for payment assistance */}
      <FloatingAISupport />
    </div>
  );
}