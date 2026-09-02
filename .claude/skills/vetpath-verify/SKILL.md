---
name: vetpath-verify
description: Run VetPath's full QA gauntlet — types, data integrity, production build, and click-through browser flows — and report PASS/FAIL per area. Use before any release, after any feature wave, or when the site "seems broken."
---

# VetPath verification gauntlet

Run these in order from the vetpath project root. Stop and report on first hard failure.

## 1. Types
`npx tsc --noEmit` — must exit 0.

## 2. Data integrity (node -e)
- data/stateBenefits.json → 51 states; every state has agency.name/url + ≥3 programs with source URLs
- data/sampleBenefits.json → 11 categories, each with lastVerified + sources[]
- data/sampleCareers.json → 15 careers, each with onetCode/onetUrl/blsUrl + year-labeled paySample
- data/relocationMetros.json → 29 metros; 28 with `official` blocks (rural-telehealth exempt)
- data/assessmentQuestions.json → 11 questions incl. ids "wins" (first, objective options) and "detail"; "pull" has multi:true max:3; people/"Mostly solo" has autonomy 0
- data/intakeQuestions.json → status step contains a "horizon" question with showIf {id:"status", value:"Active duty"} and a "More than 2 years out" option
- lib/track.ts `INTAKE_STEP_EVENTS` must equal the intakeQuestions.json step ids, in order (funnel events go
  silent on drift, and silence looks identical to "nobody reached that step")

## 3. Production build — NEVER while a dev server runs (shared .next corrupts; this caused real outages)
Kill all node dev servers on ports 3000–3002 first (`Get-NetTCPConnection` + kill by PID, plus any
`node.exe` with `next dev` in its command line), `rm -rf .next`, `npm run build` (expect all routes
static), then `rm -rf .next` and restart `npm run dev` in background; wait for 200 on /.

## 4. Browser flows (Playwright MCP; cache-bust with ?v=N; only favicon-404 is acceptable in console)
1. /admin → "Load a sample veteran & plan" → dashboard renders at the "Pick your path" journey
   stage (loadSample sets chosenPath:null BY DESIGN - no destination headline yet; that headline
   is verified in flow 6 after lock-in) + funnel CTA; Decisions card is BEHIND the "Show the
   full picture" expander (click it first)
2. /benefits → personalized tier heading ("here's what likely applies - and when") with
   Act-now/Worth-checking/Later tiers + BDD timing chip + verified Texas card (Hazlewood, Verified chip)
3. /relocate → 2 priorities to Must → matches with official-data tags → 2-metro compare table
4. /updates → New disability rating → Preview diff renders → Apply → success
5. /family → renders (empty state or checkpoints depending on familyNeeds)
6. /pathfinder → "11 quick questions"; hands-on persona ranks Electrician #1; results show O*NET
   attribution + My Next Move link + BLS data. Then close the loop: "See the full route" on the top
   match → Detail view → "Set as my destination & update my plan" → router lands on /dashboard,
   which now headlines the career (this is where flow 1's destination headline lives). Note: the
   assessment ends with an OPTIONAL free-text screen ("Show my best-fit paths" button), and answers
   persist across route resets - only the sub-view resets to intro
7. /timeline → 4-step interview (multi-selects hold ALL clicked options — regression watch) →
   plan with 7 phases, "You are here" status pill, deadline pills w/ official source links,
   catch-up card when inside T-12, closing disclaimer; "Under 3 months" persona excludes BDD
   from catch-up
8. Mobile 390×844: bottom tab bar visible with profile, scrollWidth ≤ 390 on /, /relocate, /benefits, /timeline
9. Homepage: hero slideshow cycling (5 .hero-slide divs, one .active) with PROGRESSIVE REVEAL
   (perf pass, Sep 2026): only revealed slides carry a backgroundImage - 2 at load, +1 per 5.2s
   cycle - so "all 5 have bg" is now a FAILURE, not a pass. The mission-band video (hero-loop.mp4)
   lazy-mounts via IntersectionObserver (600px out): at page top there are ZERO <video> elements
   (that's correct); scroll .mission-band into view, wait ~2s, THEN assert the video is mounted and
   playing. A stalled band video after scroll still means the service worker regressed (SW must
   bypass media/range requests)
10. Far-out persona (needs auth-disabled dev: clear NEXT_PUBLIC_SUPABASE_* in the shell env so the local
   ProfileGate opens the intake): status "Active duty" reveals the horizon question; with "More than 2 years
   out" the generated plan leads with the GI Bill transfer / Tuition Assistance / records-habit set and
   contains NO TAP and NO BDD items; switching status to "Veteran" hides the horizon question again
11. Timeline calendar: with an EAS date >24 months out, the plan prepends the long-runway items, shows
   "Add separation month to calendar" + per-phase "Add to calendar" buttons (ahead phases only), and the
   separation-month download is a valid VCALENDAR whose DTSTART is the 1st of the EAS month
12. Dashboard: "Anything change?" card links to /updates; InstallNudge renders ONLY on mobile-size
   viewports and never on desktop
13. Mirror (/profile, Phase 2): four cards render - Your shape (radar SVG with aria values after a
   pathfinder run, designed empty state before), Milestones met (checked actions with doneAt dates;
   checking an action also puts "N this month - steady" chip on the dashboard's Do-these-first heading),
   Coming up (real phase dates + calendar buttons when answers.easDate set, timeline pointer otherwise),
   Your notes (add/delete works signed-out via localStorage vetpath_journal_v1; task "Add a note" in
   TaskDetail saves with task_ref). Journal RLS: signed-in entries are owner-only in journal_entries -
   verify cross-account isolation whenever policies change.
14. Colorways (/profile Appearance): exactly TWO options - Warm (default, no data-theme attribute) and
   Harbor (sets data-theme="harbor", --primary computes #1F5D8C); choice persists across pages and
   reverts cleanly; legacy stored theme values ("professional"/"civic"/"granite") normalize to warm on
   load. The dark bands (mission/supporter/support) recolor via --band-* tokens - never hardcode those
   gradient hexes again. Semantic colors (success/danger/crisis) stay constant across themes.

### Probe pitfalls (cost real time on Sep 1, 2026 - read before writing walkers)
- The three interviews use DIFFERENT option widgets. Intake (/onboarding): most questions are
  `button.chip.selectable`, BUT the horizon question renders `button.opt` and top goals render
  `button.opt.goal`. Pathfinder + timeline interviews use `button.opt`. A walker keyed to one
  class silently no-ops on the others - and intake steps still advance on Next with questions
  unanswered, so a "successful" walk can carry empty answers (the step-5 goals gate alert is the
  only hard stop; handle the dialog).
- `.sel`-detection trap: every intake chip has class "chip selectable" - `className.includes('sel')`
  matches ALL of them. Use `aria-pressed="true"`.
- Timeline step 1 is one combined "Service snapshot" screen (branch/window/years/rank groups +
  EAS month input + MOS text input); its gate button is literally labeled "Pick your window and
  years to continue" and becomes "Next" once satisfied. Option labels use EN-DASHES ("3–6 months",
  "4–10 years") - hasText with a hyphen misses them.
- /plan shows "high priority first" - expand "Show all N tasks" BEFORE asserting an item is
  absent (a TAP/BDD-absence check against the collapsed list proves nothing).
- The separation-month ICS is a blob download: monkeypatch URL.createObjectURL before clicking,
  then fetch the captured blob URL to read VCALENDAR/DTSTART in-page.
- Mobile tab bar + app tabs need signed-in auth OR the auth-disabled dev (flow 10's env-cleared
  server) - on a normal dev with a local-only plan, no tab bar is CORRECT, not a failure.
- InstallNudge needs a synthesized beforeinstallprompt event on a mobile viewport to appear at all.

## 5. Deliverable freshness
If demo/vetpath-demo.html is newer than share/VetPath-Interactive-App.zip → flag stale share package.

Report: table of PASS/FAIL per section + one-line verdict. Fix nothing silently — list required fixes.
