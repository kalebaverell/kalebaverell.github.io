// Reserve & National Guard module.
//
// Why this exists: most people who leave the service are "first termers" who finish one
// contract and never hear what continued service in the Guard or Reserve would actually
// cover - health care, dental, education, and a retirement they may already be part way
// toward. This module scores how relevant that option is to one veteran's answers and
// orders the benefit stack accordingly.
//
// Content rule (same as the rest of the site): every benefit here is a real program with an
// official source. Figures that change annually are NOT hard-coded - the card points at the
// official page where the current number lives. VetPath is not a recruiter and does not
// determine eligibility.

import reservesJson from "@/data/reserves.json";

export type Component = "guard" | "reserve" | "both";
export type BenefitCategory = "health" | "education" | "retirement" | "housing" | "protection" | "lifestyle";

export interface ReserveBenefit {
  id: string;
  category: BenefitCategory;
  name: string;
  /** Which component this applies to. State-funded benefits generally attach to the Guard. */
  who: Component;
  /** One plain sentence a person with no benefits background understands. */
  summary: string;
  /** The detail that makes it real: how it works, what it is worth, what the catch is. */
  detail: string;
  /** Eligibility in plain language. */
  eligibility?: string;
  /** Caveat shown in muted text, e.g. "Rates are set annually." */
  note?: string;
  source: string;
  sourceLabel: string;
}

export interface StateEducationProgram {
  code: string;
  state: string;
  program: string;
  blurb: string;
  eligibility?: string;
  source: string;
  sourceLabel: string;
}

export interface ComponentFact {
  id: "guard" | "reserve";
  label: string;
  /** The one-line mental model. */
  essence: string;
  points: string[];
  source: string;
  sourceLabel: string;
}

interface ReservesFile {
  _note: string;
  lastVerified: string;
  disclaimer: string;
  notRecruiter: string;
  components: ComponentFact[];
  benefits: ReserveBenefit[];
  stateEducation: StateEducationProgram[];
  stateEducationNote: string;
}

const FILE = reservesJson as unknown as ReservesFile;

export const RESERVES_NOTE = FILE._note;
export const RESERVES_VERIFIED = FILE.lastVerified;
export const RESERVES_DISCLAIMER = FILE.disclaimer;
export const RESERVES_NOT_RECRUITER = FILE.notRecruiter;
export const COMPONENTS = FILE.components;
export const RESERVE_BENEFITS = FILE.benefits;
export const STATE_EDUCATION = FILE.stateEducation;
export const STATE_EDUCATION_NOTE = FILE.stateEducationNote;

export const CATEGORY_META: Record<BenefitCategory, { label: string; icon: string }> = {
  health: { label: "Health & dental", icon: "ti-heartbeat" },
  education: { label: "Education", icon: "ti-school" },
  retirement: { label: "Retirement", icon: "ti-hourglass" },
  housing: { label: "Home buying", icon: "ti-home" },
  protection: { label: "Job & life protection", icon: "ti-shield-check" },
  lifestyle: { label: "Everyday", icon: "ti-shopping-bag" },
};

/** The subset of intake answers this module reads. */
export interface AnswersLike {
  status?: string;
  serviceEra?: string;
  employment?: string;
  ageRange?: string;
  educationGoals?: string[];
  familyNeeds?: string[];
  careerGoals?: string[];
  state?: string | string[];
}

export interface RelevanceReason {
  icon: string;
  text: string;
}

export interface ReserveFit {
  /** 0-100 demo estimate of how worth-a-look this option is for this veteran. */
  score: number;
  level: "strong" | "worth-a-look" | "background";
  /** Why we surfaced it, in the veteran's own terms. */
  reasons: RelevanceReason[];
  /** Benefit ids to lead with, most relevant first. */
  leadWith: string[];
}

const has = (arr: string[] | undefined, re: RegExp) => (arr || []).some((v) => re.test(v));

/**
 * Score how relevant continued Guard/Reserve service is, and decide which benefits to lead
 * with. Deterministic rules, no model in the loop - the same answers always produce the
 * same result, which is what makes it explainable on the page.
 */
export function reserveFit(a: AnswersLike): ReserveFit {
  const reasons: RelevanceReason[] = [];
  const leadWith: string[] = [];
  let score = 30; // baseline: worth knowing about for almost anyone leaving

  const status = a.status || "";
  const serving = /Active duty|Transitioning/i.test(status) || /Currently serving/i.test(a.serviceEra || "");
  const retired = /Retired \(20/i.test(status);

  // Someone still in has the cleanest path: an affiliation transfer rather than a re-enlistment.
  if (serving) {
    score += 25;
    reasons.push({
      icon: "ti-clock-play",
      text: "You are still in or separating soon, which is the easiest point to move into a Guard or Reserve unit without a break in service.",
    });
  }

  // The health-care gap is the single most concrete reason this matters.
  if (/Unemployed|job seeking|Unable to work/i.test(a.employment || "")) {
    score += 20;
    leadWith.push("trs", "tdp");
    reasons.push({
      icon: "ti-heartbeat",
      text: "You are between jobs, so a premium-based health plan for you and your family is the benefit to look at first.",
    });
  } else if (/Self-employed|business owner/i.test(a.employment || "")) {
    score += 18;
    leadWith.push("trs");
    reasons.push({
      icon: "ti-briefcase",
      text: "Self-employed people buy their own health insurance, which is usually the most expensive way to get it.",
    });
  } else if (/Student/i.test(a.employment || "")) {
    score += 12;
    leadWith.push("trs", "mgib-sr");
    reasons.push({
      icon: "ti-school",
      text: "As a student you may be paying for both tuition and your own health coverage.",
    });
  }

  // Education goals map straight onto the Selected Reserve education benefit and state programs.
  if (has(a.educationGoals, /degree|Trade|certification/i)) {
    score += 15;
    leadWith.push("mgib-sr", "state-tuition");
    reasons.push({
      icon: "ti-certificate",
      text: "You have school in your plan, and drilling members can stack a Selected Reserve education benefit with state tuition programs.",
    });
  }

  // Family coverage changes the math more than anything else.
  if (has(a.familyNeeds, /Spouse|Dependent|Childcare/i)) {
    score += 10;
    leadWith.push("trs", "tdp");
    reasons.push({
      icon: "ti-users",
      text: "Family coverage is where the cost difference against a civilian plan shows up most.",
    });
  }

  // Retirement only lands if there is realistically time to reach 20 qualifying years.
  if (!retired && /Under 25|25–34|25-34|35–44|35-44/.test(a.ageRange || "")) {
    score += 10;
    leadWith.push("retirement");
    reasons.push({
      icon: "ti-hourglass",
      text: "Years you already served count toward a reserve retirement, and you have time to reach the 20 qualifying years.",
    });
  }

  // Already retired from a full career: this is background, not a live option.
  if (retired) {
    score -= 25;
    reasons.push({
      icon: "ti-info-circle",
      text: "You already retired from a full career, so this section is here for context and for family members rather than as a next step.",
    });
  }

  score = Math.max(5, Math.min(95, score));
  const level: ReserveFit["level"] = score >= 65 ? "strong" : score >= 40 ? "worth-a-look" : "background";

  // Always lead with health care when nothing more specific surfaced: it is the headline.
  if (leadWith.length === 0) leadWith.push("trs", "mgib-sr", "retirement");

  return { score, level, reasons, leadWith: Array.from(new Set(leadWith)) };
}

/** Order the benefit stack so the most relevant cards for this veteran come first. */
export function orderedBenefits(fit: ReserveFit): ReserveBenefit[] {
  const rank = new Map(fit.leadWith.map((id, i) => [id, i]));
  return [...RESERVE_BENEFITS].sort((x, y) => {
    const rx = rank.has(x.id) ? rank.get(x.id)! : 999;
    const ry = rank.has(y.id) ? rank.get(y.id)! : 999;
    return rx - ry;
  });
}

/** Verified state Guard education programs for the states a veteran lives in. */
export function stateEducationFor(codes: string[]): StateEducationProgram[] {
  return STATE_EDUCATION.filter((p) => codes.includes(p.code));
}

/** How many jurisdictions we have verified. Derived, so the copy can never go stale. */
export const STATE_EDUCATION_COVERAGE = new Set(STATE_EDUCATION.map((p) => p.code)).size;
