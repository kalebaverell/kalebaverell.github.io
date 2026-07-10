// VetPath adaptive planning — life-event definitions (pure module, no React).
// A life event describes which intake answers it touches and how. Applying one
// only edits the local demo answers; the rules engine regenerates the plan.
import type { Answers } from "@/lib/types";

export interface LifeEvent {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  fields: {
    answerId: "state" | "city" | "disabilityRating" | "status" | "ageRange";
    label: string;
    type: "state" | "text" | "single";
    options?: string[];
  }[];
  extraPatch?: (a: Answers) => Partial<Answers>;
}

// Mirrors the option strings in data/intakeQuestions.json (disabilityRating).
const RATING_OPTIONS = [
  "None / not rated",
  "Claim pending or filing",
  "0–20%",
  "30–50%",
  "60–90%",
  "100%",
  "Prefer not to say",
];

/** Append values that aren't already present (immutable, order-preserving). */
function addUnique(arr: string[] | undefined, ...vals: string[]): string[] {
  const out = [...(arr || [])];
  for (const v of vals) if (!out.includes(v)) out.push(v);
  return out;
}

/** Add a top goal only if there's room (max 3) and it isn't already chosen. */
function withGoal(goals: string[] | undefined, id: string): string[] {
  const out = [...(goals || [])];
  if (!out.includes(id) && out.length < 3) out.push(id);
  return out;
}

export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: "moved",
    label: "I moved (or I'm moving)",
    icon: "ti-map-pin",
    blurb: "New state, new rules. We refresh state benefits, facility tips, and local support.",
    fields: [
      { answerId: "state", label: "New state", type: "state" },
      { answerId: "city", label: "New city or town (optional)", type: "text" },
    ],
    extraPatch: (a) => ({ topGoals: withGoal(a.topGoals, "move-new-state") }),
  },
  {
    id: "new-rating",
    label: "My disability rating changed",
    icon: "ti-percentage",
    blurb: "A new rating can change compensation, health-care priority, and state perks.",
    fields: [
      { answerId: "disabilityRating", label: "New rating", type: "single", options: RATING_OPTIONS },
    ],
  },
  {
    id: "new-child",
    label: "We had a child",
    icon: "ti-baby-carriage",
    blurb: "Congratulations. Dependent education and childcare support move into the plan.",
    fields: [],
    extraPatch: (a) => ({
      familyNeeds: addUnique(
        (a.familyNeeds || []).filter((f) => f !== "None"),
        "Dependent education",
        "Childcare"
      ),
    }),
  },
  {
    id: "career-change",
    label: "I want a career change",
    icon: "ti-arrows-exchange",
    blurb: "Point the plan at a new destination — then re-run the Pathfinder for a fresh fit.",
    fields: [],
    extraPatch: (a) => ({ careerGoals: addUnique(a.careerGoals, "Change careers") }),
  },
  {
    id: "start-business",
    label: "I'm starting a business",
    icon: "ti-building-store",
    blurb: "SBA veteran programs and business-launch steps get pulled forward.",
    fields: [],
    extraPatch: (a) => ({
      businessInterest: "Yes — actively working on it",
      careerGoals: addUnique(a.careerGoals, "Start a business"),
      topGoals: withGoal(a.topGoals, "start-a-business"),
    }),
  },
  {
    id: "approaching-retirement",
    label: "Retirement is getting close",
    icon: "ti-armchair",
    blurb: "Shift toward retirement pay, survivor protection, and health-care continuity.",
    fields: [],
    extraPatch: (a) => ({
      topGoals: withGoal(a.topGoals, "prepare-retirement"),
      financialPriorities: addUnique(a.financialPriorities, "Retirement planning"),
    }),
  },
];

export const lifeEventById = (id?: string | null): LifeEvent | undefined =>
  id ? LIFE_EVENTS.find((e) => e.id === id) : undefined;

/**
 * Immutably apply a life event to a set of answers: merge the form-field
 * inputs first, then let the event's extraPatch refine the merged result.
 * Text fields apply as typed (a cleared field clears the answer); other
 * fields only apply when a non-empty value was provided.
 */
export function applyEvent(a: Answers, ev: LifeEvent, inputs: Record<string, string>): Answers {
  let next: Answers = { ...a };
  for (const f of ev.fields) {
    const raw = inputs[f.answerId];
    if (raw === undefined) continue;
    const v = raw.trim();
    if (f.type === "text") next = { ...next, [f.answerId]: v };
    else if (v) next = { ...next, [f.answerId]: v };
  }
  if (ev.extraPatch) next = { ...next, ...ev.extraPatch(next) };
  return next;
}
