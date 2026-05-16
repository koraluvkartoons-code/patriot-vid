import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Room, RoomEvent, type RemoteTrack, Track, type RemoteTrackPublication, type RemoteParticipant } from "livekit-client";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfiles } from "@/lib/api";
import { getGuestName, getGuestSessionId } from "@/lib/guest";
import { getCurrentUserId, type UserProfile } from "@/lib/store";
import LiveChat from "@/components/LiveChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Share2, PictureInPicture2, Columns2, Maximize2 } from "lucide-react";
import { toast } from "sonner";

type Layout = "pip" | "side" | "fullscreen";

export default function Watch() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState<any>(null);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [layout, setLayout] = useState<Layout>("pip");
  const [hasScreen, setHasScreen] = useState(false);
  const [pipPos, setPipPos] = useState({ x: 16, y: 16 });
  const [pipSize, setPipSize] = useState(220);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: { simulcast: true },
        });
        roomRef.current = room;

        const attach = (track: RemoteTrack, pub: RemoteTrackPublication) => {
          if (track.kind === Track.Kind.Audio && audioRef.current) { track.attach(audioRef.current); return; }
          if (track.kind !== Track.Kind.Video) return;
          const isScreen = pub.source === Track.Source.ScreenShare;
          if (isScreen) {
            if (screenVideoRef.current) track.attach(screenVideoRef.current);
            setHasScreen(true);
          } else {
            if (camVideoRef.current) track.attach(camVideoRef.current);
          }
        };
        const detach = (track: RemoteTrack, pub: RemoteTrackPublication) => {
          track.detach();
          if (pub.source === Track.Source.ScreenShare) setHasScreen(false);
        };
        room.on(RoomEvent.TrackSubscribed, attach);
        room.on(RoomEvent.TrackUnsubscribed, detach);
        room.on(RoomEvent.ParticipantDisconnected, (_p: RemoteParticipant) => setHasScreen(false));
        await room.connect((tok as any).url, (tok as any).token);
      }
    })();

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

  // PiP drag
  useEffect(() => {
    const el = document.getElementById("pip-cam");
    if (!el || layout !== "pip" || !hasScreen) return;
    let dragging = false; let sx = 0, sy = 0, ox = 0, oy = 0;
    const down = (e: PointerEvent) => { dragging = true; sx = e.clientX; sy = e.clientY; ox = pipPos.x; oy = pipPos.y; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (!dragging) return; setPipPos({ x: ox + (e.clientX - sx), y: oy + (e.clientY - sy) }); };
    const up = () => { dragging = false; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    return () => { el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); };
  }, [layout, hasScreen, pipPos.x, pipPos.y]);

  if (!stream) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading…</div>;

  const isLive = stream.status === "live";
  const isHost = userId && userId === stream.host_user_id;
  const isAdmin = userId === "PatriotAdmin";
  const watchUrl = window.location.href;
  const guestName = userId || getGuestName();
  const segments: { url: string; index: number }[] = Array.isArray(stream.segments) ? stream.segments : [];

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
            {isLive ? (
              <>
                {hasScreen && (
                  <div className="flex gap-1 mb-2">
                    <Button size="sm" variant={layout === "pip" ? "default" : "secondary"} onClick={() => setLayout("pip")}><PictureInPicture2 className="w-4 h-4 mr-1" />PiP</Button>
                    <Button size="sm" variant={layout === "side" ? "default" : "secondary"} onClick={() => setLayout("side")}><Columns2 className="w-4 h-4 mr-1" />Side</Button>
                    <Button size="sm" variant={layout === "fullscreen" ? "default" : "secondary"} onClick={() => setLayout("fullscreen")}><Maximize2 className="w-4 h-4 mr-1" />Full</Button>
                    <Button size="sm" variant="ghost" onClick={() => stageRef.current?.requestFullscreen()}>⛶</Button>
                  </div>
                )}
                <div ref={stageRef} className="relative bg-black rounded-lg overflow-hidden border border-primary/30">
                  {layout === "side" && hasScreen ? (
                    <div className="grid grid-cols-2 aspect-video">
                      <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
                      <video ref={camVideoRef} autoPlay playsInline muted className="w-full h-full object-contain bg-black" />
                    </div>
                  ) : (
                    <div className="aspect-video relative">
                      <video ref={screenVideoRef} autoPlay playsInline className={`w-full h-full object-contain ${hasScreen ? "" : "hidden"}`} />
                      <video ref={camVideoRef} autoPlay playsInline muted
                        className={hasScreen
                          ? "absolute object-cover rounded-md border-2 border-primary cursor-move shadow-2xl"
                          : "w-full h-full object-contain"}
                        id={hasScreen ? "pip-cam" : undefined}
                        style={hasScreen ? { left: pipPos.x, top: pipPos.y, width: pipSize, height: pipSize * 0.5625 } : undefined}
                      />
                      {hasScreen && layout === "pip" && (
                        <input type="range" min={140} max={420} value={pipSize}
                          onChange={e => setPipSize(+e.target.value)}
                          className="absolute bottom-2 right-2 w-32 accent-pink-500" />
                      )}
                    </div>
                  )}
                  <audio ref={audioRef} autoPlay />
                </div>
              </>
            ) : segments.length > 0 ? (
              <ReplayPlayer segments={segments} />
            ) : stream.recording_url ? (
              <video src={stream.recording_url} controls className="w-full aspect-video bg-black rounded-lg border border-primary/30" />
            ) : (
              <div className="aspect-video bg-black rounded-lg border border-primary/30 flex items-center justify-center text-muted-foreground">Stream ended (no recording)</div>
            )}
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

/* Replay player that plays a sequence of webm segments seamlessly,
   exposing pause / scrub / speed / quality (single-track) controls. */
function ReplayPlayer({ segments }: { segments: { url: string; index: number }[] }) {
  const sorted = useMemo(() => [...segments].sort((a, b) => a.index - b.index), [segments]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = speed; }, [speed, currentIdx]);

  const onEnded = () => {
    if (currentIdx < sorted.length - 1) setCurrentIdx(i => i + 1);
  };

  const downloadAll = async () => {
    // Sequential merge isn't trivial in the browser; just pop a list of segment links.
    const txt = sorted.map(s => s.url).join("\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "segments.txt";
    a.click();
  };

  return (
    <div className="space-y-2">
      <video
        key={sorted[currentIdx]?.url}
        ref={videoRef}
        src={sorted[currentIdx]?.url}
        controls
        autoPlay
        playsInline
        onEnded={onEnded}
        className="w-full aspect-video bg-black rounded-lg border border-primary/30"
      />
      <div className="flex flex-wrap items-center gap-2 text-sm bg-card p-2 rounded-lg border border-border">
        <span className="text-muted-foreground">Segment {currentIdx + 1} / {sorted.length}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}>⏮ Prev</Button>
          <Button size="sm" variant="secondary" disabled={currentIdx >= sorted.length - 1} onClick={() => setCurrentIdx(i => Math.min(sorted.length - 1, i + 1))}>Next ⏭</Button>
        </div>
        <label className="ml-2 flex items-center gap-1">
          Speed
          <select value={speed} onChange={e => setSpeed(+e.target.value)} className="bg-muted rounded px-1 py-0.5">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <option key={s} value={s}>{s}×</option>)}
          </select>
        </label>
        <select
          value={currentIdx}
          onChange={e => setCurrentIdx(+e.target.value)}
          className="bg-muted rounded px-1 py-0.5"
          aria-label="Jump to segment"
        >
          {sorted.map((s, i) => <option key={s.url} value={i}>Seg {i + 1}</option>)}
        </select>
        <Button size="sm" variant="ghost" onClick={downloadAll}>Download list</Button>
      </div>
    </div>
  );
}
