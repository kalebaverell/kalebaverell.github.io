// Loads the shared sample data from /data (single source of truth for the app).
import benefitsJson from "@/data/sampleBenefits.json";
import goalsJson from "@/data/sampleGoals.json";
import statesJson from "@/data/sampleStates.json";
import intakeJson from "@/data/intakeQuestions.json";
import gameplansJson from "@/data/sampleGameplans.json";
import tracksJson from "@/data/sampleTracks.json";
import stateBenefitsJson from "@/data/stateBenefits.json";
import careersJson from "@/data/sampleCareers.json";
import assessmentJson from "@/data/assessmentQuestions.json";
import creditMapJson from "@/data/sampleCreditMap.json";
import networkingJson from "@/data/sampleNetworking.json";
import locationsJson from "@/data/sampleLocations.json";
import type { Benefit, Goal, Career, Track } from "./types";

export const BRAND = {
  name: "VetPath",
  tagline: "A clear gameplan for life after service.",
};

export const BENEFITS: Benefit[] = (benefitsJson as any).categories.map((b: any) => ({
  ...b,
  eligibility: b.sampleEligibility,
  steps: b.actionSteps,
}));

export const GOALS: Goal[] = (goalsJson as any).goals;

export const STATES: { code: string; name: string; hasSampleData?: boolean; samplePrograms?: string[] }[] =
  (statesJson as any).states;
export const STATE_GENERIC: string = (statesJson as any).genericPlaceholder;

export const INTAKE = (intakeJson as any).steps as {
  id: string;
  title: string;
  subtitle: string;
  questions: any[];
}[];

export const SAMPLE_GAMEPLANS = (gameplansJson as any).examples;

export const benefitById = (id: string) => BENEFITS.find((b) => b.id === id);
export const goalById = (id: string) => GOALS.find((g) => g.id === id);
export const stateName = (code?: string) =>
  code ? STATES.find((s) => s.code === code)?.name ?? code : "";
export const stateSamples = (code?: string) =>
  code ? STATES.find((s) => s.code === code)?.samplePrograms : undefined;

// Pathfinder / tools data
export const TRACKS: Track[] = (tracksJson as any).tracks;
export const CAREERS: Career[] = (careersJson as any).careers;
export const ASSESSMENT = assessmentJson as any as {
  questions: { id: string; label: string; options: { label: string; w?: Record<string, number>; speed?: string; place?: string }[] }[];
  freePrompt: string;
};
export const CREDIT_MAP = creditMapJson as any as {
  howItWorks: string[];
  roles: { branch: string; code: string; title: string; credits: { area: string; hours: number; level: string }[]; note?: string }[];
};
export const NETWORKING = networkingJson as any as {
  general: { name: string; what: string; url?: string }[];
  vaSpecific: { name: string; what: string; url?: string }[];
  byTrack: Record<string, { name: string; what: string; url?: string }[]>;
  targeted: Record<string, { name: string; what: string; url?: string }[]>;
};
export const LOCATIONS = locationsJson as any as {
  rules: Record<string, string>;
  metros: { name: string; state: string; vibe: string; va: string; strongFor: string[]; costSample: string; note?: string }[];
};
export const INTAKE_NOTES_PROMPT: string = (intakeJson as any).stepNotesPrompt;

export const careerById = (id?: string | null) => (id ? CAREERS.find((c) => c.id === id) : undefined);
export const trackById = (id?: string) => (id ? TRACKS.find((t) => t.id === id) : undefined);

// Real, cited state benefit data (populated by scripts/merge-states.mjs).
export interface StateProgram { name: string; category: string; blurb: string; source: string }
export interface StateInfo {
  code: string; name: string;
  agency: { name: string; url: string };
  programs: StateProgram[];
  notes?: string;
}
export const STATE_BENEFITS = stateBenefitsJson as any as {
  lastVerified: string | null;
  coverage: { total: number; missing: string[] };
  states: StateInfo[];
};
export const realStateInfo = (code?: string): StateInfo | undefined =>
  code ? STATE_BENEFITS.states.find((s) => s.code === code) : undefined;
