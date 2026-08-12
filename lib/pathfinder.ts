// VetPath Pathfinder - deterministic, explainable decision engine (SAMPLE logic).
// Detailed inputs in → ranked career paths out, with a % fit and plain-language "why".
// Principle: the veteran's own stated preferences drive fit. A disability rating NEVER
// downgrades a career - it only informs location guidance and benefit highlights.
import type { Answers, AttrDim, Career, CareerFit } from "./types";
import { ASSESSMENT, CAREERS, LOCATIONS, NETWORKING, PRIORITY_DIMS, careerMedianPay } from "./data";

const DIMS: AttrDim[] = ["hands", "tech", "people", "data", "lead", "risk", "physical", "outdoor", "care", "autonomy"];

const DIM_PHRASE: Record<AttrDim, string> = {
  hands: "hands-on work, tools in hand",
  tech: "working with technology and systems",
  people: "working closely with people",
  data: "analysis and problem-solving",
  lead: "leading teams again",
  risk: "betting on your own upside",
  physical: "staying physical and on your feet",
  outdoor: "being outdoors and on the move",
  care: "taking care of people",
  autonomy: "owning your own outcomes",
};

export interface AssessmentInput {
  // question id -> chosen option label(s). Multi-select questions (pull)
  // store an array; old saved profiles hold plain strings everywhere.
  answers: Record<string, string | string[]>;
  free: string;
  intake: Answers;
}

/** Normalizes an answer to a list, accepting both shapes (old string / new array). */
export function asList(v: string | string[] | undefined): string[] {
  if (v == null || v === "") return [];
  return Array.isArray(v) ? v : [v];
}

/** The ruling objective from the `wins` question; "enjoy" doubles as the default (legacy behavior). */
export type Objective = "money" | "stability" | "enjoy" | "speed";
export function rulingObjective(answers: Record<string, string | string[]>): Objective {
  const q = ASSESSMENT.questions.find((x) => x.id === "wins");
  const chosen = asList(answers["wins"])[0];
  const obj = q?.options.find((o) => o.label === chosen)?.objective;
  return (obj === "money" || obj === "stability" || obj === "speed") ? obj : "enjoy";
}

function userVector(input: AssessmentInput): { vec: Record<AttrDim, number>; speed?: string; place?: string } {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  let speed: string | undefined;
  let place: string | undefined;
  for (const q of ASSESSMENT.questions) {
    // Multi-select answers (pull) blend: every selected direction contributes
    // its weights, so "hands AND leading ops" raises both dims instead of
    // forcing a premature single choice.
    for (const label of asList(input.answers[q.id])) {
      const opt = q.options.find((o) => o.label === label);
      if (!opt) continue;
      if (opt.speed) speed = opt.speed;
      if (opt.place) place = opt.place;
      if (opt.w) {
        for (const [d, v] of Object.entries(opt.w)) {
          sums[d] = (sums[d] || 0) + v;
          counts[d] = (counts[d] || 0) + 1;
        }
      }
    }
  }
  const vec = {} as Record<AttrDim, number>;
  for (const d of DIMS) vec[d] = counts[d] ? sums[d] / counts[d] : 2.5; // neutral where unsignaled
  return { vec, speed, place };
}

const SPEED_ORDER = ["weeks", "months", "2yr", "4yr"];

// Priority-weight helpers: level 0 (not now) → 3 (must-have); "Important" (2) is neutral.
const WEIGHT_FACTOR = [0.3, 0.65, 1, 1.5];
export function priorityFactor(a: Answers, dim: string): number {
  const pw = a.priorityWeights || {};
  const lvl = dim in pw ? pw[dim] : 2;
  return WEIGHT_FACTOR[lvl] ?? 1;
}
// Maps a career track to the life dimension the veteran weighted for it.
const TRACK_DIM: Record<string, string> = { entrepreneur: "business", education: "education", employment: "career", skilled: "career" };
const DIM_WORD: Record<string, string> = { business: "business ownership", education: "education", career: "your career" };

/** The veteran's weighted life dimensions, highest weight first (for display). */
export function rankedPriorities(a: Answers): { key: string; label: string; icon: string; level: number }[] {
  const pw = a.priorityWeights || {};
  return PRIORITY_DIMS
    .map((d) => ({ ...d, level: d.key in pw ? pw[d.key] : 2 }))
    .sort((x, y) => y.level - x.level);
}

export function scoreCareers(input: AssessmentInput): CareerFit[] {
  const { vec, speed } = userVector(input);
  const a = input.intake;
  const objective = rulingObjective(input.answers);
  const salMin = typeof a.salaryTarget?.min === "number" ? a.salaryTarget.min : null;
  const salMax = typeof a.salaryTarget?.max === "number" ? a.salaryTarget.max : null;
  const hasSalary = salMin != null || salMax != null;

  const results: CareerFit[] = CAREERS.map((c) => {
    // Weighted similarity across dims; a career's defining dims count more.
    let num = 0;
    let den = 0;
    for (const d of DIMS) {
      const w = Math.max(c.attrs[d], 1) / 5;
      num += w * (1 - Math.abs(c.attrs[d] - vec[d]) / 5);
      den += w;
    }
    let fit = (num / den) * 100;

    const boosts: string[] = [];
    // Pace alignment (their stated need for a paycheck)
    if (speed) {
      const diff = Math.abs(SPEED_ORDER.indexOf(c.speed) - SPEED_ORDER.indexOf(speed));
      if (diff === 0) { fit += 6; boosts.push("Matches how fast you need the first paycheck"); }
      else if (diff >= 2) fit -= 6;
    }
    // Intake signals - each scaled by how much the veteran weighted that dimension.
    if (a.businessInterest === "Yes - actively working on it" && c.track === "entrepreneur") {
      fit += 7 * priorityFactor(a, "business"); boosts.push("You said you're actively working toward a business");
    }
    if ((a.educationGoals || []).some((e) => e.includes("degree")) && c.track === "education") {
      fit += 5 * priorityFactor(a, "education"); boosts.push("Lines up with your education goals");
    }
    if ((a.careerGoals || []).includes("Start a business") && c.track === "entrepreneur") {
      fit += 4 * priorityFactor(a, "business"); boosts.push("You listed starting a business as a career goal");
    }
    if ((a.urgency || "").startsWith("Right now") && (c.speed === "weeks" || c.speed === "months")) {
      fit += 3; boosts.push("Fast on-ramp fits your urgency");
    }
    // Priority-weight tilt: nudge toward the track the veteran said matters most.
    const td = TRACK_DIM[c.track];
    if (td) {
      const tilt = (priorityFactor(a, td) - 1) * 8;
      fit += tilt;
      if (tilt >= 3) boosts.push(`You marked ${DIM_WORD[td]} a top priority`);
    }

    // Why bullets: the career's defining dims where the veteran signaled the same.
    const why: string[] = [];
    const ranked = DIMS.filter((d) => c.attrs[d] >= 4 && Math.abs(c.attrs[d] - vec[d]) <= 1.5)
      .sort((d1, d2) => vec[d2] - vec[d1]);
    for (const d of ranked.slice(0, 3)) why.push(`You want ${DIM_PHRASE[d]} - this path is built on it.`);
    if (why.length === 0) why.push("A balanced fit across what you told us.");

    // Salary-range match. In-range earns a nudge up; short of their stated
    // minimum pulls the rank down in proportion to the shortfall (capped, so
    // it informs the ordering but never hides a path). Above their max is
    // neither penalized nor flagged - more pay than asked for is not a miss.
    const medianPay = careerMedianPay(c);
    let meetsSalary: boolean | null = null;
    let belowTarget: boolean | null = null;
    if (hasSalary && medianPay != null) {
      meetsSalary = medianPay >= (salMin ?? 0) && medianPay <= (salMax ?? Infinity);
      belowTarget = salMin != null && medianPay < salMin;
      if (meetsSalary) { fit += 4; boosts.push(`Median pay ~$${medianPay.toLocaleString()} lands in your target range`); }
      else if (belowTarget) {
        const shortfall = (salMin! - medianPay) / salMin!;
        fit -= Math.min(12, 4 + Math.round(24 * shortfall));
      }
    }

    // Honest clash labels: dims this career leans on hard that the veteran
    // signaled away from. Under a ruling objective these paths stay ranked
    // on that objective - the clash is disclosed instead of hiding the path.
    const tradeoffs: string[] = [];
    if (objective !== "enjoy") {
      const OBJ_WORD: Record<Objective, string> = { money: "pay", stability: "stability", speed: "a fast start", enjoy: "" };
      for (const d of DIMS) {
        if (c.attrs[d] >= 4 && vec[d] <= 1.5) {
          tradeoffs.push(`Heavy on ${DIM_PHRASE[d]} - more than you'd prefer. You said ${OBJ_WORD[objective]} wins, so it stays ranked on ${OBJ_WORD[objective]}.`);
        }
      }
    }

    return { career: c, fit: Math.max(35, Math.min(99, Math.round(fit))), why, boosts, medianPay, meetsSalary, belowTarget, tradeoffs };
  });

  // The ruling objective decides the ORDER. The fit number stays what it
  // always was - preference fit - so a people-heavy path ranked #1 for a
  // money-first veteran shows its true (lower) fit next to its pay, with
  // the trade-off spelled out. Preferences refine; they never veto.
  if (objective === "money") {
    const pays = results.map((r) => r.medianPay).filter((p): p is number => p != null);
    const lo = Math.min(...pays);
    const hi = Math.max(...pays);
    const payNorm = (p: number | null | undefined) =>
      p == null ? 40 : hi === lo ? 50 : ((p - lo) / (hi - lo)) * 100;
    for (const r of results) {
      if (r.medianPay != null && payNorm(r.medianPay) >= 75) {
        r.boosts.unshift(`Median pay ~$${r.medianPay.toLocaleString()} - among the highest here, and you said money wins`);
      }
    }
    return results.sort((x, y) => (0.6 * payNorm(y.medianPay) + 0.4 * y.fit) - (0.6 * payNorm(x.medianPay) + 0.4 * x.fit));
  }
  if (objective === "stability") {
    const stab = (r: CareerFit) => r.fit + (r.career.attrs.risk >= 4 ? -8 : r.career.attrs.risk <= 2 ? 3 : 0);
    return results.sort((x, y) => stab(y) - stab(x));
  }
  if (objective === "speed") {
    const quick = (r: CareerFit) => r.fit + (3 - SPEED_ORDER.indexOf(r.career.speed)) * 6;
    return results.sort((x, y) => quick(y) - quick(x));
  }
  return results.sort((x, y) => y.fit - x.fit);
}

export function topTrack(fits: CareerFit[]): string {
  const byTrack: Record<string, { total: number; n: number }> = {};
  for (const f of fits.slice(0, 6)) {
    byTrack[f.career.track] = byTrack[f.career.track] || { total: 0, n: 0 };
    byTrack[f.career.track].total += f.fit;
    byTrack[f.career.track].n += 1;
  }
  return Object.entries(byTrack).sort((a, b) => b[1].total / b[1].n - a[1].total / a[1].n)[0]?.[0] || "employment";
}

// ---- Location guidance (sample) ----
export function locationGuidance(a: Answers, place: string | undefined, career?: Career) {
  const rating = a.disabilityRating || "";
  const high = rating === "60–90%" || rating === "100%";
  const mid = rating === "30–50%" || rating === "0–20%" || rating === "Claim pending or filing";
  const healthFocus = (a.wellnessPriorities || []).some((w) => w.includes("VA healthcare") || w.includes("Mental health"));

  const tips: string[] = [];
  if (high) tips.push(LOCATIONS.rules.highDisability);
  else if (mid || healthFocus) tips.push(LOCATIONS.rules.midDisability);
  if (place === "rural") tips.push(LOCATIONS.rules.ruralNote);
  tips.push(LOCATIONS.rules.generalNote);
  if (career && career.cityBias === "city" && place === "rural")
    tips.push(`Heads up: ${career.label} roles cluster in metro areas - a mid-size city may balance both.`);

  let metros = LOCATIONS.metros.filter((m) => m.name !== "Rural + telehealth pattern");
  if (place === "city") metros = metros.filter((m) => m.vibe === "big");
  else if (place === "rural") metros = metros.filter((m) => m.vibe !== "big");
  if (career) {
    const strong = metros.filter((m) => m.strongFor.includes(career.id));
    if (strong.length >= 2) metros = strong;
  }
  const picks = metros.slice(0, 3).map((m) => ({ name: m.name, state: m.state, va: m.va, note: m.note }));
  if (place === "rural") {
    const rural = LOCATIONS.metros.find((m) => m.name === "Rural + telehealth pattern");
    if (rural) picks.push({ name: rural.name, state: rural.state, va: rural.va, note: rural.note });
  }
  return { tips, metros: picks };
}

// ---- Networking selection ----
export function networkingFor(a: Answers, track?: string) {
  const picks: { name: string; what: string; url?: string }[] = [];
  picks.push(...NETWORKING.general.slice(0, 3));
  if (track && NETWORKING.byTrack[track]) picks.push(...NETWORKING.byTrack[track].slice(0, 3));
  picks.push(...NETWORKING.vaSpecific.slice(0, 2));
  if (a.sex === "Female") picks.push(...NETWORKING.targeted.women);
  const minority = (a.raceEthnicity || []).some((r) => r && r !== "White" && r !== "Prefer not to say");
  if (minority && track === "entrepreneur") picks.push(...NETWORKING.targeted.minority);
  return picks;
}
