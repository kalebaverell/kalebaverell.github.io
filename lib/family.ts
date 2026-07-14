// lib/family.ts — Family-centered planning logic (pure, no React).
// VetPath differentiator: veterans decide as a household. This module turns the
// veteran's intake answers into household checkpoints, shared decisions, and
// audience-filtered official resources. SAMPLE/educational content only — no
// eligibility guarantees, ever.

import familyJson from "../data/familyResources.json";

// ---------- Local minimal types (kept here so lib/types.ts stays untouched) ----------

export type FamilyWho = "spouse" | "kids" | "caregiver" | "household";
export type FamilyAudience = "spouse" | "kids" | "caregiver" | "survivor" | "household";

export interface FamilyEntry {
  name: string;
  what: string;
  /** Official external source (va.gov, .mil, .gov). */
  url?: string;
  /** Internal app route (e.g. "/benefits") when the pointer lives inside VetPath. */
  internal?: string;
  audience: FamilyAudience[];
  /** Honest scope limits (e.g. "strongest while still serving"). */
  scopeNote?: string;
  /** Date this entry's program facts were checked against the official source. */
  verified?: string;
  /** Filled at load time so the page can group filtered entries. */
  groupId?: string;
}

export interface FamilyGroup {
  id: string;
  label: string;
  icon: string;
  entries: FamilyEntry[];
}

export interface FamilyCheckpoint {
  when: "30" | "60" | "90" | "long";
  text: string;
  who: FamilyWho;
}

/** Minimal structural slice of Answers — read-only view, no import of lib/types needed. */
export interface AnswersLike {
  status?: string;
  disabilityRating?: string;
  housing?: string[];
  familyNeeds?: string[];
  topGoals?: string[];
  educationGoals?: string[];
  financialPriorities?: string[];
}

export interface FamilyPlan {
  checkpoints: FamilyCheckpoint[];
  decisions: string[];
  resources: FamilyEntry[];
}

// ---------- Data ----------

const FILE = familyJson as unknown as { _note: string; groups: FamilyGroup[] };

export const FAMILY_NOTE: string = FILE._note;

export const FAMILY_GROUPS: FamilyGroup[] = FILE.groups.map((g) => ({
  ...g,
  entries: g.entries.map((e) => ({ ...e, groupId: g.id })),
}));

// ---------- Selection helpers ----------

/** True when the veteran picked any family/dependent need other than "None". */
export function hasFamilySelections(a: AnswersLike): boolean {
  return (a.familyNeeds || []).some((f) => !!f && f !== "None");
}

/** Which audiences the household plan should cover, from intake selections. */
export function familyAudiences(a: AnswersLike): FamilyAudience[] {
  if (!hasFamilySelections(a)) return [];
  const needs = a.familyNeeds || [];
  const out = new Set<FamilyAudience>(["household"]); // any family selection = household lens
  if (needs.includes("Spouse benefits")) out.add("spouse");
  if (needs.includes("Dependent education") || needs.includes("Childcare")) out.add("kids");
  if ((a.educationGoals || []).includes("Help a dependent with school")) out.add("kids");
  if (needs.includes("Caregiver support")) out.add("caregiver");
  if ((a.financialPriorities || []).includes("Protect my family (survivor benefits)")) out.add("survivor");
  if (a.status === "Retired (20+ years of service)") out.add("survivor");
  return Array.from(out);
}

// ---------- Plan builder ----------

const WHEN_ORDER: Record<FamilyCheckpoint["when"], number> = { "30": 0, "60": 1, "90": 2, long: 3 };

export function buildFamilyPlan(a: AnswersLike, careerLabel?: string): FamilyPlan {
  if (!hasFamilySelections(a)) return { checkpoints: [], decisions: [], resources: [] };

  const needs = a.familyNeeds || [];
  const goals = a.topGoals || [];
  const status = a.status || "";
  const rating = a.disabilityRating || "";

  const isServing = status === "Active duty" || status.startsWith("Transitioning");
  const spouse = needs.includes("Spouse benefits");
  const kidsEdu = needs.includes("Dependent education") || (a.educationGoals || []).includes("Help a dependent with school");
  const childcare = needs.includes("Childcare");
  const kids = kidsEdu || childcare;
  const caregiver = needs.includes("Caregiver support");
  const moving = goals.includes("move-new-state");
  const highRating = rating === "60–90%" || rating === "100%";
  const housingList = Array.isArray(a.housing) ? a.housing : a.housing ? [a.housing] : [];
  const housingUnstable = housingList.includes("Unstable / at risk") || housingList.includes("Currently homeless");
  const survivorInterest =
    (a.financialPriorities || []).includes("Protect my family (survivor benefits)") ||
    status === "Retired (20+ years of service)" ||
    goals.includes("prepare-retirement");

  const checkpoints: FamilyCheckpoint[] = [];
  const decisions: string[] = [];

  // Stability outranks everything — put it first.
  if (housingUnstable) {
    checkpoints.push({
      when: "30",
      who: "household",
      text: "Stability first: with housing at risk, call the National Call Center for Homeless Veterans at 1-877-424-3838 (free, 24/7). Every other family step gets easier from stable housing.",
    });
    decisions.push("Solve housing as a household before committing to moves, school changes, or new work schedules — stability first, everything else second.");
  }

  // GI Bill transfer — the one decision with a hard, while-serving deadline.
  if (isServing) {
    decisions.push(
      "Decide: keep the GI Bill for yourself or transfer months to your spouse or kids — the election must happen WHILE STILL SERVING, through DoD (generally 6+ years in, with a 4-year added service commitment). It cannot be started after separation."
    );
    checkpoints.push({
      when: "30",
      who: "household",
      text: "Ask your education office about the Post-9/11 GI Bill transfer election this month — it has to be requested and approved through DoD before you separate.",
    });
  } else if (kidsEdu) {
    checkpoints.push({
      when: "60",
      who: "kids",
      text: "Check DEA (Chapter 35) for dependents: it applies when the veteran is permanently and totally disabled from a service-connected condition (or died, is captured, or is missing) — up to 36 months of education benefits for programs started on or after August 1, 2018.",
    });
  }

  // Career destination affects the whole household.
  if (careerLabel) {
    decisions.push(
      `Talk through what the path to ${careerLabel} means for the household — training time, income in between, and who carries what while you get there.`
    );
  }

  // Moving states — school year + spouse license are the two family-side clocks.
  if (moving) {
    if (spouse) {
      checkpoints.push({
        when: "30",
        who: "spouse",
        text: "Check your spouse's occupational license portability in the new state — interstate compacts (nursing, teaching, EMS, counseling, and more) can cut months off re-licensing. Start before the move.",
      });
    }
    if (kids) {
      checkpoints.push({
        when: "60",
        who: "kids",
        text: "Time the move against the school year — mid-year school switches are the hardest on kids. Look up enrollment dates in the new district before locking a date.",
      });
    }
    decisions.push("Pick the move window together — school calendar, spouse license timeline, and housing dates all pull on the same weeks.");
  }

  // Caregiver path — only claim the verified 70%+ requirement.
  if (caregiver) {
    checkpoints.push({
      when: "30",
      who: "caregiver",
      text: "Check PCAFC eligibility: the program requires the veteran to have a VA disability rating of 70% or higher, and you apply together with VA Form 10-10CG (caregiver.va.gov).",
    });
    checkpoints.push({
      when: "60",
      who: "caregiver",
      text: "If PCAFC doesn't fit, look at the Program of General Caregiver Support Services (PGCSS) — broader access to training, peer support, and resources.",
    });
    decisions.push("Decide who would formally be the primary family caregiver before starting a PCAFC application — it's a joint veteran-and-caregiver application, not a solo form.");
  }

  // High rating — dependent benefits review, with the P&T honesty built in.
  if (highRating) {
    checkpoints.push({
      when: "60",
      who: "household",
      text: "Review dependent benefits as a household: DEA (Chapter 35) and CHAMPVA both require a permanent-and-total (P&T) service-connected rating — a high percentage alone isn't enough, so check your VA decision letter for the P&T determination.",
    });
  }

  // Spouse career momentum.
  if (spouse) {
    if (isServing) {
      checkpoints.push({
        when: "60",
        who: "spouse",
        text: "Book a free SECO career coaching session for your spouse while you're still serving — spouse programs like SECO and MSEP are strongest before separation.",
      });
    } else {
      checkpoints.push({
        when: "90",
        who: "spouse",
        text: "Review spouse career supports that still apply after service — federal military-spouse hiring paths have specific eligibility rules (check USAJOBS), and license compacts help in any move.",
      });
    }
    decisions.push("Put your spouse's career on the same whiteboard as yours — pick one concrete next move (coaching session, employer list, or a federal hiring path) and a date to start it.");
  }

  // Childcare has long waitlists and an honest while-serving cliff.
  if (childcare) {
    checkpoints.push({
      when: "60",
      who: "kids",
      text: "Get on childcare waitlists now if you'll need care for work or school — military childcare and fee assistance mainly serve currently serving families, so line up community options (childcare.gov) for after separation.",
    });
    decisions.push("Agree on the childcare plan — who, where, and what it costs — before anyone commits to new job hours or a class schedule.");
  }

  // Long-term horizon.
  if (spouse || survivorInterest) {
    checkpoints.push({
      when: "long",
      who: "household",
      text: "Walk through survivor protection together — how the Survivor Benefit Plan election works (chosen at retirement, hard to change later) and what DIC is. Educational only; confirm details with DFAS and VA before any election.",
    });
  }
  if (kidsEdu) {
    checkpoints.push({
      when: "long",
      who: "kids",
      text: "Map education funding per dependent — transferred GI Bill months, DEA/Chapter 35 if the qualifying event applies, and state tuition programs (see the Benefits page). Rules differ per program; verify each at its official source.",
    });
  }

  // Resources filtered to the audiences this household actually selected.
  const aud = new Set<FamilyAudience>(familyAudiences(a));
  const resources: FamilyEntry[] = FAMILY_GROUPS.flatMap((g) => g.entries).filter((e) =>
    e.audience.some((x) => aud.has(x))
  );

  checkpoints.sort((x, y) => WHEN_ORDER[x.when] - WHEN_ORDER[y.when]);

  return { checkpoints, decisions, resources };
}
