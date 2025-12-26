// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      console.error('Missing payment ID');
      return new Response(
        JSON.stringify({ error: 'Missing payment ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get PI_API_KEY from environment and trim any whitespace
    const PI_API_KEY = Deno.env.get('PI_API_KEY')?.trim();
    
    if (!PI_API_KEY) {
      console.error('PI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: PI_API_KEY not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Approving Pi payment:', paymentId);
    console.log('Using PI_API_KEY (first 10 chars):', PI_API_KEY.substring(0, 10) + '...');
    console.log('PI_API_KEY length:', PI_API_KEY.length);

    // Approve the payment with Pi Platform API (Mainnet)
    const approveResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await approveResponse.text();
    console.log('Pi API response status:', approveResponse.status);
    console.log('Pi API response body:', responseText);

    if (!approveResponse.ok) {
      console.error('Pi API approval failed:', approveResponse.status, responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to approve payment', 
          details: responseText,
          status: approveResponse.status 
        }),
        { status: approveResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let approvalResult;
    try {
      approvalResult = JSON.parse(responseText);
    } catch {
      approvalResult = { raw: responseText };
    }
    
    console.log('Payment approved successfully:', approvalResult);

    return new Response(
      JSON.stringify({ success: true, payment: approvalResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Payment approval error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
