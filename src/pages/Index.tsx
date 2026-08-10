import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentUserId, type Post, type UserProfile } from "@/lib/store";
import { fetchPosts, fetchProfiles, fetchCategories, searchPosts } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import UserSetupDialog from "@/components/UserSetupDialog";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import AdminPanel from "@/components/AdminPanel";
import { Shield, User, Radio, Film, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import eagleImg from "@/assets/eagle.png";

export default function Index() {
  const [userId, setUserId] = useState(getCurrentUserId);
  const [showSetup, setShowSetup] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const PAGE_SIZE = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    const term = searchTerm.trim();
    const isSearch = searching && term.length > 0;

    const [postsResult, profilesResult, catsResult] = await Promise.allSettled([
      isSearch
        ? searchPosts(term, PAGE_SIZE, 0)
        : fetchPosts(PAGE_SIZE, 0, order, activeCategory || undefined),
      fetchProfiles(),
      fetchCategories(),
    ]);

    if (postsResult.status === "fulfilled") {
      setPosts(postsResult.value);
      setHasMore(postsResult.value.length === PAGE_SIZE);
    }

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

  const currentUser = userId ? profiles[userId] : null;
  const isAdmin = userId === "PatriotAdmin";
  const isMod = currentUser?.isModerator;

  const needSetup = () => {
    if (!userId) setShowSetup(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero sticky top-0 z-40 border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={eagleImg} alt="Eagle" className="w-10 h-10 object-contain" />
            <h1 className="text-foreground text-2xl font-black tracking-tight">
              <span className="animate-shimmer">Patriot</span>
              <span className="text-primary">.Vid</span>
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => { setSearchOpen(o => !o); if (searchOpen) { setSearching(false); setSearchTerm(""); loadData(); } }} className="text-foreground hover:text-primary h-8">
              <Search className="w-4 h-4" />
            </Button>
            <Link to="/live"><Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 h-8"><Radio className="w-4 h-4 mr-1" /><span className="text-xs hidden sm:inline">Go Live</span></Button></Link>
            <Link to="/streams"><Button size="sm" variant="ghost" className="text-foreground hover:text-primary h-8"><Film className="w-4 h-4 mr-1" /><span className="text-xs hidden sm:inline">Streams</span></Button></Link>
            {(isAdmin || isMod) && (
              <Button size="sm" variant="ghost" onClick={() => setShowAdmin(true)} className="text-gold hover:text-gold-shine h-8">
                <Shield className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowSetup(true)} className="text-foreground hover:text-primary h-8">
              <User className="w-4 h-4 mr-1" />
              <span className="text-xs max-w-[80px] truncate">{userId || "Join"}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-4 space-y-3">
        {searchOpen && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearching(true); loadData(); } }}
                placeholder="Search posts..."
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button size="sm" onClick={() => { setSearching(true); loadData(); }} className="text-foreground">Search</Button>
            <Button size="sm" variant="ghost" onClick={() => { setSearchOpen(false); setSearching(false); setSearchTerm(""); loadData(); }} className="text-foreground hover:text-primary">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {searching && (
          <p className="text-xs text-muted-foreground">Showing results for "{searchTerm.trim()}"</p>
        )}
        {liveStreams.length > 0 && (
          <div className="space-y-2">
            {liveStreams.map(s => (
              <Link key={s.id} to={`/watch/${s.id}`} className="block bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/40 rounded-lg p-3 hover:from-red-600/30 hover:to-pink-600/30 transition">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 animate-pulse font-bold">● LIVE</span>
                  <span className="font-bold text-foreground truncate">{s.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">@{s.host_user_id}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <CreatePost onNeedSetup={needSetup} onCreated={loadData} categories={categories} />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={order === "newest" ? "default" : "secondary"}
            onClick={() => setOrder("newest")}
            className="text-foreground"
          >
            Latest
          </Button>
          <Button
            size="sm"
            variant={order === "oldest" ? "default" : "secondary"}
            onClick={() => setOrder("oldest")}
            className="text-foreground"
          >
            Older
          </Button>
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant={activeCategory === null ? "default" : "secondary"}
              onClick={() => setActiveCategory(null)}
              className="text-foreground"
            >
              All
            </Button>
            {categories.map(c => (
              <Button
                key={c}
                size="sm"
                variant={activeCategory === c ? "default" : "secondary"}
                onClick={() => setActiveCategory(c)}
                className="text-foreground"
              >
                {c}
              </Button>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Loading...</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No posts yet. Be the first!</p>
          </div>
        )}

        {posts.map(post => (
          <PostCard key={post.id} post={post} onNeedSetup={needSetup} onRefresh={loadData} profiles={profiles} />
        ))}

        {!loading && hasMore && (
          <div className="text-center py-4">
            <Button onClick={loadMore} disabled={loadingMore} variant="secondary" className="text-foreground">
              {loadingMore ? "Loading..." : "Load more posts"}
            </Button>
          </div>
        )}
      </main>

      <UserSetupDialog open={showSetup} onComplete={(id) => { setUserId(id); setShowSetup(false); loadData(); }} />
      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} onRefresh={loadData} profiles={profiles} />
    </div>
  );
}
