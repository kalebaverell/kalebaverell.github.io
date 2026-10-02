// scripts/check-freshness.mjs - build-time data freshness gate.
//
// /trust promises "Stale dates are treated as bugs". This makes that promise
// mechanical: every verification date the site shows a visitor is read here.
//   older than 90 days  -> warning, build continues
//   older than 100 days -> the build fails
// It runs as the npm "prebuild" script, so `npm run build` enforces it locally
// and in .github/workflows/deploy.yml. .github/workflows/freshness.yml also
// runs it weekly, so a quiet quarter with no pushes cannot slip past.
//
// Dates must be full YYYY-MM-DD. "2026-07" fails: "sometime in July" cannot be
// aged honestly. Never bump a date to get past this check - bump it only after
// re-checking the content against its official source.
//
// Local escape hatch for verification builds: FRESHNESS_OVERRIDE="reason"
// downgrades failures to a warning. It is ignored whenever CI is set (GitHub
// Actions sets CI=true), so production can never publish past the limit.
// No dependencies - plain Node 18+.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WARN_DAYS = 90;
const FAIL_DAYS = 100;
const DAY_MS = 86_400_000;
const IN_ACTIONS = process.env.GITHUB_ACTIONS === "true";

// BOM-safe: a research batch once shipped with a UTF-8 BOM and a merge
// silently skipped it (docs/refresh-reports/refresh-2026-10-01.md).
const read = (p) => readFileSync(join(ROOT, p), "utf8").replace(/^﻿/, "");
const json = (p) => JSON.parse(read(p));

const checks = [];
const add = (where, value) => checks.push({ where, value });

add("data/stateBenefits.json lastVerified", json("data/stateBenefits.json").lastVerified);
for (const c of json("data/sampleBenefits.json").categories) {
  add(`data/sampleBenefits.json [${c.id}] lastVerified`, c.lastVerified);
}
add("data/sampleCareers.json lastVerified", json("data/sampleCareers.json").lastVerified);
add("data/funding.json lastVerified", json("data/funding.json").lastVerified);
add("data/reserves.json lastVerified", json("data/reserves.json").lastVerified);
for (const g of json("data/familyResources.json").groups) {
  for (const e of g.entries || []) {
    if (e.verified) add(`data/familyResources.json [${g.id} / ${e.name}] verified`, e.verified);
  }
}
for (const m of json("data/relocationMetros.json").metros) {
  if (m.official) add(`data/relocationMetros.json [${m.id}] official.gathered`, m.official.gathered);
}
add("data/housingStates.json meta.retrieved", json("data/housingStates.json").meta?.retrieved);
const tl = /export const TIMELINE_VERIFIED\s*=\s*"([^"]*)"/.exec(read("lib/timeline.ts"));
add("lib/timeline.ts TIMELINE_VERIFIED", tl ? tl[1] : undefined);

const now = new Date();
const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

const problems = [];
let oldest = null;
for (const { where, value } of checks) {
  const t = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(`${value}T00:00:00Z`) : NaN;
  // Round-trip guards against impossible dates such as 2026-02-30.
  if (Number.isNaN(t) || iso(t) !== value) {
    problems.push({ level: "error", where, msg: `"${value ?? "missing"}" is not a valid YYYY-MM-DD date` });
    continue;
  }
  const age = Math.floor((today - t) / DAY_MS);
  if (!oldest || t < oldest.t) oldest = { t, where, value };
  if (age < 0) {
    problems.push({ level: "error", where, msg: `${value} is in the future` });
  } else if (age > FAIL_DAYS) {
    problems.push({ level: "error", where, msg: `${value} is ${age} days old (limit ${FAIL_DAYS}). Re-verify against the official source, then update the date.` });
  } else if (age > WARN_DAYS) {
    problems.push({ level: "warning", where, msg: `${value} is ${age} days old. Re-verify by ${iso(t + FAIL_DAYS * DAY_MS)}; after that the build fails.` });
  }
}

for (const p of problems) {
  const line = `${p.where}: ${p.msg}`;
  if (IN_ACTIONS) console.log(`::${p.level} title=Data freshness::${line}`);
  else if (p.level === "error") console.error(`FAIL  ${line}`);
  else console.warn(`WARN  ${line}`);
}

const errors = problems.filter((p) => p.level === "error").length;
const warnings = problems.length - errors;
console.log(
  `Data freshness: ${checks.length} dates checked, ${warnings} warning(s), ${errors} failure(s).` +
    (oldest ? ` Oldest: ${oldest.value} (${oldest.where}); builds fail after ${iso(oldest.t + FAIL_DAYS * DAY_MS)}.` : "")
);

if (errors > 0) {
  const reason = process.env.FRESHNESS_OVERRIDE;
  if (reason && !process.env.CI) {
    console.warn(`FRESHNESS_OVERRIDE set for this local build only: ${reason}`);
    process.exit(0);
  }
  console.error("Build stopped: VetPath does not publish a verification date older than 100 days. Refresh steps: docs/BENEFITS_RESEARCH_NOTES.md.");
  process.exit(1);
}
