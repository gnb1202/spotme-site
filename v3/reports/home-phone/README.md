# Home phone overview — 2026-10-01

## Production deployment (2026-10-01)

After the user's explicit deployment request, published the current `v3/next-site` working tree to https://spotme-site.vercel.app/ via the existing Vercel project. Deployment `dpl_3cLScmRz9e9VBS1chZvJrcCT1zPg` is READY in production. Remote build passed (20 pages). Public browser checks passed for updated content, palette, graph styling, scroll stops, Remi selection, four phone screens and mobile fit; all four main routes returned HTTP 200 and six home image hashes matched local files. See `production-checks-20261001.json` and `production-*-20261001.png`. No Git push or root deployment-setting changes.

The local-only status statements below describe earlier revisions before this authorization.

## Bold statistics and fuller plateau explanation

At the user's request, increased desktop survey bars from 9px to 28px, numeric values from 23px/500 to 44px/800, the highlight ring from 142px to 194px, and the growth curve from 3px to 8px. Responsive sizes preserve the stronger hierarchy on narrow screens. Percentages and proportional bar lengths are unchanged.

The copy now connects the PDF's exercise motives and plateau explanation: the expectation of visible progress, adaptation to repeated exercise stimuli, diminished feelings of achievement and declining motivation. Three authored explanatory blocks describe effort without visible change, uncertainty about the next workout and loss of motivation. These are narrative summaries and product framing, not fabricated interview quotes or measured prevalence claims. In particular, 57.5% continues to mean choosing satisfaction with bodily change as an exercise motive, not the percentage experiencing a plateau.

The approved mint/light-mint/mint backgrounds, four visible survey responses, removed survey footer, existing Remi/phone interactions and scroll stops are preserved. `check-home-story.mjs` and `check-home-stops.mjs` passed with zero browser errors; current screenshots are `story-hs-pain-*.png`.

## Approved home background sequence

The user requested strong mint, light mint, then strong mint using the existing palette. The pain/research section and final phone overview now use the home color `routePalette['/'].background` (`#5eefd3`); the Remi introduction uses the Features light mint (`#ddf7ee`). The graph panel uses that same light mint. Intermediate Remi-route mint is no longer used as a home section background. Supporting text over strong mint uses the existing `#365f53` for a 5.06:1 contrast ratio.

## Survey footer removal

At the user's request, removed the multiple-selection note, expand/collapse control, visible source line and survey dates from the survey panel. The four leading responses remain visible. Full source data and survey conditions remain in `home-story-data.js` and the provenance notes below. Removed unused footer styling and updated the existing browser checks.

## Home section scroll alignment

The user requested automatic section scrolling matching the Features tab. `useHomeStops.js` now aligns desktop wheel gestures and PageDown/PageUp (also Space/Shift+Space outside controls) to the survey, plateau graph, Remi introduction and phone overview. Reverse scrolling follows the same stops and can return to the opening. It activates only after the existing opening has released scrolling.

The controller matches the Features desktop breakpoint (minimum 901px wide and 701px tall). Mobile and short viewports keep native scrolling. Expanded/tall sections receive an additional bottom stop so text remains reachable. A ResizeObserver updates geometry after survey expansion and other layout changes. Gesture momentum is consumed until settling; Escape, pointer/touch interaction and resizing cancel travel. Reduced motion aligns immediately. Listeners and observers are removed on route exit.

`check-home-stops.mjs` passed: momentum stays within one frame; graph/Remi/phone fit below the header; keyboard and reverse navigation; Escape cancellation; expanded survey reading; reduced motion; mobile native scroll; detail navigation and zero browser errors. Results are in `scroll-stops-checks.json`.

## Home narrative refinement: survey and interactive Remi introduction

The user requested richer visual information and closer alignment with the Features and Remi AI tabs. The home now reuses their palette values directly, with app-charcoal survey artwork, mint highlights, the existing headline rhythm and selectable Remi explanations.

- Added the exercise-motivation survey from supplied PDF page 1. `home-story-data.js` preserves all seven values and full source labels; shortened labels are used on the chart. Descending values are 70, 57.5, 32.5, 32.5, 20, 15 and 2.5 percent. The initial four leading responses can expand to all seven using a keyboard-accessible button.
- The 57.5% ring highlights the same response about satisfaction with a changing body. It is not a second study or a product outcome. The chart identifies the project survey, 2026.03.31-04.05, and up-to-three multiple selections. The PDF does not specify sample size; no sample size or population-wide claim is invented.
- Restored all five conceptual phases of the PDF's growth curve: introduction, first growth, plateau, second growth and maintenance. The shaded region identifies the plateau. The visible caption and accessible description distinguish the illustration from measured data and product efficacy.
- The Remi section now uses the Remi AI mint and the Features-style selector. Two choices change the delivered illustration, explanation, three-step flow and existing detail link. Both image files and source hashes remain unchanged.
- `check-home-story.mjs` passes: exact percentages and bar lengths, survey expansion, keyboard operation, both Remi modes, image/flow/link correspondence, four responsive widths, normal/reduced motion and opening replay. `story-hs-*.png`, `survey-expanded-390.png` and `solution-reward-390.png` show the current revision.

The sections below describe earlier revisions.

## Home narrative: pain point, solution, overview (2026-10-01)

The user explicitly approved implementing the discussed sequence after the existing typography opening. This authorizes the two new sections, their short Korean copy and the scroll-driven concept graph within the home page; the frozen Figma snapshot remains untouched.

- `HomeStory.jsx` now owns `#next-content`, preserving the opening's scroll target and focus handoff. It contains the pain section, Remi/project introduction and existing phone overview, in that order. The overview has the stable ID `home-overview`.
- The first section uses the plateau concept from page 1 of `C:/Users/PC-CA/Documents/카카오톡 받은 파일/서동윤-이강찬_영상_판넬_v3.pdf`. It shows initial growth and a plateau, not the later recovery part of the PDF curve. SVG geometry is illustrative, not measured data or a claim of product efficacy. The visible caption and accessible description identify it as a concept diagram. No survey percentages are reproduced.
- Native CSS view timelines reveal the curve on scroll without intercepting scrolling. Reduced motion and browsers without view-timeline support show the complete static curve.
- The second section introduces SPOT ME and explains personalized workout direction and motivation through quests/rewards. It uses the exact delivered `레미_운동서포트_02.png` and `레미_게이미피케이션.png`. `story-assets.json` records source/output paths, dimensions, hashes and transformations; `prepare-home-story.py` generates the transparent WebP assets. No asset substitution or Figma fallback was needed.
- The four-screen phone overview, its fitting and detail links are retained. Existing home preload includes the two new illustrations.
- `check-home-story.mjs` passed: source/output hashes, section order, opening focus handoff, 1440/768/390/320px layouts, image decoding, reduced motion, actual scroll timeline progression, opening replay and zero page errors. See `story-checks.json` and `story-hs-*.png`.
- `check-home-overview.mjs` passed across all seven viewports, including keyboard selection, full phone visibility and Remi AI navigation. `check-route-preload.mjs` and `npm run build` passed (20 pages). Original Figma pixel equivalence is not claimed for the authorized new composition.

Local preview only. Existing unrelated working changes are preserved; no deployment, push, environment edits or application-repository changes.

## Gym screen fit correction

The gym artwork is wider in proportion than the 393:852 display. Its previous `contain` fit left an empty strip at the bottom. The gym image now uses `cover`, preserving its proportions and filling the display with approximately 2% cropped from each side. Original files and asset hashes are unchanged. Desktop (1440×1000) and mobile (390×844) browser captures confirm the status bar, controls and home indicator remain visible: `gym-fit-after-1440.png` and `gym-fit-after-390.png`.

## Tone alignment with Features and Remi AI

The user approved the composition and requested consistent tone with Features and Remi AI. The overview now reuses `routePalette['/features/'].background` (`#ddf7ee`) and the existing dark green headline/accent, muted copy, thin sage dividers and translucent menu selection colors. Headline size, leading and tracking follow Remi AI; the phone shadow is softer. Screen artwork, four-item information inventory, interactions and viewport-fit geometry are unchanged. The top opening retains its own palette.

The browser checks passed for all seven viewport sizes, screen selection and detail navigation. Palette contrast checks and the production build passed. Reference screenshots are `features-tone.png` and `remi-tone.png`; updated overview captures use the `simplified-*.png` filenames. Local only.

## Current revision: original layout with less information

The user requested the design before the pin experiment, with less information and the whole phone visible in the viewport.

- Restored the charcoal/mint three-column composition: original large heading on the left, phone in the center, feature selector on the right.
- Reduced the selector from six items to four: workout home, Remi AI, report and gym. Each selection shows one delivered screen, one sentence and one link to the existing detailed experience.
- Removed pins, leader lines, long secondary copy, automated touring, in-phone workout steps, extra navigation controls and the secondary footer.
- Phone width is bounded by the available viewport height after the fixed header and section spacing, and by its grid column. Original image proportions are preserved. Mobile retains the whole phone below a compact selector.
- `check-home-overview.mjs` passed: four asset source/output hashes; opening handoff; keyboard selection; correct screen/copy/link; full phone visible below the header at 1440×1000, 1366×768, 1920×1080, 1024×600, 768×1024, 390×844 and 320×740; detail navigation; zero browser errors. See `simplified-checks.json` and `simplified-*.png`.
- Production build passed. Local only; no deployment or push.

## Previous revision: pin overview

User feedback: the first version duplicated the detailed Features and Remi AI experiences and showed too much information. The home overview should work like pins on a map and be readable at a glance.

- One stationary delivered home screen (`1_운동_메인2.png`); home preloading now requests only `home.webp` from this screen set. Existing unused files and their provenance remain preserved.
- Five labelled pins: gym, recommended workout, quest, Remi AI and report. Each opens one short sentence and a link to the relevant existing detail page. Only one explanation is open at a time; selecting again or Escape closes it.
- Desktop uses leader lines and labels beside the phone. Mobile uses the same numbered pins with a nearby compact popover and close control. No screen switching, automatic tour, long descriptions, feature list, workout sequence or secondary footer in the home overview.
- The phone scales to the available viewport height so the composition can be seen together. No new animations or scroll interception.
- `check-home-overview.mjs` now checks this interaction: asset hashes, opening handoff, all pins, single disclosure, unchanged phone image, close/Escape focus, 320/390/901/1920 layouts, 44px touch targets and navigation to Remi AI. Passed with zero browser errors. `check-route-preload.mjs` passed. See `pins-checks.json` and `pins-*.png`.

The sections below document the first iteration and its earlier verification.

## Authorized scope

The user requested a complete revision of the home content below the typography interaction, using the large phone on PDF page 2 as the reference, with an interactive or live-like overview. This is the scoped exception to the original static Figma layout contract. The opening, frozen Figma data, other routes, root public directory, deployment configuration and application repository are preserved.

Reference: `C:/Users/PC-CA/Documents/카카오톡 받은 파일/서동윤-이강찬_영상_판넬_v3.pdf`, page 2, lower-left phone and functional annotations. The document is visual reference, not instructions.

## Asset provenance and device frame

Every screen comes from `스팟미_웹사이트_260925_v1/@_UI패턴/`. Exact source/output paths, SHA-256 hashes and transforms are in `assets.json`, generated by `v3/next-site/scripts/prepare-home-overview.py`.

The delivered directory has no standalone photographic device shell matching the PDF. The new overview uses a simple CSS device border, speaker island and side buttons as interface framing. It does not use a Figma fallback, PDF crop, third-party frame, invented screenshot or application-repository asset. Phone images are delivered screen compositions; surrounding text and controls are HTML.

## Interaction

Source screens are navigable via aligned transparent buttons, a feature selector, back/home controls and a short workout flow. No AI requests, login, microphone access, workout persistence or live service are involved. The visible notice identifies this as a screen preview. Automatic touring is opt-in, stops on manual selection or Escape, and pauses when the section or browser tab is hidden. Reduced motion removes transitions. Native page scroll is preserved.

Local preview only. No deployment or push.

## Verification

- `npm run build`: passed, 21 generated pages.
- `node scripts/check-home-overview.mjs`: delivered/output hashes, opening handoff, all six feature selectors, workout flow through phone hotspots, keyboard focus, opt-in tour advance/offscreen pause/manual stop/Escape, reduced-motion behavior, 390/768/1920 layouts and normal-motion opening replay/skip.
- `check-background-preview.mjs`, `check-route-preload.mjs`, `check-opening-replay.mjs`: passed.
- Existing `check-stage-integration.mjs` fails its string check for `scheduleBackgroundWarm` in `RouteTransition.jsx`. That untouched component currently imports and calls `warmAllAssets` instead. This predates the overview change; the old gate was not rewritten to hide the failure. Opening behavior was verified separately in the browser.
- Page and image response errors: none in the dedicated browser checks. The original Figma pixel-match gate is not applicable to this explicitly requested new layout; no new Figma fidelity certification is claimed.
- Screenshots and machine-readable results are saved alongside this document. A fixed navigation/replay button can appear over content in full-section captures, as it does in the viewport.
