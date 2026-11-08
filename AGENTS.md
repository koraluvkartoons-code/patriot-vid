# Project Architecture

- Keep the BetterTTV comment-emote catalogue in `src/lib/bttvEmotes.ts` and render it through the shared comment section so both feeds stay consistent.
- Keep alternate main-feed designs scoped by `html[data-design]`; the X design may reshape presentation but must reuse the same feed and no-email profile data.
- Keep independent X post colors in an X-scoped CSS token and separate local preference so other designs retain their existing colors.
- Window the shared emote grid by visible rows and index entries by group so catalogue growth does not increase mounted media or require manual result batches.
- Keep the KEK scoreboard on the KAK network page; aggregate published, non-deleted KAK posts server-side and persist flag choices separately on profiles so archive filters and pagination cannot change ranks.