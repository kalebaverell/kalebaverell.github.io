// Homepage situation tiles (Sep 11). A veteran who already owns a business or
// is already in school does not see themselves in "transitioning out" - the
// generic CTA asks them to start from zero when they arrived with a specific
// question. These tiles state their situation and carry it into the intake.
//
// Account-first: a tile is a door to /onboarding like every other homepage
// CTA, never a bypass around it. The seed rides along and applies once the
// profile exists, so the plan answers the question they showed up with.
import type { Answers } from "./types";

export type SeedKey = "business-owner" | "student";

/** Each seeded value must be something the tile's own words literally claimed -
 *  we are recording what the veteran told us by clicking, not guessing. */
export const INTAKE_SEEDS: Record<SeedKey, Partial<Answers>> = {
  // businessInterest is what switches on the funded-path business layer
  // (VetCert, WOSB, VBOC, Grants.gov) in lib/funding.ts. We deliberately do
  // NOT seed the "start-a-business" goal: this veteran already started one,
  // and showing them a checked "Start a business" box reads as not listening.
  "business-owner": {
    employment: "Self-employed / business owner",
    businessInterest: "Yes - actively working on it",
  },
  // "I'm in school" does not say whether they are starting or finishing, so
  // educationGoals stays for them to answer. The goal we do seed is worded
  // exactly like the tile's promise ("Use my education benefits"), and it
  // pre-fills one of the three goals the plan gate requires.
  student: {
    employment: "Student",
    topGoals: ["use-education-benefits"],
  },
};

const KEY = "vp_intake_seed";

export function isSeedKey(v: string | null | undefined): v is SeedKey {
  return v === "business-owner" || v === "student";
}

/** Park the seed before the account gate. Creating an account round-trips
 *  through the email link and comes back without the query string, so the
 *  tile's intent has to survive somewhere other than the URL. */
export function parkSeed(key: SeedKey): void {
  try { sessionStorage.setItem(KEY, key); } catch { /* private mode: seed is a bonus, never required */ }
}

/** Read and consume the parked seed - applying it twice would stomp an answer
 *  the veteran changed by hand between steps. */
export function takeSeed(): SeedKey | null {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v) sessionStorage.removeItem(KEY);
    return isSeedKey(v) ? v : null;
  } catch {
    return null;
  }
}

/** Fill only the blanks. A returning veteran's own answers always win - the
 *  tile tells us where to start, it does not get to overwrite their history. */
export function applySeed(
  key: SeedKey,
  answers: Answers,
  setAnswer: (id: keyof Answers, value: unknown) => void
): void {
  for (const [id, value] of Object.entries(INTAKE_SEEDS[key])) {
    const cur = (answers as Record<string, unknown>)[id];
    const blank = cur === undefined || cur === "" || (Array.isArray(cur) && cur.length === 0);
    if (blank) setAnswer(id as keyof Answers, value);
  }
}
