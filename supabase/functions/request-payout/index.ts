import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { storeId, amount, walletAddress, notes } = await req.json();

    if (!storeId || !amount || !walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: storeId, amount, walletAddress' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing payout request for user:', user.id);

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, owner_id, name, payout_wallet')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      console.error('Store not found:', storeError);
      return new Response(
        JSON.stringify({ error: 'Store not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (store.owner_id !== user.id) {
      console.error('User does not own this store');
      return new Response(
        JSON.stringify({ error: 'You do not own this store' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check available balance from merchant_sales
    const { data: pendingSales, error: salesError } = await supabase
      .from('merchant_sales')
      .select('id, net_amount')
      .eq('store_id', storeId)
      .eq('payout_status', 'pending');

    if (salesError) {
      console.error('Error fetching sales:', salesError);
      return new Response(
        JSON.stringify({ error: 'Failed to check available balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const availableBalance = pendingSales?.reduce((sum, sale) => sum + Number(sale.net_amount), 0) || 0;
    console.log('Available balance:', availableBalance, 'Requested:', amount);

    if (amount > availableBalance) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient balance', 
          available: availableBalance,
          requested: amount 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payout request
    const serviceSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: payout, error: payoutError } = await serviceSupabase
      .from('merchant_payouts')
      .insert({
        store_id: storeId,
        owner_id: user.id,
        amount: amount,
        wallet_address: walletAddress,
        status: 'pending',
        notes: notes || `Manual withdrawal request. Note: Smart contracts not available yet on Pi Network. Payouts processed manually.`,
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Failed to create payout request:', payoutError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payout request', details: payoutError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payout request created:', payout.id);

    // Mark sales as "processing" for this payout
    let remainingAmount = amount;
    const salesToUpdate: string[] = [];

    for (const sale of (pendingSales || [])) {
      if (remainingAmount <= 0) break;
      salesToUpdate.push(sale.id);
      remainingAmount -= Number(sale.net_amount);
    }

    if (salesToUpdate.length > 0) {
      await serviceSupabase
        .from('merchant_sales')
        .update({ 
          payout_status: 'processing',
          payout_id: payout.id
        })
        .in('id', salesToUpdate);
      
      console.log('Marked', salesToUpdate.length, 'sales as processing');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payout: {
          id: payout.id,
          amount: payout.amount,
          status: payout.status,
          wallet_address: payout.wallet_address,
          requested_at: payout.requested_at
        },
        message: 'Payout request submitted. Note: Smart contracts are not yet available on Pi Network. Payouts will be processed manually and may take 1-3 business days.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payout request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
