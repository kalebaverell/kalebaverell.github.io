// SkillBridge as a public, readable guide (content wave 2, Sep 2026). Same
// contract as the other guides: every claim here already exists, cited, in the
// app's own libraries (funding.json, the timeline task library, the FAQ) - this
// page composes them into prose and never introduces a new number or rule.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";

export const metadata = routeMeta(
  "SkillBridge, explained",
  "How DoD SkillBridge works: intern with a civilian employer during your last 180 days of service while keeping full military pay - the window, the command-approval reality, and how to line it up in time."
);

const OFFICIAL = [
  { label: "DoD SkillBridge (official program site)", url: "https://skillbridge.osd.mil/" },
  { label: "DoD TAP", url: "https://www.dodtap.mil/" },
];

export default function SkillBridgeGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "SkillBridge, explained: get hired before you take off the uniform",
        description: "How DoD SkillBridge works - the up-to-180-day window, command approval, finding a program, and how it fits alongside TAP.",
        author: { "@type": "Organization", name: "VetPath", url: SITE },
        publisher: { "@type": "Organization", name: "VetPath", url: SITE },
        mainEntityOfPage: `${SITE}/guides/skillbridge/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "SkillBridge, explained", item: `${SITE}/guides/skillbridge/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · verified against official sources</Eyebrow>
      <h1 style={{ maxWidth: 660 }}>SkillBridge, explained.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        SkillBridge is the closest thing the transition has to a cheat code that is actually in the
        rulebook: train or intern with a civilian employer during your last stretch of service -
        up to 180 days - while keeping your full military pay and benefits. The employer gets to
        evaluate you on real work. You get to walk into separation with a job lined up instead of a
        job search. And because it is a DoD program, the details live on an official site you can
        verify yourself, not in anyone&apos;s sales pitch.
      </p>

      <section style={{ marginTop: 26 }}>
        <h2>The trade, in one paragraph</h2>
        <p style={{ maxWidth: 640 }}>
          During your final months in uniform, instead of working your military job, you work a
          civilian one - an internship, apprenticeship, or fellowship with an approved employer.
          Your paycheck does not change: military pay and benefits continue for the whole
          placement. The goal is blunt and worth saying out loud: <strong>get hired before you
          take off the uniform.</strong> Many placements are designed as extended job interviews,
          and the employer on the other side knows it.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>The window and the clock</h2>
        <p style={{ maxWidth: 640 }}>
          The placement itself can run during your <strong>last 180 days of service</strong>, with
          command approval. But the working part of the timeline starts much earlier than that,
          because slots take lead time to arrange - employers have cohort dates, paperwork has
          layers, and your command needs time to say yes.
        </p>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Around a year out:</strong> start researching programs. This is the same
            stretch where the Transition Assistance Program begins - TAP is required by law, and
            you are supposed to begin it no later than 365 days before separation, so the two
            planning tracks run naturally together.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Well before the 180-day window opens:</strong> raise SkillBridge with your
            command. Approval takes lead time, and asking early is the single highest-leverage
            move in the whole process.
          </li>
          <li>
            <strong>Inside the window:</strong> the placement runs, your pay continues, and your
            job hunt is happening on the clock instead of after it.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>The command-approval reality</h2>
        <p style={{ maxWidth: 640 }}>
          SkillBridge is not an entitlement - it needs your command&apos;s approval, and mission
          comes first. That is exactly why the timing advice above is not a nicety. A request
          raised early, with a specific program and dates attached, is a request your command can
          actually plan around. A request raised at the last minute is a request that is easy to
          deny. Raise it with your command well before the window opens, in writing, with the
          program details in hand.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>Finding a program</h2>
        <p style={{ maxWidth: 640 }}>
          The official program site at{" "}
          <a href="https://skillbridge.osd.mil/" target="_blank" rel="noopener noreferrer">
            skillbridge.osd.mil <i className="ti ti-external-link" aria-hidden="true" />
          </a>{" "}
          is the authoritative place to look - it is where the program itself lists opportunities,
          and it is the version of the truth your command will trust. Placements span industries,
          and structured fellowship programs (Hiring Our Heroes is one example that appears in our
          own career-path library) package the experience for fields like operations and program
          management. Hands-on and technical tracks appear too - our pathfinder&apos;s career data
          flags paths like IT and security operations as commonly SkillBridge-friendly.
        </p>
        <p style={{ maxWidth: 640 }}>
          One honest filter while you browse: the best placement is one aimed at a job you
          actually want, in a place you actually plan to live. A prestigious placement in the
          wrong city or the wrong field spends your one window on someone else&apos;s plan.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>How it fits with everything else</h2>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>TAP still happens.</strong> The Transition Assistance Program is mandatory and
            separate - SkillBridge complements it, it does not replace it.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Your other windows keep running.</strong> Records, claims prep, and enrollment
            deadlines do not pause because you are on a placement - the{" "}
            <Link href="/guides/transition-timeline">full transition timeline</Link> lays out what
            else is live during those months.
          </li>
          <li>
            <strong>It pairs with the education stack.</strong> A placement that ends in a job
            offer can leave your GI Bill untouched for later - the strongest version of the
            benefits stack is the one where each piece funds a different step.
          </li>
        </ul>
      </section>

      <div className="tablewrap" style={{ marginTop: 26 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>The official sources</h3>
          {OFFICIAL.map((s) => (
            <p key={s.url} className="small" style={{ margin: "6px 0" }}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label} <i className="ti ti-external-link" aria-hidden="true" />
              </a>
            </p>
          ))}
        </div>
      </div>

      <div className="card feature" style={{ marginTop: 30, borderLeft: "4px solid var(--accent)" }}>
        <h2 style={{ fontSize: 22 }}>Where does this fit in your months?</h2>
        <p style={{ margin: "6px 0 0", maxWidth: 600 }}>
          A guide tells you how the program works. <Link href="/onboarding">Your gameplan</Link>{" "}
          tells you when to move - it places SkillBridge research and the command conversation on
          your own timeline, next to every other deadline that shares those months. Free, about
          ten minutes.
        </p>
      </div>

      <p className="small muted" style={{ marginTop: 22, maxWidth: 640 }}>
        Program rules, windows, and eligibility change - verify every detail at the official
        source before acting on it. VetPath is a planning and education tool, not the VA, and not
        affiliated with any government agency.
      </p>
    </Wrap>
  );
}
