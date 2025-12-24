import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CreditCard, ShieldCheck, Package, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { initPiSdk, authenticateWithPi, isPiAvailable } from '@/lib/pi-sdk';
import { useEffect } from 'react';

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

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  cartTotal: number;
  storeName: string;
  primaryColor: string;
  onSubmit: (orderForm: OrderForm) => Promise<void>;
  submitting: boolean;
}

export interface OrderForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface DigitalDeliveryInfo {
  hasDigitalProducts: boolean;
  digitalProducts: Array<{
    name: string;
    downloadUrl: string;
  }>;
}

export function PaymentModal({
  open,
  onOpenChange,
  cart,
  cartTotal,
  storeName,
  primaryColor,
  onSubmit,
  submitting
}: PaymentModalProps) {
  const [step, setStep] = useState<'details' | 'pi-auth' | 'confirm' | 'processing' | 'success'>('details');
  const [orderForm, setOrderForm] = useState<OrderForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [piAuthenticated, setPiAuthenticated] = useState(false);
  const [piAuthLoading, setPiAuthLoading] = useState(false);
  const [digitalDelivery, setDigitalDelivery] = useState<DigitalDeliveryInfo | null>(null);
  const piAvailable = isPiAvailable();

  useEffect(() => {
    initPiSdk(false); // Mainnet mode for production
  }, []);

  // Check for digital products
  const hasDigitalProducts = cart.some(item => item.product.product_type === 'digital');
  const hasPhysicalProducts = cart.some(item => item.product.product_type !== 'digital');

  const handlePiAuth = async () => {
    setPiAuthLoading(true);
    try {
      const result = await authenticateWithPi(() => {});
      if (result) {
        setPiAuthenticated(true);
        setStep('confirm');
      }
    } catch (error) {
      console.error('Pi auth failed:', error);
    } finally {
      setPiAuthLoading(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!orderForm.name.trim() || !orderForm.email.trim()) return;
    
    // Skip Pi auth and go directly to confirm (free orders)
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!orderForm.name.trim() || !orderForm.email.trim()) return;
    setStep('processing');
    try {
      await onSubmit(orderForm);
      
      // Collect digital product download info
      if (hasDigitalProducts) {
        const digitalProducts = cart
          .filter(item => item.product.product_type === 'digital' && item.product.digital_file_url)
          .map(item => ({
            name: item.product.name,
            downloadUrl: item.product.digital_file_url!,
          }));
        setDigitalDelivery({
          hasDigitalProducts: true,
          digitalProducts,
        });
      }
      
      setStep('success');
    } catch {
      setStep('confirm');
    }
  };

  const resetAndClose = () => {
    setStep('details');
    setOrderForm({ name: '', email: '', phone: '', address: '', notes: '' });
    setPiAuthenticated(false);
    setDigitalDelivery(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
            {step === 'success' ? 'Payment Complete' : 'Checkout'}
          </DialogTitle>
        </DialogHeader>

        {step === 'success' ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
            <p className="text-muted-foreground mb-6">
              Your order has been placed successfully.
            </p>
            
            {/* Digital Download Section */}
            {digitalDelivery?.hasDigitalProducts && digitalDelivery.digitalProducts.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400">Your Downloads</h4>
                </div>
                <div className="space-y-2">
                  {digitalDelivery.digitalProducts.map((product, index) => (
                    <a
                      key={index}
                      href={product.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-white dark:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400 flex-1">{product.name}</span>
                      <span className="text-xs text-blue-500">Download</span>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                  Download links have also been sent to your email.
                </p>
              </div>
            )}
            
            <Button onClick={resetAndClose} style={{ backgroundColor: primaryColor }}>
              Continue Shopping
            </Button>
          </div>
        ) : step === 'processing' ? (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
            <h3 className="text-lg font-semibold text-foreground mb-2">Processing Payment</h3>
            <p className="text-muted-foreground text-sm">
              Please complete the payment in your Pi Browser...
            </p>
          </div>
        ) : step === 'pi-auth' ? (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Pi Network Authentication</h3>
              <p className="text-muted-foreground text-sm">
                {piAvailable 
                  ? 'Authenticate with Pi Network to complete your payment securely.'
                  : 'Please open this store in Pi Browser to make purchases with Pi.'}
              </p>
            </div>
            
            {!piAvailable && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Pi Browser Required</span>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  Download Pi Browser from minepi.com to make Pi payments
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('details')}>
                Back
              </Button>
              {piAvailable && (
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
                    'Authenticate with Pi'
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : step === 'confirm' ? (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="border border-border rounded-lg p-4 bg-secondary/30">
              <h4 className="font-semibold text-foreground mb-3">Order Summary</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                      {item.product.product_type === 'digital' && (
                        <span className="ml-1 text-xs text-blue-500">(Digital)</span>
                      )}
                    </span>
                    <span className="font-medium">
                      {(item.product.price * item.quantity).toFixed(2)} π
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span style={{ color: primaryColor }}>{cartTotal.toFixed(2)} π</span>
              </div>
            </div>

            {/* Customer Details Summary */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Delivery Details</h4>
              <p className="text-sm text-muted-foreground">{orderForm.name}</p>
              <p className="text-sm text-muted-foreground">{orderForm.email}</p>
              {orderForm.phone && <p className="text-sm text-muted-foreground">{orderForm.phone}</p>}
              {orderForm.address && hasPhysicalProducts && (
                <p className="text-sm text-muted-foreground">{orderForm.address}</p>
              )}
            </div>

            {/* Digital Delivery Notice */}
            {hasDigitalProducts && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Download className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-400">
                  Digital products will be available for download after payment
                </span>
              </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400">
                Secured by Pi Network
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: primaryColor }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Pay {cartTotal.toFixed(2)} π
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order Items Preview */}
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
              onClick={handleContinueToPayment}
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
