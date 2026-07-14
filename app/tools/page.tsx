"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { careerById } from "@/lib/data";
import { Wrap, CardArt } from "@/components/ui";

const TOOLS: { href: string; icon: string; title: string; body: string; art: "compass" | "doc" | "layers" | "nodes" }[] = [
  { href: "/pathfinder", icon: "ti-compass", title: "Pathfinder", body: "The decision engine: 4 tracks, 10 questions, your best-fit career path with a % fit and the route to get there.", art: "compass" },
  { href: "/timeline", icon: "ti-timeline", title: "Transition timeline", body: "Your last 12 months in uniform and first 24 months out, phase by phase — every deadline on one plan you control.", art: "layers" },
  { href: "/relocate", icon: "ti-map-2", title: "Relocation planner", body: "Compare places to live on what matters to you: VA access, cost, jobs for your path, schools, community, and more.", art: "compass" },
  { href: "/compare", icon: "ti-columns-3", title: "Compare states", body: "Two or three states side by side: veteran benefits by category plus cost of living, rent, and jobs — every figure from a verified source.", art: "layers" },
  { href: "/family", icon: "ti-users", title: "Family planner", body: "Plan as a household — spouse, kids, and caregiver checkpoints, shared decisions, and verified family programs.", art: "nodes" },
  { href: "/updates", icon: "ti-refresh", title: "Life changed?", body: "Moved, new rating, new child, career change? Report it and see exactly how your gameplan adapts — before you commit.", art: "layers" },
  { href: "/resume", icon: "ti-file-text", title: "Resume scanner", body: "Paste your resume, get recruiter-style feedback: jargon translation, missing numbers, and keywords for your target path.", art: "doc" },
  { href: "/transcript", icon: "ti-school", title: "Smart transcript", body: "See what your military training may be worth in college credit — and how to claim it via the JST/CCAF.", art: "layers" },
  { href: "/network", icon: "ti-users-group", title: "Networking & mentors", body: "Free mentorship and veteran networks, tailored to your destination — because people beat portals.", art: "nodes" },
];

export default function Tools() {
  const { s, ready } = useStore();
  const chosen = ready ? careerById(s.chosenPath?.careerId) : undefined;
  return (
    <Wrap>
      <h2>Your toolkit</h2>
      <p className="muted" style={{ maxWidth: 640 }}>
        {chosen
          ? <>Everything here is tuned toward your destination: <strong>{chosen.label}</strong>{s.chosenPath?.fitPct ? ` (${s.chosenPath.fitPct}% fit, demo)` : ""}.</>
          : <>Pick a destination in the Pathfinder first and every tool tunes itself to it — or dive straight in.</>}
      </p>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", marginTop: 14 }}>
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="card" style={{ textDecoration: "none", color: "var(--ink)", position: "relative", overflow: "hidden" }}>
            <CardArt kind={t.art} />
            <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="iconwrap"><i className={`ti ${t.icon}`} aria-hidden="true" /></span>
              <span style={{ fontWeight: 600, fontSize: "var(--fs-h4)" }}>{t.title}</span>
            </span>
            <span className="muted small" style={{ display: "block", margin: "10px 0 0" }}>{t.body}</span>
          </Link>
        ))}
      </div>
    </Wrap>
  );
}
