# THE GUILD

Replace DOCFORM with a mobile-first guild area inspired by the attached dark fantasy screenshots, while keeping the rest of the site unchanged.

## Experience

- Rename the main-page DOCFORM entry to **THE GUILD** and replace its page.
- Use a dark translucent castle/cobweb presentation, black top bar, neon magenta accents, glass panels, and a three-line slide-out menu based on the references.
- On first entry, let a visitor enter a custom username and answer **“What are you better at? Researching or posting?”** The answer assigns a starting title; `PatriotAdmin` receives **Warden** automatically.

## Guilds and chat

- Let users create named chat rooms called **GUILDS**.
- Let each guild use a custom background color, uploaded photo, or uploaded video.
- Add persistent real-time messages with text, GIFs, BetterTTV emotes, photos, and videos.
- Let message owners edit their messages and let owners/admins remove them.

## Sections

- **The Guild:** guild directory and chat rooms.
- **Foray Quiz:** onboarding quiz and current title.
- **Titles:** show the reference title catalogue and provide Warden/admin title assignment controls similar to badge assignment.
- **The TEC:** searchable archive-style view inspired by the attached DEX reference.
- **The Dungeon:** deleted posts remain recoverable for 30 days, then are permanently removed.
- **Watchman’s Detector Stream:** separate browser-based live room with camera/microphone controls and its own **WATCHMANS GUILD** chat.

## Data and safety

- Add dedicated guild, membership/title, guild-message, and Watchman stream records in Lovable Cloud with realtime updates and media storage.
- Change post deletion to a reversible 30-day soft delete; exclude deleted posts everywhere outside the Dungeon.
- Keep title authority separate from profile identity and reserve Warden/title-management actions for the existing site admin.

## Validation

- Test username onboarding, both quiz choices, automatic Warden assignment, title management, guild creation, appearance customization, every chat media option, message editing, post restore, and the Watchman live-room controls.
- Check the three-line menu and key pages at mobile and desktop sizes, then confirm the app reports no build errors.
