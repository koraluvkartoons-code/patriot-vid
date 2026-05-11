import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Room, createLocalVideoTrack, createLocalAudioTrack, LocalVideoTrack, LocalAudioTrack, Track, type ScreenShareCaptureOptions } from "livekit-client";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId, type UserProfile } from "@/lib/store";
import { getGuestName, getGuestSessionId } from "@/lib/guest";
import { fetchProfiles } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Video as VideoIcon, MonitorUp, StopCircle, Copy, Share2, ArrowLeft } from "lucide-react";
import LiveChat from "@/components/LiveChat";
import LiveOverlay from "@/components/LiveOverlay";
import { toast } from "sonner";

type Quality = "480p" | "720p" | "1080p";
const QUALITY_MAP: Record<Quality, { width: number; height: number; frameRate: number }> = {
  "480p": { width: 854, height: 480, frameRate: 30 },
  "720p": { width: 1280, height: 720, frameRate: 30 },
  "1080p": { width: 1920, height: 1080, frameRate: 30 },
};

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const camTrackRef = useRef<LocalVideoTrack | null>(null);
  const micTrackRef = useRef<LocalAudioTrack | null>(null);
  const screenTrackRef = useRef<LocalVideoTrack | null>(null);
  const screenAudioTrackRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const screenChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const testTTS = () => {
    try {
      const u = new SpeechSynthesisUtterance("Test! Text to speech is working. Try typing exclamation mario in chat.");
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
      toast.success("TTS playing — check volume");
    } catch { toast.error("TTS not supported"); }
  };

  useEffect(() => { fetchProfiles().then(setProfiles); }, []);

  useEffect(() => {
    if (!userId) { navigate("/"); return; }
  }, [userId, navigate]);

  const loadDevices = async () => {
    const devs = await navigator.mediaDevices.enumerateDevices();
    setCams(devs.filter(d => d.kind === "videoinput"));
    setMics(devs.filter(d => d.kind === "audioinput"));
  };

  const goLive = async () => {
    if (!userId) return;
    try {
      // Permissions + device list
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      await loadDevices();

      const room_name = `stream-${crypto.randomUUID()}`;
      const { data: streamRow, error: insertErr } = await supabase
        .from("streams")
        .insert({ host_user_id: userId, title, room_name, status: "live" })
        .select()
        .single();
      if (insertErr) throw insertErr;
      setStreamId(streamRow.id);

      const { data: tokenData, error: tokErr } = await supabase.functions.invoke("livekit-token", {
        body: { room: room_name, identity: userId, name: userId, isHost: true },
      });
      if (tokErr || (tokenData as any)?.error) throw new Error((tokenData as any)?.error || tokErr?.message);

      const room = new Room({ adaptiveStream: true, dynacast: true });
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

      if (videoRef.current) {
        camTrack.attach(videoRef.current);
      }

      // Start local recording (camera+mic)
      const mediaStream = new MediaStream([camTrack.mediaStreamTrack, micTrack.mediaStreamTrack]);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
      const recorder = new MediaRecorder(mediaStream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
      recordedChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.start(2000);
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();

      setIsLive(true);
      toast.success("You are LIVE 🔴");
    } catch (e: any) {
      toast.error(e?.message || "Failed to go live");
    }
  };

  const toggleScreen = async () => {
    if (!roomRef.current) return;
    if (sharing) {
      // Stop screen recorder & upload
      try {
        const sr = screenRecorderRef.current;
        if (sr && sr.state !== "inactive") {
          await new Promise<void>(res => { sr.onstop = () => res(); sr.stop(); });
        }
        if (screenChunksRef.current.length > 0 && streamId) {
          const blob = new Blob(screenChunksRef.current, { type: "video/webm" });
          const path = `${streamId}-screen-${Date.now()}.webm`;
          toast.message("Saving screen recording…");
          const { error } = await supabase.storage.from("stream-recordings").upload(path, blob, { contentType: "video/webm", upsert: true });
          if (!error) {
            const url = supabase.storage.from("stream-recordings").getPublicUrl(path).data.publicUrl;
            await supabase.from("streams").update({ screen_recording_url: url }).eq("id", streamId);
            toast.success("Screen recording saved");
          }
        }
      } catch {}
      screenChunksRef.current = [];
      screenRecorderRef.current = null;

      if (screenTrackRef.current) {
        roomRef.current.localParticipant.unpublishTrack(screenTrackRef.current);
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      if (screenAudioTrackRef.current) {
        roomRef.current.localParticipant.unpublishTrack(screenAudioTrackRef.current);
        screenAudioTrackRef.current.stop?.();
        screenAudioTrackRef.current = null;
      }
      setSharing(false);
    } else {
      try {
        const tracks = await roomRef.current.localParticipant.createScreenTracks({ audio: true } as ScreenShareCaptureOptions);
        for (const t of tracks) {
          await roomRef.current.localParticipant.publishTrack(t);
          if (t.kind === Track.Kind.Video) screenTrackRef.current = t as LocalVideoTrack;
          else screenAudioTrackRef.current = t;
        }
        // Start screen recorder (screen video + screen audio if present + mic)
        if (screenTrackRef.current) {
          const mediaTracks: MediaStreamTrack[] = [screenTrackRef.current.mediaStreamTrack];
          if (screenAudioTrackRef.current?.mediaStreamTrack) mediaTracks.push(screenAudioTrackRef.current.mediaStreamTrack);
          if (micTrackRef.current?.mediaStreamTrack) mediaTracks.push(micTrackRef.current.mediaStreamTrack);
          const ms = new MediaStream(mediaTracks);
          const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
          const sr = new MediaRecorder(ms, { mimeType: mime, videoBitsPerSecond: 3_000_000 });
          screenChunksRef.current = [];
          sr.ondataavailable = e => { if (e.data.size > 0) screenChunksRef.current.push(e.data); };
          sr.start(2000);
          screenRecorderRef.current = sr;
        }
        setSharing(true);
      } catch (e: any) { toast.error("Screen share denied"); }
    }
  };

  const switchCamera = async (newId: string) => {
    setCamId(newId);
    if (camTrackRef.current && roomRef.current) {
      await camTrackRef.current.restartTrack({ deviceId: newId });
    }
  };
  const switchMic = async (newId: string) => {
    setMicId(newId);
    if (micTrackRef.current) await micTrackRef.current.restartTrack({ deviceId: newId });
  };

  const changeQuality = async (q: Quality) => {
    setQuality(q);
    if (camTrackRef.current) {
      const cfg = QUALITY_MAP[q];
      await camTrackRef.current.restartTrack({ resolution: cfg });
    }
  };

  const endStream = async () => {
    if (!streamId) return;
    try {
      // Stop recorders
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        await new Promise<void>(res => { recorder.onstop = () => res(); recorder.stop(); });
      }
      const sr = screenRecorderRef.current;
      if (sr && sr.state !== "inactive") {
        await new Promise<void>(res => { sr.onstop = () => res(); sr.stop(); });
      }
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Stop tracks
      camTrackRef.current?.stop();
      micTrackRef.current?.stop();
      screenTrackRef.current?.stop();
      screenAudioTrackRef.current?.stop?.();
      await roomRef.current?.disconnect();

      // Upload camera recording
      let recording_url: string | null = null;
      if (recordedChunksRef.current.length > 0) {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const path = `${streamId}.webm`;
        toast.message("Uploading recording…");
        const { error } = await supabase.storage.from("stream-recordings").upload(path, blob, {
          contentType: "video/webm", upsert: true,
        });
        if (!error) {
          recording_url = supabase.storage.from("stream-recordings").getPublicUrl(path).data.publicUrl;
        }
      }

      // Upload screen recording (if any from final share session)
      let screen_recording_url: string | null = null;
      if (screenChunksRef.current.length > 0) {
        const blob = new Blob(screenChunksRef.current, { type: "video/webm" });
        const path = `${streamId}-screen-final.webm`;
        toast.message("Uploading screen recording…");
        const { error } = await supabase.storage.from("stream-recordings").upload(path, blob, {
          contentType: "video/webm", upsert: true,
        });
        if (!error) {
          screen_recording_url = supabase.storage.from("stream-recordings").getPublicUrl(path).data.publicUrl;
        }
      }

      await supabase.from("streams").update({
        status: "ended",
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        recording_url,
      }).eq("id", streamId);

      toast.success("Stream ended & saved");
      setIsLive(false);
      navigate("/streams");
    } catch (e: any) {
      toast.error(e?.message || "Error ending stream");
    }
  };

  const watchUrl = streamId ? `${window.location.origin}/watch/${streamId}` : "";
  const copyLink = () => { navigator.clipboard.writeText(watchUrl); toast.success("Link copied"); };
  const share = async () => {
    if (navigator.share) await navigator.share({ title, url: watchUrl });
    else copyLink();
  };

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
                <Button onClick={goLive} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold">
                  🔴 GO LIVE
                </Button>
              </div>
            ) : (
              <div className="space-y-3 bg-card rounded-lg p-4 border border-border">
                <div className="grid sm:grid-cols-2 gap-2">
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
                  <Button onClick={toggleScreen} variant="secondary"><MonitorUp className="w-4 h-4 mr-1" />{sharing ? "Stop Share" : "Share Screen"}</Button>
                  <Button onClick={copyLink} variant="secondary"><Copy className="w-4 h-4 mr-1" />Copy Link</Button>
                  <Button onClick={share} variant="secondary"><Share2 className="w-4 h-4 mr-1" />Share</Button>
                  <Button onClick={endStream} className="bg-red-700 hover:bg-red-600 text-white ml-auto"><StopCircle className="w-4 h-4 mr-1" />End Stream</Button>
                </div>
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
      {isLive && streamId && roomRef.current && (
        <LiveOverlay room={roomRef.current} streamId={streamId} />
      )}
    </div>
      </div>
    </div>
  );
}
