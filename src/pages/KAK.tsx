import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Maximize2, Play, Pause, Image as ImageIcon, Palette, Save, Trash2 } from "lucide-react";
import { createPost, fetchPosts, fetchCategories, deletePost } from "@/lib/api";
import { getCurrentUserId, type Post } from "@/lib/store";

const GREEN = "#00FF00";

const LORE: string[] = [
  "[KAK] booting KagKora Analysis Terminal v1.17 ...",
  "[KAK] handshake: KAK/KAG/KEK/QAQ mesh :: 117 nodes online",
  "[NODE-07] political breakdown :: two-party feedback loop detected",
  "  > vector A: legacy media narrative amplification (+82%)",
  "  > vector B: grassroots meme propagation (+311%)",
  "[LORE] kek etymology :: laughter glyph -> subculture sigil -> banner",
  "[GAME] frame data ingest :: 60fps parity, rollback netcode nominal",
  "  > combo string: 5L > 2M > 236H :: 41% meter-less",
  "[KAG] operator caste: KAKKERS / KAGGERS / KEKKERS synced",
  "[NODE-13] sentiment sweep :: irony saturation at 0.94",
  "[INTEL] dossier fragment recovered ... decrypting",
  "  > subject: PoliAniGames diaspora, cross-board migration mapped",
  "[QAQ] cryptic drop queued :: awaiting operator confirmation",
  "[KAK] anime/politics overlap index :: 0.63 and climbing",
  "[NODE-21] archive spider crawled 14,882 threads in 3.2s",
  "  > top term: HOGGERS  |  LIBBERS  |  SPURDO  |  117",
  "[SYS] entropy pool healthy :: green rain buffered",
  "[KAK] all systems ACTIVE. awaiting [KAK_QUERY] input.",
];

const DOSSIERS: Record<string, string[]> = {
  help: [
    "COMMANDS:",
    "  help          - this list",
    "  nodes         - list mesh nodes",
    "  dossier <id>  - pull intel dossier (kak|kag|kek|qaq|117)",
    "  matrix        - trigger green ASCII drop",
    "  clear         - wipe terminal buffer",
    "  status        - system status",
  ],
  nodes: [
    "NODE-01 .. NODE-32 :: mesh integrity 100%",
    "  active relays: KAK-primary, KAG-mirror, KEK-archive, QAQ-dark",
  ],
  status: [
    "SYSTEM: ACTIVE | UPLINK: STABLE | OPERATORS: KAKKERS/KAGGERS/KEKKERS",
  ],
  "dossier kak": ["DOSSIER KAK :: analysis core. parses political breakdowns into node logs."],
  "dossier kag": ["DOSSIER KAG :: signal amplifier. handles stream broadcast + chat mesh."],
  "dossier kek": ["DOSSIER KEK :: lore archive. meme genealogy, banner sigils, ancient posts."],
  "dossier qaq": ["DOSSIER QAQ :: cryptic drop channel. encrypted, irregular, unverified."],
  "dossier 117": ["DOSSIER 117 :: PROJECT 117 (117CPE). classification: rising."],
};

function asciiFromImage(img: HTMLImageElement, cols = 96): string[] {
  const chars = "01KAKGEQ#%*+=-:. ";
  const ratio = img.height / img.width;
  const rows = Math.max(8, Math.round(cols * ratio * 0.5));
  const c = document.createElement("canvas");
  c.width = cols; c.height = rows;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const d = ctx.getImageData(0, 0, cols, rows).data;
  const out: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      line += chars[Math.min(chars.length - 1, Math.floor((1 - lum) * (chars.length - 1)))];
    }
    out.push(line);
  }
  return out;
}

export default function KAK() {
  const [lines, setLines] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [auto, setAuto] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [bg, setBg] = useState("#000000");
  const idx = useRef(0);
  const charIdx = useRef(0);
  const shellRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLTextAreaElement>(null);

  // saved entries (stored in the shared posts table under site "kak")
  const [entryCat, setEntryCat] = useState("");
  const [entryText, setEntryText] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState<string>("");
  const [entries, setEntries] = useState<Post[]>([]);
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(async (cat?: string) => {
    try {
      const [p, c] = await Promise.all([
        fetchPosts(50, 0, "newest", cat || undefined, "kak"),
        fetchCategories("kak"),
      ]);
      setEntries(p);
      setCats(c);
    } catch { /* offline: keep terminal usable */ }
  }, []);

  useEffect(() => { loadEntries(activeCat); }, [activeCat, loadEntries]);

  const saveEntry = async () => {
    const text = entryText.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      await createPost({
        userId: getCurrentUserId() || "OPERATOR",
        title: text.split("\n")[0].slice(0, 80),
        description: text,
        category: entryCat.trim() || "UNFILED",
        site: "kak",
      });
      setLines(prev => [...prev, `[KAK] entry saved -> [${(entryCat.trim() || "UNFILED").toUpperCase()}]`].slice(-500));
      setEntryText("");
      await loadEntries(activeCat);
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (id: string) => {
    await deletePost(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };


  const typeChunk = useCallback((chunk: number) => {
    setLines(prev => {
      const next = [...prev];
      let remaining = chunk;
      while (remaining > 0) {
        const src = LORE[idx.current % LORE.length];
        if (charIdx.current === 0) next.push("");
        const take = Math.min(remaining, src.length - charIdx.current);
        next[next.length - 1] = src.slice(0, charIdx.current + take);
        charIdx.current += take;
        remaining -= take;
        if (charIdx.current >= src.length) { charIdx.current = 0; idx.current++; remaining = 0; }
      }
      return next.slice(-500);
    });
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1 && e.key !== "Enter") return;
      e.preventDefault();
      typeChunk(speed);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [typeChunk, speed]);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => typeChunk(speed), 60);
    return () => window.clearInterval(id);
  }, [auto, speed, typeChunk]);

  const matrixDrop = () => {
    const rain: string[] = [];
    for (let i = 0; i < 18; i++) {
      let l = "";
      for (let j = 0; j < 90; j++) l += Math.random() > 0.5 ? (Math.random() > 0.5 ? "1" : "0") : " ";
      rain.push(l);
    }
    setLines(prev => [...prev, ...rain].slice(-500));
  };

  const runQuery = () => {
    const raw = query.trim();
    if (!raw) return;
    const cmd = raw.toLowerCase();
    setQuery("");
    setLines(prev => [...prev, `[KAK_QUERY]> ${raw}`].slice(-500));
    if (cmd === "clear") { setLines([]); return; }
    if (cmd === "matrix") { matrixDrop(); return; }
    const hit = DOSSIERS[cmd];
    setLines(prev => [...prev, ...(hit ?? [`ERR: unknown node command "${raw}" — type "help"`])].slice(-500));
  };

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files).slice(0, 5)) {
      const url = URL.createObjectURL(f);
      const img = new Image();
      await new Promise<void>(res => { img.onload = () => res(); img.onerror = () => res(); img.src = url; });
      if (img.width) {
        setLines(prev => [...prev, `[KAK] decoding ${f.name} -> matrix stream`, ...asciiFromImage(img)].slice(-800));
      }
      URL.revokeObjectURL(url);
    }
  };

  const goFull = () => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <div ref={shellRef} className="min-h-screen relative overflow-hidden" style={{ background: bg, color: GREEN }}>
      <div className="pointer-events-none absolute inset-0 z-20" style={{ background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.85'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")" }} />

      <div className="relative z-30 font-mono" style={{ textShadow: `0 0 4px ${GREEN}, 0 0 12px ${GREEN}` }}>
        <header className="border-b px-3 py-2 flex items-center justify-between gap-2 flex-wrap" style={{ borderColor: GREEN }}>
          <h1 className="text-[10px] sm:text-xs tracking-tight">
            KAK/KAG/KEK/QAQ NETWORK // OPERATOR: KAKKERS/KAGGERS/KEKKERS // SYSTEM: ACTIVE
          </h1>
          <Link to="/polianigames" className="text-[10px] flex items-center gap-1 border px-2 py-1" style={{ borderColor: GREEN }}>
            <ArrowLeft className="w-3 h-3" />PAG
          </Link>
        </header>

        <div className="px-3 py-2 flex items-center gap-2 flex-wrap text-[10px] border-b" style={{ borderColor: GREEN }}>
          <button onClick={() => setAuto(a => !a)} className="border px-2 py-1 flex items-center gap-1" style={{ borderColor: GREEN }}>
            {auto ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}AUTO-RUN:{auto ? "ON" : "OFF"}
          </button>
          <label className="flex items-center gap-1">SPEED
            <input type="range" min={1} max={30} value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-24 accent-[#00FF00]" aria-label="Typing speed" />
            <span>{speed}</span>
          </label>
          <button onClick={goFull} className="border px-2 py-1 flex items-center gap-1" style={{ borderColor: GREEN }}><Maximize2 className="w-3 h-3" />FULLSCREEN</button>
          <button onClick={() => fileRef.current?.click()} className="border px-2 py-1 flex items-center gap-1" style={{ borderColor: GREEN }}><ImageIcon className="w-3 h-3" />IMG&gt;MATRIX</button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => { onFiles(e.target.files); e.currentTarget.value = ""; }} />
          <label className="flex items-center gap-1 border px-2 py-1" style={{ borderColor: GREEN }}>
            <Palette className="w-3 h-3" />BG
            <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="h-4 w-6 bg-transparent border-0 p-0 cursor-pointer" aria-label="Background color" />
          </label>
          <button onClick={matrixDrop} className="border px-2 py-1" style={{ borderColor: GREEN }}>ASCII_DROP</button>
        </div>

        <div ref={logRef} className="px-3 py-2 h-[calc(100vh-160px)] overflow-y-auto text-[10px] sm:text-[12px] leading-[1.25] whitespace-pre">
          {lines.length === 0 && <div className="opacity-70">press any key to type the feed // type "help" below</div>}
          {lines.map((l, i) => <div key={i}>{l}</div>)}
          <div className="animate-pulse">_</div>
        </div>

        <div className="border-t px-3 py-2 flex items-center gap-2" style={{ borderColor: GREEN }}>
          <span className="text-[10px] sm:text-xs shrink-0">[KAK_QUERY]&gt;</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") runQuery(); }}
            className="flex-1 bg-transparent outline-none text-[10px] sm:text-xs"
            style={{ color: GREEN, caretColor: GREEN }}
            placeholder="enter node command…"
            aria-label="KAK query input"
          />
        </div>
      </div>
    </div>
  );
}
