# Mario Run-Across Like Animation + Site Color Picker

## 1. Mario runs across the screen on Like

- Upload the attached Mario sprite sheet to the CDN and slice its walk/run row into an evenly spaced horizontal strip used as a CSS sprite animation.
- When Like is pressed on any post (ByteTicker feed, post page, PoliAniGames feed, reposts), a large Mario (about 120px tall, scaled down a bit on phones) runs across the full width of the screen, on top of everything, then disappears (~2s).
- Pixel-perfect rendering (no blur), pointer-events off so it never blocks clicks, and it respects reduced-motion settings.
- Replaces the current small jump image that pops next to the heart.

## 2. Color changer

- Add a palette button in the ByteTicker header and in the PoliAniGames header.
- Opens a small panel with: a free color picker (any color), plus quick presets — Dark Purple (default), Light Blue, Light Pink, Green, Amber, Black.
- Choosing a color re-tints the site background and surfaces; text/accent brightness auto-adjusts so light colors stay readable.
- Choice is saved per site (ByteTicker and PoliAniGames keep separate colors) in the browser and persists on reload. A "Reset" restores the original look.

## Technical notes

- New `src/components/MarioRunFx.tsx` + a global event (`window` custom event) fired from the like handlers in `PostCard.tsx` and `RepostCard.tsx`; overlay mounted once in `App.tsx`. Keyframes/classes added to `src/index.css`.
- Sprite strip produced from the upload with Pillow, uploaded via `lovable-assets`, referenced by `.asset.json` pointer.
- Color changer: new `src/components/ThemeColorPicker.tsx` writing HSL values to existing design tokens (`--background`, `--card`, `--border`, `--muted`, `--secondary`, plus PoliAniGames panel vars) on `document.documentElement`; persisted in `localStorage` under separate keys per site. No hardcoded colors in components; tokens only.
- No database, routing, or content changes.
