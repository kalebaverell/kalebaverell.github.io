# Design pass notes — imagery & graphics (Task #5, 2026-07-09)

Goal: add professional imagery/graphics so VetPath reads like a trusted, Fortune-500-grade
site — calm and credible, no military clichés, no flag-waving, no stock-photo cheese —
without breaking the existing "Trust & Authority" system (Fraunces + Inter, navy/gold,
hairlines, token-driven themes, reduced-motion support).

---

## What was added, where, and why

### 1. Landing "mission band" (`app/page.tsx` + `app/globals.css`)
A full-bleed photographic band between "How it works" and the disclaimer callout:
a public-domain photo of volunteer mentors reviewing a soldier's resume at a transition
summit, under a theme-aware navy scrim (`color-mix` on `--primary-900`, so warm/civic
themes recolor it automatically). Copy: eyebrow "On the ground" + Fraunces headline
"Nobody figures this out alone." + one human sentence. A small photo credit sits
bottom-right. The band gives the page one moment of documentary proof — real people
doing the thing the product promises — which is the strongest trust signal a landing
page can carry.

- `<img>` has explicit `width={1600} height={1064}`, `loading="lazy"` (below the fold),
  meaningful alt text; it is absolutely positioned inside a fixed-padding band, so zero CLS.
- Content uses the existing `data-reveal` scroll-reveal (JS-gated, reduced-motion safe).

### 2. Pathfinder intro photo (`app/pathfinder/page.tsx`)
The intro header became a responsive split (`.intro-split`, stacks under 860px): text left,
a framed photo right (`.photo-frame` — radius-lg, hairline border, shadow-md) of a Fort
Bliss soldier wiring a training panel in a TAP trades program, with an in-frame caption and
credit. It grounds the "pick your next mission" abstraction in a concrete outcome. Also
added the design-system eyebrow ("Decision engine") the page was missing. Explicit
`width={880} height={708}`; above the fold, so not lazy-loaded.

### 3. Tools index card art (`app/tools/page.tsx` + `components/ui.tsx`)
New `CardArt` component: quiet line-art corner motifs (compass rings, document, layered
stack, network nodes) at 8% opacity in brand navy, bleeding off the top-right corner of
each tool card. Same visual family as the hero's compass/route motifs — texture, not
decoration. `aria-hidden`, `pointer-events:none`, pure SVG (no requests).

### 4. Small polish
- Pathfinder intro gained the standard eyebrow treatment (consistency with landing).
- Nothing else was redesigned.

## Image sources & license basis (full detail in `public/img/CREDITS.md`)

U.S. federal government works are public domain (17 U.S.C. § 105). Both DVIDS source
pages were fetched on 2026-07-09 and carry DVIDS' explicit **"PUBLIC DOMAIN"** label:

| File | Source | License line |
|---|---|---|
| `transition-summit-mentors.jpg` (1600×1064, 215 KB) | https://www.dvidshub.net/image/2953284 — "Transition Summit helps military job seekers", Christine Cabalo, 10.19.2016 | Page states "PUBLIC DOMAIN" |
| `tap-electrical-training.jpg` (880×708, 69 KB) | https://www.dvidshub.net/image/6897038 — "TAP in: Bliss Transition Assistance Program…", David Poe, 10.14.2021 | Page states "PUBLIC DOMAIN" |

Handling of the prior attempt's unverified downloads:
- `dvids-6897038-raw.jpg` — license verified ✓, then **cropped** (a third-party branded
  safety poster was removed from frame), resized/compressed, and renamed as above.
- `dvids-8518024-raw.jpg` — license page also says PUBLIC DOMAIN, but the photo is
  dominated by Boeing / Hiring Our Heroes branding (endorsement risk + trade-show look).
  **Deleted on taste/endorsement grounds.**

No VA/DoD seals, unit insignia, or corporate logos appear in the shipped crops.

## Non-negotiables check

- **A11y:** meaningful alt text on both photos; decorative SVGs `aria-hidden`; captions/credits
  are white on dark gradient scrims (contrast-safe); no text baked into images.
- **Performance:** both images compressed well under 400 KB (215 KB / 69 KB), explicit
  width/height everywhere (no layout shift), lazy loading below the fold, corner art is
  inline SVG (zero requests).
- **Reduced motion:** no new animations; the mission band's reveal rides the existing
  JS-gated `data-reveal` system, which force-reveals under `prefers-reduced-motion`.
- **Themes:** the band scrim is built from `--primary-900` via `color-mix`, so warm/civic
  theme swaps recolor it correctly.

## Verification results (2026-07-09)

- `npx tsc --noEmit` — passes (exit 0).
- Landing, Pathfinder, Tools rendered at **1320×900** and **390×844** via Playwright:
  all render correctly, no horizontal overflow at 390px, **zero console errors** on all
  three pages after the dev-server fix below.
- **Dev-server note:** on first verification the running dev server was serving 404s for
  `_next/static/chunks/main-app.js` / `app-pages-internals.js` (corrupted/stale `.next`
  cache from a long-running session — hydration was silently broken app-wide, predating
  this pass). Restarted `npm run dev` with a cleared `.next`; hydration and all pages
  then verified clean.

## Deliberately NOT done

- **No section-divider graphic** — the mission band already provides the page's visual
  break; a second graphic would be decoration for its own sake.
- **No imagery on Dashboard/Benefits/Plan or other utility pages** — those are working
  surfaces; photos there would slow users down, not build trust.
- **No third photo** (family/handshake) — candidates found were either mask-era, blurry,
  or logo-heavy (Boeing, Lincoln Electric, DeWalt…). Two strong images beat four weak ones.
- **No `next/image`** — plain `<img>` with explicit dimensions keeps the static-export
  behavior predictable and avoids adding optimizer config; both files are already
  web-sized and compressed.
- **No copy or layout redesigns** beyond the two placements and the missing eyebrow.
