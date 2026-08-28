// supabase/functions/calculate-zone-density/index.ts
// Computes spatial crowd density per square meter, classifies risk levels, and triggers alerts
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

    // Fetch event configuration
    const { data: event } = await supabaseClient
      .from("events")
      .select("*, venue:venues(*, zones:venue_zones(*))")
      .eq("id", eventId)
      .single();

    if (!event || !event.venue?.zones) {
      return new Response(JSON.stringify({ error: "Event or zones not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const zones = event.venue.zones;
    const safety = event.safety_config || { density_warning: 4.5, density_critical: 5.5 };
    const readings = [];

    for (const zone of zones) {
      // Approximate zone area based on capacity (average 1 person / 0.8 sqm at standard capacity)
      const approxAreaSqm = Math.max(50, Math.round(zone.capacity * 0.8));
      
      // Fetch latest scan counts / estimation
      const { count } = await supabaseClient
        .from("gate_scans")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("gate_id", zone.id);

      const estimatedCount = count || Math.round(zone.capacity * 0.75);
      const density = Number((estimatedCount / approxAreaSqm).toFixed(2));

      let riskLevel = "safe";
      if (density >= safety.density_critical) {
        riskLevel = "critical";
      } else if (density >= safety.density_warning) {
        riskLevel = "warning";
      } else if (density >= 3.0) {
        riskLevel = "elevated";
      }

      const reading = {
        event_id: eventId,
        zone_id: zone.id,
        timestamp: new Date().toISOString(),
        estimated_count: estimatedCount,
        density_per_sqm: density,
        risk_level: riskLevel,
        source: "scan_count",
      };

      readings.push(reading);

      // Trigger automatic alerts if threshold breached
      if (riskLevel === "critical") {
        await supabaseClient.from("alerts").insert({
          event_id: eventId,
          zone_id: zone.id,
          alert_type: "density_critical",
          message: `CRITICAL SURGE: ${zone.name} density at ${density}/m² (Danger threshold ${safety.density_critical}). Immediate egress intervention required.`,
          severity: "critical",
          target_audience: "all",
          auto_generated: true,
        });
      } else if (riskLevel === "warning") {
        await supabaseClient.from("alerts").insert({
          event_id: eventId,
          zone_id: zone.id,
          alert_type: "density_warning",
          message: `DENSITY WARNING: ${zone.name} reached ${density}/m² (Warning threshold ${safety.density_warning}).`,
          severity: "warning",
          target_audience: "security",
          auto_generated: true,
        });
      }
    }

    if (readings.length > 0) {
      await supabaseClient.from("zone_density_readings").insert(readings);
    }

    return new Response(
      JSON.stringify({ success: true, count: readings.length, readings }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
