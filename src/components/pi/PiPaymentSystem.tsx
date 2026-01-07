import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Loader2,
  CreditCard,
  Wallet,
  Send
} from 'lucide-react';
import { 
  piSDK,
  createPiPayment, 
  PiPaymentData,
  PiPaymentDTO,
  PiPaymentCallbacks
} from '@/lib/pi-sdk';

interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'error';
  amount: number;
  memo: string;
  txid?: string;
  timestamp: Date;
}

interface PiPaymentSystemProps {
  isAuthenticated: boolean;
  userPi?: any;
  onPaymentSuccess?: (paymentId: string, txid: string) => void;
  onPaymentError?: (error: string) => void;
}

export const PiPaymentSystem: React.FC<PiPaymentSystemProps> = ({
  isAuthenticated,
  userPi,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  
  // Payment form state
  const [amount, setAmount] = useState<string>('1.0');
  const [memo, setMemo] = useState<string>('Test payment from DropStore');
  const [metadata, setMetadata] = useState<string>('{"orderId": 12345, "productType": "digital"}');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment tracking
  const [activePayments, setActivePayments] = useState<Map<string, PaymentStatus>>(new Map());
  const [paymentHistory, setPaymentHistory] = useState<PaymentStatus[]>([]);

  // Add payment to tracking
  const addPaymentStatus = (payment: PaymentStatus) => {
    setActivePayments(prev => new Map(prev).set(payment.id, payment));
    setPaymentHistory(prev => [payment, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Update payment status
  const updatePaymentStatus = (id: string, updates: Partial<PaymentStatus>) => {
    setActivePayments(prev => {
      const updated = new Map(prev);
      const existing = updated.get(id);
      if (existing) {
        updated.set(id, { ...existing, ...updates });
      }
      return updated;
    });

    setPaymentHistory(prev => 
      prev.map(payment => 
        payment.id === id ? { ...payment, ...updates } : payment
      )
    );
  };

  // Validate payment form
  const validatePaymentForm = (): string | null => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      return 'Amount must be a positive number';
    }
    
    if (amountNum > 10000) {
      return 'Amount cannot exceed 10,000 Pi';
    }
    
    if (amountNum < 0.01) {
      return 'Minimum amount is 0.01 Pi';
    }
    
    if (!memo.trim()) {
      return 'Payment memo is required';
    }
    
    if (memo.length > 200) {
      return 'Memo must be 200 characters or less';
    }

    // Validate metadata JSON
    if (metadata.trim()) {
      try {
        JSON.parse(metadata);
      } catch {
        return 'Metadata must be valid JSON';
      }
    }
    
    return null;
  };

  // Parse metadata safely
  const parseMetadata = (): Record<string, unknown> => {
    try {
      return metadata.trim() ? JSON.parse(metadata) : {};
    } catch {
      return {};
    }
  };

  // Handle payment creation
  const handleCreatePayment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate with Pi Network first",
        variant: "destructive"
      });
      return;
    }

    if (!piSDK.isAvailable()) {
      toast({
        title: "Pi SDK Not Available",
        description: "Ensure the app is opened in Pi Browser",
        variant: "destructive"
      });
      return;
    }

    const validationError = validatePaymentForm();
    if (validationError) {
      toast({
        title: "Invalid Payment Data",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData: PiPaymentData = {
        amount: parseFloat(amount),
        memo: memo.trim(),
        metadata: parseMetadata()
      };

      const tempPaymentId = `temp_${Date.now()}`;
      
      // Add to tracking with pending status
      addPaymentStatus({
        id: tempPaymentId,
        status: 'pending',
        amount: paymentData.amount,
        memo: paymentData.memo,
        timestamp: new Date()
      });

      const callbacks: PiPaymentCallbacks = {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('Payment ready for server approval:', paymentId);
          
          // Update with real payment ID
          updatePaymentStatus(tempPaymentId, {
            id: paymentId,
            status: 'approved'
          });
          
          toast({
            title: "Payment Created",
            description: `Payment ${paymentId.substring(0, 8)}... ready for approval`,
          });

          // TODO: Send to your backend for server-side approval
          // This should call your API endpoint that approves the payment
          // Example: await fetch('/api/pi/approve', { method: 'POST', body: JSON.stringify({ paymentId }) })
        },

        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('Payment ready for completion:', { paymentId, txid });
          
          updatePaymentStatus(paymentId, {
            status: 'completed',
            txid
          });
          
          toast({
            title: "Payment Submitted",
            description: `Transaction submitted to Pi blockchain`,
          });

          onPaymentSuccess?.(paymentId, txid);

          // TODO: Send to your backend for server-side completion
          // This should call your API endpoint that completes the payment
          // Example: await fetch('/api/pi/complete', { method: 'POST', body: JSON.stringify({ paymentId, txid }) })
        },

        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          
          updatePaymentStatus(paymentId, {
            status: 'cancelled'
          });
          
          toast({
            title: "Payment Cancelled",
            description: `Payment was cancelled by user`,
            variant: "destructive"
          });
        },

        onError: (error: Error, payment?: PiPaymentDTO) => {
          console.error('Payment error:', { error, payment });
          
          const paymentId = payment?.identifier || tempPaymentId;
          updatePaymentStatus(paymentId, {
            status: 'error'
          });
          
          const errorMessage = error.message || 'Unknown payment error';
          toast({
            title: "Payment Error",
            description: errorMessage,
            variant: "destructive"
          });
          
          onPaymentError?.(errorMessage);
        }
      };

      // Create the payment
      createPiPayment(paymentData, callbacks);
      
      toast({
        title: "Payment Initiated",
        description: "Pi Wallet will open for payment confirmation",
      });

    } catch (error) {
      console.error('Failed to create payment:', error);
      
      toast({
        title: "Payment Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      
      setIsProcessing(false);
    }

    // Don't set processing to false immediately as the payment flow will continue
    setTimeout(() => setIsProcessing(false), 2000);
  };

  // Preset payment amounts
  const presetAmounts = ['0.5', '1.0', '5.0', '10.0'];

  // Status badge variant
  const getStatusVariant = (status: PaymentStatus['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'approved': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  // Status icon
  const getStatusIcon = (status: PaymentStatus['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'approved': return <Clock className="h-3 w-3" />;
      case 'pending': return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Create Pi Payment
          </CardTitle>
          <CardDescription>
            Send Pi to app wallet or create payment request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You must authenticate with Pi Network before creating payments.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Pi)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                max="10000"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.0"
                disabled={isProcessing}
              />
              <div className="flex flex-wrap gap-1">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset)}
                    disabled={isProcessing}
                    className="text-xs"
                  >
                    {preset} Pi
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">Payment Memo</Label>
              <Input
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Payment description"
                maxLength={200}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                {memo.length}/200 characters
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder='{"orderId": 12345, "productType": "digital"}'
              className="font-mono text-sm"
              rows={3}
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON metadata for your app's use
            </p>
          </div>

          <Button
            onClick={handleCreatePayment}
            disabled={isProcessing || !isAuthenticated}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Payment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Payments */}
      {activePayments.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Payments
            </CardTitle>
            <CardDescription>
              Payments currently being processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(activePayments.values())
                .filter(p => p.status !== 'completed' && p.status !== 'cancelled')
                .map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(payment.status)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {payment.amount} Pi
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.memo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusVariant(payment.status)} className="text-xs">
                      {payment.status}
                    </Badge>
                    {payment.txid && (
                      <p className="text-xs text-muted-foreground mt-1">
                        TX: {payment.txid.substring(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>
              Recent payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paymentHistory.slice(0, 5).map((payment, index) => (
                <div key={`${payment.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(payment.status)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {payment.amount} Pi
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.memo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusVariant(payment.status)} className="text-xs">
                      {payment.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {payment.timestamp.toLocaleTimeString()}
                    </p>
                    {payment.txid && (
                      <p className="text-xs text-muted-foreground">
                        TX: {payment.txid.substring(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Info */}
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertTitle>Pi Payment Information</AlertTitle>
        <AlertDescription>
          Payments are processed on Pi Mainnet. Server-side approval and completion are required for production use. 
          This demo shows the complete payment flow including blockchain transaction submission.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PiPaymentSystem;