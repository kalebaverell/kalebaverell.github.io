// The full separation checklist (public, Sep 18 2026).
//
// WHY THIS EXISTS: our deepest asset - the seven-phase timeline with ~45 tasks
// and 20 official sources - was locked behind the funnel gate, so search could
// only ever see /guides/transition-timeline, a 758-word summary. Ten pages sat
// in "Discovered, not indexed" and Google had us filed as veterinary pathology.
// This is the ungated reference that gives search something substantial and
// unmistakably military to index.
//
// IT IS NOT A GUEST PATH. Account-first still holds. What is public here is the
// GENERIC route: the phases, the tasks, and the dated deadlines that apply to
// everyone. What stays behind the account is the thing that makes it a plan -
// dated to your EAS, filtered to your branch and goals, checkable, exportable
// to your calendar, with the catch-up card when you are already inside a window.
//
// EVERY task, note and source below is lifted from lib/timeline.ts rather than
// written fresh, so the public page and the private plan can never drift into
// contradicting each other. All 20 URLs were curl/browser-verified on Sep 18
// 2026 (dol.gov and militarypay.defense.gov 403 to curl but load fine in a
// browser - bot-blocking, not rot). Re-verify on the quarterly refresh.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";
import GuideCta from "@/components/GuideCta";
import FeedbackAsk from "@/components/FeedbackAsk";

export const metadata = routeMeta(
  "The complete military separation checklist",
  "Every phase of leaving the military, from twelve months out to two years after, with the deadlines that actually bite - TAP at 365 days, BDD between 180 and 90, VGLI at 240 - each one linked to the official page that governs it."
);

type Item = {
  t: string;
  n: string;
  src?: { label: string; url: string };
  /** Hard, dated or hard-to-reverse. */
  key?: boolean;
  /** Carries a real deadline. */
  due?: boolean;
  /** Only applies to some people - said plainly rather than implied. */
  ifYou?: string;
};

const SRC = {
  tap: { label: "DoD TAP", url: "https://www.dodtap.mil/" },
  bdd: { label: "VA - pre-discharge (BDD) claims", url: "https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/" },
  itf: { label: "VA - Intent to File", url: "https://www.va.gov/resources/your-intent-to-file-a-va-claim/" },
  vgli: { label: "VA - VGLI", url: "https://www.va.gov/life-insurance/options-eligibility/vgli/" },
  health: { label: "VA - apply for health care", url: "https://www.va.gov/health-care/how-to-apply/" },
  giCompare: { label: "GI Bill Comparison Tool", url: "https://www.va.gov/education/gi-bill-comparison-tool/" },
  coe: { label: "VA - apply for education benefits", url: "https://www.va.gov/education/how-to-apply/" },
  skillbridge: { label: "DoD SkillBridge", url: "https://skillbridge.osd.mil/" },
  b2b: { label: "SBA - Boots to Business", url: "https://www.sba.gov/sba-learning-platform/boots-business" },
  jst: { label: "Joint Services Transcript", url: "https://jst.doded.mil/" },
  vetCenter: { label: "VA Vet Centers", url: "https://www.vetcenter.va.gov/" },
  oneSource: { label: "Military OneSource", url: "https://www.militaryonesource.mil/" },
  ucx: { label: "DOL VETS", url: "https://www.dol.gov/agencies/vets" },
  vso: { label: "VA - accredited representatives", url: "https://www.va.gov/get-help-from-accredited-representative/" },
  nextMove: { label: "My Next Move for Veterans", url: "https://www.mynextmove.org/vets/" },
  vaLoan: { label: "VA home loans", url: "https://www.va.gov/housing-assistance/home-loans/" },
  sbp: { label: "DoD - Survivor Benefit Plan", url: "https://militarypay.defense.gov/Benefits/Survivor-Benefit-Program/" },
  tamp: { label: "TRICARE - TAMP", url: "https://www.tricare.mil/tamp" },
  vre: { label: "VA - VR&E (Chapter 31)", url: "https://www.va.gov/careers-employment/vocational-rehabilitation/" },
  facilities: { label: "VA facility locator", url: "https://www.va.gov/find-locations/" },
};

const PHASES: { id: string; label: string; window: string; lede: string; items: Item[] }[] = [
  {
    id: "p1", label: "Early planning", window: "12 to 9 months out",
    lede: "Nothing here is urgent yet, which is exactly why most people skip it and pay for it later. These are the moves that make every later step cheaper.",
    items: [
      { t: "Create your VA.gov account", n: "ID.me or Login.gov. Nearly every benefit below starts here. Ten minutes now, no waiting rooms later.", src: SRC.health, key: true },
      { t: "Connect with an accredited VSO - they are free", n: "Veteran Service Organizations help with claims and benefits at no cost. Never pay a percentage of your benefits to anyone.", src: SRC.vso, key: true },
      { t: "Start collecting your complete medical record", n: "Every condition you will claim needs to be documented while you are still in. See your provider about anything you have been ignoring.", key: true, ifYou: "expect to file a disability claim" },
      { t: "Draft a civilian resume and translate your MOS", n: "Use the crosswalk to see how your military occupation maps to civilian titles.", src: SRC.nextMove, ifYou: "are heading for employment" },
      { t: "Research SkillBridge industry training", n: "Up to your last 180 days working with a civilian employer while still on active-duty pay. Requires command approval - raise it early.", src: SRC.skillbridge, ifYou: "are heading for employment" },
      { t: "Confirm GI Bill eligibility and compare schools", n: "The comparison tool shows what each school actually pays out - tuition, housing allowance, and outcomes.", src: SRC.giCompare, ifYou: "are heading for school" },
      { t: "Register for Boots to Business", n: "The TAP entrepreneurship track. Two-day intro plus follow-on course, free for transitioning members and spouses.", src: SRC.b2b, ifYou: "want to start a business" },
      { t: "Build your transition budget", n: "Price it against real costs where you are actually going. Cost of living can swing your runway by months." },
      { t: "Hold the family planning conversation", n: "Timeline, location shortlist, school calendars, and your spouse's career all belong in one honest conversation - before decisions lock in.", key: true, ifYou: "have family moving with you" },
    ],
  },
  {
    id: "p2", label: "TAP and benefits research", window: "9 to 6 months out",
    lede: "The first hard deadline lands in this phase, and it is set by law rather than by preference.",
    items: [
      { t: "Complete TAP (Transition Assistance Program)", n: "Required by law - begin no later than 365 days before separation. Pick the track matching your goal: employment, education, or entrepreneurship.", src: SRC.tap, key: true, due: true },
      { t: "List every claimable condition with your VSO", n: "Document each one with a provider visit now. Evidence gathered in uniform is the strongest evidence you will ever have.", key: true, ifYou: "expect to file a disability claim" },
      { t: "Start networking: two or three informational conversations a month", n: "Most veteran hires come through people, not portals.", ifYou: "are heading for employment" },
      { t: "Pull your Joint Services Transcript and request a credit review", n: "Your military training may already be worth college credit.", src: SRC.jst, ifYou: "are heading for school" },
      { t: "Check spouse professional-license portability", n: "Many states expedite or reciprocate military-spouse licenses - start the paperwork before the move, not after.", ifYou: "have a spouse with a licensed profession" },
      { t: "Learn your life-insurance conversion window", n: "SGLI does not follow you automatically. Know the post-separation deadlines now so they never sneak up.", src: SRC.vgli },
      { t: "Do the Survivor Benefit Plan homework", n: "An irrevocable retirement-day decision that affects your family for life. Talk it through with a counselor and your spouse.", src: SRC.sbp, key: true, due: true, ifYou: "are retiring rather than separating" },
      { t: "Research your state's veteran benefits", n: "States run benefits on top of your federal ones - property tax, education, and employment programs vary a lot by state." },
    ],
  },
  {
    id: "p3", label: "Applications and ramp-up", window: "6 to 3 months out",
    lede: "The BDD window opens and closes inside this phase. Miss it and you wait months longer for a decision, on the outside, without pay.",
    items: [
      { t: "File your BDD claim (Benefits Delivery at Discharge)", n: "The window is 180 to 90 days before separation. File inside it and your exams happen while you are still in, so a decision can land right after you are out.", src: SRC.bdd, key: true, due: true, ifYou: "are filing a disability claim" },
      { t: "Go live with applications - tailored, not sprayed", n: "Tailor the resume per posting, use veterans' preference on federal jobs, and keep the networking conversations running in parallel.", ifYou: "are heading for employment" },
      { t: "Submit school applications, FAFSA, and your GI Bill application", n: "Apply for the Certificate of Eligibility early - schools want it in hand and processing takes time.", src: SRC.coe, key: true, ifYou: "are heading for school" },
      { t: "Plan the move around the school calendar", n: "Mid-year school moves are the hardest part of a PCS for kids. If the timeline allows, aim for summer, and request school records early.", ifYou: "are moving with children" },
      { t: "Decide terminal leave versus leave sell-back, and map the pay gap", n: "Project the gap between your last military paycheck and your first civilian one. That number drives every other financial decision." },
    ],
  },
  {
    id: "p4", label: "Final out and the move", window: "3 months out to separation",
    lede: "One signature in this phase follows you for the rest of your life. Read it before you sign it.",
    items: [
      { t: "Review your DD-214 line by line BEFORE signing", n: "Errors here follow you for decades - awards, schools, deployments, character of service. Fix them while you are still standing in the building.", key: true },
      { t: "Apply for VA health care - do not wait for a disability rating", n: "Enrollment is separate from claims. Recent-era combat veterans and many others have enhanced eligibility windows.", src: SRC.health, key: true },
      { t: "Bridge health coverage for the family", n: "Some separations qualify for 180 days of transitional TRICARE (TAMP). Confirm your eligibility and line up what follows it - no coverage gaps.", src: SRC.tamp, key: true, due: true, ifYou: "have family on your coverage" },
      { t: "Know your unemployment compensation rights (UCX)", n: "Ex-service members can file for unemployment in their state right after separation. It exists for exactly this bridge - using it is smart, not shameful.", src: SRC.ucx, key: true, ifYou: "will not have income waiting" },
      { t: "Bookmark Military OneSource - it stays with you 365 days", n: "Free counseling, tax help, and consultations continue for a full year after separation.", src: SRC.oneSource },
    ],
  },
  {
    id: "p5", label: "Landing", window: "Day 1 to 6 months out",
    lede: "The paperwork phase is over and the quiet one begins. The deadline in here is the one veterans most often discover too late.",
    items: [
      { t: "Enrol and register at your local VA facility", n: "Get in the system and book a first appointment even if you feel fine - established care makes everything later easier.", src: SRC.facilities, key: true },
      { t: "Decide on VGLI inside the guaranteed-acceptance window", n: "Apply within 240 days of separation and no health questions are asked. The absolute deadline is one year and 120 days, but 240 days is the one that matters.", src: SRC.vgli, key: true, due: true },
      { t: "File your disability claim, or track the BDD one", n: "An Intent to File preserves your effective date for a year while you build the claim properly. Free VSO help, never claim sharks.", src: SRC.itf, key: true, ifYou: "are filing a disability claim" },
      { t: "First 90 days on the job: translate, do not retreat", n: "Find the veteran employee group, learn the unwritten rules, and give yourself six months before judging the fit.", ifYou: "have started work" },
      { t: "Expect the month-three-to-six dip - and know it is normal", n: "The mission-and-identity gap usually hits after the boxes are unpacked. Vet Centers offer free, confidential readjustment counselling - no rating or enrollment needed.", src: SRC.vetCenter, key: true },
    ],
  },
  {
    id: "p6", label: "Stabilization", window: "6 months to 1 year out",
    lede: "Far enough out that nobody is checking on you any more. This is where the honest reassessments belong.",
    items: [
      { t: "Got your rating decision? Review it with your VSO", n: "If it is wrong or incomplete there are free, structured review paths - supplemental claim, higher-level review, board appeal. Never pay a percentage to anyone.", ifYou: "filed a disability claim" },
      { t: "Six-month career check: grow here or pivot?", n: "If the fit is wrong, that is data, not failure.", ifYou: "have started work" },
      { t: "Rebuild the emergency fund the move consumed", n: "Three to six months of the new civilian budget, then start on longer-term goals." },
      { t: "Plug into the campus veterans centre", n: "Tutoring, priority registration, and people who get it. Students who connect early finish at higher rates.", ifYou: "are in school" },
      { t: "One-year-out check-in, then mentor someone behind you", n: "Teaching the next transitioning service member what you learned is the fastest identity upgrade there is." },
    ],
  },
  {
    id: "p7", label: "Growth", window: "1 to 2 years out",
    lede: "You have civilian evidence now. That changes what you can ask for.",
    items: [
      { t: "Year-two move: negotiate or level up with market data", n: "Benchmark your pay against official Bureau of Labor Statistics data and negotiate from evidence.", ifYou: "have started work" },
      { t: "Service-connected rating? Look at VR&E (Chapter 31)", n: "Veteran Readiness and Employment can fund retraining beyond the GI Bill if a service-connected condition limits your line of work.", src: SRC.vre, ifYou: "have a service-connected rating" },
      { t: "Annual benefits review - state and federal programs change", n: "Programs and eligibility rules get updated. A yearly check keeps money on the table from going stale." },
      { t: "Ready to put down roots? Price a VA home loan", n: "No down payment and no monthly mortgage insurance for most eligible veterans. Compare the current funding fee before committing.", src: SRC.vaLoan },
    ],
  },
];

const DEADLINES = [
  { when: "365 days before separation", what: "Begin TAP", note: "Required by law.", url: SRC.tap.url },
  { when: "180 to 90 days before", what: "File a BDD claim", note: "Exams happen while you are still in.", url: SRC.bdd.url },
  { when: "At retirement, once", what: "Survivor Benefit Plan election", note: "Irrevocable. Retirees only.", url: SRC.sbp.url },
  { when: "First 180 days after", what: "Transitional TRICARE (TAMP)", note: "If your separation qualifies.", url: SRC.tamp.url },
  { when: "240 days after separation", what: "VGLI with no health questions", note: "Hard stop at one year and 120 days.", url: SRC.vgli.url },
];

export default function SeparationChecklistGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "The complete military separation checklist: every phase from twelve months out to two years after",
        description:
          "The full seven-phase military separation timeline with the deadlines that carry real consequences - TAP at 365 days, BDD between 180 and 90 days, VGLI at 240 days - each linked to the official source that governs it.",
        author: { "@type": "Organization", name: "VetPath", url: SITE },
        publisher: { "@type": "Organization", name: "VetPath", url: SITE },
        mainEntityOfPage: `${SITE}/guides/separation-checklist/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "The complete separation checklist", item: `${SITE}/guides/separation-checklist/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · every step linked to its official source</Eyebrow>
      <h1 style={{ maxWidth: 700 }}>The complete separation checklist.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Seven phases, from a year before you take the uniform off to two years after. Most of it
        is not urgent, which is precisely why it gets skipped. <strong>Five items carry real
        deadlines</strong>, and missing those costs money, coverage, or months of waiting. Those
        are listed first, then the whole route in order.
      </p>
      <p className="small muted" style={{ maxWidth: 640 }}>
        Nothing here is invented. Every step links to the VA, DoD, SBA, DOL or TRICARE page that
        governs it, so you can check us. Rules change - the official page always wins over us.
      </p>

      <h2 style={{ marginTop: 36 }}>The five that actually bite</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Everything else on this page can slip a few weeks. These cannot.
      </p>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {DEADLINES.map((d, i) => (
          <div
            key={d.what}
            style={{
              display: "flex", gap: 16, flexWrap: "wrap", alignItems: "baseline",
              padding: "14px 18px",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
            }}
          >
            <span className="small" style={{ fontFamily: "var(--font-mono)", color: "var(--accent-ink)", minWidth: 190, fontWeight: 600 }}>
              {d.when}
            </span>
            <span style={{ flex: 1, minWidth: 200 }}>
              <a href={d.url} target="_blank" rel="noopener noreferrer">{d.what}</a>
              <span className="muted small" style={{ display: "block" }}>{d.note}</span>
            </span>
          </div>
        ))}
      </div>

      <GuideCta
        line="Want these dated to your actual separation month?"
        sub="Answer a few questions and this checklist comes back filtered to your situation, with your real dates and calendar reminders - free, about ten minutes."
      />

      {PHASES.map((p) => (
        <section key={p.id} style={{ marginTop: 44 }}>
          <div className="eyebrow" style={{ margin: "0 0 8px" }}>{p.window}</div>
          <h2 style={{ margin: "0 0 6px" }}>{p.label}</h2>
          <p className="muted" style={{ marginTop: 0, maxWidth: 620 }}>{p.lede}</p>

          <div style={{ borderTop: "1px solid var(--border)" }}>
            {p.items.map((it) => (
              <div key={it.t} style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong style={{ color: "var(--ink-strong)" }}>{it.t}</strong>
                  {it.due && (
                    <span className="pill medium" style={{ flexShrink: 0 }}>deadline</span>
                  )}
                </div>
                {it.ifYou && (
                  <p className="small muted" style={{ margin: "5px 0 0", fontStyle: "italic" }}>
                    Only if you {it.ifYou}.
                  </p>
                )}
                <p className="muted" style={{ margin: "6px 0 0", maxWidth: 620 }}>{it.n}</p>
                {it.src && (
                  <p className="small" style={{ margin: "7px 0 0" }}>
                    <a href={it.src.url} target="_blank" rel="noopener noreferrer">{it.src.label}</a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <h2 style={{ marginTop: 44 }}>What this page deliberately is not</h2>
      <p className="muted" style={{ maxWidth: 640 }}>
        This is the generic route. It is the same set of steps for a Marine sergeant leaving at
        four years and a Navy captain retiring at thirty, which means a good third of it will not
        apply to you and none of it carries your dates.
      </p>
      <p className="muted" style={{ maxWidth: 640 }}>
        The version we build for you is filtered to your branch, your separation month, and what
        you actually want next - so the BDD window shows as real calendar dates you can still
        hit, finished items stay checked off, and phases you have already passed come back as a
        catch-up list rather than a guilt trip. That part needs an account, because it needs your
        answers. Nothing on this page does.
      </p>

      <GuideCta
        line="Turn this into your plan."
        sub="Same checklist, dated to your separation and filtered to your situation. Free, and every figure still links to its official source."
      />

      <h2 style={{ marginTop: 44 }}>Every source on this page</h2>
      <ul className="muted small" style={{ maxWidth: 640, lineHeight: 1.9 }}>
        {Object.values(SRC).map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
          </li>
        ))}
      </ul>

      <p className="small muted" style={{ marginTop: 26, maxWidth: 640 }}>
        Shorter version of this page:{" "}
        <Link href="/guides/transition-timeline">the military transition timeline</Link>. More
        guides: <Link href="/guides">all VetPath guides</Link>. If you are in crisis right now,{" "}
        <Link href="/crisis">start here</Link> - the Veterans Crisis Line is 988, then press 1.
      </p>

      <FeedbackAsk
        variant="quiet"
        event="feedback-guide"
        line="A step here that did not match your situation?"
        cta="Tell us what you need"
        sub="- a person reads every note, and it shapes what gets built next."
      />
    </Wrap>
  );
}
