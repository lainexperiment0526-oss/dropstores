import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PI_API_KEY = Deno.env.get('PI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Missing payment ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Approving Pi payment:', paymentId);

    // Approve the payment with Pi Platform API
    const approveResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!approveResponse.ok) {
      const errorText = await approveResponse.text();
      console.error('Pi API approval failed:', approveResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to approve payment', details: errorText }),
        { status: approveResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const approvalResult = await approveResponse.json();
    console.log('Payment approved:', approvalResult);

    return new Response(
      JSON.stringify({ success: true, payment: approvalResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Payment approval error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
