// Compare-states data builder — deterministic, sourced, no LLM. Joins the cited state
// veteran-benefit data (all 51 jurisdictions) with the cited metro cost/rent/jobs numbers
// (BEA RPP / HUD FMR / BLS, where a metro exists for the state). Every figure links to source.
import metrosJson from "@/data/relocationMetros.json";
import { realStateInfo, stateName } from "./data";

interface MetroOfficial {
  state: string;
  name: string;
  official?: {
    rpp?: { value: number; year: string; source: string };
    fmr2br?: { value: number; year: string; source: string };
    unemployment?: { value: number; asOf: string; source: string };
  };
}
const METROS_RAW = ((metrosJson as any).metros || []) as MetroOfficial[];

export const COMPARE_CATEGORIES = ["tax", "health", "education", "employment", "recreation", "other"] as const;
export const CATEGORY_LABEL: Record<string, string> = {
  tax: "Tax relief",
  health: "Health care",
  education: "Education",
  employment: "Employment",
  recreation: "Recreation & parks",
  other: "Other",
};

export interface StateCompare {
  code: string;
  name: string;
  agency: { name: string; url: string } | null;
  totalPrograms: number;
  byCategory: Record<string, { count: number; top?: { name: string; source: string } }>;
  cost: {
    metro: string;
    rpp?: { value: number; year: string; source: string };
    fmr2br?: { value: number; year: string; source: string };
    unemployment?: { value: number; asOf: string; source: string };
  } | null;
}

export function buildStateCompare(code: string): StateCompare {
  const info = realStateInfo(code);
  const byCategory: StateCompare["byCategory"] = {};
  for (const cat of COMPARE_CATEGORIES) byCategory[cat] = { count: 0 };
  let total = 0;
  if (info) {
    total = info.programs.length;
    for (const p of info.programs) {
      const cat = (COMPARE_CATEGORIES as readonly string[]).includes(p.category) ? p.category : "other";
      byCategory[cat].count++;
      if (!byCategory[cat].top) byCategory[cat].top = { name: p.name, source: p.source };
    }
  }
  // Representative cost picture: the first metro in this state that carries cited official data.
  const metro = METROS_RAW.find((m) => m.state === code && m.official);
  const cost = metro && metro.official
    ? { metro: metro.name, rpp: metro.official.rpp, fmr2br: metro.official.fmr2br, unemployment: metro.official.unemployment }
    : null;

  return {
    code,
    name: stateName(code) || code,
    agency: info?.agency || null,
    totalPrograms: total,
    byCategory,
    cost,
  };
}

/** Two-letter codes that have cited metro cost data (for a small "cost data available" hint). */
export const STATES_WITH_COST: string[] = Array.from(
  new Set(METROS_RAW.filter((m) => m.official && m.state && m.state !== "—").map((m) => m.state))
);
