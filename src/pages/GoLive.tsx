import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Room, LocalVideoTrack, LocalAudioTrack, createLocalAudioTrack, Track } from "livekit-client";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId, type UserProfile } from "@/lib/store";
import { getGuestName, getGuestSessionId } from "@/lib/guest";
import { fetchProfiles } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, MonitorUp, StopCircle, Copy, Share2, ArrowLeft, RefreshCw, Cpu, CheckCircle2, AlertTriangle } from "lucide-react";
import LiveChat from "@/components/LiveChat";
import { toast } from "sonner";

type Quality = "480p" | "720p" | "1080p";
const QUALITY_MAP: Record<Quality, { width: number; height: number; frameRate: number; bitrate: number }> = {
  "480p": { width: 854, height: 480, frameRate: 30, bitrate: 800_000 },
  "720p": { width: 1280, height: 720, frameRate: 30, bitrate: 1_400_000 },
  "1080p": { width: 1920, height: 1080, frameRate: 30, bitrate: 2_600_000 },
};

// 60s segments — uploaded continuously so multi-hour streams never blow memory.
const SEGMENT_MS = 60_000;

export default function GoLive() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [title, setTitle] = useState("Screen Livestream");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [micId, setMicId] = useState<string>("");
  const [quality, setQuality] = useState<Quality>("720p");
  const [micOn, setMicOn] = useState(false);
  const [segCount, setSegCount] = useState(0);
  const [hasScreenAudio, setHasScreenAudio] = useState(false);
  const [uptime, setUptime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const micTrackRef = useRef<LocalAudioTrack | null>(null);
  const screenTrackRef = useRef<LocalVideoTrack | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const segmentsRef = useRef<{ path: string; url: string; index: number }[]>([]);
  const segIndexRef = useRef(0);
  const rotateTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamIdRef = useRef<string | null>(null);
  const stoppingRef = useRef(false);

  useEffect(() => { fetchProfiles().then(setProfiles); }, []);
  useEffect(() => { if (!userId) navigate("/"); }, [userId, navigate]);

  // Stream timer
  useEffect(() => {
    if (!isLive) return;
    const t = setInterval(() => {
      if (startTimeRef.current > 0) {
        setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [isLive]);

  const loadAudioDevices = async () => {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devs.filter(d => d.kind === "audioinput");
      setMics(audioInputs);
      if (audioInputs.length && !micId) setMicId(audioInputs[0].deviceId);
    } catch {
      // ignore
    }
  };

  const uploadSegment = async (blob: Blob, index: number) => {
    const sid = streamIdRef.current;
    if (!sid || blob.size === 0) return;
    const path = `${sid}/seg-${String(index).padStart(5, "0")}.webm`;
    const { error } = await supabase.storage.from("stream-recordings").upload(path, blob, {
      contentType: "video/webm",
      upsert: true,
    });
    if (error) {
      console.error("seg upload error", error);
      return;
    }
    const url = supabase.storage.from("stream-recordings").getPublicUrl(path).data.publicUrl;
    segmentsRef.current.push({ path, url, index });
    setSegCount(segmentsRef.current.length);

    // Persist segments to database
    await supabase.from("streams").update({
      segments: segmentsRef.current,
      recording_url: segmentsRef.current[0]?.url ?? null,
    }).eq("id", sid);
  };

  const startRecorderCycle = () => {
    if (stoppingRef.current || !screenTrackRef.current) return;
    const vTrack = screenTrackRef.current.mediaStreamTrack;
    if (!vTrack || vTrack.readyState === "ended") return;

    const tracks: MediaStreamTrack[] = [vTrack];

    // Add microphone audio if active
    if (micTrackRef.current && micOn && micTrackRef.current.mediaStreamTrack.readyState === "live") {
      tracks.push(micTrackRef.current.mediaStreamTrack);
    }

    // Add captured system/tab audio if available
    const systemAudio = screenStreamRef.current?.getAudioTracks()[0];
    if (systemAudio && systemAudio.readyState === "live") {
      tracks.push(systemAudio);
    }

    const recStream = new MediaStream(tracks);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
      ? "video/webm;codecs=vp8"
      : "video/webm";

    const q = QUALITY_MAP[quality];
    try {
      const rec = new MediaRecorder(recStream, {
        mimeType: mime,
        videoBitsPerSecond: q.bitrate,
      });

      const chunks: Blob[] = [];
      const idx = segIndexRef.current++;

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      rec.onstop = async () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: "video/webm" });
          uploadSegment(blob, idx);
        }
        if (!stoppingRef.current && screenTrackRef.current) {
          startRecorderCycle();
        }
      };

      rec.start();
      recorderRef.current = rec;

      if (rotateTimerRef.current) clearTimeout(rotateTimerRef.current);
      rotateTimerRef.current = window.setTimeout(() => {
        try {
          if (rec.state !== "inactive") rec.stop();
        } catch {
          // ignore
        }
      }, SEGMENT_MS);
    } catch (err) {
      console.error("MediaRecorder start failed:", err);
    }
  };

  const acquireScreenStream = async (): Promise<MediaStream> => {
    const q = QUALITY_MAP[quality];
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: q.width, max: q.width },
        height: { ideal: q.height, max: q.height },
        frameRate: { ideal: q.frameRate, max: q.frameRate },
      },
      audio: true, // Capture system / tab audio
    });

    const videoTrack = displayStream.getVideoTracks()[0];
    if (videoTrack) {
      if ("contentHint" in videoTrack) {
        (videoTrack as { contentHint: string }).contentHint = "motion";
      }
      videoTrack.onended = () => {
        handleScreenEnded();
      };
    }

    const hasAudio = displayStream.getAudioTracks().length > 0;
    setHasScreenAudio(hasAudio);
    screenStreamRef.current = displayStream;
    return displayStream;
  };

  const handleScreenEnded = () => {
    setIsPaused(true);
    toast.warning("Screen share stopped. Click 'Resume Screen Share' to continue.");
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch (err) {
        console.warn("recorder stop onended", err);
      }
    }
  };

  const resumeScreenShare = async () => {
    if (!roomRef.current) return;
    try {
      const displayStream = await acquireScreenStream();
      const rawTrack = displayStream.getVideoTracks()[0];
      if (!rawTrack) throw new Error("No video track captured");

      // Replace or publish screen track
      if (screenTrackRef.current) {
        try {
          await roomRef.current.localParticipant.unpublishTrack(screenTrackRef.current);
        } catch (err) {
          console.warn("unpublishTrack", err);
        }
      }

      const localTrack = new LocalVideoTrack(rawTrack, undefined, false);
      screenTrackRef.current = localTrack;
      await roomRef.current.localParticipant.publishTrack(localTrack, {
        source: Track.Source.ScreenShare,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([rawTrack]);
      }

      setIsPaused(false);
      startRecorderCycle();
      toast.success("Screen share resumed 🟢");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to resume screen share";
      toast.error(msg);
    }
  };

  const goLive = async () => {
    if (!userId) return;
    try {
      toast.info("Select the screen, window, or tab you wish to broadcast...");
      const displayStream = await acquireScreenStream();
      const rawVideoTrack = displayStream.getVideoTracks()[0];
      if (!rawVideoTrack) throw new Error("No screen selected");

      await loadAudioDevices();

      const room_name = `stream-${crypto.randomUUID()}`;
      const { data: streamRow, error: insertErr } = await supabase
        .from("streams")
        .insert({
          host_user_id: userId,
          title: title.trim() || "Screen Stream",
          room_name,
          status: "live",
          segments: [],
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      setStreamId(streamRow.id);
      streamIdRef.current = streamRow.id;

      const { data: tokenData, error: tokErr } = await supabase.functions.invoke("livekit-token", {
        body: { room: room_name, identity: userId, name: userId, isHost: true },
      });
      const tokResp = tokenData as { url?: string; token?: string; error?: string } | null;
      if (tokErr || tokResp?.error || !tokResp?.url || !tokResp?.token) {
        throw new Error(tokResp?.error || tokErr?.message || "Failed to acquire token");
      }

      // Low-spec optimized LiveKit configuration (H.264 hardware acceleration, no extra simulcast layers)
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: false, // Disabling simulcast reduces host CPU encoding workload by up to 60%
          videoCodec: "h264", // Hardware accelerated on virtually all laptops
          screenShareEncoding: {
            maxBitrate: QUALITY_MAP[quality].bitrate,
            maxFramerate: QUALITY_MAP[quality].frameRate,
          },
          dtx: true,
          red: true,
          stopMicTrackOnMute: true,
        },
      });
      roomRef.current = room;
      await room.connect(tokResp.url, tokResp.token);

      const localScreenTrack = new LocalVideoTrack(rawVideoTrack, undefined, false);
      screenTrackRef.current = localScreenTrack;
      await room.localParticipant.publishTrack(localScreenTrack, {
        source: Track.Source.ScreenShare,
      });

      // System audio track from screen share if present
      const systemAudioTrack = displayStream.getAudioTracks()[0];
      if (systemAudioTrack) {
        const localAudio = new LocalAudioTrack(systemAudioTrack);
        await room.localParticipant.publishTrack(localAudio);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([rawVideoTrack]);
      }

      stoppingRef.current = false;
      segmentsRef.current = [];
      segIndexRef.current = 0;
      startTimeRef.current = Date.now();
      startRecorderCycle();

      setIsLive(true);
      setIsPaused(false);
      toast.success("Screen Broadcast is LIVE 🔴");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start screen stream";
      toast.error(msg);
    }
  };

  const toggleMic = async () => {
    if (!roomRef.current) return;
    try {
      if (micOn) {
        if (micTrackRef.current) {
          await roomRef.current.localParticipant.unpublishTrack(micTrackRef.current);
          micTrackRef.current.stop();
          micTrackRef.current = null;
        }
        setMicOn(false);
        toast.info("Microphone off");
      } else {
        await loadAudioDevices();
        const micTrack = await createLocalAudioTrack({
          deviceId: micId || undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        });
        micTrackRef.current = micTrack;
        await roomRef.current.localParticipant.publishTrack(micTrack);
        setMicOn(true);
        toast.success("Microphone active 🎙️");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Microphone access denied";
      toast.error(msg);
    }
  };

  const endStream = async () => {
    const sid = streamIdRef.current;
    if (!sid) return;
    try {
      stoppingRef.current = true;
      if (rotateTimerRef.current) {
        clearTimeout(rotateTimerRef.current);
        rotateTimerRef.current = null;
      }

      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") {
        try {
          await new Promise<void>((res) => {
            const prev = rec.onstop;
            rec.onstop = (ev) => {
              if (prev) {
                (prev as (e: Event) => void).call(rec, ev);
              }
              res();
            };
            rec.stop();
          });
        } catch (err) {
          console.warn("recorder finish", err);
        }
      }

      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      micTrackRef.current?.stop();
      screenTrackRef.current?.stop();
      screenStreamRef.current?.getTracks().forEach(t => t.stop());

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      await roomRef.current?.disconnect();

      // Wait briefly for last segment upload
      await new Promise(r => setTimeout(r, 600));

      await supabase.from("streams").update({
        status: "ended",
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        segments: segmentsRef.current,
        recording_url: segmentsRef.current[0]?.url ?? null,
      }).eq("id", sid);

      toast.success("Stream ended and saved successfully");
      setIsLive(false);
      navigate("/streams");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error ending stream";
      toast.error(msg);
    }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const watchUrl = streamId ? `${window.location.origin}/watch/${streamId}` : "";
  const copyLink = () => { navigator.clipboard.writeText(watchUrl); toast.success("Share link copied"); };
  const share = async () => { if (navigator.share) await navigator.share({ title, url: watchUrl }); else copyLink(); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-6xl mx-auto p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground h-8 px-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Home
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black tracking-tight">
              <span className="text-primary">SCREEN LIVESTREAM</span>
            </h1>
            {isLive && (
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${isPaused ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"}`}>
                {isPaused ? "⏸ PAUSED" : `● LIVE ${formatUptime(uptime)}`}
              </span>
            )}
          </div>
          <Button variant="ghost" onClick={() => navigate("/streams")} className="text-foreground h-8 px-2 text-xs">
            Past Streams
          </Button>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-3">
            {/* Stream Monitor Box */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-primary/30 relative flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain bg-black"
              />

              {!isLive && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                  <MonitorUp className="w-12 h-12 text-primary mb-3 animate-bounce" />
                  <h2 className="text-lg font-bold text-foreground mb-1">Direct Screen Broadcast</h2>
                  <p className="text-xs text-muted-foreground max-w-md mb-4">
                    Optimized for low-spec laptops (Dell Inspiron 15 3000 & Intel Graphics). Hardware-accelerated, zero-lag screen & audio streaming.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No webcam required · Ultra-stable multi-hour streaming
                  </div>
                </div>
              )}

              {isLive && isPaused && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                  <h3 className="text-base font-bold text-white mb-1">Screen Share Paused</h3>
                  <p className="text-xs text-white/70 max-w-sm mb-4">
                    Your stream is still online and viewers are waiting in chat.
                  </p>
                  <Button onClick={resumeScreenShare} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Resume Screen Share
                  </Button>
                </div>
              )}
            </div>

            {!isLive ? (
              <div className="space-y-3 bg-card rounded-lg p-4 border border-border">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold">Stream Title</label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="E.g. Gaming Session, Coding, Anime Watchalong"
                    className="bg-muted border-border"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1 font-semibold">
                      <Cpu className="w-3.5 h-3.5 text-primary" /> Performance Profile
                    </label>
                    <select
                      value={quality}
                      onChange={e => setQuality(e.target.value as Quality)}
                      className="w-full bg-muted text-foreground border border-border rounded p-2 text-xs"
                    >
                      <option value="720p">720p 30fps (Recommended · Battery & CPU Saver)</option>
                      <option value="480p">480p 30fps (Ultra-Low Spec / Max Stability)</option>
                      <option value="1080p">1080p 30fps (High Definition)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1 font-semibold">
                      <Mic className="w-3.5 h-3.5 text-primary" /> Optional Microphone
                    </label>
                    <select
                      value={micId}
                      onChange={e => setMicId(e.target.value)}
                      className="w-full bg-muted text-foreground border border-border rounded p-2 text-xs"
                    >
                      <option value="">Default Microphone</option>
                      {mics.map(m => (
                        <option key={m.deviceId} value={m.deviceId}>{m.label || `Mic ${m.deviceId.slice(0, 5)}`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={goLive}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold h-11 text-sm shadow-lg shadow-red-900/30"
                >
                  <MonitorUp className="w-4 h-4 mr-2" /> 🔴 START SCREEN STREAM
                </Button>
              </div>
            ) : (
              <div className="space-y-3 bg-card rounded-lg p-4 border border-border">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={toggleMic}
                    variant={micOn ? "default" : "secondary"}
                    size="sm"
                    className="h-8 text-xs"
                  >
                    {micOn ? <Mic className="w-3.5 h-3.5 mr-1" /> : <MicOff className="w-3.5 h-3.5 mr-1" />}
                    {micOn ? "Mic On" : "Mic Muted"}
                  </Button>

                  {isPaused ? (
                    <Button onClick={resumeScreenShare} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs">
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Resume Screen
                    </Button>
                  ) : (
                    <Button onClick={resumeScreenShare} size="sm" variant="secondary" className="h-8 text-xs">
                      <MonitorUp className="w-3.5 h-3.5 mr-1" /> Switch Screen
                    </Button>
                  )}

                  <Button onClick={copyLink} variant="secondary" size="sm" className="h-8 text-xs">
                    <Copy className="w-3.5 h-3.5 mr-1" /> Link
                  </Button>

                  <Button onClick={share} variant="secondary" size="sm" className="h-8 text-xs">
                    <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                  </Button>

                  <Button
                    onClick={endStream}
                    className="bg-red-700 hover:bg-red-600 text-white ml-auto h-8 text-xs font-semibold"
                  >
                    <StopCircle className="w-3.5 h-3.5 mr-1" /> End Stream
                  </Button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>Profile: <strong className="text-foreground">{quality} @ 30fps</strong></span>
                  <span>Audio: <strong className="text-foreground">{hasScreenAudio ? "System Audio" : "No System Audio"} {micOn ? "+ Mic" : ""}</strong></span>
                  <span>Saved Segments: <strong className="text-foreground">{segCount}</strong></span>
                </div>
              </div>
            )}
          </div>

          <div className="h-[520px] lg:h-auto">
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
              <div className="h-full bg-black/60 rounded-lg border border-primary/30 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-rainbow-neon font-mono text-xs mb-1">// LIVE CHAT</span>
                <p className="text-xs text-muted-foreground">Chat connects automatically when you start streaming.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
