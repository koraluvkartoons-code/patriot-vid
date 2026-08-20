import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { type Post, type UserProfile, getCurrentUserId } from "@/lib/store";
import { fetchPostMedia, updatePost, togglePostLike, togglePinPost, deletePost, addRepost, removeRepost, fetchRepostsFor } from "@/lib/api";
import { logTime } from "@/lib/tags";
import UserBadge from "./UserBadge";
import CommentSection from "./CommentSection";
import Lightbox from "./Lightbox";
import { getCategorySprite } from "./PoliAniRpgSprites";
import { Heart, MessageCircle, Edit, ExternalLink, Pin, Trash2, Link2, Repeat2, Quote, Sparkles, Swords, Scroll, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Props {
  post: Post;
  onNeedSetup: () => void;
  onRefresh: () => void;
  profiles: Record<string, UserProfile>;
}

export default function PoliAniRpgCard({ post, onNeedSetup, onRefresh, profiles }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDesc, setEditDesc] = useState(post.description);
  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [editDate, setEditDate] = useState(toLocalInput(post.createdAt));
  const [editCategory, setEditCategory] = useState(post.category || "");
  const [mediaUrl, setMediaUrl] = useState(post.mediaUrl);
  const [mediaType, setMediaType] = useState(post.mediaType);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [reposters, setReposters] = useState<string[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");

  const gallery = post.media && post.media.length > 1 ? post.media : (post.media?.length === 1 && !post.mediaUrl ? post.media : []);
  const currentUser = getCurrentUserId();
  const isAdmin = currentUser === "PatriotAdmin";
  const isOwner = currentUser === post.userId;
  const liked = currentUser ? post.likes.includes(currentUser) : false;
  const reposted = currentUser ? reposters.includes(currentUser) : false;

  const photoUrls = gallery.length > 0
    ? gallery.filter(m => m.type === "image").map(m => m.url)
    : (mediaUrl && mediaType === "image" ? [mediaUrl] : []);

  // Category Sprite Information
  const spriteInfo = getCategorySprite(post.category, 88);

  useEffect(() => {
    let cancelled = false;
    const loadMedia = async () => {
      setMediaUrl(post.mediaUrl);
      setMediaType(post.mediaType);
      if (post.media?.length || !post.mediaType || post.mediaUrl) return;
      try {
        const media = await fetchPostMedia(post.id);
        if (cancelled) return;
        setMediaUrl(media.mediaUrl);
        setMediaType(media.mediaType);
      } catch {
        if (cancelled) return;
        setMediaUrl(undefined);
      }
    };
    loadMedia();
    return () => { cancelled = true; };
  }, [post.id, post.mediaType, post.mediaUrl, post.media]);

  const loadReposts = async () => {
    try {
      const map = await fetchRepostsFor([post.id]);
      setReposters(map[post.id] || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadReposts();
  }, [post.id]);

  const handleLike = async () => {
    if (!currentUser) { onNeedSetup(); return; }
    await togglePostLike(post.id, currentUser);
    onRefresh();
  };

  const handleRepost = async () => {
    if (!currentUser) { onNeedSetup(); return; }
    if (reposted) {
      await removeRepost(post.id, currentUser);
      toast({ title: "Repost removed" });
    } else {
      await addRepost(post.id, currentUser, "");
      toast({ title: "Reposted in RPG Quest Log" });
    }
    await loadReposts();
    onRefresh();
  };

  const submitQuote = async () => {
    if (!currentUser) { onNeedSetup(); return; }
    await addRepost(post.id, currentUser, quoteText.trim());
    setQuoteOpen(false);
    setQuoteText("");
    await loadReposts();
    onRefresh();
    toast({ title: "RPG Lore Quote posted" });
  };

  const handlePin = async () => {
    await togglePinPost(post.id, !post.isPinned);
    onRefresh();
  };

  const saveEdit = async () => {
    const iso = editDate ? new Date(editDate).toISOString() : undefined;
    await updatePost(post.id, editTitle.trim() || post.title, editDesc.trim(), iso, editCategory);
    setEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this PoliAniGames RPG post permanently?")) return;
    await deletePost(post.id);
    onRefresh();
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Quest Link Copied", description: url });
    } catch {
      toast({ title: "Copy failed", description: url });
    }
  };

  // Generate a fun pseudo HP/LV stat based on likes & id
  const levelNum = Math.min(99, 1 + Math.abs(post.title.length + post.likes.length * 5) % 99);
  const hpPercent = Math.min(100, Math.max(25, 40 + post.likes.length * 15));

  return (
    <article
      id={`rpg-post-${post.id}`}
      className={`relative overflow-hidden rounded-md my-3 select-text font-mono transition-all duration-200 ${
        post.isPinned ? "ring-2 ring-yellow-400/90 shadow-[0_0_20px_rgba(250,204,21,0.3)]" : "shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
      }`}
      style={{
        background: "linear-gradient(180deg, #0b0f19 0%, #030712 100%)",
        border: "3px solid #334155",
        boxShadow: "inset 0 0 0 2px #0f172a, 0 8px 24px rgba(0,0,0,0.7)",
      }}
    >
      {/* 16-Bit RPG Header Frame / Environment Strip */}
      <div
        className="relative px-3 py-2 border-b-2 border-slate-700/80 flex items-center justify-between gap-2 overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)",
        }}
      >
        {/* Pixel Scanline Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Category & Level Badge */}
        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded border text-yellow-300 bg-black/70 border-yellow-500/70 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
            style={{ shapeRendering: "crispEdges" }}
          >
            ◆ {post.category ? post.category.toUpperCase() : "GENERAL"} ◆
          </span>

          <span className="text-[10px] text-cyan-300/90 font-bold hidden sm:inline-flex items-center gap-1">
            <span className="text-pink-400">LV.{levelNum}</span>
            <span className="text-white/40">|</span>
            <span>MASCOT: {spriteInfo.name.toUpperCase()}</span>
          </span>

          {post.isPinned && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-400/80 rounded animate-pulse">
              ★ PINNED QUEST
            </span>
          )}
        </div>

        {/* Timestamp & Link */}
        <div className="relative z-10 flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
          <span>[{logTime(post.createdAt)}]</span>
          <button onClick={copyLink} title="Copy Quest Link" className="p-1 hover:text-cyan-300 transition-colors">
            <Link2 className="w-3.5 h-3.5" />
          </button>
          {(isOwner || isAdmin) && (
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700">
              <button onClick={handlePin} title={post.isPinned ? "Unpin" : "Pin"}>
                <Pin className={`w-3.5 h-3.5 ${post.isPinned ? "text-yellow-400 fill-yellow-400" : "hover:text-yellow-400"}`} />
              </button>
              <button onClick={() => setEditing(!editing)} title="Edit Quest" className="hover:text-cyan-400">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleDelete} title="Delete Quest" className="hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main 16-Bit RPG Stage (Character + Dialogue Box) */}
      <div className="p-2 sm:p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Character Stage Box */}
          <div
            className="flex items-center justify-center p-2 sm:p-2.5 rounded border-2 border-slate-700 bg-gradient-to-b from-slate-900/90 via-indigo-950/50 to-slate-950 shrink-0 sm:w-28 sm:min-h-[110px] shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] relative group"
            style={{
              borderColor: spriteInfo.accent || "#64748b",
            }}
          >
            {/* Retro Stage Platform Grid */}
            <div
              className="absolute inset-x-2 bottom-1 h-3 border-t border-dashed border-white/20 bg-white/5 rounded-sm"
              style={{ shapeRendering: "crispEdges" }}
            />

            {/* Pixel Character Mascot */}
            <div className="relative z-10 transition-transform duration-200 group-hover:scale-105 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              {spriteInfo.component}
            </div>

            {/* Mobile Mascot Name Tag */}
            <div className="absolute -bottom-2 px-1.5 py-0.2 bg-black border border-slate-700 text-[8px] text-yellow-300 font-bold uppercase tracking-wider rounded-sm z-20 whitespace-nowrap shadow">
              {spriteInfo.name}
            </div>
          </div>

          {/* 16-Bit RPG Dialogue Window */}
          <div
            className="flex-1 min-w-0 p-3 sm:p-3.5 rounded border-2 relative"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #090d16 100%)",
              borderColor: "#eab308",
              boxShadow: "inset 0 0 0 2px #1e293b, inset 0 0 16px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            {/* Retro Nameplate Header Inside Box */}
            <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-yellow-500/30">
              <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 font-bold tracking-wide">
                <span className="text-cyan-400">▶</span>
                <span className="text-yellow-300 uppercase">{post.category ? `[ ${post.category} ]` : "[ POLIANIGAMES ]"}</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <span>HP</span>
                <div className="w-12 h-1.5 bg-slate-900 border border-slate-700 rounded-sm overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${hpPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Main Term — The Core Focus Prominently Featured! */}
            <Link
              to={`/post/${post.id}`}
              className="block text-base sm:text-lg font-black text-white hover:text-yellow-300 transition-colors tracking-wide leading-snug break-words drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{
                textShadow: "1px 1px 0px #000, 2px 2px 0px rgba(0,0,0,0.8), 0 0 8px rgba(250,204,21,0.2)",
              }}
            >
              {post.title}
            </Link>

            {/* Optional Dialogue / Flavor Text (if description exists) */}
            {post.description && (
              <div className="mt-2 text-[12px] text-slate-300/90 leading-relaxed break-words border-l-2 border-cyan-500/60 pl-2 py-0.5 bg-black/25 rounded-r">
                <span className="text-cyan-400 mr-1 font-bold">“</span>
                {post.description}
                <span className="text-cyan-400 ml-1 font-bold">”</span>
              </div>
            )}
          </div>
        </div>

        {/* Media / Gallery Area (Formatted like a 16-bit inventory / battle display) */}
        {gallery.length > 0 ? (
          <div className={`p-1.5 bg-black/60 rounded border border-slate-700/80 ${gallery.length === 1 ? "" : "grid grid-cols-2 gap-1.5"}`}>
            {gallery.map((m, i) => (
              m.type === "video" ? (
                <video key={i} src={m.url} controls preload="none" className={`w-full bg-black rounded border border-slate-800 ${gallery.length === 1 ? "max-h-64 object-contain" : "h-36 object-cover"}`} />
              ) : m.type === "link" ? (
                <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-900/80 text-cyan-400 hover:text-yellow-300 border border-slate-700 transition-colors col-span-full rounded text-xs truncate">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{m.url}</span>
                </a>
              ) : (
                <img
                  key={i}
                  src={m.url}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  onClick={() => setLightbox(photoUrls.indexOf(m.url))}
                  className={`w-full bg-black rounded border border-slate-800 cursor-zoom-in hover:border-yellow-400/60 transition-colors ${gallery.length === 1 ? "max-h-64 object-contain" : "h-36 object-cover"}`}
                />
              )
            ))}
          </div>
        ) : (
          mediaUrl && (
            <div className="p-1.5 bg-black/60 rounded border border-slate-700/80">
              {mediaType === "video" ? (
                <video src={mediaUrl} controls preload="none" className="w-full max-h-64 object-contain bg-black rounded border border-slate-800" />
              ) : mediaType === "link" ? (
                <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-900/80 text-cyan-400 hover:text-yellow-300 border border-slate-700 transition-colors rounded text-xs truncate">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{mediaUrl}</span>
                </a>
              ) : (
                <img src={mediaUrl} alt={post.title} loading="lazy" decoding="async" onClick={() => setLightbox(0)} className="w-full max-h-64 object-contain bg-black rounded border border-slate-800 cursor-zoom-in hover:border-yellow-400/60 transition-colors" />
              )}
            </div>
          )
        )}

        {/* Editing Dialog Mode */}
        {editing && (
          <div className="p-2.5 bg-slate-900/95 border-2 border-yellow-500 rounded space-y-2">
            <div className="text-[11px] font-bold text-yellow-400">⚡ EDIT RPG POST ENTRY</div>
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Term / Title" className="bg-black border-slate-700 text-white text-xs" />
            <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Dialogue / Description (optional)" className="bg-black border-slate-700 text-white text-xs" />
            <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Category (e.g. POLITICS, ANIME, VIDEO GAMES, DC...)" maxLength={40} className="bg-black border-slate-700 text-white text-xs" />
            <Input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-black border-slate-700 text-white text-xs" />
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={saveEdit} className="h-7 text-xs bg-yellow-500 text-black font-bold hover:bg-yellow-400">SAVE QUEST</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs text-slate-400">CANCEL</Button>
            </div>
          </div>
        )}

        {/* RPG Command Action Bar */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-1.5 text-[11px] border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <UserBadge userId={post.userId} profiles={profiles} />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Like Action (Attack) */}
            <button
              onClick={handleLike}
              className={`px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 transition-all ${
                liked
                  ? "bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-red-500/80 hover:text-red-300"
              }`}
            >
              <Heart className={`w-3 h-3 ${liked ? "fill-red-400 text-red-400" : ""}`} />
              <span>LIKE ({post.likes.length})</span>
            </button>

            {/* Repost Action */}
            <button
              onClick={handleRepost}
              className={`px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 transition-all ${
                reposted
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500/80 hover:text-emerald-300"
              }`}
            >
              <Repeat2 className="w-3 h-3" />
              <span>REPOST {reposters.length > 0 && `(${reposters.length})`}</span>
            </button>

            {/* Quote Action */}
            <button
              onClick={() => { if (!currentUser) { onNeedSetup(); return; } setQuoteOpen(true); }}
              className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition-all"
            >
              <Quote className="w-3 h-3" />
              <span>QUOTE</span>
            </button>

            {/* Comments Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 transition-all ${
                showComments
                  ? "bg-indigo-950 border-indigo-500 text-indigo-200"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-300"
              }`}
            >
              <MessageCircle className="w-3 h-3" />
              <span>LORE CHAT</span>
            </button>
          </div>
        </div>

        {/* Comment Section in RPG Frame */}
        {showComments && (
          <div className="pt-2 border-t-2 border-indigo-900/60 bg-black/40 rounded p-2">
            <div className="text-[10px] font-bold text-cyan-400 mb-1 flex items-center gap-1">
              <Scroll className="w-3 h-3" /> QUEST LOG & DISCUSSIONS
            </div>
            <CommentSection postId={post.id} onNeedSetup={onNeedSetup} profiles={profiles} />
          </div>
        )}
      </div>

      {lightbox !== null && photoUrls.length > 0 && (
        <Lightbox images={photoUrls} index={Math.max(0, lightbox)} onClose={() => setLightbox(null)} />
      )}

      {/* Quote Dialog */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="bg-slate-950 border-2 border-yellow-500 font-mono text-white">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-xs font-bold tracking-wider">
              ⚔️ ADD TO RPG QUEST LOG (QUOTE POST)
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={quoteText}
            onChange={e => setQuoteText(e.target.value)}
            placeholder="Enter your RPG commentary..."
            maxLength={1000}
            className="bg-slate-900 border-slate-700 text-white min-h-[80px] text-xs"
          />
          <div className="border border-slate-800 bg-black/60 rounded p-2 text-[11px] text-slate-400">
            <span className="text-cyan-400">@{post.userId}</span> — <span className="text-yellow-300">{post.title}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setQuoteOpen(false)} className="text-slate-400 text-xs">CANCEL</Button>
            <Button size="sm" onClick={submitQuote} disabled={!quoteText.trim()} className="bg-yellow-500 text-black font-bold hover:bg-yellow-400 text-xs">POST QUOTE</Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
