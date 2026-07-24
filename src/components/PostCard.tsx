import { useEffect, useState } from "react";
import { type Post, type UserProfile, getCurrentUserId } from "@/lib/store";
import { fetchPostMedia, updatePost, togglePostLike, togglePinPost, deletePost } from "@/lib/api";
import UserBadge from "./UserBadge";
import CommentSection from "./CommentSection";
import { Heart, MessageCircle, Edit, ExternalLink, Pin, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  const [mediaUrl, setMediaUrl] = useState(post.mediaUrl);
  const [mediaType, setMediaType] = useState(post.mediaType);
  const currentUser = getCurrentUserId();
  const isAdmin = currentUser === "PatriotAdmin";
  const isOwner = currentUser === post.userId;
  const liked = currentUser ? post.likes.includes(currentUser) : false;

  useEffect(() => {
    let cancelled = false;

    const loadMedia = async () => {
      setMediaUrl(post.mediaUrl);
      setMediaType(post.mediaType);

      if (!post.mediaType || post.mediaUrl) return;

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
    await updatePost(post.id, editTitle.trim() || post.title, editDesc.trim(), iso);
    setEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post permanently?")) return;
    await deletePost(post.id);
    onRefresh();
  };

  return (
    <div className={`gradient-card border rounded-xl overflow-hidden glow-purple transition-all hover:glow-pink ${post.isPinned ? "border-primary ring-1 ring-primary/30" : "border-border"}`}>
      {post.isPinned && (
        <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold">
          <Pin className="w-3 h-3 fill-primary" /> Pinned Post
        </div>
      )}
      {mediaType && !mediaUrl && <div className="w-full h-40 bg-muted/50 animate-pulse" />}
      {mediaUrl && (
        mediaType === "video" ? (
          <video src={mediaUrl} controls className="w-full max-h-96 object-contain bg-background" />
        ) : mediaType === "link" ? (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-muted/50 text-primary hover:text-accent transition-colors">
            <ExternalLink className="w-4 h-4" /> <span className="text-sm truncate">{mediaUrl}</span>
          </a>
        ) : (
          <img src={mediaUrl} alt={post.title} className="w-full max-h-96 object-contain bg-background" />
        )
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <UserBadge userId={post.userId} profiles={profiles} />
          <div className="flex items-center gap-1">
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
        {editing ? (
          <div className="space-y-2 mb-2">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-muted border-border text-foreground" />
            <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="bg-muted border-border text-foreground" />
            <label className="block text-xs text-muted-foreground">Post date</label>
            <Input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-muted border-border text-foreground" />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} className="gradient-btn text-foreground">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-muted-foreground">Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-foreground font-bold text-lg mb-1">{post.title}</h2>
            {post.description && <p className="text-muted-foreground text-sm mb-2">{post.description}</p>}
          </>
        )}
        <div className="flex items-center gap-4 text-sm">
          <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
            <Heart className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} /> {post.likes.length}
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
            <MessageCircle className="w-4 h-4" /> Comments
          </button>
          <span className="text-muted-foreground text-xs ml-auto">{new Date(post.createdAt).toLocaleString()}</span>
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
