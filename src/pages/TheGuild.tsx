import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Room, RoomEvent, Track, createLocalAudioTrack, createLocalVideoTrack, type LocalAudioTrack, type LocalVideoTrack, type RemoteTrack, type RemoteTrackPublication } from "livekit-client";
import { Archive, ArrowLeft, BookOpen, Brush, Camera, ChevronRight, Crown, FileSearch, Gavel, Menu, MessageSquare, Mic, Radio, RotateCcw, Search, Shield, Skull, Trash2, Users, Video, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GuildChat from "@/components/GuildChat";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId, type Post } from "@/lib/store";
import { mapPost, uploadMedia } from "@/lib/api";

const TITLES = ["Arachnid (GWEN)", "Araneal (MILES)", "Spinner (PETER)", "Termyte", "Indagator (RESEARCHING)", "Warden", "Termigator", "Scrutator", "Guild-Beater", "Guild-Keeper", "Guild DoomsMAN", "Tenderfoot"];
const menu = [
  ["guild", "The Guild", MessageSquare], ["quiz", "Foray Quiz", FileSearch], ["tec", "The TEC", BookOpen], ["watchman", "Watchman's Detector", Radio],
  ["titles", "Titles", Crown], ["dungeon", "The Dungeon", Skull], ["cellhold", "Cellhold", Shield], ["tribunal", "Guild Tribunal", Gavel],
] as const;
type Section = typeof menu[number][0];
type Guild = { id: string; name: string; description: string; owner_name: string; background_color: string; background_url: string | null; background_type: string | null; created_at: string };
type Member = { id: string; username: string; title: string; quiz_answer: string | null };
const nameSchema = z.string().trim().min(1).max(40);
const guildSchema = z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(240) });
const WATCHMAN_CHAT_ID = "00000000-0000-0000-0000-000000000001";

export default function TheGuild() {
  const currentUser = getCurrentUserId();
  const [username, setUsername] = useState(() => localStorage.getItem("guild:username") || currentUser || "");
  const [entered, setEntered] = useState(() => !!localStorage.getItem("guild:username") || !!currentUser);
  const [section, setSection] = useState<Section>("guild");
  const [menuOpen, setMenuOpen] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Guild | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [dungeon, setDungeon] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const isWarden = username === "PatriotAdmin" || members.find(m => m.username === username)?.title === "Warden";

  const load = useCallback(async () => {
    const [{ data: guildRows }, { data: memberRows }] = await Promise.all([
      supabase.from("guilds").select("*").order("created_at", { ascending: false }),
      supabase.from("guild_members").select("*").order("username"),
    ]);
    setGuilds((guildRows || []) as Guild[]); setMembers((memberRows || []) as Member[]);
  }, []);
  const loadArchive = useCallback(async () => {
    const { data } = await supabase.from("posts").select("id,user_id,title,description,media_type,media,category,likes,created_at,is_pinned,scheduled_at,deleted_at").order("created_at", { ascending: false }).limit(300);
    const rows = (data || []) as any[];
    setDungeon(rows.filter(r => r.deleted_at).map(mapPost));
    setAllPosts(rows.filter(r => !r.deleted_at).map(mapPost));
  }, []);
  useEffect(() => { load(); loadArchive(); }, [load, loadArchive]);
  useEffect(() => {
    if (!entered || !username) return;
    const title = username === "PatriotAdmin" ? "Warden" : "Tenderfoot";
    supabase.from("guild_members").upsert({ username, title }, { onConflict: "username", ignoreDuplicates: true }).then(load);
  }, [entered, username, load]);

  const enter = () => {
    const result = nameSchema.safeParse(username); if (!result.success) return;
    localStorage.setItem("guild:username", result.data); setUsername(result.data); setEntered(true);
  };
  const answerQuiz = async (answer: "researching" | "posting") => {
    const title = isWarden ? "Warden" : answer === "researching" ? "Indagator (RESEARCHING)" : "Spinner (PETER)";
    await supabase.from("guild_members").upsert({ username, title, quiz_answer: answer }, { onConflict: "username" }); load();
  };
  const createGuild = async () => {
    const parsed = guildSchema.safeParse({ name: newName, description: newDescription }); if (!parsed.success) return;
    await supabase.from("guilds").insert({ name: parsed.data.name, description: parsed.data.description, owner_name: username }); setNewName(""); setNewDescription(""); setShowCreate(false); load();
  };
  const setGuildBackground = async (guild: Guild, file?: File, color?: string) => {
    const patch: { background_url?: string; background_type?: string; background_color?: string } = {};
    if (file) { patch.background_url = await uploadMedia(file); patch.background_type = file.type.startsWith("video/") ? "video" : "image"; }
    if (color && /^#[0-9a-f]{6}$/i.test(color)) patch.background_color = color;
    await supabase.from("guilds").update(patch).eq("id", guild.id); load(); setSelected({ ...guild, ...patch } as Guild);
  };
  const restorePost = async (id: string) => { await supabase.from("posts").update({ deleted_at: null, deleted_by: null }).eq("id", id); loadArchive(); };
  const member = members.find(m => m.username === username);

  if (!entered) return <div className="guild-page flex min-h-screen items-center justify-center p-5"><div className="guild-panel max-w-md w-full text-center space-y-5"><Shield className="mx-auto h-12 w-12 text-primary"/><h1 className="text-3xl font-bold">THE GUILD</h1><p className="text-muted-foreground">Choose the name that will appear in Guilds.</p><Input value={username} maxLength={40} onChange={e => setUsername(e.target.value)} placeholder="Custom username" onKeyDown={e => e.key === "Enter" && enter()} /><Button className="w-full" onClick={enter}>ENTER THE GUILD</Button><Link to="/" className="block text-sm text-muted-foreground">Return to ByteTicker</Link></div></div>;

  return <div className="guild-page min-h-screen text-foreground">
    <header className="guild-header"><Link to="/" aria-label="Back"><Button size="icon" variant="ghost"><ArrowLeft /></Button></Link><div className="guild-mark"><Shield/><div><b>THE GUILD</b><small>{username} · {member?.title || "Tenderfoot"}</small></div></div><Button size="icon" variant="ghost" onClick={() => setMenuOpen(true)} aria-label="Open sections"><Menu /></Button></header>
    {menuOpen && <><button className="guild-menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} /><aside className="guild-menu"><div className="guild-menu-brand"><Shield/><div><b>THE GUILD</b><small>MAIN DOMAIN</small></div><Button size="icon" variant="ghost" onClick={() => setMenuOpen(false)}><X/></Button></div>{menu.map(([id,label,Icon]) => <Button key={id} variant={section === id ? "secondary" : "ghost"} onClick={() => { setSection(id); setSelected(null); setMenuOpen(false); }}><Icon/>{label}</Button>)}<div className="guild-menu-user"><b>{username}</b><span>{member?.title || "Tenderfoot"}</span></div></aside></>}
    <main className="guild-main">
      {section === "guild" && !selected && <><PageTitle icon={Users} title="The Guild" subtitle="Create a guild, customize its chamber, and start a permanent conversation." action={<Button onClick={() => setShowCreate(v => !v)}>+ NEW GUILD</Button>} />
        {showCreate && <div className="guild-panel grid gap-3"><Input value={newName} onChange={e => setNewName(e.target.value)} maxLength={80} placeholder="Guild name"/><Input value={newDescription} onChange={e => setNewDescription(e.target.value)} maxLength={240} placeholder="Short description"/><Button onClick={createGuild}>CREATE GUILD</Button></div>}
        <div className="guild-grid">{guilds.map(g => <button key={g.id} className="guild-card" onClick={() => setSelected(g)}><MessageSquare/><div><b>{g.name}</b><p>{g.description || "Enter the chamber"}</p><small>Founded by {g.owner_name}</small></div><ChevronRight/></button>)}{guilds.length === 0 && <div className="guild-empty">No guilds yet. Found the first one.</div>}</div></>}
      {section === "guild" && selected && <GuildRoom guild={selected} username={username} isWarden={isWarden} onBack={() => setSelected(null)} onBackground={setGuildBackground} />}
      {section === "quiz" && <><PageTitle icon={FileSearch} title="Foray Quiz" subtitle="Your answer grants your first Guild title."/><div className="guild-panel text-center space-y-5"><h2 className="text-xl font-bold">What are you better at?</h2><div className="grid grid-cols-2 gap-3"><Button className="h-20" variant="secondary" onClick={() => answerQuiz("researching")}>RESEARCHING</Button><Button className="h-20" variant="secondary" onClick={() => answerQuiz("posting")}>POSTING</Button></div>{member?.quiz_answer && <p>Assigned title: <b className="text-primary">{member.title}</b></p>}</div></>}
      {section === "titles" && <><PageTitle icon={Crown} title="Titles" subtitle="Only the Warden can bestow these Guild titles."/><div className="guild-title-grid">{TITLES.map((t,i) => <div key={t}><span className={`guild-title-orb guild-title-${i%6}`} />{t}</div>)}</div>{isWarden && <div className="guild-panel space-y-2"><h2 className="font-bold">WARDEN TITLE ASSIGNER</h2>{members.map(m => <div key={m.id} className="flex items-center gap-2"><span className="flex-1 truncate">{m.username}</span><select value={m.title} onChange={e => supabase.from("guild_members").update({ title: e.target.value }).eq("id",m.id).then(load)}>{TITLES.map(t => <option key={t}>{t}</option>)}</select></div>)}</div>}</>}
      {section === "tec" && <><PageTitle icon={BookOpen} title="The TEC" subtitle="The Guild's searchable term and post archive."/><label className="guild-search"><Search/><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the TEC…"/></label><div className="space-y-2">{allPosts.filter(p => `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(search.toLowerCase())).map(p => <Link to={`/post/${p.id}`} key={p.id} className="guild-panel flex items-center gap-3"><span className="guild-tag">{p.category || "POST"}</span><div><b>{p.title}</b><p className="line-clamp-2 text-muted-foreground">{p.description}</p></div></Link>)}</div></>}
      {section === "dungeon" && <><PageTitle icon={Skull} title="The Dungeon" subtitle="Deleted posts remain here for 30 days before permanent removal."/><div className="space-y-2">{dungeon.map(p => <article key={p.id} className="guild-panel flex items-center gap-3"><Archive/><div className="flex-1"><b>{p.title}</b><p className="text-muted-foreground">Deleted · recoverable for 30 days</p></div>{isWarden && <Button size="sm" onClick={() => restorePost(p.id)}><RotateCcw/>RESTORE</Button>}</article>)}{dungeon.length === 0 && <div className="guild-empty">The Dungeon is empty.</div>}</div></>}
      {section === "watchman" && <Watchman username={username} isWarden={isWarden} />}
      {section === "cellhold" && <InfoSection icon={Shield} title="Cellhold" accent="You are: FREE" body="The Cellhold is the Guild prison. Follow the rules to maintain your freedom status. Sentences and moderation are overseen by the Warden." />}
      {section === "tribunal" && <InfoSection icon={Gavel} title="Guild Tribunal" accent="Court is Adjourned" body="The court of Guild lore. Disputes between Guild members are resolved here by the Warden, Guild-Beater, and Guild-Keeper." />}
    </main>
  </div>;
}

function PageTitle({ icon: Icon, title, subtitle, action }: { icon: typeof Users; title: string; subtitle: string; action?: React.ReactNode }) { return <div className="guild-page-title"><Icon/><div><h1>{title}</h1><p>{subtitle}</p></div>{action && <div className="ml-auto">{action}</div>}</div>; }
function InfoSection({ icon: Icon, title, accent, body }: { icon: typeof Shield; title: string; accent: string; body: string }) { return <><PageTitle icon={Icon} title={title} subtitle={body}/><div className="guild-panel guild-feature"><Icon/><h2>{accent}</h2><p>{body}</p></div></>; }
function GuildRoom({ guild, username, isWarden, onBack, onBackground }: { guild: Guild; username: string; isWarden: boolean; onBack: () => void; onBackground: (guild: Guild, file?: File, color?: string) => void }) {
  const bgRef = useRef<HTMLInputElement>(null); const canStyle = guild.owner_name === username || isWarden;
  return <div className="guild-room" style={{ backgroundColor: guild.background_color }}>
    {guild.background_url && guild.background_type === "video" && <video className="guild-room-bg" src={guild.background_url} autoPlay muted loop playsInline/>}
    {guild.background_url && guild.background_type === "image" && <img className="guild-room-bg" src={guild.background_url} alt=""/>}
    <div className="guild-room-content"><div className="guild-room-title"><Button size="icon" variant="ghost" onClick={onBack}><ArrowLeft/></Button><MessageSquare/><div><h1>{guild.name}</h1><p>{guild.description}</p></div>{canStyle && <><input ref={bgRef} hidden type="file" accept="image/*,video/*" onChange={e => e.target.files?.[0] && onBackground(guild,e.target.files[0])}/><Button size="icon" variant="ghost" onClick={() => bgRef.current?.click()} aria-label="Choose guild background"><Camera/></Button><label className="guild-color" title="Guild background color"><Brush/><input type="color" value={guild.background_color} onChange={e => onBackground(guild,undefined,e.target.value)}/></label></>}</div><GuildChat guildId={guild.id} username={username} isWarden={isWarden} title={guild.name.toUpperCase()} /></div>
  </div>;
}
function Watchman({ username, isWarden }: { username: string; isWarden: boolean }) {
  const [stream,setStream] = useState<any>(null); const [live,setLive] = useState(false); const videoRef=useRef<HTMLVideoElement>(null); const roomRef=useRef<Room|null>(null); const tracks=useRef<{cam?:LocalVideoTrack;mic?:LocalAudioTrack}>({});
  const connect = async (row:any, host:boolean) => { const { data }=await supabase.functions.invoke("livekit-token",{body:{room:row.room_name,identity:`guild-${username}-${crypto.randomUUID()}`,name:username,isHost:host}}); if(!(data as any)?.token)return; const room=new Room({adaptiveStream:true,dynacast:true}); roomRef.current=room; room.on(RoomEvent.TrackSubscribed,(track:RemoteTrack,pub:RemoteTrackPublication)=>{if(track.kind===Track.Kind.Video&&videoRef.current)track.attach(videoRef.current);}); await room.connect((data as any).url,(data as any).token); if(host){const cam=await createLocalVideoTrack();const mic=await createLocalAudioTrack();tracks.current={cam,mic};await room.localParticipant.publishTrack(cam);await room.localParticipant.publishTrack(mic);if(videoRef.current)cam.attach(videoRef.current);} setStream(row);setLive(host); };
  const start=async()=>{const room_name=`watchman-${crypto.randomUUID()}`;const {data}=await supabase.from("watchman_streams").insert({host_name:username,room_name,title:"Watchman's Detector Stream"}).select().single();if(data)connect(data,true);};
  const join=async()=>{const {data}=await supabase.from("watchman_streams").select("*").eq("status","live").order("started_at",{ascending:false}).limit(1).maybeSingle();if(data)connect(data,false);};
  const stop=async()=>{tracks.current.cam?.stop();tracks.current.mic?.stop();roomRef.current?.disconnect();if(stream)await supabase.from("watchman_streams").update({status:"ended",ended_at:new Date().toISOString()}).eq("id",stream.id);setStream(null);setLive(false);};
  useEffect(() => () => { void roomRef.current?.disconnect(); }, []);
  return <><PageTitle icon={Radio} title="Watchman's Detector Stream" subtitle="A separate Guild camera and microphone broadcast."/><div className="guild-panel space-y-3"><div className="guild-video"><video ref={videoRef} autoPlay playsInline muted={live}/>{!stream&&<Radio/>}</div><div className="flex gap-2"><Button onClick={start} disabled={!!stream}><Video/>GO LIVE</Button><Button variant="secondary" onClick={join} disabled={!!stream}><Radio/>WATCH LIVE</Button>{stream&&<Button variant="destructive" onClick={stop}>END</Button>}</div></div><GuildChat guildId={WATCHMAN_CHAT_ID} username={username} isWarden={isWarden} /> </>;
}
