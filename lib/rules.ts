// VetPath rules engine — deterministic mapping from intake answers to a gameplan.
// Mirrors the logic in demo/vetpath-demo.html. SAMPLE guidance only; not advice.
import type { Answers, ActionItem, Gameplan, Career } from "./types";
import { GOALS, goalById, stateName, trackById } from "./data";
import { locationGuidance, networkingFor } from "./pathfinder";
import { buildFamilyPlan } from "./family";

let _idc = 0;
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function item(text: string, priority: ActionItem["priority"]): ActionItem {
  return { id: `a${_idc++}-${hash(text)}`, text, priority };
}

const PRIORITY_LABEL: Record<string, string> = {
  "buy-a-home": "Use your VA home loan benefit the smart way",
  "start-a-business": "Stand up your veteran-owned business with SBA support",
  "use-education-benefits": "Turn your education benefit into a real credential",
  "understand-disability": "Understand the disability process with free accredited help",
  "prepare-retirement": "Secure retirement pay, survivor protection, and healthcare",
  "get-better-job": "Land a better job that values your service",
  "organize-documents": "Build one secure folder so you can act fast",
  "move-new-state": "Carry your benefits cleanly to your new state",
  "find-local-support": "Plug into local veteran support near you",
};

export function generateGameplan(a: Answers, path?: { career: Career; fitPct: number | null } | null): Gameplan {
  _idc = 0;
  const goals = (a.topGoals || []).map(goalById).filter(Boolean) as typeof GOALS;
  const status = a.status || "";
  const isTransition = status.startsWith("Transitioning") || status === "Active duty";
  const urgent = (a.urgency || "").startsWith("Right now");
  const crisis =
    a.housing === "Currently homeless" ||
    a.housing === "Unstable / at risk" ||
    ((a.wellnessPriorities || []).includes("Mental health support") && urgent);
  const career = path?.career;

  // Benefit categories
  const cats = new Set<string>();
  goals.forEach((g) => g.benefits.forEach((b) => cats.add(b)));
  if (isTransition) ["va-healthcare", "va-disability", "employment"].forEach((c) => cats.add(c));
  (a.financialPriorities || []).forEach((f) => {
    if (f === "Buy a home") cats.add("va-home-loan");
    if (f === "Understand VA disability compensation") cats.add("va-disability");
    if (f === "Retirement planning" || f === "Protect my family (survivor benefits)") cats.add("retirement-survivor");
  });
  (a.educationGoals || []).forEach((e) => {
    if (e !== "No education plans") cats.add("gi-bill");
  });
  if ((a.familyNeeds || []).some((f) => f !== "None")) cats.add("family-dependent");
  if ((a.wellnessPriorities || []).includes("Mental health support")) cats.add("mental-health-crisis");
  if (a.state) cats.add("state-benefits");
  if (career) trackById(career.track)?.benefits.forEach((b) => cats.add(b));
  const benefitCategories = [...cats];

  // Priorities
  const priorities: string[] = [];
  if (crisis) priorities.push("Get immediate support in place — you don't have to handle this alone");
  if (career) priorities.push(`Execute your ${career.label} roadmap — that's the destination`);
  if (isTransition) {
    priorities.push("Lock in VA health care and start a disability claim before you separate");
    priorities.push("Build a job or education pipeline now, not after your last day");
  }
  goals.slice(0, 3).forEach((g) => {
    const p = PRIORITY_LABEL[g.id];
    if (p && !priorities.includes(p)) priorities.push(p);
  });
  if (priorities.length === 0) priorities.push("Get organized and confirm which benefits apply to you");

  // 30/60/90 plans
  const plan30: ActionItem[] = [];
  const plan60: ActionItem[] = [];
  const plan90: ActionItem[] = [];
  if (isTransition) {
    plan30.push(item("Complete TAP and safeguard your DD-214 + medical records", "high"));
    plan30.push(item("Start a VA disability claim (ask about Benefits Delivery at Discharge)", "high"));
    plan60.push(item("Apply for VA health care and pick a facility near home", "high"));
    if (career?.skillbridge) plan30.push(item(`Ask your command about a DoD SkillBridge internship in ${career.label.toLowerCase()} — civilian experience on military pay`, "high"));
    else plan30.push(item("Ask your command about DoD SkillBridge — intern with a civilian employer your last 180 days on military pay", "medium"));
  }
  // Destination roadmap steps distributed across the plan
  if (career) {
    const ep = career.entryPath;
    if (ep[0]) plan30.push(item(`${career.label}: ${ep[0]}`, "high"));
    if (ep[1]) plan60.push(item(`${career.label}: ${ep[1]}`, "high"));
    if (ep[2]) plan60.push(item(`${career.label}: ${ep[2]}`, "medium"));
    if (ep[3]) plan90.push(item(`${career.label}: ${ep[3]}`, "medium"));
    plan90.push(item("Reach out to 2 people already doing this work (see your networking list)", "medium"));
  }
  goals.forEach((g) => {
    const st = g.steps;
    if (st[0]) plan30.push(item(st[0], g.sensitive ? "medium" : "high"));
    if (st[1]) plan30.push(item(st[1], "medium"));
    if (st[2]) plan60.push(item(st[2], "medium"));
    if (st[3]) plan60.push(item(st[3], "low"));
    if (st[4]) plan90.push(item(st[4], "low"));
    if (st[5]) plan90.push(item(st[5], "low"));
  });
  if (a.state) plan90.push(item(`Check ${stateName(a.state)} veteran benefits — verify with the state agency`, "low"));
  if (plan90.length === 0) plan90.push(item("Revisit and refine this plan as your situation changes", "low"));

  // Documents
  const docs = new Set<string>();
  goals.forEach((g) => g.documents.forEach((d) => docs.add(d)));
  if (isTransition) ["DD-214", "Service medical records"].forEach((d) => docs.add(d));

  // Long-term
  const longTerm: string[] = [];
  if (!goals.find((g) => g.id === "buy-a-home")) longTerm.push("Use the VA home loan when you're ready to buy.");
  if (!goals.find((g) => g.id === "prepare-retirement"))
    longTerm.push("Revisit retirement and survivor protection as you approach it.");
  longTerm.push("Refresh your gameplan every 90 days — goals change.");

  // Why it matters
  const why: string[] = [];
  if (career) why.push(`Every action below moves you toward ${career.label} — a plan with a destination beats a list of chores.`);
  if (isTransition) why.push("Filing before separation can shorten the wait for a decision.");
  if (benefitCategories.includes("va-healthcare"))
    why.push("Early VA health-care enrollment protects access to care and mental health support.");
  if (goals.find((g) => g.id === "buy-a-home"))
    why.push("The VA home loan can mean no down payment and no PMI — a major head start.");
  if (why.length < 2) why.push("A written plan turns 'someday' into concrete next steps.");

  // Disability application prep (educational — honest maximization, free accredited help)
  const rating = a.disabilityRating || "";
  const disabilityInterest =
    rating === "Claim pending or filing" ||
    (a.financialPriorities || []).includes("Understand VA disability compensation") ||
    (a.topGoals || []).includes("understand-disability") ||
    (isTransition && rating !== "Prefer not to say");
  const disabilityPrep = disabilityInterest
    ? [
        "File an INTENT TO FILE first — it locks your effective date while you build the claim (up to 1 year).",
        "Request your complete service treatment records and list EVERY condition, including secondary ones (e.g., knee → back, tinnitus, sleep).",
        "Gather buddy/lay statements from people who witnessed injuries or changes.",
        "At C&P exams: be honest and thorough about your WORST days, not your best.",
        "Use a free accredited VSO or county service officer — never pay for basic claims help.",
        isTransition ? "Ask about Benefits Delivery at Discharge (file 90–180 days before separation)." : "If already rated, ask an accredited VSO whether a review makes sense — ratings can go down as well as up, so get real advice first.",
      ]
    : [];

  const track = career?.track;
  const networking = networkingFor(a, track);
  const loc = locationGuidance(a, undefined, career);

  // Household lens: decisions + checkpoints from the family module, plus core plan decisions
  const familyPlan = buildFamilyPlan(a as any, career?.label);
  const decisions: string[] = [...familyPlan.decisions];
  if (!career) decisions.unshift("Decide: your destination — run the Pathfinder so this plan has an endpoint.");
  if ((a.topGoals || []).includes("move-new-state") && !a.state)
    decisions.push("Decide: which state you're heading to — it changes your benefits picture.");
  if (career?.track === "entrepreneur")
    decisions.push("Decide: business structure and funding route — talk it through with a free VBOC advisor.");

  return {
    headline: crisis
      ? "First, let's get you support. Then we'll build the plan."
      : career
      ? `Destination locked: ${career.label}. Here's the route.`
      : isTransition
      ? "Land softly: benefits enrolled, a pipeline set, nothing left behind."
      : "Your personalized next steps — clear, prioritized, and yours.",
    crisis,
    priorities: priorities.slice(0, 4),
    benefitCategories,
    plan30,
    plan60,
    plan90,
    documents: [...docs],
    resources: benefitCategories,
    longTerm,
    whyItMatters: why,
    destination: career ? { careerId: career.id, label: career.label, track: career.track, fitPct: path?.fitPct ?? null } : null,
    networking,
    locationTips: loc.tips,
    metroSuggestions: loc.metros,
    skillBridge: isTransition,
    disabilityPrep,
    decisions,
    familyCheckpoints: familyPlan.checkpoints,
  };
}

export function sampleAnswers(): Answers {
  return {
    ageRange: "25–34",
    state: "TX",
    branch: "Army",
    serviceEra: "Post-9/11 (2001–present)",
    status: "Transitioning (separating within 12 months)",
    disabilityRating: "30–50%",
    employment: "Unemployed / job seeking",
    housing: "Rent",
    careerGoals: ["Get a better job"],
    educationGoals: ["Trade or certification"],
    wellnessPriorities: ["VA healthcare / physical health"],
    financialPriorities: ["Buy a home"],
    familyNeeds: ["None"],
    topGoals: ["transition-out", "get-better-job", "buy-a-home"],
    urgency: "Next 1–3 months",
  };
}
