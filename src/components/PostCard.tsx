import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type Post, type UserProfile, getCurrentUserId } from "@/lib/store";
import { fetchPostMedia, updatePost, togglePostLike, togglePinPost, deletePost } from "@/lib/api";
import UserBadge from "./UserBadge";
import CommentSection from "./CommentSection";
import { Heart, MessageCircle, Edit, ExternalLink, Pin, Trash2, Link2 } from "lucide-react";
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
  const currentUser = getCurrentUserId();
  const isAdmin = currentUser === "PatriotAdmin";
  const isOwner = currentUser === post.userId;
  const liked = currentUser ? post.likes.includes(currentUser) : false;

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
    <div className={`gradient-card border rounded-xl overflow-hidden glow-purple transition-all hover:glow-pink ${post.isPinned ? "border-primary ring-1 ring-primary/30" : "border-border"}`}>
      {post.isPinned && (
        <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold">
          <Pin className="w-3 h-3 fill-primary" /> Pinned Post
        </div>
      )}
      {gallery.length > 0 ? (
        <div className={gallery.length === 1 ? "" : "grid grid-cols-2 gap-1 p-1"}>
          {gallery.map((m, i) => (
            m.type === "video" ? (
              <video key={i} src={m.url} controls preload="none" className={`w-full bg-background ${gallery.length === 1 ? "max-h-64 object-contain" : "h-32 object-cover rounded-lg"}`} />
            ) : m.type === "link" ? (
              <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-muted/50 text-primary hover:text-accent transition-colors col-span-full">
                <ExternalLink className="w-3 h-3" /> <span className="text-xs truncate">{m.url}</span>
              </a>
            ) : (
              <img key={i} src={m.url} alt={post.title} loading="lazy" decoding="async" className={`w-full bg-background ${gallery.length === 1 ? "max-h-64 object-contain" : "h-32 object-cover rounded-lg"}`} />
            )
          ))}
        </div>
      ) : (
        <>
          {mediaType && !mediaUrl && <div className="w-full h-28 bg-muted/50 animate-pulse" />}
          {mediaUrl && (
            mediaType === "video" ? (
              <video src={mediaUrl} controls preload="none" className="w-full max-h-64 object-contain bg-background" />
            ) : mediaType === "link" ? (
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-muted/50 text-primary hover:text-accent transition-colors">
                <ExternalLink className="w-3 h-3" /> <span className="text-xs truncate">{mediaUrl}</span>
              </a>
            ) : (
              <img src={mediaUrl} alt={post.title} loading="lazy" decoding="async" className="w-full max-h-64 object-contain bg-background" />
            )
          )}
        </>
      )}
      <div className="p-2.5">
        <div className="flex items-center justify-between mb-2">
          <UserBadge userId={post.userId} profiles={profiles} />
          <div className="flex items-center gap-1">
            <button onClick={copyLink} title="Copy link to post">
              <Link2 className="w-4 h-4 text-muted-foreground hover:text-accent" />
            </button>
            {(isOwner || isAdmin) && (
              <>
                <button onClick={handlePin} title={post.isPinned ? "Unpin" : "Pin"}>
                  <Pin className={`w-4 h-4 ${post.isPinned ? "text-primary fill-primary" : "text-muted-foreground hover:text-primary"}`} />
                </button>
                <button onClick={() => setEditing(!editing)}><Edit className="w-4 h-4 text-muted-foreground hover:text-accent" /></button>
                <button onClick={handleDelete} title="Delete"><Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
              </>
            )}
          </div>
        </div>
        {post.category && !editing && (
          <div className="mb-2">
            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{post.category}</span>
          </div>
        )}
        {editing ? (
          <div className="space-y-2 mb-2">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-muted border-border text-foreground" />
            <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="bg-muted border-border text-foreground" />
            <label className="block text-xs text-muted-foreground">Category</label>
            <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Category (optional)" maxLength={40} className="bg-muted border-border text-foreground" />
            <label className="block text-xs text-muted-foreground">Post date</label>
            <Input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-muted border-border text-foreground" />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} className="gradient-btn text-foreground">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-muted-foreground">Cancel</Button>
            </div>
          </div>
        ) : (
          <Link to={`/post/${post.id}`} className="block hover:opacity-90">
            <h2 className="text-foreground font-bold text-base mb-0.5">{post.title}</h2>
            {post.description && <p className="text-muted-foreground text-xs mb-1.5">{post.description}</p>}
          </Link>
        )}
        <div className="flex items-center gap-3 text-xs">
          <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
            <Heart className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} /> {post.likes.length}
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
            <MessageCircle className="w-4 h-4" /> Comments
          </button>
          <Link to={`/post/${post.id}`} className="text-muted-foreground text-xs ml-auto hover:text-primary">{new Date(post.createdAt).toLocaleString()}</Link>
        </div>
        {showComments && (
          <div className="mt-3 pt-3 border-t border-border">
            <CommentSection postId={post.id} onNeedSetup={onNeedSetup} profiles={profiles} />
          </div>
        )}
      </div>
    </div>
  );
}
