import { useEffect, useRef } from "react";
import { Room, RoomEvent, Track, type LocalTrackPublication } from "livekit-client";
import { supabase } from "@/integrations/supabase/client";

const SPRITES: Record<string, string> = {
  "!mario": "/sprites/mario.png",
  "!peach": "/sprites/peach.png",
  "!bowser": "/sprites/bowser.png",
  "!yoshi": "/sprites/yoshi.png",
  "!sonic": "/sprites/sonic.png",
};

// Tiny base64 jump sound (short blip via WebAudio fallback)
function playJump() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(523, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.25);
  } catch {}
}

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  } catch {}
}

export default function LiveOverlay({ room, streamId }: { room: Room; streamId: string }) {
  const screenRef = useRef<HTMLVideoElement>(null);
  const pipRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const spriteLayerRef = useRef<HTMLDivElement>(null);

  const appendChat = (text: string, sender?: string) => {
    if (!chatRef.current) return;
    const el = document.createElement("div");
    el.className = "px-3 py-1.5 mb-1 rounded-2xl bg-black/70 text-pink-300 text-sm max-w-[80%] backdrop-blur transition-opacity duration-700";
    el.innerHTML = sender ? `<b class="text-pink-400">${sender}:</b> ${text}` : text;
    chatRef.current.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; }, 9300);
    setTimeout(() => el.remove(), 10000);
  };

  const appendImage = (src: string, sender?: string) => {
    if (!chatRef.current) return;
    const el = document.createElement("div");
    el.className = "mb-1 transition-opacity duration-700";
    el.innerHTML = `${sender ? `<div class="text-xs text-pink-400 mb-0.5">${sender}</div>` : ""}<img src="${src}" class="max-w-[200px] rounded-lg border border-pink-500/40" />`;
    chatRef.current.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; }, 9300);
    setTimeout(() => el.remove(), 10000);
  };

  const triggerSprite = (src: string) => {
    if (!spriteLayerRef.current) return;
    playJump();
    const img = document.createElement("img");
    img.src = src;
    img.className = "absolute w-24 h-24 object-contain pointer-events-none";
    img.style.left = `${10 + Math.random() * 70}%`;
    img.style.bottom = "0";
    img.style.imageRendering = "pixelated";
    img.style.animation = "patriotJump 1.6s ease-out forwards";
    spriteLayerRef.current.appendChild(img);
    setTimeout(() => img.remove(), 1700);
  };

  const handleMessage = (text: string, sender?: string) => {
    appendChat(text, sender);
    speak(`${sender ? sender + " says " : ""}${text}`);
    const lower = text.toLowerCase();
    for (const key of Object.keys(SPRITES)) {
      if (lower.includes(key)) triggerSprite(SPRITES[key]);
    }
  };

  // Local track PIP (camera) + full-screen (screen share)
  useEffect(() => {
    const onPub = (pub: LocalTrackPublication) => {
      const t = pub.track;
      if (!t || t.kind !== Track.Kind.Video) return;
      if (pub.source === Track.Source.ScreenShare && screenRef.current) {
        t.attach(screenRef.current);
      } else if (pub.source === Track.Source.Camera && pipRef.current) {
        t.attach(pipRef.current);
      }
    };
    const onUnpub = (pub: LocalTrackPublication) => {
      if (pub.source === Track.Source.ScreenShare && screenRef.current) {
        pub.track?.detach(screenRef.current);
      }
    };
    room.localParticipant.videoTrackPublications.forEach((p) => onPub(p as LocalTrackPublication));
    room.on(RoomEvent.LocalTrackPublished, onPub);
    room.on(RoomEvent.LocalTrackUnpublished, onUnpub);
    return () => {
      room.off(RoomEvent.LocalTrackPublished, onPub);
      room.off(RoomEvent.LocalTrackUnpublished, onUnpub);
    };
  }, [room]);

  // Data messages (image paste from any participant)
  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: any) => {
      try {
        const txt = new TextDecoder().decode(payload);
        const msg = JSON.parse(txt);
        const sender = msg.sender || participant?.identity;
        if (msg.type === "image" && msg.data) appendImage(msg.data, sender);
        else if (msg.type === "text" && msg.text) handleMessage(msg.text, sender);
      } catch {}
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => { room.off(RoomEvent.DataReceived, onData); };
  }, [room]);

  // Realtime chat -> TTS + overlay + sprites (uses existing chat_messages stream)
  useEffect(() => {
    const ch = supabase.channel(`overlay-${streamId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `stream_id=eq.${streamId}` },
        (p: any) => {
          const m = p.new;
          if (m.image_url) appendImage(m.image_url, m.guest_name);
          else if (m.message) handleMessage(m.message, m.guest_name);
        }
      ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [streamId]);

  // Paste image -> publish to room
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith("image/")) {
          const file = it.getAsFile();
          if (!file) continue;
          e.preventDefault();
          const bmp = await createImageBitmap(file);
          const max = 480;
          const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
          const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
          const data = canvas.toDataURL("image/jpeg", 0.7);
          const payload = new TextEncoder().encode(JSON.stringify({ type: "image", data, sender: room.localParticipant.identity }));
          await room.localParticipant.publishData(payload, { reliable: true });
          appendImage(data, "You");
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [room]);

  return (
    <>
      <style>{`@keyframes patriotJump { 0%{transform:translateY(0) scale(1);opacity:1} 40%{transform:translateY(-220px) scale(1.05)} 80%{transform:translateY(-40px) scale(1)} 100%{transform:translateY(0) scale(1);opacity:0} }`}</style>
      {/* Full-screen screen share */}
      <video ref={screenRef} autoPlay playsInline muted className="fixed inset-0 w-screen h-screen object-contain bg-black pointer-events-none" style={{ zIndex: 1, display: "none" }} onLoadedMetadata={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "block"; }} />
      {/* PIP camera bottom-right */}
      <video ref={pipRef} autoPlay playsInline muted className="fixed bottom-4 right-4 rounded-lg border-2 border-pink-500 shadow-lg pointer-events-none" style={{ width: 200, transform: "scaleX(-1)", zIndex: 999 }} />
      {/* Chat overlay */}
      <div id="chat-overlay" ref={chatRef} className="fixed left-4 bottom-4 flex flex-col items-start pointer-events-none" style={{ zIndex: 998, maxWidth: 360 }} />
      {/* Sprite jump layer */}
      <div ref={spriteLayerRef} className="fixed inset-x-0 bottom-0 h-screen pointer-events-none overflow-hidden" style={{ zIndex: 997 }} />
    </>
  );
}
