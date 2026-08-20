import React from "react";

// Helper to render pixel art from a matrix of hex colors or color palette + string grid
interface PixelSpriteProps {
  className?: string;
  size?: number | string;
}

// 1. ANIME: Naruto-inspired ninja (Blonde spiky hair, headband, orange jacket, blue collar/sandals)
export function PixelNinjaSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 28"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Hair */}
      <rect x="7" y="1" width="10" height="3" fill="#facc15" />
      <rect x="5" y="2" width="3" height="4" fill="#facc15" />
      <rect x="16" y="2" width="3" height="4" fill="#facc15" />
      <rect x="4" y="4" width="3" height="3" fill="#eab308" />
      <rect x="17" y="4" width="3" height="3" fill="#eab308" />
      <rect x="8" y="0" width="8" height="2" fill="#fef08a" />
      {/* Headband */}
      <rect x="6" y="5" width="12" height="3" fill="#1e293b" />
      <rect x="9" y="5" width="6" height="3" fill="#94a3b8" />
      <rect x="11" y="6" width="2" height="1" fill="#0f172a" />
      {/* Face & Eyes */}
      <rect x="7" y="8" width="10" height="5" fill="#fed7aa" />
      <rect x="6" y="8" width="1" height="4" fill="#fed7aa" />
      <rect x="17" y="8" width="1" height="4" fill="#fed7aa" />
      {/* Eyes */}
      <rect x="8" y="9" width="2" height="2" fill="#0284c7" />
      <rect x="14" y="9" width="2" height="2" fill="#0284c7" />
      <rect x="8" y="9" width="1" height="1" fill="#ffffff" />
      <rect x="14" y="9" width="1" height="1" fill="#ffffff" />
      {/* Whiskers / Cheeks */}
      <rect x="7" y="10" width="1" height="1" fill="#ea580c" />
      <rect x="16" y="10" width="1" height="1" fill="#ea580c" />
      {/* Smile */}
      <rect x="11" y="11" width="2" height="1" fill="#7c2d12" />
      {/* Jacket Collar */}
      <rect x="6" y="13" width="12" height="3" fill="#1e3a8a" />
      <rect x="10" y="13" width="4" height="3" fill="#ffffff" />
      {/* Jacket Body */}
      <rect x="5" y="16" width="14" height="6" fill="#ea580c" />
      <rect x="11" y="16" width="2" height="6" fill="#1e3a8a" />
      {/* Arms */}
      <rect x="3" y="16" width="2" height="5" fill="#ea580c" />
      <rect x="19" y="16" width="2" height="5" fill="#ea580c" />
      <rect x="3" y="21" width="2" height="2" fill="#fed7aa" />
      <rect x="19" y="21" width="2" height="2" fill="#fed7aa" />
      {/* Pants */}
      <rect x="7" y="22" width="10" height="3" fill="#ea580c" />
      <rect x="7" y="25" width="4" height="2" fill="#1e293b" />
      <rect x="13" y="25" width="4" height="2" fill="#1e293b" />
      {/* Sandals */}
      <rect x="6" y="27" width="5" height="1" fill="#0284c7" />
      <rect x="13" y="27" width="5" height="1" fill="#0284c7" />
      {/* Kunai in hand */}
      <rect x="21" y="19" width="1" height="4" fill="#94a3b8" />
      <rect x="20" y="21" width="3" height="1" fill="#475569" />
    </svg>
  );
}

// 2. DC: Superman-inspired superhero (Blue suit, red cape, 'S' shield chest, black parted hair)
export function PixelDcHeroSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 28"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Red Cape Back */}
      <rect x="4" y="8" width="16" height="16" fill="#dc2626" />
      <rect x="3" y="12" width="2" height="14" fill="#b91c1c" />
      <rect x="19" y="12" width="2" height="14" fill="#b91c1c" />
      {/* Hair */}
      <rect x="8" y="1" width="8" height="4" fill="#0f172a" />
      <rect x="7" y="2" width="10" height="3" fill="#0f172a" />
      <rect x="10" y="4" width="2" height="2" fill="#0f172a" /> {/* Curl */}
      {/* Face */}
      <rect x="8" y="5" width="8" height="5" fill="#fbcfe8" />
      <rect x="7" y="6" width="1" height="3" fill="#fbcfe8" />
      <rect x="16" y="6" width="1" height="3" fill="#fbcfe8" />
      {/* Eyes & Stately Jaw */}
      <rect x="9" y="6" width="2" height="1" fill="#0284c7" />
      <rect x="13" y="6" width="2" height="1" fill="#0284c7" />
      <rect x="10" y="8" width="4" height="1" fill="#be185d" />
      {/* Torso & Suit */}
      <rect x="6" y="10" width="12" height="7" fill="#1d4ed8" />
      {/* S-Shield */}
      <polygon points="9,11 15,11 14,15 12,16 10,15" fill="#eab308" />
      <rect x="11" y="12" width="2" height="1" fill="#dc2626" />
      <rect x="10" y="13" width="2" height="1" fill="#dc2626" />
      <rect x="12" y="14" width="2" height="1" fill="#dc2626" />
      {/* Yellow Belt */}
      <rect x="7" y="17" width="10" height="2" fill="#facc15" />
      <rect x="11" y="17" width="2" height="2" fill="#ca8a04" />
      {/* Red Trunks */}
      <rect x="7" y="19" width="10" height="2" fill="#dc2626" />
      {/* Arms */}
      <rect x="4" y="10" width="2" height="6" fill="#1d4ed8" />
      <rect x="18" y="10" width="2" height="6" fill="#1d4ed8" />
      <rect x="4" y="16" width="2" height="2" fill="#fbcfe8" />
      <rect x="18" y="16" width="2" height="2" fill="#fbcfe8" />
      {/* Blue Legs */}
      <rect x="7" y="21" width="4" height="3" fill="#1d4ed8" />
      <rect x="13" y="21" width="4" height="3" fill="#1d4ed8" />
      {/* Red Boots */}
      <rect x="7" y="24" width="4" height="4" fill="#dc2626" />
      <rect x="13" y="24" width="4" height="4" fill="#dc2626" />
    </svg>
  );
}

// 3. FINANCE: Dogecoin Shiba Inu with gold coins & sparkle
export function PixelDogeSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Ears */}
      <rect x="5" y="2" width="3" height="4" fill="#d97706" />
      <rect x="16" y="2" width="3" height="4" fill="#d97706" />
      <rect x="6" y="3" width="1" height="2" fill="#fef3c7" />
      <rect x="17" y="3" width="1" height="2" fill="#fef3c7" />
      {/* Head */}
      <rect x="5" y="6" width="14" height="8" fill="#f59e0b" />
      <rect x="4" y="7" width="16" height="6" fill="#f59e0b" />
      {/* Snout White/Cream */}
      <rect x="7" y="9" width="10" height="5" fill="#fef3c7" />
      <rect x="8" y="8" width="8" height="2" fill="#fef3c7" />
      {/* Eyes with funny suspicious shiba look */}
      <rect x="6" y="7" width="3" height="2" fill="#000000" />
      <rect x="15" y="7" width="3" height="2" fill="#000000" />
      <rect x="8" y="7" width="1" height="1" fill="#ffffff" />
      <rect x="17" y="7" width="1" height="1" fill="#ffffff" />
      {/* Brows */}
      <rect x="6" y="5" width="3" height="1" fill="#ffffff" />
      <rect x="15" y="5" width="3" height="1" fill="#ffffff" />
      {/* Nose & Mouth */}
      <rect x="11" y="9" width="2" height="2" fill="#000000" />
      <rect x="10" y="11" width="4" height="1" fill="#000000" />
      {/* Body */}
      <rect x="6" y="14" width="12" height="6" fill="#f59e0b" />
      <rect x="8" y="14" width="8" height="5" fill="#fef3c7" />
      {/* Paws */}
      <rect x="6" y="20" width="3" height="3" fill="#fef3c7" />
      <rect x="15" y="20" width="3" height="3" fill="#fef3c7" />
      {/* Golden Doge Coin floating */}
      <rect x="1" y="12" width="4" height="4" fill="#eab308" />
      <rect x="2" y="13" width="2" height="2" fill="#fef08a" />
      <rect x="2" y="13" width="1" height="2" fill="#ca8a04" /> {/* D symbol */}
      {/* Sparkles */}
      <rect x="20" y="3" width="1" height="3" fill="#fef08a" />
      <rect x="19" y="4" width="3" height="1" fill="#fef08a" />
      <rect x="1" y="5" width="1" height="3" fill="#38bdf8" />
      <rect x="0" y="6" width="3" height="1" fill="#38bdf8" />
    </svg>
  );
}

// 4. VIDEO GAMES: Mario-inspired plumber (Red cap, mustache, overalls)
export function PixelMarioSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Red Hat */}
      <rect x="7" y="1" width="10" height="3" fill="#dc2626" />
      <rect x="6" y="3" width="13" height="2" fill="#dc2626" />
      <rect x="14" y="3" width="5" height="2" fill="#ef4444" /> {/* Brim */}
      {/* Face & Hair */}
      <rect x="6" y="5" width="10" height="5" fill="#fed7aa" />
      <rect x="4" y="4" width="3" height="4" fill="#78350f" /> {/* Sideburns */}
      <rect x="5" y="6" width="2" height="3" fill="#78350f" />
      {/* Big Nose & Eye */}
      <rect x="11" y="5" width="2" height="2" fill="#0284c7" />
      <rect x="13" y="6" width="4" height="2" fill="#fed7aa" /> {/* Nose */}
      {/* Iconic Mustache */}
      <rect x="8" y="7" width="9" height="2" fill="#451a03" />
      <rect x="12" y="8" width="4" height="2" fill="#451a03" />
      {/* Red Shirt */}
      <rect x="5" y="10" width="14" height="6" fill="#dc2626" />
      <rect x="3" y="11" width="3" height="4" fill="#dc2626" />
      <rect x="18" y="11" width="3" height="4" fill="#dc2626" />
      {/* Overalls Body */}
      <rect x="7" y="12" width="10" height="7" fill="#1d4ed8" />
      {/* Yellow Buttons */}
      <rect x="8" y="13" width="2" height="2" fill="#facc15" />
      <rect x="14" y="13" width="2" height="2" fill="#facc15" />
      {/* White Gloves */}
      <rect x="2" y="14" width="3" height="3" fill="#f8fafc" />
      <rect x="19" y="14" width="3" height="3" fill="#f8fafc" />
      {/* Pants & Shoes */}
      <rect x="6" y="19" width="4" height="3" fill="#1d4ed8" />
      <rect x="14" y="19" width="4" height="3" fill="#1d4ed8" />
      {/* Brown Shoes */}
      <rect x="4" y="22" width="6" height="3" fill="#78350f" />
      <rect x="14" y="22" width="6" height="3" fill="#78350f" />
    </svg>
  );
}

// 5. MARVEL: Spider-Man-inspired superhero (Red/blue webbed suit, white spider eyes)
export function PixelMarvelSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Mask / Head */}
      <rect x="7" y="1" width="10" height="9" fill="#dc2626" />
      <rect x="6" y="2" width="12" height="7" fill="#dc2626" />
      {/* Web Lines on Mask */}
      <rect x="11" y="1" width="2" height="9" fill="#991b1b" />
      <rect x="7" y="5" width="10" height="1" fill="#991b1b" />
      {/* Big White Eyes with Black Edges */}
      <polygon points="7,4 10,4 10,7 8,7 7,5" fill="#000000" />
      <polygon points="8,4 10,4 10,6 8,6" fill="#ffffff" />
      <polygon points="14,4 17,4 17,5 16,7 14,7" fill="#000000" />
      <polygon points="14,4 16,4 16,6 14,6" fill="#ffffff" />
      {/* Torso: Red Chest with Blue Sides */}
      <rect x="6" y="10" width="12" height="6" fill="#dc2626" />
      <rect x="5" y="11" width="2" height="5" fill="#2563eb" />
      <rect x="17" y="11" width="2" height="5" fill="#2563eb" />
      {/* Black Spider Emblem on Chest */}
      <rect x="11" y="11" width="2" height="3" fill="#000000" />
      <rect x="10" y="10" width="4" height="1" fill="#000000" />
      <rect x="9" y="12" width="6" height="1" fill="#000000" />
      <rect x="10" y="14" width="4" height="1" fill="#000000" />
      {/* Arms: Red Shoulders, Blue Mid, Red Gloves */}
      <rect x="3" y="10" width="2" height="3" fill="#dc2626" />
      <rect x="19" y="10" width="2" height="3" fill="#dc2626" />
      <rect x="3" y="13" width="2" height="2" fill="#2563eb" />
      <rect x="19" y="13" width="2" height="2" fill="#2563eb" />
      <rect x="2" y="15" width="3" height="3" fill="#dc2626" />
      <rect x="19" y="15" width="3" height="3" fill="#dc2626" />
      {/* Web Shooter Thwip Web Line */}
      <rect x="22" y="14" width="2" height="1" fill="#ffffff" />
      <rect x="23" y="12" width="1" height="2" fill="#ffffff" />
      {/* Belt / Waist */}
      <rect x="7" y="16" width="10" height="2" fill="#dc2626" />
      {/* Blue Legs with Red Boots */}
      <rect x="7" y="18" width="4" height="4" fill="#2563eb" />
      <rect x="13" y="18" width="4" height="4" fill="#2563eb" />
      <rect x="7" y="22" width="4" height="4" fill="#dc2626" />
      <rect x="13" y="22" width="4" height="4" fill="#dc2626" />
    </svg>
  );
}

// 6. MILITARY: Military Officer (Peaked cap, olive uniform, medals, aviator shades)
export function PixelMilitarySprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Officer Peaked Hat */}
      <rect x="6" y="1" width="12" height="2" fill="#14532d" />
      <rect x="5" y="3" width="14" height="2" fill="#14532d" />
      <rect x="4" y="4" width="16" height="2" fill="#0f172a" /> {/* Black visor */}
      <rect x="11" y="2" width="2" height="2" fill="#facc15" /> {/* Gold Eagle crest */}
      {/* Face */}
      <rect x="7" y="6" width="10" height="4" fill="#fed7aa" />
      {/* Aviator Sunglasses */}
      <rect x="7" y="6" width="4" height="2" fill="#1e293b" />
      <rect x="13" y="6" width="4" height="2" fill="#1e293b" />
      <rect x="11" y="6" width="2" height="1" fill="#eab308" /> {/* Gold Bridge */}
      <rect x="8" y="6" width="1" height="1" fill="#38bdf8" /> {/* Glint */}
      <rect x="14" y="6" width="1" height="1" fill="#38bdf8" />
      {/* Strong Jaw & Stubble */}
      <rect x="7" y="9" width="10" height="2" fill="#fdba74" />
      <rect x="10" y="9" width="4" height="1" fill="#9a3412" />
      {/* Olive Dress Uniform */}
      <rect x="5" y="11" width="14" height="9" fill="#166534" />
      <rect x="4" y="11" width="16" height="2" fill="#eab308" /> {/* Gold Epaulets */}
      <rect x="10" y="11" width="4" height="3" fill="#f8fafc" /> {/* Shirt & Tie */}
      <rect x="11" y="12" width="2" height="3" fill="#0f172a" />
      {/* Ribbon Bar Medals */}
      <rect x="7" y="14" width="2" height="1" fill="#dc2626" />
      <rect x="9" y="14" width="2" height="1" fill="#2563eb" />
      <rect x="7" y="15" width="2" height="1" fill="#facc15" />
      <rect x="9" y="15" width="2" height="1" fill="#16a34a" />
      {/* Gold Buttons */}
      <rect x="11" y="16" width="2" height="1" fill="#facc15" />
      <rect x="11" y="18" width="2" height="1" fill="#facc15" />
      {/* Black Belt */}
      <rect x="6" y="20" width="12" height="2" fill="#0f172a" />
      <rect x="11" y="20" width="2" height="2" fill="#facc15" />
      {/* Trousers */}
      <rect x="6" y="22" width="5" height="4" fill="#14532d" />
      <rect x="13" y="22" width="5" height="4" fill="#14532d" />
    </svg>
  );
}

// 7. POLITICS: Donald Trump-inspired political mascot (Navy suit, red tie, golden hair, thumbs up)
export function PixelTrumpSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Signature Golden Hair */}
      <rect x="6" y="0" width="12" height="3" fill="#facc15" />
      <rect x="5" y="1" width="14" height="3" fill="#facc15" />
      <rect x="4" y="2" width="5" height="3" fill="#fef08a" />
      <rect x="15" y="1" width="4" height="3" fill="#eab308" />
      <rect x="18" y="2" width="2" height="2" fill="#eab308" />
      {/* Face */}
      <rect x="7" y="4" width="10" height="6" fill="#fed7aa" />
      <rect x="6" y="5" width="1" height="4" fill="#fed7aa" />
      <rect x="17" y="5" width="1" height="4" fill="#fed7aa" />
      {/* Eyes & Brows */}
      <rect x="8" y="4" width="3" height="1" fill="#facc15" />
      <rect x="13" y="4" width="3" height="1" fill="#facc15" />
      <rect x="8" y="6" width="2" height="1" fill="#0284c7" />
      <rect x="14" y="6" width="2" height="1" fill="#0284c7" />
      {/* Confident Smile */}
      <rect x="10" y="8" width="4" height="1" fill="#ffffff" />
      <rect x="10" y="9" width="4" height="1" fill="#ea580c" />
      {/* Navy Suit & White Shirt */}
      <rect x="5" y="10" width="14" height="10" fill="#1e3a8a" />
      <rect x="9" y="10" width="6" height="4" fill="#ffffff" />
      {/* Iconic Long Red Tie */}
      <rect x="11" y="11" width="2" height="8" fill="#dc2626" />
      <rect x="10" y="18" width="4" height="2" fill="#dc2626" />
      {/* American Flag Lapel Pin */}
      <rect x="7" y="12" width="2" height="1" fill="#ef4444" />
      <rect x="7" y="13" width="2" height="1" fill="#3b82f6" />
      {/* Arms & Thumbs Up */}
      <rect x="3" y="11" width="2" height="6" fill="#1e3a8a" />
      <rect x="19" y="11" width="2" height="6" fill="#1e3a8a" />
      <rect x="21" y="12" width="2" height="3" fill="#fed7aa" /> {/* Thumbs up hand */}
      <rect x="22" y="10" width="1" height="2" fill="#fed7aa" /> {/* Thumb */}
      <rect x="2" y="16" width="2" height="2" fill="#fed7aa" />
      {/* Navy Trousers & Dress Shoes */}
      <rect x="6" y="20" width="5" height="4" fill="#172554" />
      <rect x="13" y="20" width="5" height="4" fill="#172554" />
      <rect x="5" y="24" width="6" height="2" fill="#0f172a" />
      <rect x="13" y="24" width="6" height="2" fill="#0f172a" />
    </svg>
  );
}

// 8. RELIGION: Pixel Sacred Shrine with Radiant Cross, Star of David, Crescent & Om Symbols
export function PixelReligionSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Divine Radiant Aura Background */}
      <circle cx="12" cy="12" r="10" fill="#fef08a" opacity="0.3" />
      <rect x="11" y="0" width="2" height="2" fill="#facc15" />
      <rect x="11" y="22" width="2" height="2" fill="#facc15" />
      <rect x="0" y="11" width="2" height="2" fill="#facc15" />
      <rect x="22" y="11" width="2" height="2" fill="#facc15" />
      {/* Radiant Glowing Golden Cross in Center */}
      <rect x="11" y="3" width="2" height="14" fill="#facc15" />
      <rect x="8" y="6" width="8" height="2" fill="#facc15" />
      <rect x="11" y="3" width="1" height="13" fill="#ffffff" />
      <rect x="8" y="6" width="7" height="1" fill="#ffffff" />
      {/* Star of David on Left */}
      <polygon points="3,6 7,6 5,10" fill="#38bdf8" opacity="0.9" />
      <polygon points="3,9 7,9 5,5" fill="#38bdf8" opacity="0.9" />
      {/* Crescent Star on Right */}
      <circle cx="19" cy="8" r="3" fill="#34d399" />
      <circle cx="20" cy="7" r="2.5" fill="#1e1b4b" />
      <rect x="17" y="6" width="1" height="1" fill="#facc15" />
      {/* Golden Altar Pedestal */}
      <rect x="4" y="18" width="16" height="3" fill="#ca8a04" />
      <rect x="2" y="21" width="20" height="3" fill="#854d0e" />
      <rect x="6" y="19" width="12" height="1" fill="#fef08a" />
      <rect x="8" y="22" width="8" height="1" fill="#fef08a" />
    </svg>
  );
}

// 9. GAMING: Master Chief-inspired armored sci-fi spartan soldier
export function PixelMasterChiefSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Helmet Shell (Olive Green Mjolnir Armor) */}
      <rect x="7" y="1" width="10" height="8" fill="#3f6212" />
      <rect x="6" y="2" width="12" height="6" fill="#365314" />
      <rect x="8" y="0" width="8" height="2" fill="#4d7c0f" />
      {/* Golden Reflective Visor */}
      <rect x="7" y="4" width="10" height="3" fill="#eab308" />
      <rect x="8" y="4" width="8" height="2" fill="#facc15" />
      <rect x="9" y="4" width="4" height="1" fill="#fef08a" /> {/* Glint */}
      {/* Helmet Chin & Filters */}
      <rect x="9" y="7" width="6" height="2" fill="#1e293b" />
      <rect x="6" y="6" width="2" height="2" fill="#1e293b" />
      <rect x="16" y="6" width="2" height="2" fill="#1e293b" />
      {/* Neck Seal */}
      <rect x="9" y="9" width="6" height="1" fill="#0f172a" />
      {/* Armored Chestplate with 117 Vibe */}
      <rect x="5" y="10" width="14" height="7" fill="#3f6212" />
      <rect x="8" y="10" width="8" height="6" fill="#4d7c0f" />
      <rect x="10" y="12" width="4" height="2" fill="#1e293b" /> {/* Chest vent */}
      {/* Pauldrons (Shoulders) */}
      <rect x="3" y="10" width="3" height="4" fill="#365314" />
      <rect x="18" y="10" width="3" height="4" fill="#365314" />
      {/* Arms & Gauntlets */}
      <rect x="3" y="14" width="2" height="4" fill="#1e293b" />
      <rect x="19" y="14" width="2" height="4" fill="#1e293b" />
      <rect x="2" y="16" width="3" height="3" fill="#3f6212" />
      <rect x="19" y="16" width="3" height="3" fill="#3f6212" />
      {/* Assault Rifle in hands */}
      <rect x="20" y="12" width="3" height="2" fill="#475569" />
      <rect x="18" y="13" width="5" height="2" fill="#334155" />
      {/* Armored Belt / Groin Plate */}
      <rect x="6" y="17" width="12" height="2" fill="#1e293b" />
      <rect x="10" y="17" width="4" height="3" fill="#3f6212" />
      {/* Armored Legs */}
      <rect x="6" y="20" width="4" height="4" fill="#365314" />
      <rect x="14" y="20" width="4" height="4" fill="#365314" />
      <rect x="7" y="21" width="2" height="3" fill="#1e293b" />
      <rect x="15" y="21" width="2" height="3" fill="#1e293b" />
      {/* Armored Boots */}
      <rect x="5" y="24" width="5" height="2" fill="#3f6212" />
      <rect x="14" y="24" width="5" height="2" fill="#3f6212" />
    </svg>
  );
}

// 10. TECH / AI: Cyber Cyborg Robot
export function PixelTechSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Head Chassis */}
      <rect x="6" y="2" width="12" height="8" fill="#475569" />
      <rect x="11" y="0" width="2" height="2" fill="#06b6d4" /> {/* Antenna */}
      <rect x="5" y="5" width="2" height="3" fill="#06b6d4" /> {/* Ear bolts */}
      <rect x="17" y="5" width="2" height="3" fill="#06b6d4" />
      {/* Neon Cyber Visor */}
      <rect x="7" y="4" width="10" height="3" fill="#06b6d4" />
      <rect x="8" y="5" width="4" height="1" fill="#a5f3fc" />
      {/* Speaker Mouth */}
      <rect x="9" y="8" width="6" height="1" fill="#0f172a" />
      {/* Torso & Glowing Power Arc Reactor */}
      <rect x="5" y="11" width="14" height="8" fill="#334155" />
      <rect x="10" y="13" width="4" height="4" fill="#06b6d4" />
      <rect x="11" y="14" width="2" height="2" fill="#ffffff" />
      {/* Arms */}
      <rect x="3" y="12" width="2" height="6" fill="#64748b" />
      <rect x="19" y="12" width="2" height="6" fill="#64748b" />
      <rect x="3" y="18" width="2" height="2" fill="#06b6d4" />
      <rect x="19" y="18" width="2" height="2" fill="#06b6d4" />
      {/* Hydraulic Legs */}
      <rect x="6" y="20" width="4" height="6" fill="#475569" />
      <rect x="14" y="20" width="4" height="6" fill="#475569" />
      <rect x="5" y="24" width="5" height="2" fill="#0f172a" />
      <rect x="14" y="24" width="5" height="2" fill="#0f172a" />
    </svg>
  );
}

// 11. HISTORY: Pixel Medieval Knight
export function PixelKnightSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Red Helmet Plume */}
      <rect x="10" y="0" width="4" height="3" fill="#dc2626" />
      <rect x="8" y="1" width="2" height="2" fill="#ef4444" />
      {/* Steel Greathelm */}
      <rect x="6" y="3" width="12" height="8" fill="#94a3b8" />
      <rect x="7" y="2" width="10" height="2" fill="#cbd5e1" />
      {/* Cross Visor Slit */}
      <rect x="8" y="6" width="8" height="2" fill="#0f172a" />
      <rect x="11" y="4" width="2" height="6" fill="#0f172a" />
      {/* Steel Plate Torso */}
      <rect x="5" y="11" width="14" height="8" fill="#94a3b8" />
      <rect x="7" y="12" width="10" height="6" fill="#cbd5e1" />
      <rect x="11" y="12" width="2" height="6" fill="#dc2626" /> {/* Tabard cross */}
      <rect x="8" y="14" width="8" height="2" fill="#dc2626" />
      {/* Heater Shield on left arm */}
      <polygon points="2,12 6,12 6,18 4,20 2,18" fill="#b91c1c" />
      <rect x="3" y="14" width="2" height="3" fill="#facc15" />
      {/* Broadsword on right arm */}
      <rect x="19" y="8" width="2" height="12" fill="#e2e8f0" />
      <rect x="17" y="17" width="6" height="1" fill="#ca8a04" />
      <rect x="19" y="18" width="2" height="3" fill="#78350f" />
      {/* Greaves & Sabatons */}
      <rect x="6" y="20" width="4" height="6" fill="#64748b" />
      <rect x="14" y="20" width="4" height="6" fill="#64748b" />
    </svg>
  );
}

// 12. MUSIC: Pixel Synthwave Rocker
export function PixelMusicSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Retro Headphones */}
      <rect x="5" y="2" width="14" height="2" fill="#ec4899" />
      <rect x="4" y="4" width="2" height="4" fill="#a855f7" />
      <rect x="18" y="4" width="2" height="4" fill="#a855f7" />
      {/* Spiky Cool Hair */}
      <rect x="7" y="1" width="10" height="4" fill="#7c3aed" />
      {/* Face & Neon Shades */}
      <rect x="6" y="5" width="12" height="5" fill="#fed7aa" />
      <rect x="6" y="5" width="12" height="2" fill="#06b6d4" />
      <rect x="7" y="5" width="4" height="1" fill="#ffffff" />
      {/* Neon Purple Jacket */}
      <rect x="5" y="10" width="14" height="8" fill="#8b5cf6" />
      <rect x="8" y="10" width="8" height="6" fill="#0f172a" />
      {/* Electric Flying-V Guitar */}
      <polygon points="12,13 22,7 20,21 15,16" fill="#ec4899" />
      <rect x="10" y="12" width="10" height="1" fill="#facc15" />
      {/* Pants & High-top sneakers */}
      <rect x="6" y="19" width="4" height="5" fill="#0f172a" />
      <rect x="14" y="19" width="4" height="5" fill="#0f172a" />
      <rect x="5" y="24" width="5" height="2" fill="#06b6d4" />
      <rect x="14" y="24" width="5" height="2" fill="#06b6d4" />
    </svg>
  );
}

// 13. MEMES: Pixel Pepe the Frog mascot
export function PixelMemesSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Big Frog Eyes */}
      <circle cx="7" cy="6" r="4" fill="#4ade80" />
      <circle cx="17" cy="6" r="4" fill="#4ade80" />
      <circle cx="7" cy="6" r="2.5" fill="#ffffff" />
      <circle cx="17" cy="6" r="2.5" fill="#ffffff" />
      <rect x="6" y="5" width="2" height="2" fill="#000000" />
      <rect x="16" y="5" width="2" height="2" fill="#000000" />
      {/* Head */}
      <rect x="4" y="8" width="16" height="7" fill="#22c55e" />
      <rect x="3" y="10" width="18" height="4" fill="#22c55e" />
      {/* Smug / Based Smile Lips */}
      <rect x="5" y="13" width="14" height="3" fill="#b91c1c" />
      <rect x="6" y="12" width="12" height="2" fill="#f87171" />
      {/* Royal / Cool Blue Shirt */}
      <rect x="5" y="16" width="14" height="7" fill="#3b82f6" />
      <rect x="8" y="16" width="8" height="3" fill="#facc15" /> {/* Gold necklace */}
    </svg>
  );
}

// 14. DEFAULT / OTHER: Classic 16-Bit RPG Adventurer Hero (Blue tunic, brown belt, sword)
export function PixelAdventurerSprite({ className = "", size = 96 }: PixelSpriteProps) {
  return (
    <svg
      viewBox="0 0 24 26"
      width={size}
      height={size}
      className={`pixel-art shrink-0 ${className}`}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
    >
      {/* Brown Hair & Green Hero Cap */}
      <rect x="6" y="1" width="12" height="3" fill="#15803d" />
      <rect x="5" y="2" width="14" height="3" fill="#15803d" />
      <rect x="4" y="3" width="3" height="3" fill="#b45309" />
      <rect x="17" y="3" width="3" height="3" fill="#b45309" />
      {/* Hero Face */}
      <rect x="7" y="5" width="10" height="5" fill="#fed7aa" />
      <rect x="8" y="6" width="2" height="1" fill="#0284c7" />
      <rect x="14" y="6" width="2" height="1" fill="#0284c7" />
      <rect x="10" y="8" width="4" height="1" fill="#ea580c" />
      {/* Blue Hero Tunic */}
      <rect x="5" y="10" width="14" height="8" fill="#0284c7" />
      <rect x="9" y="10" width="6" height="3" fill="#ffffff" />
      {/* Sword on right */}
      <rect x="19" y="7" width="2" height="11" fill="#cbd5e1" />
      <rect x="17" y="15" width="6" height="1" fill="#ca8a04" />
      <rect x="19" y="16" width="2" height="3" fill="#78350f" />
      {/* Brown Belt */}
      <rect x="6" y="16" width="12" height="2" fill="#78350f" />
      <rect x="11" y="16" width="2" height="2" fill="#facc15" />
      {/* Boots */}
      <rect x="6" y="19" width="4" height="6" fill="#78350f" />
      <rect x="14" y="19" width="4" height="6" fill="#78350f" />
    </svg>
  );
}

// Category Character Resolver
export function getCategorySprite(category: string | undefined | null, size = 80) {
  const cat = (category || "").trim().toUpperCase();

  if (cat.includes("ANIME") || cat.includes("MANGA") || cat.includes("NARUTO") || cat.includes("JAPAN")) {
    return {
      name: "Shinobi Ninja",
      label: "ANIME HERO",
      theme: "border-amber-500/80 bg-amber-950/40 text-amber-300",
      accent: "#f59e0b",
      component: <PixelNinjaSprite size={size} />,
    };
  }

  if (cat.includes("DC") || cat.includes("SUPERMAN") || cat.includes("BATMAN") || cat.includes("JUSTICE")) {
    return {
      name: "Man of Steel",
      label: "DC HERO",
      theme: "border-blue-500/80 bg-blue-950/40 text-blue-300",
      accent: "#3b82f6",
      component: <PixelDcHeroSprite size={size} />,
    };
  }

  if (cat.includes("FINANCE") || cat.includes("CRYPTO") || cat.includes("DOGE") || cat.includes("MONEY") || cat.includes("ECONOMY") || cat.includes("STOCK") || cat.includes("MARKET")) {
    return {
      name: "Doge Shiba",
      label: "CRYPTO HODLER",
      theme: "border-yellow-400/80 bg-yellow-950/40 text-yellow-300",
      accent: "#eab308",
      component: <PixelDogeSprite size={size} />,
    };
  }

  if (cat.includes("VIDEO GAME") || cat.includes("VIDEOGAME") || cat.includes("NINTENDO") || cat.includes("MARIO") || cat.includes("RETRO")) {
    return {
      name: "Super Plumber",
      label: "RETRO GAMER",
      theme: "border-red-500/80 bg-red-950/40 text-red-300",
      accent: "#ef4444",
      component: <PixelMarioSprite size={size} />,
    };
  }

  if (cat.includes("MARVEL") || cat.includes("SPIDER") || cat.includes("AVENGER") || cat.includes("MCU")) {
    return {
      name: "Web Slinger",
      label: "MARVEL HERO",
      theme: "border-red-500/80 bg-red-950/40 text-red-300",
      accent: "#ef4444",
      component: <PixelMarvelSprite size={size} />,
    };
  }

  if (cat.includes("MILITARY") || cat.includes("WAR") || cat.includes("ARMY") || cat.includes("NAVY") || cat.includes("DEFENSE") || cat.includes("WEAPON")) {
    return {
      name: "General Officer",
      label: "MILITARY BRIGADE",
      theme: "border-emerald-600/80 bg-emerald-950/40 text-emerald-300",
      accent: "#10b981",
      component: <PixelMilitarySprite size={size} />,
    };
  }

  if (cat.includes("POLITIC") || cat.includes("GOVERNMENT") || cat.includes("ELECTION") || cat.includes("TRUMP") || cat.includes("CONGRESS") || cat.includes("SENATE") || cat.includes("USA") || cat.includes("FIRST")) {
    return {
      name: "The President",
      label: "POLITICAL CHAD",
      theme: "border-blue-500/80 bg-slate-900/60 text-yellow-300",
      accent: "#3b82f6",
      component: <PixelTrumpSprite size={size} />,
    };
  }

  if (cat.includes("RELIGION") || cat.includes("FAITH") || cat.includes("CHURCH") || cat.includes("GOD") || cat.includes("CHRISTIAN") || cat.includes("JEWISH") || cat.includes("ISLAM") || cat.includes("BIBLE") || cat.includes("SPIRIT")) {
    return {
      name: "Sacred Shrine",
      label: "FAITH & SPIRIT",
      theme: "border-amber-400/80 bg-purple-950/40 text-amber-200",
      accent: "#fbbf24",
      component: <PixelReligionSprite size={size} />,
    };
  }

  if (cat.includes("GAMING") || cat.includes("HALO") || cat.includes("FPS") || cat.includes("XBOX") || cat.includes("CHIEF") || cat.includes("ESPORT")) {
    return {
      name: "Master Spartan",
      label: "GAMING HERO",
      theme: "border-lime-500/80 bg-emerald-950/40 text-lime-300",
      accent: "#84cc16",
      component: <PixelMasterChiefSprite size={size} />,
    };
  }

  if (cat.includes("TECH") || cat.includes("AI") || cat.includes("ROBOT") || cat.includes("SCIENCE") || cat.includes("CYBER")) {
    return {
      name: "Cyber Droid",
      label: "TECH SYNTH",
      theme: "border-cyan-400/80 bg-cyan-950/40 text-cyan-300",
      accent: "#06b6d4",
      component: <PixelTechSprite size={size} />,
    };
  }

  if (cat.includes("HISTORY") || cat.includes("ANCIENT") || cat.includes("MEDIEVAL") || cat.includes("EMPIRE") || cat.includes("ROME")) {
    return {
      name: "Crusader Knight",
      label: "ANCIENT LORE",
      theme: "border-slate-400/80 bg-slate-950/40 text-slate-200",
      accent: "#94a3b8",
      component: <PixelKnightSprite size={size} />,
    };
  }

  if (cat.includes("MUSIC") || cat.includes("SONG") || cat.includes("AUDIO") || cat.includes("ROCK") || cat.includes("SYNTH")) {
    return {
      name: "Synth Bard",
      label: "MUSIC MAESTRO",
      theme: "border-fuchsia-500/80 bg-fuchsia-950/40 text-fuchsia-300",
      accent: "#d946ef",
      component: <PixelMusicSprite size={size} />,
    };
  }

  if (cat.includes("MEME") || cat.includes("CULTURE") || cat.includes("BASED") || cat.includes("PEPE") || cat.includes("INTERNET")) {
    return {
      name: "Based Pepe",
      label: "INTERNET MEMES",
      theme: "border-green-500/80 bg-green-950/40 text-green-300",
      accent: "#22c55e",
      component: <PixelMemesSprite size={size} />,
    };
  }

  // Default fallback mascot
  return {
    name: "Adventurer",
    label: cat ? `[ ${cat} ]` : "POLIANIGAMES",
    theme: "border-indigo-500/80 bg-indigo-950/40 text-indigo-200",
    accent: "#6366f1",
    component: <PixelAdventurerSprite size={size} />,
  };
}
