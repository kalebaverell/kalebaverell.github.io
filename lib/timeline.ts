// Transition Timeline engine — deterministic, explainable, no black box.
// Interview answers → a phase-based plan covering the last 12 months in
// uniform and the first 24 months as a civilian, weighted by the member's
// stated priorities. Every deadline-bearing task carries an official source
// link; nothing here is legal, medical, or financial advice.
import { realStateInfo } from "@/lib/data";

/** Date the deadline/source details below were last checked against the linked official pages. */
export const TIMELINE_VERIFIED = "2026-07-10";

export type FocusArea = "benefits" | "employment" | "education" | "financial" | "family" | "wellbeing";

export const FOCUS_META: Record<FocusArea, { label: string; icon: string }> = {
  benefits: { label: "VA benefits & healthcare", icon: "ti-shield-check" },
  employment: { label: "Civilian employment", icon: "ti-briefcase" },
  education: { label: "Education & certifications", icon: "ti-school" },
  financial: { label: "Financial planning", icon: "ti-coin" },
  family: { label: "Family & relocation", icon: "ti-home-heart" },
  wellbeing: { label: "Mental health & identity", icon: "ti-heart-handshake" },
};

export type SepWindow = "12+" | "9-12" | "6-9" | "3-6" | "0-3" | "out";
export type Goal = "employment" | "education" | "business" | "undecided";
export type FamilyFlag = "spouse" | "school-kids" | "young-kids" | "none";
export type ClaimsIntent = "yes" | "no" | "unsure";
export type Finances = "runway" | "some" | "income-now" | "pension";

export interface TimelineAnswers {
  branch: string;
  sepWindow: SepWindow;
  yearsOfService: "0-4" | "4-10" | "10-20" | "20+";
  rankGroup: string;
  mos: string;
  goals: Goal[];
  targetState: string; // "" = undecided
  family: FamilyFlag[];
  claims: ClaimsIntent;
  finances: Finances;
  priorities: FocusArea[]; // up to 3
  notes: string;
}

export const freshTimelineAnswers = (): TimelineAnswers => ({
  branch: "",
  sepWindow: "12+",
  yearsOfService: "4-10",
  rankGroup: "",
  mos: "",
  goals: [],
  targetState: "",
  family: [],
  claims: "unsure",
  finances: "some",
  priorities: [],
  notes: "",
});

export type PhaseId = "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7";
export type PhaseStatus = "past" | "current" | "ahead";

export interface TimelineTask {
  id: string;
  phase: PhaseId;
  area: FocusArea;
  title: string;
  notes: string;
  source?: { label: string; url: string };
  /** Hard, dated, or hard-to-reverse item — always kept, surfaced in catch-up. */
  essential?: boolean;
  /** Carries a real deadline the member should verify. */
  deadline?: boolean;
  /** True when this task exists because of a stated priority. */
  weighted?: boolean;
}

export interface TimelinePhase {
  id: PhaseId;
  label: string;
  window: string;
  status: PhaseStatus;
  narrative: string;
  tasks: TimelineTask[];
}

export interface TransitionTimeline {
  phases: TimelinePhase[];
  /** Essential items from phases already behind the member. */
  catchUp: TimelineTask[];
  deadlines: TimelineTask[];
  summary: string;
}

const PHASE_META: { id: PhaseId; label: string; window: string; hi: number; lo: number }[] = [
  { id: "p1", label: "Early planning", window: "T-12 to T-9 months", hi: 12, lo: 9 },
  { id: "p2", label: "TAP & benefits research", window: "T-9 to T-6 months", hi: 9, lo: 6 },
  { id: "p3", label: "Applications & ramp-up", window: "T-6 to T-3 months", hi: 6, lo: 3 },
  { id: "p4", label: "Final out & the move", window: "T-3 months to separation", hi: 3, lo: 0 },
  { id: "p5", label: "Landing", window: "Day 1 to +6 months", hi: 0, lo: -6 },
  { id: "p6", label: "Stabilization", window: "+6 months to +1 year", hi: -6, lo: -12 },
  { id: "p7", label: "Growth", window: "+1 year to +2 years", hi: -12, lo: -24 },
];

/** Approximate months until separation for phase past/current/ahead math. */
const sepMonths = (w: SepWindow): number =>
  w === "12+" ? 13 : w === "9-12" ? 10 : w === "6-9" ? 7 : w === "3-6" ? 4 : w === "0-3" ? 1.5 : -1;

const src = {
  tap: { label: "DoD TAP", url: "https://www.dodtap.mil/" },
  bdd: { label: "VA — pre-discharge (BDD) claims", url: "https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/" },
  itf: { label: "VA — Intent to File", url: "https://www.va.gov/resources/your-intent-to-file-a-va-claim/" },
  vgli: { label: "VA — VGLI", url: "https://www.va.gov/life-insurance/options-eligibility/vgli/" },
  health: { label: "VA — apply for health care", url: "https://www.va.gov/health-care/how-to-apply/" },
  giCompare: { label: "GI Bill Comparison Tool", url: "https://www.va.gov/education/gi-bill-comparison-tool/" },
  coe: { label: "VA — apply for education benefits", url: "https://www.va.gov/education/how-to-apply/" },
  skillbridge: { label: "DoD SkillBridge", url: "https://skillbridge.osd.mil/" },
  b2b: { label: "SBA — Boots to Business", url: "https://www.sba.gov/sba-learning-platform/boots-business" },
  jst: { label: "Joint Services Transcript", url: "https://jst.doded.mil/" },
  vetCenter: { label: "VA Vet Centers", url: "https://www.vetcenter.va.gov/" },
  oneSource: { label: "Military OneSource", url: "https://www.militaryonesource.mil/" },
  ucx: { label: "DOL VETS — UCX", url: "https://www.dol.gov/agencies/vets" },
  vso: { label: "VA — accredited representatives", url: "https://www.va.gov/get-help-from-accredited-representative/" },
  nextMove: { label: "My Next Move for Veterans", url: "https://www.mynextmove.org/vets/" },
  vaLoan: { label: "VA home loans", url: "https://www.va.gov/housing-assistance/home-loans/" },
  sbp: { label: "DoD — Survivor Benefit Plan", url: "https://militarypay.defense.gov/Benefits/Survivor-Benefit-Program/" },
  tamp: { label: "TRICARE — TAMP", url: "https://www.tricare.mil/tamp" },
  vre: { label: "VA — VR&E (Chapter 31)", url: "https://www.va.gov/careers-employment/vocational-rehabilitation/" },
  facilities: { label: "VA facility locator", url: "https://www.va.gov/find-locations/" },
};

const stateEntry = (code: string) => realStateInfo(code);

/** Full conditional task library. Order inside a phase = default order before priority weighting. */
function buildTasks(a: TimelineAnswers): TimelineTask[] {
  const t: TimelineTask[] = [];
  const has = (g: Goal) => a.goals.includes(g);
  const kids = a.family.includes("school-kids") || a.family.includes("young-kids");
  const famAny = a.family.length > 0 && !a.family.includes("none");
  const claims = a.claims !== "no";
  const retiree = a.yearsOfService === "20+";
  const st = a.targetState ? stateEntry(a.targetState) : undefined;
  const push = (x: Omit<TimelineTask, "weighted">) =>
    t.push({ ...x, weighted: a.priorities.includes(x.area) });

  // ---- P1 · T-12 to T-9 — early planning
  push({ id: "vaAccount", phase: "p1", area: "benefits", essential: true, title: "Create your VA.gov account (ID.me / Login.gov)", notes: "Nearly every benefit below starts here. Ten minutes now, no waiting rooms later." , source: src.health });
  push({ id: "vsoEarly", phase: "p1", area: "benefits", essential: true, title: "Connect with an accredited VSO — they're free", notes: "Veteran Service Organizations (VSOs) help with claims and benefits at no cost. Never pay a percentage of your benefits to anyone.", source: src.vso });
  if (claims) push({ id: "medRecords", phase: "p1", area: "benefits", essential: true, title: "Start collecting your complete medical record", notes: "Every condition you'll claim needs to be documented while you're still in. See your provider about anything you've been ignoring." });
  if (has("employment") || has("undecided")) push({ id: "resumeDraft", phase: "p1", area: "employment", title: `Draft a civilian resume — translate ${a.mos ? `your ${a.mos} experience` : "your MOS"}`, notes: "Use the crosswalk to see how your military occupation maps to civilian titles, then our Resume scanner for recruiter-style feedback.", source: src.nextMove });
  if (has("employment")) push({ id: "skillbridge", phase: "p1", area: "employment", title: "Research SkillBridge industry training programs", notes: "Up to your last 180 days working with a civilian employer while still on active-duty pay. Requires command approval — raise it early.", source: src.skillbridge });
  if (has("education")) push({ id: "giResearch", phase: "p1", area: "education", title: "Confirm your GI Bill eligibility and compare schools", notes: "The comparison tool shows what each school actually pays out — tuition, housing allowance, and outcomes.", source: src.giCompare });
  if (has("business")) push({ id: "b2b", phase: "p1", area: "employment", title: "Register for Boots to Business (TAP entrepreneurship track)", notes: "The two-day intro plus follow-on course is free for transitioning members and spouses.", source: src.b2b });
  push({ id: "budget", phase: "p1", area: "financial", essential: a.finances === "income-now", title: "Build your transition budget", notes: a.targetState ? `Price it against real costs in ${st?.name || "your target state"} — our Relocation planner has official cost-of-living data per metro.` : "No target location yet? Run our Relocation planner — cost of living can swing your runway by months." });
  if (famAny) push({ id: "famTalk", phase: "p1", area: "family", essential: true, title: "Hold the family planning conversation", notes: "Timeline, location shortlist, school calendars, and your spouse's career all belong in one honest conversation — before decisions lock in." });
  if (a.priorities.includes("wellbeing")) push({ id: "identityStart", phase: "p1", area: "wellbeing", title: "Start writing your service story", notes: "Who are you without the rank? Veterans who work this out early report smoother landings. It also becomes interview material." });

  // ---- P2 · T-9 to T-6 — TAP & benefits research
  push({ id: "tap", phase: "p2", area: "benefits", essential: true, deadline: true, title: "Complete TAP (Transition Assistance Program)", notes: "Required by law — begin no later than 365 days before separation. Pick the track matching your goal (employment, education, entrepreneurship).", source: src.tap });
  if (claims) push({ id: "conditionsList", phase: "p2", area: "benefits", essential: true, title: "List every claimable condition with your VSO", notes: "Document each one with a provider visit now — evidence gathered in uniform is the strongest evidence you'll ever have." });
  if (has("employment") || has("undecided")) push({ id: "network3", phase: "p2", area: "employment", title: "Start networking: 2–3 informational conversations a month", notes: "Most veteran hires come through people, not portals. Our Networking & mentors page lists free programs that pair you with your industry." });
  if (has("education")) push({ id: "jst", phase: "p2", area: "education", title: "Pull your Joint Services Transcript (JST) and request a credit review", notes: "Your military training may already be worth college credit — our Smart transcript tool shows how to claim it.", source: src.jst });
  if (a.family.includes("spouse")) push({ id: "spouseLicense", phase: "p2", area: "family", title: "Check spouse professional-license portability in your target state", notes: "Many states expedite or reciprocate military-spouse licenses — start the paperwork before the move, not after." });
  push({ id: "sgliPlan", phase: "p2", area: "financial", title: "Learn your life-insurance conversion window (SGLI → VGLI)", notes: "Your SGLI coverage doesn't follow you automatically. Know the post-separation deadlines now so they never sneak up.", source: src.vgli });
  if (retiree) push({ id: "sbp", phase: "p2", area: "financial", essential: true, deadline: true, title: "Do the Survivor Benefit Plan (SBP) homework", notes: "An irrevocable retirement-day decision that affects your family for life. Talk it through with a counselor and your spouse.", source: src.sbp });
  if (st) push({ id: "stateBenefits", phase: "p2", area: "benefits", title: `Research ${st.name} veteran benefits`, notes: `${st.agency.name} runs state-level benefits on top of your federal ones — property-tax, education, and employment programs vary a lot by state.`, source: { label: st.agency.name, url: st.agency.url } });

  // ---- P3 · T-6 to T-3 — applications & ramp-up
  if (claims) push({ id: "bdd", phase: "p3", area: "benefits", essential: true, deadline: true, title: "File your BDD claim (Benefits Delivery at Discharge)", notes: "The window is 180 to 90 days before separation — file inside it and your exams happen while you're still in, so a decision can land right after you're out.", source: src.bdd });
  if (has("employment") || has("undecided")) push({ id: "applications", phase: "p3", area: "employment", essential: has("employment"), title: "Go live with applications — tailored, not sprayed", notes: "Tailor the resume per posting, use veterans' preference on federal jobs, and keep the networking conversations running in parallel." });
  if (has("education")) push({ id: "schoolApps", phase: "p3", area: "education", essential: true, deadline: true, title: "Submit school applications, FAFSA, and your GI Bill application (COE)", notes: "Apply for the Certificate of Eligibility early — schools want it in hand and processing takes time.", source: src.coe });
  if (famAny || a.targetState) push({ id: "movePlan", phase: "p3", area: "family", essential: kids, title: kids ? "Plan the move around the school calendar" : "Plan the move", notes: kids ? "Mid-year school moves are the hardest part of a PCS for kids. If the timeline allows, aim for summer — and request school records early." : "Your final move is a one-time entitlement — schedule household goods early; peak season books out." });
  push({ id: "leaveMath", phase: "p3", area: "financial", title: "Decide terminal leave vs. leave sell-back and map the pay gap", notes: "Project the gap between your last military paycheck and first civilian one — that number drives every other financial decision." });
  if (a.priorities.includes("wellbeing")) push({ id: "routine", phase: "p3", area: "wellbeing", title: "Design your post-separation routine now", notes: "Gym, community, a standing call with your people. Structure is the thing veterans say they miss most — build the replacement before you need it." });

  // ---- P4 · T-3 to separation — final out & the move
  push({ id: "dd214", phase: "p4", area: "benefits", essential: true, title: "Review your DD-214 line by line BEFORE signing", notes: "Errors here follow you for decades — awards, schools, deployments, character of service. Fix them while you're still standing in the building." });
  push({ id: "healthApply", phase: "p4", area: "benefits", essential: true, title: "Apply for VA health care — don't wait for a disability rating", notes: "Enrollment is separate from claims. Recent-era combat veterans and many others have enhanced eligibility windows — check yours and apply.", source: src.health });
  if (famAny) push({ id: "tricareBridge", phase: "p4", area: "family", essential: true, deadline: true, title: "Bridge health coverage for the family (check TAMP)", notes: "Some separations qualify for 180 days of transitional TRICARE (TAMP). Confirm your eligibility and line up what follows it — no coverage gaps.", source: src.tamp });
  if (a.finances === "income-now") push({ id: "ucxAware", phase: "p4", area: "financial", essential: true, title: "Know your unemployment compensation rights (UCX)", notes: "Ex-service members can file for unemployment in their state right after separation. It exists for exactly this bridge — using it is smart, not shameful.", source: src.ucx });
  if (has("employment")) push({ id: "startDate", phase: "p4", area: "employment", title: "Target a start date that respects the move", notes: "Two to four weeks of buffer after terminal leave beats day-one burnout. You've earned a breath between uniforms." });
  push({ id: "oneSource", phase: "p4", area: "wellbeing", title: "Bookmark Military OneSource — it stays with you 365 days", notes: "Free counseling, tax help, and consultations continue for a full year after separation.", source: src.oneSource });

  // ---- P5 · Day 1 to +6 months — landing
  push({ id: "vamcRegister", phase: "p5", area: "benefits", essential: true, title: st ? `Enroll and register at your VA facility in ${st.name}` : "Enroll and register at your local VA facility", notes: "Get in the system and book a first appointment even if you feel fine — established care makes everything later easier.", source: src.facilities });
  push({ id: "vgliWindow", phase: "p5", area: "financial", essential: true, deadline: true, title: "Decide on VGLI inside the guaranteed-acceptance window", notes: "Apply within 240 days of separation and no health questions are asked. The absolute deadline is 1 year + 120 days — but the 240-day mark is the one that matters.", source: src.vgli });
  if (claims) push({ id: "claimTrack", phase: "p5", area: "benefits", essential: true, title: a.sepWindow === "out" || a.sepWindow === "0-3" ? "File your disability claim with VSO help (Intent to File locks your date)" : "Track your BDD claim on VA.gov", notes: a.sepWindow === "out" || a.sepWindow === "0-3" ? "An Intent to File preserves your effective date for a year while you build the claim properly — free VSO help, never claim sharks." : "Watch for exam notices and respond fast — silence is the main thing that stalls claims.", source: src.itf });
  if (has("employment")) push({ id: "first90", phase: "p5", area: "employment", title: "First 90 days on the job: translate, don't retreat", notes: "Find the veteran employee group, learn the unwritten rules, and give yourself six months before judging the fit." });
  if (a.finances === "income-now") push({ id: "ucxFile", phase: "p5", area: "financial", essential: true, title: "File your UCX unemployment claim if income hasn't landed", notes: "File in the state where you live now, with your DD-214 in hand.", source: src.ucx });
  if (has("education")) push({ id: "mhaCheck", phase: "p5", area: "education", title: "First term: confirm GI Bill payments are flowing", notes: "Verify enrollment monthly if required, and flag payment problems to the school certifying official immediately." });
  if (kids) push({ id: "schoolSettle", phase: "p5", area: "family", title: "Get the kids' school transition settled", notes: "Records transferred, counselors briefed, activities joined — kids stabilize faster when one adult owns this checklist." });
  push({ id: "identityDip", phase: "p5", area: "wellbeing", essential: true, title: "Expect the month-3-to-6 dip — and know it's normal", notes: "The mission-and-identity gap usually hits after the boxes are unpacked. Vet Centers offer free, confidential readjustment counseling — no rating or enrollment needed.", source: src.vetCenter });

  // ---- P6 · +6 to +12 months — stabilization
  if (claims) push({ id: "ratingReview", phase: "p6", area: "benefits", title: "Got your rating decision? Review it with your VSO", notes: "If it's wrong or incomplete, there are free, structured review paths (supplemental claim, higher-level review, board appeal). Never pay a percentage to anyone." });
  if (has("employment")) push({ id: "sixMoCareer", phase: "p6", area: "employment", title: "Six-month career check: grow here or pivot?", notes: "If the fit is wrong, that's data, not failure — re-run the Pathfinder with what you now know about civilian work." });
  push({ id: "rebuildFund", phase: "p6", area: "financial", title: "Rebuild the emergency fund the move consumed", notes: "Three to six months of the new (civilian) budget — then start on longer-term goals." });
  if (has("education")) push({ id: "campusVets", phase: "p6", area: "education", title: "Plug into the campus veterans center", notes: "Tutoring, priority registration, and people who get it — students who connect early finish at higher rates." });
  if (famAny) push({ id: "famRetro", phase: "p6", area: "family", title: "Household retro: is this location working?", notes: "Six months in is the honest checkpoint. If it isn't working, our Relocation planner compares alternatives with real data — moving again is allowed." });
  push({ id: "anniversary", phase: "p6", area: "wellbeing", title: "One-year-out check-in — then mentor someone behind you", notes: "Teaching the next transitioning service member what you learned is the fastest identity upgrade there is." });

  // ---- P7 · +1 to +2 years — growth
  if (has("employment")) push({ id: "yearTwoComp", phase: "p7", area: "employment", title: "Year-two move: negotiate or level up with market data", notes: "You now have civilian experience — benchmark your pay against official BLS data (our career pages carry it) and negotiate from evidence." });
  if (has("education")) push({ id: "degreeCheck", phase: "p7", area: "education", title: "Degree/certification progress check", notes: "On track to finish inside your benefit months? Adjust course load now, not senior year." });
  if (claims) push({ id: "vre", phase: "p7", area: "education", title: "Service-connected rating? Look at VR&E (Chapter 31)", notes: "Veteran Readiness & Employment can fund retraining beyond the GI Bill if a service-connected condition limits your line of work.", source: src.vre });
  push({ id: "annualBenefits", phase: "p7", area: "benefits", title: "Annual benefits review — state and federal programs change", notes: st ? `${st.agency.name} programs and eligibility rules get updated — a yearly check keeps money on the table from going stale.` : "State programs vary and change — re-check your state's veterans agency yearly.", source: st ? { label: st.agency.name, url: st.agency.url } : undefined });
  if (a.finances !== "income-now") push({ id: "vaLoan", phase: "p7", area: "financial", title: "Stable and ready to put down roots? Price a VA home loan", notes: "No down payment and no monthly mortgage insurance for most eligible veterans — compare the current funding fee before committing.", source: src.vaLoan });
  if (famAny) push({ id: "famGoals", phase: "p7", area: "family", title: "Reassess the family plan against year-one reality", notes: "Spouse career, kids' schools, distance from your people — the plan should serve the family you have now, not the one from the intake form." });
  push({ id: "mentorNow", phase: "p7", area: "wellbeing", title: "Become the mentor you needed", notes: "ACP, veteran networks, or just answering the phone — veterans who give back report the strongest sense of post-service purpose." });

  return t;
}

/** Sort: essentials first, then the member's weighted priorities, then the rest. */
function orderTasks(tasks: TimelineTask[], priorities: FocusArea[]): TimelineTask[] {
  const rank = (x: TimelineTask) =>
    (x.essential ? 0 : 2) + (priorities.length === 0 || priorities.includes(x.area) ? 0 : 1);
  return [...tasks].sort((a, b) => rank(a) - rank(b));
}

function narrative(phase: TimelinePhase, a: TimelineAnswers): string {
  const dl = phase.tasks.filter((t) => t.deadline);
  const ess = phase.tasks.filter((t) => t.essential && !t.deadline);
  const parts: string[] = [];
  switch (phase.id) {
    case "p1": parts.push("This quarter is about positioning, not paperwork — accounts open, records gathering, and the family pointed the same direction."); break;
    case "p2": parts.push("TAP is the anchor of this window; everything else builds on what you learn there."); break;
    case "p3": parts.push("This is the highest-stakes stretch before the door: applications go out and the claim window opens."); break;
    case "p4": parts.push("Out-processing rewards the detail-checkers — slow down on anything you sign."); break;
    case "p5": parts.push("The first six months are about landing well: enrollment done, income flowing, and grace for the adjustment."); break;
    case "p6": parts.push("Stabilization means honest checkpoints — on the job, the location, and how you're actually doing."); break;
    case "p7": parts.push("Now you're building, not transitioning — compound the career, finish the education, keep the benefits current."); break;
  }
  if (dl.length) parts.push(`Time-sensitive here: ${dl.map((t) => t.title).join("; ")}.`);
  else if (ess.length) parts.push(`Don't skip: ${ess[0].title}.`);
  if (phase.status === "current") parts.push("You're in this window right now — start at the top.");
  return parts.join(" ");
}

export function buildTimeline(a: TimelineAnswers): TransitionTimeline {
  const m = sepMonths(a.sepWindow);
  const all = buildTasks(a);

  const phases: TimelinePhase[] = PHASE_META.map((p) => {
    const status: PhaseStatus = m > p.hi ? "ahead" : m > p.lo ? "current" : "past";
    // Post-separation phases are never "past" for someone still in uniform,
    // and someone already out sits in p5.
    const adj: PhaseStatus = a.sepWindow === "out" && p.id === "p5" ? "current" : status;
    const tasks = orderTasks(all.filter((t) => t.phase === p.id), a.priorities);
    const ph: TimelinePhase = { id: p.id, label: p.label, window: p.window, status: adj, narrative: "", tasks };
    ph.narrative = narrative(ph, a);
    return ph;
  });

  // Catch-up: essential tasks stranded in past phases. Honest exclusions:
  // the BDD window closes at T-90, and TAP attendance / the SBP election
  // aren't available once you're already out.
  const gone = new Set<string>(
    a.sepWindow === "out" ? ["bdd", "tap", "sbp"] : a.sepWindow === "0-3" ? ["bdd"] : []
  );
  const catchUp = phases
    .filter((p) => p.status === "past")
    .flatMap((p) => p.tasks.filter((t) => t.essential))
    .filter((t) => !gone.has(t.id));

  const deadlines = all.filter((t) => t.deadline);

  const bits: string[] = [];
  bits.push(a.sepWindow === "out" ? "You're already out — this plan starts where you are and runs two years forward." :
    `Roughly ${a.sepWindow === "12+" ? "a year or more" : a.sepWindow === "9-12" ? "9–12 months" : a.sepWindow === "6-9" ? "6–9 months" : a.sepWindow === "3-6" ? "3–6 months" : "under 3 months"} to separation.`);
  if (a.goals.length && !a.goals.includes("undecided")) bits.push(`Aimed at ${a.goals.map((g) => g === "employment" ? "civilian employment" : g === "education" ? "education" : "starting a business").join(" + ")}.`);
  if (a.goals.includes("undecided")) bits.push("Destination still open — the Pathfinder can close that gap.");
  if (a.targetState) bits.push(`Headed to ${stateEntry(a.targetState)?.name || a.targetState}.`);
  if (a.priorities.length) bits.push(`Weighted toward: ${a.priorities.map((x) => FOCUS_META[x].label).join(", ")}.`);
  return { phases, catchUp, deadlines, summary: bits.join(" ") };
}
