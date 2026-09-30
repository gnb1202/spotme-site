# SPOT ME v3 initial implementation contract

- Current refinement: opening title and Remi must use live home geometry, a standalone monochrome/mint-edge SVG derived from the exact delivered PNG, opacity-only Remi fade-in, and a dissolve into the stationary home. No bounce, scale animation, or curtain translation. Local only until explicitly requested otherwise.

- Latest request (2026-09-26): retain A only, typography first then centered grayscale/edge-highlighted home barbell Remi. Remove B/C selectors and playback. Local revision; deployment requires a new request.

- User-approved exception (2026-09-25): deploy opening A/B/C comparison at `/?opening=type`, `/?opening=remi`, `/?opening=outline`, with a left-side A/B/C picker on home. Black intro, existing character and real Strelka outlines; skip control allowed. Base URL does not auto-play. This explicit request authorizes Vercel deployment of the three studies, not Git push.

- Work in `D:/Github/spotme-site`; this new implementation is `v3/`. Do not return to the application repository `D:/Github/SpotMe`. Never copy an earlier site's HTML, CSS, JavaScript, images, layout, motion or deployment settings.
- User source: Figma `9gPp2ja89DZnz9q9Xr74wT`, page `0:1`, latest snapshot acquired 2026-09-25.
- Prefer the user's delivered artwork in `../스팟미_웹사이트_260925_v1/` for matching Figma artwork. Record source paths, node IDs, version and checksum. Document same-version Figma fallbacks for assets absent from the delivery. Fonts may use an exact locally supplied typeface only when the current source names that typeface.
- Freeze `designs/figma-data.json` once. Never re-fetch to make verification pass.
- No invented visible text, sections, icons, controls, rail, badges or placeholder buttons. Every visible element needs a source node identifier. Preserve all five header tabs.
- No added animations, effects, scroll snapping, drag gestures or autoplay. Preserve static source effects (stroke, blur, shadow) that are part of the actual artwork. Only source-defined controls may navigate/change source-defined states, immediately.
- Reference screenshots are QA-only and must never be served as page assets. Render text as HTML; only actual artwork/phone compositions may be image assets.
- Keep checks for exact text inventory, fresh-asset allowlist, navigation, all image slots and absence of external/old assets.
- Mimikyu: full-page reduced-motion capture, image/font settling, all nine pixel regions >=99%, overall >=99%, zero structural mismatches. Report scope and any unmet gates honestly.
- Local preview only. No Vercel deploy, Git push, repository replacement or deletion.
