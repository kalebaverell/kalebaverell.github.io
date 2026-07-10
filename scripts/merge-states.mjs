// Merges data/research/states-batch*.json into data/stateBenefits.json
// Usage: node scripts/merge-states.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const researchDir = join(root, "data", "research");
const outFile = join(root, "data", "stateBenefits.json");

const ALL = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const states = new Map();
let lastVerified = null;

for (const f of readdirSync(researchDir).filter((f) => f.endsWith(".json")).sort()) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(join(researchDir, f), "utf8"));
  } catch (e) {
    console.error(`SKIP ${f}: invalid JSON (${e.message})`);
    continue;
  }
  if (doc.lastVerified) lastVerified = doc.lastVerified;
  for (const st of doc.states || []) {
    if (!st.code || !st.agency?.url || !Array.isArray(st.programs)) {
      console.error(`SKIP entry in ${f}: malformed state ${st.code || "?"}`);
      continue;
    }
    if (states.has(st.code)) console.error(`DUPE ${st.code} (in ${f}) — keeping first`);
    else states.set(st.code, st);
  }
}

const sorted = [...states.values()].sort((a, b) => a.code.localeCompare(b.code));
const missing = ALL.filter((c) => !states.has(c));

writeFileSync(
  outFile,
  JSON.stringify(
    {
      _note: "REAL, CITED state benefit data researched from official state sources. Every program links to its official source. Rules change — the product must always show lastVerified and direct users to the agency to confirm.",
      lastVerified,
      coverage: { total: sorted.length, missing },
      states: sorted,
    },
    null,
    2
  )
);

console.log(`Merged ${sorted.length}/51 jurisdictions -> data/stateBenefits.json`);
if (missing.length) console.log(`MISSING: ${missing.join(", ")}`);
