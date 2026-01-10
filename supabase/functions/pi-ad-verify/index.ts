// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { adId, accessToken } = await req.json();

    if (!adId || !accessToken) {
      console.error('Pi Ad Verify: Missing adId or accessToken');
      return new Response(
        JSON.stringify({ error: 'Missing adId or accessToken' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // @ts-ignore: Deno global
    const PI_API_KEY = Deno.env.get('PI_API_KEY')?.trim();
    
    if (!PI_API_KEY) {
      console.error('Pi Ad Verify: PI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: PI_API_KEY missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pi Ad Verify: Verifying rewarded ad:', adId);

    // Verify the rewarded ad with Pi Platform API
    const verifyResponse = await fetch(`https://api.minepi.com/v2/ads/${adId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'X-User-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error('Pi Ad Verify: Verification failed:', {
        status: verifyResponse.status,
        statusText: verifyResponse.statusText,
        error: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          verified: false,
          error: 'Failed to verify rewarded ad', 
          details: `Pi API returned ${verifyResponse.status}: ${errorText}`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verificationResult = await verifyResponse.json();
    console.log('Pi Ad Verify: Verification result:', verificationResult);

    return new Response(
      JSON.stringify({
        verified: verificationResult.verified === true,
        adId: adId,
        result: verificationResult
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Pi Ad Verify error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        verified: false,
        error: 'Internal server error', 
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});