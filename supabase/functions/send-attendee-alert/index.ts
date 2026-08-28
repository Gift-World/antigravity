// supabase/functions/send-attendee-alert/index.ts
// Broadcasts high-priority push/in-app alert to attendees in a specific zone or entire stadium
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

    const { eventId, zoneId, message, severity = "warning", targetAudience = "attendees_zone" } = await req.json();

    if (!eventId || !message) {
      return new Response(JSON.stringify({ error: "eventId and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: alert, error } = await supabaseClient
      .from("alerts")
      .insert({
        event_id: eventId,
        zone_id: zoneId || null,
        message,
        severity,
        target_audience: targetAudience,
        auto_generated: false,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, alert, dispatched_to: targetAudience }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
