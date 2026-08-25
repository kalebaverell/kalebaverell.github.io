# The Return Loop - VetPath retention build program

*Drafted 2026-08-25 from Frank's product feedback + usage data. Owner: Kaleb (build handled in-session). This is the working spec - each phase ships independently and the doc is updated as items land.*

## The thesis

Frank's first bullet is the whole problem: **"Easy to get into, but didn't leave me wanting more."** VetPath is a great single-session tool - a veteran builds a plan, feels clarity, and leaves. Retention means completing three return loops the product already has bones for:

1. **Progress loop** - I did something; I want to log it and see movement accumulate.
2. **Time loop** - a date that matters to me is approaching; the product reaches out.
3. **Change loop** - my life changed; the plan should change with me.

Every feature below serves at least one loop. Nothing ships that only serves novelty.

## Roadmap at a glance

| Phase | Name | Contents | Infra needed |
|---|---|---|---|
| 1 | Respect the Runway | Horizon-aware sequencing, add-to-calendar, PWA nudge, life-change nudge, retention analytics | None - all static |
| 2 | The Mirror | Me Dashboard, journal + task notes, mission log v1 | One Supabase migration |
| 3 | The Loop | T-minus check-in email, verification-refresh email, notification prefs + unsubscribe | Resend domain + edge function + cron |
| 4 | Yours | Themes, mission-log recap, dark-mode exploration | None |

Order matters: Phase 1 fixes trust (a mis-sequenced checklist poisons everything downstream), Phase 2 builds the surface people return TO, Phase 3 builds the engine that brings them back, Phase 4 is personalization polish.

---

## Phase 1 - Respect the Runway (static-only, ships first)

### 1.1 Horizon-aware sequencing
**Frank's #2, and it's a trust bug.** A Marine six years out sees TAP/TRS at the top of "Do these first" - one generic item makes the whole list feel generic.
- Add a service-horizon question to the intake for still-serving users: `0-3 months / 3-12 months / 1-2 years / 2+ years` (the timeline interview already captures a version of this - unify the vocabulary so one answer feeds both).
- Plan ordering (lib/optimizer.ts + the dashboard "Do these first" source): gate TAP/TRS/SkillBridge-timing items to inside 24 months; for the 2+ years cohort surface the long-runway set instead:
  - **Post-9/11 GI Bill transfer to spouse/child** - must be elected while still serving, generally 6+ years in with a 4-year commitment. The single most expensive thing far-out members miss. Cited to va.gov.
  - Tuition Assistance while serving; records hygiene (start the medical paper trail now); credentialing (COOL) mapped to the pathfinder result.
- Timeline tool: add the same 2+ years entry so it renders a long-runway pre-phase rather than compressing to T-12.
- **Done when:** a 2+ years persona sees zero TAP-first items, sees GI Bill transfer, and the gauntlet gains this persona as a permanent check.

### 1.2 Add to calendar (.ics)
**Frank's accountability idea, phase one - no backend needed.** VetPath's name lands inside the app they open every day.
- New `lib/ics.ts`: client-side VEVENT generation (Blob + anchor download - test the iOS Safari path specifically). Event = task title, notes with the official source URL, computed deadline date. Only dated items get the button - never invent a date.
- Buttons on: timeline deadline pills, dated plan tasks, catch-up items.
- **Done when:** a timeline deadline downloads a valid .ics that opens in Google Calendar, Outlook, and iOS Calendar.

### 1.3 PWA home-screen nudge
Half the traffic is mobile and iOS-heavy; the site is already installable. A browser tab becomes an app icon they see daily - the cheapest repeat-use lever available.
- One-time dismissible card on the dashboard after a plan exists: Android/Chrome uses the `beforeinstallprompt` event; iOS Safari has no prompt API, so show the two-step "Share → Add to Home Screen" hint with the icons.
- Persist dismissal in localStorage; never show twice.
- **Done when:** shows once on mobile post-plan, installs cleanly on Android, instructions render on iOS, never reappears after dismissal.

### 1.4 Life-change nudge (change loop, nearly free)
The /updates tool works and nobody finds it. Add a quiet dashboard card: "Anything change? New rating, family, move, job - your plan re-routes in one minute." → /updates. Rotate placement below the fold; never modal, never pushy.

### 1.5 Retention analytics events
Can't steer what we can't see. GoatCounter supports custom event hits - fire on: plan built, action checked, journal entry (Phase 2), calendar export, install-nudge accepted, updates applied. Zero PII, consistent with the no-pixels stance.
- **Done when:** events visible in GoatCounter and a baseline week is captured before Phase 2 ships.

---

## Phase 2 - The Mirror (the surface people return to)

### 2.1 Me Dashboard
**Frank's radar-chart idea - and the data already exists.** The pathfinder scores autonomy, people, structure, physicality, and pace per user; those weights render nothing today.
- New section on /profile (or a /me route if it earns it): a single reflective page - checklists are for doing, mirrors are for returning.
  - **Priorities radar** - hand-rolled SVG from the assessment weights (no chart library; 5-6 axes; honest label: "from your own answers").
  - **Milestones met** - actions completed, with dates (needs 2.3's timestamps).
  - **Next three dates** - from the timeline, each with its .ics button.
  - **Recent journal lines** - tail of 2.2, linking into the journal.
- Respects text-size system, reduced motion, and prints cleanly (it's the page a spouse gets shown).
- **Done when:** a sample veteran's radar matches their answers, and the page renders complete with zero journal entries (empty states designed, not defaulted).

### 2.2 Journal + per-task notes
**Frank's reflective journal.** His email-myself-reminders habit is the behavior to capture, and entries feed the Me Dashboard.
- Supabase migration: `journal_entries (id uuid pk, user_id uuid refs auth.users, body text, task_id text null, created_at timestamptz)` with owner-only RLS (all four verbs), mirroring the profiles policies. Signed-out users get a localStorage fallback that imports on sign-in - same pattern the plan itself uses.
- UI: free-standing entries on the Me Dashboard + a small "add a note" affordance inside TaskDetail so thoughts attach to the task that raised them.
- Privacy promise holds: visible only to the owner, delete anytime, plain-language note about what's stored.
- **Done when:** entry survives sign-out/sign-in round trip, RLS verified (one user cannot read another's rows - test with two accounts), delete works.

### 2.3 Mission log v1 (gamification in this brand's voice)
**Frank's Duolingo point, minus the parts that would insult this audience.** Badges and confetti clash with "we don't patronize you" - momentum framed in military clothes doesn't.
- Store a timestamp when an action is checked (extend the store shape; migrate old boolean state on load).
- Dashboard momentum line: "3 actions this month - steady." Weekly streaks, not daily (daily = nagging).
- Explicit tone guardrail, written into the code comments: **encourage, never shame.** No guilt-trip notifications, ever - this audience includes people in genuinely hard seasons, and the crisis line is in the footer for a reason.
- **Done when:** checking an action records when, the momentum line renders from real data, and nothing anywhere scolds.

---

## Phase 3 - The Loop (the retention engine)

### 3.0 Infrastructure (prerequisites, split by hands)
**Kaleb's steps (credentials/DNS - never mine):**
1. Verify vetpathusa.com in Resend (SPF + DKIM DNS records at the domain host).
2. Add the Resend API key as a Supabase Edge Function secret (dashboard → Edge Functions → secrets). The key never appears in chat or the repo.

**Build steps (mine):**
3. Notification preferences: extend profiles with `prefs jsonb` (`{tminus: bool, verification: bool}`) defaulting to the existing `marketing_opt_in`; a preferences block on /profile; a public unsubscribe edge function endpoint (tokened link, one click, no login required - basic email-law hygiene).
4. Edge function `send-checkins` + `pg_cron` monthly schedule: query opted-in profiles, compute each user's timeline phase from their saved plan, send only on a phase transition month.

### 3.1 T-minus check-in (monthly)
The most natural recurring email this product can send: "You just entered T-6. Two windows open this month" - with the two actual items and their official sources, and one link back to the dashboard. Short, cited, respectful.

### 3.2 Verification-refresh note (quarterly)
Trust-flavored retention nobody else has: "3 of Texas's programs were re-verified this month - your plan reflects the current rules." Feeds from the lastVerified dates already in the data.
- **Done when (both):** sends land in a real inbox with working unsubscribe, only to opted-in users, and Resend's dashboard confirms volume stays inside the free tier (trivial at current scale).

---

## Phase 4 - Yours (personalization polish)

### 4.1 Themes
**Frank: "Vets have had green thrust on them for years enough already lol."** Cheap because the whole palette is CSS custom properties - and the demo once had a theme system, so the [data-theme] plumbing has precedent.
- Three curated colorways, WCAG-checked per theme: **Warm** (current, default), **Harbor** (deep navy + steel + cream), **Granite** (warm gray + muted gold). Scrims and bands recolor automatically because they derive from tokens.
- Picker on /profile next to the text-size control; persists like text size (localStorage + profile jsonb for signed-in).
- Marketing pages stay brand-green for logged-out visitors; a chosen theme follows the user everywhere once set.
- **Ships preview-first** - screenshots of all three themes across homepage, dashboard, and one tool page before anything deploys.

### 4.2 Mission-log recap
Quarterly "how far you've come" panel on the Me Dashboard (client-side computed): actions done, phases crossed, days of momentum. Pairs with a T-minus email mention when Phase 3 exists.

### 4.3 Dark mode (stretch, explicitly optional)
Harbor-at-night as a fourth theme using `prefers-color-scheme` detection. Big QA surface (every photo, scrim, and chip) - only after 4.1 proves theme demand via analytics.

---

## Additional alterations (beyond the brainstorm)

- **Icon discipline:** every new ti-* glyph must exist in public/fonts/tabler-icons.css (144-glyph subset) - check before designing around an icon.
- **Store migration safety:** any state-shape change (2.3 timestamps, theme prefs) ships with backward-compatible loading (`Object.assign(fresh(), saved)` pattern) so no existing user's plan breaks.
- **Gauntlet grows with each phase:** long-runway persona (1.1), .ics validity (1.2), journal RLS round-trip (2.2), per-theme contrast (4.1). Spec updated the day the feature lands, not later.
- **Demo mirror milestones:** after Phase 2 and Phase 4, run the mirror protocol so the share package shows the current product (journal mirrors UI-only with local storage; no cloud in the demo).
- **FTAP tester loop:** whatever ships first, Frank's Camp Pendleton cohort is the test bed - young enlisted are the weakest-retention segment and his direct line to them is an unfair advantage. Round-3 tester message piggybacks Phase 1.
- **Bundle watch:** the radar, ics, and journal are all hand-rolled - no new dependencies. Keep first-load JS flat; check the build output line each phase.
- **Copy integrity:** every new claim cites its source or doesn't ship; no invented numbers in emails, events, or empty states. Same rule as the rest of the site.

## Measurement (define success before building)

| Metric | Source | Baseline | Target after Phase 3 |
|---|---|---|---|
| 7-day return rate | GoatCounter (returning visits to app routes) | capture in Phase 1 | 2x baseline |
| Plans with 1+ action checked | Supabase profiles | ~16% (3 of 19) | 40% |
| Calendar exports | GoatCounter event | 0 | any adoption signal |
| Journal adoption | journal_entries per active user | n/a | 25% of new signups |
| Email opt-in rate | profiles.prefs | n/a | 50% of signups |

## Working agreements (unchanged, restated)

Selective commits only; visual changes preview-first before deploy; production build discipline (kill dev servers, clean dist dirs); verify on production after each ship; no credentials handled in-session - Kaleb's steps are listed and waited on; no charity/tax language anywhere new surfaces are written.
