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
  subscriptionData: {
    id: string;
    planType: string;
    expiresAt: string;
    status: string;
  } | null;
}

interface SubscriptionPaymentOptions {
  piUsername?: string;
  walletAddress?: string;
}

export function usePiPayment() {
  const { user } = useAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    paymentId: null,
    status: 'idle',
    error: null,
    subscriptionData: null
  });

  const createSubscriptionPayment = useCallback(async (
    planType: PlanType,
    storeId?: string,
    options: SubscriptionPaymentOptions = {}
  ) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    const planTypeNormalized = planType.toLowerCase() as PlanType;
    const plan = SUBSCRIPTION_PLANS[planTypeNormalized];
    
    if (!plan || plan.amount === 0) {
      toast.error('Invalid plan selected');
      return;
    }

    console.log('Creating payment for plan:', planType, 'Amount:', plan.amount);
    
    setPaymentState({
      isProcessing: true,
      paymentId: null,
      status: 'pending',
      error: null,
      subscriptionData: null
    });

    const paymentData: PiPaymentData = {
      amount: plan.amount,
      memo: `Drop Store ${plan.name} Subscription`,
      metadata: {
        planType: planTypeNormalized,
        storeId: storeId || null,
        userId: user.id,
        planName: plan.name,
        timestamp: new Date().toISOString(),
        subscription_type: 'subscription',
        piUsername: options.piUsername || null,
        walletAddress: options.walletAddress || null
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
            // Call backend to complete the payment and activate subscription
            console.log('Calling pi-payment-complete with:', { paymentId, txid, planType, storeId });
            const { data, error } = await supabase.functions.invoke('pi-payment-complete', {
              body: { paymentId, txid, planType: planTypeNormalized, storeId }
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

            console.log('Payment completed successfully:', data);
            
            // Store subscription data from response
            const subscriptionInfo = data?.subscription || null;
            
            setPaymentState(prev => ({ 
              ...prev, 
              isProcessing: false,
              status: 'completed',
              subscriptionData: subscriptionInfo
            }));
            
            toast.success(`🎉 ${plan.name} plan activated successfully!`);
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

        onError: (error: Error, payment?: PiPaymentDTO) => {
          console.error('Payment error:', error);
          
          // Check if it's an incomplete payment error
          const errorMessage = error.message || '';
          const isIncompletePaymentError = errorMessage.includes('pending payment') || 
                                           errorMessage.includes('incomplete payment') ||
                                           errorMessage.includes('action from the developer');
          
          if (isIncompletePaymentError) {
            // Auto-cancel the stuck payment after 3 seconds
            const currentPaymentId = payment?.identifier || paymentState.paymentId;
            
            toast.error('You have an incomplete payment. Auto-cancelling in 3 seconds...', {
              duration: 3000
            });
            
            setTimeout(() => {
              if (currentPaymentId) {
                console.log('🔄 Auto-cancelling incomplete payment:', currentPaymentId);
                cancelIncompletePayment(currentPaymentId);
              } else {
                // If no paymentId, just reset state
                resetPayment();
                toast.success('Payment cleared. Please try again.');
              }
            }, 3000);
          } else {
            toast.error(`Payment error: ${errorMessage}`);
          }
          
          setPaymentState({
            isProcessing: false,
            paymentId: payment?.identifier || null,
            status: 'error',
            error: errorMessage,
            subscriptionData: null
          });
        }
      });
    } catch (err) {
      console.error('Failed to create payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
      const isIncompletePaymentError = errorMessage.includes('pending payment') || 
                                       errorMessage.includes('incomplete payment') ||
                                       errorMessage.includes('action from the developer');
      
      if (isIncompletePaymentError) {
        toast.error('You have an incomplete payment. Please complete or cancel it before making a new payment.', {
          duration: 6000
        });
      } else {
        toast.error(errorMessage);
      }
      
      setPaymentState({
        isProcessing: false,
        paymentId: null,
        status: 'error',
        error: errorMessage,
        subscriptionData: null
      });
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
      error: null,
      subscriptionData: null
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
          setPaymentState({ isProcessing: false, paymentId: null, status: 'error', error: error.message, subscriptionData: null });
          toast.error(`Payment error: ${error.message}`);
        }
      });
    } catch (err) {
      console.error('Failed to create product payment:', err);
      setPaymentState({ isProcessing: false, paymentId: null, status: 'error', error: 'Failed to initiate payment', subscriptionData: null });
    }
  }, [user]);

  const resetPayment = useCallback(() => {
    setPaymentState({
      isProcessing: false,
      paymentId: null,
      status: 'idle',
      error: null,
      subscriptionData: null
    });
  }, []);

  // Auto-cancel incomplete payment and reset state
  const cancelIncompletePayment = useCallback(async (paymentId?: string) => {
    try {
      console.log('🚫 Cancelling incomplete payment:', paymentId || 'unknown');
      
      // Try to cancel via backend if we have a paymentId
      if (paymentId) {
        try {
          const { error } = await supabase.functions.invoke('pi-payment-cancel', {
            body: { paymentId }
          });
          
          if (error) {
            console.error('Backend cancel failed:', error);
          } else {
            console.log('✓ Backend cancelled payment');
          }
        } catch (err) {
          console.error('Failed to call cancel function:', err);
        }
      }
      
      // Reset local payment state
      resetPayment();
      
      toast.success('Payment cleared. You can try again now.', {
        duration: 3000
      });
      
      return true;
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      toast.error('Failed to clear payment. Please wait a few minutes and try again.');
      return false;
    }
  }, [resetPayment]);

  return {
    ...paymentState,
    createSubscriptionPayment,
    createProductPayment,
    resetPayment,
    cancelIncompletePayment
  };
}
