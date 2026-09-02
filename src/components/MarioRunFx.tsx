import { useEffect, useState } from "react";
import marioStrip from "@/assets/pag/mario-run-strip.png.asset.json";

export const MARIO_RUN_EVENT = "mario-run-fx";

export function triggerMarioRun() {
  window.dispatchEvent(new CustomEvent(MARIO_RUN_EVENT));
}

export default function MarioRunFx() {
  const [runs, setRuns] = useState<number[]>([]);

  useEffect(() => {
    const onRun = () => {
      const id = Date.now() + Math.random();
      setRuns(prev => [...prev, id]);
      window.setTimeout(() => setRuns(prev => prev.filter(r => r !== id)), 2400);
    };
    window.addEventListener(MARIO_RUN_EVENT, onRun);
    return () => window.removeEventListener(MARIO_RUN_EVENT, onRun);
  }, []);

  if (runs.length === 0) return null;

  return (
    <div className="mario-run-layer" aria-hidden="true">
      {runs.map(id => (
        <span key={id} className="mario-run-sprite" style={{ backgroundImage: `url(${marioStrip.url})` }} />
      ))}
    </div>
  );
}
