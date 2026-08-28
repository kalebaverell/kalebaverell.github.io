# VetPath health check - 2026-08-28 (late run, manual, on Kaleb's order)

Third run today (see `health-2026-08-28.md` and `-pm.md`). Unlike the earlier
runs this one re-ran the full production build rather than citing a prior one,
and used a third distinct link sample.

| Section | Result |
|---|---|
| 1. Build | **PASS** - `tsc --noEmit` clean, full production build exit 0, 33/33 static pages generated, zero error lines in the log. Dev server restarted. |
| 2. Data integrity | **PASS** - 51 states, 11 verified categories, 15 linked careers, 29/28 metros, 11 assessment questions, horizon question intact, 5 funnel events matching 5 intake steps in order |
| 3. Link-rot sample (8 URLs, third distinct seed) | **PASS** - 5/8 HTTP 200; kovs.ks.gov, mass.gov and veterans.ny.gov returned 403 to curl and all three render with correct, topic-matching titles in a real browser |
| 4. Deliverables freshness | **PASS** - website zip 14:48 (carries funnel instrumentation), demo-derived deliverables current against a 09:00 demo |
| 5. Staleness | **PASS** - oldest lastVerified 2026-07-08 in stateBenefits (52 days; refresh booked Oct 1) |
| 6. Git | **PASS** - clean tree, last commit a1babfd |
| 7. Housekeeping | **PASS** - only `.next-v67` present, nothing to prune |

**Verdict: healthy across all seven sections.**

## Pattern worth acting on eventually: .gov bot-walls

Across three separate 8-URL samples today (24 distinct URLs), **7 returned 403
to automated requests and every single one rendered correctly in a real
browser**: kovs.ks.gov, tn.gov, bls.gov, dvs.virginia.gov, veterans.ny.gov (two
different paths), mass.gov.

That is a ~29% false-positive rate on curl alone. The browser-verification step
is now the load-bearing part of this check, not a formality. A future run that
skipped it would report a third of our source links as broken. If the rate keeps
climbing, consider inverting the check: browser-first for .gov domains, curl only
for the rest.
