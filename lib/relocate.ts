// VetPath Relocation Planner — deterministic, explainable scoring engine (SAMPLE logic).
// Priorities in → ranked metros out, with a normalized 0–100 score, per-dimension
// contributions, and plain-language "why" bullets. Same principle as the Pathfinder:
// the veteran's own stated priorities drive the ranking. A disability rating NEVER
// filters anything out — it only adds a gentle, optional note about VA access.
// All tiers are illustrative sample data, not rankings from a cited index.
import metrosJson from "@/data/relocationMetros.json";
import { careerById, realStateInfo, stateName } from "./data";

// ---- Types ----

export type Priority = 0 | 1 | 2; // 0 = skip, 1 = nice to have, 2 = must have

export interface RelocPriorities {
  vaAccess: Priority;
  cost: Priority;
  jobs: Priority;
  stateBenefits: Priority;
  schools: Priority;
  community: Priority;
  safety: Priority;
  business: Priority;
  airport: Priority;
}

export type RelocDim = keyof RelocPriorities;

export type VaLevel = "VAMC" | "CBOC" | "nearby";
export type AirportLevel = "international" | "regional" | "limited";

export interface Metro {
  id: string;
  name: string;
  state: string; // 2-letter code ("—" for the rural pattern entry)
  vibe: "big" | "mid" | "small";
  va: { level: VaLevel; note: string };
  colTier: number; // 1 = lowest cost of living, 5 = highest (illustrative)
  colNote: string;
  housingSample: string;
  jobs: { tracks: string[]; strongCareers: string[]; note: string };
  schoolsNote: string;
  community: number; // 1–5, higher = larger veteran presence (illustrative)
  communityNote: string;
  airport: AirportLevel;
  safetyTier: number; // 1–5, higher = more favorable sample picture (illustrative)
  businessTier: number; // 1–5, higher = friendlier small-business climate (illustrative)
  businessNote: string;
  notes: string;
}

export interface DimScore {
  key: RelocDim;
  label: string;
  weight: number; // 0 (skip), 1 (nice), 2 (must)
  raw: number;    // 0–1 how well this metro serves the dimension
  points: number; // contribution to the final 0–100 score
}

export interface ScoredMetro {
  metro: Metro;
  score: number; // normalized 0–100
  dims: DimScore[];
  whyBullets: string[];
}

export interface CompareCell {
  metroId: string;
  value: string;
  detail?: string;
}

export interface CompareRow {
  dimension: string;
  cells: CompareCell[];
}

// ---- Data ----

export const METROS: Metro[] = (metrosJson as any).metros as Metro[];
export const METROS_NOTE: string = (metrosJson as any)._note;
export const metroById = (id: string): Metro | undefined => METROS.find((m) => m.id === id);

export const RELOC_DIMS: { key: RelocDim; label: string; icon: string; help: string }[] = [
  { key: "vaAccess", label: "VA healthcare access", icon: "ti-building-hospital", help: "How close a full VA medical center or clinic is." },
  { key: "cost", label: "Cost of living", icon: "ti-coin", help: "Overall costs — housing, day-to-day expenses." },
  { key: "jobs", label: "Jobs for my path", icon: "ti-briefcase", help: "How strong the market is for the work you want." },
  { key: "stateBenefits", label: "State veteran benefits", icon: "ti-award", help: "How broad the state's own veteran benefits are — tax relief, tuition waivers, hiring preference." },
  { key: "schools", label: "Schools", icon: "ti-school", help: "What families should know — we surface notes, not rankings." },
  { key: "community", label: "Veteran community", icon: "ti-users-group", help: "How many veterans are around you — network, understanding, belonging." },
  { key: "safety", label: "Safety feel", icon: "ti-shield-check", help: "Illustrative comfort tier — always varies block by block." },
  { key: "business", label: "Business climate", icon: "ti-building-store", help: "Taxes and friction if you plan to start something." },
  { key: "airport", label: "Airport access", icon: "ti-plane-departure", help: "How easy it is to fly out — family visits, travel work." },
];

export const PRIORITY_LABELS: Record<Priority, string> = { 0: "Skip", 1: "Nice to have", 2: "Must have" };

const DIM_LABEL: Record<RelocDim, string> = Object.fromEntries(
  RELOC_DIMS.map((d) => [d.key, d.label])
) as Record<RelocDim, string>;

const TRACK_LABEL: Record<string, string> = {
  employment: "Employment",
  education: "Education",
  trades: "Skilled trades",
  entrepreneur: "Entrepreneur",
};

// ---- Raw dimension scores (0–1, all illustrative) ----

const VA_RAW: Record<VaLevel, number> = { VAMC: 1, nearby: 0.65, CBOC: 0.5 };
const AIRPORT_RAW: Record<AirportLevel, number> = { international: 1, regional: 0.65, limited: 0.25 };

const vaPhrase = (m: Metro): string =>
  m.va.level === "VAMC"
    ? "full VA medical center in the metro"
    : m.va.level === "nearby"
      ? "VA clinics in town with a full medical center within a drive"
      : "VA community clinic (CBOC) coverage — pair with VA telehealth";

// Cited official datapoints (BEA RPP / BLS unemployment) merged onto each metro in the JSON.
type OfficialPoint = { value: number; year?: string; asOf?: string; source: string } | undefined;
function official(m: Metro): { rpp?: OfficialPoint; unemployment?: OfficialPoint } {
  return ((m as unknown as { official?: { rpp?: OfficialPoint; unemployment?: OfficialPoint } }).official) || {};
}

function jobsRaw(m: Metro, careerId?: string): { raw: number; matchedCareer?: string } {
  // Breadth baseline: more tracks with real depth = better generic market (0.5–0.95).
  const breadth = 0.35 + 0.15 * Math.min(4, m.jobs.tracks.length);
  let base: number;
  let matchedCareer: string | undefined;
  if (!careerId) {
    base = breadth;
  } else {
    const career = careerById(careerId);
    if (m.jobs.strongCareers.includes(careerId)) { base = 1; matchedCareer = career?.label || careerId; }
    else if (career && m.jobs.tracks.includes(career.track)) { base = Math.min(0.8, breadth + 0.1); }
    else { base = breadth * 0.6; }
  }
  // Blend in the real BLS metro unemployment where we have it (lower = healthier market).
  const unemp = official(m).unemployment?.value;
  if (typeof unemp === "number") {
    const unempScore = Math.max(0, Math.min(1, (6.5 - unemp) / (6.5 - 2.5)));
    base = base * 0.7 + unempScore * 0.3;
  }
  return { raw: Math.max(0, Math.min(1, base)), matchedCareer };
}

/** Distinct benefit categories a state covers (0–6), the main signal for the state-benefits dim. */
function stateBenefitStrength(code: string): { cats: number; count: number } | null {
  if (!code || code === "—") return null;
  const info = realStateInfo(code);
  if (!info) return null;
  return { cats: new Set(info.programs.map((p) => p.category)).size, count: info.programs.length };
}

function rawFor(dim: RelocDim, m: Metro, careerId?: string): number {
  switch (dim) {
    case "vaAccess": return VA_RAW[m.va.level] ?? 0.5;
    case "cost": {
      // Prefer the real BEA Regional Price Parity (100 = U.S. avg; ~82 cheapest, ~128 priciest).
      const rpp = official(m).rpp?.value;
      if (typeof rpp === "number") return Math.max(0, Math.min(1, (128 - rpp) / (128 - 82)));
      return Math.max(0, Math.min(1, (5 - m.colTier) / 4)); // illustrative fallback
    }
    case "jobs": return jobsRaw(m, careerId).raw;
    case "stateBenefits": {
      const s = stateBenefitStrength(m.state);
      if (!s) return 0.5;
      return Math.max(0, Math.min(1, 0.45 + s.cats * 0.09 + s.count * 0.01));
    }
    // No school rankings in the sample data (deliberately — we don't invent them).
    // Schools score neutrally; picking it surfaces each metro's schools note instead.
    case "schools": return 0.6;
    case "community": return Math.max(0, Math.min(1, (m.community - 1) / 4));
    case "safety": return Math.max(0, Math.min(1, (m.safetyTier - 1) / 4));
    case "business": return Math.max(0, Math.min(1, (m.businessTier - 1) / 4));
    case "airport": return AIRPORT_RAW[m.airport] ?? 0.25;
  }
}

// ---- Why bullets (plain language, tied to what THEY selected) ----

function bulletFor(dim: RelocDim, m: Metro, raw: number, matchedCareer?: string): string | null {
  switch (dim) {
    case "vaAccess": {
      const p = vaPhrase(m);
      return p.charAt(0).toUpperCase() + p.slice(1);
    }
    case "cost": {
      const rpp = official(m).rpp?.value;
      if (typeof rpp === "number") {
        if (rpp < 97) return `Below-average cost of living — BEA price parity ${rpp.toFixed(0)} (100 = U.S. average)`;
        if (rpp <= 103) return `About the U.S.-average cost of living — BEA price parity ${rpp.toFixed(0)}`;
        return null; // pricier than average — no positive cost story
      }
      if (m.colTier === 1) return "Very low cost of living (tier 1 of 5)";
      if (m.colTier === 2) return "Low cost of living (tier 2 of 5)";
      if (m.colTier === 3) return "Moderate cost of living (tier 3 of 5)";
      return null;
    }
    case "jobs": {
      const unemp = official(m).unemployment?.value;
      const unempStr = typeof unemp === "number" ? ` — ${unemp}% metro unemployment (BLS)` : "";
      if (matchedCareer) return `Strong for ${matchedCareer} work${unempStr}`;
      if (typeof unemp === "number" && unemp <= 3.8) return `Healthy job market${unempStr}`;
      if (raw >= 0.6) {
        const tracks = m.jobs.tracks.map((t) => TRACK_LABEL[t] || t).join(", ");
        return `Solid job market across: ${tracks.toLowerCase()}`;
      }
      return null;
    }
    case "stateBenefits": {
      const info = m.state && m.state !== "—" ? realStateInfo(m.state) : null;
      if (!info || info.programs.length === 0) return null;
      const catWord: Record<string, string> = { tax: "property-tax relief", health: "state veterans homes", education: "tuition help", employment: "hiring preference", recreation: "parks & recreation" };
      const cats = [...new Set(info.programs.map((p) => p.category))].map((c) => catWord[c]).filter(Boolean).slice(0, 3);
      return `${stateName(m.state)} runs ${info.programs.length} state veteran benefit programs${cats.length ? ` — incl. ${cats.join(", ")}` : ""}`;
    }
    case "schools":
      return `Schools: ${m.schoolsNote}`;
    case "community":
      if (m.community >= 4) return `Strong veteran community (${m.community} of 5)`;
      if (m.community === 3) return "Moderate veteran presence (3 of 5)";
      return null;
    case "safety":
      if (m.safetyTier >= 4) return `Favorable sample safety tier (${m.safetyTier} of 5) — still visit neighborhoods yourself`;
      return null;
    case "business":
      if (m.businessTier >= 4) return `Business-friendly climate (tier ${m.businessTier} of 5)`;
      return null;
    case "airport":
      if (m.airport === "international") return "International airport with broad direct-flight options";
      if (m.airport === "regional") return "Solid regional airport in town";
      return null;
  }
}

// ---- Scoring ----

export function scoreMetros(
  p: RelocPriorities,
  opts?: { careerId?: string; highVaNeed?: boolean }
): ScoredMetro[] {
  const careerId = opts?.careerId;
  const anySelected = RELOC_DIMS.some((d) => p[d.key] > 0);

  const results: ScoredMetro[] = METROS.map((m) => {
    let weighted = 0;
    let totalWeight = 0;
    const dims: DimScore[] = [];
    const candidates: { strength: number; text: string }[] = [];
    const jr = jobsRaw(m, careerId);

    for (const d of RELOC_DIMS) {
      // If nothing is selected, weigh everything evenly so results stay useful.
      const weight = anySelected ? p[d.key] : 1;
      const raw = d.key === "jobs" ? jr.raw : rawFor(d.key, m, careerId);
      weighted += weight * raw;
      totalWeight += weight;
      dims.push({ key: d.key, label: DIM_LABEL[d.key], weight, raw, points: 0 });

      if (weight > 0) {
        const text = bulletFor(d.key, m, raw, d.key === "jobs" ? jr.matchedCareer : undefined);
        if (text) candidates.push({ strength: weight * raw, text });
      }
    }

    const score = totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0;
    // Per-dimension contribution to the final score (they sum to the score).
    for (const ds of dims) {
      ds.points = totalWeight > 0 ? Math.round(((ds.weight * ds.raw) / totalWeight) * 100) : 0;
    }

    const whyBullets = candidates
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5)
      .map((c) => c.text);
    if (whyBullets.length === 0) whyBullets.push("A balanced option across the priorities you picked.");

    // Gentle, optional nudge — never forced, never a filter. Only shown when the
    // caller says VA care likely matters (rating ≥ 60% or health priorities) yet
    // VA access was set to "skip".
    if (opts?.highVaNeed && p.vaAccess === 0) {
      whyBullets.push(
        `A gentle note: you skipped VA access, but based on your rating or health priorities it may still be worth weighing — here that would mean a ${vaPhrase(m)}. Your call, always.`
      );
    }

    return { metro: m, score, dims, whyBullets };
  });

  return results.sort((a, b) => b.score - a.score || a.metro.name.localeCompare(b.metro.name));
}

// ---- Side-by-side comparison ----

const VA_LEVEL_SHORT: Record<VaLevel, string> = {
  VAMC: "VA medical center",
  nearby: "Clinics + VAMC nearby",
  CBOC: "Community clinic (CBOC)",
};

const AIRPORT_SHORT: Record<AirportLevel, string> = {
  international: "International",
  regional: "Regional",
  limited: "Limited (drive to a hub)",
};

export function compareMetros(ids: string[]): CompareRow[] {
  const ms = ids.map((id) => metroById(id)).filter((m): m is Metro => Boolean(m));
  if (ms.length === 0) return [];
  const row = (dimension: string, cell: (m: Metro) => Omit<CompareCell, "metroId">): CompareRow => ({
    dimension,
    cells: ms.map((m) => ({ metroId: m.id, ...cell(m) })),
  });
  return [
    row("VA access", (m) => ({ value: VA_LEVEL_SHORT[m.va.level] ?? m.va.level, detail: m.va.note })),
    row("Cost of living", (m) => ({ value: `Tier ${m.colTier} of 5`, detail: m.colNote })),
    row("Housing (sample)", (m) => ({ value: m.housingSample })),
    row("Jobs", (m) => ({
      value: m.jobs.tracks.map((t) => TRACK_LABEL[t] || t).join(" · "),
      detail: m.jobs.note,
    })),
    row("Schools", (m) => ({ value: m.schoolsNote })),
    row("Veteran community", (m) => ({ value: `${m.community} of 5`, detail: m.communityNote })),
    row("Safety (sample tier)", (m) => ({ value: `Tier ${m.safetyTier} of 5`, detail: "Varies block by block — visit in person." })),
    row("Business climate", (m) => ({ value: `Tier ${m.businessTier} of 5`, detail: m.businessNote })),
    row("Airport", (m) => ({ value: AIRPORT_SHORT[m.airport] ?? m.airport })),
    row("Worth knowing", (m) => ({ value: m.notes })),
  ];
}
