# VetPath — Implementation Log

> Tracks what has been built and how to run it. Add dated entries as work progresses. Last updated 2026-07-06.

---

## Entry — 2026-07-06 (Initial)

**What was created:**

- **Next.js app** (App Router + TypeScript + Tailwind CSS) scaffold with the 8 MVP routes:
  `/` (Landing), `/onboarding`, `/dashboard`, `/benefits`, `/goals`, `/plan`, `/profile`, `/admin`.
- **Standalone single-file demo:** `demo/vetpath-demo.html` — zero-install, double-click to open in a browser.
- **Local sample data** in `/data`: `benefits.json`, `goals.json`, `states.json`, `rules.json` (all SAMPLE data, labeled).
- **Rules engine** in `/lib`: `rulesEngine.ts`, `types.ts`, `storage.ts`, `config.ts` (contains `BRAND`).
- **Documentation** in `/docs`: this file plus PRODUCT_BRIEF, BUSINESS_PLAN, APP_ARCHITECTURE, UX_FLOW, BENEFITS_RESEARCH_NOTES, QUESTIONS_FOR_FRANK, DECISIONS_LOG, DESIGN_SYSTEM.

**Design:** Option A "Calm professional" palette (navy/gold), Inter, mobile-first, high-readability defaults.

**Boundaries baked in:** persistent demo / not-the-VA / SAMPLE-data disclaimers; non-advice boundary; accredited-VSO handoff for disability; Veterans Crisis Line (988 → 1) surfaced.

---

## Entry — 2026-07-10 (Transition Timeline tool + hero video + demo mirror complete)

- **Transition Timeline** (`/timeline`, `lib/timeline.ts`, per user spec): 4-step grouped discovery
  interview (service snapshot, destination/family, health/money, priority weighting + free-text
  notes) → deterministic plan across 7 phases (T-12→T-9 … +1yr→+2yr) × 6 focus areas; ~45
  conditional tasks; essentials-first + priority-weighted ordering; phase past/current/ahead from
  separation window; catch-up list for members inside T-12 with honest exclusions (BDD after T-90;
  TAP/SBP once out); "dates that don't forgive" register — BDD 180–90d, VGLI 240d/1yr+120d, TAP
  365-day start each re-verified against VA.gov / Military OneSource on 2026-07-10 and linked;
  upload-personalization note; closing VSO/financial/legal/medical disclaimer; print button;
  localStorage persistence with hydrate-once gate. Engine unit-tested via esbuild bundle across
  three personas (10-months-out E-7 w/ family→TX; <3-months undecided needs-income; already-out
  20-yr retiree→business). Bug found & fixed in verification: multi-select toggles computed from
  render-time state dropped same-batch clicks — now functional updates.
- **Hero video backdrop** (homepage): ambient SFL-TAP loop under an alpha navy scrim (heavier over
  the headline, lighter right), fade-in, reduced-motion/no-JS fallback to the opaque gradient.
  Found & fixed: service worker broke the second <video> on the page (Cache.put rejects 206 range
  responses) — media/range requests now bypass the SW; cache bumped to v2.
- **Demo mirror complete** (chunks 2–4 by background agents under the hardened protocol):
  relocate scoring + /updates life-event diff + 7-card tools grid + dashboard entry points
  (chunk 2); decisions[]/familyCheckpoints[] in the demo engine + Decisions card + strategy
  differentiator block + copy sweep + embedded TAP photo (chunk 3); Transition Timeline (chunk 4).
  Fresh-boot gauntlets clean; electrician parity 91% held throughout.

---

## Entry — 2026-07-10 (Trust surface + business-builder ops + PWA/app view)

Directive: think like an experienced business developer — make the site read as trusted and
professional, not "another AI-made site"; add visuals/motion/video; stand up skills and scheduled
tasks so the operation runs itself.

- **Homepage trust surface** (commit 78c9741): mission band now plays an 11.5s looping palindrome of
  U.S. Army SFL-TAP footage (DVIDS 872406, Fort Bliss, public domain — public/video/CREDITS.md),
  poster fallback + still photo under prefers-reduced-motion, defensive play() for post-hydration
  autoplay; trust bar shows LIVE counts computed from the shipped data (51 states, 259 programs)
  linking to /trust; "Watch a plan build itself" band = components/PlanDemo.tsx, a 3-act looping
  product demo (answers → % fit count-up → plan adapts to a new baby), static final frame under
  reduced motion; disclaimer callout links to /trust.
- **/trust page** ("Every number has a source"): live dataset counts, source & cadence table
  (VA.gov / state .gov / BLS OOH / O*NET / BEA RPP / HUD FMR / BLS LAUS), six operating rules,
  honest "what's still illustrative" callout.
- **Ops infrastructure**: git repo (3 commits); repo skills .claude/skills/vetpath-{verify,release,
  mirror} encode the QA gauntlet, release refresh, and hardened demo-mirror protocol; scheduled
  tasks: quarterly data re-verification (1 Jan/Apr/Jul/Oct 9am) + weekly Monday health check.
- **PWA/app view**: manifest.webmanifest + sw.js (network-first) + generated icons; 5-tab bottom
  bar (components/BottomTabs.tsx) on mobile with profile; verified at 390×844.
- **Demo mirror**: chunk 1 complete (verified data + optimizer + attribution). Chunk 2 agent was
  quota-killed mid-flight; file left WORKING with relocate data/screen + family screen live;
  finisher agent relaunched for scoreMetros, /updates (life events + diff), tools grid. Chunk 3
  (dashboard planning cards, hero/admin copy, photos) queued behind it; release refresh after.

---

## Entry — 2026-07-09/10 (Wave 2: the "Planning Engine" — five differentiators)

Strategy memo: separate from "how to use AI" tools — VetPath is the planning engine combining
benefits, location, family, career, and finances into ONE adaptive roadmap. Built by a 5-agent wave
(strict file lanes) + manager QA (killed by session limit; main session re-ran the full audit —
docs/QA-REPORT-WAVE2.md, verdict GO) + main-session integration.

- **Benefits Optimizer** (`lib/optimizer.ts`, benefits page): personalized tiering (now/check/later/
  unlikely) with plain-language reasons, timing chips (BDD 90–180-day window, Intent to File), honesty
  caps (CHAMPVA only at 100% w/ P&T caveat, no-rating caps VR&E, housing-unstable defers home loan),
  live join naming the veteran's actual state tax program. Verified federal research merged into
  sampleBenefits.json (11/11 categories with lastVerified + sources; VR&E renamed, transfer-while-
  serving, PCAFC/PGCSS split, SBA VetCert, PACT Act note).
- **Relocation Planner** (`/relocate`, `lib/relocate.ts`, 29-metro dataset): priority-weighted
  scoring (skip/nice/must), why-bullets, profile/path integration, ≤3-metro side-by-side compare,
  state-benefits join, VA-locator links. Honest: tiers labeled illustrative; schools deliberately
  score neutral rather than inventing rankings.
- **Family module** (`/family`, `lib/family.ts`, familyResources.json): household checkpoints
  (spouse licensure, school-year move timing), joint decisions (GI Bill transfer-while-serving),
  verified caregiver facts (PCAFC 70%+ w/ 10-10CG vs PGCSS), audience-filtered official resources.
- **Adaptive planning** (`/updates`, `lib/lifeEvents.ts`, `lib/planDiff.ts`): six life events →
  preview added/retired actions + benefit changes BEFORE applying; commits via existing store actions.
- **Research integration**: all 15 careers now carry BLS OOH May-2024 medians (year-labeled) +
  O*NET/BLS links (Career type formalized); assessment = 10 questions (RIASEC Conventional gap
  closed), solo/autonomy conflation fixed, DOL O*NET attribution + My Next Move for Veterans link.
- **Core integration** (main session): decisions[] + familyCheckpoints[] now generated INTO every
  gameplan (rules.ts) and rendered as a "Decisions to make" dashboard card; Tools hub gained
  Relocation/Family/Life-changed cards; dashboard gained the three planning-engine cards; hero and
  Strategy page updated with the competitive-advantage positioning; "9 questions" copy → 10.
- **QA:** all flows click-verified (optimizer tiers/timing, relocate rank+compare, life-event
  diff→apply→family lights up, 10-question pathfinder, mobile no-overflow, console clean); tsc clean.
- **Pending:** demo mirror + artifact/share refresh (in progress); print page doesn't yet show
  decisions (minor follow-up).

---

## Entry — 2026-07-08 (Motion layer + all-states data initiative)

- **Motion/creative layer shipped (app):** marching-dash route SVG with pulsing destination marker in
  the hero, drifting glow orb, floating product cards (offset rhythms), staggered scroll reveals via
  IntersectionObserver (`components/MotionFx.tsx`, `html.js` gate so nothing hides if JS fails),
  count-up stat numerals, button icon micro-motion, compass-rose watermark on the CTA band. All
  CSS-driven so `prefers-reduced-motion` disables everything. Verified in-browser; tsc clean.
  NOT yet mirrored to the demo (bundled with the states-data mirror, pending).
- **All-states real-data initiative — infrastructure done, research pending quota:**
  - Two research-fleet attempts failed: first (5×10 states) stalled on slow/blocking .gov fetches
    (watchdog kill, nothing saved); second (8×5, resilient incremental-write prompts) was killed
    instantly by the ACCOUNT SESSION LIMIT (resets 12pm America/Chicago). `data/research/` empty.
  - **Pre-wired and ready:** `data/stateBenefits.json` placeholder; `scripts/merge-states.mjs`
    merger with coverage report; `lib/data.ts` `STATE_BENEFITS`/`realStateInfo`; benefits page now
    renders real cited state data (agency link, per-program official-source links, "Verified {date}"
    chip, change-warning) with graceful per-state fallback to sample data. tsc clean.
  - **Relaunch plan persisted:** `scripts/research-runbook.md` (10 batches, resilient prompt
    template, merge/verify/mirror steps). Run it after the quota resets.
- **Design-sync answer for the user:** works from claude.ai/code (browser, already logged in) or an
  interactive `claude` terminal after `/login` — and only if `CLAUDE_CODE_OAUTH_TOKEN` isn't set in
  that environment.

---

## Entry — 2026-07-08 (Mobile hamburger nav + localhost fix + demo re-skin)

- **localhost:3000 outage fixed:** three orphaned `node` dev-server processes were holding ports
  3000/3001/3002 (TaskStop kills the npm shell but the node child can survive), so the live server was
  pushed to :3002 while a dead one 404'd on :3000. Killed all three by owning PID, restarted one clean
  server on :3000. **Ops note:** before `npm run dev`, check `Get-NetTCPConnection -LocalPort 3000` and
  kill stragglers.
- **Mobile hamburger navigation** (user-approved): at ≤920px the nav collapses to brand + hamburger +
  Aa; the menu is a full-width dropdown with 50px-tall links, active highlight, `aria-expanded`/
  `aria-controls`, icon swaps menu↔x, and auto-closes on navigation (verified at 390px: open → click
  Pathfinder → navigated with menu closed).
- **Demo re-skin to the new design system: DONE and verified.** Full CSS transplant (tokens, Fraunces,
  shadows, hairlines, eyebrows, hero, trust bar, nav + hamburger, structured footer, new landing) into
  `demo/vetpath-demo.html` — styling/chrome only, all engines/routes/state untouched. Independently
  verified: Fraunces loaded, hero + floating cards render, theme switching works (warm persisted from
  localStorage), mobile hamburger opens/auto-closes on navigation, no horizontal scroll at 390px,
  console clean except favicon 404. Agent notes: `.pad` padding fix, grid card margin fix, nav wraps
  the user chip at ~1320px exactly like the app.

---

## Entry — 2026-07-08 ("Trust & Authority" visual elevation — Fortune-500 look)

User feedback: the UI "looks too Claude-designed" and should feel like a professional Fortune-500 site.
Used the ui-ux-pro-max design intelligence (recommended pattern: "Trust & Authority"; it explicitly
flags AI-purple/pink gradients as the thing to avoid — matching the complaint).

- **Typography (biggest lever):** added **Fraunces** serif display for `h1`/`h2`, stat numbers, and the
  brand wordmark (Inter stays for body/UI/`h3`/`h4`); hero accent word is Fraunces italic gold. Loaded
  via Google Fonts in `app/layout.tsx`; exposed as `--font-display` / `--font-sans`.
- **`app/globals.css` rebuilt** as a proper design system: 3-tier shadow scale, hairline borders,
  richer token set per theme (`--ink-strong`, `--surface-2`, `--primary-800/900`, `--accent-600`,
  `--hero-glow`), interactive card hover-lift, `.eyebrow`, refined `.btn`/`.stat`/`.opt`/`.bar`/nav/
  hero/trust-bar classes. Enlarged the display type scale (h1 44→52px across text sizes).
- **Landing rebuilt** (`app/page.tsx`): enterprise hero with concentric-ring compass motif + soft gold
  glow + 3 layered floating product cards; eyebrow kickers; trust strip; "how it works" with big serif
  numerals; dedicated CTA band. New `Eyebrow` / `SectionHead` helpers in `components/ui.tsx`.
- **Nav** (`components/Nav.tsx`) → class-based with gold underline active state + brand lockup;
  **Footer** restructured with brand lockup + theme switcher.
- **Verified in-browser:** landing (desktop + 390px mobile), dashboard, pathfinder; Fraunces confirmed
  loaded/applied; warm theme re-verified with new tokens; only the benign favicon 404 in console.
- **Not yet propagated:** the standalone `demo/vetpath-demo.html` still uses the prior styling — offered
  to mirror after the user signs off on the direction.
- **Design-sync push:** still blocked — `DesignSync` needs a claude.ai `/login`, which is unavailable in
  this environment (OAuth token can't gain design scopes). Cannot push to claude.ai/design from here.

---

## Entry — 2026-07-07 (Frank coffee-chat wave: Pathfinder, tools, expanded intake)

Implements the coffee-chat notes as one coherent move: **the gameplan gets an endpoint.**

- **Pathfinder** (`/pathfinder`, `lib/pathfinder.ts`, `data/sampleTracks.json`, `data/sampleCareers.json`,
  `data/assessmentQuestions.json`): the 4 DoD tracks; two modes ("I know my path" browse, "Help me
  decide" 9-question decision engine). Deterministic, explainable scoring → decisive recommendation
  with **% fit (demo-labeled)**, why-bullets tied to the veteran's answers, runners-up, full route,
  SkillBridge callout, and location-fit guidance. "Set as my destination" re-generates the whole plan
  around the chosen career. Verified: hands-on answers → Electrician 93% / HVAC 90% / trades track.
- **Rules engine upgraded** (`lib/rules.ts`): destination headline + priority, career entry steps
  distributed across 30/60/90, track benefits merged, networking list, location tips + sample metros,
  SkillBridge flag, and an **honest disability-application prep** block (Intent to File, secondary
  conditions, buddy statements, C&P honesty, free accredited VSO, BDD window).
- **Location logic** (disability-informed): ≥60% rating → VAMC-proximity guidance; 0–50%/pending →
  CBOC reach; rural preference → CBOC + telehealth + Community Care pattern. **Rating never affects
  career fit — only the veteran's own physical-preference answer does.**
- **Resume scanner** (`/resume`, `lib/resume.ts`): client-side analysis — length, contact, sections,
  quantification, weak phrases, action verbs, first person, acronym density, 24-term military-jargon
  translator (word-boundary matched), keyword hit/missing vs target career, next steps. Verified:
  jargon-heavy sample scored 42/100 with correct fixes; fixed a hydration bug (target career now
  preselects the destination) and an OIC-inside-NCOIC false positive.
- **Smart transcript** (`/transcript`, `data/sampleCreditMap.json`): 15 sample roles across 5 branches
  → illustrative ACE-style credit tables + JST/CCAF claim steps. Verified: Army 68W → ~11 sample hours.
- **Networking hub** (`/network`, `data/sampleNetworking.json`): general/track/VA-specific/targeted
  (women + minority-veteran programs unlocked by optional demographics).
- **Tools index** (`/tools`) and nav updated (Dashboard · Pathfinder · Goals · Benefits · Tools ·
  Action plan · Profile · Strategy).
- **Dashboard**: destination card with fit % + change-path (or "find my path" CTA), SkillBridge window
  card, disability-prep card, networking card, location-fit card.
- **Intake expanded** (`data/intakeQuestions.json`, onboarding): city (text), optional sex and
  race/ethnicity with "why we ask" + prefer-not-to-say, "Add your own" on all multi questions,
  "Other → use this" on single questions, and a free-response notes box on every step.
- **Build:** `npm run build` clean — 15 routes type-checked. (Note: don't run build while dev server
  is up — they share `.next` and the dev server 404s its chunks.)
- **Demo-file parity: DONE and verified.** The full wave was ported into `demo/vetpath-demo.html`
  (all data, the three engines 1:1, five new routes, dashboard cards, intake upgrades, print
  destination line). Independently verified: identical assessment inputs produce identical outputs
  in app and demo (Electrician 93 / HVAC 90); all 14 routes registered; dashboard CTA, Pathfinder,
  and disclaimers render; console clean. Also fixed a double "(optional)" label on the sex question
  in both app JSON and demo.

---

## Entry — 2026-07-07 (Accessibility & all-ages UI/UX pass)

Goal: make the site easy to use for all ages and life stages (WCAG-minded, senior-friendly).

- **Adjustable text size:** new "Aa" control in the nav cycles Normal → Large → Extra large
  (body 17→19→21px; headings scale too). Persisted in localStorage via the store
  (`textSize` in `AppState`); driven by `--fs-*` CSS variables + `data-textsize` on `<html>`.
- **Touch targets:** buttons, intake options, selects, and chips now ≥44–48px tall; checklist
  status boxes enlarged to 32px and converted to real `<button>`s.
- **Keyboard & screen-reader access:** skip-to-content link; visible 3px focus ring on all
  interactive elements; benefits accordion header → `<button aria-expanded>`; goal cards →
  buttons; multi-select chips → `<button aria-pressed>` inside `<fieldset>/<legend>`;
  progress bars have `role="progressbar"` + labels; nav links have `aria-current` + icons;
  decorative icons `aria-hidden`.
- **Not color-alone:** selected options/chips show a ✓ mark; priority pills read "high priority".
- **Readability:** base font 16→17px, line-height 1.65, larger labels; `prefers-reduced-motion`
  respected.
- Verified in-browser (landing, onboarding, plan) with zero console errors.
- **Standalone demo mirrored:** the full pass was applied to `demo/vetpath-demo.html` too
  (Aa text-size control persisted in localStorage, skip link + `<main id="main">`, chips/goals/
  accordion/checkboxes converted to real buttons with `aria-pressed`/`aria-expanded`/labels,
  fieldset+legend question groups, ✓ selection marks, larger touch targets). Bonus fix: the demo
  router no longer scrolls to top when re-rendering the same route (mid-form selections keep
  scroll position). Verified in-browser.
- **Decisions (2026-07-07):** default text size stays Normal (17px); demo file stays maintained
  in parity with the app; design-sync will be a FULL high-fidelity sync once the user runs `/login`
  (OAuth token lacks design scopes until then).

---

## Entry — 2026-07-06 (Founder's playbook + recommendations + PDFs)

**All-in-one founder document:** created `print/vetpath-founder-playbook.html` — a single
printable working document combining the veteran experience (sample gameplan), the demo toolkit
(worksheet + facilitator guide), a **business gameplan** (Now/30/60/90/6–12-mo roadmap, build-tracks
table, decision boxes, risks), a **money gameplan** (three revenue paths, pricing, cost/revenue
models, KPIs), and a decisions/owners/action log.

**Recommendations added** throughout: a "recommendations at a glance" box; recommended picks on
entity structure (LLC/PBC now, 501(c)(3) later), monetization (hybrid: org licenses + grants,
veterans free), first data states (home state + Texas), and first pilot (Frank's meeting); a
recommended pricing ladder ($2,500 / $7,500 / $20,000 per year by org size); and a recommended,
lean **Year-1 model — ~$115k revenue vs. ~$72k cost** (~$42k if founder-built). All dollar figures
are labeled illustrative estimates to validate, not projections or guarantees.

**PDF generation:** rendered the print docs to PDF with headless Microsoft Edge
(`msedge --headless=new --no-pdf-header-footer --print-to-pdf`), preserving the print CSS. Output in
`print/`: `vetpath-founder-playbook.pdf`, `vetpath-gameplan-leavebehind.pdf`, `vetpath-worksheet.pdf`.
To regenerate after edits: re-run Edge headless print-to-pdf against each HTML file (or open the HTML
and use Ctrl+P → Save as PDF).

---

## Entry — 2026-07-06 (Interactivity pass + printable gameplans)

**Interactive simulation verified:** drove the full veteran flow in the running dev server
(localhost:3000) with a browser — created a profile ("Frank"), completed all 4 intake steps
(Transitioning · Army · Texas · goals: transition/job/home + mental-health signal), generated
the plan, and confirmed a correct personalized dashboard and printable output.

**Bug found & fixed:** the "Generate my gameplan" handler relied on a value set inside an async
`setState` updater, so it returned before the update ran — firing a false "pick a goal" alert
even when goals were selected. Refactored the onboarding finish handler to guard on the
already-committed store state and call `regen()`; removed the dead `finishIntake` from the store.

**Printable gameplan — added to BOTH app targets:**
- New in-app route `app/print/page.tsx` (+ "Print my gameplan" button on the dashboard, and in the
  standalone demo at `#/print`) — a clean one-page version of the veteran's live plan with a
  "Print / Save as PDF" button. Print CSS added to `app/globals.css` and the demo (`@page` letter,
  hides nav/footer, expands link URLs, avoids mid-section page breaks).

**Two standalone print documents** in `print/` (open in a browser → Print / Save as PDF → letter):
- `vetpath-gameplan-leavebehind.html` — a polished, filled SAMPLE gameplan to leave behind.
- `vetpath-worksheet.html` — a fillable work-through worksheet (about-you, circle-3-goals,
  30/60/90 write-in, documents, sources-to-verify) plus a **facilitator guide** (30-min agenda,
  discussion prompts, ground rules) for running the meeting.

---

## Entry — 2026-07-06 (Build verification + actual file names)

**Verified:** the standalone demo was exercised end-to-end in a real browser (landing → sample
gameplan → dashboard → live theme switch), and the Next.js app **builds cleanly** —
`npm run build` compiled all 11 routes as static content with TypeScript type-checking passing.

**Security:** bumped `next` from `14.2.5` to **`14.2.35`** (patched line) per the 2025-12-11 advisory.

**Actual file names as built** (supersedes the guessed names in the Initial entry):

- `/data`: `sampleBenefits.json`, `sampleGoals.json`, `sampleStates.json`, `sampleGameplans.json`, `intakeQuestions.json`.
- `/lib`: `types.ts`, `data.ts` (loads the JSON + `BRAND`), `rules.ts` (gameplan engine), `store.tsx` (localStorage React context).
- `/components`: `Nav.tsx`, `Footer.tsx` (incl. `ThemeSwitcher`), `ui.tsx`.
- `/app`: `layout.tsx`, `globals.css`, and `page.tsx` in `/`, `/onboarding`, `/dashboard`, `/benefits`, `/goals`, `/plan`, `/profile`, `/admin`.
- Config: `next.config.mjs` (static export via `output: "export"`), `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`.

**Backlog / future changes:**

- Replace SAMPLE benefit data with a real, cited, per-state dataset (start with 1–2 states; add last-verified dates).
- Add real auth + consent, server persistence (Postgres/Supabase), and a printable/PDF gameplan.
- Add automated tests around the rules engine; run `npm audit` and keep `next` patched.

---

## How to Run

### Option 1 — Standalone demo (no install)
1. Open the file `demo/vetpath-demo.html` in a web browser.
2. That's it — **double-click** the file (or drag it into a browser tab).

### Option 2 — Next.js app (full prototype)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open **http://localhost:3000** in your browser.

> Prototype stores the mocked profile + intake in browser `localStorage`. No password, no server, no real data.

---

## Future Changes / Backlog

| Priority | Item | Notes |
|---|---|---|
| High | Replace SAMPLE benefits with **real, cited, last-verified** data (start 1–2 states). | See `BENEFITS_RESEARCH_NOTES.md`. |
| High | Usability-test the **gameplan output** with real veterans (via Frank). | See `QUESTIONS_FOR_FRANK.md`. |
| High | Informal **legal review** of disclaimers / non-advice boundary. | Before any pilot. |
| Medium | **Real auth + consent** and cloud persistence (Postgres/Supabase). | Replaces localStorage mock. |
| Medium | **Per-state benefits matrix** and content CMS with `lastVerified` dates. | Editorial workflow. |
| Medium | Accessibility audit (contrast, keyboard nav, screen reader, 16px+ body). | Older-veteran focus. |
| Medium | Decide **monetization path** (A/B/C or hybrid) from validation. | Target ~90 days. |
| Low | Analytics for intake completion + gameplan usefulness (privacy-safe). | No personal-data selling. |
| Low | Content-review checklist enforcing the **product boundary**. | No tactical/political/militia content. |
| Low | Test **Option B / Option C** design directions via tokens. | See `DESIGN_SYSTEM.md`. |
