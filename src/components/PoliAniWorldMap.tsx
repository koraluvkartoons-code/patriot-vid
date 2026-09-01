import { useEffect, useRef, useState } from "react";
import worldMapAsset from "@/assets/pag/worldmap.jpg.asset.json";
import anime from "@/assets/pag/anime.png.asset.json";
import gaming from "@/assets/pag/gaming.png.asset.json";
import videogames from "@/assets/pag/videogames.png.asset.json";
import finance from "@/assets/pag/finance.png.asset.json";
import marvel from "@/assets/pag/marvel.png.asset.json";
import dc from "@/assets/pag/dc.png.asset.json";
import military from "@/assets/pag/military.png.asset.json";
import politics from "@/assets/pag/politics.png.asset.json";
import religion from "@/assets/pag/religion.png.asset.json";
import economics from "@/assets/pag/stonks.png.asset.json";
import starwars from "@/assets/pag/starwars.png.asset.json";
import cartoons from "@/assets/pag/cartoons.png.asset.json";
import sonicRunning from "@/assets/pag/sonic-running.gif";

const regions = [
  ["Anime", anime.url, "12%", "29%"], ["Gaming", gaming.url, "31%", "19%"],
  ["Video Games", videogames.url, "48%", "31%"], ["Finance", finance.url, "68%", "22%"],
  ["Marvel", marvel.url, "82%", "38%"], ["DC", dc.url, "61%", "50%"],
  ["Military", military.url, "25%", "58%"], ["Politics", politics.url, "43%", "65%"],
  ["Religion", religion.url, "70%", "68%"], ["Economics", economics.url, "87%", "63%"],
  ["Star Wars", starwars.url, "54%", "79%"], ["Cartoons", cartoons.url, "14%", "80%"],
] as const;

export default function PoliAniWorldMap({ terms, onSelect }: { terms: string[]; onSelect: (term: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = (name: string) => {
    const exact = terms.find(t => t.toLowerCase() === name.toLowerCase()) || terms.find(t => t.toLowerCase().includes(name.toLowerCase()));
    setActive(name);
    if (exact) onSelect(exact);
  };

  return (
    <section ref={ref} className="pag-world-panel" aria-label="Interactive World Map">
      <div className="pag-section-label">WORLD MAP <span>// COMMUNITY RPG REALM</span></div>
      <div className="pag-map-canvas" style={{ backgroundImage: `linear-gradient(180deg, rgba(27,14,4,.08), rgba(8,2,14,.55)), url(${worldMapAsset.url})` }}>
        <div className="pag-map-grid" />
        {visible && Array.from({ length: 18 }, (_, i) => <span key={i} className="pag-particle" style={{ left: `${(i * 37) % 96}%`, top: `${(i * 53) % 90}%`, animationDelay: `${(i % 7) * .45}s` }} />)}
        {regions.map(([name, sprite, left, top]) => (
          <button
            key={name}
            type="button"
            className={`pag-region-marker ${active === name ? "is-active" : ""}`}
            style={{ left, top }}
            onMouseEnter={() => setActive(name)}
            onFocus={() => setActive(name)}
            onClick={() => select(name)}
            aria-label={`Explore ${name} region`}
          >
            <span className="pag-marker-glow" />
            <img src={sprite} alt="" />
            <span>{name}</span>
          </button>
        ))}
        <div className="pag-map-hud">TAP A REGION → FILTER FEED</div>
        {active && <div className="pag-map-tooltip"><strong>{active}</strong><span>REGION SELECTED</span></div>}
      </div>
      <div className="pag-sonic-strip" aria-hidden="true"><div className="pag-sonic-track" style={{ backgroundImage: `url(${sonicRunning})` }} /></div>
    </section>
  );
}
