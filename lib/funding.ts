// Funded Path builder — assembles a stacked, sourced list of funding programs for a veteran's
// trajectory: how public + employer + scholarship money combines to pay for the training, then
// what the destination job adds on top. All content is real and cited (see data/funding.json);
// this module only SELECTS and ORDERS — it never invents amounts or eligibility.
import fundingJson from "@/data/funding.json";
import type { Answers, Career } from "./types";

export interface FundingProgram {
  id: string;
  layer: "education" | "career";
  type: string;
  name: string;
  amount: string;
  eligibility: string;
  stackNote?: string;
  tip?: string;
  source: string;
  sourceLabel: string;
}

const ALL = (fundingJson.programs as unknown as FundingProgram[]);
const BY_ID: Record<string, FundingProgram> = Object.fromEntries(ALL.map((p) => [p.id, p]));
export const FUNDING_DISCLAIMER: string = (fundingJson as { disclaimer: string }).disclaimer;
export const FUNDING_VERIFIED: string = (fundingJson as { lastVerified: string }).lastVerified;

export interface FundedPath {
  education: FundingProgram[]; // fund the training (stacks that combine)
  career: FundingProgram[];    // land the job & keep earning
}

const PUBLIC_SERVICE = /nurse|health|teacher|educat|social work|public|government|police|fire|paramedic|emt|counsel/i;
const TECH = /tech|software|develop|data|cyber|network|program|comput|\bit\b/i;
const AVIATION = /pilot|aviat|aerospace|air ?traffic|aircraft/i;

/** Build the funded-path stack for this veteran + (optional) matched career. Order matters:
 *  strongest / most relevant first, so the funnel reads top-to-bottom. */
export function buildFundedPath(a: Answers, career?: Career): FundedPath {
  const rating = a.disabilityRating || "";
  const hasDisability = !!rating && rating !== "None" && rating !== "No rating";
  const label = career?.label || "";
  const track = career?.track;
  const minority = (a.raceEthnicity || []).some((r) => r && r !== "White" && r !== "Prefer not to say");
  const currentlyServing = a.status === "Currently serving" || a.serviceEra === "Currently serving";

  // ---- Layer 1: fund the training (public + scholarship money that stacks) ----
  const education: FundingProgram[] = [];
  if (hasDisability) education.push(BY_ID.vre); // the disability track goes first when it applies
  education.push(BY_ID.post911);                // the base most paths build on
  education.push(BY_ID.yellowRibbon);           // closes the gap above the cap
  if (TECH.test(label)) education.push(BY_ID.vettec);
  education.push(BY_ID.tillman);
  education.push(BY_ID.sva);
  if (minority && AVIATION.test(label)) education.push(BY_ID.obap); // field + background example

  // ---- Layer 2: land the job & keep earning ----
  const careerLayer: FundingProgram[] = [];
  if (currentlyServing) careerLayer.push(BY_ID.skillbridge); // get hired before separating
  careerLayer.push(BY_ID.employerTuition);
  careerLayer.push(BY_ID.fedHiring);
  if (PUBLIC_SERVICE.test(label) || track === "employment" || track === "education") careerLayer.push(BY_ID.pslf);

  return {
    education: education.filter(Boolean),
    career: careerLayer.filter(Boolean),
  };
}
