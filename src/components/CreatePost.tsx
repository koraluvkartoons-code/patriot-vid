import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUserId, type PostMedia } from "@/lib/store";
import { createPost, uploadMedia } from "@/lib/api";
import ImageCropper from "./ImageCropper";
import { ImagePlus, Video, Link, X, Loader2, Crop, CalendarClock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  onNeedSetup: () => void;
  onCreated: () => void;
  categories?: string[];
  site?: string;
}

const MAX_PHOTOS = 10;
const MAX_VIDEOS = 10;

type Pending = { file: File; type: "image" | "video"; preview: string };

export default function CreatePost({ onNeedSetup, onCreated, categories = [], site = "main" }: Props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [files, setFiles] = useState<Pending[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLink, setShowLink] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const photoCount = files.filter(f => f.type === "image").length;
  const videoCount = files.filter(f => f.type === "video").length;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;

    const next: Pending[] = [];
    let photos = photoCount;
    let videos = videoCount;
    let skipped = false;

    for (const f of picked) {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      if (type === "image" && photos >= MAX_PHOTOS) { skipped = true; continue; }
      if (type === "video" && videos >= MAX_VIDEOS) { skipped = true; continue; }
      if (type === "image") photos++; else videos++;
      next.push({ file: f, type, preview: URL.createObjectURL(f) });
    }

    if (skipped) toast({ title: "Limit reached", description: `Max ${MAX_PHOTOS} photos and ${MAX_VIDEOS} videos per post.` });
    if (next.length) setFiles(prev => [...prev, ...next]);
  };

  const removeAt = (i: number) => {
    setFiles(prev => {
      const item = prev[i];
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setLinkUrl("");
  };

  const submit = async () => {
    const uid = getCurrentUserId();
    if (!uid) { onNeedSetup(); return; }
    if (!title.trim()) return;

    const scheduledIso = showSchedule && scheduleAt ? new Date(scheduleAt).toISOString() : undefined;
    if (scheduledIso && new Date(scheduledIso).getTime() <= Date.now()) {
      toast({ title: "Pick a future time", description: "Scheduled posts must be set in the future." });
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const media: PostMedia[] = [];

      // Upload sequentially so large batches don't overwhelm the browser/network
      for (let i = 0; i < files.length; i++) {
        const url = await uploadMedia(files[i].file);
        media.push({ url, type: files[i].type });
        setProgress(i + 1);
      }

      if (linkUrl.trim()) media.push({ url: linkUrl.trim(), type: "link" });

      await createPost({
        userId: uid,
        title: title.trim(),
        description: desc.trim(),
        // first item stays in the legacy fields for backwards compatibility
        mediaUrl: media[0]?.url,
        mediaType: media[0]?.type,
        media,
        category: category.trim() || undefined,
        scheduledAt: scheduledIso,
        site,
      });
      clearAll();
      setTitle("");
      setDesc("");
      setScheduleAt("");
      setShowSchedule(false);
      if (scheduledIso) toast({ title: "Post scheduled", description: new Date(scheduledIso).toLocaleString() });
      onCreated();
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="gradient-card border border-border rounded-xl p-4 glow-purple">
      <h3 className="text-foreground font-semibold mb-3">Create Post</h3>
      <Input placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-muted border-border text-foreground mb-2" maxLength={120} />
      <Textarea placeholder="What's on your mind?" value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-muted border-border text-foreground mb-2 min-h-[60px]" maxLength={2000} />
      <Input
        placeholder="Category (optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-muted border-border text-foreground mb-2"
        maxLength={40}
        list="post-categories"
      />
      <datalist id="post-categories">
        {categories.map(c => <option key={c} value={c} />)}
      </datalist>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {files.map((f, i) => (
            <div key={f.preview} className="relative">
              {f.type === "video" ? (
                <video src={f.preview} className="h-24 w-full rounded-lg object-cover bg-muted" preload="metadata" muted />
              ) : (
                <img src={f.preview} alt="" loading="lazy" className="h-24 w-full rounded-lg object-cover bg-muted" />
              )}
              <button onClick={() => removeAt(i)} className="absolute top-1 right-1 bg-background/80 rounded-full p-1" aria-label="Remove">
                <X className="w-3 h-3 text-foreground" />
              </button>
              {f.type === "image" && (
                <button onClick={() => setCropIndex(i)} className="absolute bottom-1 right-1 bg-background/80 rounded-full p-1" title="Crop photo" aria-label="Crop photo">
                  <Crop className="w-3 h-3 text-primary" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <p className="text-xs text-muted-foreground mb-2">{photoCount}/{MAX_PHOTOS} photos · {videoCount}/{MAX_VIDEOS} videos</p>
      )}

      {showLink && (
        <Input placeholder="Paste URL..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="bg-muted border-border text-foreground mb-2" />
      )}

      {showSchedule && (
        <div className="mb-2">
          <label className="block text-xs text-muted-foreground mb-1">Publish at</label>
          <Input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} className="bg-muted border-border text-foreground" />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <input ref={fileRef} type="file" multiple className="hidden" accept="image/*,video/*" onChange={handleFiles} />
        <Button size="sm" variant="ghost" onClick={() => { fileRef.current!.accept = "image/*"; fileRef.current?.click(); }} className="text-primary hover:text-accent" disabled={uploading}>
          <ImagePlus className="w-4 h-4 mr-1" /> Photos
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { fileRef.current!.accept = "video/*"; fileRef.current?.click(); }} className="text-primary hover:text-accent" disabled={uploading}>
          <Video className="w-4 h-4 mr-1" /> Videos
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowLink(!showLink)} className="text-primary hover:text-accent" disabled={uploading}>
          <Link className="w-4 h-4 mr-1" /> Link
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowSchedule(s => !s)} className={showSchedule ? "text-accent" : "text-primary hover:text-accent"} disabled={uploading}>
          <CalendarClock className="w-4 h-4 mr-1" /> Schedule
        </Button>
        <div className="flex-1" />
        <Button onClick={submit} disabled={!title.trim() || uploading} className="gradient-btn text-foreground font-semibold">
          {uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {files.length ? `Uploading ${progress}/${files.length}` : "Posting..."}</> : (showSchedule && scheduleAt ? "Schedule" : "Post")}
        </Button>
      </div>

      {cropIndex !== null && files[cropIndex] && (
        <ImageCropper
          file={files[cropIndex].file}
          src={files[cropIndex].preview}
          onCancel={() => setCropIndex(null)}
          onCropped={(file, preview) => {
            setFiles(prev => prev.map((f, i) => {
              if (i !== cropIndex) return f;
              URL.revokeObjectURL(f.preview);
              return { ...f, file, preview };
            }));
            setCropIndex(null);
          }}
        />
      )}
    </div>
  );
}
