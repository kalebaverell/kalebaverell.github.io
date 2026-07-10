# VetPath

**A clear gameplan for life after service.**

VetPath turns a veteran's goals, life stage, state, and status into a personalized
**30/60/90-day gameplan** — with prioritized benefit categories, an action checklist,
and links to the official sources to verify each step.

> ⚠️ **VetPath is a planning & education tool — not the VA, a law firm, or an accredited
> claims representative.** All benefit information in this prototype is **sample/demo data**.
> Eligibility must be confirmed through official sources (VA.gov, state veterans agencies,
> accredited VSOs). In crisis? Dial **988**, then press **1**.

---

## Two ways to run it

### 1. Instant demo (no install) — best for showing Frank
Open the self-contained file in any browser:

```
demo/vetpath-demo.html
```

Double-click it (or open it in a browser). It works fully offline — all screens,
the rules engine, progress tracking, and a live **A/B/C theme switcher** are built in.
This is the fastest way to review the product tomorrow.

### 2. Full Next.js app (production path)
Requires [Node.js](https://nodejs.org) 18.17+.

```bash
cd vetpath
npm install
npm run dev
```

Then open <http://localhost:3000>.

To produce a static export (hostable anywhere):

```bash
npm run build      # emits a static site to ./out
```

---

## What's inside

| Path | What it is |
|------|------------|
| `demo/vetpath-demo.html` | Zero-install interactive prototype (verified working) |
| `app/` | Next.js App Router pages (8 screens) |
| `components/` | Nav, Footer/ThemeSwitcher, shared UI |
| `lib/` | Types, data loaders, and the gameplan **rules engine** |
| `data/` | Sample JSON: benefits, goals, states, intake questions, example gameplans |
| `docs/` | Product brief, business plan, architecture, UX flow, research notes, questions for Frank, decision & implementation logs, design system |

## The 8 screens
Landing · Onboarding (mocked profile + intake) · Gameplan dashboard ·
Benefits & resources library · Goal planning · Action plan/checklist · Profile ·
Strategy (internal, for Frank & team).

## Working name & theming
The working brand name is **VetPath** (`BRAND` in `lib/data.ts` and the demo file — one place to change).
Three design directions ship as swappable themes: **Professional** (default), **Warm**, **Civic**.
Flip them live from the footer or the Strategy page.

## Safety boundary
This product is strictly for veteran life planning, benefits education, transition support,
and resource navigation. It intentionally excludes weapons, tactical training, paramilitary
or militia content, and political organizing.

See `docs/` for the full plan, and `docs/DECISIONS_LOG.md` for what we've decided so far.
