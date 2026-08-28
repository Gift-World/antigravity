// supabase/functions/process-gate-scan/index.ts
// Validates scanned tickets, records entry/exit, checks capacity thresholds, triggers safety alerts
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

    const { ticketId, qrHash, gateId, eventId, staffId, direction = "in" } = await req.json();

    if (!ticketId || !qrHash || !gateId || !eventId) {
      return new Response(
        JSON.stringify({ success: false, reason: "missing_parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({ success: false, reason: "not_found", message: "Ticket not found in database." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate hash
    if (ticket.qr_code_hash !== qrHash) {
      return new Response(
        JSON.stringify({ success: false, reason: "invalid_hash", message: "Cryptographic QR hash mismatch. Counterfeit detected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Status check
    if (ticket.status === "scanned" && direction === "in") {
      return new Response(
        JSON.stringify({
          success: false,
          reason: "already_scanned",
          message: `Ticket already used at ${ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleTimeString() : 'earlier'}. Duplicate entry forbidden.`
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ticket.status === "revoked" || ticket.status === "refunded") {
      return new Response(
        JSON.stringify({ success: false, reason: "revoked", message: `Ticket is ${ticket.status}. Entry denied.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Record gate scan
    await supabaseClient.from("gate_scans").insert({
      event_id: eventId,
      gate_id: gateId,
      ticket_id: ticketId,
      scanned_by: staffId,
      direction,
      scanned_at: new Date().toISOString(),
    });

    // 5. Update ticket status
    await supabaseClient
      .from("tickets")
      .update({
        status: direction === "in" ? "scanned" : "valid",
        scanned_at: direction === "in" ? new Date().toISOString() : null,
        scanned_by: staffId,
        gate_id: gateId,
      })
      .eq("id", ticketId);

    // 6. Update event attendance counter
    const delta = direction === "in" ? 1 : -1;
    const { data: event } = await supabaseClient
      .from("events")
      .select("current_attendance, max_capacity, safety_config")
      .eq("id", eventId)
      .single();

    if (event) {
      const newAttendance = Math.max(0, (event.current_attendance || 0) + delta);
      await supabaseClient
        .from("events")
        .update({ current_attendance: newAttendance })
        .eq("id", eventId);

      const capacityRatio = newAttendance / event.max_capacity;
      const safety = event.safety_config || {};

      // Trigger automatic alerts if capacity reaches slow or stop thresholds
      if (capacityRatio >= (safety.capacity_stop_at || 0.98)) {
        await supabaseClient.from("alerts").insert({
          event_id: eventId,
          alert_type: "capacity_locked",
          message: `CRITICAL: Venue capacity at ${(capacityRatio * 100).toFixed(1)}% (${newAttendance}/${event.max_capacity}). Lock all entry gates immediately.`,
          severity: "critical",
          target_audience: "all",
          auto_generated: true,
        });
      } else if (capacityRatio >= (safety.capacity_slow_at || 0.90)) {
        await supabaseClient.from("alerts").insert({
          event_id: eventId,
          alert_type: "capacity_threshold",
          message: `WARNING: Venue capacity at ${(capacityRatio * 100).toFixed(1)}%. Restrict general turnstile flow.`,
          severity: "warning",
          target_audience: "security",
          auto_generated: true,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tier: ticket.tier,
        message: "Valid pass. Entry authorized.",
        scanned_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
