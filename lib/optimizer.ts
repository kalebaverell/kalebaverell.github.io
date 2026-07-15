// VetPath Benefits Optimizer — a pure, deterministic, explainable rules engine.
// No React, no side effects: (answers) => ordered, tiered benefit recommendations,
// each with plain-language reasons tied to the veteran's own answers.
//
// IMPORTANT: this is decision support, NOT an eligibility determination.
// Every rule errs toward "check it" language and official-source verification.

import stateBenefitsJson from "@/data/stateBenefits.json";
import benefitsJson from "@/data/sampleBenefits.json";

export type Tier = "now" | "check" | "later" | "unlikely";

export interface OptimizedBenefit {
  id: string;
  tier: Tier;
  reasons: string[];
  timing?: string;
}

/** Minimal local shape of the intake answers (subset of lib/types Answers — kept local so this module stays standalone). */
export interface AnswersLike {
  ageRange?: string;
  state?: string | string[];
  serviceEra?: string;
  status?: string;
  disabilityRating?: string;
  employment?: string;
  housing?: string[];
  careerGoals?: string[];
  educationGoals?: string[];
  businessInterest?: string;
  wellnessPriorities?: string[];
  financialPriorities?: string[];
  familyNeeds?: string[];
  topGoals?: string[];
  urgency?: string;
}

// ---------------------------------------------------------------------------
// Data joins (state benefits + canonical benefit order)
// ---------------------------------------------------------------------------

interface StateProgramLike { name: string; category: string; blurb: string; source: string }
interface StateInfoLike { code: string; name: string; agency: { name: string; url: string }; programs: StateProgramLike[] }

const STATE_DATA: StateInfoLike[] = (stateBenefitsJson as unknown as { states: StateInfoLike[] }).states;

/** Benefit ids in library order — the single source of truth is sampleBenefits.json. */
const BENEFIT_IDS: string[] = (benefitsJson as unknown as { categories: { id: string }[] }).categories.map((c) => c.id);

function stateInfo(code?: string): StateInfoLike | undefined {
  return code ? STATE_DATA.find((s) => s.code === code) : undefined;
}

/** Prefer a property-tax program (that's the big-dollar item for rated homeowners); fall back to any tax program. */
function bestTaxProgram(info: StateInfoLike): StateProgramLike | undefined {
  const tax = info.programs.filter((p) => p.category === "tax");
  return tax.find((p) => /propert|homestead/i.test(p.name)) ?? tax[0];
}

// ---------------------------------------------------------------------------
// Answer parsing helpers (option strings must match data/intakeQuestions.json)
// ---------------------------------------------------------------------------

type RatingBand = "none" | "pending" | "low" | "mid" | "high" | "total" | "unknown";

function ratingBand(r?: string): RatingBand {
  switch (r) {
    case "None / not rated": return "none";
    case "Claim pending or filing": return "pending";
    case "0–20%": return "low";
    case "30–50%": return "mid";
    case "60–90%": return "high";
    case "100%": return "total";
    default: return "unknown";
  }
}

const RATING_LABEL: Record<RatingBand, string> = {
  none: "not rated", pending: "claim pending", low: "0–20%", mid: "30–50%", high: "60–90%", total: "100%", unknown: "unrated",
};

const has = (arr: string[] | undefined, v: string): boolean => !!arr && arr.includes(v);

// ---------------------------------------------------------------------------
// Tier engine
// ---------------------------------------------------------------------------

const TIER_RANK: Record<Tier, number> = { now: 0, check: 1, later: 2, unlikely: 3 };

interface Draft {
  tier: Tier;       // best tier any rule promoted this benefit to (floor)
  cap?: Tier;       // worst tier any rule capped this benefit at (ceiling)
  reasons: string[];
  capReasons: string[];
  timing?: string;
  hits: number;     // promotion count — used for deterministic within-tier ordering
}

function createEngine() {
  const drafts = new Map<string, Draft>();
  for (const id of BENEFIT_IDS) {
    drafts.set(id, { tier: "later", reasons: [], capReasons: [], hits: 0 });
  }

  /** Raise a benefit to at least `tier` and attach a reason (max 3 kept, no duplicates). */
  const promote = (id: string, tier: Tier, reason?: string, timing?: string) => {
    const d = drafts.get(id);
    if (!d) return;
    if (TIER_RANK[tier] < TIER_RANK[d.tier]) d.tier = tier;
    if (reason && !d.reasons.includes(reason)) d.reasons.push(reason);
    if (timing && !d.timing) d.timing = timing;
    d.hits += 1;
  };

  /** Cap a benefit at no better than `tier` (honesty rule) with an explanation. */
  const cap = (id: string, tier: Tier, reason: string) => {
    const d = drafts.get(id);
    if (!d) return;
    if (!d.cap || TIER_RANK[tier] > TIER_RANK[d.cap]) d.cap = tier;
    if (!d.capReasons.includes(reason)) d.capReasons.push(reason);
  };

  const finalize = (): OptimizedBenefit[] => {
    const out: OptimizedBenefit[] = [];
    for (const id of BENEFIT_IDS) {
      const d = drafts.get(id)!;
      let tier = d.tier;
      let reasons = d.reasons;
      if (d.cap && TIER_RANK[d.cap] > TIER_RANK[tier]) {
        tier = d.cap;
        reasons = [...d.capReasons, ...d.reasons]; // lead with why it was held back
      }
      if (reasons.length === 0) {
        reasons = ["Nothing in your answers points here right now — worth a look if your plans change."];
      }
      out.push({ id, tier, reasons: reasons.slice(0, 3), timing: d.timing });
    }
    out.sort((x, y) =>
      TIER_RANK[x.tier] - TIER_RANK[y.tier] ||
      (drafts.get(y.id)!.hits - drafts.get(x.id)!.hits) ||
      BENEFIT_IDS.indexOf(x.id) - BENEFIT_IDS.indexOf(y.id)
    );
    return out;
  };

  return { promote, cap, finalize };
}

// ---------------------------------------------------------------------------
// The optimizer
// ---------------------------------------------------------------------------

export function optimizeBenefits(a: AnswersLike): OptimizedBenefit[] {
  const { promote, cap, finalize } = createEngine();

  // --- Parsed signals -------------------------------------------------------
  const isActive = a.status === "Active duty";
  const isTransitioning = a.status === "Transitioning (separating within 12 months)";
  const isVeteran = a.status === "Veteran";
  const isRetired = a.status === "Retired (20+ years of service)";
  const isFamily = a.status === "Spouse / family member";
  const serving = isActive || isTransitioning;

  const band = ratingBand(a.disabilityRating);
  const rated = band === "low" || band === "mid" || band === "high" || band === "total";
  const ratingLabel = RATING_LABEL[band];

  const urgent = a.urgency === "Right now — I need help urgently";
  // housing is a multi-select list; tolerate legacy string-valued data from older saved profiles.
  const housingList = Array.isArray(a.housing) ? a.housing : a.housing ? [a.housing] : [];
  const ownsHome = housingList.includes("Own a home") || housingList.includes("Own property in another state");
  const housingUnstable = housingList.includes("Unstable / at risk") || housingList.includes("Currently homeless");
  const jobSeeking = a.employment === "Unemployed / job seeking" || a.employment === "Unable to work right now";
  const olderVet = a.ageRange === "55–64" || a.ageRange === "65+";

  const wantsEducation =
    has(a.topGoals, "use-education-benefits") ||
    (a.educationGoals ?? []).some((g) => g !== "No education plans" && g !== "Help a dependent with school");
  const wantsDependentSchool = has(a.educationGoals, "Help a dependent with school") || has(a.familyNeeds, "Dependent education");
  const wantsBusiness =
    a.businessInterest === "Yes — actively working on it" ||
    has(a.careerGoals, "Start a business") ||
    has(a.topGoals, "start-a-business");
  const businessCurious = a.businessInterest === "Yes — someday";
  const wantsHome = has(a.financialPriorities, "Buy a home") || has(a.topGoals, "buy-a-home");
  const wantsBetterJob =
    has(a.careerGoals, "Get a better job") || has(a.careerGoals, "Change careers") || has(a.topGoals, "get-better-job");

  // Residence is a "select all that apply" list; the primary (first) state anchors state benefits.
  const st = stateInfo(Array.isArray(a.state) ? a.state[0] : a.state);

  // --- 1. Safety and stability come before everything else ------------------
  if (urgent) {
    promote("mental-health-crisis", "now",
      "You said you need help right now — the Veterans Crisis Line is free, confidential, and open 24/7: dial 988, then press 1, or text 838255.",
      "Available 24/7 — no VA enrollment needed");
  }
  if (housingUnstable) {
    promote("mental-health-crisis", "now",
      "Your housing situation is at risk — the National Call Center for Homeless Veterans (1-877-424-3838) and the Veterans Crisis Line (988 then 1; text 838255) are free and answer 24/7.",
      "Available 24/7 — no VA enrollment needed");
    promote("va-healthcare", "now",
      "VA health care is the doorway to VA housing help (HUD-VASH, SSVF) — enrolling connects you to a homeless-program coordinator.");
  }
  if (has(a.wellnessPriorities, "Mental health support")) {
    promote("mental-health-crisis", "now",
      "You named mental health support as a priority — VA mental health care and Vet Centers are confidential and don't require a disability rating.");
  }
  // Baseline: crisis support is open to everyone, always at least "check".
  promote("mental-health-crisis", "check",
    "Open to you and your family 24/7 with no VA enrollment — save it now: dial 988, then press 1 (or text 838255).");

  // --- 2. Transition timing (the clock that matters most) -------------------
  if (isTransitioning) {
    promote("va-disability", "now",
      "You're separating within 12 months — a Benefits Delivery at Discharge (BDD) claim gets your rating decision moving before you're out.",
      "BDD window: file 90–180 days before separation");
    promote("va-disability", "now", "File an Intent to File to lock your effective date while you gather records.");
    promote("va-healthcare", "now",
      "Enroll as you transition so health coverage is in place from day one as a civilian.");
    promote("employment", "check",
      "Before you separate, line up SkillBridge, apprenticeships, and the DoD TAP employment track.");
  }
  if (isActive) {
    promote("va-disability", "now",
      "You're still serving — a pre-discharge (BDD) claim is the fastest route to a rating decision when you separate.",
      "BDD window: file 90–180 days before separation");
    promote("va-disability", "now", "File an Intent to File to lock your effective date while you gather records.");
    promote("va-healthcare", "now",
      "Get your VA health care enrollment lined up before you leave active duty — coverage gaps are avoidable.");
  }
  if ((isVeteran || isRetired) && band === "none") {
    promote("va-disability", "check",
      "You're not rated yet — if any condition traces back to service, a free accredited VSO can help you file.");
    promote("va-disability", "check", "File an Intent to File first — it locks your effective date while you gather records.");
  }
  if (band === "pending") {
    promote("va-disability", "now",
      "Your claim is pending — track it on VA.gov and respond quickly to exam requests so the decision isn't delayed.");
  }
  if (rated && !serving) {
    promote("va-disability", "check",
      `You're rated ${ratingLabel} — if conditions have worsened or new ones surfaced, you can file for an increase.`);
  }
  if (isFamily) {
    cap("va-disability", "unlikely",
      "Disability compensation goes to the veteran — as a family member, look at DIC and survivor programs under Family & dependent benefits instead.");
  }

  // --- 3. VA health care ----------------------------------------------------
  if (isVeteran || isRetired) {
    promote("va-healthcare", "check",
      "Most veterans discharged under other than dishonorable conditions can apply — your priority group depends on rating, income, and exposures.");
  }
  if (has(a.wellnessPriorities, "VA healthcare / physical health")) {
    promote("va-healthcare", "now",
      "You named VA health care as a priority — apply online at VA.gov, by phone (877-222-8387), or with a VSO.");
  }
  if (band === "high" || band === "total") {
    promote("va-healthcare", "now",
      `At ${ratingLabel}, you're in a top enrollment priority group with low or no copays — enroll if you haven't.`);
  }
  if (a.serviceEra === "Post-9/11 (2001–present)" || a.serviceEra === "Gulf War (1990–2001)" || a.serviceEra === "Vietnam era") {
    promote("va-healthcare", "check",
      `PACT Act: ${a.serviceEra!.replace(/\s*\(.*\)/, "")}-era service may let you enroll directly based on toxic exposure — no other VA benefit needed first.`);
  }
  if (isFamily) {
    cap("va-healthcare", "check",
      "VA health care serves the veteran — for spouse and dependent coverage, see CHAMPVA under Family & dependent benefits.");
  }

  // --- 4. GI Bill & education ------------------------------------------------
  if (wantsEducation) {
    const eduGoal = (a.educationGoals ?? []).find((g) => g !== "No education plans" && g !== "Help a dependent with school");
    promote("gi-bill", "now",
      eduGoal
        ? `You said "${eduGoal.toLowerCase()}" — the GI Bill covers tuition, a housing allowance, and books; vet your program with the GI Bill Comparison Tool.`
        : "Education is one of your top goals — the GI Bill covers tuition, a housing allowance, and books.");
  }
  if (wantsDependentSchool) {
    if (serving) {
      promote("gi-bill", "now",
        "You want to help a dependent with school — GI Bill transfer must be requested and approved by DoD while you're still serving; you can't start it after separation.",
        "Transfer: elect while still serving (DoD approval)");
      promote("family-dependent", "check",
        "Once a GI Bill transfer is approved, your dependent's benefits are managed under family programs — worth a look now.");
    } else {
      promote("family-dependent", "check",
        "The GI Bill can't be transferred after separation — but DEA (Chapter 35) may cover a dependent's school if you're rated permanently and totally disabled.");
    }
  }
  if (serving && !wantsDependentSchool) {
    // Transfer heads-up is only ever relevant while serving.
    promote("gi-bill", "check",
      "Heads-up while you're still in: transferring the GI Bill to a spouse or child must be elected and DoD-approved before you separate.");
  }
  if (isFamily) {
    promote("gi-bill", "check",
      "As a spouse or family member you may use transferred GI Bill benefits or DEA (Chapter 35) — the veteran's status controls which applies.");
  }
  if (!wantsEducation && !wantsDependentSchool && has(a.educationGoals, "No education plans") && !serving && !isFamily) {
    cap("gi-bill", "later",
      "You said no education plans right now — your Post-9/11 benefits don't expire if you were discharged on or after January 1, 2013.");
  }

  // --- 5. VA home loan --------------------------------------------------------
  if (wantsHome) {
    promote("va-home-loan", "now",
      "Buying a home is on your list — the VA loan needs no down payment and no PMI; step one is your Certificate of Eligibility.");
    if (rated) {
      promote("va-home-loan", "now",
        `Because you're rated ${ratingLabel} and receiving compensation, you're likely exempt from the VA funding fee — thousands saved at closing.`);
    }
  } else if (ownsHome) {
    promote("va-home-loan", "later",
      "You already own — the VA loan can still help with a rate-reduction refinance (IRRRL) or your next purchase.");
  } else if (housingList.includes("Rent") || housingList.includes("Living with family")) {
    promote("va-home-loan", "check",
      "You're not a homeowner yet — when you're ready to buy, the VA loan is usually the strongest first option for veterans.");
  }
  if (housingUnstable) {
    cap("va-home-loan", "later",
      "Stabilize housing first — VA homeless programs come before a purchase; the loan guaranty will be there when you're ready.");
  }
  if (isFamily) {
    cap("va-home-loan", "check",
      "Only some surviving spouses qualify for the VA loan — check the DIC-linked eligibility rules before planning around it.");
  }

  // --- 6. VR&E (Chapter 31) ---------------------------------------------------
  const wantsWorkChange = jobSeeking || wantsBetterJob || has(a.topGoals, "transition-out");
  if ((band === "mid" || band === "high" || band === "total") && wantsWorkChange) {
    promote("vre", "now",
      `You're rated ${ratingLabel} and looking at a work change — VR&E can pay for retraining, education, and job support beyond the GI Bill.`);
  } else if (band === "low" && wantsWorkChange) {
    promote("vre", "check",
      "VR&E needs at least a 10% service-connected rating — you're in the 0–20% band, so check your exact rating before applying.");
  } else if (rated) {
    promote("vre", "check",
      `With a ${ratingLabel} service-connected rating, VR&E is worth knowing about if your condition ever limits your work.`);
  }
  if (band === "pending") {
    promote("vre", "later",
      "Once your pending claim results in a 10%+ rating, VR&E opens up — keep it on the radar.");
  }
  if (band === "none") {
    cap("vre", "unlikely",
      "VR&E requires a service-connected disability rating (at least 10%) — file a disability claim first if a condition traces to service.");
  }
  if (isFamily) {
    cap("vre", "unlikely",
      "VR&E serves the rated veteran — for a dependent's education and career help, see DEA under Family & dependent benefits.");
  }

  // --- 7. Employment ------------------------------------------------------------
  if (jobSeeking) {
    promote("employment", "now",
      "You're job seeking — American Job Centers give veterans priority of service, with DVOP specialists for one-on-one help.");
  }
  if (wantsBetterJob) {
    promote("employment", "now",
      "A better job is one of your goals — start with priority-of-service programs and veteran-focused apprenticeships.");
  }
  if (isFamily) {
    promote("employment", "check",
      "Eligible spouses also get priority of service at American Job Centers — it's not just for the veteran.");
  }
  if (a.employment === "Employed full-time" && !wantsBetterJob && !jobSeeking) {
    promote("employment", "later",
      "You're employed full-time — keep this in your back pocket for a future career move.");
  }
  if (a.employment === "Retired" && !wantsBetterJob) {
    cap("employment", "later", "You're retired — job placement programs only matter if you want to work again.");
  }

  // --- 8. Veteran-owned business ------------------------------------------------
  if (wantsBusiness) {
    promote("veteran-business", "now",
      "You're actively pursuing a business — Boots to Business and your local VBOC are free starting points.");
    if (rated) {
      promote("veteran-business", "now",
        "As a service-disabled veteran, SDVOSB certification through SBA VetCert (veterans.certify.sba.gov) unlocks federal set-aside contracts.");
    }
  } else if (businessCurious) {
    promote("veteran-business", "check",
      "You're business-curious — the free Boots to Business course is a no-commitment way to test the idea.");
  } else if (a.businessInterest === "No") {
    cap("veteran-business", "unlikely",
      "You said business ownership isn't in your plans — skip this for now; it'll be here if that changes.");
  }

  // --- 9. Retirement & survivor benefits -----------------------------------------
  if (isRetired) {
    promote("retirement-survivor", "now",
      "You retired with 20+ years — make sure DFAS retired pay, SBP elections, and beneficiary designations all line up.");
  }
  if (olderVet) {
    promote("retirement-survivor", "check",
      `You're ${a.ageRange} — reviewing survivor protection and pension eligibility now avoids gaps later.`);
  }
  if (has(a.financialPriorities, "Retirement planning") || has(a.financialPriorities, "Protect my family (survivor benefits)") || has(a.topGoals, "prepare-retirement")) {
    promote("retirement-survivor", "now",
      "You flagged retirement or family protection as a financial priority — VA pension, Aid & Attendance, and SBP are the pieces to review.");
  }
  if (has(a.careerGoals, "Wind down toward retirement") || a.employment === "Retired") {
    promote("retirement-survivor", "check",
      "You're winding down toward retirement — this is the right season to review pension and survivor protections.");
  }

  // --- 10. Family & dependent benefits ---------------------------------------------
  if (isFamily) {
    promote("family-dependent", "now",
      "You're a spouse or family member — this category is your front door: education (DEA), health coverage (CHAMPVA), and survivor support live here.");
  }
  if (has(a.familyNeeds, "Spouse benefits")) {
    promote("family-dependent", "check",
      "You flagged spouse benefits — transferred GI Bill, CHAMPVA, and survivor programs each have their own rules worth checking.");
  }
  if (has(a.familyNeeds, "Caregiver support")) {
    promote("family-dependent", band === "high" || band === "total" ? "now" : "check",
      "You flagged caregiver support — VA runs two programs: PCAFC (veteran rated 70%+, joint application on VA Form 10-10CG) and the broader PGCSS.");
  }
  if (band === "high") {
    promote("family-dependent", "check",
      "Caregiver support may be in reach: PCAFC requires a 70%+ rating and you're in the 60–90% band — check your exact combined rating; PGCSS has broader access.");
  }
  if (band === "total") {
    promote("family-dependent", "check",
      "At 100%, your spouse and children may qualify for CHAMPVA — but only if your rating is permanent and total (P&T); confirm P&T status on your award letter.");
    promote("family-dependent", "check",
      "A permanent and total rating also opens DEA (Chapter 35) education benefits for your dependents.");
  }
  if (has(a.familyNeeds, "Childcare")) {
    promote("family-dependent", "check",
      "You flagged childcare — federal support here is thin; ask your VA facility about pilots and your state agency about local programs.");
  }

  // --- 11. State benefits -------------------------------------------------------------
  if (st) {
    promote("state-benefits", "check",
      `You're in ${st.name} — ${st.agency.name} runs benefits many veterans never hear about.`);
    const tax = bestTaxProgram(st);
    if ((band === "high" || band === "total") && tax) {
      promote("state-benefits", "now",
        `Because you're ${ratingLabel} rated and in ${st.name}, look at "${tax.name}" — property-tax relief often keys off your disability rating.`);
    }
    // Property-tax relief keys off the primary residence in the user's state, so tie this to
    // "Own a home" specifically (not a home owned in another state).
    if (housingList.includes("Own a home") && rated && tax) {
      promote("state-benefits", "now",
        `You own your home and have a rating — in ${st.name}, "${tax.name}" could be worth real money every year.`);
    }
    if (has(a.topGoals, "move-new-state")) {
      promote("state-benefits", "now",
        "You're planning a move — compare state benefits before you pick the state; property tax, tuition, and license perks differ a lot.");
    }
    if (has(a.topGoals, "find-local-support")) {
      promote("state-benefits", "check",
        `Local support starts with ${st.agency.name} — they can route you to county-level help too.`);
    }
  } else {
    promote("state-benefits", "later",
      "Tell us your state and we'll point at specific programs — every state runs its own set.");
  }

  return finalize();
}
