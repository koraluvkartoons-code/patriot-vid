import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUserId, type UserProfile, type Comment as CommentType, type PostMedia } from "@/lib/store";
import { fetchComments, createComment, deleteComment, uploadMedia } from "@/lib/api";
import UserBadge from "./UserBadge";
import GiphyPicker from "./GiphyPicker";
import Lightbox from "./Lightbox";
import { ImagePlus, Video, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  postId: string;
  onNeedSetup: () => void;
  profiles: Record<string, UserProfile>;
}

type PendingMedia = {
  file?: File;
  preview: string;
  type: "image" | "video";
};

const MAX_COMMENT_PHOTOS = 10;
const MAX_COMMENT_VIDEOS = 10;

export default function CommentSection({ postId, onNeedSetup, profiles }: Props) {
  const [text, setText] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGiphy, setShowGiphy] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadComments = async () => {
    try {
      const data = await fetchComments(postId);
      setComments(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => { loadComments(); }, [postId]);

  const photoCount = pendingMedia.filter(m => m.type === "image").length;
  const videoCount = pendingMedia.filter(m => m.type === "video").length;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const next: PendingMedia[] = [];
    let photos = photoCount;
    let videos = videoCount;
    let skipped = false;

    for (const f of files) {
      const type: "image" | "video" = f.type.startsWith("video") ? "video" : "image";
      if (type === "image" && photos >= MAX_COMMENT_PHOTOS) {
        skipped = true;
        continue;
      }
      if (type === "video" && videos >= MAX_COMMENT_VIDEOS) {
        skipped = true;
        continue;
      }
      if (type === "image") photos++;
      else videos++;
      next.push({ file: f, type, preview: URL.createObjectURL(f) });
    }

    if (skipped) {
      toast({
        title: "Limit reached",
        description: `Max ${MAX_COMMENT_PHOTOS} photos and ${MAX_COMMENT_VIDEOS} videos per comment.`,
      });
    }

    if (next.length) {
      setPendingMedia(prev => [...prev, ...next]);
    }
  };

  const removePending = (index: number) => {
    setPendingMedia(prev => {
      const item = prev[index];
      if (item && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearPending = () => {
    pendingMedia.forEach(m => {
      if (m.preview.startsWith("blob:")) URL.revokeObjectURL(m.preview);
    });
    setPendingMedia([]);
  };

  const addGiphy = (url: string) => {
    if (photoCount >= MAX_COMMENT_PHOTOS) {
      toast({ title: "Limit reached", description: `Max ${MAX_COMMENT_PHOTOS} photos per comment.` });
      return;
    }
    setPendingMedia(prev => [...prev, { preview: url, type: "image" }]);
    setShowGiphy(false);
  };

  const submit = async () => {
    const uid = getCurrentUserId();
    if (!uid) { onNeedSetup(); return; }
    if (!text.trim() && pendingMedia.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const mediaList: PostMedia[] = [];

      for (let i = 0; i < pendingMedia.length; i++) {
        const item = pendingMedia[i];
        if (item.file) {
          const url = await uploadMedia(item.file);
          mediaList.push({ url, type: item.type });
        } else {
          // Pre-hosted link or GIF
          mediaList.push({ url: item.preview, type: item.type });
        }
        setUploadProgress(i + 1);
      }

      await createComment({
        postId,
        userId: uid,
        text: text.trim(),
        media: mediaList,
      });

      clearPending();
      setText("");
      loadComments();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload";
      toast({ title: "Error posting comment", description: msg });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const me = getCurrentUserId();
  const isAdmin = me === "PatriotAdmin";

  const removeComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await deleteComment(id);
    loadComments();
  };

  return (
    <div className="space-y-3">
      {comments.map(c => {
        const media = c.media && c.media.length > 0 ? c.media : (c.mediaUrl ? [{ url: c.mediaUrl, type: (c.mediaType === "video" ? "video" : "image") as "image" | "video" }] : []);
        const images = media.filter(m => m.type === "image");
        const videos = media.filter(m => m.type === "video");

        return (
          <div key={c.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <UserBadge userId={c.userId} size="sm" profiles={profiles} />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                {(isAdmin || me === c.userId) && (
                  <button onClick={() => removeComment(c.id)} title="Delete comment" aria-label="Delete comment">
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
            </div>

            {c.text && <p className="text-foreground text-sm whitespace-pre-wrap">{c.text}</p>}

            {/* Display multiple photos if attached */}
            {images.length > 0 && (
              <div className={`grid gap-1.5 mt-2 ${images.length === 1 ? "grid-cols-1 max-w-sm" : images.length === 2 ? "grid-cols-2 max-w-md" : "grid-cols-3 max-w-lg"}`}>
                {images.map((img, idx) => (
                  <div
                    key={img.url + idx}
                    className="relative overflow-hidden rounded bg-black/40 cursor-pointer group"
                    onClick={() => {
                      setLightboxImages(images.map(m => m.url));
                      setLightboxIndex(idx);
                    }}
                  >
                    <img
                      src={img.url}
                      alt=""
                      loading="lazy"
                      className="w-full h-28 object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Display multiple videos if attached */}
            {videos.length > 0 && (
              <div className={`grid gap-2 mt-2 ${videos.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-2 max-w-xl"}`}>
                {videos.map((vid, idx) => (
                  <div key={vid.url + idx} className="rounded overflow-hidden bg-black border border-border/40">
                    <video
                      src={vid.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-60 object-contain bg-black"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="bg-muted border-border text-foreground min-h-[44px] text-sm"
          maxLength={1000}
        />

        {/* Pending media preview queue */}
        {pendingMedia.length > 0 && (
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-2">
              {pendingMedia.map((m, idx) => (
                <div key={m.preview + idx} className="relative rounded overflow-hidden bg-black/60 border border-border/60">
                  {m.type === "video" ? (
                    <video src={m.preview} className="h-16 w-full object-cover" muted preload="metadata" />
                  ) : (
                    <img src={m.preview} alt="" className="h-16 w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removePending(idx)}
                    className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full p-0.5 hover:bg-destructive"
                    aria-label="Remove media"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-0.5 left-1 text-[9px] bg-black/70 px-1 rounded text-white uppercase font-mono">
                    {m.type}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {photoCount}/{MAX_COMMENT_PHOTOS} photos · {videoCount}/{MAX_COMMENT_VIDEOS} videos selected
            </p>
          </div>
        )}

        {showGiphy && (
          <GiphyPicker
            onSelect={addGiphy}
            onClose={() => setShowGiphy(false)}
          />
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = "image/*";
                fileRef.current.click();
              }
            }}
            disabled={uploading}
            className="text-primary hover:text-accent h-7 px-2 text-xs flex items-center gap-1"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Photos</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = "video/*";
                fileRef.current.click();
              }
            }}
            disabled={uploading}
            className="text-primary hover:text-accent h-7 px-2 text-xs flex items-center gap-1"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Videos</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setShowGiphy(!showGiphy)}
            disabled={uploading}
            className="text-primary hover:text-accent h-7 px-2 font-bold text-xs"
          >
            GIF
          </Button>

          <div className="flex-1" />

          <Button
            size="sm"
            onClick={submit}
            disabled={(!text.trim() && pendingMedia.length === 0) || uploading}
            className="gradient-btn text-foreground h-7 text-xs font-semibold"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                {pendingMedia.length > 0 ? `Uploading ${uploadProgress}/${pendingMedia.length}` : "Sending..."}
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
