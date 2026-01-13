/**
 * Updated Payment Modal - Standard Checkout with Pi Integration
 * Replaces previous PaymentModal implementation
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderItem, CheckoutPayload } from '@/types/checkout';
import { createCheckout } from '@/lib/checkout-service';
import { requestPiPayment, initializePiSDK } from '@/lib/pi-payment';
import { createOrder, sendOrderConfirmationEmail } from '@/lib/order-service';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  storeId: string;
  storeName?: string;
  onSuccess?: (orderId: string) => void;
}

type CheckoutStep = 'form' | 'processing' | 'payment' | 'success' | 'error';

export function PaymentModal({
  isOpen,
  onClose,
  items,
  storeId,
  storeName = 'Store',
  onSuccess,
}: PaymentModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<CheckoutStep>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ orderId: string; amount: number } | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutPayload | null>(null);

  // Initialize Pi SDK on component mount
  const initPi = () => {
    try {
      const isSandbox = false; // PRODUCTION ONLY - Force mainnet for payments
      initializePiSDK({ sandbox: isSandbox });
    } catch (err) {
      console.error('Failed to initialize Pi SDK:', err);
    }
  };

  if (isOpen && step === 'form') {
    initPi();
  }

  const handleCheckoutSubmit = async (checkout: CheckoutPayload) => {
    setLoading(true);
    setError(null);

    try {
      setStep('processing');

      // Create checkout in database
      const checkoutResponse = await createCheckout(checkout);
      if (!checkoutResponse.success) {
        throw new Error(checkoutResponse.message);
      }

      setCheckoutData(checkout);

      // Move to payment step
      setStep('payment');

      // Request Pi payment
      const paymentResult = await requestPiPayment(checkout);

      if (paymentResult.success && paymentResult.transactionId) {
        // Payment successful - create order
        const orderResult = await createOrder(
          checkout,
          checkoutResponse.checkout_id,
          storeId,
        );

        if (!orderResult.success) {
          throw new Error(orderResult.message);
        }

        // Send confirmation email
        const emailResult = await sendOrderConfirmationEmail(
          checkout,
          orderResult.orderId!,
        );

        if (!emailResult.success) {
          console.warn('Warning: Order created but confirmation email failed to send');
        }

        // Show success
        setSuccessData({
          orderId: orderResult.orderId!,
          amount: checkout.payment.amount_total,
        });
        setStep('success');

        // Trigger callback
        if (onSuccess) {
          onSuccess(orderResult.orderId!);
        }

        toast({
          title: 'Order Placed Successfully!',
          description: `Order #${orderResult.orderId} has been confirmed.`,
        });
      } else {
        throw new Error(paymentResult.message || 'Payment failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStep('error');

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep('form');
    setError(null);
    setSuccessData(null);
  };

  const handleClose = () => {
    if (step === 'success' || step === 'error') {
      onClose();
      setStep('form');
      setError(null);
      setSuccessData(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Form Step */}
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>Secure Checkout</DialogTitle>
              <DialogDescription>
                Complete your order at {storeName} with Pi Network
              </DialogDescription>
            </DialogHeader>
            <CheckoutForm
              storeId={storeId}
              initialItems={items}
              onSubmit={handleCheckoutSubmit}
              isLoading={loading}
              onError={(err) => {
                setError(err.message);
                toast({
                  title: 'Validation Error',
                  description: err.message,
                  variant: 'destructive',
                });
              }}
            />
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="space-y-6 py-12 text-center">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Processing Your Order</h3>
              <p className="text-gray-600">Creating your checkout, please wait...</p>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <div className="space-y-6 py-12 text-center">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Requesting Pi Payment</h3>
              <p className="text-gray-600">
                {checkoutData && `Total: π${checkoutData.payment.amount_total.toFixed(2)}`}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Confirm the payment in your Pi Wallet
              </p>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && successData && (
          <div className="space-y-6 py-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Order Confirmed!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for your purchase
              </p>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-semibold">Order #{successData.orderId}</div>
                <div className="text-sm mt-1">
                  Total: π{successData.amount.toFixed(2)}
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What's Next?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Order confirmation sent to your email</li>
                  <li>✓ Your order is being processed</li>
                  <li>✓ You'll receive shipping updates via email</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600">
                  If you have any questions, please contact our support team at support@dropstore.com
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && error && (
          <div className="space-y-6 py-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Payment Failed</h3>
              <p className="text-gray-600">There was an issue with your payment</p>
            </div>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Close
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Make sure you have enough Pi in your wallet and that your device has internet connection.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
