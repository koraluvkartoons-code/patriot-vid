# Two New System Designs: PIP-BOY and WOPR

Adds two more options to the SYSTEM DESIGN menu on the main feed. Everything else on the site stays exactly as it is.

## PIP-BOY design

- Amber-lit metal casing wrapped around the feed, with a rounded green CRT screen inside — matching the look of the attached Fallout photos.
- Phosphor green text on near-black, curved screen glass, scanlines, and a soft green glow.
- A row of physical-looking buttons under the screen (STATS, ITEMS, DATA) plus a Vault Boy figure standing in his arms-out pose on the screen.
- The feed starts locked. Nothing from the main feed shows until the user either presses one of the buttons or clicks Vault Boy.
- Clicking Vault Boy opens a keypad prompt: the correct code is 1984. Wrong code shows an "ACCESS DENIED" terminal error and lets them retry.
- Once unlocked, posts appear normally inside the green screen. Unlock lasts for the session; switching away from the PIP-BOY design and back re-locks it.
- Vault Boy poses match the photos (arms out, thumbs up on success).

## WOPR design

- Dark battleship-grey military console styling based on the attached WOPR photo.
- Red and yellow LED dot-matrix banner across the top spelling out the site name, with flickering lights.
- White stencil "WOPR / War Operation Plan Response" label and panel screws/hatch detail framing the feed.
- Feed content displays on the small monitor-style panel with amber/red terminal type. No code gate here — posts show as normal.

## Technical notes

- Add `pipboy` and `wopr` entries to `DESIGNS` in `src/components/DesignSwitcher.tsx`.
- Add `html[data-design="pipboy"]` and `html[data-design="wopr"]` token overrides and chrome styling to `src/index.css`, following the existing y2k/pc98/pastel pattern (CSS variables + `.design-overlay` scanlines + `.jarvis-holo` adjustments).
- New component `src/components/PipBoyGate.tsx` holds the lock state, button/Vault Boy interactions, and the 1984 keypad; rendered in `src/pages/Index.tsx` only when `data-design="pipboy"`, wrapping the feed list. Unlock state kept in React state (session only), design value read from the same `system-design` localStorage key.
- Vault Boy and console chrome drawn with inline SVG/CSS — no new image assets, so nothing else on the site is touched.
- No database, routing, or existing component logic changes.
