import { useState } from "react";
import { getUsers, saveUsers, AVAILABLE_BADGES, UserProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, X, Star } from "lucide-react";
import UserBadge from "./UserBadge";

interface Props {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function AdminPanel({ open, onClose, onRefresh }: Props) {
  const [, setTick] = useState(0);
  const users = getUsers();
  const userList = Object.entries(users);

  const toggleBadge = (userId: string, badgeId: string) => {
    const u = getUsers();
    const user = u[userId];
    if (!user) return;
    if (!user.badges) user.badges = [];
    if (user.badges.includes(badgeId)) user.badges = user.badges.filter(b => b !== badgeId);
    else user.badges.push(badgeId);
    saveUsers(u);
    setTick(t => t + 1);
    onRefresh();
  };

  const toggleMod = (userId: string) => {
    const u = getUsers();
    if (u[userId]) {
      u[userId].isModerator = !u[userId].isModerator;
      saveUsers(u);
      setTick(t => t + 1);
      onRefresh();
    }
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
                <UserBadge userId={id} />
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
                    <button
                      key={b.id}
                      onClick={() => toggleBadge(id, b.id)}
                      className={`p-1 rounded border transition-all ${active ? "border-primary bg-primary/20" : "border-border hover:border-accent"}`}
                      title={`${active ? "Remove" : "Add"} ${b.name}`}
                    >
                      <img src={b.image} alt={b.name} className="w-5 h-5 object-contain" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
