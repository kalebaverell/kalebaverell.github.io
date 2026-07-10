"use client";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { BRAND } from "@/lib/data";
import { Wrap, Callout } from "@/components/ui";
import { ThemeSwitcher } from "@/components/Footer";

function Block({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3><i className={`ti ${icon}`} style={{ color: "var(--accent-ink)" }} /> {title}</h3>
      {items.length > 0 && <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>{items.map((i, k) => <li key={k} style={{ marginBottom: 6 }}>{i}</li>)}</ul>}
    </div>
  );
}

function MonCard({ title, body, pro, con }: { title: string; body: string; pro: string; con: string }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p className="small" style={{ margin: "6px 0" }}>{body}</p>
      <p className="small" style={{ margin: 0, color: "var(--success)" }}><i className="ti ti-plus" /> {pro}</p>
      <p className="small" style={{ margin: "4px 0 0", color: "var(--danger)" }}><i className="ti ti-minus" /> {con}</p>
    </div>
  );
}

export default function Admin() {
  const { loadSample } = useStore();
  const router = useRouter();
  return (
    <Wrap>
      <div style={{ marginBottom: 16 }}>
        <Callout kind="warn">
          <strong>Internal strategy view (for Frank &amp; team).</strong> Not part of the veteran-facing product. Use this to review the business idea.
        </Callout>
      </div>
      <h2>{BRAND.name} — strategy &amp; business overview</h2>

      <Block icon="ti-chess-knight" title="Competitive advantage — the planning engine" items={[
        "The thesis: we are not an information tool or an 'how to use AI' course — we are the planning engine that helps a veteran AND their family make better life decisions after service.",
        "Benefits optimization: not a list — what likely applies to YOU, by rating, age, family, state, goals, and timing (BDD windows, Intent to File, transfer-while-serving).",
        "Relocation planning: compare places on VA access, cost, housing, jobs for your path, schools, community, airports, safety, and business climate — joined to verified state benefits.",
        "Family-centered decisions: household checkpoints and shared decisions — spouse licensure, school-year timing, caregiver programs — not choices made in a vacuum.",
        "Adaptive planning: life changes → the roadmap changes. Report a move, rating, child, career shift, business, or retirement and see exactly what changes before committing.",
        "Actionable next steps: every plan ends in a 30/60/90 with tasks, documents, contacts, and DECISIONS — organized around the right calls at the right time.",
        "vs. AI Ready Veteran and similar: they teach veterans to use AI; VetPath is the AI-powered planning solution that keeps a family on track as life evolves.",
      ]} />

      <Block icon="ti-users" title="Target users" items={[
        "Primary: service members transitioning out (0–24 months from separation).",
        "Secondary: veterans pursuing a job, education, home, or business.",
        "Also: veterans navigating disability/health, those retiring, and spouses/family.",
        "Reached through: recurring veteran meetings (like Frank's), VSO chapters, TAP, base transition offices.",
      ]} />

      <Block icon="ti-checklist" title="MVP features" items={[
        "Pathfinder decision engine: 4 tracks (Employment / Education / Trades / Entrepreneur), 9-question assessment, % fit recommendations, and a locked destination that re-routes the whole plan.",
        "Guided intake → personalized 30/60/90 gameplan with an endpoint, free-text answers on every question, and optional demographics that unlock targeted programs.",
        "Resume scanner: recruiter-style feedback, jargon translation, and keyword tailoring to the chosen path.",
        "Smart transcript: military training → sample college-credit estimates + the JST/CCAF claim process.",
        "Location fit guidance driven by disability rating (VA facility proximity) — never career-limiting.",
        "Networking hub tailored to track and demographics; SkillBridge surfaced for transitioning members.",
        "Honest disability-application prep (Intent to File, secondary conditions, free accredited VSOs).",
        "Benefits & resources library, goal planning, action checklist with progress, printable gameplan.",
        "Clear, repeated disclaimers and crisis resources.",
      ]} />

      <Block icon="ti-rocket" title="Future features" items={[
        "Secure accounts, save/sync across devices, printable/PDF gameplan.",
        "Real per-state benefits database with last-verified dates.",
        "Warm handoff / directory to accredited VSOs and county service officers.",
        "Reminders and nudges (email/SMS) for time-sensitive steps.",
        "Spouse/caregiver mode; document vault; appointment prep.",
        "Optional AI assistant grounded ONLY in verified, cited benefit content.",
      ]} />

      <Block icon="ti-coin" title="Monetization — three paths" items={[]} />
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
        <MonCard title="Balanced (mission-first)" body="Free to veterans. Funded by VSO/employer B2B2C licenses, foundation grants, and ethical sponsorship." pro="Keeps trust high; broad reach." con="Slower revenue; needs partnerships." />
        <MonCard title="Lean commercial" body="SaaS tiers for orgs (VSOs, universities, employers with veteran hiring), base-transition contracts, premium features." pro="Scalable, VC-fundable." con="Must avoid pay-to-access-benefits optics." />
        <MonCard title="Nonprofit / grant" body="501(c)(3); foundation grants, VA/state partnerships, individual donations." pro="Maximum trust; mission-locked." con="Grant dependency; slower velocity." />
      </div>

      <Block icon="ti-alert-triangle" title="Risks" items={[
        "Trust/credibility — must never feel like a scam or claim shark.",
        "Accuracy & liability — benefit rules change and vary by state.",
        "Scope creep into legal/medical/financial advice.",
        "Data sensitivity — disability, health, and financial info.",
        "Adoption — older veterans need dead-simple, high-readability UX.",
      ]} />

      <Block icon="ti-scale" title="Compliance considerations" items={[
        "Do NOT charge for benefits-claim assistance that requires VA accreditation.",
        "Position clearly as education/navigation, not representation.",
        "Cite official sources; show last-verified dates on real data.",
        "Accessibility (ADA / WCAG) and plain-language standards.",
        "Advertising/sponsorship must not imply government endorsement.",
      ]} />

      <Block icon="ti-shield-lock" title="Data & privacy" items={[
        "Data minimization — collect only what improves the plan.",
        "Local-first in the prototype; encryption at rest/in transit later.",
        "Never sell veteran data; explicit consent for any sharing.",
        "Clear retention and deletion controls; treat health data with extra care.",
      ]} />

      <Block icon="ti-message-question" title="Questions to validate with veterans" items={[
        "Would you trust an app like this? What would make you distrust it?",
        "What's the #1 thing you wish someone had handed you when you left service?",
        "Do you prefer digital, print, or a person walking you through it?",
        "Who should pay so it stays free for you?",
        "What almost fell through the cracks in your own transition?",
      ]} />

      <Block icon="ti-affiliate" title="Possible partnerships" items={[
        "VSOs: VFW, American Legion, DAV, county veteran service officers.",
        "SBA Veterans Business Outreach Centers; Boots to Business.",
        "DOL VETS and state American Job Centers.",
        "Universities with veteran/military student services.",
        "Employers with veteran-hiring programs; state veteran agencies.",
      ]} />

      <Block icon="ti-map-2" title="Go-to-market ideas" items={[
        "Pilot at Frank's recurring meetings; gather structured feedback.",
        "Partner with 1–2 VSO chapters to co-brand and distribute.",
        "TAP/base transition office pilots; QR codes on printed handouts.",
        "Veteran community channels and word-of-mouth; testimonial stories.",
        "Content: 'first 90 days after service' guides that funnel into the tool.",
      ]} />

      <div className="card" style={{ marginTop: 16 }}>
        <h3><i className="ti ti-adjustments" /> Live preview controls</h3>
        <p className="muted small">Flip the design direction while reviewing with Frank (also in the footer).</p>
        <ThemeSwitcher align="flex-start" />
        <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => { loadSample(); router.push("/dashboard"); }}>
          <i className="ti ti-user-check" /> Load a sample veteran &amp; plan
        </button>
      </div>
    </Wrap>
  );
}
