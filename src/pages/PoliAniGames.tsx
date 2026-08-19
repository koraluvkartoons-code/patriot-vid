import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getCurrentUserId, type Post, type UserProfile } from "@/lib/store";
import { fetchPosts, fetchProfiles, fetchCategories, searchPosts } from "@/lib/api";
import UserSetupDialog from "@/components/UserSetupDialog";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import bgAsset from "@/assets/polianigames-bg.jpg.asset.json";
import { ArrowLeft, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SITE = "polianigames";

export default function PoliAniGames() {
  const [userId, setUserId] = useState(getCurrentUserId);
  const [showSetup, setShowSetup] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<string[]>([]);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<"rpg" | "default">("rpg");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    const term = searchTerm.trim();
    const isSearch = searching && term.length > 0;
    const [postsResult, profilesResult, termsResult] = await Promise.allSettled([
      isSearch
        ? searchPosts(term, PAGE_SIZE, 0, SITE)
        : fetchPosts(PAGE_SIZE, 0, order, activeTerm || undefined, SITE),
      fetchProfiles(),
      fetchCategories(SITE),
    ]);
    if (postsResult.status === "fulfilled") {
      setPosts(postsResult.value);
      setHasMore(postsResult.value.length === PAGE_SIZE);
    }
    if (profilesResult.status === "fulfilled") setProfiles(profilesResult.value);
    if (termsResult.status === "fulfilled") setTerms(termsResult.value);
    setLoading(false);
  }, [order, activeTerm, searchTerm, searching]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const term = searchTerm.trim();
      const isSearch = searching && term.length > 0;
      const more = isSearch
        ? await searchPosts(term, PAGE_SIZE, posts.length, SITE)
        : await fetchPosts(PAGE_SIZE, posts.length, order, activeTerm || undefined, SITE);
      setPosts(prev => [...prev, ...more]);
      setHasMore(more.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [posts.length, loadingMore, hasMore, order, activeTerm, searchTerm, searching]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore, loading]);

  const needSetup = () => { if (!userId) setShowSetup(true); };

  const sorted = [...posts].sort((a, b) => {
    const ap = a.isPinned ? 1 : 0;
    const bp = b.isPinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return order === "oldest"
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(4,1,14,0.72), rgba(4,1,14,0.85)), url(${bgAsset.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="sticky top-0 z-40 pag-panel">
        <div className="container max-w-3xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight truncate text-rainbow-neon">PoliAniGames</h1>
          <div className="flex items-center gap-1">
            <Link to="/"><Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-rainbow-neon"><ArrowLeft className="w-3 h-3 mr-1" />BACK</Button></Link>
            <Button size="sm" variant="ghost" onClick={() => setShowSetup(true)} className="h-7 px-2 text-[11px] text-rainbow-neon">
              <User className="w-3 h-3 mr-1" /><span className="max-w-[70px] truncate">{userId || "LOGIN"}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-3 py-3 space-y-2">
        <div className="pag-panel rounded-sm p-2 space-y-2">
          <div className="flex items-center gap-1 flex-wrap text-[11px]">
            <button
              onClick={() => { setActiveTerm(null); setSearching(false); setSearchTerm(""); }}
              className={`px-2 py-1 border rounded-sm ${activeTerm === null && !searching ? "border-white/60 text-rainbow-neon" : "border-white/20 text-rainbow-neon opacity-70 hover:opacity-100"}`}
            >[ ALL ]</button>
            {terms.map(t => (
              <button
                key={t}
                onClick={() => { setActiveTerm(t); setSearching(false); setSearchTerm(""); }}
                className={`px-2 py-1 border rounded-sm uppercase text-rainbow-neon ${activeTerm === t ? "border-white/60" : "border-white/20 opacity-70 hover:opacity-100"}`}
              >[ {t} ]</button>
            ))}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setViewMode(v => v === "rpg" ? "default" : "rpg")}
                className={`px-2 py-1 border rounded-sm text-[11px] font-bold ${viewMode === "rpg" ? "border-amber-400 text-yellow-300 bg-amber-950/40" : "border-white/20 text-rainbow-neon"}`}
                title="Toggle between 16-bit RPG Scene presentation and Classic mode"
              >
                {viewMode === "rpg" ? "⚔️ 16-BIT RPG MODE" : "📜 CLASSIC MODE"}
              </button>
              <button
                onClick={() => setOrder(o => o === "newest" ? "oldest" : "newest")}
                className="px-2 py-1 border border-white/20 rounded-sm text-rainbow-neon"
              >SORT:{order === "newest" ? "NEWEST" : "OLDEST"}</button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { setActiveTerm(null); setSearchTerm(query); setSearching(true); } }}
              placeholder="Search PoliAniGames…"
              className="flex-1 bg-black/40 border border-white/20 rounded-sm px-2 py-1 text-[12px] text-white placeholder:text-white/50 outline-none"
              aria-label="Search PoliAniGames posts"
            />
            {searching && (
              <button onClick={() => { setSearching(false); setSearchTerm(""); setQuery(""); }} className="text-rainbow-neon" aria-label="Clear search"><X className="w-4 h-4" /></button>
            )}
          </div>

          <CreatePost onNeedSetup={needSetup} onCreated={loadData} categories={terms} site={SITE} />

          {loading && <p className="text-center py-10 text-white/70 text-sm">loading PoliAniGames…</p>}
          {!loading && sorted.length === 0 && (
            <p className="text-center py-10 text-white/70 text-sm">nothing here yet — add the first post.</p>
          )}

          <div className="space-y-3">
            {sorted.map(p => (
              <PostCard key={p.id} post={p} onNeedSetup={needSetup} onRefresh={loadData} profiles={profiles} variant={viewMode} />
            ))}
          </div>

          <div ref={sentinelRef} className="h-1" />

          {!loading && hasMore && (
            <div className="text-center py-2">
              <button onClick={loadMore} disabled={loadingMore} className="px-3 py-1 text-[11px] border border-white/25 rounded-sm text-rainbow-neon">
                {loadingMore ? "loading..." : "[ LOAD_MORE ]"}
              </button>
            </div>
          )}
        </div>
      </main>

      <UserSetupDialog open={showSetup} onComplete={(id) => { setUserId(id); setShowSetup(false); loadData(); }} />
    </div>
  );
}
