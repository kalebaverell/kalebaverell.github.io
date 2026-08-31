// The guides hub - free, ungated reading built from the same verified data
// the tools run on. Content marketing surface: these pages exist for the
// veteran who searches before they sign up for anything.
import Link from "next/link";
import { routeMeta } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";

export const metadata = routeMeta(
  "Guides",
  "Free, sourced guides for life after service: the full military transition timeline, every state's veteran benefits, and straight answers to the questions that come up most."
);

const GUIDES: { href: string; icon: string; title: string; blurb: string }[] = [
  {
    href: "/guides/transition-timeline",
    icon: "ti-route",
    title: "The military transition timeline",
    blurb: "Two years out to two years after - every phase, every deadline, every task linked to the official page that governs it.",
  },
  {
    href: "/guides/state-benefits",
    icon: "ti-award",
    title: "State veteran benefits, every state",
    blurb: "259 programs across all 50 states and D.C. - tax exemptions, tuition, hiring preference - each cited to the agency that runs it.",
  },
  {
    href: "/guides/faq",
    icon: "ti-info-circle",
    title: "Questions, answered straight",
    blurb: "BDD timing, the VGLI window, GI Bill transfer rules, whether to ever pay for claims help - short answers with official sources.",
  },
];

export default function GuidesIndex() {
  return (
    <Wrap narrow>
      <Eyebrow>Free reading · no account needed</Eyebrow>
      <h1 style={{ maxWidth: 620 }}>Guides for the road out.</h1>
      <p className="muted" style={{ maxWidth: 620 }}>
        Everything here is free to read, built from the same verified, source-linked data the
        VetPath tools run on, and re-checked on a quarterly rhythm. When you are ready for the
        version that knows <em>your</em> dates and <em>your</em> state,{" "}
        <Link href="/onboarding">the gameplan</Link> takes about ten minutes.
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 22 }}>
        {GUIDES.map((g) => (
          <Link key={g.href} href={g.href} className="card" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", textDecoration: "none", color: "var(--ink)" }}>
            <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 10, background: "var(--chip-bg)", color: "var(--chip-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              <i className={`ti ${g.icon}`} />
            </span>
            <span style={{ flex: 1, minWidth: 240 }}>
              <h2 style={{ fontSize: 20, margin: 0, fontFamily: "var(--font-sans)", fontWeight: 600 }}>{g.title}</h2>
              <span className="muted small">{g.blurb}</span>
            </span>
            <span className="small" style={{ fontWeight: 600, color: "var(--info)", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Read it <i className="ti ti-arrow-right" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </Wrap>
  );
}
