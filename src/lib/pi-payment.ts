/**
 * Pi Network Payment Integration
 * Handles Pi wallet payment requests and verification
 * NOTE: Corrected to match actual Pi SDK API
 */

import { CheckoutPayload, PaymentDetails } from '@/types/checkout';

interface PiPaymentConfig {
  apiKey?: string;
  sandbox?: boolean;
  timeout?: number;
}

interface PiPaymentRequest {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
}

interface PiPaymentResponse {
  success: boolean;
  transactionId?: string;
  txid?: string;
  error?: string;
  message?: string;
}

interface PiPaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  checkout?: CheckoutPayload;
}

/**
 * Initialize Pi Network SDK
 */
export function initializePiSDK(config: PiPaymentConfig = {}): void {
  if (typeof window === 'undefined') {
    console.error('Pi SDK can only be initialized in browser');
    return;
  }

  // Check if Pi SDK script is loaded
  if (!window.Pi) {
    console.warn('Pi SDK not loaded. Ensure Pi SDK script is in index.html');
    return;
  }

  try {
    // Initialize Pi if available
    if (window.Pi && typeof window.Pi.init === 'function') {
      window.Pi.init({
        version: '2.0',
        sandbox: config.sandbox ?? false,
      });
      console.log('Pi SDK initialized');
    }
  } catch (error) {
    console.error('Error initializing Pi SDK:', error);
  }
}

/**
 * Request payment from Pi Wallet using createPayment method
 */
export async function requestPiPayment(
  checkout: CheckoutPayload,
): Promise<PiPaymentResult> {
  try {
    // Validate checkout
    if (!checkout.payment || checkout.payment.amount_total <= 0) {
      return {
        success: false,
        message: 'Invalid payment amount',
      };
    }

    if (!window.Pi) {
      return {
        success: false,
        message: 'Pi SDK not initialized. Please refresh the page.',
      };
    }

    // Prepare payment data for Pi SDK
    const paymentData = {
      amount: checkout.payment.amount_total,
      memo: `Order ${checkout.metadata.checkout_id?.slice(0, 8)}`,
      metadata: {
        checkout_id: checkout.metadata.checkout_id,
        store_id: checkout.store_id,
        email: checkout.customer.email,
      },
    };

    // Return promise that resolves when payment completes
    return new Promise((resolve) => {
      // Use createPayment method which is the actual Pi SDK API
      if (window.Pi && typeof window.Pi.createPayment === 'function') {
        window.Pi.createPayment(paymentData, {
          onReadyForServerApproval: async (paymentId: string) => {
            // Payment is ready - server should approve it
            console.log('Payment ready for server approval:', paymentId);
            try {
              const verified = await verifyPiTransaction(paymentId);
              if (verified) {
                resolve({
                  success: true,
                  transactionId: paymentId,
                  message: 'Payment verified successfully',
                  checkout,
                });
              } else {
                resolve({
                  success: false,
                  transactionId: paymentId,
                  message: 'Payment verification failed',
                });
              }
            } catch (error) {
              resolve({
                success: false,
                message: 'Payment verification error',
              });
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            // Payment completed successfully
            console.log('Payment completed:', { paymentId, txid });
            resolve({
              success: true,
              transactionId: txid,
              message: 'Payment completed successfully',
              checkout,
            });
          },
          onCancel: () => {
            console.log('Payment cancelled by user');
            resolve({
              success: false,
              message: 'Payment cancelled by user',
            });
          },
          onError: (error: any) => {
            console.error('Payment error:', error);
            resolve({
              success: false,
              message: `Payment error: ${error?.message || 'Unknown error'}`,
            });
          },
        });
      } else {
        resolve({
          success: false,
          message: 'Pi payment not available',
        });
      }
    });
  } catch (error) {
    console.error('Error requesting Pi payment:', error);
    return {
      success: false,
      message: `Payment error: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}

/**
 * Verify Pi transaction via backend API
 * This must be done server-side for security
 */
export async function verifyPiTransaction(transactionId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/verify-pi-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    });

    if (!response.ok) {
      console.error('Verification failed:', response.statusText);
      return false;
    }

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Error verifying Pi transaction:', error);
    return false;
  }
}

/**
 * Get Pi user information
 */
export async function getPiUserInfo(): Promise<{ uid?: string; username?: string; address?: string } | null> {
  try {
    if (!window.Pi) {
      console.error('Pi SDK not available');
      return null;
    }

    // Pi SDK doesn't have a direct getUserInfo method in all versions
    // This would typically be handled through the authentication flow
    return null;
  } catch (error) {
    console.error('Error getting Pi user info:', error);
    return null;
  }
}

/**
 * Cancel a Pi payment
 */
export function cancelPiPayment(transactionId: string): void {
  try {
    console.log('Payment cancelled:', transactionId);
    // Implement cancellation logic if Pi SDK supports it
  } catch (error) {
    console.error('Error cancelling payment:', error);
  }
}

/**
 * Handle payment failure
 */
export function handlePiPaymentFailure(error: any): PiPaymentResult {
  console.error('Pi payment failure:', error);
  return {
    success: false,
    message: `Payment failed: ${error?.message || 'Unknown error'}`,
  };
}

/**
 * Retry a failed payment
 */
export async function retryPiPayment(checkout: CheckoutPayload): Promise<PiPaymentResult> {
  console.log('Retrying Pi payment for checkout:', checkout.metadata.checkout_id);
  return requestPiPayment(checkout);
}

/**
 * Format Pi amount for display
 */
export function formatPiAmount(amount: number): string {
  return `${amount.toFixed(2)} π`;
}
