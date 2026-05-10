import { corsHeaders } from "@supabase/supabase-js/cors";
import { createHmac } from "node:crypto";

// Mint a LiveKit JWT (HS256). Avoids needing the server SDK.
function base64url(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let str = btoa(String.fromCharCode(...bytes));
  return str.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = base64url(JSON.stringify(header));
  const encPayload = base64url(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const sig = createHmac("sha256", secret).update(data).digest();
  return `${data}.${base64url(new Uint8Array(sig))}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LIVEKIT_API_KEY");
    const apiSecret = Deno.env.get("LIVEKIT_API_SECRET");
    const wsUrl = Deno.env.get("LIVEKIT_URL");
    if (!apiKey || !apiSecret || !wsUrl) throw new Error("LiveKit env not configured");

    const { room, identity, name, isHost } = await req.json();
    if (!room || !identity) throw new Error("room and identity required");

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: apiKey,
      sub: identity,
      name: name || identity,
      nbf: now,
      exp: now + 60 * 60 * 6, // 6h
      video: {
        room,
        roomJoin: true,
        canPublish: !!isHost,
        canSubscribe: true,
        canPublishData: true,
      },
    };

    const token = signJwt(payload, apiSecret);
    return new Response(JSON.stringify({ token, url: wsUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
