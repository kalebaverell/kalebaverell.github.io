"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { careerById } from "@/lib/data";
import { Wrap, CardArt } from "@/components/ui";

type Tool = { href: string; icon: string; title: string; body: string; art: "compass" | "doc" | "layers" | "nodes" };

// Grouped by the same three tracks the dashboard uses, so Explore reads as
// "go deeper on your track", not a drawer of ten unrelated gadgets. One line
// per tool - the tool explains itself once opened.
const GROUPS: { label: string; icon: string; tools: Tool[] }[] = [
  {
    label: "Career",
    icon: "ti-briefcase",
    tools: [
      { href: "/pathfinder", icon: "ti-compass", title: "Pathfinder", body: "10 questions. A career path that fits, with the route to get there.", art: "compass" },
      { href: "/timeline", icon: "ti-timeline", title: "Transition timeline", body: "Every deadline from 12 months out to 24 months after.", art: "layers" },
      { href: "/resume", icon: "ti-file-text", title: "Resume scanner", body: "Recruiter-style feedback on your resume, in plain English.", art: "doc" },
      { href: "/transcript", icon: "ti-school", title: "Smart transcript", body: "What your training may be worth in college credit.", art: "layers" },
      { href: "/network", icon: "ti-users-group", title: "Networking & mentors", body: "Free mentors and veteran networks for your path.", art: "nodes" },
    ],
  },
  {
    label: "Housing",
    icon: "ti-home",
    tools: [
      { href: "/relocate", icon: "ti-map-2", title: "Relocation planner", body: "Compare places on VA access, cost, jobs, and community.", art: "compass" },
      { href: "/compare", icon: "ti-columns-3", title: "Compare states", body: "Two or three states side by side, every figure sourced.", art: "layers" },
      { href: "/housing", icon: "ti-home-dollar", title: "Home prices & the VA loan", body: "What homes typically cost, town by town - and the $0-down loan you earned.", art: "doc" },
    ],
  },
  {
    label: "Life & family",
    icon: "ti-users",
    tools: [
      { href: "/family", icon: "ti-users", title: "Family planner", body: "Checkpoints and decisions the whole household should see.", art: "nodes" },
      { href: "/updates", icon: "ti-refresh", title: "Life changed?", body: "See how your plan adapts before you commit.", art: "layers" },
      { href: "/reserves", icon: "ti-shield-star", title: "Reserves & Guard", body: "The option nobody explains. Just the math, no pitch.", art: "layers" },
    ],
  },
];

export default function Tools() {
  const { s, ready } = useStore();
  const chosen = ready ? careerById(s.chosenPath?.careerId) : undefined;
  return (
    <Wrap>
      <h2>Explore</h2>
      <p className="muted" style={{ maxWidth: 640 }}>
        {chosen
          ? <>Tuned to your destination: <strong>{chosen.label}</strong>.</>
          : <>Every tool tunes itself once you pick a path in the Pathfinder.</>}
      </p>
      {GROUPS.map((g) => (
        <div key={g.label}>
          <h3 style={{ margin: "22px 0 0" }}><i className={`ti ${g.icon}`} style={{ color: "var(--accent-ink)" }} /> {g.label}</h3>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", marginTop: 12 }}>
            {g.tools.map((t) => (
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
        </div>
      ))}
    </Wrap>
  );
}
