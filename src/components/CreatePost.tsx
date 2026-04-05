import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Post, generateId, getCurrentUserId, getPosts, savePosts } from "@/lib/store";
import { ImagePlus, Video, Link, X } from "lucide-react";

interface Props {
  onNeedSetup: () => void;
  onCreated: () => void;
}

export default function CreatePost({ onNeedSetup, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "link" | undefined>();
  const [showLink, setShowLink] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setMediaUrl(reader.result as string); setMediaType(type); };
    reader.readAsDataURL(f);
  };

  const submit = () => {
    const uid = getCurrentUserId();
    if (!uid) { onNeedSetup(); return; }
    if (!title.trim()) return;
    const post: Post = {
      id: generateId(),
      userId: uid,
      title: title.trim(),
      description: desc.trim(),
      mediaUrl: mediaUrl || undefined,
      mediaType,
      likes: [],
      createdAt: Date.now(),
    };
    const posts = getPosts();
    posts.unshift(post);
    savePosts(posts);
    setTitle(""); setDesc(""); setMediaUrl(""); setMediaType(undefined);
    onCreated();
  };

  return (
    <div className="gradient-card border border-border rounded-xl p-4 glow-purple">
      <h3 className="text-foreground font-semibold mb-3">Create Post</h3>
      <Input placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-muted border-border text-foreground mb-2" maxLength={120} />
      <Textarea placeholder="What's on your mind?" value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-muted border-border text-foreground mb-2 min-h-[60px]" maxLength={2000} />
      {mediaUrl && (
        <div className="relative mb-2">
          {mediaType === "video" ? (
            <video src={mediaUrl} controls className="max-h-48 rounded-lg w-full object-contain bg-muted" />
          ) : (
            <img src={mediaUrl} alt="" className="max-h-48 rounded-lg w-full object-contain bg-muted" />
          )}
          <button onClick={() => { setMediaUrl(""); setMediaType(undefined); }} className="absolute top-1 right-1 bg-background/80 rounded-full p-1">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}
      {showLink && (
        <Input placeholder="Paste URL..." value={mediaUrl} onChange={(e) => { setMediaUrl(e.target.value); setMediaType("link"); }} className="bg-muted border-border text-foreground mb-2" />
      )}
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" className="hidden" accept="image/*,video/*" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f?.type.startsWith("video")) handleFile(e, "video");
          else handleFile(e, "image");
        }} />
        <Button size="sm" variant="ghost" onClick={() => { fileRef.current!.accept = "image/*"; fileRef.current?.click(); }} className="text-primary hover:text-accent">
          <ImagePlus className="w-4 h-4 mr-1" /> Photo
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { fileRef.current!.accept = "video/*"; fileRef.current?.click(); }} className="text-primary hover:text-accent">
          <Video className="w-4 h-4 mr-1" /> Video
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowLink(!showLink)} className="text-primary hover:text-accent">
          <Link className="w-4 h-4 mr-1" /> Link
        </Button>
        <div className="flex-1" />
        <Button onClick={submit} disabled={!title.trim()} className="gradient-btn text-foreground font-semibold">Post</Button>
      </div>
    </div>
  );
}
