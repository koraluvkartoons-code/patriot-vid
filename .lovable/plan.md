# X-style default system design

## What will change
- Add an **X** option to **SYSTEM DESIGN** and use it as the default for visitors who have not chosen another design.
- Give only the X option a familiar three-column social layout: navigation on the left, the existing post composer/feed in the center, and search/trending shortcuts on the right.
- Keep all current posts, categories, livestream links, archives, admin tools, color picker, and other system designs intact.
- On phones, collapse the side columns into a compact top bar and bottom navigation so the feed remains readable.

## Profiles
- Reuse the existing no-email profile system in the X layout.
- Add clear **Create profile / Edit profile** access in the X navigation while keeping the site publicly readable without login.
- Profile creation will continue to use a display name and optional profile picture only.

## Technical details
- Add an `x` design identifier to the existing persistent design switcher.
- Add X-only layout wrappers and navigation elements to the main feed, then scope all new styling under `data-design="x"`.
- Use semantic theme tokens so the existing custom color picker continues to work.
- Do not change feed storage, post data, routing, or authentication.

## Verification
- Check the X design at desktop and mobile widths.
- Confirm post viewing, profile creation, design switching, and color controls remain functional.
- Check the preview build and browser console before completion.
