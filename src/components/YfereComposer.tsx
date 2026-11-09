import { useEffect, useRef, useState } from "react";
import { ImagePlus, Video, Link2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadMedia } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId, type PostMedia } from "@/lib/store";
import { YFERE_SITE } from "@/lib/yfere";

type Attachment = { file: File; preview: string; type: "image" | "video" };
export default function YfereComposer({ categories, onCreated, onNeedSetup }: { categories: string[]; onCreated: () => void; onNeedSetup: () => void }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [url, setUrl] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => () => filesRef.current.forEach(f => URL.revokeObjectURL(f.preview)), []);

  const submit = async () => {
    if (busy) return;
    const username = getCurrentUserId();
    if (!username) { onNeedSetup(); return; }
    if (!text.trim() && !files.length && !url.trim()) return;
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) { setError("Add a link starting with https:// or http://."); return; }
    setBusy(true); setError("");
    try {
      const media: PostMedia[] = [];
      for (const attachment of files) media.push({ url: await uploadMedia(attachment.file), type: attachment.type });
      if (url.trim()) media.push({ url: url.trim(), type: "link" });
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: username, site: YFERE_SITE, title: text.trim().split("\n")[0].slice(0, 120) || "Post",
        description: text.trim(), category: category.trim() || "Unfiled",
        media: media as unknown as never, media_url: media[0]?.url || null, media_type: media[0]?.type || null, likes: [],
      });
      if (insertError) throw insertError;
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]); setText(""); setUrl(""); onCreated();
    } catch { setError("Your item could not be added. Your draft is still here; try again."); }
    finally { setBusy(false); }
  };

  return <div className="space-y-4">
    <div><label htmlFor="yfere-category" className="text-xs text-muted-foreground">CATEGORY</label><Input id="yfere-category" placeholder="Name a category" maxLength={40} list="yfere-categories" value={category} onChange={e => setCategory(e.target.value)} /><datalist id="yfere-categories">{categories.map(c => <option key={c} value={c} />)}</datalist></div>
    <Textarea aria-label="Item text" placeholder="Add a word, a thought, a post…" rows={4} maxLength={2000} value={text} onChange={e => setText(e.target.value)} />
    {files.length > 0 && <div className="grid grid-cols-3 gap-2">{files.map((f, i) => <div key={f.preview} className="relative">
      {f.type === "video" ? <video src={f.preview} muted preload="metadata" className="w-full h-24 object-cover rounded" /> : <img src={f.preview} alt="Attachment preview" className="w-full h-24 object-cover rounded" />}
      <Button size="icon" variant="secondary" className="absolute top-1 right-1 h-6 w-6" aria-label="Remove attachment" disabled={busy} onClick={() => { URL.revokeObjectURL(f.preview); setFiles(prev => prev.filter((_, index) => index !== i)); }}><X className="w-3 h-3" /></Button>
    </div>)}</div>}
    {showLink && <Input aria-label="Item link" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} />}
    <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={e => {
      const added = Array.from(e.target.files || []).filter(f => /^(image|video)\//.test(f.type));
      const next = [...files];
      for (const file of added) {
        const type = file.type.startsWith("video/") ? "video" : "image";
        if (next.filter(f => f.type === type).length >= 10) { setError("Up to 10 photos and 10 videos per item."); continue; }
        next.push({ file, type, preview: URL.createObjectURL(file) });
      }
      setFiles(next); e.target.value = "";
    }} />
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" disabled={busy} onClick={() => { if (fileRef.current) { fileRef.current.accept = "image/*"; fileRef.current.click(); } }}><ImagePlus className="w-4 h-4 mr-1" />Photos</Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => { if (fileRef.current) { fileRef.current.accept = "video/*"; fileRef.current.click(); } }}><Video className="w-4 h-4 mr-1" />Videos</Button>
      <Button variant="outline" size="sm" onClick={() => setShowLink(s => !s)}><Link2 className="w-4 h-4 mr-1" />Link</Button>
    </div>
    {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
    <Button className="w-full" disabled={busy || (!text.trim() && !files.length && !url.trim())} onClick={() => void submit()}>{busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}{busy ? "Adding…" : "Add to chain"}</Button>
  </div>;
}