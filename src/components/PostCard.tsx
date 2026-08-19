import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type Post, type UserProfile, getCurrentUserId } from "@/lib/store";
import { fetchPostMedia, updatePost, togglePostLike, togglePinPost, deletePost, addRepost, removeRepost, fetchRepostsFor } from "@/lib/api";
import { tagClass, tagLabel, logTime } from "@/lib/tags";
import UserBadge from "./UserBadge";
import CommentSection from "./CommentSection";
import Lightbox from "./Lightbox";
import RpgPostScene from "./rpg/RpgPostScene";
import { Heart, MessageCircle, Edit, ExternalLink, Pin, Trash2, Link2, ChevronRight, ChevronDown, Repeat2, Quote } from "lucide-react";
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
  compact?: boolean;
  hideActions?: boolean;
  variant?: "default" | "rpg";
}

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
        className="text-primary hover:text-accent underline underline-offset-2 break-all font-semibold"
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

export default function PostCard({ post, onNeedSetup, onRefresh, profiles, compact = false, hideActions = false, variant = "default" }: Props) {
  const [expanded, setExpanded] = useState(compact || variant === "rpg");
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
  const hasMedia = gallery.length > 0 || !!mediaType;
  const isLong = post.description.length > 90 || hasMedia;
  const reposted = currentUser ? reposters.includes(currentUser) : false;

  const photoUrls = gallery.length > 0
    ? gallery.filter(m => m.type === "image").map(m => m.url)
    : (mediaUrl && mediaType === "image" ? [mediaUrl] : []);

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

    return () => {
      cancelled = true;
    };
  }, [post.id, post.mediaType, post.mediaUrl]);

  const loadReposts = async () => {
    try {
      const map = await fetchRepostsFor([post.id]);
      setReposters(map[post.id] || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { if (!hideActions) loadReposts(); /* eslint-disable-next-line */ }, [post.id, hideActions]);

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
      toast({ title: "Reposted" });
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
    toast({ title: "Quote posted" });
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
    if (!confirm("Delete this post permanently?")) return;
    await deletePost(post.id);
    onRefresh();
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: url });
    } catch {
      toast({ title: "Copy failed", description: url });
    }
  };

  if (variant === "rpg") {
    return (
      <RpgPostScene
        post={post}
        onNeedSetup={onNeedSetup}
        onRefresh={onRefresh}
        profiles={profiles}
        compact={compact}
        hideActions={hideActions}
      />
    );
  }

  return (
    <article className={`gradient-card border-l-2 border-y border-r border-border/60 rounded-sm text-[13px] leading-relaxed transition-colors hover:bg-muted/30 ${post.isPinned ? "border-l-primary" : "border-l-border"}`}>
      <div className="flex items-start gap-1.5 px-2 py-1.5">
        {!compact && (
          <button
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? "Collapse entry" : "Expand entry"}
            className="mt-0.5 text-muted-foreground hover:text-primary shrink-0"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-muted-foreground">[{logTime(post.createdAt)}]</span>
            <span className={`${tagClass(post.category)} font-bold`}>[{tagLabel(post.category)}]</span>
            {post.isPinned && <span className="text-primary text-[11px]">[PINNED]</span>}
            <Link to={`/post/${post.id}`} className="text-foreground font-semibold hover:text-primary break-words">
              {post.title}
            </Link>
            {post.description && (
              <span className={`text-muted-foreground break-words ${expanded ? "" : "truncate max-w-full"}`}>
                -- {expanded ? linkify(post.description) : post.description.slice(0, 90) + (post.description.length > 90 ? "…" : "")}
              </span>
            )}
          </div>

          {!expanded && isLong && (
            <button onClick={() => setExpanded(true)} className="text-[11px] text-accent hover:text-primary">
              [+] expand
            </button>
          )}

          {expanded && (
            <div className="mt-1.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <UserBadge userId={post.userId} profiles={profiles} />
                {!hideActions && (
                  <div className="flex items-center gap-1">
                    <button onClick={copyLink} title="Copy link to post">
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" />
                    </button>
                    {(isOwner || isAdmin) && (
                      <>
                        <button onClick={handlePin} title={post.isPinned ? "Unpin" : "Pin"}>
                          <Pin className={`w-3.5 h-3.5 ${post.isPinned ? "text-primary fill-primary" : "text-muted-foreground hover:text-primary"}`} />
                        </button>
                        <button onClick={() => setEditing(!editing)}><Edit className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" /></button>
                        <button onClick={handleDelete} title="Delete"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {gallery.length > 0 ? (
                <div className={gallery.length === 1 ? "" : "grid grid-cols-2 gap-1"}>
                  {gallery.map((m, i) => (
                    m.type === "video" ? (
                      <video key={i} src={m.url} controls preload="none" className={`w-full bg-background rounded-sm ${gallery.length === 1 ? "max-h-64 object-contain" : "h-32 object-cover"}`} />
                    ) : m.type === "link" ? (
                      <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-muted/50 text-primary hover:text-accent transition-colors col-span-full rounded-sm">
                        <ExternalLink className="w-3 h-3" /> <span className="text-xs truncate">{m.url}</span>
                      </a>
                    ) : (
                      <img
                        key={i}
                        src={m.url}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        onClick={() => setLightbox(photoUrls.indexOf(m.url))}
                        className={`w-full bg-background rounded-sm cursor-zoom-in ${gallery.length === 1 ? "max-h-64 object-contain" : "h-32 object-cover"}`}
                      />
                    )
                  ))}
                </div>
              ) : (
                <>
                  {mediaType && !mediaUrl && <div className="w-full h-24 bg-muted/50 animate-pulse rounded-sm" />}
                  {mediaUrl && (
                    mediaType === "video" ? (
                      <video src={mediaUrl} controls preload="none" className="w-full max-h-64 object-contain bg-background rounded-sm" />
                    ) : mediaType === "link" ? (
                      <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-muted/50 text-primary hover:text-accent transition-colors rounded-sm">
                        <ExternalLink className="w-3 h-3" /> <span className="text-xs truncate">{mediaUrl}</span>
                      </a>
                    ) : (
                      <img src={mediaUrl} alt={post.title} loading="lazy" decoding="async" onClick={() => setLightbox(0)} className="w-full max-h-64 object-contain bg-background rounded-sm cursor-zoom-in" />
                    )
                  )}
                </>
              )}

              {editing && (
                <div className="space-y-2">
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-muted border-border text-foreground" />
                  <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="bg-muted border-border text-foreground" />
                  <label className="block text-xs text-muted-foreground">Category</label>
                  <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Category (optional)" maxLength={40} className="bg-muted border-border text-foreground" />
                  <label className="block text-xs text-muted-foreground">Post date</label>
                  <Input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-muted border-border text-foreground" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} className="gradient-btn">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-muted-foreground">Cancel</Button>
                  </div>
                </div>
              )}

              {!hideActions && (
                <div className="flex items-center gap-3 text-[11px]">
                  <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                    <Heart className={`w-3.5 h-3.5 ${liked ? "fill-primary" : ""}`} /> {post.likes.length}
                  </button>
                  <button
                    onClick={handleRepost}
                    title={reposted ? "Undo repost" : "Repost"}
                    className={`flex items-center gap-1 transition-colors ${reposted ? "text-term-green" : "text-muted-foreground hover:text-term-green"}`}
                  >
                    <Repeat2 className="w-3.5 h-3.5" /> {reposted ? "Unrepost" : "Repost"} {reposters.length > 0 && `(${reposters.length})`}
                  </button>
                  <button onClick={() => { if (!currentUser) { onNeedSetup(); return; } setQuoteOpen(true); }} className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
                    <Quote className="w-3.5 h-3.5" /> Quote
                  </button>
                  <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Comments
                  </button>
                  <Link to={`/post/${post.id}`} className="text-muted-foreground ml-auto hover:text-primary">{new Date(post.createdAt).toLocaleString()}</Link>
                </div>
              )}

              {showComments && (
                <div className="pt-2 border-t border-border">
                  <CommentSection postId={post.id} onNeedSetup={onNeedSetup} profiles={profiles} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {lightbox !== null && photoUrls.length > 0 && (
        <Lightbox images={photoUrls} index={Math.max(0, lightbox)} onClose={() => setLightbox(null)} />
      )}

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-primary text-sm">// QUOTE_POST</DialogTitle></DialogHeader>
          <Textarea
            value={quoteText}
            onChange={e => setQuoteText(e.target.value)}
            placeholder="Add your comment..."
            maxLength={1000}
            className="bg-muted border-border text-foreground min-h-[80px]"
          />
          <div className="border border-border rounded-sm p-2 text-[11px] text-muted-foreground">
            <span className="text-accent">@{post.userId}</span> — {post.title}
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setQuoteOpen(false)} className="text-muted-foreground">Cancel</Button>
            <Button size="sm" onClick={submitQuote} disabled={!quoteText.trim()} className="gradient-btn">Post quote</Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
