# Intake audit on a phone - 2026-08-28

Measured at 390x844 (iPhone-class), the viewport 79% of our traffic actually uses.
This is the companion to the funnel instrumentation shipped the same day: the
events will say WHERE people quit, and this says WHAT they were facing there.

**No defects were found. This is a volume problem, not a broken-UI problem.**

## What the intake actually asks

24 questions across 5 steps: **18 required**, 4 optional, 2 demographic (already
correctly folded behind a "More about you" disclosure).

| Step | Title | Questions | Option buttons | Screens of scroll |
|---|---|---|---|---|
| 1 | The basics | 8 (4 req, 2 opt, 2 demo) | 29 | 3.45 |
| 2 | Where you are right now | 6 (4 req, 2 opt) | 27 | 3.74 |
| 3 | **What matters to you** | **7, all required** | **37** | **5.25** |
| 4 | What matters most | 1 (a 7x4 weight matrix) | 28 | 3.09 |
| 5 | Your top goals | 2 | 14 | 3.33 |

End to end that is roughly **19 phone screens of scrolling and 135 option buttons.**

## What is already right (hypotheses ruled out)

- **The action bar is `position: sticky; bottom: 0`.** Next and Generate are always
  reachable without scrolling, on every step including the last. Navigation is not
  the problem. (An earlier reading of mine suggested step 5 required scrolling -
  that was a measurement artifact of absolute-vs-viewport position, not real.)
- **Zero tap targets under 44px anywhere in the form.** Options are properly sized.
- **No form control under 16px**, so iOS never auto-zooms on focus.
- Progress is shown two ways ("Step N of 5" plus a bar), and the "Saved
  automatically - leave anytime, pick up here" reassurance is already in place.
- Demographics are behind a fold rather than blocking the flow.
- The signup gate's CTA sits above the fold at 683px, with only 43 words before it.

## Prime suspect: step 3

Step 3 is the heaviest screen in the flow by every measure - 7 questions, 37
options, and 5.25 screens of scroll, which is 40% longer than the next-longest
step. Every one of its questions is required, so there is no fast path through
it. It also sits at the worst possible position psychologically: far enough in
that novelty has worn off, not far enough that the finish is visible.

Its seven questions each ask about a different life domain (education, GI Bill,
career, business, wellness, financial, family). That is a lot of context-switching
for someone answering on a phone.

**Secondary suspect: step 1**, purely because it is first and carries 8 questions.
First impressions decide whether anyone continues at all.

## Recommendations, pending the Sep 4 funnel reading

Do not act on these until the events say which one is real.

1. **If step 3 is the cliff:** split it in two, or let "no goals here" be a single
   tap that collapses a question. At least four of its seven are "any X goals?"
   questions where a fast negative is a legitimate answer.
2. **If step 1 is the cliff:** the two optional questions (city, military job) can
   move behind the same disclosure the demographics already use.
3. **If the bleed is even across all steps:** the flow is simply long. Cutting to
   ~12 required questions would roughly halve the scroll depth.
4. **Cheap regardless of the diagnosis:** the top-goals requirement on step 5 is
   only communicated by an alert *after* the user presses Generate. Make it visible
   before the button. We now measure that dead end as `intake-blocked-goals`.

## Note on the promise

The gate says "About 10 minutes from here to your plan." 24 questions is honest
for that estimate - but the estimate itself may be doing damage at the door. Worth
testing a shorter first-run path someday, though not before the funnel data lands.
