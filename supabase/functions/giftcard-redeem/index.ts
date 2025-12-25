// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const PLAN_DURATIONS: Record<string, number> = {
  basic: 30,
  grow: 30,
  advance: 30,
  plus: 30,
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing gift card code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Redeeming gift card for user:', user.id);

    // Find gift card by code
    const { data: giftCard, error: lookupError } = await supabase
      .from('giftcards')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (lookupError || !giftCard) {
      console.error('Gift card not found:', code);
      return new Response(
        JSON.stringify({ error: 'Gift card not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already redeemed
    if (giftCard.redeemed_at) {
      return new Response(
        JSON.stringify({ error: 'This gift card has already been redeemed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    const expiryDate = new Date(giftCard.expires_at);
    if (new Date() > expiryDate) {
      return new Response(
        JSON.stringify({ error: 'This gift card has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create subscription from gift card
    const now = new Date();
    const expiresAt = new Date(now);
    const durationDays = PLAN_DURATIONS[giftCard.plan_type] || 30;
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    console.log('Creating subscription from gift card:', {
      plan_type: giftCard.plan_type,
      user_id: user.id,
      amount: giftCard.amount,
    });

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: giftCard.plan_type,
        status: 'active',
        amount: giftCard.amount,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        notes: `Redeemed from gift card: ${code}`,
      })
      .select()
      .single();

    if (subError) {
      console.error('Failed to create subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription', details: subError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark gift card as redeemed
    const { error: updateError } = await supabase
      .from('giftcards')
      .update({
        redeemed_by: user.id,
        redeemed_at: now.toISOString(),
        subscription_id: subscription.id,
      })
      .eq('id', giftCard.id);

    if (updateError) {
      console.error('Failed to update gift card:', updateError);
    }

    console.log('Gift card redeemed successfully:', code);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          planType: giftCard.plan_type,
          amount: giftCard.amount,
          expiresAt: expiresAt.toISOString(),
          message: `🎁 Gift card redeemed! Your ${giftCard.plan_type} subscription is now active.`,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Gift card redemption error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
