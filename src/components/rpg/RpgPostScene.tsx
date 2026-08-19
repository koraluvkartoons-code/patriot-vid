import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { type Post, type UserProfile, getCurrentUserId } from "@/lib/store";
import {
  fetchPostMedia,
  updatePost,
  togglePostLike,
  togglePinPost,
  deletePost,
  addRepost,
  removeRepost,
  fetchRepostsFor,
} from "@/lib/api";
import {
  Heart,
  Repeat2,
  Quote,
  MessageCircle,
  Link2,
  Pin,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import UserBadge from "@/components/UserBadge";
import CommentSection from "@/components/CommentSection";
import Lightbox from "@/components/Lightbox";
import { getCategoryBust, CATEGORY_META, normalizeCategory, PixelHeroBust } from "./rpgSprites";
import { getRpgBackground } from "./rpgBackgrounds";

function linkify(text: string) {
  if (!text) return null;
  const urlRegex = /((?:https?:\/\/|www\.)[^\s<]+[^\s<.,:;"')\]]|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|io|tv|app|gg|co|edu|gov)(?:\/[^\s<.,:;"')\]]*)?)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`txt-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    const rawUrl = match[0];
    const href = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;
    parts.push(
      <a
        key={`link-${match.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-cyan-300 hover:text-yellow-300 underline underline-offset-2 break-all font-semibold"
      >
        {rawUrl}
      </a>
    );
    lastIndex = match.index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`txt-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

interface Props {
  post: Post;
  onNeedSetup: () => void;
  onRefresh: () => void;
  profiles: Record<string, UserProfile>;
  compact?: boolean;
  hideActions?: boolean;
}

export default function RpgPostScene({
  post,
  onNeedSetup,
  onRefresh,
  profiles,
  hideActions = false,
}: Props) {
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDesc, setEditDesc] = useState(post.description || "");
  const [editCategory, setEditCategory] = useState(post.category || "");
  const [editDate, setEditDate] = useState(
    post.createdAt ? new Date(post.createdAt).toISOString().slice(0, 16) : ""
  );
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [expandedText, setExpandedText] = useState(false);
  const [reposters, setReposters] = useState<string[]>([]);
  const [mediaUrl, setMediaUrl] = useState(post.mediaUrl);
  const [mediaType, setMediaType] = useState(post.mediaType);

  const currentUser = getCurrentUserId();
  const isOwner = currentUser === post.userId;
  const isAdmin = currentUser === "PatriotAdmin" || currentUser === "admin";
  const liked = currentUser ? post.likes.includes(currentUser) : false;
  const reposted = currentUser ? reposters.includes(currentUser) : false;

  const gallery = useMemo(() => (post.media && post.media.length > 0 ? post.media : []), [post.media]);
  const photoUrls = useMemo(() => {
    if (gallery.length > 0) {
      return gallery.filter((m) => m.type === "image").map((m) => m.url);
    }
    return mediaUrl && mediaType === "image" ? [mediaUrl] : [];
  }, [gallery, mediaUrl, mediaType]);

  useEffect(() => {
    let cancelled = false;
    const loadMedia = async () => {
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
  }, [post.id, post.mediaType, post.mediaUrl]);

  const loadReposts = async () => {
    try {
      const map = await fetchRepostsFor([post.id]);
      setReposters(map[post.id] || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!hideActions) loadReposts();
  }, [post.id, hideActions]);

  const categoryKey = normalizeCategory(post.category);
  const charMeta = CATEGORY_META[categoryKey] || CATEGORY_META.general;
  const CategoryBust = getCategoryBust(post.category);
  const SecondaryBust = PixelHeroBust;
  const BackgroundComponent = getRpgBackground(post.category);

  const handleLike = async () => {
    if (!currentUser) {
      onNeedSetup();
      return;
    }
    await togglePostLike(post.id, currentUser);
    onRefresh();
  };

  const handleRepost = async () => {
    if (!currentUser) {
      onNeedSetup();
      return;
    }
    if (reposted) {
      await removeRepost(post.id, currentUser);
      toast({ title: "Repost removed" });
    } else {
      await addRepost(post.id, currentUser, "");
      toast({ title: "Reposted" });
    }
    await loadReposts();
    onRefresh();
  };

  const submitQuote = async () => {
    if (!currentUser) {
      onNeedSetup();
      return;
    }
    if (!quoteText.trim()) return;
    await addRepost(post.id, currentUser, quoteText.trim());
    setQuoteText("");
    setQuoteOpen(false);
    await loadReposts();
    toast({ title: "Quote dialogue posted!" });
    onRefresh();
  };

  const handlePin = async () => {
    await togglePinPost(post.id, !post.isPinned);
    toast({ title: post.isPinned ? "Post unpinned" : "Post pinned to top" });
    onRefresh();
  };

  const saveEdit = async () => {
    const iso = editDate ? new Date(editDate).toISOString() : undefined;
    await updatePost(post.id, editTitle.trim() || post.title, editDesc.trim(), iso, editCategory);
    setEditing(false);
    toast({ title: "Post updated" });
    onRefresh();
  };

  const handleDelete = async () => {
    if (confirm("Delete this RPG post?")) {
      await deletePost(post.id);
      toast({ title: "Post deleted" });
      onRefresh();
    }
  };

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard!" });
  };

  const categoryLabel = (post.category || "POLIANIGAMES").toUpperCase();
  const termDisplay = post.title.toUpperCase();

  return (
    <article
      className={`relative w-full rounded-md overflow-hidden border-2 shadow-2xl transition-all my-4 select-text font-sans ${
        post.isPinned
          ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
          : "border-slate-700/80 shadow-black/80"
      }`}
      style={{
        background: "#0c1021",
      }}
    >
      {/* 4 Corner 16-Bit Accent Studs */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-white border border-black z-30" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-white border border-black z-30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-white border border-black z-30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-white border border-black z-30" />

      {/* ---------------- TOP 16-BIT RPG SCENE AREA ---------------- */}
      <div className="relative w-full h-48 sm:h-64 md:h-72 overflow-hidden bg-slate-950 flex items-end justify-between">
        {/* Vector 16-Bit Environment Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <BackgroundComponent className="w-full h-full object-cover" />
        </div>

        {/* Top Floating Badge with Category & Date */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 flex-wrap">
          <span
            className="px-2 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded border shadow-md flex items-center gap-1"
            style={{
              backgroundColor: "rgba(10, 15, 30, 0.85)",
              borderColor: charMeta.badgeColor,
              color: charMeta.badgeColor,
              boxShadow: `0 0 8px ${charMeta.badgeColor}40`,
            }}
          >
            <span className="animate-pulse">●</span> {categoryLabel}
          </span>

          {post.isPinned && (
            <span className="px-2 py-0.5 bg-amber-950/90 border border-amber-400 text-amber-300 text-[10px] font-bold rounded shadow animate-pulse">
              ★ PINNED
            </span>
          )}
        </div>

        {/* Top Right Post Controls */}
        {!hideActions && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/75 px-1.5 py-0.5 rounded border border-white/20">
            <button
              onClick={copyLink}
              title="Copy post link"
              className="text-blue-200 hover:text-white p-1 transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
            {(isOwner || isAdmin) && (
              <>
                <button
                  onClick={handlePin}
                  title={post.isPinned ? "Unpin" : "Pin"}
                  className="text-blue-200 hover:text-amber-300 p-1"
                >
                  <Pin
                    className={`w-3.5 h-3.5 ${
                      post.isPinned ? "text-amber-400 fill-amber-400" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={() => setEditing(!editing)}
                  title="Edit post"
                  className="text-blue-200 hover:text-cyan-300 p-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  title="Delete post"
                  className="text-blue-200 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}

        {/* LEFT CHARACTER BUST (Category-Specific Pixel Art Icon / Mascot) */}
        <div className="relative z-10 flex flex-col items-start pl-2 sm:pl-4 max-w-[45%] sm:max-w-[40%]">
          <div className="w-24 h-28 sm:w-36 sm:h-40 md:w-44 md:h-48 drop-shadow-[0_8px_12px_rgba(0,0,0,0.9)] transform hover:scale-105 transition-transform origin-bottom-left">
            <CategoryBust className="w-full h-full object-contain" />
          </div>
          {/* Character Nameplate */}
          <div className="rpg-nameplate -mt-2 sm:-mt-3 z-20 text-[10px] sm:text-xs whitespace-nowrap shadow-lg">
            <span className="text-yellow-300 font-extrabold text-[11px]">◆</span>
            <span className="truncate max-w-[110px] sm:max-w-[160px]">{charMeta.name}</span>
          </div>
        </div>

        {/* RIGHT CHARACTER BUST (Secondary / Author Persona Avatar) */}
        <div className="relative z-10 flex flex-col items-end pr-2 sm:pr-4 max-w-[45%] sm:max-w-[40%]">
          <div className="w-24 h-28 sm:w-36 sm:h-40 md:w-44 md:h-48 drop-shadow-[0_8px_12px_rgba(0,0,0,0.9)] transform scale-x-[-1] hover:scale-x-[-1.05] transition-transform origin-bottom-right">
            <SecondaryBust className="w-full h-full object-contain" />
          </div>
          {/* Speaker / User Nameplate */}
          <div className="rpg-nameplate -mt-2 sm:-mt-3 z-20 text-[10px] sm:text-xs whitespace-nowrap shadow-lg">
            <span className="truncate max-w-[110px] sm:max-w-[160px]">
              <UserBadge userId={post.userId} profiles={profiles} />
            </span>
            <span className="text-cyan-300 font-extrabold text-[11px]">◆</span>
          </div>
        </div>
      </div>

      {/* ---------------- BOTTOM 16-BIT RPG DIALOGUE BOX ---------------- */}
      <div
        className="relative p-3 sm:p-4 text-white z-20"
        style={{
          background: "linear-gradient(180deg, rgba(10, 22, 58, 0.96) 0%, rgba(4, 10, 32, 0.98) 100%)",
          borderTop: "3px solid #ffffff",
          boxShadow: "inset 0 2px 0 #000000, inset 0 4px 0 #3b82f6, 0 -4px 12px rgba(0,0,0,0.5)",
        }}
      >
        {/* Dialog Box Layout with Side Navigation Arrows */}
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Left Retro Arrow Pointer */}
          <div className="hidden sm:flex items-center justify-center w-7 h-16 shrink-0 bg-black/40 border border-white/20 rounded text-blue-300/70 select-none">
            <ChevronLeft className="w-5 h-5 opacity-75 animate-pulse" />
          </div>

          {/* Central Dialogue Content Area */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Category / Speaker Headline */}
            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-black text-xs sm:text-sm">▶</span>
                <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-cyan-300">
                  [{categoryLabel}]
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-blue-200/60 font-mono">
                {new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* MAIN TERM (Prominently displayed as dialogue headline focus) */}
            <div className="py-0.5">
              <Link
                to={`/post/${post.id}`}
                className="text-base sm:text-lg md:text-xl font-extrabold text-yellow-300 hover:text-white tracking-wide leading-tight hover:underline transition-colors block break-words drop-shadow-[1px_1px_0_#000000]"
              >
                {termDisplay}
              </Link>
            </div>

            {/* Optional Description / Dialogue Body */}
            {post.description && (
              <div className="bg-black/40 border border-white/15 rounded p-2 sm:p-2.5 text-xs sm:text-sm text-slate-100/95 leading-relaxed rpg-dialog-text">
                <div className="whitespace-pre-wrap break-words">
                  {linkify(
                    expandedText || post.description.length <= 200
                      ? post.description
                      : post.description.slice(0, 200) + "…"
                  )}
                  <span className="rpg-cursor-indicator ml-1.5 font-bold">▼</span>
                </div>
                {post.description.length > 200 && !expandedText && (
                  <button
                    onClick={() => setExpandedText(true)}
                    className="mt-1 text-[11px] text-cyan-300 hover:text-yellow-300 font-bold uppercase tracking-wider block"
                  >
                    [▶ READ FULL DIALOGUE]
                  </button>
                )}
              </div>
            )}

            {/* Media Gallery / RPG Item Inspector */}
            {gallery.length > 0 && (
              <div className="mt-2 p-1.5 bg-black/60 border-2 border-white/30 rounded">
                <div className={`gap-2 ${gallery.length === 1 ? "" : "grid grid-cols-2"}`}>
                  {gallery.map((m, i) =>
                    m.type === "video" ? (
                      <video
                        key={i}
                        src={m.url}
                        controls
                        preload="none"
                        className="w-full max-h-56 bg-black rounded border border-white/20 object-contain"
                      />
                    ) : m.type === "link" ? (
                      <a
                        key={i}
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-blue-950/80 border border-blue-400/40 text-cyan-300 hover:text-yellow-300 transition-colors col-span-full rounded text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{m.url}</span>
                      </a>
                    ) : (
                      <div key={i} className="relative group cursor-zoom-in overflow-hidden rounded border border-white/20">
                        <img
                          src={m.url}
                          alt={post.title}
                          loading="lazy"
                          decoding="async"
                          onClick={() => setLightbox(photoUrls.indexOf(m.url))}
                          className={`w-full bg-black hover:opacity-90 transition-opacity ${
                            gallery.length === 1 ? "max-h-64 object-contain" : "h-32 sm:h-40 object-cover"
                          }`}
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pointer-events-none">
                          <Maximize2 className="w-3 h-3" /> ZOOM
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Legacy Single Media Fallback */}
            {gallery.length === 0 && post.mediaUrl && (
              <div className="mt-2 p-1.5 bg-black/60 border-2 border-white/30 rounded">
                {post.mediaType === "video" ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    preload="none"
                    className="w-full max-h-56 bg-black rounded border border-white/20 object-contain"
                  />
                ) : post.mediaType === "link" ? (
                  <a
                    href={post.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-blue-950/80 border border-blue-400/40 text-cyan-300 hover:text-yellow-300 transition-colors rounded text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{post.mediaUrl}</span>
                  </a>
                ) : (
                  <div className="relative group cursor-zoom-in overflow-hidden rounded border border-white/20">
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      onClick={() => setLightbox(0)}
                      className="w-full max-h-64 object-contain bg-black hover:opacity-90 transition-opacity rounded"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Edit Mode Inline Drawer */}
            {editing && (
              <div className="mt-2 p-3 bg-black/80 border-2 border-white/40 rounded space-y-2">
                <label className="block text-[11px] text-yellow-300 font-bold">TERM / TITLE</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-blue-950/80 border-white/30 text-white text-xs"
                />
                <label className="block text-[11px] text-yellow-300 font-bold">DIALOGUE / DESCRIPTION</label>
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="bg-blue-950/80 border-white/30 text-white text-xs"
                />
                <label className="block text-[11px] text-yellow-300 font-bold">CATEGORY</label>
                <Input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="Category (e.g. POLITICS, ANIME, VIDEO GAMES)"
                  maxLength={40}
                  className="bg-blue-950/80 border-white/30 text-white text-xs"
                />
                <label className="block text-[11px] text-yellow-300 font-bold">POST DATE</label>
                <Input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="bg-blue-950/80 border-white/30 text-white text-xs"
                />
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={saveEdit} className="rpg-command-btn text-yellow-300">
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    className="text-blue-200 hover:text-white text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* 16-BIT RPG ACTION COMMAND BAR */}
            {!hideActions && (
              <div className="pt-2 border-t border-white/20 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleLike}
                  className={`rpg-command-btn ${
                    liked ? "border-pink-400 text-pink-300 bg-pink-950/50" : ""
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      liked ? "fill-pink-400 text-pink-400" : "text-pink-300"
                    }`}
                  />
                  <span>LIKE {post.likes.length > 0 && `(${post.likes.length})`}</span>
                </button>

                <button
                  onClick={handleRepost}
                  title="Repost"
                  className="rpg-command-btn"
                >
                  <Repeat2 className="w-3.5 h-3.5 text-green-300" />
                  <span>REPOST</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      onNeedSetup();
                      return;
                    }
                    setQuoteOpen(true);
                  }}
                  className="rpg-command-btn"
                >
                  <Quote className="w-3.5 h-3.5 text-cyan-300" />
                  <span>QUOTE</span>
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`rpg-command-btn ${
                    showComments ? "border-yellow-400 text-yellow-300 bg-yellow-950/40" : ""
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-yellow-300" />
                  <span>TALK {showComments ? "▲" : "▼"}</span>
                </button>

                <Link
                  to={`/post/${post.id}`}
                  className="text-[10px] sm:text-[11px] text-blue-200/70 ml-auto hover:text-yellow-300 hover:underline transition-colors hidden xs:inline-block"
                >
                  ID: #{post.id.slice(0, 8)}
                </Link>
              </div>
            )}

            {/* Comment Section Expansion */}
            {showComments && (
              <div className="mt-3 pt-3 border-t-2 border-white/25 bg-black/50 p-2 sm:p-3 rounded border border-white/20">
                <CommentSection postId={post.id} onNeedSetup={onNeedSetup} profiles={profiles} />
              </div>
            )}
          </div>

          {/* Right Retro Arrow Pointer */}
          <div className="hidden sm:flex items-center justify-center w-7 h-16 shrink-0 bg-black/40 border border-white/20 rounded text-blue-300/70 select-none">
            <ChevronRight className="w-5 h-5 opacity-75 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox !== null && photoUrls.length > 0 && (
        <Lightbox
          images={photoUrls}
          index={Math.max(0, lightbox)}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Quote Dialog */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="rpg-dialog-box border-2 border-white text-white">
          <DialogHeader>
            <DialogTitle className="text-yellow-300 text-sm font-bold tracking-wide">
              ◆ QUOTE DIALOGUE ◆
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="Speak your words..."
            maxLength={1000}
            className="bg-black/70 border-2 border-white/30 text-white min-h-[90px]"
          />
          <div className="border border-white/20 rounded p-2 text-xs text-blue-200 bg-black/50">
            <span className="text-yellow-300 font-bold">@{post.userId}</span> — {post.title}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setQuoteOpen(false)}
              className="text-blue-200 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={submitQuote}
              disabled={!quoteText.trim()}
              className="rpg-command-btn text-yellow-300 border-yellow-400"
            >
              Post Quote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
