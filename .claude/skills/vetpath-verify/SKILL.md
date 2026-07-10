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
- data/assessmentQuestions.json → 10 questions incl. id "detail"; people/"Mostly solo" has autonomy 0

## 3. Production build — NEVER while a dev server runs (shared .next corrupts; this caused real outages)
Kill all node dev servers on ports 3000–3002 first (`Get-NetTCPConnection` + kill by PID, plus any
`node.exe` with `next dev` in its command line), `rm -rf .next`, `npm run build` (expect all routes
static), then `rm -rf .next` and restart `npm run dev` in background; wait for 200 on /.

## 4. Browser flows (Playwright MCP; cache-bust with ?v=N; only favicon-404 is acceptable in console)
1. /admin → "Load a sample veteran & plan" → dashboard renders with destination or CTA + Decisions card
2. /benefits → "Optimized for you" tiers + BDD timing chip + verified Texas card (Hazlewood, Verified chip)
3. /relocate → 2 priorities to Must → matches with official-data tags → 2-metro compare table
4. /updates → New disability rating → Preview diff renders → Apply → success
5. /family → renders (empty state or checkpoints depending on familyNeeds)
6. /pathfinder → "10 quick questions"; results show attribution + My Next Move link
7. Mobile 390×844: bottom tab bar visible with profile, scrollWidth ≤ 390 on /, /relocate, /benefits

## 5. Deliverable freshness
If demo/vetpath-demo.html is newer than share/VetPath-Interactive-App.zip → flag stale share package.

Report: table of PASS/FAIL per section + one-line verdict. Fix nothing silently — list required fixes.
