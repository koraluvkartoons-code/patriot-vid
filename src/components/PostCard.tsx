import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type Post, type UserProfile, getCurrentUserId } from "@/lib/store";
import { fetchPostMedia, updatePost, togglePostLike, togglePinPost, deletePost, repostPost } from "@/lib/api";
import { tagClass, tagLabel, logTime } from "@/lib/tags";
import UserBadge from "./UserBadge";
import CommentSection from "./CommentSection";
import MediaLightbox from "./MediaLightbox";
import { Heart, MessageCircle, Edit, ExternalLink, Pin, Trash2, Link2, ChevronRight, ChevronDown, Repeat2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Props {
  post: Post;
  onNeedSetup: () => void;
  onRefresh: () => void;
  profiles: Record<string, UserProfile>;
}

export default function PostCard({ post, onNeedSetup, onRefresh, profiles }: Props) {
  const [expanded, setExpanded] = useState(false);
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
  const gallery = post.media && post.media.length > 1 ? post.media : (post.media?.length === 1 && !post.mediaUrl ? post.media : []);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const currentUser = getCurrentUserId();
  const isAdmin = currentUser === "PatriotAdmin";
  const isOwner = currentUser === post.userId;
  const liked = currentUser ? post.likes.includes(currentUser) : false;
  const hasMedia = gallery.length > 0 || !!mediaType;
  const isLong = post.description.length > 90 || hasMedia;
  const isScheduled = new Date(post.createdAt).getTime() > Date.now();
  const viewable = (gallery.length > 0
    ? gallery
    : (mediaUrl && mediaType !== "link" ? [{ url: mediaUrl, type: mediaType }] : [])
  ).filter(m => m.type !== "link");

  const handleRepost = async () => {
    if (!currentUser) { onNeedSetup(); return; }
    await repostPost({
      userId: currentUser,
      originalUser: post.userId,
      title: post.title,
      description: post.description,
      media: gallery.length ? gallery : (mediaUrl ? [{ url: mediaUrl, type: (mediaType as "image" | "video" | "link") || "image" }] : []),
      mediaType,
      category: post.category,
    });
    toast({ title: "Reposted", description: "Shared to your feed." });
    onRefresh();
  };


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

  const handleLike = async () => {
    if (!currentUser) { onNeedSetup(); return; }
    await togglePostLike(post.id, currentUser);
    onRefresh();
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

  return (
    <article className={`gradient-card border-l-2 border-y border-r border-border/60 rounded-sm text-[13px] leading-relaxed transition-colors hover:bg-muted/30 ${post.isPinned ? "border-l-primary" : "border-l-border"}`}>
      <div className="flex items-start gap-1.5 px-2 py-1.5">
        <button
          onClick={() => setExpanded(e => !e)}
          aria-label={expanded ? "Collapse entry" : "Expand entry"}
          className="mt-0.5 text-muted-foreground hover:text-primary shrink-0"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-muted-foreground">[{logTime(post.createdAt)}]</span>
            <span className={`${tagClass(post.category)} font-bold`}>[{tagLabel(post.category)}]</span>
            {post.isPinned && <span className="text-primary text-[11px]">[PINNED]</span>}
            {isScheduled && <span className="text-accent text-[11px]">[SCHEDULED]</span>}
            <Link to={`/post/${post.id}`} className="text-foreground font-semibold hover:text-primary break-words">
              {post.title}
            </Link>
            {post.description && (
              <span className={`text-muted-foreground break-words ${expanded ? "" : "truncate max-w-full"}`}>
                -- {expanded ? post.description : post.description.slice(0, 90) + (post.description.length > 90 ? "…" : "")}
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
                      <img key={i} src={m.url} alt={post.title} loading="lazy" decoding="async" className={`w-full bg-background rounded-sm ${gallery.length === 1 ? "max-h-64 object-contain" : "h-32 object-cover"}`} />
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
                      <img src={mediaUrl} alt={post.title} loading="lazy" decoding="async" className="w-full max-h-64 object-contain bg-background rounded-sm" />
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

              <div className="flex items-center gap-3 text-[11px]">
                <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                  <Heart className={`w-3.5 h-3.5 ${liked ? "fill-primary" : ""}`} /> {post.likes.length}
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> Comments
                </button>
                <Link to={`/post/${post.id}`} className="text-muted-foreground ml-auto hover:text-primary">{new Date(post.createdAt).toLocaleString()}</Link>
              </div>

              {showComments && (
                <div className="pt-2 border-t border-border">
                  <CommentSection postId={post.id} onNeedSetup={onNeedSetup} profiles={profiles} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
