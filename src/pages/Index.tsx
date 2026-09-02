import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getCurrentUserId, type Post, type UserProfile, type Repost } from "@/lib/store";
import { fetchPosts, fetchProfiles, fetchCategories, searchPosts, fetchFeedReposts } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import UserSetupDialog from "@/components/UserSetupDialog";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import RepostCard from "@/components/RepostCard";
import ScheduledPosts from "@/components/ScheduledPosts";
import AdminPanel from "@/components/AdminPanel";

import { tagClass, tagLabel } from "@/lib/tags";
import spankrCoin from "@/assets/spankr-coin.png";
import { Shield, User, Radio, Film, Archive, X, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeColorPicker from "@/components/ThemeColorPicker";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Index() {
  const [userId, setUserId] = useState(getCurrentUserId);
  const [showSetup, setShowSetup] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reposts, setReposts] = useState<Repost[]>([]);

  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [cmd, setCmd] = useState("");
  const [scanlines, setScanlines] = useState(true);
  const [clock, setClock] = useState(() => new Date());
  const [viewers, setViewers] = useState(1);
  const cmdRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const PAGE_SIZE = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    const term = searchTerm.trim();
    const isSearch = searching && term.length > 0;

    const [postsResult, profilesResult, catsResult, repostsResult] = await Promise.allSettled([
      isSearch
        ? searchPosts(term, PAGE_SIZE, 0)
        : fetchPosts(PAGE_SIZE, 0, order, activeCategory || undefined),
      fetchProfiles(),
      fetchCategories(),
      isSearch || activeCategory ? Promise.resolve([] as Repost[]) : fetchFeedReposts(30),
    ]);

    if (postsResult.status === "fulfilled") {
      setPosts(postsResult.value);
      setHasMore(postsResult.value.length === PAGE_SIZE);
    }

    setReposts(repostsResult.status === "fulfilled" ? repostsResult.value : []);


    if (profilesResult.status === "fulfilled") {
      setProfiles(profilesResult.value);
    }

    if (catsResult.status === "fulfilled") {
      setCategories(catsResult.value);
    }

    setLoading(false);
  }, [order, activeCategory, searchTerm, searching]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const term = searchTerm.trim();
      const isSearch = searching && term.length > 0;
      const more = isSearch
        ? await searchPosts(term, PAGE_SIZE, posts.length)
        : await fetchPosts(PAGE_SIZE, posts.length, order, activeCategory || undefined);
      setPosts(prev => [...prev, ...more]);
      setHasMore(more.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [posts.length, loadingMore, hasMore, order, activeCategory, searchTerm, searching]);

  useEffect(() => { loadData(); }, [loadData]);

  // auto-load older posts when the sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore, loading]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const loadLive = async () => {
      const { data } = await supabase.from("streams").select("*").eq("status", "live").order("started_at", { ascending: false });
      setLiveStreams(data || []);
    };
    loadLive();
    const ch = supabase.channel("live-streams")
      .on("postgres_changes", { event: "*", schema: "public", table: "streams" }, loadLive)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // live viewer presence
  useEffect(() => {
    const ch = supabase.channel("byteticker-presence", { config: { presence: { key: Math.random().toString(36).slice(2) } } });
    ch.on("presence", { event: "sync" }, () => {
      setViewers(Object.keys(ch.presenceState()).length || 1);
    }).subscribe(async (status) => {
      if (status === "SUBSCRIBED") await ch.track({ online_at: new Date().toISOString() });
    });
    return () => { supabase.removeChannel(ch); };
  }, []);

  const currentUser = userId ? profiles[userId] : null;
  const isAdmin = userId === "PatriotAdmin";
  const isMod = currentUser?.isModerator;

  const needSetup = () => {
    if (!userId) setShowSetup(true);
  };

  const runCommand = () => {
    const raw = cmd.trim();
    if (!raw) return;
    if (raw.startsWith("/")) {
      const name = raw.slice(1).trim().toLowerCase();
      setSearching(false);
      setSearchTerm("");
      if (name === "all" || name === "clear") setActiveCategory(null);
      else {
        const match = categories.find(c => c.toLowerCase() === name) || categories.find(c => c.toLowerCase().includes(name));
        setActiveCategory(match || null);
      }
    } else {
      setActiveCategory(null);
      setSearchTerm(raw);
      setSearching(true);
    }
    setCmd("");
  };

  const utc = clock.toISOString().slice(11, 19);

  const archives = posts.reduce<Record<string, Post[]>>((acc, p) => {
    const day = new Date(p.createdAt).toISOString().slice(0, 10);
    (acc[day] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className={`min-h-screen bg-background pb-16 ${scanlines ? "scanlines" : ""}`}>
      <header className="gradient-hero sticky top-0 z-40 border-b border-border">
        <div className="container max-w-3xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
            <span className="animate-shimmer">ByteTicker</span>
            <span className="text-muted-foreground"> // LIVE_FEED_v1.0</span>
          </h1>
          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <span className="flex items-center gap-1 text-term-green">
              <span className="w-2 h-2 rounded-full bg-term-green animate-pulse" /> ONLINE
            </span>
            <span className="text-accent">{utc}Z</span>
            <span className="text-muted-foreground">{viewers}👁</span>
          </div>
        </div>
        <div className="container max-w-3xl mx-auto px-3 pb-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <Link to="/live"><Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-term-red"><Radio className="w-3 h-3 mr-1" />GO_LIVE</Button></Link>
          <Link to="/polianigames"><Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-term-purple hover:text-primary"><Gamepad2 className="w-3 h-3 mr-1" />POLIANIGAMES</Button></Link>
          <Link to="/streams"><Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-foreground hover:text-primary"><Film className="w-3 h-3 mr-1" />STREAMS</Button></Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-foreground hover:text-primary"><Archive className="w-3 h-3 mr-1" />ARCHIVES</Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-border w-[85vw] sm:w-96 overflow-y-auto">
              <SheetHeader><SheetTitle className="text-primary text-sm">// ARCHIVED_LOGS</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-4 text-[12px]">
                {Object.keys(archives).sort().reverse().map(day => (
                  <div key={day}>
                    <p className="text-accent mb-1">┌─ {day}</p>
                    <div className="space-y-1 pl-2 border-l border-border">
                      {archives[day].map(p => (
                        <Link key={p.id} to={`/post/${p.id}`} className="block truncate hover:text-primary">
                          <span className={tagClass(p.category)}>[{tagLabel(p.category)}]</span>{" "}
                          <span className="text-muted-foreground">{p.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(archives).length === 0 && <p className="text-muted-foreground">No archived logs loaded.</p>}
              </div>
            </SheetContent>
          </Sheet>
          {(isAdmin || isMod) && (
            <Button size="sm" variant="ghost" onClick={() => setShowAdmin(true)} className="h-7 px-2 text-[11px] text-gold hover:text-gold-shine"><Shield className="w-3 h-3 mr-1" />ADMIN</Button>
          )}
          <ThemeColorPicker scope="byteticker" />
          <Button size="sm" variant="ghost" onClick={() => setScanlines(s => !s)} className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary">
            CRT:{scanlines ? "ON" : "OFF"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowSetup(true)} className="h-7 px-2 text-[11px] text-foreground hover:text-primary ml-auto">
            <User className="w-3 h-3 mr-1" /><span className="max-w-[70px] truncate">{userId || "LOGIN"}</span>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-3 py-3 space-y-2">
        <div className="crt-frame rounded-sm p-2 space-y-2">
          <Link to="/project117" className="pag-spankr-launch" aria-label="Open PROJECT 117">
            <span className="pag-spankr-label">$SPANKR</span>
            <img src={spankrCoin} alt="$SPANKR" />
            <span className="pag-spankr-hint">PROJECT 117 →</span>
          </Link>

          <div className="flex items-center gap-1 flex-wrap text-[11px]">
            <button
              onClick={() => { setActiveCategory(null); setSearching(false); setSearchTerm(""); }}
              className={`px-2 py-1 border rounded-sm ${activeCategory === null && !searching ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-primary"}`}
            >[ ALL ]</button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => { setActiveCategory(c); setSearching(false); setSearchTerm(""); }}
                className={`px-2 py-1 border rounded-sm uppercase ${activeCategory === c ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-primary"}`}
              >[ {c} ]</button>
            ))}
            <button
              onClick={() => setOrder(o => o === "newest" ? "oldest" : "newest")}
              className="px-2 py-1 border border-border rounded-sm text-accent hover:text-primary ml-auto"
            >SORT:{order === "newest" ? "NEWEST" : "OLDEST"}</button>
          </div>

          {searching && searchTerm.trim() && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-2">
              grep "{searchTerm.trim()}"
              <button onClick={() => { setSearching(false); setSearchTerm(""); }} className="text-term-red hover:opacity-80"><X className="w-3 h-3" /></button>
            </p>
          )}

          {liveStreams.length > 0 && (
            <div className="space-y-1">
              {liveStreams.map(s => (
                <Link key={s.id} to={`/watch/${s.id}`} className="block border border-term-red/50 bg-term-red/10 rounded-sm px-2 py-1 text-[12px] hover:bg-term-red/20">
                  <span className="text-term-red animate-pulse font-bold">● LIVE</span>{" "}
                  <span className="text-foreground">{s.title}</span>{" "}
                  <span className="text-muted-foreground">@{s.host_user_id}</span>
                </Link>
              ))}
            </div>
          )}

          <CreatePost onNeedSetup={needSetup} onCreated={loadData} categories={categories} />

          {userId && <ScheduledPosts userId={userId} onChanged={loadData} />}

          {loading && <p className="text-center py-10 text-muted-foreground text-sm">booting feed<span className="animate-caret">_</span></p>}

          {!loading && posts.length === 0 && reposts.length === 0 && (
            <p className="text-center py-10 text-muted-foreground text-sm">{searching ? "no matching logs." : "log empty. awaiting first entry."}</p>
          )}

          <div className="space-y-1">
            {[
              ...posts.map(p => ({ kind: "post" as const, at: p.createdAt, key: `p-${p.id}`, post: p })),
              ...reposts.map(r => ({ kind: "repost" as const, at: r.createdAt, key: `r-${r.id}`, repost: r })),
            ]
              .sort((a, b) => {
                const ap = a.kind === "post" && a.post.isPinned ? 1 : 0;
                const bp = b.kind === "post" && b.post.isPinned ? 1 : 0;
                if (ap !== bp) return bp - ap;
                return order === "oldest"
                  ? new Date(a.at).getTime() - new Date(b.at).getTime()
                  : new Date(b.at).getTime() - new Date(a.at).getTime();
              })
              .map(item => item.kind === "post"
                ? <PostCard key={item.key} post={item.post} onNeedSetup={needSetup} onRefresh={loadData} profiles={profiles} />
                : <RepostCard key={item.key} repost={item.repost} onNeedSetup={needSetup} onRefresh={loadData} profiles={profiles} />
              )}
          </div>


          <div ref={sentinelRef} className="h-1" />

          {!loading && hasMore && (
            <div className="text-center py-2">
              <button onClick={loadMore} disabled={loadingMore} className="px-3 py-1 text-[11px] border border-border rounded-sm text-accent hover:text-primary hover:border-primary">
                {loadingMore ? "loading..." : "[ LOAD_MORE ]"}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-border gradient-hero">
        <div className="container max-w-3xl mx-auto px-3 py-2 flex items-center gap-2 text-[12px]">
          <span className="text-term-green shrink-0 hidden sm:inline">user@byteticker:~$</span>
          <span className="text-term-green shrink-0 sm:hidden">~$</span>
          <input
            ref={cmdRef}
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") runCommand(); }}
            placeholder="Type command or search…  (/gaming, /all)"
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            aria-label="Terminal command input"
          />
          <span className="text-primary animate-caret">_</span>
        </div>
      </footer>

      <UserSetupDialog open={showSetup} onComplete={(id) => { setUserId(id); setShowSetup(false); loadData(); }} />
      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} onRefresh={loadData} profiles={profiles} />
    </div>
  );
}
