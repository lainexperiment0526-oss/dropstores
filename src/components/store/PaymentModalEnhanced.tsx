import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CreditCard, ShieldCheck, Package, CheckCircle2, AlertCircle, Download, Wallet, QrCode, Copy, Check, Truck } from 'lucide-react';
import { initPiSdk, authenticateWithPi, isPiAvailable } from '@/lib/pi-sdk';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[] | null;
    product_type?: string | null;
    digital_file_url?: string | null;
  };
  quantity: number;
}

interface PaymentMethod {
  id: string;
  method_type: 'pi_payment' | 'manual_wallet';
  wallet_address?: string;
  display_name: string;
  instructions?: string;
}

interface PaymentModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  cartTotal: number;
  storeId: string;
  storeName: string;
  primaryColor: string;
  merchantWallet?: string;
  paymentMethods?: PaymentMethod[];
  onSubmit: (orderForm: OrderForm, paymentMethod: string) => Promise<void>;
  submitting: boolean;
}

export interface OrderForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: 'pi_payment' | 'manual_wallet';
}

export function PaymentModalEnhanced({
  open,
  onOpenChange,
  cart,
  cartTotal,
  storeId,
  storeName,
  primaryColor,
  merchantWallet,
  paymentMethods = [],
  onSubmit,
  submitting
}: PaymentModalEnhancedProps) {
  const [step, setStep] = useState<'details' | 'payment-method' | 'pi-auth' | 'manual-payment' | 'confirm' | 'processing' | 'success'>('details');
  const [orderForm, setOrderForm] = useState<OrderForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'pi_payment',
  });
  const [piAuthenticated, setPiAuthenticated] = useState(false);
  const [piAuthLoading, setPiAuthLoading] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number | null>(null);
  const piAvailable = isPiAvailable();

  const hasDigitalProducts = cart.some(item => item.product.product_type === 'digital');
  const hasPhysicalProducts = cart.some(item => item.product.product_type !== 'digital');

  // Fee calculations
  const platformFee = 1.00; // Fixed 1π per product
  const subtotal = cartTotal;
  
  // Check if free delivery applies
  const qualifiesForFreeDelivery = freeDeliveryThreshold !== null && subtotal >= freeDeliveryThreshold && hasPhysicalProducts;
  const finalDeliveryFee = hasPhysicalProducts && !qualifiesForFreeDelivery ? deliveryFee : 0;
  const finalTotal = subtotal + platformFee + finalDeliveryFee;

  useEffect(() => {
    initPiSdk(false); // Mainnet mode for production
  }, []);

  // Fetch store delivery settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('delivery_fee, free_delivery_threshold, delivery_enabled')
          .eq('id', storeId)
          .single();

        if (error) throw error;
        if (data) {
          const storeData = data as any;
          setDeliveryFee(storeData.delivery_enabled ? (storeData.delivery_fee || 0) : 0);
          setFreeDeliveryThreshold(storeData.free_delivery_threshold);
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
        setDeliveryFee(0);
      }
    };

    if (open && storeId) {
      fetchStoreSettings();
    }
  }, [open, storeId]);

  useEffect(() => {
    initPiSdk(false); // Mainnet mode for production
  }, []);

  // Generate QR code for wallet address
  useEffect(() => {
    if (merchantWallet && orderForm.paymentMethod === 'manual_wallet') {
      QRCode.toDataURL(merchantWallet, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).then(setQrCodeDataURL);
    }
  }, [merchantWallet, orderForm.paymentMethod]);

  // Determine available payment methods
  const availablePaymentMethods = paymentMethods.length > 0 
    ? paymentMethods 
    : [
        { 
          id: 'pi', 
          method_type: 'pi_payment' as const, 
          display_name: 'Pi Payment', 
          instructions: 'Pay instantly with Pi Network' 
        },
        ...(merchantWallet ? [{
          id: 'manual',
          method_type: 'manual_wallet' as const,
          wallet_address: merchantWallet,
          display_name: 'Manual Wallet Transfer',
          instructions: 'Send Pi directly to merchant wallet'
        }] : [])
      ];

  const handleCopyAddress = async () => {
    if (merchantWallet) {
      await navigator.clipboard.writeText(merchantWallet);
      setCopiedAddress(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handlePiAuth = async () => {
    if (!piAvailable) {
      toast.error('Pi Browser is required for Pi payments.');
      return;
    }

    setPiAuthLoading(true);
    try {
      const result = await authenticateWithPi(() => {});
      if (result) {
        setPiAuthenticated(true);
        setStep('confirm');
      }
    } catch (error) {
      console.error('Pi auth failed:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setPiAuthLoading(false);
    }
  };

  const handleContinueToPaymentMethod = () => {
    if (!orderForm.name.trim() || !orderForm.email.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    
    if (availablePaymentMethods.length === 1) {
      // If only one payment method, skip selection
      const method = availablePaymentMethods[0];
      setOrderForm({ ...orderForm, paymentMethod: method.method_type });
      handlePaymentMethodSelected(method.method_type);
    } else {
      setStep('payment-method');
    }
  };

  const handlePaymentMethodSelected = (method: 'pi_payment' | 'manual_wallet') => {
    setOrderForm({ ...orderForm, paymentMethod: method });
    
    if (method === 'pi_payment') {
      if (!piAvailable) {
        toast.error('Pi Browser required for Pi payments');
        return;
      }
      if (!piAuthenticated) {
        setStep('pi-auth');
      } else {
        setStep('confirm');
      }
    } else {
      setStep('manual-payment');
    }
  };

  const handleSubmit = async () => {
    if (!orderForm.name.trim() || !orderForm.email.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setStep('processing');
    try {
      if (orderForm.paymentMethod === 'pi_payment') {
        if (!piAvailable) {
          toast.error('Pi Browser is required for Pi payments.');
          setStep('payment-method');
          return;
        }

        if (!piAuthenticated) {
          toast.error('Please authenticate with Pi before paying.');
          setStep('pi-auth');
          return;
        }
      }

      await onSubmit(orderForm, orderForm.paymentMethod);
      setStep('success');
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
      setStep('confirm');
    }
  };

  const resetAndClose = () => {
    setStep('details');
    setOrderForm({ 
      name: '', 
      email: '', 
      phone: '', 
      address: '', 
      notes: '', 
      paymentMethod: 'pi_payment' 
    });
    setPiAuthenticated(false);
    setQrCodeDataURL('');
    setCopiedAddress(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
            {step === 'success' ? 'Order Placed' : 'Checkout'}
          </DialogTitle>
        </DialogHeader>

        {/* Success Step */}
        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
            <p className="text-muted-foreground mb-6">
              {orderForm.paymentMethod === 'pi_payment' 
                ? 'Your payment has been processed successfully.'
                : 'Your order has been placed. Please complete the payment to the wallet address provided.'}
            </p>
            
            {hasDigitalProducts && orderForm.paymentMethod === 'pi_payment' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400">Your Downloads</h4>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Download links have been sent to {orderForm.email}
                </p>
              </div>
            )}
            
            <Button onClick={resetAndClose} style={{ backgroundColor: primaryColor }}>
              Continue Shopping
            </Button>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {orderForm.paymentMethod === 'pi_payment' ? 'Processing Payment' : 'Creating Order'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {orderForm.paymentMethod === 'pi_payment' 
                ? 'Please complete the payment in your Pi Browser...'
                : 'Please wait while we process your order...'}
            </p>
          </div>
        )}

        {/* Payment Method Selection */}
        {step === 'payment-method' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Payment Method</h3>
            
            <RadioGroup 
              value={orderForm.paymentMethod}
              onValueChange={(value) => handlePaymentMethodSelected(value as 'pi_payment' | 'manual_wallet')}
              className="space-y-3"
            >
              {availablePaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    orderForm.paymentMethod === method.method_type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handlePaymentMethodSelected(method.method_type)}
                >
                  <RadioGroupItem value={method.method_type} id={method.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer font-semibold">
                      {method.method_type === 'pi_payment' ? (
                        <CreditCard className="w-5 h-5" />
                      ) : (
                        <Wallet className="w-5 h-5" />
                      )}
                      {method.display_name}
                    </Label>
                    {method.instructions && (
                      <p className="text-sm text-muted-foreground mt-1">{method.instructions}</p>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setStep('details')}
            >
              Back
            </Button>
          </div>
        )}

        {/* Pi Authentication Step */}
        {step === 'pi-auth' && (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Pi Network Authentication</h3>
              <p className="text-muted-foreground text-sm">
                Authenticate with Pi Network to complete your payment securely.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('payment-method')}>
                Back
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: primaryColor }}
                onClick={handlePiAuth}
                disabled={piAuthLoading}
              >
                {piAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Pi Auth Sign In'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Manual Payment Instructions */}
        {step === 'manual-payment' && merchantWallet && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Manual Wallet Transfer</h3>
              <p className="text-sm text-muted-foreground">
                Send exactly <span className="font-bold" style={{ color: primaryColor }}>{finalTotal.toFixed(2)} π</span> to the wallet address below
              </p>
            </div>

            {/* QR Code */}
            {qrCodeDataURL && (
              <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-border">
                <img src={qrCodeDataURL} alt="Wallet QR Code" className="w-64 h-64" />
              </div>
            )}

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label>Merchant Wallet Address</Label>
              <div className="flex gap-2">
                <Input 
                  value={merchantWallet} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                >
                  {copiedAddress ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Important Notice */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Send exactly {finalTotal.toFixed(2)} π</li>
                    <li>Double-check the wallet address before sending</li>
                    <li>Your order will be processed after payment verification</li>
                    <li>Keep your transaction ID for reference</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('payment-method')}>
                Back
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: primaryColor }}
                onClick={() => setStep('confirm')}
              >
                I've Sent the Payment
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4 bg-secondary/30">
              <h4 className="font-semibold text-foreground mb-3">Order Summary</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {(item.product.price * item.quantity).toFixed(2)} π
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span style={{ color: primaryColor }}>{finalTotal.toFixed(2)} π</span>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {orderForm.paymentMethod === 'pi_payment' ? (
                  <CreditCard className="w-4 h-4" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                <h4 className="font-semibold text-foreground">Payment Method</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {orderForm.paymentMethod === 'pi_payment' ? 'Pi Payment' : 'Manual Wallet Transfer'}
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="font-semibold text-foreground">Customer Information</h4>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{orderForm.name}</p>
                <p className="text-muted-foreground">{orderForm.email}</p>
                {orderForm.phone && <p className="text-muted-foreground">{orderForm.phone}</p>}
                {orderForm.address && hasPhysicalProducts && (
                  <p className="text-sm text-muted-foreground">{orderForm.address}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setStep(orderForm.paymentMethod === 'manual_wallet' ? 'manual-payment' : 'payment-method')}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: primaryColor }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {orderForm.paymentMethod === 'pi_payment' ? `Pay ${finalTotal.toFixed(2)} π` : 'Place Order'}
              </Button>
            </div>
          </div>
        )}

        {/* Customer Details Form */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-3 bg-secondary/30">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{cart.length} item(s) from {storeName}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span style={{ color: primaryColor }}>{cartTotal.toFixed(2)} π</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="checkout-name">Your Name *</Label>
                <Input
                  id="checkout-name"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-email">Email *</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                  placeholder="john@example.com"
                />
                {hasDigitalProducts && (
                  <p className="text-xs text-muted-foreground">
                    Download links will be sent to this email
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-phone">Phone</Label>
                <Input
                  id="checkout-phone"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                />
              </div>
              {hasPhysicalProducts && (
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-address">Shipping Address</Label>
                  <Textarea
                    id="checkout-address"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    placeholder="Your shipping address"
                    rows={2}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="checkout-notes">Notes (optional)</Label>
                <Textarea
                  id="checkout-notes"
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  placeholder="Special instructions..."
                  rows={2}
                />
              </div>
            </div>

            <Button
              className="w-full"
              style={{ backgroundColor: primaryColor }}
              onClick={handleContinueToPaymentMethod}
              disabled={!orderForm.name.trim() || !orderForm.email.trim()}
            >
              Continue to Payment
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
