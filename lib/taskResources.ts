// Task resources - maps an auto-generated action item to relevant, sourced links (official VA/DoD
// pages + the matching VetPath tool) by keyword, so every task can be "opened" for help without
// hand-authoring detail for each one. Every external link points to an official source.

export interface TaskResource {
  label: string;
  href: string;
  internal?: boolean; // a VetPath route (same-origin) vs. an external official source
}

const RULES: { test: RegExp; resources: TaskResource[] }[] = [
  // Guard/Reserve first: when a task is about continued service, that page is the whole answer.
  { test: /\bguard\b|\breserve\b|\breserves\b|drilling|part.?time service|selected reserve/i, resources: [
    { label: "Reserves & Guard: what it actually covers", href: "/reserves", internal: true },
    { label: "TRICARE Reserve Select (TRICARE.mil)", href: "https://tricare.mil/Plans/HealthPlans/TRS" },
  ]},
  { test: /\btap\b|transition assistance|dd.?214|separation|discharge/i, resources: [
    { label: "Transition Assistance Program (DoD)", href: "https://www.dodtap.mil/" },
  ]},
  { test: /gi bill|tuition|\bdegree\b|\bschool\b|\bcollege\b|education|certification|apprentice/i, resources: [
    { label: "GI Bill & education benefits (VA.gov)", href: "https://www.va.gov/education/about-gi-bill-benefits/" },
    { label: "See how to fund it - your funded path", href: "/pathfinder", internal: true },
  ]},
  { test: /disabilit|rating|\bclaim\b|intent to file|c&p|compensation|secondary condition/i, resources: [
    { label: "File a disability claim (VA.gov)", href: "https://www.va.gov/disability/" },
    { label: "Find free accredited help (VSO)", href: "https://www.va.gov/get-help-from-accredited-representative/find-rep/" },
  ]},
  { test: /\bresume\b|interview|cover letter/i, resources: [
    { label: "Open the Resume scanner", href: "/resume", internal: true },
  ]},
  { test: /special.?needs|\befmp\b|\biep\b|\b504 plan\b|able account/i, resources: [
    { label: "EFMP - Exceptional Family Member Program (Military OneSource)", href: "https://www.militaryonesource.mil/special-needs/efmp/" },
    { label: "ABLE accounts (SSA)", href: "https://www.ssa.gov/ssi/spotlights/spot-able.html" },
    { label: "Open the Family planner", href: "/family", internal: true },
  ]},
  { test: /next address|housing \(and bah\)|terminal leave|rent(ing)? vs buy/i, resources: [
    { label: "Home prices & the VA loan", href: "/housing", internal: true },
    { label: "VA home loans (VA.gov)", href: "https://www.va.gov/housing-assistance/home-loans/" },
  ]},
  { test: /transcript|\bjst\b|ccaf|college credit|prior learning/i, resources: [
    { label: "Open the Smart transcript tool", href: "/transcript", internal: true },
  ]},
  { test: /skillbridge/i, resources: [
    { label: "DoD SkillBridge program", href: "https://skillbridge.osd.mil/" },
  ]},
  { test: /\bvso\b|accredited|county service officer/i, resources: [
    { label: "Find an accredited VSO (VA.gov)", href: "https://www.va.gov/get-help-from-accredited-representative/find-rep/" },
  ]},
  { test: /network|mentor/i, resources: [
    { label: "Networking & mentors hub", href: "/network", internal: true },
  ]},
  { test: /home ?loan|\bva loan\b|mortgage|buy a home|coe/i, resources: [
    { label: "VA home loans (VA.gov)", href: "https://www.va.gov/housing-assistance/home-loans/" },
  ]},
  { test: /health ?care|enroll|medical|\bclinic\b|mental health/i, resources: [
    { label: "VA health care (VA.gov)", href: "https://www.va.gov/health-care/" },
    // VA health care covers the veteran, not the family. Guard/Reserve coverage does.
    { label: "Covering your family too: Guard & Reserve options", href: "/reserves", internal: true },
  ]},
  { test: /state (veteran )?benefit|state agency|property.?tax/i, resources: [
    { label: "Compare states' benefits", href: "/compare", internal: true },
    { label: "Benefits library", href: "/benefits", internal: true },
  ]},
  { test: /relocat|\bmove\b|where (to|should).*live|metro/i, resources: [
    { label: "Relocation planner", href: "/relocate", internal: true },
  ]},
  { test: /business|entrepreneur|\bsba\b|contracting|sdvosb|franchise/i, resources: [
    { label: "SBA resources for veterans", href: "https://www.sba.gov/business-guide/manage-your-business/military-veteran-owned-businesses" },
  ]},
  { test: /pension|\bretire/i, resources: [
    { label: "VA pension (VA.gov)", href: "https://www.va.gov/pension/" },
  ]},
  { test: /pathfinder|career path|destination|best.?fit|which career/i, resources: [
    { label: "Run the Pathfinder", href: "/pathfinder", internal: true },
  ]},
  { test: /spouse|family|child|caregiver|survivor|dependent/i, resources: [
    { label: "Family planner", href: "/family", internal: true },
  ]},
];

// Fallback so every task can be opened to something useful.
const FALLBACK: TaskResource[] = [
  { label: "Benefits library", href: "/benefits", internal: true },
  { label: "Find accredited help (VSO)", href: "https://www.va.gov/get-help-from-accredited-representative/find-rep/" },
];

/** Return relevant, deduped resources for an action item's text. */
export function taskResources(text: string): TaskResource[] {
  const out: TaskResource[] = [];
  const seen = new Set<string>();
  for (const rule of RULES) {
    if (!rule.test.test(text)) continue;
    for (const r of rule.resources) {
      if (seen.has(r.href)) continue;
      seen.add(r.href);
      out.push(r);
    }
  }
  if (out.length === 0) return FALLBACK;
  return out.slice(0, 4);
}
