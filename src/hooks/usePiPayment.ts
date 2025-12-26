import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  createPiPayment, 
  PiPaymentData,
  SUBSCRIPTION_PLANS,
  PlanType
} from '@/lib/pi-sdk';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentState {
  isProcessing: boolean;
  paymentId: string | null;
  status: 'idle' | 'pending' | 'approved' | 'completed' | 'cancelled' | 'error';
  error: string | null;
}

export function usePiPayment() {
  const { user } = useAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    paymentId: null,
    status: 'idle',
    error: null
  });

  const createSubscriptionPayment = useCallback(async (
    planType: PlanType,
    storeId?: string
  ) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    
    if (!plan || plan.amount === 0) {
      toast.error('Invalid plan selected');
      return;
    }

    console.log('Creating payment for plan:', planType, 'Amount:', plan.amount);
    
    setPaymentState({
      isProcessing: true,
      paymentId: null,
      status: 'pending',
      error: null
    });

    const paymentData: PiPaymentData = {
      amount: plan.amount,
      memo: `Drop Store ${plan.name} Subscription`,
      metadata: {
        planType,
        storeId: storeId || null,
        userId: user.id,
        planName: plan.name,
        timestamp: new Date().toISOString(),
        subscription_type: 'subscription'
      }
    };

    try {
      createPiPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('Payment ready for server approval:', paymentId);
          setPaymentState(prev => ({ ...prev, paymentId, status: 'pending' }));
          
          try {
            // Call backend to approve the payment
            console.log('Calling pi-payment-approve...');
            const { data, error } = await supabase.functions.invoke('pi-payment-approve', {
              body: { paymentId }
            });

            if (error) {
              console.error('Payment approval failed:', error);
              toast.error('Payment approval failed. Please try again.');
              setPaymentState(prev => ({ 
                ...prev, 
                isProcessing: false,
                status: 'error', 
                error: error.message 
              }));
              return;
            }

            console.log('Payment approved:', data);
            setPaymentState(prev => ({ ...prev, status: 'approved' }));
            toast.success('Payment approved! Please complete the transaction in Pi Browser.');
          } catch (err) {
            console.error('Approval error:', err);
            toast.error('Failed to approve payment');
            setPaymentState(prev => ({ 
              ...prev, 
              isProcessing: false,
              status: 'error', 
              error: 'Failed to approve payment' 
            }));
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('Payment ready for completion:', paymentId, 'txid:', txid);
          
          try {
            // Call backend to complete the payment
            console.log('Calling pi-payment-complete...');
            const { data, error } = await supabase.functions.invoke('pi-payment-complete', {
              body: { paymentId, txid, planType, storeId }
            });

            if (error) {
              console.error('Payment completion failed:', error);
              toast.error('Payment completion failed. Please contact support.');
              setPaymentState(prev => ({ 
                ...prev, 
                isProcessing: false,
                status: 'error', 
                error: error.message 
              }));
              return;
            }

            console.log('Payment completed:', data);
            setPaymentState(prev => ({ 
              ...prev, 
              isProcessing: false,
              status: 'completed' 
            }));
            toast.success('🎉 Subscription activated successfully!');
          } catch (err) {
            console.error('Completion error:', err);
            toast.error('Failed to complete payment. Please contact support.');
            setPaymentState(prev => ({ 
              ...prev, 
              isProcessing: false,
              status: 'error', 
              error: 'Failed to complete payment' 
            }));
          }
        },

        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          setPaymentState(prev => ({ 
            ...prev, 
            isProcessing: false, 
            status: 'cancelled' 
          }));
          toast.info('Payment cancelled');
        },

        onError: (error: Error) => {
          console.error('Payment error:', error);
          setPaymentState({
            isProcessing: false,
            paymentId: null,
            status: 'error',
            error: error.message
          });
          toast.error(`Payment error: ${error.message}`);
        }
      });
    } catch (err) {
      console.error('Failed to create payment:', err);
      setPaymentState({
        isProcessing: false,
        paymentId: null,
        status: 'error',
        error: 'Failed to initiate payment'
      });
      toast.error('Failed to initiate payment. Please try again.');
    }
  }, [user]);

  const createProductPayment = useCallback(async (
    amount: number,
    productName: string,
    orderId: string,
    storeId: string
  ) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    console.log('Creating product payment:', productName, 'Amount:', amount);
    
    setPaymentState({
      isProcessing: true,
      paymentId: null,
      status: 'pending',
      error: null
    });

    const paymentData: PiPaymentData = {
      amount,
      memo: `Purchase: ${productName}`,
      metadata: {
        type: 'product_purchase',
        orderId,
        storeId,
        userId: user.id,
        timestamp: new Date().toISOString()
      }
    };

    try {
      createPiPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('Product payment ready for approval:', paymentId);
          setPaymentState(prev => ({ ...prev, paymentId, status: 'pending' }));
          
          const { error } = await supabase.functions.invoke('pi-payment-approve', {
            body: { paymentId }
          });

          if (error) {
            console.error('Product payment approval failed:', error);
            setPaymentState(prev => ({ ...prev, isProcessing: false, status: 'error', error: error.message }));
            return;
          }

          setPaymentState(prev => ({ ...prev, status: 'approved' }));
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('Product payment completion:', paymentId, txid);
          
          // For product payments, we don't create subscription, just confirm
          setPaymentState(prev => ({ ...prev, isProcessing: false, status: 'completed' }));
          toast.success('Payment completed successfully!');
        },

        onCancel: (paymentId: string) => {
          setPaymentState(prev => ({ ...prev, isProcessing: false, status: 'cancelled' }));
          toast.info('Payment cancelled');
        },

        onError: (error: Error) => {
          setPaymentState({ isProcessing: false, paymentId: null, status: 'error', error: error.message });
          toast.error(`Payment error: ${error.message}`);
        }
      });
    } catch (err) {
      console.error('Failed to create product payment:', err);
      setPaymentState({ isProcessing: false, paymentId: null, status: 'error', error: 'Failed to initiate payment' });
    }
  }, [user]);

  const resetPayment = useCallback(() => {
    setPaymentState({
      isProcessing: false,
      paymentId: null,
      status: 'idle',
      error: null
    });
  }, []);

  return {
    ...paymentState,
    createSubscriptionPayment,
    createProductPayment,
    resetPayment
  };
}
