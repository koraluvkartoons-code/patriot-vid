import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Trash2, Play, Radio } from "lucide-react";
import { toast } from "sonner";

export default function PastStreams() {
  const [streams, setStreams] = useState<any[]>([]);
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const isAdmin = userId === "PatriotAdmin";

  const load = async () => {
    const { data } = await supabase.from("streams").select("*").order("created_at", { ascending: false });
    setStreams(data || []);
  };
  useEffect(() => { load(); }, []);

  const del = async (s: any) => {
    if (!confirm("Delete this stream permanently?")) return;
    const paths: string[] = [];
    if (Array.isArray(s.segments)) for (const seg of s.segments) if (seg?.path) paths.push(seg.path);
    if (s.recording_url) {
      const p = s.recording_url.split("/stream-recordings/")[1];
      if (p && !paths.includes(p)) paths.push(p);
    }
    if (paths.length) await supabase.storage.from("stream-recordings").remove(paths);
    await supabase.from("streams").delete().eq("id", s.id);
    toast.success("Deleted");
    load();
  };

  const fmtDuration = (s: number) => {
    if (!s) return "—";
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m ${sec}s`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Button>
          <h1 className="text-2xl font-black"><span className="text-primary">Past Streams</span></h1>
          <Button onClick={() => navigate("/live")} className="bg-red-600 hover:bg-red-500 text-white"><Radio className="w-4 h-4 mr-1" /> Go Live</Button>
        </div>

        {streams.length === 0 && <p className="text-muted-foreground text-center py-12">No streams yet.</p>}

        <div className="space-y-3">
          {streams.map(s => {
            const canDelete = isAdmin || s.host_user_id === userId;
            return (
              <div key={s.id} className="bg-card rounded-lg p-3 border border-border flex flex-col sm:flex-row gap-3">
                <Link to={`/watch/${s.id}`} className="block w-full sm:w-48 aspect-video bg-black rounded overflow-hidden flex items-center justify-center">
                  {s.recording_url ? (
                    <video src={s.recording_url} className="w-full h-full object-cover" muted preload="metadata" />
                  ) : (
                    <Play className="w-8 h-8 text-pink-500" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{s.title}</h3>
                    {s.status === "live" && <span className="text-xs text-red-500 animate-pulse">● LIVE</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">by {s.host_user_id} · {new Date(s.created_at).toLocaleString()} · {fmtDuration(s.duration_seconds)}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button size="sm" onClick={() => navigate(`/watch/${s.id}`)} className="bg-primary text-white"><Play className="w-3 h-3 mr-1" />{s.status === "live" ? "Watch Live" : "Watch Replay"}</Button>
                    {s.recording_url && (
                      <a href={s.recording_url} download={`${s.title}.webm`}>
                        <Button size="sm" variant="secondary"><Download className="w-3 h-3 mr-1" />Download</Button>
                      </a>
                    )}
                    {canDelete && (
                      <Button size="sm" variant="destructive" onClick={() => del(s)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
