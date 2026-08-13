# Patriot Stream

---

Create a fully functional, modern social video-sharing website called **Patriot.Vid** with a vibrant purple and pink color scheme (deep purple background #4B0082, hot pink accents #FF1493, neon purple gradients, white text for contrast, and soft pink hover effects).

**Core Rules (MUST be implemented exactly):**

- NO sign-up or login required. Every visitor can immediately post, comment, and interact.

- On first post/comment, show a quick popup: “Choose your display name & profile picture” (text field + image upload). It persists in browser session.

- Every post and comment shows the user’s chosen display name + profile picture above it.

- You are the permanent ADMIN with display name “PatriotAdmin”. Your name always shows a large, shiny golden verified checkmark (clear gold ✅ badge) next to it on every post/comment you make.

**Badges / Stickers System (NEW - VERY IMPORTANT):**

- Create a custom badge/sticker system where small images appear next to any username (like verified badges on other sites).

- The following 6 specific images MUST be pre-loaded as selectable badges/stickers that the admin (you) and moderators can assign to any user’s name:

  1. Classic thinking Pepe the Frog with hands under chin (smug/side-eye expression).

  2. Spongebob with tongue out, waving, surfboard on head, and long arm extended.

  3. Close-up smug Pepe the Frog with finger on chin against black background.

  4. Surprised/concerned Spongebob walking with captain hat.

  5. Military-style Spongebob saluting with camouflage helmet, angry/confident expression.

  6. Rainbow clown wig Pepe the Frog with red nose and bowtie.

- Badges appear as small, clean icons right next to the username (similar to how verified badges look).

- Admin (you) can assign any of these badges (or the golden verified checkmark) to any username. Moderators can also assign badges.

- The golden verified checkmark for the admin must remain separate and extra prominent (larger and shinier gold).

**Giphy Integration:**

- In the comment composer, add a prominent “GIF” button. It uses this exact Giphy API key: **imKdh9YxKa4FU354hMTvXfmuguhB5Iw5**. Show trending GIFs + search.

**Other Features:**

- Infinite-scroll feed of posts (videos, photos, links) with title + description.

- Full comment sections under posts supporting text, photos, videos, links, and GIFs.

- Clean purple/pink patriotic theme, mobile-friendly, fast loading.

- Admin dashboard for moderation, badge assignment, and site control.

Make the site fully functional immediately after generation with all media upload, Giphy integration, and the exact 6 meme stickers pre-loaded as assignable badges. Call it Patriot.Vid.

---

Make everything in site savable even after deleted and refreshed keep everything on site forever until I delete it make it to where I can edit posts stickers I want by usernames are attached

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://patriot-vid.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f0738130-aa87-4260-827e-edcc869afa84).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
