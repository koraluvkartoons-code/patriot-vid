# Project Architecture

- Keep the BetterTTV comment-emote catalogue in `src/lib/bttvEmotes.ts` and render it through the shared comment section so both feeds stay consistent.
- Keep alternate main-feed designs scoped by `html[data-design]`; the X design may reshape presentation but must reuse the same feed and no-email profile data.