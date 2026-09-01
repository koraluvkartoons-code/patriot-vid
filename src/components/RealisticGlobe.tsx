import { useEffect, useRef, useState, type CSSProperties } from "react";
import earthAsset from "@/assets/pag/earth.jpg.asset.json";

const labels = ["ANIME", "GAMING", "VIDEO GAMES", "FINANCE", "MARVEL", "DC", "MILITARY", "POLITICS", "RELIGION", "ECONOMICS", "STAR WARS", "CARTOONS"];

export default function RealisticGlobe({ onSelect, terms }: { onSelect: (term: string) => void; terms: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update(); mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = (label: string) => {
    const exact = terms.find(t => t.toLowerCase() === label.toLowerCase()) || terms.find(t => t.toLowerCase().includes(label.toLowerCase()));
    setActive(label);
    if (exact) onSelect(exact);
  };

  const moving = visible && !reduced && !paused;
  return (
    <section ref={ref} className="pag-globe-panel" aria-label="Realistic PoliAniGames globe">
      <div className="pag-section-label">POLIANIGAMES GLOBE <span>// REAL WORLD × DIGITAL REALM</span></div>
      <div className={`pag-globe-stage ${moving ? "is-moving" : ""}`}>
        <div className="pag-globe-halo" />
        <div className="pag-globe" style={{ backgroundImage: `url(${earthAsset.url})` }} aria-hidden="true" />
        <div className="pag-globe-shade" aria-hidden="true" />
        <div className="pag-globe-label-orbit" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          {labels.map((label, i) => {
            const angle = (i / labels.length) * 360;
            return <button key={label} type="button" className={`pag-globe-label ${active === label ? "is-active" : ""}`} style={{ "--angle": `${angle}deg`, "--counter-angle": `${-angle}deg` } as CSSProperties} onClick={() => select(label)}>{label}</button>;
          })}
        </div>
        <div className="pag-globe-status">{reduced ? "MOTION REDUCED" : moving ? "ROTATING // COLOR CYCLE" : "PAUSED"}</div>
      </div>
    </section>
  );
}
