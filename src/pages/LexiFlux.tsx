import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Delete, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildSentence, isWord } from "@/lib/lexiflux";

const LETTERS = "AAAEEEIIOOUUBCDDGHKLLMNNPRRSSTTWY";
const rand = (s: string) => s[Math.floor(Math.random() * s.length)];
type Tile = { letter: string; digit: string };
const makeTiles = () => Array.from({ length: 20 }, () => ({ letter: rand(LETTERS), digit: rand("0123456789") }));
const load = (k: string, d: string) => localStorage.getItem(k) || d;

export default function LexiFlux() {
  const [tiles, setTiles] = useState<Tile[]>(makeTiles);
  const [letterPhase, setLetterPhase] = useState(true);
  const [speed, setSpeed] = useState(1800);
  const [word, setWord] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>(() => JSON.parse(localStorage.getItem("lexiflux-sentences") || "[]"));
  const [score, setScore] = useState(0);
  const [text, setText] = useState(() => load("lexiflux-text", "#39ff14"));
  const [bg, setBg] = useState(() => load("lexiflux-bg", "#05010d"));

  useEffect(() => { localStorage.setItem("lexiflux-text", text); localStorage.setItem("lexiflux-bg", bg); }, [text, bg]);
  useEffect(() => {
    const t = window.setInterval(() => setLetterPhase(p => { if (!p) setTiles(makeTiles()); return !p; }), speed);
    return () => window.clearInterval(t);
  }, [speed]);

  const valid = useMemo(() => isWord(word), [word]);
  const press = (i: number) => { if (!letterPhase) return; setWord(w => (w + tiles[i].letter).slice(0, 16)); setScore(s => s + 1); };
  const addWord = (w = word) => { if (!isWord(w)) return; setWords(ws => [...ws, w.toLowerCase()]); setWord(""); setScore(s => s + w.length * 5); };
  const saveSentence = () => { const s = buildSentence(words); if (!s) return; const next = [s, ...saved].slice(0, 50); setSaved(next); localStorage.setItem("lexiflux-sentences", JSON.stringify(next)); setWords([]); };
  const box = { borderColor: text, color: text } as const;

  return <main style={{ background: bg, color: text, minHeight: "100dvh", fontFamily: "ui-monospace,monospace" }} className="p-4 pb-16">
    <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <Button asChild variant="outline" size="sm" style={{ ...box, background: "transparent" }}><Link to="/kak"><ArrowLeft className="w-4 h-4 mr-2" />KEK</Link></Button>
      <h1 className="text-3xl font-black tracking-widest" style={{ textShadow: `0 0 12px ${text}` }}>LEXI-FLUX</h1>
      <div className="flex gap-3 text-xs items-center">
        <label className="flex items-center gap-1">TEXT <input aria-label="Text color" type="color" value={text} onChange={e => setText(e.target.value)} /></label>
        <label className="flex items-center gap-1">BG <input aria-label="Background color" type="color" value={bg} onChange={e => setBg(e.target.value)} /></label>
      </div>
    </header>
    <p className="text-xs opacity-80 mb-3">Tap tiles while they show LETTERS to spell a real word. Add words to build a sentence. Score: <b>{score}</b> · {letterPhase ? "LETTERS — GO!" : "numbers… wait"}</p>
    <label className="text-xs flex items-center gap-2 mb-3">SPEED <input type="range" min={900} max={3500} step={100} value={4400 - speed} onChange={e => setSpeed(4400 - Number(e.target.value))} /></label>
    <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-4">
      {tiles.map((t, i) => <button key={i} onClick={() => press(i)} className="aspect-square rounded border-2 text-2xl font-bold transition-opacity" style={{ ...box, background: "transparent", opacity: letterPhase ? 1 : .45, boxShadow: letterPhase ? `0 0 8px ${text}` : "none" }}>{letterPhase ? t.letter : t.digit}</button>)}
    </div>
    <section className="max-w-md mx-auto rounded border-2 p-3 mb-4" style={box}>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-2xl tracking-widest min-h-8">{word || "_"}</span>
        <span className="text-xs">{word ? (valid ? "✓ WORD" : "…") : ""}</span>
        <Button size="icon" variant="ghost" aria-label="Delete letter" onClick={() => setWord(w => w.slice(0, -1))}><Delete className="w-4 h-4" /></Button>
        <Button size="sm" disabled={!valid} onClick={() => addWord()}><Plus className="w-4 h-4 mr-1" />Word</Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 min-h-8">
        {words.map((w, i) => <button key={i} className="px-2 py-1 rounded border text-sm" style={box} title="Tap to remove" onClick={() => setWords(ws => ws.filter((_, j) => j !== i))}>{w} ×</button>)}
      </div>
      <p className="mt-3 text-lg">{buildSentence(words) || "Your sentence appears here."}</p>
      <div className="flex gap-2 mt-3">
        <Button size="sm" disabled={!words.length} onClick={saveSentence}><Save className="w-4 h-4 mr-1" />Save sentence</Button>
        <Button size="sm" variant="ghost" disabled={!words.length} onClick={() => setWords([])}><Trash2 className="w-4 h-4 mr-1" />Clear</Button>
      </div>
    </section>
    {saved.length > 0 && <section className="max-w-md mx-auto"><h2 className="text-sm mb-2">SAVED SENTENCES</h2><ul className="space-y-1 text-sm">{saved.map((s, i) => <li key={i} className="border-l-2 pl-2" style={{ borderColor: text }}>{s}</li>)}</ul></section>}
  </main>;
}
