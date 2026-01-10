// @ts-ignore: Deno types
// Deno environment: suppress TS complaints in editor
// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno global declarations for editor tooling
declare const Deno: any;

// @ts-ignore: Deno std import (resolved at runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

interface CompletePaymentRequest {
  paymentId: string;
  txid: string;
}

interface PiApiResponse {
  transaction?: {
    txid: string;
    status: string;
    _id?: string;
  };
  error?: string;
  message?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { paymentId, txid } = await req.json() as CompletePaymentRequest;

    // Validate inputs
    if (!paymentId || !txid) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: paymentId and txid",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get API key from environment
    const piApiKey = Deno.env.get("PI_API_KEY");
    if (!piApiKey) {
      console.error("❌ PI_API_KEY not configured in environment");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: PI_API_KEY not set",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`📤 Calling Pi API to complete payment ${paymentId}...`);

    // Call Pi API Phase III: Complete Payment
    // Official docs: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
    // Endpoint: POST /v2/payments/{paymentId}/complete
    // Purpose: Complete payment after user has signed transaction
    const piResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${piApiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          txid: txid,
        }),
      }
    );

    const piData = (await piResponse.json()) as PiApiResponse;

    // Check if request was successful
    if (!piResponse.ok) {
      console.error(
        `❌ Pi API error (${piResponse.status}):`,
        piData.error || piData.message
      );

      // Return appropriate error based on status
      if (piResponse.status === 401 || piResponse.status === 403) {
        return new Response(
          JSON.stringify({
            error: "Authentication failed with Pi API",
            details: piData.error || piData.message,
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (piResponse.status === 404) {
        return new Response(
          JSON.stringify({
            error: "Payment not found",
            paymentId: paymentId,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Failed to complete payment",
          details: piData.error || piData.message,
        }),
        {
          status: piResponse.status || 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(
      `✅ Payment ${paymentId} completed successfully with txid: ${txid}`
    );

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        paymentId: paymentId,
        txid: txid,
        transaction: piData.transaction,
        message: "Payment completed successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("❌ Error in pi-payment-complete:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
