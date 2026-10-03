import { useEffect, useRef, useState } from "react";
import { Edit3, ImagePlus, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BetterTTVEmotePicker from "@/components/BetterTTVEmotePicker";
import GiphyPicker from "@/components/GiphyPicker";

export interface GuildMessage { id: string; guild_id: string; author_name: string; text: string; media_url: string | null; media_type: string | null; edited_at: string | null; created_at: string; }

export default function GuildChat({ guildId, username, isWarden = false, title = "WATCHMANS GUILD" }: { guildId: string; username: string; isWarden?: boolean; title?: string }) {
  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<{ url: string; type: "image" | "video" | "gif" } | null>(null);
  const [picker, setPicker] = useState<"gif" | "emote" | null>(null);
  const [editing, setEditing] = useState<GuildMessage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase.from("guild_messages").select("*").eq("guild_id", guildId).order("created_at", { ascending: true }).limit(300);
    setMessages((data || []) as GuildMessage[]);
  };

  useEffect(() => {
    load();
    const channel = supabase.channel(`guild-chat-${guildId}`).on("postgres_changes", { event: "*", schema: "public", table: "guild_messages", filter: `guild_id=eq.${guildId}` }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [guildId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const clean = text.trim().slice(0, 2000);
    if ((!clean && !media) || !username.trim()) return;
    if (editing) {
      await supabase.from("guild_messages").update({ text: clean, edited_at: new Date().toISOString() }).eq("id", editing.id).eq("author_name", username);
      setEditing(null);
    } else {
      await supabase.from("guild_messages").insert({ guild_id: guildId, author_name: username.trim().slice(0, 40), text: clean, media_url: media?.url || null, media_type: media?.type || null });
    }
    setText(""); setMedia(null); load();
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const url = await uploadMedia(file);
    setMedia({ url, type: file.type.startsWith("video/") ? "video" : "image" });
  };

  return <section className="guild-chat-shell">
    <div className="guild-chat-head"><span>{title}</span><span>{messages.length} MESSAGES</span></div>
    <div className="guild-message-list">
      {messages.length === 0 && <div className="guild-empty">No messages yet. Spin the first web.</div>}
      {messages.map(message => <article key={message.id} className="guild-message">
        <div className="flex items-center gap-2"><strong>{message.author_name}</strong><time>{new Date(message.created_at).toLocaleString()}</time><div className="flex-1" />
          {message.author_name === username && <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Edit message" onClick={() => { setEditing(message); setText(message.text); }}><Edit3 className="h-3.5 w-3.5" /></Button>}
          {(message.author_name === username || isWarden) && <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" aria-label="Delete message" onClick={() => supabase.from("guild_messages").delete().eq("id", message.id).then(load)}><Trash2 className="h-3.5 w-3.5" /></Button>}
        </div>
        {message.text && <p>{message.text}</p>}
        {message.media_url && (message.media_type === "video" ? <video src={message.media_url} controls /> : <img src={message.media_url} alt="Guild attachment" loading="lazy" />)}
        {message.edited_at && <small>edited</small>}
      </article>)}
      <div ref={bottomRef} />
    </div>
    {media && <div className="guild-media-preview">{media.type === "video" ? <video src={media.url} /> : <img src={media.url} alt="Attachment preview" />}<Button variant="ghost" size="sm" onClick={() => setMedia(null)}>REMOVE</Button></div>}
    {picker === "gif" && <GiphyPicker onSelect={url => { setMedia({ url, type: "gif" }); setPicker(null); }} onClose={() => setPicker(null)} />}
    {picker === "emote" && <BetterTTVEmotePicker onSelect={emote => { setMedia({ url: emote.url, type: "gif" }); setPicker(null); }} onClose={() => setPicker(null)} />}
    <div className="guild-composer">
      <input ref={fileRef} hidden type="file" accept="image/*,video/*" onChange={upload} />
      <Input value={text} maxLength={2000} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={editing ? "Edit your message…" : "Transmit to the guild…"} />
      <div className="flex gap-1 flex-wrap">
        <Button size="icon" variant="secondary" onClick={() => fileRef.current?.click()} aria-label="Add photo or video"><ImagePlus className="h-4 w-4" /></Button>
        <Button size="sm" variant="secondary" onClick={() => setPicker(picker === "gif" ? null : "gif")}>GIF</Button>
        <Button size="sm" variant="secondary" onClick={() => setPicker(picker === "emote" ? null : "emote")}>EMOTES</Button>
        {editing && <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setText(""); }}>CANCEL</Button>}
        <Button size="icon" onClick={send} aria-label="Send message"><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  </section>;
}
