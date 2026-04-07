import { useState } from "react";
import { AVAILABLE_BADGES, type UserProfile } from "@/lib/store";
import { updateProfileBadges, updateProfileMod, fetchArchivedPosts, restorePost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Shield, X, ArchiveRestore } from "lucide-react";
import UserBadge from "./UserBadge";
import type { Post } from "@/lib/store";

interface Props {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  profiles: Record<string, UserProfile>;
}

export default function AdminPanel({ open, onClose, onRefresh, profiles }: Props) {
  const [tab, setTab] = useState<"users" | "archive">("users");
  const [archived, setArchived] = useState<Post[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const userList = Object.entries(profiles);

  const toggleBadge = async (userId: string, badgeId: string) => {
    const user = profiles[userId];
    if (!user) return;
    const badges = user.badges || [];
    const newBadges = badges.includes(badgeId) ? badges.filter(b => b !== badgeId) : [...badges, badgeId];
    await updateProfileBadges(userId, newBadges);
    onRefresh();
  };

  const toggleMod = async (userId: string) => {
    const user = profiles[userId];
    if (!user) return;
    await updateProfileMod(userId, !user.isModerator);
    onRefresh();
  };

  const loadArchived = async () => {
    setLoadingArchive(true);
    try {
      const data = await fetchArchivedPosts();
      setArchived(data);
    } catch { /* ignore */ }
    setLoadingArchive(false);
  };

  const handleRestore = async (id: string) => {
    await restorePost(id);
    loadArchived();
    onRefresh();
  };

  const switchTab = (t: "users" | "archive") => {
    setTab(t);
    if (t === "archive") loadArchived();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-start justify-center pt-10 overflow-y-auto">
      <div className="gradient-card border border-border rounded-xl p-6 w-full max-w-2xl glow-pink mx-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-bold text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Admin Dashboard
          </h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button size="sm" variant={tab === "users" ? "default" : "ghost"} onClick={() => switchTab("users")} className="text-xs">Users</Button>
          <Button size="sm" variant={tab === "archive" ? "default" : "ghost"} onClick={() => switchTab("archive")} className="text-xs">
            <ArchiveRestore className="w-3 h-3 mr-1" /> Archived Posts
          </Button>
        </div>

        {tab === "users" && (
          <>
            <h3 className="text-foreground font-semibold mb-2 text-sm">Available Badges</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVAILABLE_BADGES.map(b => (
                <div key={b.id} className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                  <img src={b.image} alt={b.name} className="w-6 h-6 rounded object-contain" />
                  <span className="text-[11px] text-foreground">{b.name}</span>
                </div>
              ))}
            </div>

            <h3 className="text-foreground font-semibold mb-2 text-sm">Users ({userList.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
              {userList.map(([id, user]) => (
                <div key={id} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <UserBadge userId={id} profiles={profiles} />
                    {!user.isAdmin && (
                      <Button size="sm" variant="ghost" onClick={() => toggleMod(id)} className={`text-xs h-6 ${user.isModerator ? "text-accent" : "text-muted-foreground"}`}>
                        {user.isModerator ? "Remove Mod" : "Make Mod"}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_BADGES.map(b => {
                      const active = user.badges?.includes(b.id);
                      return (
                        <button key={b.id} onClick={() => toggleBadge(id, b.id)} className={`p-1 rounded border transition-all ${active ? "border-primary bg-primary/20" : "border-border hover:border-accent"}`} title={`${active ? "Remove" : "Add"} ${b.name}`}>
                          <img src={b.image} alt={b.name} className="w-5 h-5 object-contain" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "archive" && (
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {loadingArchive && <p className="text-muted-foreground text-sm">Loading...</p>}
            {!loadingArchive && archived.length === 0 && <p className="text-muted-foreground text-sm">No archived posts.</p>}
            {archived.map(post => (
              <div key={post.id} className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-semibold">{post.title}</p>
                  <p className="text-muted-foreground text-xs">by {post.userId} · {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleRestore(post.id)} className="text-primary text-xs">
                  <ArchiveRestore className="w-3 h-3 mr-1" /> Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
