// The accredited-representative handoff (strategy: "Win the Handoff", Sep 30 2026).
// One home for the links and copy that send a member from their VetPath plan to a
// free, accredited human, so the gameplan, the timeline, the benefits library and
// the printout can never disagree.
//
// Order is policy, not taste. VA's own accredited-representative search is always
// first - it is the neutral front door and lists VA-accredited individuals of every
// kind. The three veterans service organizations follow in alphabetical order
// (American Legion, DAV, VFW) on equal terms. VetPath is not affiliated with VA or
// with any of them, and nothing here may imply otherwise.
//
// Every URL below was opened live on 2026-10-02. claims.vfw.org is deliberately
// NOT linked (SiteGround bot challenge; unverifiable): VFW's own claims page links it.
import { realStateInfo, STATE_BENEFITS } from "@/lib/data";
import type { HandoffKind } from "@/lib/types";

export interface HandoffLink { label: string; href: string; handoff?: HandoffKind }

export const HANDOFF_LINKS = {
  vaFindRep: { label: "Find an accredited representative (VA.gov) - VSO reps are free", href: "https://www.va.gov/get-help-from-accredited-representative/find-rep/", handoff: "rep" },
  legion: { label: "American Legion service officers", href: "https://www.legion.org/member-services/veterans-services/veterans-benefits/find-a-veteran-service-officer", handoff: "vso-org" },
  davOffices: { label: "DAV service officers", href: "https://www.dav.org/find-your-local-office/", handoff: "vso-org" },
  davTransition: { label: "DAV transition service officers (before discharge)", href: "https://www.dav.org/get-help-now/transition-services/", handoff: "vso-org" },
  vfwPreDischarge: { label: "VFW pre-discharge service officers", href: "https://www.vfw.org/assistance/va-claims-separation-benefits/pre-discharge-locations-and-contacts", handoff: "vso-org" },
  vfwClaims: { label: "VFW service officers", href: "https://www.vfw.org/assistance/va-claims-separation-benefits", handoff: "vso-org" },
  countyDirectory: { label: "Find your county veterans service officer (NACVSO)", href: "https://www.nacvso.org/county-veterans-service-officers", handoff: "cvso" },
  report: { label: "Report a claims predator (VSAFE, a VA site, 833-38V-SAFE)", href: "https://vsafe.gov/va-toolkit/va-fraud-prevention-kit/claims-predators/" },
  usc5901: { label: "38 U.S.C. 5901", href: "https://www.law.cornell.edu/uscode/text/38/5901" },
  usc5904: { label: "38 U.S.C. 5904", href: "https://www.law.cornell.edu/uscode/text/38/5904" },
} satisfies Record<string, HandoffLink>;

/** Timeline tasks carry a single { label, url } source. */
export const asSource = (l: HandoffLink) => ({ label: l.label, url: l.href });

/** Fixed gameplan ids (see fixedItem in lib/rules.ts). One rep id across all
 *  windows so a checkmark survives the text changing as the BDD window passes. */
export const REP_TASK_ID = "rep-talk";
export const CVSO_TASK_ID = "cvso-state";

/** Shared leads. handoffResources keys on these, so they must stay the start of
 *  every handoff task's text and title. */
export const REP_TASK_LEAD = "Talk to a free accredited representative before you file";
export const CVSO_TASK_LEAD = "Connect with your county or state veterans service officer";

export type RepWhen = "bdd" | "closing" | "out";

/** The gameplan's rep step. Must never contain "disability claim" or "intent to
 *  file": those are the dedupe topic of the claim line in lib/rules.ts. Never
 *  shorten the "out" line to "claims help is always free": accredited attorneys
 *  may lawfully charge after VA's decision, so the free promise is VA's own, about
 *  accredited VSO representatives. */
export function repTaskText(when: RepWhen): string {
  if (when === "bdd") return `${REP_TASK_LEAD} - bring your records, and get your pre-discharge (BDD) claim in 180 to 90 days before separation`;
  if (when === "closing") return `${REP_TASK_LEAD} - the 180-to-90-day pre-discharge window has closed, but you can still file before or after you separate`;
  return `${REP_TASK_LEAD} - VA's search finds one near you, and accredited VSO representatives are always free`;
}

/** The gameplan's county step. Names the agency so the resource lookup below can
 *  read the state back from the text (51 agency names, no substring collisions). */
export function cvsoTaskText(agencyName: string): string {
  return `${CVSO_TASK_LEAD} - ${agencyName} can point you to the free one nearest you`;
}

/** The member's state veterans agency as a link (data/stateBenefits.json). */
export function stateAgencyLink(code?: string): HandoffLink | undefined {
  const st = realStateInfo(code);
  return st ? { label: `${st.agency.name} (your state veterans agency)`, href: st.agency.url, handoff: "cvso" } : undefined;
}

/** Curated, fixed-order resources for the two handoff tasks, or null for any other
 *  task so the keyword rules in lib/taskResources apply as before. While still in
 *  uniform (text says "pre-discharge"), the DAV and VFW entries are their
 *  installation-based pre-discharge pages; the Legion publishes no installation
 *  list, so its service-officer directory is its equal entry. */
export function handoffResources(text: string): HandoffLink[] | null {
  if (text.startsWith(REP_TASK_LEAD)) {
    const inUniform = /pre-discharge/i.test(text);
    return [
      HANDOFF_LINKS.vaFindRep,
      HANDOFF_LINKS.legion,
      inUniform ? HANDOFF_LINKS.davTransition : HANDOFF_LINKS.davOffices,
      inUniform ? HANDOFF_LINKS.vfwPreDischarge : HANDOFF_LINKS.vfwClaims,
    ];
  }
  if (text.startsWith(CVSO_TASK_LEAD)) {
    const st = STATE_BENEFITS.states.find((s) => text.includes(s.agency.name));
    const agency = st ? stateAgencyLink(st.code) : undefined;
    return [...(agency ? [agency] : []), HANDOFF_LINKS.countyDirectory, HANDOFF_LINKS.vaFindRep];
  }
  return null;
}

/** The printed plan's handoff list: VA's search, the member's state agency, the
 *  county directory, then the three VSOs alphabetically. */
export function handoffSheet(stateCode: string | undefined, inUniform: boolean): HandoffLink[] {
  const agency = stateAgencyLink(stateCode);
  return [
    HANDOFF_LINKS.vaFindRep,
    ...(agency ? [agency] : []),
    HANDOFF_LINKS.countyDirectory,
    HANDOFF_LINKS.legion,
    inUniform ? HANDOFF_LINKS.davTransition : HANDOFF_LINKS.davOffices,
    inUniform ? HANDOFF_LINKS.vfwPreDischarge : HANDOFF_LINKS.vfwClaims,
  ];
}

/** "Never pay to file a VA claim." Facts behind each clause: 38 U.S.C. 5901(a) only
 *  VA-recognized individuals may act as agent or attorney on a claim; 5904(c)(1)
 *  no agent or attorney fee before notice of VA's initial decision; VA: "The
 *  services an accredited VSO representative provides on your VA benefit claims
 *  are always free." Report route per VA: VSAFE (vsafe.gov, 833-38V-SAFE). Never
 *  publish VA OGC's complaint mailbox (it appears on no VA page). Do not shorten to
 *  "claims help is always free": accredited attorneys may lawfully charge after the
 *  decision. */
export const NEVER_PAY = {
  title: "Never pay to file a VA claim.",
  body: "Only people VA has accredited may represent you on a VA claim or charge to help with one. Accredited VSO representatives are always free, and no one may charge you for claims help before VA's first decision on that claim. If someone who isn't accredited offers to help, or anyone wants a fee, a subscription, or a share of your future benefits to file, don't sign.",
};
