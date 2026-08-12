# Retargeting ads activation runbook

Written August 12, 2026. The pixel infrastructure is built and shipped INERT:
`lib/marketing.ts` has empty IDs, so `components/MarketingPixels.tsx` renders
nothing and no ad-platform script loads anywhere. This document is the
complete, ordered checklist for turning it on. Nothing here is optional -
steps 3 through 5 exist because the site, the privacy policy, and printed
material currently promise "no ads," and those promises must change in the
same breath as the behavior.

## What is already done (shipped dark)

- Pixel loader with three hard guardrails: marketing routes only
  (`/` and `/trust` - never onboarding, dashboard, pathfinder, benefits,
  plan, or profile, where veterans enter disability/health/housing answers),
  Do Not Track and Global Privacy Control honored silently, localhost never
  fires. Meta autoConfig is disabled so the pixel sends only what we send it.
- First-touch attribution (`lib/firstTouch.ts`): every tagged link or QR
  already records which outreach brought each signup. This doubles as ad
  conversion ground truth later.
- Outreach segments view (`outreach.segments` in Supabase, owner-only):
  targeting lists for email today, custom-audience seeds for ads later.
- **Opt-out layer, built and tested** (`lib/adConsent.ts`,
  `components/AdOptOutControl.tsx`, `/do-not-sell`): a visitor-level switch
  the pixel loader checks before injecting anything, with no dark patterns
  (opting out and back in are one click each, equal prominence). The footer
  link appears automatically once a pixel ID is set; the page is reachable
  today and exempt from the funnel gate. Verified against a temporary test
  pixel ID on 2026-08-12: pixel loads on `/`, does NOT load on
  `/onboarding`, and does NOT load anywhere once the switch is set.

## Step 1 - Kaleb: create the ad account (nobody else can do this)

Platform decision is deliberately open ("advise me when we get there" -
ask Claude for the Meta vs Google comparison with current minimum budgets
and veteran-reach numbers before committing spend). Whichever platform:

- Meta: business.facebook.com -> Business account -> Events Manager ->
  create Pixel -> copy the Pixel ID (a number).
- Google: ads.google.com -> account -> Tag ID (AW-XXXXXXXXX).

Do not install anything the platform offers (no "partner integrations,"
no auto-code snippets). The site already has the loader; it only needs the ID.

## Step 2 - Set the ID (one line)

In `lib/marketing.ts`, set `META_PIXEL_ID` and/or `GOOGLE_ADS_TAG_ID`.
DO NOT COMMIT YET - steps 3 and 4 go in the same commit.

## Step 3 - Same commit: privacy page rewrite (app/privacy/page.tsx)

- "The short version" card: the "No trackers and no advertising pixels"
  bullet is no longer true - rewrite to disclose the ad pixel and where it
  runs (marketing pages only), with opt-out.
- "What we do not do": remove/rewrite the "no advertising scripts, tracking
  pixels" bullet. Keep "we do not sell your data" only if we in fact never
  upload emails/audiences to the platform - uploading a custom audience IS
  "sharing" under several state laws. Decide before writing.
- "Who else touches your data": add the ad platform to the whole-list.
- New section explaining retargeting in plain terms, mirroring the
  GoatCounter section's honesty bar: what the pixel sees (marketing page
  visits), what it never sees (answers, plans, anything behind sign-in),
  and how to opt out.
- Bump LAST_UPDATED.
- The Do Not Sell/Share link and its opt-out switch are already built and
  wired; the footer link surfaces itself the moment an ID is set. Re-read
  `/do-not-sell` copy though: the "as of today there is nothing to switch
  off" banner disappears automatically, but the surrounding sentences should
  be checked once ads are real.

## Step 4 - Same commit or same week: printed material

- `print/vetpath-vso-onepager.html/pdf` promises "No ads." Revise, re-render,
  and stop distributing the old PDF the day pixels go live.
- The funding playbook red-line list says no ads - Frank has that packet.
  Tell Frank before flipping the switch; it changes a written commitment.

## Step 5 - Verify before spending a dollar

- Pixel fires on `/` and `/trust` only (Network tab: facebook.net /
  googletagmanager.com requests absent on /onboarding, /dashboard, etc.).
- GPC-enabled browser: no pixel request at all.
- GoatCounter still counts exactly once per route (no double-injection).
- Privacy page reads true against actual network behavior.

## Audience-size reality check (why this is staged, not live)

Retargeting needs an audience floor before it can even serve: Meta custom
audiences generally need matched hundreds before ads deliver reliably, and
lookalikes want 1,000+ seeds to model from. Until site traffic is past a few
hundred visitors/month, ad spend converts poorly and the pixel mostly idles.
The email + segments track works at ANY size - at 12 users it already
identifies who abandoned mid-intake. Sequence accordingly: pilot first,
traffic second, pixels third.
