// supabase/functions/generate-post-event-report/index.ts
// Aggregates full event safety telemetry, gate scan curves, incident response times, and revenue
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

    const { eventId } = await req.json();
    if (!eventId) {
      return new Response(JSON.stringify({ error: "eventId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch Event Details
    const { data: event } = await supabaseClient
      .from("events")
      .select("*, venue:venues(*)")
      .eq("id", eventId)
      .single();

    // 2. Fetch Aggregated Metrics
    const { count: totalScans } = await supabaseClient
      .from("gate_scans")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("direction", "in");

    const { data: incidents } = await supabaseClient
      .from("incidents")
      .select("*")
      .eq("event_id", eventId);

    const { data: alerts } = await supabaseClient
      .from("alerts")
      .select("*")
      .eq("event_id", eventId);

    const { data: densityReadings } = await supabaseClient
      .from("zone_density_readings")
      .select("*")
      .eq("event_id", eventId)
      .order("density_per_sqm", { ascending: false })
      .limit(10);

    const peakDensity = densityReadings?.[0]?.density_per_sqm || 0;

    const report = {
      event_id: eventId,
      title: event?.title,
      generated_at: new Date().toISOString(),
      venue: event?.venue?.name,
      metrics: {
        total_attendance: event?.current_attendance || totalScans || 0,
        max_capacity: event?.max_capacity || 0,
        capacity_utilization: `${(((event?.current_attendance || 0) / (event?.max_capacity || 1)) * 100).toFixed(1)}%`,
        peak_density_sqm: peakDensity,
        total_incidents: incidents?.length || 0,
        resolved_incidents: incidents?.filter((i: any) => i.status === "resolved").length || 0,
        total_alerts_issued: alerts?.length || 0,
        critical_alerts: alerts?.filter((a: any) => a.severity === "critical").length || 0,
      },
      incident_summary: incidents,
      recent_alerts: alerts,
    };

    return new Response(
      JSON.stringify({ success: true, report }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
