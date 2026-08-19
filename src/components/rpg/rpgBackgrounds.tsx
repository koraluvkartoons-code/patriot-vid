import React from "react";
import { type CategoryKey } from "./rpgSprites";

/**
 * 16-Bit RPG Environment Scenes (pure vector SVG with pixel-perfect textures)
 */

// 1. Reference Scene: 16-bit Minecart Desert with Wooden Fences, Railroads, Chest & Skeleton
export const RpgMinecartSceneBg: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 640 360" className={className} preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: "pixelated" }}>
    <defs>
      {/* Sandy Dirt Dither Pattern */}
      <pattern id="sandDither" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#d4a359" />
        <rect x="2" y="2" width="2" height="2" fill="#c29148" />
        <rect x="10" y="2" width="2" height="2" fill="#e5b870" />
        <rect x="6" y="6" width="2" height="2" fill="#b07f38" />
        <rect x="14" y="6" width="2" height="2" fill="#c29148" />
        <rect x="2" y="10" width="2" height="2" fill="#e5b870" />
        <rect x="10" y="10" width="2" height="2" fill="#c29148" />
        <rect x="6" y="14" width="2" height="2" fill="#e5b870" />
      </pattern>
      {/* Grass Dither */}
      <pattern id="grassDither" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#3f7a35" />
        <rect x="2" y="2" width="2" height="4" fill="#2d5c25" />
        <rect x="8" y="4" width="2" height="4" fill="#5a9e4d" />
        <rect x="12" y="8" width="2" height="4" fill="#2d5c25" />
        <rect x="4" y="12" width="2" height="4" fill="#5a9e4d" />
      </pattern>
    </defs>

    {/* Ground Sand Base */}
    <rect width="640" height="360" fill="url(#sandDither)" />

    {/* Top Right Grass Patch & Bushes */}
    <path d="M380 0 L640 0 L640 60 L380 60 Z" fill="url(#grassDither)" />
    <path d="M380 50 Q440 65 500 50 Q560 65 640 50 L640 60 L380 60 Z" fill="#2d5c25" />

    {/* Upper Wooden Fence (RPG style like reference) */}
    <g opacity="0.95">
      {/* Fence horizontal rails */}
      <rect x="0" y="70" width="380" height="16" fill="#8c5828" stroke="#523214" strokeWidth="2" />
      <rect x="0" y="72" width="380" height="6" fill="#b07a3e" />
      <rect x="0" y="100" width="380" height="16" fill="#8c5828" stroke="#523214" strokeWidth="2" />
      <rect x="0" y="102" width="380" height="6" fill="#b07a3e" />
      {/* Vertical fence posts with 3D bevels */}
      {[20, 100, 180, 260, 340].map((x, i) => (
        <g key={i}>
          <rect x={x} y="62" width="22" height="64" fill="#73451e" stroke="#3b200b" strokeWidth="2" />
          <rect x={x + 3} y="64" width="8" height="60" fill="#a36b32" />
          {/* Post tops */}
          <polygon points={`${x},62 ${x + 11},54 ${x + 22},62`} fill="#a36b32" stroke="#3b200b" strokeWidth="1.5" />
        </g>
      ))}
    </g>

    {/* Railroad Tracks (curves & rails like reference) */}
    <g opacity="0.9">
      {/* Wooden Ties */}
      {[40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600].map((rx, idx) => (
        <rect key={idx} x={rx} y="150" width="12" height="42" fill="#543820" stroke="#2b1a0d" strokeWidth="1.5" />
      ))}
      {/* Metal Rails */}
      <rect x="0" y="156" width="640" height="6" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
      <rect x="0" y="157" width="640" height="2" fill="#e2e8f0" />
      <rect x="0" y="180" width="640" height="6" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
      <rect x="0" y="181" width="640" height="2" fill="#e2e8f0" />
      {/* Track Turn / Switch on right */}
      <path d="M420 180 C480 180 520 220 520 280" stroke="#94a3b8" strokeWidth="6" fill="none" />
      <path d="M450 180 C500 180 540 220 540 280" stroke="#94a3b8" strokeWidth="6" fill="none" />
    </g>

    {/* Gold Nugget Piles (from reference) */}
    <g transform="translate(420, 110)">
      <ellipse cx="14" cy="10" rx="10" ry="6" fill="#a16207" />
      <circle cx="10" cy="8" r="4" fill="#eab308" />
      <circle cx="16" cy="7" r="3.5" fill="#facc15" />
      <circle cx="13" cy="11" r="3" fill="#fef08a" />
      <circle cx="20" cy="11" r="2.5" fill="#eab308" />
    </g>

    {/* Wooden Treasure Chest & Skeleton (from reference top-right) */}
    <g transform="translate(500, 40)">
      {/* Treasure Chest */}
      <rect x="24" y="6" width="34" height="26" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="2" />
      <rect x="24" y="6" width="34" height="10" fill="#9a3412" />
      <rect x="24" y="14" width="34" height="4" fill="#ca8a04" stroke="#713f12" strokeWidth="1" />
      <rect x="38" y="12" width="6" height="8" fill="#facc15" stroke="#713f12" strokeWidth="1" />
      <circle cx="41" cy="16" r="1.5" fill="#000000" />
      {/* Mini Skeleton Sprite */}
      <g transform="translate(0, -6)">
        <circle cx="12" cy="12" r="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
        <rect x="10" y="11" width="2" height="2" fill="#000" />
        <rect x="14" y="11" width="2" height="2" fill="#000" />
        <line x1="12" y1="17" x2="12" y2="28" stroke="#f8fafc" strokeWidth="2" />
        <line x1="8" y1="21" x2="16" y2="21" stroke="#f8fafc" strokeWidth="2" />
        <line x1="12" y1="28" x2="6" y2="36" stroke="#f8fafc" strokeWidth="2" />
        <line x1="12" y1="28" x2="18" y2="34" stroke="#f8fafc" strokeWidth="2" />
      </g>
    </g>

    {/* Overworld Mini Sprites in Center (like in reference) */}
    <g transform="translate(300, 140)">
      {/* Mini Sprite 1: Old Sage with Cloak */}
      <g transform="translate(0, -10)">
        <rect x="4" y="0" width="10" height="9" fill="#fed7aa" />
        <rect x="3" y="-2" width="12" height="4" fill="#e2e8f0" />
        <rect x="2" y="7" width="14" height="14" fill="#334155" />
        <rect x="4" y="9" width="10" height="12" fill="#64748b" />
      </g>
      {/* Mini Sprite 2: Red-haired Hero */}
      <g transform="translate(-16, 12)">
        <rect x="4" y="0" width="10" height="9" fill="#fed7aa" />
        <rect x="3" y="-3" width="12" height="5" fill="#b91c1c" />
        <rect x="3" y="7" width="12" height="12" fill="#1d4ed8" />
        <rect x="4" y="19" width="4" height="6" fill="#1e293b" />
        <rect x="10" y="19" width="4" height="6" fill="#1e293b" />
      </g>
      {/* Mini Sprite 3: Goblin / Bandit Sprite */}
      <g transform="translate(8, 14)">
        <rect x="4" y="0" width="12" height="9" fill="#ca8a04" />
        <rect x="2" y="7" width="16" height="11" fill="#78350f" />
        <circle cx="7" cy="4" r="1.5" fill="#ef4444" />
        <circle cx="13" cy="4" r="1.5" fill="#ef4444" />
      </g>
    </g>
  </svg>
);

// 2. Cyber / Futuristic Outpost Scene
export const RpgCyberSceneBg: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 640 360" className={className} preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: "pixelated" }}>
    <rect width="640" height="360" fill="#090d16" />
    {/* Grid floor */}
    <g opacity="0.4">
      {Array.from({ length: 18 }).map((_, i) => (
        <line key={i} x1="0" y1={120 + i * 14} x2="640" y2={120 + i * 14} stroke="#06b6d4" strokeWidth="1" />
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1={i * 28} y1="120" x2={i * 28} y2="360" stroke="#06b6d4" strokeWidth="1" />
      ))}
    </g>
    {/* Distant Cyber Skyline */}
    <rect x="40" y="30" width="60" height="90" fill="#1e1b4b" stroke="#3b82f6" strokeWidth="1" />
    <rect x="120" y="50" width="80" height="70" fill="#172554" stroke="#06b6d4" strokeWidth="1" />
    <rect x="220" y="20" width="70" height="100" fill="#311042" stroke="#ec4899" strokeWidth="1" />
    <rect x="320" y="40" width="100" height="80" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1" />
    <rect x="440" y="25" width="70" height="95" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
    <rect x="530" y="45" width="80" height="75" fill="#172554" stroke="#3b82f6" strokeWidth="1" />
    {/* Neon Moon */}
    <circle cx="540" cy="40" r="22" fill="#ec4899" opacity="0.8" />
  </svg>
);

// 3. Medieval Castle Throne & Dungeon
export const RpgCastleSceneBg: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 640 360" className={className} preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: "pixelated" }}>
    <rect width="640" height="360" fill="#1e293b" />
    {/* Stone Wall Tiles */}
    <g opacity="0.3">
      {Array.from({ length: 8 }).map((_, row) => (
        <React.Fragment key={row}>
          <line x1="0" y1={row * 24} x2="640" y2={row * 24} stroke="#475569" strokeWidth="2" />
          {Array.from({ length: 16 }).map((_, col) => (
            <line
              key={col}
              x1={col * 40 + (row % 2 === 0 ? 0 : 20)}
              y1={row * 24}
              x2={col * 40 + (row % 2 === 0 ? 0 : 20)}
              y2={(row + 1) * 24}
              stroke="#475569"
              strokeWidth="2"
            />
          ))}
        </React.Fragment>
      ))}
    </g>
    {/* Red Carpet */}
    <polygon points="260,360 380,360 350,140 290,140" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
    {/* Castle Torches with animated-looking pixel flames */}
    <g transform="translate(100, 60)">
      <rect x="0" y="10" width="8" height="28" fill="#78350f" />
      <polygon points="4,0 12,10 -4,10" fill="#facc15" />
      <circle cx="4" cy="4" r="3" fill="#ef4444" />
    </g>
    <g transform="translate(540, 60)">
      <rect x="0" y="10" width="8" height="28" fill="#78350f" />
      <polygon points="4,0 12,10 -4,10" fill="#facc15" />
      <circle cx="4" cy="4" r="3" fill="#ef4444" />
    </g>
  </svg>
);

export function getRpgBackground(category?: string | null): React.FC<{ className?: string }> {
  const cat = (category || "").toLowerCase();
  if (cat.includes("tech") || cat.includes("crypto") || cat.includes("gaming") || cat.includes("sci")) {
    return RpgCyberSceneBg;
  }
  if (cat.includes("history") || cat.includes("religion") || cat.includes("war")) {
    return RpgCastleSceneBg;
  }
  return RpgMinecartSceneBg;
}
