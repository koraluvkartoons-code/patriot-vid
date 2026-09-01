# PoliAniGames upgrade + $SPANKR / PROJECT 117

Everything below is additive. The main ByteTicker feed, navigation, posts, database rows, search, sorting, Create Post, livestreams and existing categories stay exactly as they are. Only the two changes explicitly requested for the main page (the spinning $SPANKR coin and its new page) touch ByteTicker.

## 1. PoliAniGames page (/polianigames)

New sections inserted, in this exact order, between the header and the existing category buttons:

**Interactive World Map** — a hand-built fictional RPG map (not a mapping library): a pixel-art parchment/world panel with glowing region markers, one region per existing category (Anime, Gaming, Video Games, Finance, Marvel, DC, Military, Politics, Religion, Economics, Star Wars, Cartoons). Hover/tap a region: it lights up, shows its name and pixel character, and tapping it filters the feed to that category. Drifting pixel particles and soft ambient glow, paused when off-screen.

**Realistic spinning globe** — a photoreal-looking 3D globe (CSS/canvas sphere with real Earth texture, atmosphere glow and shading — deliberately not pixel art), rotating slowly and continuously with a gradual color-grade cycle. Category terms orbit around it as always-upright readable labels; hovering/tapping a label slows the spin and highlights that term. Sized to fit phone screens, capped frame rate, animation disabled if the user prefers reduced motion.

Category buttons, search, Create Post and the feed stay below, unchanged.

**16-bit RPG dressing** — pixel borders, retro UI framing, subtle animated background layers, and category characters placed around the page (not covering controls): Naruto (Anime), Mario (Gaming), Master Chief (Video Games), Doge (Finance), Spider-Man (Marvel), Superman (DC), military officer (Military), Trump (Politics), religious figure (Religion), stonks man (Economics), a Star Wars character, SpongeBob and Peter Griffin (Cartoons), plus Sonic, Kirby, Mega Man and Pac-Man easter eggs. Characters are original pixel-art sprites generated for the site, sized so they never overlap buttons on mobile.

**Sonic running strip** — a dedicated decorative strip near the PoliAniGames section that animates Sonic across the screen using the frames from your uploaded sprite sheet, in sequence, pixel-crisp, non-interactive and pointer-transparent so it can never block taps or scrolling.

**Mario like animation** — liking a post pops a small pixel Mario jump above the heart using your uploaded Mario art. Purely visual; the like write and count behave exactly as today.

**XP health bar under posts** — a retro HP/XP bar rendered under each post, derived from that post's existing engagement (likes, comments, reposts). Display only, no new data entry.

## 2. Comments

Comments already exist under posts. Additions: edit your own comment inline, an "(edited)" marker when it has been edited, and delete stays as-is. Permissions unchanged — owner or admin only. Comment UI restyled to fit the PoliAniGames look while staying identical on ByteTicker.

## 3. Reposts with photos

The repost/quote dialog gains image attachment (same uploader as posts), and RepostCard renders the attached photos.

## 4. New admin badges

Your two uploaded bear images added as selectable badges: **GOLDEN SPURDO** (gold) and **SILVER SPURDO** (platinum). No existing badge renamed or removed.

## 5. $SPANKR coin on the main page

Above the category buttons on ByteTicker's main page: your uploaded coin image spinning on its axis (3D flip, subtle gold glow). Clicking it opens a new page `/project117` using the same ByteTicker colors, containing, in order:

- Title: PROJECT 117 (117CPE)
- The disclaimer text, verbatim
- The long body text (movement / 117 Halo reference / PRO117 / Counter Pol-Ec / slogan / "IT'S NOT TO THE MOON, IT'S TO THE REACH – JAKORA L. HAYES"), verbatim
- Heading RED AND BLUE SOCKS PARTY with your uploaded video below it
- The "WHATS UP POLGAWEEBS/BASEDTRIOTS..." line
- The Mr. Krabs / Squidward / SpongeBob / Patrick / Chum Bucket / Fred the Fish slogan block

All text used exactly as you wrote it.

## Technical notes

- DB: add `edited_at` to `comments`, and a media column on `reposts`. No existing column or row touched.
- New sprite art is generated as image assets and uploaded to the CDN via Lovable Assets; your uploaded Sonic sheet, Mario sprites, coin, bears and video are uploaded as assets too (no binaries committed).
- Globe and map are self-contained components used only by PoliAniGames; no new heavy 3D dependency unless needed, and animation is throttled/paused off-screen for mobile performance.
- New route `/project117` added above the catch-all.
- Verification: mobile (360px) and desktop screenshots via a headless browser to confirm no horizontal overflow, category buttons/search/Create Post still work, feed loads, and no build/runtime errors.
