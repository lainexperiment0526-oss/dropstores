import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PI_API_KEY = Deno.env.get('PI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('MY_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      console.error('Missing order ID');
      return new Response(
        JSON.stringify({ error: 'Missing order ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing merchant payout for order:', orderId);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Supabase env not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the order with store details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        stores:store_id (
          id,
          name,
          payout_wallet,
          owner_id
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order found:', order.id, 'Store:', order.stores?.name);

    // Check if store has payout wallet configured
    if (!order.stores?.payout_wallet) {
      console.error('Store does not have payout wallet configured');
      return new Response(
        JSON.stringify({ error: 'Merchant payout wallet not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if order has been paid
    if (!order.pi_payment_id || !order.pi_txid) {
      console.error('Order has not been paid via Pi');
      return new Response(
        JSON.stringify({ error: 'Order payment not completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if payout already processed
    if (order.payout_status === 'completed') {
      console.log('Payout already completed for order:', orderId);
      return new Response(
        JSON.stringify({ success: true, message: 'Payout already completed', payout_txid: order.payout_txid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const merchantWallet = order.stores.payout_wallet;
    const payoutAmount = order.total;

    console.log('Creating payout to merchant:', merchantWallet, 'Amount:', payoutAmount);

    // Fetch merchant's Pi UID from pi_users table
    const { data: merchantPiUser, error: piUserError } = await supabase
      .from('pi_users')
      .select('pi_uid, pi_username')
      .eq('user_id', order.stores.owner_id)
      .single();

    if (piUserError || !merchantPiUser) {
      console.error('Merchant not linked to Pi account:', piUserError);
      return new Response(
        JSON.stringify({ 
          error: 'Merchant not linked to Pi account',
          details: 'The store owner must authenticate with Pi Network first'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found merchant Pi UID:', merchantPiUser.pi_uid, 'Username:', merchantPiUser.pi_username);

    // Create app-to-user payment (payout to merchant)
    // Note: This requires the app to have Pi balance
    const payoutResponse = await fetch('https://api.minepi.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment: {
          amount: payoutAmount,
          memo: `Payout for order #${orderId.slice(-6)}`,
          metadata: {
            order_id: orderId,
            store_id: order.store_id,
            type: 'merchant_payout',
            merchant_pi_username: merchantPiUser.pi_username
          },
          uid: merchantPiUser.pi_uid, // Use merchant's Pi UID
        }
      }),
    });

    if (!payoutResponse.ok) {
      const errorText = await payoutResponse.text();
      console.error('Pi API payout failed:', payoutResponse.status, errorText);
      
      // Update order payout status to failed
      await supabase
        .from('orders')
        .update({ 
          payout_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({ error: 'Failed to create payout', details: errorText }),
        { status: payoutResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payoutResult = await payoutResponse.json();
    console.log('Payout created:', payoutResult);

    // Update order with payout info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payout_status: 'processing',
        payout_txid: payoutResult.identifier,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order payout status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payout: payoutResult,
        merchant_wallet: merchantWallet,
        amount: payoutAmount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Merchant payout error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
