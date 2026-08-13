# Tester feedback round 2 - relayed by Kaleb, August 13, 2026

Verbatim notes with disposition. Round 1 lives in tester-feedback-2026-08-12.md.

## 1. "On the next chapter section, when I toggle on and off, it doesn't change results"
"Next chapter" = the Relocation planner (its heading is "Where should the next
chapter happen?"). Reported: toggling priorities on/off does not change the
matches. BUG - reproduce first, then fix. Task #33.

## 2. More variables: weather (colder/warmer), taxes, gun laws, cultural,
things to do, entertainment (shopping, dining)
Split by what can ship without fabricated data:
- Climate preference (warm/mild/cold winters) and state-tax preference
  (no-state-income-tax states are a small, verifiable list): BUILD now. Task #38.
- Gun laws: NOT scored by us - characterizing state gun law "friendliness" is
  legally sensitive, changes constantly, and every ranking source is
  advocacy-adjacent. Ship as links to each state's official statutes/AG page
  when we do the data pass properly. Backlog with sourcing plan.
- Cultural/things-to-do/entertainment: subjective by nature - needs a
  defensible source (e.g., density of amenities) or explicit "sample" labeling.
  Backlog; do not invent amenity scores.

## 3. "Ask a lender if you're qualified" / "find a realtor who knows VA"
BUILD the neutral version now (task #35): a "find out if you qualify" section
on /housing - what prequalification is, the documents to bring (COE, LES or
W-2s, two years of work history), the exact questions to ask a lender and an
agent, and where to look for VA-experienced agents without us endorsing anyone.
The sponsored version of this is task #32 (Frank + counsel) - unchanged.

## 4. "Scan their current resume and make recommendations based on experience"
The resume scanner already exists (/resume) - the tester not finding it is
itself the finding. Task #37: surface it (dashboard card) and add the piece
that is genuinely missing: from the pasted resume, suggest which career paths
the experience matches (deterministic keyword logic, labeled as an estimate),
not just score against one pre-chosen path.

## 5. Housing status "right now": on base / government housing / barracks /
dorms; add dependent with special needs
BUILD (task #34): new intake options for current housing (on base or in
government quarters means housing ends at separation - the plan must say so),
and a special-needs dependent option that adds family-module checkpoints and
plan steps grounded in real programs only (EFMP while still serving, IEP/504
records transfer, ABLE accounts) with official links.

## 6. Running checklist of completed/pending actions, side or dashboard
BUILD (task #36): a compact always-visible progress strip on app pages -
done/pending counts plus the next unfinished actions, linking to /plan.
The plan page already tracks statuses; this makes the running state visible
everywhere instead of only inside the plan.
