// Pi Payment Cancel Edge Function
// Handles cancellation of incomplete/stuck payments

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const PI_API_KEY = Deno.env.get('PI_API_KEY');
const PI_API_URL = 'https://api.minepi.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelPaymentRequest {
  paymentId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { paymentId }: CancelPaymentRequest = await req.json();

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚫 Cancelling payment:', paymentId, 'for user:', user.id);

    if (!PI_API_KEY) {
      console.error('❌ PI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Pi API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cancel the payment via Pi Network API
    try {
      const cancelResponse = await fetch(`${PI_API_URL}/v2/payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!cancelResponse.ok) {
        const errorText = await cancelResponse.text();
        console.error('❌ Pi API cancel failed:', cancelResponse.status, errorText);
        
        // If payment doesn't exist or already cancelled, consider it a success
        if (cancelResponse.status === 404 || errorText.includes('not found')) {
          console.log('✓ Payment not found or already cancelled');
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Payment already cancelled or not found',
              paymentId 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Pi API error: ${errorText}`);
      }

      const cancelData = await cancelResponse.json();
      console.log('✓ Payment cancelled via Pi API:', cancelData);

      // Update local database if payment record exists
      try {
        const { error: updateError } = await supabaseClient
          .from('pi_payments')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('payment_id', paymentId);

        if (updateError) {
          console.warn('⚠️ Failed to update local payment record:', updateError);
          // Don't fail the request if local update fails
        } else {
          console.log('✓ Updated local payment record');
        }
      } catch (dbError) {
        console.warn('⚠️ Database update error (non-critical):', dbError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment cancelled successfully',
          paymentId,
          data: cancelData,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (piError: any) {
      console.error('❌ Pi Network cancel error:', piError);
      return new Response(
        JSON.stringify({
          error: 'Failed to cancel payment via Pi Network',
          details: piError.message,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('❌ Cancel payment error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
