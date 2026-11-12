import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, Link2, UserRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PostCard from "@/components/PostCard";
import YfereComposer from "@/components/YfereComposer";
import KekScoreboard from "@/components/KekScoreboard";
import UserSetupDialog from "@/components/UserSetupDialog";
import { fetchProfiles } from "@/lib/api";
import { getCurrentUserId, type Post, type UserProfile } from "@/lib/store";
import { categoryTone, chainItems, fetchYfereItems, YFERE_PAGE_SIZE } from "@/lib/yfere";

export default function Yfere() {
  const [items, setItems] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [composer, setComposer] = useState(false);
  const [setup, setSetup] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [postBg, setPostBg] = useState(() => localStorage.getItem("yfere-post-bg") || "");
  const [postText, setPostText] = useState(() => localStorage.getItem("yfere-post-text") || "");
  useEffect(() => { postBg ? localStorage.setItem("yfere-post-bg", postBg) : localStorage.removeItem("yfere-post-bg"); postText ? localStorage.setItem("yfere-post-text", postText) : localStorage.removeItem("yfere-post-text"); }, [postBg, postText]);
  const postStyle = { ...(postBg ? { background: postBg } : {}), ...(postText ? { color: postText } : {}) };
  const [position, setPosition] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const offset = useRef(0);
  const categories = [...new Set(items.map(item => item.category || "Unfiled"))];

  const load = useCallback(async (reset = false) => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError("");
    try {
      const next = await fetchYfereItems(reset ? 0 : offset.current);
      offset.current = (reset ? 0 : offset.current) + next.length;
      setItems(previous => chainItems(reset ? next : [...previous, ...next]));
      setHasMore(next.length === YFERE_PAGE_SIZE);
    } catch { setError("The chain could not load. Try again."); }
    finally { busy.current = false; setLoading(false); }
  }, []);

  useEffect(() => { void load(true); void fetchProfiles().then(setProfiles).catch(() => undefined); }, [load]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !rail.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) void load(); }, { root: rail.current, rootMargin: "300px" });
    observer.observe(el); return () => observer.disconnect();
  }, [hasMore, loading, load]);

  const move = (direction: number) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: direction * Math.min(420, el.clientWidth * .88), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const created = () => {
    setComposer(false); setRefresh(v => v + 1);
    // Preserve the existing chain; new items appear at its far end.
    void load().then(() => window.setTimeout(() => rail.current?.scrollTo({ left: rail.current.scrollWidth, behavior: "smooth" }), 100));
  };

  return <main className="yfere-page">
    <header className="yfere-header">
      <Button asChild variant="ghost" size="sm"><Link to="/kak"><ArrowLeft className="w-4 h-4 mr-2" />KEK</Link></Button>
      <span className="yfere-network">POLIANIGAMES / KEK / YFERE</span>
      <Button variant="outline" size="icon" aria-label="Your profile" onClick={() => setSetup(true)}><UserRound className="w-4 h-4" /></Button>
    </header>
    <section className="yfere-heading">
      <div><span className="yfere-eyebrow"><Link2 className="w-4 h-4" />THE CHAIN</span><h1>YFERE<span className="yfere-title-dot">.</span></h1></div>
      <Button onClick={() => getCurrentUserId() ? setComposer(true) : setSetup(true)}><Plus className="w-4 h-4 mr-2" />Add item</Button>
    </section>
    <div className="yfere-toolbar">
      <div className="yfere-category-list"><span className="text-muted-foreground text-xs">CATEGORIES</span>{categories.map(c => <Button key={c} variant="ghost" size="sm" className="yfere-category" data-tone={categoryTone(c)} onClick={() => { const index = items.findIndex(p => (p.category || "Unfiled") === c); rail.current?.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }); }}>{c}</Button>)}</div>
      <div className="flex gap-2 shrink-0 items-center"><label className="text-xs flex items-center gap-1">POST <input type="color" aria-label="Post color" value={postBg || "#1a0b2e"} onChange={e => setPostBg(e.target.value)} /></label><label className="text-xs flex items-center gap-1">TEXT <input type="color" aria-label="Post text color" value={postText || "#ffffff"} onChange={e => setPostText(e.target.value)} /></label>{(postBg || postText) && <Button variant="ghost" size="sm" onClick={() => { setPostBg(""); setPostText(""); }}>Reset</Button>}<Button variant="outline" size="icon" aria-label="Previous item" disabled={!position} onClick={() => move(-1)}><ArrowLeft className="w-4 h-4" /></Button><Button variant="outline" size="icon" aria-label="Next item" disabled={items.length === 0} onClick={() => move(1)}><ArrowRight className="w-4 h-4" /></Button></div>
    </div>
    {error && <div role="alert" className="yfere-error">{error}<Button variant="ghost" size="sm" onClick={() => void load()}><RefreshCw className="w-4 h-4 mr-2" />Retry</Button></div>}
    <div className="yfere-rail" ref={rail} tabIndex={0} role="region" aria-label="YFERE horizontal chain" onScroll={e => setPosition(e.currentTarget.scrollLeft)} onKeyDown={e => { if (e.target !== e.currentTarget) return; if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); move(e.key === "ArrowRight" ? 1 : -1); } }}>
      {items.map((item, index) => <article key={item.id} className="yfere-block" data-tone={categoryTone(item.category || "Unfiled")} style={postStyle}>
        <div className="yfere-block-top"><span>{item.category || "Unfiled"}</span><span className="tabular-nums">{String(index + 1).padStart(3, "0")}</span></div>
        <div className="yfere-block-content"><Link to={`/post/${item.id}`} className="yfere-author">{item.userId}</Link>
          {item.description ? <p className="yfere-text">{item.description}</p> : item.title !== "Post" && <p className="yfere-text">{item.title}</p>}
          <div className="yfere-media">{(item.media?.length ? item.media : item.mediaUrl ? [{ url: item.mediaUrl, type: item.mediaType }] : []).map((m, i) => m.type === "video" ? <video key={i} src={m.url} controls playsInline preload="none" /> : m.type === "link" ? <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="break-all underline">{m.url}</a> : <Button key={i} variant="ghost" className="yfere-photo" aria-label={`Open photo ${i + 1}`} onClick={() => setSelected(item)}><img src={m.url} alt={item.title} loading="lazy" decoding="async" /></Button>)}</div>
        </div>
        <div className="yfere-block-bottom"><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time><Button variant="ghost" size="sm" onClick={() => setSelected(item)}>Open post<ArrowRight className="w-3 h-3 ml-2" /></Button></div>
      </article>)}
      {loading && items.length === 0 && <div className="yfere-empty" role="status">Loading the chain…</div>}
      {!loading && !error && items.length === 0 && <div className="yfere-empty"><Link2 className="w-10 h-10" /><h2>The first link is yours.</h2><Button onClick={() => getCurrentUserId() ? setComposer(true) : setSetup(true)}><Plus className="w-4 h-4 mr-2" />Add first item</Button></div>}
      <div ref={sentinel} className="yfere-chain-end">{loading && items.length > 0 ? "Loading…" : hasMore ? <Button variant="outline" onClick={() => void load()}>More items</Button> : items.length > 0 && <Button variant="outline" size="icon" aria-label="Add next item" onClick={() => setComposer(true)}><Plus className="w-5 h-5" /></Button>}</div>
    </div>
    <section className="yfere-scores"><KekScoreboard site="yfere" refreshKey={refresh} />{!getCurrentUserId() && <Button variant="outline" onClick={() => setSetup(true)}><UserRound className="w-4 h-4 mr-2" />Choose username & flag</Button>}</section>
    <Dialog open={composer} onOpenChange={setComposer}><DialogContent className="yfere-dialog max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Add to YFERE</DialogTitle><DialogDescription>New item</DialogDescription></DialogHeader><YfereComposer categories={categories} onCreated={created} onNeedSetup={() => setSetup(true)} /></DialogContent></Dialog>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="yfere-dialog max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>YFERE post</DialogTitle></DialogHeader>{selected && <PostCard post={selected} profiles={profiles} compact onNeedSetup={() => setSetup(true)} onRefresh={() => { setSelected(null); setRefresh(v => v + 1); void load(true); }} />}</DialogContent></Dialog>
    <UserSetupDialog open={setup} onComplete={() => { setSetup(false); setRefresh(v => v + 1); void fetchProfiles().then(setProfiles); }} />
  </main>;
}