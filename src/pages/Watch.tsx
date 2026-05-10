import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Room, RoomEvent, RemoteTrack, RemoteParticipant, Track } from "livekit-client";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfiles } from "@/lib/api";
import { getGuestName, getGuestSessionId } from "@/lib/guest";
import { getCurrentUserId, type UserProfile } from "@/lib/store";
import LiveChat from "@/components/LiveChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function Watch() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState<any>(null);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const roomRef = useRef<Room | null>(null);
  const userId = getCurrentUserId();

  useEffect(() => { fetchProfiles().then(setProfiles); }, []);

  useEffect(() => {
    if (!streamId) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.from("streams").select("*").eq("id", streamId).maybeSingle();
      if (!mounted) return;
      if (!data) { toast.error("Stream not found"); navigate("/streams"); return; }
      setStream(data);

      if (data.status === "live") {
        const guestName = userId || getGuestName();
        const { data: tok } = await supabase.functions.invoke("livekit-token", {
          body: { room: data.room_name, identity: getGuestSessionId(), name: guestName, isHost: false },
        });
        if (!(tok as any)?.token) return;
        const room = new Room({ adaptiveStream: true });
        roomRef.current = room;
        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Video && videoRef.current) track.attach(videoRef.current);
          if (track.kind === Track.Kind.Audio && audioRef.current) track.attach(audioRef.current);
        });
        await room.connect((tok as any).url, (tok as any).token);
      }
    })();

    // Watch for stream ending
    const ch = supabase.channel(`stream-${streamId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "streams", filter: `id=eq.${streamId}` },
        (p) => setStream(p.new))
      .subscribe();

    return () => {
      mounted = false;
      roomRef.current?.disconnect();
      supabase.removeChannel(ch);
    };
  }, [streamId, navigate, userId]);

  if (!stream) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading…</div>;

  const isLive = stream.status === "live";
  const isHost = userId && userId === stream.host_user_id;
  const isAdmin = userId === "PatriotAdmin";
  const watchUrl = window.location.href;
  const guestName = userId || getGuestName();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Button>
          <h1 className="text-xl font-bold truncate">{stream.title} {isLive && <span className="text-red-500 animate-pulse ml-2">● LIVE</span>}</h1>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(watchUrl); toast.success("Link copied"); }}><Copy className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => navigator.share?.({ url: watchUrl, title: stream.title })}><Share2 className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          <div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-primary/30">
              {isLive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                  <audio ref={audioRef} autoPlay />
                </>
              ) : stream.recording_url ? (
                <video src={stream.recording_url} controls className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Stream ended (no recording)</div>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-2">Host: {stream.host_user_id}</div>
          </div>

          <div className="h-[600px] lg:h-auto">
            <LiveChat
              streamId={stream.id}
              guestName={guestName}
              guestSessionId={getGuestSessionId()}
              isModerator={!!isHost || isAdmin}
              profiles={profiles}
              hostUserId={stream.host_user_id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
