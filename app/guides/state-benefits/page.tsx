// Every state's veteran benefit programs on one deep page - a directory, not
// 51 thin doorway pages. Rendered straight from the same verified data file
// the app's benefits library uses, so it can never drift from the tool.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { STATE_BENEFITS } from "@/lib/data";
import { Wrap, Eyebrow } from "@/components/ui";

export const metadata = routeMeta(
  "State veteran benefits, every state",
  "Every state's veteran benefit programs in one directory - property tax exemptions, tuition programs, employment preference and more - each linked to the official state agency that runs it."
);

/** "2026-07-08" -> "in July 2026" - stays correct after each quarterly refresh. */
function fmtMonth(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return isNaN(d.getTime()) ? `on ${iso}` : `in ${d.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

const CATEGORY_LABEL: Record<string, string> = {
  education: "Education",
  tax: "Tax",
  housing: "Housing",
  employment: "Employment",
  health: "Health",
  business: "Business",
  recreation: "Recreation",
  other: "Other",
};

export default function StateBenefitsGuide() {
  const states = STATE_BENEFITS.states;
  const programCount = states.reduce((n: number, s: any) => n + s.programs.length, 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "State veteran benefits: every state's programs in one place",
        description: `${programCount} state veteran benefit programs across all 50 states and D.C., each linked to the official agency that runs it.`,
        dateModified: STATE_BENEFITS.lastVerified,
        author: { "@type": "Organization", name: "VetPath", url: SITE },
        publisher: { "@type": "Organization", name: "VetPath", url: SITE },
        mainEntityOfPage: `${SITE}/guides/state-benefits/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "State veteran benefits", item: `${SITE}/guides/state-benefits/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · {programCount} programs · verified against official state sources</Eyebrow>
      <h1 style={{ maxWidth: 680 }}>State veteran benefits, state by state.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Federal benefits follow you anywhere. State benefits do not - and they are the ones most
        veterans never hear about: property tax exemptions, free tuition programs, hiring
        preference, license plates that waive fees, land deals. Where you live (or where you are
        willing to move) can be worth thousands a year. This directory covers all 50 states and
        D.C., and every program links to the official state page that runs it, because eligibility
        details change and the source is the only version that counts.
      </p>
      <p className="small muted">
        Last verified against each state&apos;s official pages {fmtMonth(STATE_BENEFITS.lastVerified || "")} - re-verified quarterly.
        Want the programs that apply to <em>you</em>, ranked into a plan?{" "}
        <Link href="/onboarding">Build your gameplan</Link> - free, about ten minutes.
      </p>

      <nav aria-label="Jump to state" style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "18px 0 8px" }}>
        {states.map((s: any) => (
          <a key={s.code} className="chip" href={`#${s.code}`} style={{ fontSize: 12.5, padding: "4px 10px" }}>{s.code}</a>
        ))}
      </nav>

      {states.map((s: any) => (
        <section key={s.code} id={s.code} style={{ marginTop: 26 }}>
          <h2 style={{ marginBottom: 2 }}>{s.name}</h2>
          <p className="small" style={{ margin: "0 0 8px" }}>
            Run by{" "}
            <a href={s.agency.url} target="_blank" rel="noopener noreferrer">
              {s.agency.name} <i className="ti ti-external-link" aria-hidden="true" />
            </a>
          </p>
          {s.notes && <p className="muted small" style={{ maxWidth: 640, margin: "0 0 10px" }}>{s.notes}</p>}
          <div className="card">
            {s.programs.map((p: any) => (
              <div key={p.name} style={{ padding: "12px 0", borderBottom: "1px solid var(--hairline)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong style={{ color: "var(--ink-strong)" }}>{p.name}</strong>
                  <span className="tag">{CATEGORY_LABEL[p.category] || p.category}</span>
                </div>
                <p className="small" style={{ margin: "4px 0 0", maxWidth: 640 }}>
                  {p.blurb}{" "}
                  <a href={p.source} target="_blank" rel="noopener noreferrer">
                    Official source <i className="ti ti-external-link" aria-hidden="true" />
                  </a>
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="card feature" style={{ marginTop: 30, borderLeft: "4px solid var(--accent)" }}>
        <h2 style={{ fontSize: 22 }}>Which of these are yours?</h2>
        <p style={{ margin: "6px 0 0", maxWidth: 600 }}>
          A directory tells you what exists. <Link href="/onboarding">Your gameplan</Link> tells you
          what applies - it matches your state, status, and goals against these programs and the
          federal stack, then puts them in order. Free, and every claim stays linked to its source.
        </p>
      </div>

      <p className="small muted" style={{ marginTop: 22, maxWidth: 640 }}>
        VetPath never confirms eligibility - program rules and amounts change, so verify every
        benefit at the linked official source before acting on it. VetPath is a planning and
        education tool, not the VA, and not affiliated with any government agency.
      </p>
    </Wrap>
  );
}
