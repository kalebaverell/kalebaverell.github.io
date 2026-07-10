// Merges data/research/reloc-batch*.json (official BEA/HUD/BLS/VA datapoints)
// into data/relocationMetros.json as an `official` field per metro.
// Usage: node scripts/merge-reloc.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const researchDir = join(root, "data", "research");
const metroFile = join(root, "data", "relocationMetros.json");

const doc = JSON.parse(readFileSync(metroFile, "utf8"));
const byId = new Map();
let gathered = null;

for (const f of readdirSync(researchDir).filter((f) => f.startsWith("reloc-batch") && f.endsWith(".json")).sort()) {
  let batch;
  try { batch = JSON.parse(readFileSync(join(researchDir, f), "utf8")); }
  catch (e) { console.error(`SKIP ${f}: ${e.message}`); continue; }
  if (batch.gathered) gathered = batch.gathered;
  for (const m of batch.metros || []) {
    if (byId.has(m.id)) console.error(`DUPE ${m.id} in ${f} — keeping first`);
    else byId.set(m.id, m);
  }
}

let hits = 0;
for (const metro of doc.metros) {
  const r = byId.get(metro.id);
  if (!r) continue;
  hits++;
  metro.official = {
    gathered,
    rpp: r.rpp ?? null,           // BEA Regional Price Parity (100 = national average)
    fmr2br: r.fmr2br ?? null,     // HUD 2BR Fair Market Rent
    unemployment: r.unemployment ?? null, // BLS metro rate
    vamc: r.vamc ?? null,         // principal VA Medical Center
    notes: r.notes || undefined,
  };
}

doc._note =
  "Relocation decision-support data. The `official` block per metro carries CITED datapoints — BEA Regional Price Parities (cost), HUD 2BR Fair Market Rents (housing), BLS metro unemployment (jobs), and the principal VA Medical Center — each with source URL and vintage. The 1–5 tiers remain illustrative comparison aids derived for the prototype; verify all factors independently and check facilities at va.gov/find-locations.";

writeFileSync(metroFile, JSON.stringify(doc, null, 2));
console.log(`Merged official data into ${hits}/${doc.metros.length} metros (gathered ${gathered}).`);
const missing = doc.metros.filter((m) => m.id !== "rural-telehealth" && !m.official).map((m) => m.id);
if (missing.length) console.log("MISSING:", missing.join(", "));
