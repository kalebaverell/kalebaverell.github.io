# VetPath — Decisions Log

> A running log of product, design, and business decisions. Add new rows on top of the "Ongoing additions" section as decisions are made. Last updated 2026-07-06.

**Columns:** Date | Decision | Reasoning | Open follow-up

---

## Locked Decisions (Seeded)

| Date | Decision | Reasoning | Open follow-up |
|---|---|---|---|
| 2026-07-06 | **Brand/working name = "VetPath"**, stored as a single config value `BRAND`. | Clear, veteran-focused, non-clichéd; single token makes renaming trivial. | Confirm name availability; test with veterans; check domain/trademark before public launch. |
| 2026-07-06 | **Design = Option A "Calm professional"** (navy #16324D, gold #C8863C, slate/muted text, light bg, Inter). | Credible, dashboard-like, high readability for older veterans; avoids aggressive patriotic clichés. | Validate readability with older veterans; keep Option B/C tokens ready to test (see `DESIGN_SYSTEM.md`). |
| 2026-07-06 | **Tech = Next.js (App Router) + TypeScript + Tailwind**, plus a **standalone single-file HTML demo** at `/demo/vetpath-demo.html`. | Clean component structure and room to grow; zero-install demo for live meetings. | Confirm hosting; plan backend migration (Postgres/Supabase). |
| 2026-07-06 | **Audience = transition-forward** (0–24 months from separation FIRST), serving all veterans/families. | Transitioning members have the sharpest, most time-bound need; broad enough to serve everyone. | Confirm with Frank; validate the intake branching per segment. |
| 2026-07-06 | **Light mocked profile** (first name + email in localStorage, no password) before onboarding. | Lets us save a plan on-device without building real auth for a prototype. | Design real auth + consent for v1. |
| 2026-07-06 | **Present all three monetization paths** (A mission-first B2B2C, B lean commercial/VC, C nonprofit/grant). | Keep options open until validation; enables a real founder conversation. | Choose primary/hybrid path after validation (target ~90 days). |
| 2026-07-06 | **Sample data only** — all benefit data labeled SAMPLE; no eligibility guarantees; always verify at official sources. | Legal/ethical safety; product is education, not the VA. | Build real, cited, last-verified benefits dataset for v1 (start 1–2 states). |
| 2026-07-06 | **Hard product boundary:** veteran life planning/benefits/transition/resources only — no weapons, tactical, paramilitary/militia, political, or extremist content. | Keep the product safe, credible, and on-mission. | Add boundary to content-review checklist. |
| 2026-07-06 | **Non-advice boundary:** no legal/medical/financial advice; careful non-legal disability guidance with warm handoff to accredited VSOs. | Reduces liability; routes veterans to proper, free accredited help. | Informal legal review of disclaimers before any pilot. |
| 2026-07-06 | **MVP = 8 screens** (Landing, Mocked profile + Onboarding, Gameplan Dashboard, Benefits Library, Goal Planning, Action Plan/Checklist, Profile, Admin/Strategy). | Focused scope that delivers the core "info → personalized plan" value. | Prioritize build order; usability-test the gameplan output. |

---

## Ongoing Additions

_Add new decisions below, newest first._

| Date | Decision | Reasoning | Open follow-up |
|---|---|---|---|
| 2026-07-09 | **Positioning locked: VetPath is the PLANNING ENGINE**, not an information tool or AI-education course — one adaptive roadmap combining benefits, location, family, career, and finances. Five differentiators shipped: benefits optimization (personalized tiers + timing), relocation planning (29-metro compare), family-centered decisions (household checkpoints), adaptive planning (life events → previewed plan diffs), decision-grade next steps (decisions[] in every gameplan). | Kaleb's competitive memo: AI Ready Vet teaches veterans to USE AI; we keep families on track as life evolves. Deterministic + explainable engines preserve the trust boundary. | Validate the five differentiators with Frank's veterans; relocation data needs cited sources for cost/safety tiers in v1; print page should include decisions. |
| 2026-07-07 | **Pathfinder = core product spine** (from Frank coffee chat): the 4 DoD tracks (Employment / Education / Trades / Entrepreneur) + a 9-question decision-engine assessment → decisive career recommendation with **% fit (demo-labeled)** → the gameplan re-routes around that destination. | Frank: "the action plan is useless without an endpoint." SMACK-style decision tool: detailed inputs in, confident recommendation + route out. Serves both undecided and decided veterans (direct-pick mode). | Validate fit-score weights with real veterans; expand career library beyond 15 sample paths. |
| 2026-07-07 | **Disability % informs location & benefits only — never career fit.** Higher ratings drive VA-facility-proximity guidance (VAMC ≤30–45min, CBOC+telehealth for rural); only the veteran's own physical-preference answer affects career scoring. | Decisive recommendations must never be ableist; rating ≠ capability. Location was Frank's actual ask. | Real facility-distance data (VA facility API) in v1. |
| 2026-07-07 | **Disability application guidance = honest maximization, education-only** (Intent to File, document all + secondary conditions, buddy statements, C&P honesty, BDD window, free accredited VSO). | Frank asked for "best apply to get the most benefit"; we deliver it WITHOUT claim-shark coaching — keeps trust + legal boundary from the competitive analysis. | Informal legal review of the exact wording. |
| 2026-07-07 | **New tools shipped as sample-logic demos:** resume scanner (client-side rules: jargon translation, quantification, keywords per path), smart transcript (JST/CCAF + illustrative ACE credit samples), networking hub (tailored by track + optional demographics), SkillBridge surfaced for transitioning members. | Frank's notes; all deterministic and explainable, no APIs, nothing leaves the browser. | Real ACE/JST dataset licensing; consider O*NET crosswalk API; resume parser for file upload. |
| 2026-07-07 | **Intake expanded:** city, optional sex & race/ethnicity with "why we ask" + prefer-not-to-say (unlock women/minority-veteran programs), free-text "add your own" on every question, per-step open notes. | Frank: boxes must allow tailored responses; demographics only if they DO something for the veteran and stay optional. | Watch trust reaction in veteran testing; never require demographics. |
| 2026-07-07 | Both app AND standalone demo stay in parity for this wave. | User decision. | Demo mirror in progress — verify before next Frank demo. |
