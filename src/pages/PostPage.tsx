import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfiles } from "@/lib/api";
import type { Post, UserProfile } from "@/lib/store";
import PostCard from "@/components/PostCard";
import UserSetupDialog from "@/components/UserSetupDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import eagleImg from "@/assets/eagle.png";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [{ data, error }, profs] = await Promise.all([
      supabase.from("posts").select("*").eq("id", id).maybeSingle(),
      fetchProfiles(),
    ]);
    setProfiles(profs);
    if (error || !data) {
      setNotFound(true);
    } else {
      setPost({
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description || "",
        mediaUrl: data.media_url || undefined,
        mediaType: data.media_type || undefined,
        media: Array.isArray(data.media) ? (data.media as { type: string; url: string }[]).filter(m => m && typeof m.url === "string") : [],
        category: data.category || undefined,
        likes: data.likes || [],
        createdAt: data.created_at,
        isPinned: data.is_pinned || false,
        site: data.site || undefined,
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero sticky top-0 z-40 border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/">
            <Button size="sm" variant="ghost" className="text-foreground hover:text-primary h-8">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <Link to="/" className="flex items-center gap-2 ml-2">
            <img src={eagleImg} alt="Eagle" className="w-8 h-8 object-contain" />
            <h1 className="text-foreground text-xl font-black tracking-tight">
              <span className="animate-shimmer">Patriot</span>
              <span className="text-primary">.Vid</span>
            </h1>
          </Link>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-6">
        {loading && <p className="text-center text-muted-foreground py-16">Loading...</p>}
        {!loading && notFound && <p className="text-center text-muted-foreground py-16">Post not found.</p>}
        {!loading && post && (
          <PostCard
            post={post}
            onNeedSetup={() => setShowSetup(true)}
            onRefresh={load}
            profiles={profiles}
            variant={post.site === "polianigames" ? "rpg" : "default"}
          />
        )}
      </main>
      <UserSetupDialog open={showSetup} onComplete={() => { setShowSetup(false); load(); }} />
    </div>
  );
}
