import { useCallback, useEffect, useState } from "react";
import { type Post } from "@/lib/store";
import { fetchScheduledPosts, updatePost, deletePost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  userId: string;
  onChanged?: () => void;
}

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ScheduledPosts({ userId, onChanged }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [when, setWhen] = useState("");

  const load = useCallback(async () => {
    try { setPosts(await fetchScheduledPosts(userId)); } catch { /* ignore */ }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (p: Post) => {
    setEditId(p.id);
    setTitle(p.title);
    setDesc(p.description);
    setWhen(p.scheduledAt ? toLocalInput(p.scheduledAt) : "");
  };

  const save = async (p: Post) => {
    const iso = when ? new Date(when).toISOString() : null;
    await updatePost(p.id, title.trim() || p.title, desc.trim(), undefined, undefined, iso);
    setEditId(null);
    await load();
    onChanged?.();
    toast({ title: iso ? "Schedule updated" : "Post published now" });
  };

  const cancelPost = async (p: Post) => {
    if (!confirm("Delete this scheduled post?")) return;
    await deletePost(p.id);
    await load();
    onChanged?.();
  };

  const publishNow = async (p: Post) => {
    await updatePost(p.id, p.title, p.description, new Date().toISOString(), undefined, null);
    await load();
    onChanged?.();
    toast({ title: "Published" });
  };

  if (!posts.length) return null;

  return (
    <div className="border border-accent/40 rounded-sm p-2 space-y-2">
      <p className="text-[11px] text-accent flex items-center gap-1"><Clock className="w-3 h-3" /> SCHEDULED_QUEUE ({posts.length})</p>
      {posts.map(p => (
        <div key={p.id} className="border border-border rounded-sm px-2 py-1 text-[12px]">
          {editId === p.id ? (
            <div className="space-y-2 py-1">
              <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-muted border-border text-foreground" maxLength={120} />
              <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-muted border-border text-foreground" maxLength={2000} />
              <Input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} className="bg-muted border-border text-foreground" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => save(p)} className="gradient-btn">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="text-muted-foreground">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-foreground">{p.title}</p>
                <p className="text-[10px] text-muted-foreground">publishes {p.scheduledAt ? new Date(p.scheduledAt).toLocaleString() : "—"}</p>
              </div>
              <button onClick={() => publishNow(p)} className="text-[10px] text-term-green hover:opacity-80">[ POST_NOW ]</button>
              <button onClick={() => startEdit(p)} title="Edit"><Edit className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" /></button>
              <button onClick={() => cancelPost(p)} title="Cancel"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
