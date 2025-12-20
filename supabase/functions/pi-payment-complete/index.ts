import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PI_API_KEY = Deno.env.get('PI_API_KEY');
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

/**
 * Verify a Pi transaction on-chain using the Horizon API
 * This ensures the payment was actually made to the correct wallet
 */
async function verifyTransactionOnChain(
  txid: string,
  expectedRecipient: string,
  expectedAmount: number
): Promise<{ verified: boolean; error?: string; actualAmount?: number; actualRecipient?: string }> {
  try {
    console.log(`Verifying transaction ${txid} on Pi Mainnet blockchain...`);

    // Fetch transaction details from Horizon API
    const txResponse = await fetch(`${PI_HORIZON_URL}/transactions/${txid}`);
    
    if (!txResponse.ok) {
      console.error(`Transaction not found on-chain: ${txid}`);
      return { verified: false, error: 'Transaction not found on blockchain' };
    }

    const txData = await txResponse.json();

    // Check if transaction was successful
    if (!txData.successful) {
      console.error('Transaction was not successful on-chain');
      return { verified: false, error: 'Transaction was not successful' };
    }

    // Fetch operations for this transaction to get payment details
    const opsResponse = await fetch(`${PI_HORIZON_URL}/transactions/${txid}/operations`);
    
    if (!opsResponse.ok) {
      console.error('Failed to fetch transaction operations');
      return { verified: false, error: 'Failed to fetch transaction operations' };
    }

    const opsData = await opsResponse.json();
    const operations = opsData._embedded?.records || [];

    // Find the payment operation (native Pi transfer)
    const paymentOp = operations.find((op: any) => 
      op.type === 'payment' && op.asset_type === 'native'
    );

    if (!paymentOp) {
      console.error('No native payment operation found in transaction');
      return { verified: false, error: 'No payment operation found' };
    }

    const actualAmount = parseFloat(paymentOp.amount);
    const actualRecipient = paymentOp.to;

    console.log(`On-chain payment: ${actualAmount} Pi to ${actualRecipient}`);

    // Verify recipient matches expected merchant wallet
    if (actualRecipient !== expectedRecipient) {
      console.error(`Recipient mismatch: expected ${expectedRecipient}, got ${actualRecipient}`);
      return { 
        verified: false, 
        error: `Payment sent to wrong wallet`,
        actualAmount,
        actualRecipient 
      };
    }

    // Verify amount matches (with small tolerance for floating point)
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

serve(async (req) => {
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

    console.log('Completing Pi payment:', paymentId, 'txid:', txid, 'planType:', planType);

    // Complete the payment with Pi Platform API
    const completeResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      console.error('Pi API completion failed:', completeResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to complete payment', details: errorText }),
        { status: completeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const completionResult = await completeResponse.json();
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

    // For product purchases, verify on-chain and create order
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
        // Payment succeeded but order creation failed - log but don't fail the request
      } else {
        console.log('Order created:', order.id);
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
    // Find the user by Pi UID
    const { data: piUser, error: piUserError } = await supabase
      .from('pi_users')
      .select('user_id')
      .eq('pi_uid', paymentData.user_uid)
      .single();

    if (piUserError || !piUser) {
      console.error('Pi user not found:', paymentData.user_uid, piUserError);
      return new Response(
        JSON.stringify({ error: 'User not found', details: 'Pi user not linked to account' }),
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

    // Check for existing active subscription and update/deactivate
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', piUser.user_id)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      // Deactivate old subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'superseded', updated_at: now.toISOString() })
        .eq('id', existingSub.id);
      console.log('Deactivated old subscription:', existingSub.id);
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
