import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentUserId, type Post, type UserProfile } from "@/lib/store";
import { fetchPosts, fetchProfiles } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import UserSetupDialog from "@/components/UserSetupDialog";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import AdminPanel from "@/components/AdminPanel";
import { Shield, User, Radio, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import eagleImg from "@/assets/eagle.png";

export default function Index() {
  const [userId, setUserId] = useState(getCurrentUserId);
  const [showSetup, setShowSetup] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [postsResult, profilesResult] = await Promise.allSettled([fetchPosts(), fetchProfiles()]);

    if (postsResult.status === "fulfilled") {
      setPosts(postsResult.value);
    }

    if (profilesResult.status === "fulfilled") {
      setProfiles(profilesResult.value);
    }

    setLoading(false);
  }, []);

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
          <div className="flex items-center gap-2">
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

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <CreatePost onNeedSetup={needSetup} onCreated={loadData} />

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
      </main>

      <UserSetupDialog open={showSetup} onComplete={(id) => { setUserId(id); setShowSetup(false); loadData(); }} />
      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} onRefresh={loadData} profiles={profiles} />
    </div>
  );
}
