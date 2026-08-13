import housingJson from "@/data/housingStates.json";

// State-level typical home values, embedded (small). Town-level data lives in
// public/housing/{ST}.json (21k+ places, sharded per state, fetched on demand)
// - regenerate both with the ZHVI download in scripts/README-housing.md.
export const HOUSING = housingJson as any as {
  meta: { source: string; sourceUrl: string; dataMonth: string; retrieved: string; note: string };
  states: Record<string, { name: string; value: number }>;
};

export type HousingPlace = { n: string; v: number; r: number };

// Sponsored lender/agent partners - EMPTY ON PURPOSE, and it must stay empty
// until the referral-model decision clears Frank and counsel (task #32,
// docs/tester-feedback-2026-08-12.md). Per-closing referral fees to an
// unlicensed party implicate RESPA Section 8 and Texas license law, and the
// privacy page + VSO one-pager currently promise no lead-selling and no ads.
// If that decision lands: entries render under a clearly-labeled "Sponsored"
// heading, the privacy page and printed pieces move in the same commit, and
// nothing about a veteran is ever sent to a partner without their explicit
// click. Until then the UI shows only the neutral, no-strings guidance.
export const HOUSING_PARTNERS: { name: string; role: string; url: string }[] = [];

const cache = new Map<string, HousingPlace[]>();

/** Loads a state's town list (typical home values). Cached per session. */
export async function fetchPlaces(code: string): Promise<HousingPlace[]> {
  const hit = cache.get(code);
  if (hit) return hit;
  const res = await fetch(`/housing/${code}.json`);
  if (!res.ok) throw new Error(`housing data for ${code}: HTTP ${res.status}`);
  const data = (await res.json()) as { places: HousingPlace[] };
  cache.set(code, data.places);
  return data.places;
}

export const fmtUsd = (v: number) => `$${Math.round(v).toLocaleString()}`;
