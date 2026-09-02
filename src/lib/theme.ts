export type ThemeScope = "byteticker" | "polianigames";

export const THEME_PRESETS: { label: string; hex: string | null }[] = [
  { label: "Dark Purple", hex: null },
  { label: "Light Blue", hex: "#a9d7f5" },
  { label: "Light Pink", hex: "#f7c4dd" },
  { label: "Mint", hex: "#bff0dc" },
  { label: "Amber", hex: "#f6d9a0" },
  { label: "Midnight", hex: "#0b0f1a" },
];

const KEY = (scope: ThemeScope) => `theme-color:${scope}`;

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0, hue = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
  }
  return [Math.round(hue), Math.round(s * 100), Math.round(l * 100)];
}

const VARS = [
  "--background", "--card", "--popover", "--secondary", "--muted", "--input",
  "--border", "--foreground", "--card-foreground", "--popover-foreground",
  "--secondary-foreground", "--muted-foreground", "--primary", "--primary-foreground",
  "--accent", "--accent-foreground", "--ring", "--pag-overlay", "--pag-ink",
];

export function applyThemeColor(hex: string | null) {
  const root = document.documentElement;
  if (!hex) {
    VARS.forEach(v => root.style.removeProperty(v));
    return;
  }
  const [h, s, l] = hexToHsl(hex);
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const light = l > 55;
  const step = light ? -1 : 1;
  const set = (name: string, value: string) => root.style.setProperty(name, value);

  set("--background", `${h} ${s}% ${l}%`);
  set("--card", `${h} ${clamp(s - 4)}% ${clamp(l + step * 4)}%`);
  set("--popover", `${h} ${clamp(s - 4)}% ${clamp(l + step * 5)}%`);
  set("--secondary", `${h} ${clamp(s - 8)}% ${clamp(l + step * 9)}%`);
  set("--muted", `${h} ${clamp(s - 8)}% ${clamp(l + step * 7)}%`);
  set("--input", `${h} ${clamp(s - 8)}% ${clamp(l + step * 7)}%`);
  set("--border", `${h} ${clamp(s - 6)}% ${clamp(l + step * 16)}%`);

  const ink = light ? `${h} 45% 12%` : `${h} 100% 88%`;
  const dim = light ? `${h} 25% 32%` : `${h} 25% 65%`;
  set("--foreground", ink);
  set("--card-foreground", ink);
  set("--popover-foreground", ink);
  set("--secondary-foreground", ink);
  set("--muted-foreground", dim);
  set("--pag-ink", light ? `${h} 60% 16%` : `0 0% 100%`);
  set("--pag-overlay", `${h} ${s}% ${l}%`);

  if (light) {
    set("--primary", `${h} 85% 32%`);
    set("--primary-foreground", `0 0% 100%`);
    set("--accent", `${(h + 200) % 360} 70% 35%`);
    set("--accent-foreground", `0 0% 100%`);
    set("--ring", `${h} 85% 32%`);
  }
}

export function getStoredThemeColor(scope: ThemeScope): string | null {
  try { return localStorage.getItem(KEY(scope)); } catch { return null; }
}

export function storeThemeColor(scope: ThemeScope, hex: string | null) {
  try {
    if (hex) localStorage.setItem(KEY(scope), hex);
    else localStorage.removeItem(KEY(scope));
  } catch { /* ignore */ }
}
