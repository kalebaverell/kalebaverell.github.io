// VetPath data model (prototype). All benefit content is SAMPLE data.

export interface Profile {
  name: string;
  email?: string;
}

export interface Answers {
  ageRange?: string;
  state?: string;
  city?: string;
  sex?: string;
  raceEthnicity?: string[];
  branch?: string;
  serviceEra?: string;
  status?: string;
  disabilityRating?: string;
  employment?: string;
  housing?: string;
  careerGoals?: string[];
  educationGoals?: string[];
  businessInterest?: string;
  wellnessPriorities?: string[];
  financialPriorities?: string[];
  familyNeeds?: string[];
  topGoals?: string[];
  urgency?: string;
  stepNotes?: Record<string, string>;
}

// Pathfinder decision engine
export type AttrDim = "hands" | "tech" | "people" | "data" | "lead" | "risk" | "physical" | "outdoor" | "care" | "autonomy";

export interface Career {
  id: string;
  label: string;
  track: string;
  icon: string;
  blurb: string;
  paySample: string;
  outlookSample: string;
  speed: "weeks" | "months" | "2yr" | "4yr";
  attrs: Record<AttrDim, number>;
  whyVets: string;
  entryPath: string[];
  keywords: string[];
  mosBridges: string[];
  skillbridge: boolean;
  remote: boolean;
  cityBias: "city" | "either" | "rural";
  // Official grounding (BLS OOH / O*NET), added 2026-07-09
  onetCode?: string;
  onetUrl?: string;
  blsUrl?: string;
  sources?: string[];
}

export interface Track {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  benefits: string[];
  fastFacts: string[];
}

export interface CareerFit {
  career: Career;
  fit: number;           // 0–100 demo estimate
  why: string[];
  boosts: string[];
}

export interface ChosenPath {
  careerId: string;
  fitPct: number | null; // null when picked directly without assessment
  why: string[];
}

export interface ResumeState {
  text: string;
  careerId: string;
}

export interface Benefit {
  id: string;
  name: string;
  icon: string;
  summary: string;
  whoFor: string;
  eligibility?: string;         // sampleEligibility in JSON
  sampleEligibility?: string;
  official: { name: string; url: string };
  actionSteps?: string[];
  steps?: string[];
  documents: string[];
  crisis?: boolean;
  placeholder?: boolean;
  sensitive?: boolean;
}

export interface Goal {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  benefits: string[];
  steps: string[];
  documents: string[];
  sensitive?: boolean;
}

export interface ActionItem {
  id: string;
  text: string;
  priority: "high" | "medium" | "low";
}

export interface Gameplan {
  headline: string;
  crisis: boolean;
  priorities: string[];
  benefitCategories: string[];
  plan30: ActionItem[];
  plan60: ActionItem[];
  plan90: ActionItem[];
  documents: string[];
  resources: string[];
  longTerm: string[];
  whyItMatters: string[];
  destination?: { careerId: string; label: string; track: string; fitPct: number | null } | null;
  networking?: { name: string; what: string; url?: string }[];
  locationTips?: string[];
  metroSuggestions?: { name: string; state: string; va: string; note?: string }[];
  skillBridge?: boolean;
  disabilityPrep?: string[];
  decisions?: string[];
  familyCheckpoints?: { when: string; text: string; who: string }[];
}

export type Status = "todo" | "prog" | "done";

export interface AppState {
  profile: Profile | null;
  answers: Answers;
  gameplan: Gameplan | null;
  statuses: Record<string, Status>;
  step: number;
  theme: "professional" | "warm" | "civic";
  textSize: "base" | "lg" | "xl";
  assessment: Record<string, string>;
  assessmentFree: string;
  chosenPath: ChosenPath | null;
  resume: ResumeState | null;
}
