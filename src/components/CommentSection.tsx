import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUserId, type UserProfile, type Comment as CommentType } from "@/lib/store";
import { fetchComments, createComment, deleteComment } from "@/lib/api";
import UserBadge from "./UserBadge";
import GiphyPicker from "./GiphyPicker";
import { ImagePlus, Trash2 } from "lucide-react";


interface Props {
  postId: string;
  onNeedSetup: () => void;
  profiles: Record<string, UserProfile>;
}

export default function CommentSection({ postId, onNeedSetup, profiles }: Props) {
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "gif" | undefined>();
  const [showGiphy, setShowGiphy] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadComments = async () => {
    const data = await fetchComments(postId);
    setComments(data);
  };

  useEffect(() => { loadComments(); }, [postId]);

  const submit = async () => {
    const uid = getCurrentUserId();
    if (!uid) { onNeedSetup(); return; }
    if (!text.trim() && !mediaUrl) return;
    await createComment({
      postId, userId: uid, text: text.trim(),
      mediaUrl: mediaUrl || undefined, mediaType,
    });
    setText(""); setMediaUrl(""); setMediaType(undefined);
    loadComments();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setMediaUrl(reader.result as string); setMediaType("image"); };
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-3">
      {comments.map(c => (
        <div key={c.id} className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <UserBadge userId={c.userId} size="sm" profiles={profiles} />
            <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          {c.text && <p className="text-foreground text-sm">{c.text}</p>}
          {c.mediaUrl && (
            c.mediaType === "gif" || c.mediaUrl.includes("giphy") ? (
              <img src={c.mediaUrl} alt="gif" className="max-h-40 rounded mt-1" />
            ) : (
              <img src={c.mediaUrl} alt="" className="max-h-40 rounded mt-1" />
            )
          )}
        </div>
      ))}

      <div className="space-y-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." className="bg-muted border-border text-foreground min-h-[40px] text-sm" maxLength={1000} />
        {mediaUrl && (
          <div className="relative inline-block">
            <img src={mediaUrl} alt="" className="max-h-24 rounded" />
            <button onClick={() => { setMediaUrl(""); setMediaType(undefined); }} className="absolute -top-1 -right-1 bg-destructive rounded-full p-0.5"><span className="text-[10px] text-foreground">✕</span></button>
          </div>
        )}
        {showGiphy && <GiphyPicker onSelect={(url) => { setMediaUrl(url); setMediaType("gif"); setShowGiphy(false); }} onClose={() => setShowGiphy(false)} />}
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} className="text-primary hover:text-accent h-7 px-2">
            <ImagePlus className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowGiphy(!showGiphy)} className="text-primary hover:text-accent h-7 px-2 font-bold">
            GIF
          </Button>
          <div className="flex-1" />
          <Button size="sm" onClick={submit} disabled={!text.trim() && !mediaUrl} className="gradient-btn text-foreground h-7 text-xs">Send</Button>
        </div>
      </div>
    </div>
  );
}
