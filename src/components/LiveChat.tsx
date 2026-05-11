import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AVAILABLE_BADGES, type UserProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Reply, Trash2, Clock, Ban, Smile } from "lucide-react";
import GiphyPicker from "./GiphyPicker";

const EMOJIS = ["🔥","😂","💀","🦅","🇺🇸","❤️","👀","🤣","🤯","😎","💯","🙏","👏","🎉","😭","🤡"];

interface ChatMsg {
  id: string;
  stream_id: string;
  guest_name: string;
  guest_session_id: string;
  text: string;
  media_url: string | null;
  media_type: string | null;
  reply_to: string | null;
  is_deleted: boolean;
  created_at: string;
}

interface Props {
  streamId: string;
  guestName: string;
  guestSessionId: string;
  isModerator: boolean;
  profiles: Record<string, UserProfile>;
  hostUserId: string;
}

function linkify(text: string) {
  const re = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? <a key={i} href={p} target="_blank" rel="noreferrer" className="underline text-primary">{p}</a> : <span key={i}>{p}</span>
  );
}

export default function LiveChat({ streamId, guestName, guestSessionId, isModerator, profiles, hostUserId }: Props) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMsg | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing + subscribe
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("stream_id", streamId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (mounted && data) setMsgs(data.filter(m => !m.guest_session_id.startsWith("__ip_lookup__")) as ChatMsg[]);
    })();
    const ch = supabase
      .channel(`chat-${streamId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages", filter: `stream_id=eq.${streamId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const m = payload.new as ChatMsg;
            if (m.guest_session_id.startsWith("__ip_lookup__")) return;
            setMsgs(prev => [...prev, m]);
          } else if (payload.eventType === "UPDATE") {
            setMsgs(prev => prev.map(x => x.id === (payload.new as ChatMsg).id ? payload.new as ChatMsg : x));
          } else if (payload.eventType === "DELETE") {
            setMsgs(prev => prev.filter(x => x.id !== (payload.old as ChatMsg).id));
          }
        })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [streamId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!text.trim() && !media) return;
    const body = {
      action: "send",
      stream_id: streamId,
      guest_name: guestName,
      guest_session_id: guestSessionId,
      text: text.trim(),
      media_url: media?.url,
      media_type: media?.type,
      reply_to: replyTo?.id,
    };
    const { data, error } = await supabase.functions.invoke("chat-action", { body });
    if (error || (data as any)?.error) {
      alert((data as any)?.error || "Failed to send");
      return;
    }
    setText(""); setMedia(null); setReplyTo(null);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop() || "bin";
    const path = `chat/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, f);
    if (error) { alert(error.message); return; }
    const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    setMedia({ url, type: f.type.startsWith("video") ? "video" : "image" });
  };

  const modAction = async (action: string, extra: Record<string, unknown>) => {
    const { data } = await supabase.functions.invoke("chat-action", { body: { action, ...extra } });
    if ((data as any)?.error) alert((data as any).error);
  };

  const renderHostBadges = (name: string) => {
    if (name !== hostUserId) return null;
    const prof = profiles[hostUserId];
    if (!prof?.badges?.length) return null;
    return prof.badges.map(bid => {
      const b = AVAILABLE_BADGES.find(x => x.id === bid);
      return b ? <img key={bid} src={b.image} alt={b.name} title={b.name} className="w-4 h-4 inline-block" /> : null;
    });
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-primary/30 overflow-hidden">
      <div className="px-3 py-2 border-b border-primary/30 flex items-center justify-between">
        <span className="text-pink-400 font-bold text-sm">LIVE CHAT</span>
        <span className="text-xs text-pink-200">{guestName}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {msgs.map(m => {
          const replied = m.reply_to ? msgs.find(x => x.id === m.reply_to) : null;
          const isHost = m.guest_name === hostUserId;
          return (
            <div key={m.id} className="rounded-2xl bg-zinc-900 px-3 py-1.5 group">
              {replied && (
                <div className="text-[10px] text-pink-300/70 border-l-2 border-pink-500 pl-2 mb-1 truncate">
                  ↪ {replied.guest_name}: {replied.text || "[media]"}
                </div>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-bold ${isHost ? "text-pink-400" : "text-pink-300"}`}>{m.guest_name}{isHost && " 🎙️"}</span>
                {renderHostBadges(m.guest_name)}
                <span className="text-[10px] text-zinc-500">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <div className="flex-1" />
                <button onClick={() => setReplyTo(m)} className="opacity-0 group-hover:opacity-100 text-pink-300/60 hover:text-pink-300"><Reply className="w-3 h-3" /></button>
                {isModerator && !m.is_deleted && (
                  <>
                    <button onClick={() => modAction("delete", { message_id: m.id })} className="opacity-0 group-hover:opacity-100 text-red-400" title="Delete"><Trash2 className="w-3 h-3" /></button>
                    <button onClick={() => modAction("timeout", { guest_session_id: m.guest_session_id, stream_id: streamId, seconds: 300 })} className="opacity-0 group-hover:opacity-100 text-yellow-400" title="5min timeout"><Clock className="w-3 h-3" /></button>
                    <button onClick={() => modAction("ban_ip", { message_id: m.id, minutes: 60 })} className="opacity-0 group-hover:opacity-100 text-red-500" title="1h IP ban"><Ban className="w-3 h-3" /></button>
                  </>
                )}
              </div>
              {m.text && <div className="text-pink-100 text-sm break-words">{linkify(m.text)}</div>}
              {m.media_url && (
                m.media_type === "video"
                  ? <video src={m.media_url} controls className="max-h-40 rounded mt-1" />
                  : <img src={m.media_url} alt="" className="max-h-40 rounded mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {replyTo && (
        <div className="px-3 py-1 bg-pink-950/40 text-xs text-pink-200 flex items-center justify-between border-t border-pink-500/30">
          <span className="truncate">Replying to {replyTo.guest_name}</span>
          <button onClick={() => setReplyTo(null)} className="text-pink-400">✕</button>
        </div>
      )}
      {media && (
        <div className="px-3 py-1 bg-zinc-900 flex items-center gap-2 border-t border-primary/30">
          {media.type === "video"
            ? <video src={media.url} className="h-12 rounded" />
            : <img src={media.url} alt="" className="h-12 rounded" />}
          <button onClick={() => setMedia(null)} className="text-red-400 text-xs">Remove</button>
        </div>
      )}
      {showEmoji && (
        <div className="p-2 bg-zinc-900 border-t border-primary/30 flex flex-wrap gap-1">
          {EMOJIS.map(e => <button key={e} onClick={() => { setText(t => t + e); setShowEmoji(false); }} className="text-xl hover:scale-125 transition">{e}</button>)}
        </div>
      )}
      {showStickers && (
        <div className="p-2 bg-zinc-900 border-t border-primary/30 max-h-40 overflow-y-auto grid grid-cols-8 gap-1">
          {AVAILABLE_BADGES.map(b => (
            <button key={b.id} title={b.name} onClick={async () => {
              await supabase.functions.invoke("chat-action", {
                body: { action: "send", stream_id: streamId, guest_name: guestName, guest_session_id: guestSessionId, text: "", media_url: b.image, media_type: "image" }
              });
              setShowStickers(false);
            }}>
              <img src={b.image} alt={b.name} className="w-8 h-8 object-contain hover:scale-110 transition" />
            </button>
          ))}
        </div>
      )}
      {showGif && (
        <div className="p-2 bg-zinc-900 border-t border-primary/30">
          <GiphyPicker onSelect={async (url) => {
            await supabase.functions.invoke("chat-action", {
              body: { action: "send", stream_id: streamId, guest_name: guestName, guest_session_id: guestSessionId, text: "", media_url: url, media_type: "gif" }
            });
            setShowGif(false);
          }} onClose={() => setShowGif(false)} />
        </div>
      )}

      <div className="p-2 border-t border-primary/30 flex items-center gap-1 bg-zinc-950">
        <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={onFile} />
        <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} className="text-pink-400 h-8 px-2"><ImagePlus className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => setShowGif(s => !s)} className="text-pink-400 h-8 px-2 font-bold text-xs">GIF</Button>
        <Button size="sm" variant="ghost" onClick={() => setShowEmoji(s => !s)} className="text-pink-400 h-8 px-2"><Smile className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => setShowStickers(s => !s)} className="text-pink-400 h-8 px-2 text-xs">🎟️</Button>
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Say something…"
          className="bg-zinc-900 border-pink-500/30 text-pink-100 placeholder:text-pink-300/40 h-8 text-sm"
          maxLength={500}
        />
        <Button size="sm" onClick={send} className="bg-pink-600 hover:bg-pink-500 text-white h-8 text-xs">Send</Button>
      </div>
    </div>
  );
}
