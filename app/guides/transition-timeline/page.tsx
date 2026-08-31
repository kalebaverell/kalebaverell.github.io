// The transition timeline as a public, readable guide - the site's deepest
// content, ungated. This is the GUIDE, not the tool: the interactive version
// (personal dates, catch-up lists, calendar export) still lives behind the
// gameplan funnel at /timeline. Every task here is rendered from the same
// library the tool uses, so the two can never drift apart.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { PHASE_META, PHASE_INTROS, LONG_RUNWAY_TASKS, fullTaskLibrary, TIMELINE_VERIFIED } from "@/lib/timeline";
import { Wrap, Eyebrow } from "@/components/ui";

export const metadata = routeMeta(
  "Military transition timeline",
  "The month-by-month military separation timeline - TAP, BDD claims, VGLI deadlines, GI Bill steps - from two years out to two years after, every task linked to its official source."
);

const AREA_LABEL: Record<string, string> = {
  benefits: "VA benefits & healthcare",
  employment: "Civilian employment",
  education: "Education & certifications",
  financial: "Financial planning",
  family: "Family & relocation",
  wellbeing: "Mental health & identity",
};

export default function TimelineGuide() {
  const tasks = fullTaskLibrary();
  const byPhase = (id: string) => tasks.filter((t) => t.phase === id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Military transition timeline: two years out to two years after",
        description: "A phase-by-phase military separation timeline with every deadline linked to its official source.",
        dateModified: TIMELINE_VERIFIED,
        author: { "@type": "Organization", name: "VetPath", url: SITE },
        publisher: { "@type": "Organization", name: "VetPath", url: SITE },
        mainEntityOfPage: `${SITE}/guides/transition-timeline/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "Transition timeline", item: `${SITE}/guides/transition-timeline/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · verified against official sources</Eyebrow>
      <h1 style={{ maxWidth: 680 }}>The military transition timeline, laid out straight.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Leaving the service is a sequence, not an event - and most of the expensive mistakes are
        timing mistakes: windows that open a year out, close 90 days before separation, or expire
        quietly a few months after. This guide maps the whole run, from your last year in uniform
        through your first two years out. Every deadline links to the official page that governs it,
        because you should never have to take our word for anything.
      </p>
      <p className="small muted">
        Deadline details last checked against their linked sources{" "}
        {(() => { const d = new Date(TIMELINE_VERIFIED + "T12:00:00"); return isNaN(d.getTime()) ? `on ${TIMELINE_VERIFIED}` : `in ${d.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`; })()}. Want this
        mapped to <em>your</em> dates, with a catch-up list for anything already behind you?{" "}
        <Link href="/timeline">The timeline tool</Link> builds it in about four minutes.
      </p>

      <nav aria-label="Phases" style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "18px 0 6px" }}>
        <a className="chip" href="#long-runway">2+ years out</a>
        {PHASE_META.map((p) => (
          <a key={p.id} className="chip" href={`#${p.id}`}>{p.label}</a>
        ))}
      </nav>

      <section id="long-runway" style={{ marginTop: 26 }}>
        <h2>More than two years out? Start here.</h2>
        <p className="muted">
          The formal timeline begins about a year before separation - but the highest-leverage moves
          only exist while you are still serving, and they compound with time.
        </p>
        <div className="card">
          {LONG_RUNWAY_TASKS.map((t) => (
            <GuideTask key={t.id} t={t} />
          ))}
        </div>
      </section>

      {PHASE_META.map((p) => {
        const items = byPhase(p.id);
        return (
          <section key={p.id} id={p.id} style={{ marginTop: 30 }}>
            <h2 style={{ marginBottom: 2 }}>{p.label}</h2>
            <p className="small" style={{ color: "var(--accent-ink)", fontWeight: 600, margin: "0 0 6px" }}>{p.window}</p>
            <p className="muted" style={{ maxWidth: 640 }}>{PHASE_INTROS[p.id]}</p>
            <div className="card">
              {items.map((t) => (
                <GuideTask key={t.id} t={t} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="card feature" style={{ marginTop: 30, borderLeft: "4px solid var(--accent)" }}>
        <h2 style={{ fontSize: 22 }}>This guide is the map. The tool is your route.</h2>
        <p style={{ margin: "6px 0 0", maxWidth: 600 }}>
          Not every task above applies to every member - filing a claim, moving a family, and
          starting a business each pull in their own steps. Give the{" "}
          <Link href="/timeline">timeline tool</Link> your separation date and situation and it keeps
          only what fits, flags what is already urgent, and puts real calendar dates on every phase.
          Or start from the beginning and <Link href="/onboarding">build your full gameplan</Link> -
          free, about ten minutes.
        </p>
      </div>

      <p className="small muted" style={{ marginTop: 22, maxWidth: 640 }}>
        This timeline is a planning aid, not a substitute for professional guidance. Confirm
        disability claims with an accredited VSO or representative, financial commitments with a
        licensed financial advisor, legal questions with a legal assistance office, and medical
        matters with your provider. VetPath is a planning and education tool - not the VA, and not
        affiliated with the government.
      </p>
    </Wrap>
  );
}

function GuideTask({ t }: { t: { title: string; notes: string; area: string; essential?: boolean; deadline?: boolean; source?: { label: string; url: string } } }) {
  return (
    <div style={{ padding: "13px 0", borderBottom: "1px solid var(--hairline)" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
        <strong style={{ color: "var(--ink-strong)" }}>{t.title}</strong>
        {t.deadline && <span className="pill gold">deadline</span>}
        {t.essential && !t.deadline && <span className="pill low">don&apos;t skip</span>}
        <span className="small muted">{AREA_LABEL[t.area] || t.area}</span>
      </div>
      <p className="small" style={{ margin: "4px 0 0", maxWidth: 640 }}>
        {t.notes}{" "}
        {t.source && (
          <a href={t.source.url} target="_blank" rel="noopener noreferrer">
            {t.source.label} <i className="ti ti-external-link" aria-hidden="true" />
          </a>
        )}
      </p>
    </div>
  );
}
