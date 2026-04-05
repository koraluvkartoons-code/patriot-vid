import { useState, useCallback, useEffect } from "react";
import { getCurrentUserId, getPosts, getUsers, setCurrentUserId } from "@/lib/store";
import UserSetupDialog from "@/components/UserSetupDialog";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import AdminPanel from "@/components/AdminPanel";
import { Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/lib/store";

export default function Index() {
  const [userId, setUserId] = useState(getCurrentUserId);
  const [showSetup, setShowSetup] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>(() => getPosts());

  // Re-read posts from localStorage on mount & when tab regains focus
  useEffect(() => {
    const handleFocus = () => setPosts(getPosts());
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleFocus);
    };
  }, []);

  const refresh = useCallback(() => {
    setPosts(getPosts());
  }, []);

  const users = getUsers();
  const currentUser = userId ? users[userId] : null;
  const isAdmin = userId === "PatriotAdmin";
  const isMod = currentUser?.isModerator;

  const needSetup = () => {
    if (!userId) setShowSetup(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero sticky top-0 z-40 border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-foreground text-2xl font-black tracking-tight">
            <span className="animate-shimmer">Patriot</span>
            <span className="text-primary">.Vid</span>
          </h1>
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
        <CreatePost onNeedSetup={needSetup} onCreated={refresh} />
        
        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No posts yet. Be the first!</p>
          </div>
        )}

        {posts.map(post => (
          <PostCard key={post.id} post={post} onNeedSetup={needSetup} onRefresh={refresh} />
        ))}
      </main>

      <UserSetupDialog open={showSetup} onComplete={(id) => { setUserId(id); setShowSetup(false); refresh(); }} />
      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} onRefresh={refresh} />
    </div>
  );
}
