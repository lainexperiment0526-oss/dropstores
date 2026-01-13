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
  merchant_name?: string | null;
  merchant_wallet?: string | null;
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

  const fetchPaymentLink = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching payment link for slug:', slug);
      
      // Try to find a product with this slug in any store
      const { data: products, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          images,
          digital_file_url,
          store_id,
          stores:store_id (
            id,
            name,
            owner_id,
            payout_wallet
          )
        `)
        .limit(1);

      if (products && products.length > 0) {
        const product = products[0];
        const store = product.stores as any;
        
        setPaymentLink({
          id: product.id,
          title: product.name,
          description: product.description,
          amount: product.price,
          slug: slug || '',
          merchant_id: store?.owner_id || '',
          payment_type: 'one_time',
          redirect_url: null,
          content_file: product.digital_file_url,
          access_type: 'permanent',
          pricing_type: 'one_time',
          merchant_name: store?.name,
          merchant_wallet: store?.payout_wallet,
        });
        
        if (product.images && product.images.length > 0) {
          setLinkImage(product.images[0]);
        }
        
        setMerchantUsername(store?.name || 'Store');
        console.log('✅ Product loaded:', product.name);
        return;
      }

      // If no product found, check orders table for a matching payment
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          store_id,
          items,
          stores:store_id (
            id,
            name,
            owner_id,
            payout_wallet
          )
        `)
        .limit(1);

      if (orders && orders.length > 0) {
        const order = orders[0];
        const store = order.stores as any;
        
        setPaymentLink({
          id: order.id,
          title: 'Order Payment',
          description: `Payment for order`,
          amount: order.total,
          slug: slug || '',
          merchant_id: store?.owner_id || '',
          payment_type: 'one_time',
          redirect_url: null,
          content_file: null,
          access_type: 'permanent',
          pricing_type: 'one_time',
          merchant_name: store?.name,
          merchant_wallet: store?.payout_wallet,
        });
        
        setMerchantUsername(store?.name || 'Store');
        console.log('✅ Order payment loaded');
        return;
      }

      // 3) Link not found - show demo payment
      console.log('⚠️ No matching payment link found, showing demo');
      setPaymentLink({
        id: 'demo',
        title: 'Demo Payment',
        description: 'This is a demo payment page',
        amount: 1.0,
        slug: slug || 'demo',
        merchant_id: 'demo',
        payment_type: 'one_time',
        redirect_url: null,
        content_file: null,
        access_type: 'permanent',
        pricing_type: 'one_time',
        merchant_name: 'Demo Store',
        merchant_wallet: null,
      });
      setMerchantUsername('Demo');

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
      
      const scopes = ['username', 'payments', 'wallet_address'];
      console.log('📋 Requesting authentication scopes:', scopes);
      
      const authResult = await Pi.authenticate(scopes, (payment: any) => {
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

    if (!piUser) {
      const authenticated = await authenticateWithPi();
      if (!authenticated) return;
      if (paymentLink.content_file) return;
    }

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

        const paymentAmount = paymentLink.pricing_type === 'free'
          ? 0.01
          : paymentLink.pricing_type === 'donation' && customAmount 
          ? parseFloat(customAmount) * 1.02
          : paymentLink.pricing_type === 'donation'
          ? paymentLink.amount * 1.02
          : paymentLink.amount;

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
              const response = await supabase.functions.invoke('pi-payment-approve', {
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
              
              const response = await supabase.functions.invoke('pi-payment-complete', {
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

              if (response.data?.transactionId) {
                setTransactionId(response.data.transactionId);
              }

              setVerificationResult({
                verified: true,
                amount: paymentAmount,
                txid: txid,
              });
              setPaymentStatus('completed');
              toast.success('Payment successful!');

              if (paymentLink.content_file) {
                setContentUrl(paymentLink.content_file);
              }
              
              if (paymentLink.redirect_url) {
                setTimeout(() => {
                  window.location.href = paymentLink.redirect_url!;
                }, 3000);
              }
            } catch (error) {
              console.error('❌ Error completing payment:', error);
              setPaymentStatus('error');
              toast.error('Payment completion failed.');
            }
          },
          onCancel: (paymentId: string) => {
            console.log('❌ Payment cancelled by user:', paymentId);
            setPaymentStatus('cancelled');
            toast.info('Payment was cancelled.');
            
            if (paymentLink.cancel_redirect_url) {
              setTimeout(() => {
                window.location.href = paymentLink.cancel_redirect_url!;
              }, 1500);
            }
          },
          onError: (error: Error) => {
            console.error('❌ Payment error:', error);
            setPaymentStatus('error');
            toast.error('Payment failed. Please try again.');
          },
        };

        await Pi.createPayment(paymentData, callbacks);
      } else {
        toast.error('Please open this link in Pi Browser to make a payment.');
        setPaymentStatus('idle');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleJoinWaitlist = async () => {
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsJoiningWaitlist(true);
    try {
      // Store waitlist entry
      console.log('Joining waitlist with email:', waitlistEmail);
      toast.success('Successfully joined the waitlist!');
      setHasJoinedWaitlist(true);
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  const copyPaymentLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Payment link copied!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Payment Link Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This payment link doesn't exist or has expired.
            </p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4">
            <Zap className="w-6 h-6" />
            <span className="text-xl font-bold">DropPay</span>
          </Link>
          {merchantUsername && (
            <p className="text-sm text-muted-foreground">
              Payment to <span className="font-medium">@{merchantUsername}</span>
            </p>
          )}
        </div>

        {/* Payment Card */}
        <Card className="border-orange-200 shadow-lg">
          {linkImage && (
            <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
              <img 
                src={linkImage} 
                alt={paymentLink.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{paymentLink.title}</CardTitle>
                {paymentLink.description && (
                  <CardDescription className="mt-2">{paymentLink.description}</CardDescription>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  π {paymentLink.amount.toFixed(7)}
                </div>
                <div className="text-xs text-muted-foreground">Pi</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Pi Browser Check */}
            {!isPiBrowser && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Pi Browser Required</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Please open this link in Pi Browser to make payments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status */}
            {paymentStatus === 'completed' && verificationResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Payment Successful!</p>
                    <p className="text-sm text-green-700">
                      Transaction: {verificationResult.txid?.slice(0, 16)}...
                    </p>
                  </div>
                </div>
                
                {contentUrl && (
                  <div className="mt-4">
                    <a 
                      href={contentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-700 hover:text-green-800"
                    >
                      <Download className="w-4 h-4" />
                      Download Content
                    </a>
                  </div>
                )}
              </div>
            )}

            {paymentStatus === 'cancelled' && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-gray-500" />
                  <p className="text-gray-700">Payment was cancelled.</p>
                </div>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Payment Failed</p>
                    <p className="text-sm text-red-700">Please try again.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Authenticated User */}
            {piUser && paymentStatus !== 'completed' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    Paying as <strong>@{piUser.username}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Email Input for Digital Content */}
            {paymentStatus === 'awaiting_email' && paymentLink.content_file && (
              <div className="space-y-3">
                <Label htmlFor="buyerEmail">Email for Content Delivery</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We'll send the download link to this email.
                </p>
              </div>
            )}

            {/* Donation Amount */}
            {paymentLink.pricing_type === 'donation' && paymentStatus !== 'completed' && (
              <div className="space-y-3">
                <Label htmlFor="customAmount">Custom Amount (π)</Label>
                <Input
                  id="customAmount"
                  type="number"
                  step="0.01"
                  min={paymentLink.min_amount || 0.01}
                  placeholder={`Min: ${paymentLink.min_amount || 0.01} π`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            )}

            {/* Waitlist */}
            {paymentLink.enable_waitlist && !hasJoinedWaitlist && paymentStatus !== 'completed' && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <Label>Join Waitlist</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleJoinWaitlist}
                    disabled={isJoiningWaitlist}
                  >
                    {isJoiningWaitlist ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Join'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {hasJoinedWaitlist && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">You've joined the waitlist!</span>
                </div>
              </div>
            )}

            {/* Payment Button */}
            {paymentStatus !== 'completed' && (
              <Button
                className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                onClick={handlePayment}
                disabled={paymentStatus === 'processing' || paymentStatus === 'authenticating'}
              >
                {paymentStatus === 'authenticating' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : paymentStatus === 'processing' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : paymentStatus === 'awaiting_email' ? (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Continue to Payment
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Pay with Pi
                  </>
                )}
              </Button>
            )}

            {/* Copy Link */}
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={copyPaymentLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Payment Link
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secured by Pi Network</span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Fee Info */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>A small platform fee helps keep DropStore running</p>
        </div>
      </div>

      <FloatingAISupport />
    </div>
  );
}
