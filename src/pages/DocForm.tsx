import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { ArrowLeft, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, ImagePlus, Video, Edit, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeColorPicker from "@/components/ThemeColorPicker";
import UserSetupDialog from "@/components/UserSetupDialog";
import UserBadge from "@/components/UserBadge";
import { getCurrentUserId, type Post, type UserProfile } from "@/lib/store";
import { createPost, deletePost, fetchPosts, fetchProfiles, updatePost, uploadMedia } from "@/lib/api";

const SITE = "docform";
const clean = (html: string) => DOMPurify.sanitize(html, { ADD_TAGS: ["video"], ADD_ATTR: ["controls", "playsinline"] });

export default function DocForm() {
  const [userId, setUserId] = useState(getCurrentUserId);
  const [showSetup, setShowSetup] = useState(false);
  const [docs, setDocs] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [editing, setEditing] = useState<Post | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const isAdmin = userId === "PatriotAdmin";

  const load = useCallback(async () => {
    const [d, p] = await Promise.allSettled([fetchPosts(200, 0, "newest", undefined, SITE), fetchProfiles()]);
    if (d.status === "fulfilled") setDocs(d.value);
    if (p.status === "fulfilled") setProfiles(p.value);
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!editorRef.current || !editing) return;
    editorRef.current.innerHTML = editing === "new" ? "" : clean(editing.description);
    editorRef.current.focus();
  }, [editing]);

  const open = (doc: Post | "new") => {
    if (!userId) { setShowSetup(true); return; }
    setTitle(doc === "new" ? "" : doc.title);
    setEditing(doc);
  };

  const cmd = (c: string, v?: string) => { document.execCommand(c, false, v); editorRef.current?.focus(); };

  const insertMedia = async (e: React.ChangeEvent<HTMLInputElement>, kind: "image" | "video") => {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    setBusy(true);
    try {
      const url = await uploadMedia(f);
      editorRef.current?.focus();
      const html = kind === "image"
        ? `<p><img src="${url}" alt="" /></p><p><br></p>`
        : `<p><video src="${url}" controls playsinline></video></p><p><br></p>`;
      document.execCommand("insertHTML", false, html);
    } catch (err) { alert((err as Error).message); }
    setBusy(false);
  };

  // Finishing or closing turns the doc into a post
  const finish = async () => {
    if (!editing || !userId) return;
    const html = clean(editorRef.current?.innerHTML || "");
    const empty = !title.trim() && !(editorRef.current?.textContent || "").trim() && !/<(img|video)/.test(html);
    setBusy(true);
    if (!empty) {
      if (editing === "new") await createPost({ userId, title: title.trim() || "Untitled doc", description: html, site: SITE });
      else await updatePost(editing.id, title.trim() || "Untitled doc", html);
    }
    setBusy(false); setEditing(null); load();
  };

  const remove = async (id: string) => { if (!confirm("Delete this doc?")) return; await deletePost(id); load(); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border">
        <div className="container max-w-3xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-primary">DOCFORM</h1>
          <div className="flex items-center gap-1">
            <ThemeColorPicker scope="docform" />
            <Link to="/"><Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]"><ArrowLeft className="w-3 h-3 mr-1" />BACK</Button></Link>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-3 py-4 space-y-4">
        {editing ? (
          <div className="docform-sheet rounded-md border border-border bg-card shadow-lg">
            <div className="sticky top-12 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-card p-2">
              <Button size="icon" variant="ghost" className="h-8 w-8" onMouseDown={e => { e.preventDefault(); cmd("bold"); }} aria-label="Bold"><Bold className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onMouseDown={e => { e.preventDefault(); cmd("italic"); }} aria-label="Italic"><Italic className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onMouseDown={e => { e.preventDefault(); cmd("underline"); }} aria-label="Underline"><Underline className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onMouseDown={e => { e.preventDefault(); cmd("formatBlock", "H1"); }} aria-label="Heading 1"><Heading1 className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onMouseDown={e => { e.preventDefault(); cmd("formatBlock", "H2"); }} aria-label="Heading 2"><Heading2 className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onMouseDown={e => { e.preventDefault(); cmd("insertUnorderedList"); }} aria-label="Bullet list"><List className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onMouseDown={e => { e.preventDefault(); cmd("insertOrderedList"); }} aria-label="Numbered list"><ListOrdered className="w-4 h-4" /></Button>
              <input ref={imgRef} type="file" accept="image/*" hidden onChange={e => insertMedia(e, "image")} />
              <input ref={vidRef} type="file" accept="video/*" hidden onChange={e => insertMedia(e, "video")} />
              <Button size="sm" variant="ghost" className="h-8 px-2 text-[11px]" disabled={busy} onClick={() => imgRef.current?.click()}><ImagePlus className="w-4 h-4 mr-1" />PHOTO</Button>
              <Button size="sm" variant="ghost" className="h-8 px-2 text-[11px]" disabled={busy} onClick={() => vidRef.current?.click()}><Video className="w-4 h-4 mr-1" />VIDEO</Button>
              <div className="flex-1" />
              <Button size="sm" variant="ghost" className="h-8 px-2 text-[11px]" disabled={busy} onClick={finish}><X className="w-4 h-4 mr-1" />CLOSE</Button>
              <Button size="sm" className="h-8 px-3 text-[11px]" disabled={busy} onClick={finish}><Check className="w-4 h-4 mr-1" />{busy ? "SAVING…" : "FINISH"}</Button>
            </div>
            <div className="p-4 sm:p-8 space-y-3">
              <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="Untitled doc" className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground" />
              <div ref={editorRef} contentEditable suppressContentEditableWarning className="docform-body min-h-[50vh] outline-none" data-placeholder="Start typing your thoughts…" />
            </div>
          </div>
        ) : (
          <>
            <Button onClick={() => open("new")} className="w-full h-12"><Plus className="w-4 h-4 mr-2" />NEW DOC</Button>
            {docs.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No docs yet — start your first one.</p>}
            {docs.map(d => {
              const canEdit = userId === d.userId || isAdmin;
              return (
                <article key={d.id} className="rounded-md border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <UserBadge userId={d.userId} size="sm" profiles={profiles} />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</span>
                      {canEdit && <button onClick={() => open(d)} aria-label="Edit doc"><Edit className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" /></button>}
                      {canEdit && <button onClick={() => remove(d.id)} aria-label="Delete doc"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>}
                    </div>
                  </div>
                  <h2 className="text-lg font-bold">{d.title}</h2>
                  <div className="docform-body" dangerouslySetInnerHTML={{ __html: clean(d.description) }} />
                </article>
              );
            })}
          </>
        )}
      </main>
      <UserSetupDialog open={showSetup} onComplete={(id) => { setUserId(id); setShowSetup(false); }} />
    </div>
  );
}
