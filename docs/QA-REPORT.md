# VetPath QA Report — Task #6 (Manager / QA vet)

> **RESOLUTION ADDENDUM (2026-07-09, post-report):** The single NO-GO blocker — HTTP 500 on all
> routes — was the known `.next` corruption from mixing `npm run build` with `npm run dev`. Fixed by
> killing all dev servers, `rm -rf .next out`, and a clean `npm run dev`. Re-verified in-browser:
> `/` and `/pathfinder/` return 200 and render; console has **zero errors** (favicon only);
> mobile 390px `scrollWidth` = 375 (**no overflow**); the lazy-loaded mission photo loads (1600px
> natural width) and the Pathfinder photo loads. **Verdict flips to GO.** Content workstreams were
> already PASS / PASS-WITH-NOTES and are unaffected. Remaining follow-ups: the state-benefits
> PASS-WITH-NOTES items and mirroring the new imagery + real state data into the standalone demo
> (Task #7).

**Date:** 2026-07-09
**Reviewer:** Manager / QA lead (independent verification of 5 worker deliverables)
**Method:** parsed/validated data with Node, audited every URL domain programmatically, spot-fetched sources, checked build with `npx tsc --noEmit`, attempted in-browser render at 1340×900 and 390×844 via Playwright against the running dev server.

---

## Summary table

| # | Workstream | Verdict |
|---|------------|---------|
| 1 | State benefits (51/51) | **PASS-WITH-NOTES** |
| 2 | Federal (11 categories) | **PASS** |
| 3 | Careers (15) | **PASS** |
| 4 | Assessment grounding | **PASS** |
| 5 | Design / imagery / credits | **PASS-WITH-NOTES** (data + files pass; in-browser render **BLOCKED** by #6) |
| 6 | Build health | **FAIL** — dev server returns HTTP 500 on every app route |

**Overall: NO-GO for live stakeholder demo until the dev-server 500 is cleared.** The content is in good shape; the blocker is an environment/cache failure, not a code defect (see below). One easy fix likely restores GO.

---

## 1. State benefits — PASS-WITH-NOTES

`data/stateBenefits.json` (shape: `{ _note, lastVerified: "2026-07-08", coverage, states: [...] }`).

**Verified:**
- Parses cleanly with Node.
- **51/51 jurisdictions present** (AL–WY + DC), no missing, no duplicates. `coverage.total = 51, missing = []` matches reality.
- Every state has `agency.name` + `agency.url`, and **≥3 programs** each with `name` / `category` / `blurb` / `source`. **Zero structural issues** across all 310 program+agency URLs.
- **Domain audit (all 310 URLs):** no blog/aggregator/commercial domains. Specifically checked for and found **none** of: military.com, veteran.com, hillandponton, va.org, benefits.com, nolo, investopedia, wikipedia.
- 302 of 310 URLs are `.gov` / `.mil` / `state.us`. The 8 non-`.gov` are all **legitimately official**:
  - `floridavets.org` (×5) — official FL Dept of Veterans' Affairs (whitelisted).
  - `floridarevenue.com/property/Documents/pt109.pdf` — official FL Dept of Revenue PDF (binary; domain is FL DOR's public site).
  - `www.mass.edu/.../veterans/financialaid.asp` — spot-fetched, confirmed official MA higher-ed veterans tuition-waiver page.
  - `www.nmhealth.org/.../nmsvh/` — spot-fetched, confirmed official NM Dept of Health page for the NM State Veterans Home.
- **Spot-fetched 6 sources** (AK property-tax, MA tuition waiver, NM veterans home, plus the 3 non-`.gov` above): all load and match their described program. FL DOR PDF returned as binary (couldn't text-verify via fetch) but is on the official domain.
- **8 states carry explicit "blocked/unverified" notes** (CA, CO, NH, OH, TX*, VT — HTTP 403/connection-reset on the agency's own site; URLs taken from official `.gov` search results per resilience rules; WV/PA notes are substantive tax notes, not access failures). These are transparently disclosed, which is the correct behavior. *(TX/WV/PA notes are informational, not access-blocks; count of true access-blocked states = ~6: CA, CO, NH, OH, VT + partials.)*

**Notes / non-blocking:**
- `floridarevenue.com` PDF could not be content-verified through the fetch tool (binary). Recommend a human eyeball on `pt109.pdf` before demo, though the domain is authoritative.

---

## 2. Federal — PASS

`data/research/federal-verified.json` (9 categories) + `federal-verified-gap.json` (2 categories) = **11 total**, all distinct ids:
`va-disability, va-healthcare, gi-bill, va-home-loan, vre, employment, veteran-business, mental-health-crisis, retirement-survivor, family-dependent, state-benefits`.

**Verified:**
- All 11 category ids covered.
- Each category carries `officialUrl`, `verifiedEligibility`, `verifiedSteps`, `corrections`, `sources`. Corrections are specific and sound (e.g. BDD 180–90-day filing window, three-part disability nexus framing tied to va.gov/disability/eligibility).
- **URL audit:** 82 of 85 federal URLs are `www.va.gov` / `dol.gov` / `sba.gov` / `dfas.mil` / `.va.gov` subdomains. The 3 non-`.gov` are official/authoritative: `veteranscrisisline.net` (the official Veterans Crisis Line site) and `nasdva.us` (Nat'l Assoc. of State Directors of Veterans Affairs). No commercial/aggregator domains.

---

## 3. Careers — PASS

`data/research/careers-grounding.json` — **15 careers**.

**Verified:**
- **All 15** have `onetCode` (SOC format, e.g. `15-1212.00`), `onetUrl` (onetonline.org), `blsUrl` (bls.gov/ooh/…), and `medianPay` **labeled with a year** (e.g. `"$124,910 (May 2024 median, BLS)"`). Zero missing fields.
- Each includes `outlook` and `claimChecks` (verified/source-cited).
- **BLS URL spot-check:** BLS blocks all automated fetches site-wide (HTTP 403 on both `.../information-security-analysts.htm` and `bls.gov/ooh/` homepage) — a bot-policy limitation of the fetch tool, **not** evidence of dead links. URLs follow canonical `bls.gov/ooh/<cluster>/<occupation>.htm` form with correct occupation slugs. Recommend a human click-through if 100% certainty is needed.

---

## 4. Assessment — PASS

`data/research/assessment-grounding.json` (`frameworks, questionMapping, recommendations, sources`).

**Verified:**
- Frameworks cite **onetcenter.org** and **dol.gov** (both present).
- **License caveat captured** verbatim: *"VetPath's assessment is an independent adaptation informed by these frameworks; it is NOT a licensed copy of the O*NET Interest Profiler and must never claim DOL endorsement."* `uiAttribution` string adds the required non-endorsement / O*NET® trademark language. `claimsToAvoid` (8 items) reinforces this.
- **Recommendations are actionable** — concrete weight/question edits with O*NET rationale, not vague advice. **Top 3:**
  1. `people` question — in "Mostly solo focus," drop autonomy from 2 → 0–1 (O*NET separates Social Orientation from Independence; current weight double-counts autonomy for introverts and over-routes them to entrepreneur tracks).
  2. `pull` question — add `lead: 2` to "Building a business or selling" (Enterprising interest includes leadership; otherwise entrepreneurial vets under-score on lead-heavy paths).
  3. `pull` question — add `data: 1` to "Leading teams and running operations" (ops management loads Enterprising + Conventional; keeps ops-leaders from missing logistics/PM careers).

---

## 5. Design / imagery — PASS-WITH-NOTES

`docs/DESIGN_PASS_NOTES.md`, `public/img/CREDITS.md`, 2 shipped JPGs.

**Verified (files & docs):**
- `public/img/` ships exactly 2 photos: `transition-summit-mentors.jpg`, `tap-electrical-training.jpg`. Both served **HTTP 200** as static assets and are correctly referenced in source (`app/page.tsx:152`, `app/pathfinder/page.tsx:40`).
- **CREDITS.md documents a public-domain basis + source URL for each shipped image:** both are DVIDS U.S. federal government works (17 U.S.C. § 105), each with its DVIDS source-page URL, photographer, date, and the "PUBLIC DOMAIN" license line (verified 2026-07-09). Processing (crop/resize/compress) is logged.
- **No VA/DoD seals / unit insignia / corporate logos** — explicitly stated and consistent with the documented crop that removed a branded safety poster; a third candidate (Boeing/Hiring Our Heroes branding) was deliberately dropped.
- File sizes are demo-appropriate (215 KB / 69 KB), explicit width/height (no CLS).

**NOTE / BLOCKED:**
- **In-browser render could not be verified** — the dev server returns HTTP 500 on `/` and `/pathfinder/` (see #6), so image rendering, 390px horizontal-overflow, and console-cleanliness at both viewports are **UNVERIFIED**. The design worker's own notes claim these passed on 2026-07-09 after a `.next` clear, but the server has since regressed to 500. Must re-verify after the server is fixed.

---

## 6. Build health — FAIL (blocker)

- **`npx tsc --noEmit` → exit 0.** No type errors. Source code is type-clean.
- **BUT the running dev server at http://localhost:3000 returns HTTP 500 "Internal Server Error" on every app route:**
  - `/` → 500 · `/pathfinder/` → 500 · `/tools` → 308→(500) · `/pathfinder` → 308→(500)
  - Static assets (e.g. `/img/tap-electrical-training.jpg`) → 200, so the server process is alive; only SSR/render is broken.
  - Playwright screenshot of `/` shows a blank white page reading only "Internal Server Error."
- **Root cause:** the `.next` cache is corrupted/incomplete — `build-manifest.json` (294 B) and `react-loadable-manifest.json` (2 B) are near-empty. This is the **exact failure mode `DESIGN_PASS_NOTES.md` documented earlier today** (stale `.next` serving broken hydration); it was fixed once by clearing `.next` and restarting `npm run dev`, and has regressed.
- I did **not** restart the server (out of QA scope; task warned the build can conflict). tsc passing confirms this is an environment/cache problem, not a code defect.

---

## REQUIRED FIXES (numbered)

1. **[BLOCKER] Dev server 500 on all routes** — clear the Next.js cache and restart the dev server (stop `npm run dev` / PID 42380, delete `vetpath/.next`, re-run `npm run dev`). Then re-confirm `/` and `/pathfinder/` return 200. Until this is done the app is undemoable.
2. **[BLOCKER, dependent on #1] Re-run the in-browser design verification** — at 1340×900 and 390×844, confirm both images render, no horizontal overflow at 390px, and zero console errors beyond favicon. This was impossible while the server was 500-ing.
3. **[Low] FL DOR PDF spot-check** — `data/stateBenefits.json`, FL "Veteran Homestead Property Tax Exemptions" source `floridarevenue.com/.../pt109.pdf` is authoritative-domain but could not be content-verified via the fetch tool (binary). Human eyeball recommended before demo.
4. **[Low] BLS URL human click-through** — `data/research/careers-grounding.json` BLS `.htm` links could not be auto-verified (BLS returns 403 to bots). Links are canonically formed; a quick manual click-through of 2–3 gives full confidence.

---

## Go / No-Go

**NO-GO in current state** — a stakeholder loading the site right now sees a blank "Internal Server Error" page.

**However:** all five content workstreams (state benefits, federal, careers, assessment, design assets/credits) passed independent vetting with only low-severity notes. The blocker is a stale-`.next` cache, not broken code (tsc is clean, static assets serve, source wiring is correct). **After Fix #1 + re-verifying Fix #2, this flips to GO.**
