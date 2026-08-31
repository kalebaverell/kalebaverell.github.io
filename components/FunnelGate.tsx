"use client";
// The single-action funnel: until the gameplan quiz is complete, every app route
// shows one card with one button instead of its content. One gate here beats a
// dozen per-page empty states, and it means no route can leak the full UI to a
// first-time visitor. Marketing, legal, and account-recovery paths stay open.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Wrap } from "@/components/ui";
import PageSkeleton from "@/components/PageSkeleton";

// Reachable without a gameplan. Everything else funnels to the quiz.
const OPEN_PATHS = new Set([
  "", // home
  "onboarding", // the quiz itself
  "trust", // the credibility promise stays public
  "privacy",
  "terms",
  "do-not-sell", // a privacy control can never be behind a funnel
  "support", // supporters aren't veterans with plans - never funnel them
  "guides", // free editorial content - the whole point is that it's ungated
  "admin", // internal controls (sample loader)
  "reset", // password reset must never be gated
]);

// Per-page gate identity: same gate mechanic everywhere, but each door describes
// the room behind it. Copy reuses claims already made (and cited) elsewhere on
// the site - no new numbers are introduced here. Unmapped routes get the generic card.
const GATES: Record<string, { icon: string; eyebrow: string; title: string; sub: string; inside: [string, string][]; guide?: [string, string] }> = {
  benefits: {
    icon: "ti-award", eyebrow: "Benefits library", title: "The benefits you earned, in one place.",
    sub: "Federal and state programs matched to your answers - every card linked to its official source.",
    inside: [
      ["ti-map-2", "Your state's programs, verified and cited"],
      ["ti-scale", "Federal benefits checked against official sources"],
      ["ti-check", "Ordered around your plan's next steps"],
    ],
    guide: ["/guides/state-benefits", "Prefer to read first? Every state's programs, free and ungated"],
  },
  family: {
    icon: "ti-users", eyebrow: "For families", title: "Transition happens to the whole household.",
    sub: "A few family questions fold everyone into the plan - the checkpoints most veterans discover too late.",
    inside: [
      ["ti-heart-handshake", "Spouse license portability, state by state"],
      ["ti-shield-check", "TRICARE transition coverage windows"],
      ["ti-calendar-check", "School-calendar move timing"],
    ],
  },
  pathfinder: {
    icon: "ti-compass", eyebrow: "Career pathfinder", title: "Find the work that fits.",
    sub: "Your best-fit civilian paths, ranked and explained with real federal pay data.",
    inside: [
      ["ti-shield-check", "Grounded in the DOL O*NET framework"],
      ["ti-scale", "BLS pay data on every path"],
      ["ti-check", "The reasons shown for every match"],
    ],
  },
  timeline: {
    icon: "ti-calendar-check", eyebrow: "Transition timeline", title: "Your months, mapped.",
    sub: "A phase-by-phase map from today to landed, built around your separation date.",
    guide: ["/guides/transition-timeline", "Prefer to read first? The full timeline guide, free and ungated"],
    inside: [
      ["ti-calendar-check", "Phases mapped to your separation date"],
      ["ti-file-text", "Deadlines linked to their official sources"],
      ["ti-check", "A catch-up plan if you're inside the window"],
    ],
  },
  relocate: {
    icon: "ti-map-2", eyebrow: "Relocation planner", title: "Where will you land?",
    sub: "Compare places to live on the numbers that matter - all official, all cited.",
    inside: [
      ["ti-map-2", "Cost, rent, and jobs - BEA, HUD, and BLS data"],
      ["ti-shield-check", "VA facility access for every metro"],
      ["ti-check", "Your priorities set the ranking"],
    ],
  },
  compare: {
    icon: "ti-git-compare", eyebrow: "Compare places", title: "Side by side, decided.",
    sub: "Head-to-head detail for the places on your shortlist.",
    inside: [
      ["ti-git-compare", "Places side by side, two at a time"],
      ["ti-map-2", "The same cited cost, rent, and jobs data"],
      ["ti-check", "Every number linked to its source"],
    ],
  },
  resume: {
    icon: "ti-file-text", eyebrow: "Resume builder", title: "Your service, translated.",
    sub: "Turn your record into a resume civilian employers understand.",
    inside: [
      ["ti-file-text", "Military experience in civilian wording"],
      ["ti-compass", "Built around the path you choose"],
      ["ti-lock", "Stays private until you share it"],
    ],
  },
  tools: {
    icon: "ti-tool", eyebrow: "All tools", title: "One toolbox, all pointed the same way.",
    sub: "Every VetPath tool works from the same plan - build it once and they all point at your next steps.",
    inside: [
      ["ti-award", "Benefits, careers, places, and family"],
      ["ti-calendar-check", "Timeline and resume included"],
      ["ti-check", "All free, all cited"],
    ],
  },
};

export default function FunnelGate({ children }: { children: React.ReactNode }) {
  const { s, ready } = useStore();
  const path = usePathname() || "/";
  const first = path.split("/").filter(Boolean)[0] || "";
  const open = OPEN_PATHS.has(first);

  if (open || s.gameplan) return <>{children}</>;
  // Not ready yet: show a neutral skeleton rather than flashing the gate (or the page).
  if (!ready) return <PageSkeleton kind="narrow" />;

  // Mid-intake visitors get a resume card, not a start-over pitch (suggestion #6b):
  // their answers are saved, and the card says so with the exact step to rejoin.
  const midIntake = s.step > 0;
  const g = midIntake ? undefined : GATES[first];
  return (
    <Wrap narrow>
      <div className="card" style={{ textAlign: "center", padding: "40px 28px 36px", marginTop: 24 }}>
        <div className="iconwrap" style={{ width: 54, height: 54, fontSize: 26, margin: "0 auto 14px" }}>
          <i className={`ti ${midIntake ? "ti-player-play" : g ? g.icon : "ti-map-2"}`} aria-hidden="true" />
        </div>
        {g && <div className="eyebrow" style={{ margin: "0 0 10px" }}>{g.eyebrow}</div>}
        <h2 style={{ margin: "0 0 8px" }}>{midIntake ? "Pick up where you left off" : g ? g.title : "First, build your gameplan"}</h2>
        <p className="muted" style={{ maxWidth: 420, margin: "0 auto 20px" }}>
          {midIntake
            ? `You're on step ${Math.min(s.step + 1, 5)} of 5 and your answers are saved - a few more questions and the plan is yours.`
            : g
              ? g.sub
              : "A few quick questions. Everything here unlocks once your plan exists, so it can all point at your next steps."}
        </p>
        {g && (
          <div style={{ maxWidth: 390, margin: "0 auto 24px", textAlign: "left" }}>
            <p className="small muted" style={{ margin: "0 0 10px", fontWeight: 600 }}>Inside, once your plan exists:</p>
            <div style={{ display: "grid", gap: 9 }}>
              {g.inside.map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`ti ${icon}`} aria-hidden="true" style={{ color: "var(--accent-600)", fontSize: 17, marginTop: 2 }} />
                  <span className="small">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <Link className="btn gold" href="/onboarding" style={{ display: "inline-flex" }}>
          <i className={`ti ${midIntake ? "ti-player-play" : "ti-compass"}`} /> {midIntake ? "Continue my gameplan" : "Build my gameplan"}
        </Link>
        <p className="small muted" style={{ margin: "18px 0 0" }}>
          {midIntake ? "Saved automatically" : "About 10 minutes"} · free · <Link href="/trust">why you can trust it</Link>
        </p>
        {g?.guide && (
          <p className="small" style={{ margin: "10px 0 0" }}>
            <Link href={g.guide[0]}><i className="ti ti-file-text" aria-hidden="true" /> {g.guide[1]}</Link>
          </p>
        )}
      </div>
    </Wrap>
  );
}
