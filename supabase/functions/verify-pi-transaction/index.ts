import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('MY_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY');

// Pi Mainnet Horizon API endpoint
const PI_HORIZON_URL = 'https://api.mainnet.minepi.com';

interface TransactionVerificationResult {
  verified: boolean;
  transaction_hash: string;
  amount: number;
  recipient: string;
  sender: string;
  memo?: string;
  timestamp?: string;
  error?: string;
}

interface HorizonTransaction {
  id: string;
  successful: boolean;
  created_at: string;
  memo?: string;
  memo_type?: string;
  source_account: string;
}

interface HorizonOperation {
  id: string;
  type: string;
  amount: string;
  asset_type: string;
  from: string;
  to: string;
  transaction_hash: string;
  created_at: string;
}

/**
 * Verify a Pi transaction on-chain using the Horizon API
 * This ensures the payment was actually made to the correct wallet
 */
async function verifyTransactionOnChain(
  transactionHash: string,
  expectedRecipient: string,
  expectedAmount: number,
  expectedMemo?: string
): Promise<TransactionVerificationResult> {
  try {
    console.log(`Verifying transaction ${transactionHash} on Pi Mainnet...`);

    // Fetch transaction details from Horizon API
    const txResponse = await fetch(`${PI_HORIZON_URL}/transactions/${transactionHash}`);
    
    if (!txResponse.ok) {
      console.error(`Transaction not found: ${transactionHash}`);
      return {
        verified: false,
        transaction_hash: transactionHash,
        amount: 0,
        recipient: '',
        sender: '',
        error: 'Transaction not found on-chain'
      };
    }

    const txData: HorizonTransaction = await txResponse.json();
    console.log('Transaction data:', JSON.stringify(txData, null, 2));

    // Check if transaction was successful
    if (!txData.successful) {
      console.error('Transaction was not successful');
      return {
        verified: false,
        transaction_hash: transactionHash,
        amount: 0,
        recipient: '',
        sender: txData.source_account,
        error: 'Transaction was not successful'
      };
    }

    // Fetch operations for this transaction to get payment details
    const opsResponse = await fetch(`${PI_HORIZON_URL}/transactions/${transactionHash}/operations`);
    
    if (!opsResponse.ok) {
      console.error('Failed to fetch transaction operations');
      return {
        verified: false,
        transaction_hash: transactionHash,
        amount: 0,
        recipient: '',
        sender: txData.source_account,
        error: 'Failed to fetch transaction operations'
      };
    }

    const opsData = await opsResponse.json();
    const operations: HorizonOperation[] = opsData._embedded?.records || [];
    
    console.log(`Found ${operations.length} operations in transaction`);

    // Find the payment operation
    const paymentOp = operations.find(op => 
      op.type === 'payment' && op.asset_type === 'native'
    );

    if (!paymentOp) {
      console.error('No native payment operation found in transaction');
      return {
        verified: false,
        transaction_hash: transactionHash,
        amount: 0,
        recipient: '',
        sender: txData.source_account,
        error: 'No payment operation found'
      };
    }

    const actualAmount = parseFloat(paymentOp.amount);
    const actualRecipient = paymentOp.to;
    
    console.log(`Payment: ${actualAmount} Pi to ${actualRecipient}`);

    // Verify recipient matches expected merchant wallet
    if (actualRecipient !== expectedRecipient) {
      console.error(`Recipient mismatch: expected ${expectedRecipient}, got ${actualRecipient}`);
      return {
        verified: false,
        transaction_hash: transactionHash,
        amount: actualAmount,
        recipient: actualRecipient,
        sender: paymentOp.from,
        error: `Payment sent to wrong wallet. Expected: ${expectedRecipient}`
      };
    }

    // Verify amount matches (with small tolerance for floating point)
    const amountTolerance = 0.0001;
    if (Math.abs(actualAmount - expectedAmount) > amountTolerance) {
      console.error(`Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`);
      return {
        verified: false,
        transaction_hash: transactionHash,
        amount: actualAmount,
        recipient: actualRecipient,
        sender: paymentOp.from,
        error: `Payment amount mismatch. Expected: ${expectedAmount} Pi, Got: ${actualAmount} Pi`
      };
    }

    // Optionally verify memo (if provided)
    if (expectedMemo && txData.memo !== expectedMemo) {
      console.warn(`Memo mismatch: expected ${expectedMemo}, got ${txData.memo}`);
      // Don't fail on memo mismatch, just log warning
    }

    console.log('Transaction verified successfully!');
    
    return {
      verified: true,
      transaction_hash: transactionHash,
      amount: actualAmount,
      recipient: actualRecipient,
      sender: paymentOp.from,
      memo: txData.memo,
      timestamp: txData.created_at
    };

  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      verified: false,
      transaction_hash: transactionHash,
      amount: 0,
      recipient: '',
      sender: '',
      error: error instanceof Error ? error.message : 'Unknown verification error'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      transaction_hash, 
      order_id, 
      expected_amount, 
      expected_recipient,
      expected_memo,
      auto_release = true 
    } = await req.json();

    // Validate required fields
    if (!transaction_hash) {
      return new Response(
        JSON.stringify({ error: 'Missing transaction_hash' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying transaction: ${transaction_hash}`);
    console.log(`Expected recipient: ${expected_recipient}`);
    console.log(`Expected amount: ${expected_amount}`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // If order_id provided, fetch order and store details
    let orderData = null;
    let merchantWallet = expected_recipient;
    let orderAmount = expected_amount;

    if (order_id) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          stores:store_id (
            id,
            name,
            payout_wallet
          )
        `)
        .eq('id', order_id)
        .single();

      if (orderError) {
        console.error('Failed to fetch order:', orderError);
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      orderData = order;
      merchantWallet = order.stores?.payout_wallet || expected_recipient;
      orderAmount = order.total || expected_amount;

      // Check for duplicate transaction verification
      if (order.pi_txid === transaction_hash && order.status === 'paid') {
        console.log('Transaction already verified for this order');
        return new Response(
          JSON.stringify({ 
            verified: true, 
            message: 'Transaction already verified',
            order_status: order.status
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!merchantWallet) {
      return new Response(
        JSON.stringify({ error: 'Merchant wallet not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the transaction on-chain
    const verification = await verifyTransactionOnChain(
      transaction_hash,
      merchantWallet,
      orderAmount,
      expected_memo
    );

    // If verification failed, return error
    if (!verification.verified) {
      console.error('Transaction verification failed:', verification.error);
      
      // Update order status if order exists
      if (order_id) {
        await supabase
          .from('orders')
          .update({ 
            status: 'verification_failed',
            notes: verification.error,
            updated_at: new Date().toISOString()
          })
          .eq('id', order_id);
      }

      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: verification.error,
          details: verification 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verification successful - update order if auto_release is true
    if (order_id && auto_release) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          pi_txid: transaction_hash,
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id);

      if (updateError) {
        console.error('Failed to update order:', updateError);
      } else {
        console.log(`Order ${order_id} marked as paid and released`);
      }
    }

    console.log('Transaction verified and order released successfully');

    return new Response(
      JSON.stringify({ 
        verified: true,
        transaction: verification,
        order_id: order_id,
        auto_released: auto_release && order_id ? true : false,
        message: 'Payment verified on Pi Mainnet blockchain'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
