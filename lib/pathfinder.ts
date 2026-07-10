// VetPath Pathfinder — deterministic, explainable decision engine (SAMPLE logic).
// Detailed inputs in → ranked career paths out, with a % fit and plain-language "why".
// Principle: the veteran's own stated preferences drive fit. A disability rating NEVER
// downgrades a career — it only informs location guidance and benefit highlights.
import type { Answers, AttrDim, Career, CareerFit } from "./types";
import { ASSESSMENT, CAREERS, LOCATIONS, NETWORKING } from "./data";

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
  answers: Record<string, string>; // question id -> chosen option label
  free: string;
  intake: Answers;
}

function userVector(input: AssessmentInput): { vec: Record<AttrDim, number>; speed?: string; place?: string } {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  let speed: string | undefined;
  let place: string | undefined;
  for (const q of ASSESSMENT.questions) {
    const chosen = input.answers[q.id];
    if (!chosen) continue;
    const opt = q.options.find((o) => o.label === chosen);
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
  const vec = {} as Record<AttrDim, number>;
  for (const d of DIMS) vec[d] = counts[d] ? sums[d] / counts[d] : 2.5; // neutral where unsignaled
  return { vec, speed, place };
}

const SPEED_ORDER = ["weeks", "months", "2yr", "4yr"];

export function scoreCareers(input: AssessmentInput): CareerFit[] {
  const { vec, speed } = userVector(input);
  const a = input.intake;

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
    // Intake signals
    if (a.businessInterest === "Yes — actively working on it" && c.track === "entrepreneur") {
      fit += 7; boosts.push("You said you're actively working toward a business");
    }
    if ((a.educationGoals || []).some((e) => e.includes("degree")) && c.track === "education") {
      fit += 5; boosts.push("Lines up with your education goals");
    }
    if ((a.careerGoals || []).includes("Start a business") && c.track === "entrepreneur") {
      fit += 4; boosts.push("You listed starting a business as a career goal");
    }
    if ((a.urgency || "").startsWith("Right now") && (c.speed === "weeks" || c.speed === "months")) {
      fit += 3; boosts.push("Fast on-ramp fits your urgency");
    }

    // Why bullets: the career's defining dims where the veteran signaled the same.
    const why: string[] = [];
    const ranked = DIMS.filter((d) => c.attrs[d] >= 4 && Math.abs(c.attrs[d] - vec[d]) <= 1.5)
      .sort((d1, d2) => vec[d2] - vec[d1]);
    for (const d of ranked.slice(0, 3)) why.push(`You want ${DIM_PHRASE[d]} — this path is built on it.`);
    if (why.length === 0) why.push("A balanced fit across what you told us.");

    return { career: c, fit: Math.max(35, Math.min(99, Math.round(fit))), why, boosts };
  });

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
    tips.push(`Heads up: ${career.label} roles cluster in metro areas — a mid-size city may balance both.`);

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
