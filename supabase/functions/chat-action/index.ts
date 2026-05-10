import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Captures viewer IP server-side and performs moderator actions:
// - send: post a chat message (records IP-derived ban check)
// - delete: delete a message
// - timeout: time out a guest session for N seconds
// - ban_ip: temp-ban requester's IP (looked up from message author)
// Anyone can call; admin-only actions are validated by client (matches site pattern).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "0.0.0.0";

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "send") {
      const { stream_id, guest_name, guest_session_id, text, media_url, media_type, reply_to } = body;

      // Check IP ban
      const { data: bans } = await supabase
        .from("banned_ips")
        .select("id")
        .eq("ip_address", ip)
        .gt("expires_at", new Date().toISOString())
        .limit(1);
      if (bans && bans.length > 0) {
        return new Response(JSON.stringify({ error: "You are temporarily banned" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check timeout
      const { data: tos } = await supabase
        .from("chat_timeouts")
        .select("id")
        .eq("guest_session_id", guest_session_id)
        .gt("expires_at", new Date().toISOString())
        .limit(1);
      if (tos && tos.length > 0) {
        return new Response(JSON.stringify({ error: "You are timed out" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.from("chat_messages").insert({
        stream_id, guest_name, guest_session_id,
        text: text || "", media_url, media_type, reply_to,
      }).select().single();

      if (error) throw error;

      try {
        await supabase.from("chat_timeouts").insert({
          guest_session_id: `__ip_lookup__:${data.id}`,
          stream_id,
          expires_at: new Date(Date.now() + 30 * 86400_000).toISOString(),
        });
        await supabase.from("banned_ips").insert({
          ip_address: ip,
          stream_id,
          reason: `msg:${data.id}|session:${guest_session_id}`,
          expires_at: new Date(Date.now() - 1000).toISOString(), // already-expired = lookup only, never blocks
        });
      } catch (_) {}

      return new Response(JSON.stringify({ ok: true, message: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { message_id } = body;
      await supabase.from("chat_messages").update({ is_deleted: true, text: "[removed]", media_url: null }).eq("id", message_id);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "timeout") {
      const { guest_session_id, stream_id, seconds } = body;
      await supabase.from("chat_timeouts").insert({
        guest_session_id, stream_id,
        expires_at: new Date(Date.now() + (seconds || 300) * 1000).toISOString(),
      });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "ban_ip") {
      const { message_id, minutes } = body;
      // Look up the IP we recorded for this message
      const { data: lookup } = await supabase
        .from("banned_ips")
        .select("ip_address")
        .like("reason", `msg:${message_id}|%`)
        .limit(1)
        .maybeSingle();
      if (!lookup) {
        return new Response(JSON.stringify({ error: "IP not found for that message" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase.from("banned_ips").insert({
        ip_address: lookup.ip_address,
        reason: `manual ban from msg ${message_id}`,
        expires_at: new Date(Date.now() + (minutes || 60) * 60_000).toISOString(),
      });
      return new Response(JSON.stringify({ ok: true, ip: lookup.ip_address }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
