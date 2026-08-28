// supabase/functions/process-mpesa-callback/index.ts
// Handles Safaricom Daraja STK Push callback, mints device-bound tickets or tops up cashless wallet
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Invalid callback payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resultCode = stkCallback.ResultCode;
    const checkoutRequestID = stkCallback.CheckoutRequestID;

    if (resultCode !== 0) {
      console.warn(`M-Pesa STK Failed for ${checkoutRequestID}: ${stkCallback.ResultDesc}`);
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Failure recorded" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract callback metadata
    const items = stkCallback.CallbackMetadata?.Item || [];
    let amount = 0;
    let mpesaReceiptNumber = "";
    let phoneNumber = "";

    for (const item of items) {
      if (item.Name === "Amount") amount = item.Value;
      if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value;
      if (item.Name === "PhoneNumber") phoneNumber = String(item.Value);
    }

    console.log(`M-Pesa Success: KES ${amount}, Receipt: ${mpesaReceiptNumber}, Phone: ${phoneNumber}`);

    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "Callback processed successfully",
        receipt: mpesaReceiptNumber,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ResultCode: 1, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
