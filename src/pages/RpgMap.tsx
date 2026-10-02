import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, Radio, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUserId, type Post, type PostMedia, type UserProfile } from "@/lib/store";
import { createPost, fetchPosts, fetchProfiles, uploadMedia } from "@/lib/api";
import PostCard from "@/components/PostCard";
import UserSetupDialog from "@/components/UserSetupDialog";
import worldMapAsset from "@/assets/pag/worldmap.jpg.asset.json";

const SITE = "rpgmap";
const parsePin = (c?: string) => {
  const m = c?.match(/^pin:([\d.]+),([\d.]+)$/);
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
};

export default function RpgMap() {
  const [userId, setUserId] = useState(getCurrentUserId);
  const [showSetup, setShowSetup] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [p, pr] = await Promise.allSettled([fetchPosts(1000, 0, "newest", undefined, SITE), fetchProfiles()]);
    if (p.status === "fulfilled") setPosts(p.value);
    if (pr.status === "fulfilled") setProfiles(pr.value);
  }, []);
  useEffect(() => { load(); }, [load]);

  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (!userId) { setShowSetup(true); return; }
    const r = e.currentTarget.getBoundingClientRect();
    setDraft({ x: +(((e.clientX - r.left) / r.width) * 100).toFixed(2), y: +(((e.clientY - r.top) / r.height) * 100).toFixed(2) });
    setOpen(null);
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10 - media.length);
    setBusy(true);
    try {
      const up = await Promise.all(files.map(async f => ({ url: await uploadMedia(f), type: (f.type.startsWith("video") ? "video" : "image") as PostMedia["type"] })));
      setMedia(m => [...m, ...up]);
    } catch (err) { alert((err as Error).message); }
    setBusy(false); e.target.value = "";
  };

  const save = async () => {
    if (!draft || !userId || (!title.trim() && !desc.trim() && !media.length)) return;
    setBusy(true);
    await createPost({ userId, title: title.trim() || "Map post", description: desc.trim(), media, mediaUrl: media[0]?.url, mediaType: media[0]?.type, category: `pin:${draft.x},${draft.y}`, site: SITE });
    setBusy(false); setDraft(null); setTitle(""); setDesc(""); setMedia([]); load();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 pag-panel">
        <div className="container max-w-4xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-xl font-extrabold text-rainbow-neon truncate">RPG MAP</h1>
          <div className="flex items-center gap-1">
            <Link to="/live"><Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-rainbow-neon"><Radio className="w-3 h-3 mr-1" />GO LIVE</Button></Link>
            <Link to="/polianigames"><Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-rainbow-neon"><ArrowLeft className="w-3 h-3 mr-1" />PAG</Button></Link>
          </div>
        </div>
      </header>
      <main className="container max-w-4xl mx-auto px-3 py-3 space-y-3">
        <p className="text-[11px] text-rainbow-neon text-center">TAP ANYWHERE ON THE MAP TO DROP A POST • TAP A PIN TO OPEN IT</p>
        <div onClick={onMapClick} className="relative w-full aspect-[16/10] rounded-sm overflow-hidden border border-border cursor-crosshair select-none" style={{ backgroundImage: `url(${worldMapAsset.url})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="pag-map-grid" />
          {posts.map(p => {
            const pin = parsePin(p.category); if (!pin) return null;
            return (
              <button key={p.id} type="button" onClick={() => { setOpen(p); setDraft(null); }} className="absolute -translate-x-1/2 -translate-y-full text-primary drop-shadow-[0_0_6px_hsl(var(--primary))] hover:scale-125 transition" style={{ left: `${pin.x}%`, top: `${pin.y}%` }} aria-label={`Open ${p.title}`}>
                <MapPin className="w-6 h-6" fill="currentColor" />
              </button>
            );
          })}
          {draft && <span className="absolute -translate-x-1/2 -translate-y-full text-accent animate-bounce" style={{ left: `${draft.x}%`, top: `${draft.y}%` }}><MapPin className="w-7 h-7" fill="currentColor" /></span>}
        </div>

        {draft && (
          <div className="pag-panel rounded-sm p-3 space-y-2">
            <div className="flex items-center justify-between"><span className="text-[11px] text-rainbow-neon">NEW MAP POST @ {draft.x},{draft.y}</span><button onClick={() => setDraft(null)} aria-label="Cancel"><X className="w-4 h-4" /></button></div>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="Title" className="w-full bg-muted border border-border rounded-sm px-2 py-1 text-sm" />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} maxLength={5000} placeholder="What's happening here?" className="w-full bg-muted border border-border rounded-sm px-2 py-1 text-sm min-h-[70px]" />
            {media.length > 0 && <div className="flex gap-2 flex-wrap">{media.map((m, i) => (
              <div key={i} className="relative">{m.type === "video" ? <video src={m.url} className="h-16 rounded" /> : <img src={m.url} alt="" className="h-16 rounded" />}
                <button onClick={() => setMedia(ms => ms.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-destructive rounded-full p-0.5"><X className="w-3 h-3" /></button></div>
            ))}</div>}
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFiles} />
              <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} disabled={busy || media.length >= 10}><ImagePlus className="w-4 h-4 mr-1" />PHOTO/VIDEO</Button>
              <Link to="/live"><Button size="sm" variant="ghost"><Radio className="w-4 h-4 mr-1" />LIVE</Button></Link>
              <div className="flex-1" />
              <Button size="sm" onClick={save} disabled={busy} className="gradient-btn">{busy ? "..." : "POST"}</Button>
            </div>
          </div>
        )}

        {open && (
          <div className="relative">
            <button onClick={() => setOpen(null)} className="absolute right-2 top-2 z-10" aria-label="Close post"><X className="w-4 h-4" /></button>
            <PostCard post={open} onNeedSetup={() => setShowSetup(true)} onRefresh={() => { setOpen(null); load(); }} profiles={profiles} />
          </div>
        )}
      </main>
      <UserSetupDialog open={showSetup} onComplete={(id) => { setUserId(id); setShowSetup(false); }} />
    </div>
  );
}
