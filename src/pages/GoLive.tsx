import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Room, createLocalVideoTrack, createLocalAudioTrack, LocalVideoTrack, LocalAudioTrack, Track, VideoPresets, ScreenSharePresets, type ScreenShareCaptureOptions } from "livekit-client";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId, type UserProfile } from "@/lib/store";
import { getGuestName, getGuestSessionId } from "@/lib/guest";
import { fetchProfiles } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, StopCircle, Copy, Share2, ArrowLeft } from "lucide-react";
import LiveChat from "@/components/LiveChat";
import { toast } from "sonner";

type Quality = "480p" | "720p" | "1080p";
const QUALITY_MAP: Record<Quality, { width: number; height: number; frameRate: number }> = {
  "480p": { width: 854, height: 480, frameRate: 30 },
  "720p": { width: 1280, height: 720, frameRate: 30 },
  "1080p": { width: 1920, height: 1080, frameRate: 30 },
};

// 60s segments — uploaded continuously so multi-hour streams never blow memory.
const SEGMENT_MS = 60_000;

export default function GoLive() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [title, setTitle] = useState("Live with Patriot");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [camId, setCamId] = useState<string>("");
  const [micId, setMicId] = useState<string>("");
  const [quality, setQuality] = useState<Quality>("720p");
  const [sharing, setSharing] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [segCount, setSegCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const camTrackRef = useRef<LocalVideoTrack | null>(null);
  const micTrackRef = useRef<LocalAudioTrack | null>(null);
  const screenTrackRef = useRef<LocalVideoTrack | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const segmentsRef = useRef<{ path: string; url: string; index: number }[]>([]);
  const segIndexRef = useRef(0);
  const rotateTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamIdRef = useRef<string | null>(null);
  const stoppingRef = useRef(false);
  // canvas compositor — so screen share + PiP cam end up baked into the replay recording
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const camElRef = useRef<HTMLVideoElement | null>(null);
  const screenElRef = useRef<HTMLVideoElement | null>(null);
  const drawRafRef = useRef<number | null>(null);

  useEffect(() => { fetchProfiles().then(setProfiles); }, []);
  useEffect(() => { if (!userId) navigate("/"); }, [userId, navigate]);

  const loadDevices = async () => {
    const devs = await navigator.mediaDevices.enumerateDevices();
    setCams(devs.filter(d => d.kind === "videoinput"));
    setMics(devs.filter(d => d.kind === "audioinput"));
  };

  const ensureComposite = () => {
    if (!canvasRef.current) {
      const c = document.createElement("canvas");
      c.width = 1280; c.height = 720;
      canvasRef.current = c;
    }
    if (!camElRef.current) {
      const v = document.createElement("video");
      v.autoplay = true; v.muted = true; (v as any).playsInline = true;
      camElRef.current = v;
    }
    if (!screenElRef.current) {
      const v = document.createElement("video");
      v.autoplay = true; v.muted = true; (v as any).playsInline = true;
      screenElRef.current = v;
    }
    if (camTrackRef.current) {
      const ms = new MediaStream([camTrackRef.current.mediaStreamTrack]);
      camElRef.current.srcObject = ms;
      camElRef.current.play().catch(() => {});
    }
    if (screenTrackRef.current) {
      const ms = new MediaStream([screenTrackRef.current.mediaStreamTrack]);
      screenElRef.current.srcObject = ms;
      screenElRef.current.play().catch(() => {});
    } else {
      screenElRef.current.srcObject = null;
    }
  };

  const startDrawLoop = () => {
    if (drawRafRef.current != null) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const draw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, c.width, c.height);
      const screen = screenElRef.current;
      const cam = camElRef.current;
      const hasScreen = !!screenTrackRef.current && !!screen && screen.readyState >= 2 && screen.videoWidth > 0;
      if (hasScreen && screen) {
        const r = Math.min(c.width / screen.videoWidth, c.height / screen.videoHeight);
        const w = screen.videoWidth * r, h = screen.videoHeight * r;
        ctx.drawImage(screen, (c.width - w) / 2, (c.height - h) / 2, w, h);
        if (cam && cam.readyState >= 2 && cam.videoWidth > 0) {
          const pw = 320, ph = 180;
          const px = c.width - pw - 20, py = 20;
          ctx.drawImage(cam, px, py, pw, ph);
          ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 4;
          ctx.strokeRect(px, py, pw, ph);
        }
      } else if (cam && cam.readyState >= 2 && cam.videoWidth > 0) {
        const r = Math.min(c.width / cam.videoWidth, c.height / cam.videoHeight);
        const w = cam.videoWidth * r, h = cam.videoHeight * r;
        ctx.drawImage(cam, (c.width - w) / 2, (c.height - h) / 2, w, h);
      }
      drawRafRef.current = requestAnimationFrame(draw);
    };
    drawRafRef.current = requestAnimationFrame(draw);
  };

  const buildRecorderStream = () => {
    ensureComposite();
    const canvasStream = canvasRef.current!.captureStream(30);
    const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
    if (micTrackRef.current) tracks.push(micTrackRef.current.mediaStreamTrack);
    return new MediaStream(tracks);
  };

  const uploadSegment = async (blob: Blob, index: number) => {
    const sid = streamIdRef.current;
    if (!sid || blob.size === 0) return;
    const path = `${sid}/seg-${String(index).padStart(5, "0")}.webm`;
    const { error } = await supabase.storage.from("stream-recordings").upload(path, blob, {
      contentType: "video/webm", upsert: true,
    });
    if (error) { console.error("seg upload", error); return; }
    const url = supabase.storage.from("stream-recordings").getPublicUrl(path).data.publicUrl;
    segmentsRef.current.push({ path, url, index });
    setSegCount(segmentsRef.current.length);
    // Persist segments + first as recording_url for thumbnails.
    await supabase.from("streams").update({
      segments: segmentsRef.current,
      recording_url: segmentsRef.current[0]?.url ?? null,
    }).eq("id", sid);
  };

  const startRecorderCycle = () => {
    if (stoppingRef.current) return;
    const ms = buildRecorderStream();
    if (ms.getTracks().length === 0) return;
    // VP8 (not VP9) — VP9 encoding eats CPU on the host and is the #1 cause of live lag while the same recording replays fine.
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus" : "video/webm";
    const rec = new MediaRecorder(ms, { mimeType: mime, videoBitsPerSecond: 1_500_000 });
    const chunks: Blob[] = [];
    const idx = segIndexRef.current++;
    rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    rec.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      uploadSegment(blob, idx);
      if (!stoppingRef.current) startRecorderCycle();
    };
    rec.start();
    recorderRef.current = rec;
    rotateTimerRef.current = window.setTimeout(() => {
      try { rec.state !== "inactive" && rec.stop(); } catch {}
    }, SEGMENT_MS);
  };

  const goLive = async () => {
    if (!userId) return;
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      await loadDevices();

      const room_name = `stream-${crypto.randomUUID()}`;
      const { data: streamRow, error: insertErr } = await supabase
        .from("streams")
        .insert({ host_user_id: userId, title, room_name, status: "live", segments: [] })
        .select()
        .single();
      if (insertErr) throw insertErr;
      setStreamId(streamRow.id);
      streamIdRef.current = streamRow.id;

      const { data: tokenData, error: tokErr } = await supabase.functions.invoke("livekit-token", {
        body: { room: room_name, identity: userId, name: userId, isHost: true },
      });
      if (tokErr || (tokenData as any)?.error) throw new Error((tokenData as any)?.error || tokErr?.message);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360, VideoPresets.h720],
          videoCodec: "h264", // hardware-encoded on most devices → much less CPU than vp8/vp9 = less host lag
          screenShareEncoding: ScreenSharePresets.h1080fps15.encoding,
          dtx: true,
          red: true,
          stopMicTrackOnMute: false,
        },
      });
      roomRef.current = room;
      await room.connect((tokenData as any).url, (tokenData as any).token);

      const q = QUALITY_MAP[quality];
      const camTrack = await createLocalVideoTrack({
        deviceId: camId || undefined,
        resolution: { width: q.width, height: q.height, frameRate: q.frameRate },
      });
      const micTrack = await createLocalAudioTrack({ deviceId: micId || undefined });
      camTrackRef.current = camTrack;
      micTrackRef.current = micTrack;
      await room.localParticipant.publishTrack(camTrack);
      await room.localParticipant.publishTrack(micTrack);
      if (videoRef.current) camTrack.attach(videoRef.current);

      stoppingRef.current = false;
      segmentsRef.current = [];
      segIndexRef.current = 0;
      startTimeRef.current = Date.now();
      ensureComposite();
      startDrawLoop();
      startRecorderCycle();

      setIsLive(true);
      toast.success("You are LIVE 🔴");
    } catch (e: any) {
      toast.error(e?.message || "Failed to go live");
    }
  };

  const toggleScreen = async () => {
    if (!roomRef.current) return;
    if (sharing) {
      if (screenTrackRef.current) {
        roomRef.current.localParticipant.unpublishTrack(screenTrackRef.current);
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      setSharing(false);
      ensureComposite();
    } else {
      try {
        // audio:false — system-audio capture was causing the host mic to lag/echo for viewers
        const tracks = await roomRef.current.localParticipant.createScreenTracks({ audio: false } as ScreenShareCaptureOptions);
        for (const t of tracks) {
          await roomRef.current.localParticipant.publishTrack(t);
          if (t.kind === Track.Kind.Video) screenTrackRef.current = t as LocalVideoTrack;
        }
        setSharing(true);
        ensureComposite();
      } catch { toast.error("Screen share denied"); }
    }
  };

  const toggleCam = async () => {
    if (!camTrackRef.current) return;
    const next = !camOn;
    await camTrackRef.current.mute(); // ensure consistent state
    if (next) await camTrackRef.current.unmute();
    setCamOn(next);
  };
  const toggleMic = async () => {
    if (!micTrackRef.current) return;
    const next = !micOn;
    if (next) await micTrackRef.current.unmute(); else await micTrackRef.current.mute();
    setMicOn(next);
  };

  const switchCamera = async (newId: string) => {
    setCamId(newId);
    if (camTrackRef.current) await camTrackRef.current.restartTrack({ deviceId: newId });
  };
  const switchMic = async (newId: string) => {
    setMicId(newId);
    if (micTrackRef.current) await micTrackRef.current.restartTrack({ deviceId: newId });
  };
  const changeQuality = async (q: Quality) => {
    setQuality(q);
    if (camTrackRef.current) await camTrackRef.current.restartTrack({ resolution: QUALITY_MAP[q] });
  };

  const endStream = async () => {
    const sid = streamIdRef.current;
    if (!sid) return;
    try {
      stoppingRef.current = true;
      if (rotateTimerRef.current) { clearTimeout(rotateTimerRef.current); rotateTimerRef.current = null; }
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") {
        await new Promise<void>(res => { const prev = rec.onstop; rec.onstop = async (ev) => { if (prev) await (prev as any).call(rec, ev); res(); }; rec.stop(); });
      }
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      camTrackRef.current?.stop();
      micTrackRef.current?.stop();
      screenTrackRef.current?.stop();
      await roomRef.current?.disconnect();

      // wait briefly for last segment upload
      await new Promise(r => setTimeout(r, 800));

      await supabase.from("streams").update({
        status: "ended",
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        segments: segmentsRef.current,
        recording_url: segmentsRef.current[0]?.url ?? null,
      }).eq("id", sid);

      toast.success("Stream ended & saved");
      setIsLive(false);
      navigate("/streams");
    } catch (e: any) {
      toast.error(e?.message || "Error ending stream");
    }
  };

  const watchUrl = streamId ? `${window.location.origin}/watch/${streamId}` : "";
  const copyLink = () => { navigator.clipboard.writeText(watchUrl); toast.success("Link copied"); };
  const share = async () => { if (navigator.share) await navigator.share({ title, url: watchUrl }); else copyLink(); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Button>
          <h1 className="text-2xl font-black">
            <span className="text-primary">GO LIVE</span> {isLive && <span className="text-red-500 animate-pulse ml-2">● LIVE</span>}
          </h1>
          <Button variant="ghost" onClick={() => navigate("/streams")} className="text-foreground">Past Streams</Button>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-3">
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-primary/30">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
            </div>

            {!isLive ? (
              <div className="space-y-3 bg-card rounded-lg p-4 border border-border">
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Stream title" />
                <Button onClick={goLive} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold">🔴 GO LIVE</Button>
              </div>
            ) : (
              <div className="space-y-3 bg-card rounded-lg p-4 border border-border">
                <div className="grid sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><VideoIcon className="w-3 h-3" /> Camera</label>
                    <select value={camId} onChange={e => switchCamera(e.target.value)} className="w-full bg-muted text-foreground rounded p-1.5 text-sm">
                      {cams.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label || "Camera"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><Mic className="w-3 h-3" /> Mic</label>
                    <select value={micId} onChange={e => switchMic(e.target.value)} className="w-full bg-muted text-foreground rounded p-1.5 text-sm">
                      {mics.map(m => <option key={m.deviceId} value={m.deviceId}>{m.label || "Mic"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Quality</label>
                    <select value={quality} onChange={e => changeQuality(e.target.value as Quality)} className="w-full bg-muted text-foreground rounded p-1.5 text-sm">
                      <option>480p</option><option>720p</option><option>1080p</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={toggleCam} variant="secondary">{camOn ? <VideoIcon className="w-4 h-4 mr-1" /> : <VideoOff className="w-4 h-4 mr-1" />}{camOn ? "Cam On" : "Cam Off"}</Button>
                  <Button onClick={toggleMic} variant="secondary">{micOn ? <Mic className="w-4 h-4 mr-1" /> : <MicOff className="w-4 h-4 mr-1" />}{micOn ? "Mic On" : "Muted"}</Button>
                  <Button onClick={toggleScreen} variant="secondary"><MonitorUp className="w-4 h-4 mr-1" />{sharing ? "Stop Share" : "Share Screen"}</Button>
                  <Button onClick={copyLink} variant="secondary"><Copy className="w-4 h-4 mr-1" />Copy Link</Button>
                  <Button onClick={share} variant="secondary"><Share2 className="w-4 h-4 mr-1" />Share</Button>
                  <Button onClick={endStream} className="bg-red-700 hover:bg-red-600 text-white ml-auto"><StopCircle className="w-4 h-4 mr-1" />End Stream</Button>
                </div>
                <p className="text-xs text-muted-foreground">Saved segments: {segCount} (auto-uploads every 60s — multi-hour safe)</p>
              </div>
            )}
          </div>

          <div className="h-[600px] lg:h-auto">
            {isLive && streamId ? (
              <LiveChat
                streamId={streamId}
                guestName={userId || getGuestName()}
                guestSessionId={getGuestSessionId()}
                isModerator={true}
                profiles={profiles}
                hostUserId={userId || ""}
              />
            ) : (
              <div className="h-full bg-black rounded-lg border border-primary/30 flex items-center justify-center text-pink-400">Chat appears when you go live</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
