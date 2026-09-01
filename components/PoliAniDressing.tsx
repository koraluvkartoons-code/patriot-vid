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
import kirby from "@/assets/pag/kirby.png.asset.json";
import megaman from "@/assets/pag/megaman.png.asset.json";
import pacman from "@/assets/pag/pacman.png.asset.json";
import peter from "@/assets/pag/peter.png.asset.json";

const sprites = [
  ["Anime", anime.url], ["Gaming", gaming.url], ["Video Games", videogames.url], ["Finance", finance.url],
  ["Marvel", marvel.url], ["DC", dc.url], ["Military", military.url], ["Politics", politics.url],
  ["Religion", religion.url], ["Economics", economics.url], ["Star Wars", starwars.url], ["Cartoons", cartoons.url],
  ["Kirby", kirby.url], ["Mega Man", megaman.url], ["Pac-Man", pacman.url], ["Peter Griffin", peter.url],
] as const;

export default function PoliAniDressing() {
  return <div className="pag-dressing" aria-hidden="true">{sprites.map(([name, src], i) => <div key={name} className={`pag-sprite pag-sprite-${i % 8}`}><img src={src} alt="" /><span>{name}</span></div>)}</div>;
}
