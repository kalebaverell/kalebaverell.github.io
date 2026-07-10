# State-benefits research runbook

Goal: real, cited veteran-benefit data for all 50 states + DC in `data/stateBenefits.json`.

## Status (2026-07-08)
- Attempt 1 (5 agents × 10 states): all stalled — watchdog killed them on slow/blocking .gov fetches; nothing written.
- Attempt 2 (8 resilient agents × 5 states): all killed instantly — **account session limit** (resets 12pm America/Chicago). `data/research/` is empty.
- App is PRE-WIRED: `data/stateBenefits.json` (placeholder), `lib/data.ts` exports, benefits page renders real data when present and falls back to sample data per state. Merge via `node scripts/merge-states.mjs`.

## To relaunch (after quota reset)
Launch 10 background agents, ~5 states each, with this prompt template. Batches:
- 1a: AL AK AZ AR CA → states-batch1a.json
- 1b: CO CT DE DC FL → states-batch1b.json
- 2a: GA HI ID IL IN → states-batch2a.json
- 2b: IA KS KY LA ME → states-batch2b.json
- 3a: MD MA MI MN MS → states-batch3a.json
- 3b: MO MT NE NV NH → states-batch3b.json
- 4a: NJ NM NY NC ND → states-batch4a.json
- 4b: OH OK OR PA RI → states-batch4b.json
- 5a: SC SD TN TX UT VT → states-batch5a.json
- 5b: VA WA WV WI WY → states-batch5b.json

### Prompt template (substitute STATES and FILENAME)
Research REAL, CITED veteran benefits data for these states: {STATES}.

OUTPUT FILE (Write tool): C:\Users\KalebAverell\OneDrive - Tower Street Insurance\vetpath\data\research\{FILENAME}
Schema (valid JSON only):
{"batch":"{ID}","lastVerified":"{TODAY}","states":[{"code":"XX","name":"...","agency":{"name":"...","url":"https://..."},"programs":[{"name":"...","category":"tax|education|employment|housing|recreation|health|business|other","blurb":"one sentence","source":"https://..."}],"notes":"optional"}]}

CRITICAL RESILIENCE RULES (prior attempts were killed by a watchdog stalling on slow .gov sites):
1. After finishing EACH state, immediately Write the file with ALL states accumulated so far (overwrite each time). Never wait until the end.
2. Budget ~2 minutes per state. WebSearch is the primary tool. WebFetch AT MOST twice per state; if a fetch fails/times out/blocks (Ohio dvs.ohio.gov is known to block), DO NOT retry — use the search snippets and note "page blocked automated access; URL from official search result".
3. Official sources only for URLs: state veterans agency or other state .gov pages. Never cite blogs/aggregators.

CONTENT per state: (a) official state veterans agency exact name + homepage URL; (b) 3–5 flagship programs across property-tax relief, education/tuition, employment preference, state veterans homes, recreation licenses, notable extras (retirement-income tax treatment, bonuses). Real program names, one-sentence blurbs, direct official source URL each. No volatile dollar figures (statutory hallmarks OK). Never invent — omit and note gaps.

Reply with one short paragraph: states completed, program count, gaps.

## After the agents finish
1. `node scripts/merge-states.mjs` → merges into `data/stateBenefits.json`, reports missing states.
2. Fill gaps with a follow-up agent for just the missing codes.
3. Spot-check 5 random states' URLs by hand.
4. Restart dev server / rebuild; the benefits page picks the data up automatically.
5. Mirror into `demo/vetpath-demo.html` (embed the merged JSON + same rendering) — combine with the pending motion-pass mirror.
6. Update IMPLEMENTATION_LOG + BENEFITS_RESEARCH_NOTES (record the quarterly re-verification cadence).
