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

## 3. Production build — NEVER while a dev server runs (shared .next corrupts; this caused real outages)
Kill all node dev servers on ports 3000–3002 first (`Get-NetTCPConnection` + kill by PID, plus any
`node.exe` with `next dev` in its command line), `rm -rf .next`, `npm run build` (expect all routes
static), then `rm -rf .next` and restart `npm run dev` in background; wait for 200 on /.

## 4. Browser flows (Playwright MCP; cache-bust with ?v=N; only favicon-404 is acceptable in console)
1. /admin → "Load a sample veteran & plan" → dashboard renders with destination headline + funnel
   CTA; Decisions card is BEHIND the "Show the full picture" expander (click it first)
2. /benefits → personalized tier heading ("here's what likely applies - and when") with
   Act-now/Worth-checking/Later tiers + BDD timing chip + verified Texas card (Hazlewood, Verified chip)
3. /relocate → 2 priorities to Must → matches with official-data tags → 2-metro compare table
4. /updates → New disability rating → Preview diff renders → Apply → success
5. /family → renders (empty state or checkpoints depending on familyNeeds)
6. /pathfinder → "11 quick questions"; results show attribution + My Next Move link
7. /timeline → 4-step interview (multi-selects hold ALL clicked options — regression watch) →
   plan with 7 phases, "You are here" status pill, deadline pills w/ official source links,
   catch-up card when inside T-12, closing disclaimer; "Under 3 months" persona excludes BDD
   from catch-up
8. Mobile 390×844: bottom tab bar visible with profile, scrollWidth ≤ 390 on /, /relocate, /benefits, /timeline
9. Homepage: mission-band video (hero-loop.mp4) playing + hero slideshow cycling (5 slides, one .active) -
   the band video is the only <video> since the redesign (SW must bypass media/range requests - a stalled
   band video means the service worker regressed)
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

## 5. Deliverable freshness
If demo/vetpath-demo.html is newer than share/VetPath-Interactive-App.zip → flag stale share package.

Report: table of PASS/FAIL per section + one-line verdict. Fix nothing silently — list required fixes.
