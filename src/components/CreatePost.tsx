import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUserId } from "@/lib/store";
import { createPost, uploadMedia } from "@/lib/api";
import { ImagePlus, Video, Link, X, Loader2 } from "lucide-react";

interface Props {
  onNeedSetup: () => void;
  onCreated: () => void;
}

export default function CreatePost({ onNeedSetup, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "link" | undefined>();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaFile(f);
    setMediaType(type);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setMediaUrl("");
  };

  const clearMedia = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMediaUrl("");
    setPreviewUrl("");
    setMediaFile(null);
    setMediaType(undefined);
  };

  const submit = async () => {
    const uid = getCurrentUserId();
    if (!uid) { onNeedSetup(); return; }
    if (!title.trim()) return;

    setUploading(true);
    try {
      let finalMediaUrl = mediaUrl;

      // Upload file to storage if we have one
      if (mediaFile) {
        finalMediaUrl = await uploadMedia(mediaFile);
      }

      await createPost({
        userId: uid,
        title: title.trim(),
        description: desc.trim(),
        mediaUrl: finalMediaUrl || undefined,
        mediaType,
      });
      clearMedia();
      setTitle("");
      setDesc("");
      onCreated();
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || mediaUrl;

  return (
    <div className="gradient-card border border-border rounded-xl p-4 glow-purple">
      <h3 className="text-foreground font-semibold mb-3">Create Post</h3>
      <Input placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-muted border-border text-foreground mb-2" maxLength={120} />
      <Textarea placeholder="What's on your mind?" value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-muted border-border text-foreground mb-2 min-h-[60px]" maxLength={2000} />
      {displayUrl && (
        <div className="relative mb-2">
          {mediaType === "video" ? (
            <video src={displayUrl} controls className="max-h-48 rounded-lg w-full object-contain bg-muted" />
          ) : (
            <img src={displayUrl} alt="" className="max-h-48 rounded-lg w-full object-contain bg-muted" />
          )}
          <button onClick={clearMedia} className="absolute top-1 right-1 bg-background/80 rounded-full p-1">
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
        <Button size="sm" variant="ghost" onClick={() => { fileRef.current!.accept = "image/*"; fileRef.current?.click(); }} className="text-primary hover:text-accent" disabled={uploading}>
          <ImagePlus className="w-4 h-4 mr-1" /> Photo
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { fileRef.current!.accept = "video/*"; fileRef.current?.click(); }} className="text-primary hover:text-accent" disabled={uploading}>
          <Video className="w-4 h-4 mr-1" /> Video
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowLink(!showLink)} className="text-primary hover:text-accent" disabled={uploading}>
          <Link className="w-4 h-4 mr-1" /> Link
        </Button>
        <div className="flex-1" />
        <Button onClick={submit} disabled={!title.trim() || uploading} className="gradient-btn text-foreground font-semibold">
          {uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Uploading...</> : "Post"}
        </Button>
      </div>
    </div>
  );
}
