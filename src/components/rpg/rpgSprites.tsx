import React from "react";

export type CategoryKey =
  | "anime"
  | "dc"
  | "finance"
  | "videogames"
  | "marvel"
  | "military"
  | "politics"
  | "religion"
  | "gaming"
  | "tech"
  | "crypto"
  | "music"
  | "sports"
  | "history"
  | "memes"
  | "general";

export function normalizeCategory(cat?: string | null): CategoryKey {
  if (!cat) return "general";
  const c = cat.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  if (c.includes("anime") || c.includes("manga") || c.includes("naruto") || c.includes("dragonball") || c.includes("waifu")) return "anime";
  if (c === "dc" || c.includes("superman") || c.includes("batman") || c.includes("dccomics") || c.includes("justiceleague")) return "dc";
  if (c.includes("finance") || c.includes("money") || c.includes("market") || c.includes("stock") || c.includes("economy")) return "finance";
  if (c.includes("crypto") || c.includes("doge") || c.includes("bitcoin") || c.includes("solana") || c.includes("token")) return "finance";
  if (c.includes("videogame") || c.includes("mario") || c.includes("nintendo") || c.includes("playstation") || c.includes("xbox")) return "videogames";
  if (c.includes("marvel") || c.includes("spiderman") || c.includes("avengers") || c.includes("mcu") || c.includes("comic")) return "marvel";
  if (c.includes("military") || c.includes("army") || c.includes("navy") || c.includes("war") || c.includes("defense") || c.includes("officer")) return "military";
  if (c.includes("politic") || c.includes("trump") || c.includes("election") || c.includes("government") || c.includes("policy") || c.includes("usa") || c.includes("president")) return "politics";
  if (c.includes("religion") || c.includes("god") || c.includes("faith") || c.includes("christian") || c.includes("islam") || c.includes("buddhis") || c.includes("jew") || c.includes("hindu") || c.includes("spiritual") || c.includes("bible")) return "religion";
  if (c.includes("gaming") || c.includes("halo") || c.includes("fps") || c.includes("rpg") || c.includes("esport") || c.includes("gamer") || c.includes("stream")) return "gaming";
  if (c.includes("tech") || c.includes("ai") || c.includes("code") || c.includes("cyber") || c.includes("software")) return "tech";
  if (c.includes("music") || c.includes("song") || c.includes("band") || c.includes("album")) return "music";
  if (c.includes("sport") || c.includes("nba") || c.includes("nfl") || c.includes("soccer") || c.includes("football") || c.includes("mma")) return "sports";
  if (c.includes("history") || c.includes("ancient") || c.includes("rome") || c.includes("empire")) return "history";
  if (c.includes("meme") || c.includes("shitpost") || c.includes("funny") || c.includes("pepe")) return "memes";
  return "general";
}

export interface CharacterMeta {
  name: string;
  title: string;
  badgeColor: string;
  secondaryName?: string;
}

export const CATEGORY_META: Record<CategoryKey, CharacterMeta> = {
  anime: { name: "Shinobi Ninja", title: "Hidden Leaf Hero", badgeColor: "#f97316", secondaryName: "Sensei Kakashi" },
  dc: { name: "Man of Steel", title: "Metropolis Paragon", badgeColor: "#2563eb", secondaryName: "Dark Knight" },
  finance: { name: "Doge Merchant", title: "Much Value / Wow", badgeColor: "#eab308", secondaryName: "Bull Trader" },
  videogames: { name: "Pixel Plumber", title: "Mushroom Kingdom", badgeColor: "#ef4444", secondaryName: "Green Brother" },
  marvel: { name: "Web Slinger", title: "Friendly Hero", badgeColor: "#dc2626", secondaryName: "Iron Avenger" },
  military: { name: "General Ironclast", title: "Supreme Commander", badgeColor: "#15803d", secondaryName: "Tactical Officer" },
  politics: { name: "The Commander", title: "Chief of State", badgeColor: "#b91c1c", secondaryName: "Press Secretary" },
  religion: { name: "Sacred Guardian", title: "World Faith Symbols", badgeColor: "#d97706", secondaryName: "High Priest" },
  gaming: { name: "Spartan Chief", title: "Super Soldier-117", badgeColor: "#16a34a", secondaryName: "AI Construct" },
  tech: { name: "Cyber Synth", title: "Neural Core v9.0", badgeColor: "#06b6d4", secondaryName: "SysAdmin" },
  crypto: { name: "Crypto Baron", title: "Block Validator", badgeColor: "#f59e0b", secondaryName: "Node Runner" },
  music: { name: "Synth Maestro", title: "16-Bit Rocker", badgeColor: "#a855f7", secondaryName: "Lead Guitarist" },
  sports: { name: "Champion Striker", title: "League MVP", badgeColor: "#3b82f6", secondaryName: "Head Coach" },
  history: { name: "Grand Paladin", title: "Imperial Vanguard", badgeColor: "#64748b", secondaryName: "Royal Chronicler" },
  memes: { name: "Lord Pepe", title: "Rare Artifact Keeper", badgeColor: "#22c55e", secondaryName: "Troll King" },
  general: { name: "Adventurer", title: "Realm Explorer", badgeColor: "#6366f1", secondaryName: "Guild Master" },
};

/* -------------------------------------------------------------
 * CRISP 16-BIT PIXEL ART CHARACTER BUSTS (SVG Pixel Grid)
 * Designed with authentic 16-bit RPG shading & proportions!
 * ----------------------------------------------------------- */

// 1. POLITICS: Donald Trump-inspired political character (Blonde sweep hair, navy suit, red tie, white collar, confident expression)
export const PixelTrumpBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body / Navy Suit */}
    <path d="M10 85 L20 70 L80 70 L90 85 L96 120 L4 120 Z" fill="#0f172a" />
    <path d="M16 88 L26 73 L74 73 L84 88 L88 120 L12 120 Z" fill="#1e293b" />
    {/* Suit Lapels & Shadows */}
    <path d="M26 73 L42 120 L35 120 L18 80 Z" fill="#090d16" />
    <path d="M74 73 L58 120 L65 120 L82 80 Z" fill="#090d16" />
    {/* White Collar Shirt */}
    <polygon points="38,72 62,72 50,96" fill="#f8fafc" />
    <polygon points="35,70 42,88 47,72" fill="#e2e8f0" />
    <polygon points="65,70 58,88 53,72" fill="#e2e8f0" />
    {/* Iconic Red Tie */}
    <polygon points="46,84 54,84 56,120 44,120" fill="#dc2626" />
    <polygon points="48,84 52,84 53,120 47,120" fill="#ef4444" />
    <polygon points="46,84 54,84 52,90 48,90" fill="#b91c1c" />
    {/* Neck */}
    <rect x="42" y="60" width="16" height="15" fill="#fbcfe8" />
    <rect x="42" y="60" width="16" height="15" fill="#fbb6ce" opacity="0.6" />
    <rect x="44" y="62" width="12" height="14" fill="#fed7aa" />
    {/* Head / Face */}
    <rect x="30" y="26" width="40" height="38" rx="4" fill="#fed7aa" />
    {/* Cheeks / Jaw Shading */}
    <rect x="32" y="52" width="36" height="12" fill="#fdba74" opacity="0.4" />
    <rect x="34" y="60" width="32" height="4" fill="#f97316" opacity="0.2" />
    {/* Eyes & Brows */}
    <rect x="36" y="38" width="8" height="3" fill="#ca8a04" />
    <rect x="56" y="38" width="8" height="3" fill="#ca8a04" />
    <rect x="38" y="42" width="5" height="3" fill="#1e3a8a" />
    <rect x="57" y="42" width="5" height="3" fill="#1e3a8a" />
    <rect x="40" y="43" width="2" height="2" fill="#ffffff" />
    <rect x="59" y="43" width="2" height="2" fill="#ffffff" />
    {/* Nose */}
    <rect x="48" y="44" width="4" height="8" fill="#f97316" opacity="0.5" />
    <rect x="46" y="50" width="8" height="2" fill="#ea580c" opacity="0.4" />
    {/* Confident Smile */}
    <rect x="42" y="56" width="16" height="3" fill="#991b1b" />
    <rect x="44" y="56" width="12" height="2" fill="#ffffff" />
    {/* Signature Blonde Sweep Hair */}
    <path d="M22 28 Q24 6 50 6 Q80 6 82 24 Q84 36 78 40 Q76 24 68 20 Q56 16 38 18 Q26 20 22 28 Z" fill="#eab308" />
    <path d="M26 24 Q35 10 55 10 Q74 10 78 26 Q70 18 52 16 Q36 15 26 24 Z" fill="#facc15" />
    <path d="M20 28 Q18 42 24 48 Q26 38 28 32 Z" fill="#ca8a04" />
    <path d="M76 28 Q82 38 78 50 Q74 42 74 34 Z" fill="#ca8a04" />
    {/* Golden Hair Highlights */}
    <path d="M34 14 Q48 8 64 12 Q52 12 40 16 Z" fill="#fef08a" />
    {/* American Flag Pin */}
    <rect x="28" y="86" width="6" height="4" fill="#dc2626" />
    <rect x="28" y="86" width="3" height="2" fill="#2563eb" />
  </svg>
);

// 2. ANIME: Naruto-inspired ninja character (Spiky yellow hair, ninja headband with metal leaf plate, orange jacket, whiskers)
export const PixelAnimeBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Orange & Blue Ninja Jacket */}
    <path d="M10 88 L22 72 L78 72 L90 88 L94 120 L6 120 Z" fill="#ea580c" />
    <path d="M16 88 L26 75 L74 75 L84 88 L88 120 L12 120 Z" fill="#f97316" />
    {/* Blue Shoulders & High Collar */}
    <path d="M10 88 L28 72 L36 84 L18 100 Z" fill="#1d4ed8" />
    <path d="M90 88 L72 72 L64 84 L82 100 Z" fill="#1d4ed8" />
    <path d="M30 66 L70 66 L64 88 L36 88 Z" fill="#1e40af" />
    <rect x="42" y="70" width="16" height="14" fill="#ffffff" />
    <rect x="48" y="70" width="4" height="40" fill="#0f172a" />
    {/* Neck */}
    <rect x="42" y="58" width="16" height="12" fill="#fed7aa" />
    {/* Face */}
    <rect x="30" y="28" width="40" height="36" rx="4" fill="#ffedd5" />
    <rect x="32" y="30" width="36" height="32" fill="#fed7aa" />
    {/* Whiskers markings */}
    <line x1="33" y1="48" x2="39" y2="47" stroke="#7c2d12" strokeWidth="1.5" />
    <line x1="33" y1="51" x2="39" y2="51" stroke="#7c2d12" strokeWidth="1.5" />
    <line x1="33" y1="54" x2="39" y2="55" stroke="#7c2d12" strokeWidth="1.5" />
    <line x1="67" y1="48" x2="61" y2="47" stroke="#7c2d12" strokeWidth="1.5" />
    <line x1="67" y1="51" x2="61" y2="51" stroke="#7c2d12" strokeWidth="1.5" />
    <line x1="67" y1="54" x2="61" y2="55" stroke="#7c2d12" strokeWidth="1.5" />
    {/* Eyes & Fierce Expression */}
    <rect x="37" y="42" width="6" height="4" fill="#0284c7" />
    <rect x="57" y="42" width="6" height="4" fill="#0284c7" />
    <rect x="39" y="43" width="2" height="2" fill="#ffffff" />
    <rect x="59" y="43" width="2" height="2" fill="#ffffff" />
    <rect x="35" y="39" width="10" height="2" fill="#ca8a04" />
    <rect x="55" y="39" width="10" height="2" fill="#ca8a04" />
    {/* Smile */}
    <path d="M44 56 Q50 60 56 56" stroke="#9a3412" strokeWidth="2" fill="none" />
    {/* Ninja Headband Fabric */}
    <rect x="26" y="24" width="48" height="12" fill="#1e293b" />
    {/* Metal Plate */}
    <rect x="34" y="25" width="32" height="10" rx="2" fill="#94a3b8" />
    <rect x="36" y="26" width="28" height="8" rx="1" fill="#cbd5e1" />
    {/* Leaf Village Spiral Emblem */}
    <circle cx="50" cy="30" r="3" stroke="#334155" strokeWidth="1.5" fill="none" />
    <line x1="50" y1="27" x2="53" y2="33" stroke="#334155" strokeWidth="1.5" />
    {/* Rivets on plate */}
    <circle cx="37" cy="27" r="0.8" fill="#475569" />
    <circle cx="37" cy="33" r="0.8" fill="#475569" />
    <circle cx="63" cy="27" r="0.8" fill="#475569" />
    <circle cx="63" cy="33" r="0.8" fill="#475569" />
    {/* Spiky Yellow Hair */}
    <polygon points="26,24 16,14 30,18" fill="#eab308" />
    <polygon points="30,18 24,4 38,14" fill="#facc15" />
    <polygon points="38,14 42,2 50,12" fill="#fde047" />
    <polygon points="50,12 60,2 62,14" fill="#facc15" />
    <polygon points="62,14 74,4 70,18" fill="#fde047" />
    <polygon points="70,18 84,14 74,24" fill="#eab308" />
  </svg>
);

// 3. DC: Superman-inspired superhero character (Blue suit, red cape, yellow/red chest shield, classic slick hair curl)
export const PixelDcBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Red Cape Behind Shoulders */}
    <path d="M8 70 L20 62 L80 62 L92 70 L96 120 L4 120 Z" fill="#b91c1c" />
    <path d="M4 80 L18 66 L24 120 L6 120 Z" fill="#dc2626" />
    <path d="M96 80 L82 66 L76 120 L94 120 Z" fill="#dc2626" />
    {/* Blue Hero Suit / Torso */}
    <path d="M18 72 L30 64 L70 64 L82 72 L86 120 L14 120 Z" fill="#1d4ed8" />
    <path d="M22 74 L32 66 L68 66 L78 74 L80 120 L20 120 Z" fill="#2563eb" />
    {/* Iconic 'S' Diamond Shield */}
    <polygon points="50,74 68,82 62,106 50,114 38,106 32,82" fill="#eab308" stroke="#dc2626" strokeWidth="2" />
    <path d="M42 86 Q50 82 58 86 Q60 92 50 94 Q40 96 42 104 Q50 108 58 102" stroke="#dc2626" strokeWidth="3" fill="none" />
    {/* Neck */}
    <rect x="40" y="52" width="20" height="14" fill="#fdba74" />
    {/* Strong Jaw Face */}
    <polygon points="32,24 68,24 66,54 50,62 34,54" fill="#fed7aa" />
    {/* Eyes & Eyebrows */}
    <rect x="38" y="36" width="8" height="3" fill="#1e293b" />
    <rect x="54" y="36" width="8" height="3" fill="#1e293b" />
    <rect x="40" y="40" width="5" height="3" fill="#0284c7" />
    <rect x="55" y="40" width="5" height="3" fill="#0284c7" />
    <rect x="42" y="41" width="2" height="2" fill="#ffffff" />
    <rect x="57" y="41" width="2" height="2" fill="#ffffff" />
    {/* Confident Hero Smile */}
    <path d="M44 52 Q50 56 56 52" stroke="#9a3412" strokeWidth="2" fill="none" />
    {/* Jet Black Hero Hair with Forehead Curl */}
    <path d="M30 24 Q32 8 50 8 Q68 8 70 24 Q72 32 68 34 Q66 22 52 18 Q36 18 32 34 Z" fill="#0f172a" />
    <path d="M34 20 Q44 12 56 12 Q64 12 66 20 Z" fill="#1e293b" />
    {/* Signature 'S' Forehead Curl */}
    <path d="M48 18 Q54 22 50 28 Q46 32 44 26" stroke="#0f172a" strokeWidth="2.5" fill="none" />
  </svg>
);

// 4. FINANCE / CRYPTO: Dogecoin Shiba Inu character (Golden doge ears, sparkle eyes, gold coin medallion)
export const PixelFinanceBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Business Collar & Gold Chain */}
    <path d="M12 90 L24 74 L76 74 L88 90 L92 120 L8 120 Z" fill="#1e293b" />
    <polygon points="36,74 64,74 50,96" fill="#f8fafc" />
    {/* Giant Gold Doge Coin Medallion */}
    <circle cx="50" cy="104" r="14" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
    <circle cx="50" cy="104" r="11" fill="#facc15" />
    <text x="50" y="110" textAnchor="middle" fill="#713f12" fontSize="13" fontWeight="900" fontFamily="monospace">Ð</text>
    {/* Fur Chest */}
    <path d="M36 60 Q50 64 64 60 Q60 84 40 84 Z" fill="#fef3c7" />
    {/* Doge Head / Shiba Inu */}
    <rect x="28" y="24" width="44" height="42" rx="10" fill="#d97706" />
    <rect x="32" y="26" width="36" height="38" rx="8" fill="#f59e0b" />
    {/* White Fur Muzzle & Cheeks */}
    <ellipse cx="50" cy="48" rx="14" ry="12" fill="#fef3c7" />
    <circle cx="34" cy="44" r="6" fill="#fef3c7" />
    <circle cx="66" cy="44" r="6" fill="#fef3c7" />
    {/* Triangular Doge Ears */}
    <polygon points="26,30 18,8 38,20" fill="#b45309" />
    <polygon points="28,26 22,12 36,20" fill="#fde68a" />
    <polygon points="74,30 82,8 62,20" fill="#b45309" />
    <polygon points="72,26 78,12 64,20" fill="#fde68a" />
    {/* Cute Nose */}
    <polygon points="46,44 54,44 50,49" fill="#1e293b" />
    {/* Classic Doge Sparkle Eyes */}
    <circle cx="40" cy="38" r="4" fill="#1e293b" />
    <circle cx="42" cy="36" r="1.5" fill="#ffffff" />
    <circle cx="60" cy="38" r="4" fill="#1e293b" />
    <circle cx="62" cy="36" r="1.5" fill="#ffffff" />
    {/* Whimsical Eyebrows */}
    <circle cx="38" cy="30" r="2.5" fill="#fef3c7" />
    <circle cx="62" cy="30" r="2.5" fill="#fef3c7" />
    {/* Smile */}
    <path d="M46 51 Q50 54 54 51" stroke="#1e293b" strokeWidth="1.5" fill="none" />
    {/* Sparkles / Moon Rockets */}
    <polygon points="12,18 16,14 12,10 8,14" fill="#fde047" />
    <polygon points="86,22 90,18 86,14 82,18" fill="#fde047" />
  </svg>
);

// 5. VIDEO GAMES: Mario-inspired plumber character (Red cap with M, mustache, blue overalls)
export const PixelVideoGamesBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Red Shirt & Blue Overalls */}
    <path d="M10 86 L22 70 L78 70 L90 86 L94 120 L6 120 Z" fill="#dc2626" />
    {/* Blue Overalls Straps */}
    <rect x="26" y="80" width="14" height="40" fill="#1d4ed8" />
    <rect x="60" y="80" width="14" height="40" fill="#1d4ed8" />
    <rect x="36" y="96" width="28" height="24" fill="#1e40af" />
    {/* Yellow Buttons on Overalls */}
    <circle cx="33" cy="88" r="3" fill="#facc15" stroke="#a16207" strokeWidth="1" />
    <circle cx="67" cy="88" r="3" fill="#facc15" stroke="#a16207" strokeWidth="1" />
    {/* Neck */}
    <rect x="42" y="60" width="16" height="12" fill="#fed7aa" />
    {/* Round Face */}
    <ellipse cx="50" cy="46" rx="20" ry="18" fill="#fed7aa" />
    {/* Big Big Nose */}
    <ellipse cx="50" cy="42" rx="7" ry="6" fill="#fbcfe8" stroke="#f43f5e" strokeWidth="1" />
    {/* Eyes */}
    <ellipse cx="40" cy="36" rx="3.5" ry="5" fill="#0284c7" />
    <ellipse cx="60" cy="36" rx="3.5" ry="5" fill="#0284c7" />
    <circle cx="41" cy="34" r="1.5" fill="#ffffff" />
    <circle cx="61" cy="34" r="1.5" fill="#ffffff" />
    {/* Iconic Brown Mustache */}
    <path d="M30 48 Q40 44 50 48 Q60 44 70 48 Q66 58 50 56 Q34 58 30 48 Z" fill="#451a03" />
    {/* Sideburns */}
    <rect x="26" y="36" width="6" height="14" rx="2" fill="#451a03" />
    <rect x="68" y="36" width="6" height="14" rx="2" fill="#451a03" />
    {/* Red Plumber Cap */}
    <path d="M22 28 Q24 6 50 6 Q76 6 78 28 Z" fill="#b91c1c" />
    <path d="M18 24 Q50 16 82 24 Q84 32 16 32 Z" fill="#dc2626" />
    {/* White Emblem with 'M' */}
    <circle cx="50" cy="18" r="8" fill="#f8fafc" stroke="#dc2626" strokeWidth="1" />
    <text x="50" y="23" textAnchor="middle" fill="#dc2626" fontSize="11" fontWeight="900" fontFamily="sans-serif">M</text>
  </svg>
);

// 6. MARVEL: Spider-Man-inspired superhero (Red/blue webbed mask with large expressive white lenses)
export const PixelMarvelBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Red and Blue Spidey Suit */}
    <path d="M10 86 L24 70 L76 70 L90 86 L94 120 L6 120 Z" fill="#dc2626" />
    <path d="M10 86 L28 72 L28 120 L6 120 Z" fill="#1d4ed8" />
    <path d="M90 86 L72 72 L72 120 L94 120 Z" fill="#1d4ed8" />
    {/* Black Spider Chest Emblem */}
    <circle cx="50" cy="94" r="3.5" fill="#0f172a" />
    <path d="M50 90 L40 82 M50 94 L36 94 M50 98 L38 108 M50 90 L60 82 M50 94 L64 94 M50 98 L62 108" stroke="#0f172a" strokeWidth="1.5" />
    {/* Mask Neck */}
    <rect x="40" y="56" width="20" height="16" fill="#b91c1c" />
    <line x1="50" y1="56" x2="50" y2="72" stroke="#0f172a" strokeWidth="1" />
    {/* Full Spidey Mask Head */}
    <ellipse cx="50" cy="34" rx="22" ry="26" fill="#dc2626" />
    {/* Web Pattern Lines on Mask */}
    <path d="M50 10 L50 60 M28 34 L72 34 M34 18 L66 50 M66 18 L34 50" stroke="#7f1d1d" strokeWidth="1.2" />
    <circle cx="50" cy="34" r="8" stroke="#7f1d1d" strokeWidth="1" fill="none" />
    <circle cx="50" cy="34" r="16" stroke="#7f1d1d" strokeWidth="1" fill="none" />
    {/* Iconic Sharp White Spider Lenses with Black Borders */}
    <polygon points="34,26 47,34 33,46" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
    <polygon points="66,26 53,34 67,46" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
  </svg>
);

// 7. MILITARY: Military general / commander (Peaked officer cap, olive green uniform, gold braid & medals)
export const PixelMilitaryBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Military Uniform / Olive Camo */}
    <path d="M10 86 L22 70 L78 70 L90 86 L94 120 L6 120 Z" fill="#14532d" />
    <path d="M16 88 L26 73 L74 73 L84 88 L88 120 L12 120 Z" fill="#166534" />
    {/* Gold Epaulets / Shoulder Boards */}
    <rect x="12" y="72" width="16" height="8" rx="2" fill="#eab308" stroke="#713f12" strokeWidth="1" />
    <rect x="72" y="72" width="16" height="8" rx="2" fill="#eab308" stroke="#713f12" strokeWidth="1" />
    {/* Medal Ribbons Bar */}
    <rect x="28" y="86" width="6" height="4" fill="#3b82f6" />
    <rect x="34" y="86" width="6" height="4" fill="#ef4444" />
    <rect x="40" y="86" width="6" height="4" fill="#eab308" />
    <rect x="28" y="90" width="6" height="4" fill="#22c55e" />
    <rect x="34" y="90" width="6" height="4" fill="#a855f7" />
    <rect x="40" y="90" width="6" height="4" fill="#06b6d4" />
    {/* Gold Buttons */}
    <circle cx="50" cy="82" r="2.5" fill="#facc15" />
    <circle cx="50" cy="94" r="2.5" fill="#facc15" />
    <circle cx="50" cy="106" r="2.5" fill="#facc15" />
    {/* Neck */}
    <rect x="42" y="58" width="16" height="14" fill="#fed7aa" />
    {/* Stern Commander Face */}
    <rect x="32" y="28" width="36" height="34" rx="3" fill="#fed7aa" />
    {/* Aviator Sunglasses */}
    <rect x="35" y="36" width="12" height="10" rx="2" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
    <rect x="53" y="36" width="12" height="10" rx="2" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
    <line x1="47" y1="38" x2="53" y2="38" stroke="#ca8a04" strokeWidth="2" />
    {/* Stern Mustache */}
    <rect x="40" y="52" width="20" height="4" rx="1" fill="#475569" />
    {/* Peaked General Cap */}
    <path d="M20 24 Q50 14 80 24 Q84 10 50 6 Q16 10 20 24 Z" fill="#14532d" />
    <rect x="18" y="22" width="64" height="6" rx="2" fill="#0f172a" />
    <rect x="20" y="26" width="60" height="4" fill="#eab308" />
    {/* Gold Eagle Insignia on Cap */}
    <polygon points="50,12 55,18 45,18" fill="#facc15" />
  </svg>
);

// 8. RELIGION: Sacred world faith symbols & guardian (Cross, Star & Crescent, Lotus / Dharmachakra, Menorah)
export const PixelReligionBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* White & Gold Holy Vestments / Robe */}
    <path d="M10 86 L24 68 L76 68 L90 86 L96 120 L4 120 Z" fill="#f8fafc" />
    <path d="M42 68 L58 68 L64 120 L36 120 Z" fill="#d97706" />
    <path d="M46 68 L54 68 L56 120 L44 120 Z" fill="#fde68a" />
    {/* Floating World Religious Glyphs / Symbols Array */}
    {/* 1. Golden Cross (Christianity) */}
    <g transform="translate(18, 88) scale(0.7)">
      <rect x="8" y="2" width="4" height="18" fill="#eab308" stroke="#78350f" strokeWidth="1" />
      <rect x="3" y="6" width="14" height="4" fill="#eab308" stroke="#78350f" strokeWidth="1" />
    </g>
    {/* 2. Star & Crescent (Islam) */}
    <g transform="translate(68, 88) scale(0.7)">
      <path d="M12 2 A8 8 0 1 0 12 18 A6 6 0 1 1 12 2 Z" fill="#eab308" stroke="#78350f" strokeWidth="0.8" />
      <polygon points="14,10 15,7 18,7 16,9 17,12 14,10" fill="#facc15" />
    </g>
    {/* 3. Central Golden Dharmachakra / Lotus Wheel */}
    <circle cx="50" cy="94" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
    <circle cx="50" cy="94" r="3" fill="#ca8a04" />
    {/* Radiant Halo / Aura */}
    <circle cx="50" cy="38" r="30" fill="url(#holyGlow)" opacity="0.8" />
    <defs>
      <radialGradient id="holyGlow">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#facc15" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Serene Guardian Face */}
    <rect x="34" y="24" width="32" height="34" rx="6" fill="#fed7aa" />
    {/* Calm Eyes */}
    <path d="M38 38 Q42 42 46 38" stroke="#78350f" strokeWidth="2" fill="none" />
    <path d="M54 38 Q58 42 62 38" stroke="#78350f" strokeWidth="2" fill="none" />
    {/* Bindi / Sacred Mark on Forehead */}
    <circle cx="50" cy="30" r="2" fill="#dc2626" />
    {/* Sacred Hood / Cowl */}
    <path d="M26 24 Q50 6 74 24 Q78 48 72 62 Q50 56 28 62 Q22 48 26 24 Z" fill="#92400e" opacity="0.3" />
  </svg>
);

// 9. GAMING: Master Chief-inspired armored sci-fi soldier (Spartan olive green armor, golden amber polarized visor)
export const PixelGamingBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Heavy MJOLNIR Spartan Armor Shoulders & Chest */}
    <path d="M8 84 L22 66 L78 66 L92 84 L96 120 L4 120 Z" fill="#14532d" />
    <path d="M14 86 L26 70 L74 70 L86 86 L90 120 L10 120 Z" fill="#15803d" />
    {/* Heavy Pauldrons */}
    <rect x="6" y="74" width="20" height="24" rx="4" fill="#166534" stroke="#052e16" strokeWidth="2" />
    <rect x="74" y="74" width="20" height="24" rx="4" fill="#166534" stroke="#052e16" strokeWidth="2" />
    {/* Chest Tech Plates & 117 Mark */}
    <polygon points="36,76 64,76 56,104 44,104" fill="#14532d" stroke="#052e16" strokeWidth="2" />
    <text x="50" y="94" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="900" fontFamily="monospace">117</text>
    {/* Armored Neck Collar */}
    <rect x="36" y="56" width="28" height="14" fill="#0f172a" stroke="#052e16" strokeWidth="1" />
    {/* Spartan Helmet */}
    <path d="M28 26 Q30 8 50 8 Q70 8 72 26 L74 54 L62 62 L38 62 L26 54 Z" fill="#15803d" stroke="#052e16" strokeWidth="2" />
    <path d="M34 12 L66 12 L68 20 L32 20 Z" fill="#166534" />
    {/* Golden Amber Polarized Visor with Hexagon Glint */}
    <polygon points="32,28 68,28 64,44 50,48 36,44" fill="#eab308" stroke="#713f12" strokeWidth="2" />
    <polygon points="36,30 64,30 60,42 50,45 40,42" fill="#facc15" />
    {/* Visor Glint Reflection */}
    <line x1="42" y1="32" x2="48" y2="42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    {/* Helmet Respirators & Chin Armor */}
    <rect x="42" y="50" width="16" height="8" fill="#0f172a" />
    <circle cx="34" cy="52" r="3" fill="#334155" />
    <circle cx="66" cy="52" r="3" fill="#334155" />
  </svg>
);

// 10. TECH / AI: Cybernetic android / neon robot
export const PixelTechBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 86 L24 70 L76 70 L90 86 L94 120 L6 120 Z" fill="#0f172a" />
    <path d="M16 88 L26 73 L74 73 L84 88 L88 120 L12 120 Z" fill="#1e293b" />
    <rect x="46" y="74" width="8" height="40" fill="#06b6d4" />
    <circle cx="50" cy="94" r="8" fill="#0891b2" stroke="#67e8f9" strokeWidth="2" />
    {/* Robotic Head */}
    <rect x="30" y="22" width="40" height="38" rx="6" fill="#334155" stroke="#06b6d4" strokeWidth="2" />
    <rect x="34" y="32" width="32" height="12" rx="2" fill="#0f172a" />
    {/* Glowing Cyan Visor */}
    <rect x="36" y="34" width="28" height="8" rx="1" fill="#06b6d4" />
    <rect x="44" y="36" width="12" height="4" fill="#cffafe" />
    {/* Antennas */}
    <line x1="28" y1="26" x2="20" y2="16" stroke="#06b6d4" strokeWidth="3" />
    <circle cx="20" cy="16" r="2.5" fill="#22d3ee" />
    <line x1="72" y1="26" x2="80" y2="16" stroke="#06b6d4" strokeWidth="3" />
    <circle cx="80" cy="16" r="2.5" fill="#22d3ee" />
  </svg>
);

// 11. GENERAL / RETRO HERO: Default 16-bit RPG Hero Warrior
export const PixelHeroBust: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 120" className={className} style={{ imageRendering: "pixelated" }} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 86 L22 70 L78 70 L90 86 L94 120 L6 120 Z" fill="#4338ca" />
    <path d="M16 88 L26 73 L74 73 L84 88 L88 120 L12 120 Z" fill="#6366f1" />
    {/* Leather Armor Harness */}
    <rect x="28" y="74" width="10" height="44" fill="#78350f" />
    <rect x="62" y="74" width="10" height="44" fill="#78350f" />
    {/* Face */}
    <rect x="32" y="26" width="36" height="36" rx="4" fill="#fed7aa" />
    {/* Hair & Bandana */}
    <rect x="30" y="24" width="40" height="8" fill="#dc2626" />
    <polygon points="30,24 20,10 36,18" fill="#7c2d12" />
    <polygon points="36,18 48,6 52,18" fill="#9a3412" />
    <polygon points="52,18 64,8 70,24" fill="#7c2d12" />
    {/* Hero Eyes */}
    <rect x="38" y="38" width="6" height="4" fill="#1e3a8a" />
    <rect x="56" y="38" width="6" height="4" fill="#1e3a8a" />
    <rect x="40" y="39" width="2" height="2" fill="#ffffff" />
    <rect x="58" y="39" width="2" height="2" fill="#ffffff" />
    <path d="M44 52 Q50 56 56 52" stroke="#9a3412" strokeWidth="2" fill="none" />
  </svg>
);

// Map categories to character bust components
export function getCategoryBust(category?: string | null): React.FC<{ className?: string }> {
  const key = normalizeCategory(category);
  switch (key) {
    case "politics": return PixelTrumpBust;
    case "anime": return PixelAnimeBust;
    case "dc": return PixelDcBust;
    case "finance":
    case "crypto": return PixelFinanceBust;
    case "videogames": return PixelVideoGamesBust;
    case "marvel": return PixelMarvelBust;
    case "military": return PixelMilitaryBust;
    case "religion": return PixelReligionBust;
    case "gaming": return PixelGamingBust;
    case "tech": return PixelTechBust;
    default: return PixelHeroBust;
  }
}
