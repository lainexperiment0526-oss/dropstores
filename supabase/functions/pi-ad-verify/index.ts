// @ts-ignore: Deno types
// Deno environment: suppress TS complaints in editor
// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno global declarations for editor tooling
declare const Deno: any;

// @ts-ignore: Deno std import (resolved at runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

interface VerifyAdRequest {
  adId: string;
  accessToken: string;
}

interface PiAdVerifyResponse {
  mediator_ack_status: "granted" | "pending" | "rejected" | string;
  mediator_ack_status_reason?: string;
  _id?: string;
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
    const { adId, accessToken } = await req.json() as VerifyAdRequest;

    // Validate inputs
    if (!adId || !accessToken) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: adId and accessToken",
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

    console.log(`📤 Verifying rewarded ad ${adId}...`);

    // Call Pi API to verify the rewarded ad
    // Official docs: https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md
    // Endpoint: GET /v2/ads/{adId}/verify
    // Purpose: Verify rewarded ad completion before granting rewards to user
    // Security: Use both API key (backend auth) and user access token (frontend auth)
    const piResponse = await fetch(
      `https://api.minepi.com/v2/ads/${adId}/verify`,
      {
        method: "GET",
        headers: {
          "Authorization": `Key ${piApiKey}`,
          "X-User-Token": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
      }
    );

    const piData = (await piResponse.json()) as PiAdVerifyResponse;

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
            error: "Ad not found",
            adId: adId,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Failed to verify ad",
          details: piData.error || piData.message,
        }),
        {
          status: piResponse.status || 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`📊 Ad verification response:`, piData);

    // Check the mediator acknowledgment status
    // Only "granted" status means the user successfully completed the ad
    // and the reward should be granted
    const isRewardGranted = piData.mediator_ack_status === "granted";

    if (!isRewardGranted) {
      console.warn(
        `⚠️ Ad ${adId} not verified for reward. Status: ${piData.mediator_ack_status}`
      );

      return new Response(
        JSON.stringify({
          verified: false,
          adId: adId,
          status: piData.mediator_ack_status,
          reason: piData.mediator_ack_status_reason || "Ad not granted by mediator",
          message: "User is not eligible for reward",
        }),
        {
          status: 200, // Return 200 but indicate reward not granted
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ Ad ${adId} verified successfully. Reward can be granted.`);

    // Return success response - safe to grant reward
    return new Response(
      JSON.stringify({
        verified: true,
        adId: adId,
        status: piData.mediator_ack_status,
        message: "Ad verified. Safe to grant reward to user",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("❌ Error in pi-ad-verify:", error);
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