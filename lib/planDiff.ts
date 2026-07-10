// VetPath adaptive planning — pure diff between two generated gameplans.
// Powers the "what changes" preview so a veteran sees exactly what a life
// event does to the plan before committing.
import type { Gameplan } from "@/lib/types";

export type PlanPhase = "30" | "60" | "90";

export interface PhaseAction {
  phase: PlanPhase;
  text: string;
}

export interface PlanDiff {
  addedActions: PhaseAction[];
  removedActions: PhaseAction[];
  addedBenefits: string[];
  removedBenefits: string[];
  addedPriorities: string[];
  headlineChanged: boolean;
}

const PHASES: { phase: PlanPhase; key: "plan30" | "plan60" | "plan90" }[] = [
  { phase: "30", key: "plan30" },
  { phase: "60", key: "plan60" },
  { phase: "90", key: "plan90" },
];

const uniq = (arr: string[]) => arr.filter((v, i) => arr.indexOf(v) === i);

/**
 * Compare two gameplans. Actions are compared by text equality within each
 * phase; benefit categories and priorities as sets. A null `prev` (no plan
 * yet) reports everything in `next` as added.
 */
export function diffPlans(prev: Gameplan | null, next: Gameplan): PlanDiff {
  const addedActions: PhaseAction[] = [];
  const removedActions: PhaseAction[] = [];

  for (const { phase, key } of PHASES) {
    const prevTexts = uniq((prev ? prev[key] : []).map((it) => it.text));
    const nextTexts = uniq(next[key].map((it) => it.text));
    for (const text of nextTexts) if (!prevTexts.includes(text)) addedActions.push({ phase, text });
    for (const text of prevTexts) if (!nextTexts.includes(text)) removedActions.push({ phase, text });
  }

  const prevBenefits = uniq(prev?.benefitCategories || []);
  const nextBenefits = uniq(next.benefitCategories);
  const addedBenefits = nextBenefits.filter((b) => !prevBenefits.includes(b));
  const removedBenefits = prevBenefits.filter((b) => !nextBenefits.includes(b));

  const prevPriorities = prev?.priorities || [];
  const addedPriorities = uniq(next.priorities).filter((p) => !prevPriorities.includes(p));

  const headlineChanged = !prev || prev.headline !== next.headline;

  return { addedActions, removedActions, addedBenefits, removedBenefits, addedPriorities, headlineChanged };
}
