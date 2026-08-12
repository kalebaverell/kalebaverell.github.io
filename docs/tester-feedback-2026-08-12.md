# Tester feedback - relayed by Kaleb, August 12, 2026

Verbatim notes from pilot testers, with disposition. This file is the paper
trail for "we listened and shipped" - useful for Frank and for the investor
story later.

## 1. "Want to be able to choose multiple directions that pull you"
The point: testers do not know exactly what they want or how to prioritize.
- Where it bites: the assessment's first question (`pull` in
  data/assessmentQuestions.json) is single-select. One direction in, one
  flavor of results out.
- Disposition: BUILD. Make `pull` multi-select (up to 2-3), blend the
  direction vectors in lib/pathfinder.ts, and let results hold more than
  one path instead of forcing a single destination pick.

## 2. "Fear that choosing the provided answers hurts my real objective -
I want to make the most money, and I'll deal with people if that's what
it takes"
- Where it bites: the engine treats preference answers (like "mostly solo")
  as ranking signals with no notion of which objective WINS on conflict.
  A high-pay, people-heavy path gets depressed even for a money-first
  tester. The salary target only nudges (+4 / capped penalty).
- Disposition: BUILD. Add an explicit tie-breaker question up front:
  "When two paths conflict, what wins - most money, stability, enjoying
  the work, or fastest start?" If money wins, pay dominates the ordering
  and preference mismatches demote to honestly-labeled trade-offs
  ("People-heavy. You said pay wins, so it stays ranked by pay.").
  Preferences refine; they never veto the stated objective.

## 3. "Only one career path made sense for me (project/operations manager)"
- Reading: symptom of #2 (mis-weighted objective narrows credible results),
  plus results transparency. Fix #1 + #2 first, then a diversity pass:
  ensure the top set spans more than one track when fit scores are close,
  and expand the "why this matched" reasoning so near-misses make sense.
- Disposition: BUILD after 1-2, then re-test against this tester's profile.

## 4. "Compare states for housing, drill into towns, see average home
prices - push the VA loan. Sponsored lenders/agents, referral fee."
Split in two:
- 4a. Housing comparison: BUILD. State-vs-state housing comparison with
  town-level median home values from an official, citable source (Census
  ACS median value of owner-occupied units), wired into the relocation
  tools next to the VA-loan content. Fits the every-number-sourced rule.
- 4b. Sponsored lender/agent referrals: DECISION REQUIRED before any code.
  This conflicts with three things currently in print:
    - Privacy page: "We do not sell your details as a sales lead to
      lenders, insurers, agents, or schools."
    - VSO one-pager (in circulation): "No ads, no selling of anyone's
      information."
    - Funding playbook red-line list (in Frank's packet): no lender /
      insurance / claims referral fees.
  And a legal wrinkle: per-closing referral fees for mortgage-related
  business implicate RESPA Section 8 (anti-kickback), and Texas license
  law restricts real-estate referral fees to licensed brokers. Compliant
  shapes exist (flat-fee sponsorship/advertising at fair market value,
  clearly labeled, no per-lead payment; or a licensed partner structure),
  but that is a counsel conversation, not a code change.
  Sequence if chosen: Frank sign-off (it amends a red line in his packet)
  -> counsel on structure -> paired rewrite of privacy page + VSO sheet +
  playbook in the same commit as the feature.
  Interim: 4a ships with a neutral "find a VA-savvy lender" section
  pointing at official resources, with a clearly-labeled sponsor slot
  that stays empty until the decision is made.
