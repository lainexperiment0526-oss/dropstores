import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, txid, planType, storeId } = await req.json();

    if (!paymentId || !txid) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: paymentId and txid" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const piApiKey = Deno.env.get("PI_API_KEY");
    if (!piApiKey) {
      return new Response(
        JSON.stringify({ error: "PI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📤 Completing payment ${paymentId} with txid ${txid}`);

    // Call Pi API to complete payment
    const piResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${piApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
      }
    );

    const piData = await piResponse.json();

    if (!piResponse.ok) {
      console.error(`❌ Pi API error (${piResponse.status}):`, piData);
      return new Response(
        JSON.stringify({ error: "Failed to complete payment", details: piData.error || piData.message }),
        { status: piResponse.status || 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ Payment ${paymentId} completed on Pi API`);

    // If this is a subscription payment, create/update subscription
    if (planType && planType !== "product_purchase") {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get user from auth header
        const authHeader = req.headers.get("Authorization");
        let userId: string | null = null;

        if (authHeader) {
          const token = authHeader.replace("Bearer ", "");
          const { data: { user } } = await supabase.auth.getUser(token);
          userId = user?.id ?? null;
        }

        if (userId) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);

          // Deactivate old subscriptions
          await supabase
            .from("subscriptions")
            .update({ status: "expired" })
            .eq("user_id", userId)
            .eq("status", "active");

          // Create new subscription
          const { data: subscription, error: subError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              plan_type: planType,
              status: "active",
              amount: piData.amount || 0,
              expires_at: expiryDate.toISOString(),
              pi_payment_id: paymentId,
              pi_transaction_id: txid,
              store_id: storeId || null,
            })
            .select()
            .single();

          if (subError) {
            console.error("❌ Subscription creation error:", subError);
          } else {
            console.log("✅ Subscription created:", subscription.id);
          }

          return new Response(
            JSON.stringify({
              success: true,
              paymentId,
              txid,
              subscription: subscription || null,
              message: "Payment completed and subscription activated",
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      } catch (subErr) {
        console.error("❌ Subscription processing error:", subErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        txid,
        transaction: piData.transaction,
        message: "Payment completed successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("❌ Error in pi-payment-complete:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
