---
name: vetpath-mirror
description: Port app features into the standalone demo/vetpath-demo.html safely. Use whenever the Next.js app has changed and the single-file demo must catch up. Encodes the hardened protocol learned from two file-corruption incidents.
---

# VetPath demo mirror — hardened protocol

The demo is a single-file vanilla-JS SPA (~330KB): template-string screens, hash router, state `S`
in localStorage, embedded data consts, engines ported as plain functions. It has been corrupted twice
by monolithic rewrites. NEVER again.

## Iron rules
1. **Never rewrite the whole file.** Small Edit-tool edits only.
2. **Checkpoint first:** copy the file to demo/.mirror-checkpoint-N.html before any edit; restore it if stuck; delete only after full verification passes.
3. **Chunk the work:** data refresh → new screens → dashboard/copy/assets. One chunk per agent; sequential, never parallel (agents share one Playwright browser).
4. **Verify after every step** in a real browser (python -m http.server in demo/, ALWAYS cache-bust with ?v=stepN — browser cache has faked both a failure and a success before).
5. **Leave it working, always** — an unfinished port that boots beats a complete port that doesn't.
6. Fresh-boot test at the end: localStorage.clear() → landing renders → Load sample veteran → dashboard; console clean (favicon 404 acceptable).

## Demo conventions to preserve
- Element-agnostic [data-theme]/[data-textsize] selectors (attributes live on <body>)
- Static no-JS fallback inside #root (email preview panes) — never remove
- Per-route module state resets on navigation; aria-pressed patterns; honesty labels
- Backward-compatible state loading: Object.assign(fresh(), saved)
- Engine parity check: hands-on answers (building/fixing, shop, goal-route, mostly-steady, very
  physical, tight crew, any detail, months, eventually, rural) → electrician must rank top-2

## Current parity target (check git log for drift)
App spec sources: data/*.json (verified content), lib/optimizer|relocate|family|lifeEvents|planDiff.ts,
app/{benefits,relocate,family,updates,pathfinder,dashboard,tools}/page.tsx, hero/admin copy, photos
(base64-embed images ≤80KB each; skip or SVG-substitute larger ones — the file must stay portable).
