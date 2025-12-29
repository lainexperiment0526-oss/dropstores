// @ts-ignore: Deno types
// Deno environment: suppress TS complaints in editor
// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno global declarations for editor tooling
declare const Deno: any;

// @ts-ignore: Deno std import (resolved at runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Supabase client for Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Pi Mainnet Horizon API endpoint
const PI_HORIZON_URL = 'https://api.mainnet.minepi.com';

// Plan durations in days (all monthly plans)
const PLAN_DURATIONS: Record<string, number> = {
  basic: 30,
  grow: 30,
  advance: 30,
  plus: 30,
  product_purchase: 0, // Not a subscription
};

// Platform fee percentage (5%)
const PLATFORM_FEE_PERCENT = 0.05;

/**
 * Verify a Pi transaction on-chain using the Horizon API
 */
async function verifyTransactionOnChain(
  txid: string,
  expectedRecipient: string,
  expectedAmount: number
): Promise<{ verified: boolean; error?: string; actualAmount?: number; actualRecipient?: string }> {
  try {
    console.log(`Verifying transaction ${txid} on Pi Mainnet blockchain...`);

    const txResponse = await fetch(`${PI_HORIZON_URL}/transactions/${txid}`);
    
    if (!txResponse.ok) {
      console.error(`Transaction not found on-chain: ${txid}`);
      return { verified: false, error: 'Transaction not found on blockchain' };
    }

    const txData = await txResponse.json();

    if (!txData.successful) {
      console.error('Transaction was not successful on-chain');
      return { verified: false, error: 'Transaction was not successful' };
    }

    const opsResponse = await fetch(`${PI_HORIZON_URL}/transactions/${txid}/operations`);
    
    if (!opsResponse.ok) {
      console.error('Failed to fetch transaction operations');
      return { verified: false, error: 'Failed to fetch transaction operations' };
    }

    const opsData = await opsResponse.json();
    const operations = opsData._embedded?.records || [];

    const paymentOp = operations.find((op: { type: string; asset_type: string }) => 
      op.type === 'payment' && op.asset_type === 'native'
    );

    if (!paymentOp) {
      console.error('No native payment operation found in transaction');
      return { verified: false, error: 'No payment operation found' };
    }

    const actualAmount = parseFloat(paymentOp.amount);
    const actualRecipient = paymentOp.to;

    console.log(`On-chain payment: ${actualAmount} Pi to ${actualRecipient}`);

    if (actualRecipient !== expectedRecipient) {
      console.error(`Recipient mismatch: expected ${expectedRecipient}, got ${actualRecipient}`);
      return { 
        verified: false, 
        error: `Payment sent to wrong wallet`,
        actualAmount,
        actualRecipient 
      };
    }

    const amountTolerance = 0.0001;
    if (Math.abs(actualAmount - expectedAmount) > amountTolerance) {
      console.error(`Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`);
      return { 
        verified: false, 
        error: `Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`,
        actualAmount,
        actualRecipient
      };
    }

    console.log('On-chain verification successful!');
    return { verified: true, actualAmount, actualRecipient };

  } catch (error) {
    console.error('On-chain verification error:', error);
    return { verified: false, error: error instanceof Error ? error.message : 'Verification failed' };
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, txid, planType, storeId } = await req.json();

    if (!paymentId || !txid) {
      console.error('Missing payment ID or transaction ID');
      return new Response(
        JSON.stringify({ error: 'Missing payment ID or transaction ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get PI_API_KEY from environment and trim whitespace
    const PI_API_KEY = Deno.env.get('PI_API_KEY')?.trim();
    
    if (!PI_API_KEY) {
      console.error('PI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: PI_API_KEY not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Completing Pi payment:', paymentId, 'txid:', txid, 'planType:', planType);
    console.log('Using PI_API_KEY (first 10 chars):', PI_API_KEY.substring(0, 10) + '...');
    console.log('PI_API_KEY length:', PI_API_KEY.length);

    // Complete the payment with Pi Platform API
    const completeResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    const completeResponseText = await completeResponse.text();
    console.log('Pi API complete response status:', completeResponse.status);
    console.log('Pi API complete response body:', completeResponseText);

    if (!completeResponse.ok) {
      console.error('Pi API completion failed:', completeResponse.status, completeResponseText);
      return new Response(
        JSON.stringify({ error: 'Failed to complete payment', details: completeResponseText }),
        { status: completeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let completionResult;
    try {
      completionResult = JSON.parse(completeResponseText);
    } catch {
      completionResult = { raw: completeResponseText };
    }
    console.log('Payment completed on Pi Network:', completionResult);

    // Get payment details from Pi Platform API
    const paymentResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
      },
    });

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment details');
      return new Response(
        JSON.stringify({ error: 'Failed to fetch payment details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentData = await paymentResponse.json();
    console.log('Payment data:', paymentData);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // For product purchases, verify on-chain and create order + sales record
    if (planType === 'product_purchase') {
      console.log('Processing product purchase...');
      
      const metadata = paymentData.metadata || {};
      const merchantWallet = metadata.merchant_wallet;
      const paymentAmount = paymentData.amount;

      // Verify transaction on-chain if merchant wallet is configured
      let onChainVerification: { verified: boolean; error?: string } = { verified: true };
      if (merchantWallet) {
        console.log(`Verifying on-chain payment to merchant wallet: ${merchantWallet}`);
        onChainVerification = await verifyTransactionOnChain(txid, merchantWallet, paymentAmount);
        
        if (!onChainVerification.verified) {
          console.error('On-chain verification failed:', onChainVerification.error);
          return new Response(
            JSON.stringify({ 
              error: 'Payment verification failed', 
              details: onChainVerification.error,
              verified_on_chain: false
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('On-chain verification passed!');
      } else {
        console.warn('No merchant wallet configured, skipping on-chain verification');
      }

      // Create order in database
      const orderData = {
        store_id: metadata.store_id,
        customer_name: metadata.customer_name || 'Customer',
        customer_email: metadata.customer_email || '',
        items: metadata.items || [],
        total: paymentAmount,
        status: 'paid',
        pi_payment_id: paymentId,
        pi_txid: txid,
        notes: `Payment verified on Pi Mainnet. Recipient: ${merchantWallet || 'N/A'}`
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Failed to create order:', orderError);
      } else {
        console.log('Order created:', order.id);

        // Get store owner info for sales tracking
        const { data: store } = await supabase
          .from('stores')
          .select('owner_id')
          .eq('id', metadata.store_id)
          .single();

        if (store) {
          // Create merchant sales record
          const platformFee = paymentAmount * PLATFORM_FEE_PERCENT;
          const netAmount = paymentAmount - platformFee;

          const { error: salesError } = await supabase
            .from('merchant_sales')
            .insert({
              store_id: metadata.store_id,
              order_id: order.id,
              owner_id: store.owner_id,
              amount: paymentAmount,
              platform_fee: platformFee,
              net_amount: netAmount,
              pi_txid: txid,
              payout_status: 'pending'
            });

          if (salesError) {
            console.error('Failed to create sales record:', salesError);
          } else {
            console.log('Sales record created for merchant');
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          payment: completionResult,
          verified: paymentData,
          verified_on_chain: onChainVerification.verified,
          order_id: order?.id,
          type: 'product_purchase'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For subscriptions, continue with existing flow
    const allowedPlanTypes = ['free', 'basic', 'grow', 'advance', 'plus', 'monthly', 'yearly'];
    if (!planType || !allowedPlanTypes.includes(planType)) {
      console.error('Invalid or missing plan type:', planType);
      return new Response(
        JSON.stringify({ error: 'Invalid plan type', details: `planType must be one of ${allowedPlanTypes.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const piUid = paymentData.user_uid;
    if (!piUid) {
      console.error('Missing pi_uid in payment data');
      return new Response(
        JSON.stringify({ error: 'Missing Pi user ID in payment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up pi user
    let piUser: any = null;
    const { data: existingPiUser, error: piUserError } = await supabase
      .from('pi_users')
      .select('user_id')
      .eq('pi_uid', piUid)
      .single();

    if (piUserError) {
      // If pi_user doesn't exist, try to create it from metadata
      console.log('Pi user not found, attempting to create:', piUid);
      const metadata = paymentData.metadata || {};
      const userId = metadata.userId as string;
      
      if (!userId) {
        console.error('Cannot create pi_user: missing userId in metadata');
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Creating pi_user mapping for pi_uid:', piUid);
      const { data: newPiUser, error: createError } = await supabase
        .from('pi_users')
        .insert({ pi_uid: piUid, user_id: userId })
        .select('user_id')
        .single();

      if (createError) {
        console.error('Failed to create pi_user:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to link Pi account', details: createError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      piUser = newPiUser;
    } else {
      piUser = existingPiUser;
    }

    if (!piUser) {
      console.error('Failed to get or create pi_user');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found user:', piUser.user_id);

    // Calculate subscription expiry based on plan type
    const now = new Date();
    const expiresAt = new Date(now);
    const durationDays = PLAN_DURATIONS[planType] || 30;
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    console.log('Creating subscription:', {
      user_id: piUser.user_id,
      plan_type: planType,
      expires_at: expiresAt.toISOString()
    });

    // Check for existing active subscription and update/deactivate with safe fallback
    const { data: existingSub, error: existingSubError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', piUser.user_id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSubError && existingSubError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', existingSubError);
    }

    if (existingSub) {
      const updatedAt = now.toISOString();
      const { error: deactivateError } = await supabase
        .from('subscriptions')
        .update({ status: 'superseded', updated_at: updatedAt })
        .eq('id', existingSub.id);

      if (deactivateError) {
        // Fallback to a constraint-safe status if the check constraint is outdated
        console.error('Failed to mark old subscription as superseded, falling back to expired:', deactivateError);
        const { error: fallbackError } = await supabase
          .from('subscriptions')
          .update({ status: 'expired', updated_at: updatedAt })
          .eq('id', existingSub.id);

        if (fallbackError) {
          console.error('Failed to mark old subscription as expired:', fallbackError);
        } else {
          console.log('Old subscription marked expired (fallback):', existingSub.id);
        }
      } else {
        console.log('Deactivated old subscription:', existingSub.id);
      }
    }

    // Create new subscription record
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: piUser.user_id,
        store_id: storeId || null,
        plan_type: planType,
        status: 'active',
        pi_payment_id: paymentId,
        pi_transaction_id: txid,
        amount: paymentData.amount,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Failed to create subscription:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription', details: subscriptionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subscription created successfully:', subscription.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment: completionResult,
        subscription: {
          id: subscription.id,
          planType,
          expiresAt: expiresAt.toISOString(),
          status: 'active'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Payment completion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
