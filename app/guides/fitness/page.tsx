// Fitness & nutrition guide (public). Same contract as every guide: we do not
// invent workout programs or diet plans - we are not medical or fitness
// professionals and the site's standard is claims with official sources. What
// we DO own: the honest framing of post-service fitness, and pointing veterans
// at the military's and VA's own free, evidence-based programs.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";
import GuideCta from "@/components/GuideCta";
import FeedbackAsk from "@/components/FeedbackAsk";

export const metadata = routeMeta(
  "Back in fighting shape",
  "Free, official workout and nutrition resources for veterans - the DoD's own performance programs, the Warfighter Nutrition Guide, and VA's structured weight management - plus an honest plan for restarting after the uniform comes off."
);

const OFFICIAL = [
  { label: "HPRC - Human Performance Resources by CHAMP (DoD)", url: "https://www.hprc-online.org/" },
  { label: "HPRC Warfighter Nutrition Guide", url: "https://www.hprc-online.org/nutrition/warfighter-nutrition-guide" },
  { label: "VA MOVE! Weight Management Program", url: "https://www.move.va.gov/" },
  { label: "VA Adaptive Sports Program", url: "https://www.va.gov/adaptivesports/" },
];

export default function FitnessGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Back in fighting shape: fitness and nutrition after the uniform",
        description: "Free, official workout and nutrition resources for veterans, and an honest framework for restarting.",
        author: { "@type": "Organization", name: "VetPath", url: SITE },
        publisher: { "@type": "Organization", name: "VetPath", url: SITE },
        mainEntityOfPage: `${SITE}/guides/fitness/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "Back in fighting shape", item: `${SITE}/guides/fitness/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · official resources, free</Eyebrow>
      <h1 style={{ maxWidth: 660 }}>Back in fighting shape.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        In the service, fitness came with the job: mandatory PT, a formation to show up for, a
        standard to hit, and a unit doing it beside you. Then the structure disappears overnight -
        and for a lot of veterans the shape goes with it. That is not a character failure; it is
        what happens when the system that carried the habit gets discharged along with you. The
        fix is rebuilding the system - and the military and VA already publish the free,
        evidence-based pieces to build it from.
      </p>

      <section style={{ marginTop: 26 }}>
        <h2>First: the honest start</h2>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Start where you are, not where you left off.</strong> The fastest way to quit
            at week two is training like the year is still the one on your DD-214. Ramp, don&apos;t
            leap.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>If you carry service injuries or a pending claim, talk to your provider
            first</strong> - both for your body and for your record. Every documented visit
            matters later (that is the same records habit from{" "}
            <Link href="/guides/paperwork">the paperwork guide</Link>).
          </li>
          <li>
            <strong>Bring the formation back.</strong> A set time, a set place, and ideally
            another human expecting you - the accountability was always half the program.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>Workouts: train from the military&apos;s own playbook</h2>
        <p style={{ maxWidth: 640 }}>
          The Department of Defense runs a full human-performance resource for exactly this:{" "}
          <a href="https://www.hprc-online.org/" target="_blank" rel="noopener noreferrer">
            HPRC - Human Performance Resources by CHAMP{" "}
            <i className="ti ti-external-link" aria-hidden="true" />
          </a>
          , built by the Consortium for Health and Military Performance at the Uniformed Services
          University. It is free, evidence-based, and written for military bodies - strength and
          conditioning guidance, injury-aware training, sleep and recovery, the whole performance
          stack. If you want workouts that feel like the ones that built you the first time, this
          is the official source, not a paywalled app guessing at it.
        </p>
      </section>

      <GuideCta
        line="Want fitness to sit inside a bigger plan instead of beside it?"
        sub="Your gameplan holds the whole transition - and the habit sticks better when it has a structure around it. Free, about ten minutes."
      />

      <section style={{ marginTop: 26 }}>
        <h2>Nutrition: the Warfighter Nutrition Guide, and structured help</h2>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>The{" "}
            <a href="https://www.hprc-online.org/nutrition/warfighter-nutrition-guide" target="_blank" rel="noopener noreferrer">
              Warfighter Nutrition Guide <i className="ti ti-external-link" aria-hidden="true" />
            </a></strong>{" "}
            - the DoD&apos;s own plain-language nutrition manual: fueling, weight management,
            supplements scrutinized honestly. Free, and written for people who used to eat for
            performance and want to again.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>
            <a href="https://www.move.va.gov/" target="_blank" rel="noopener noreferrer">
              VA MOVE! <i className="ti ti-external-link" aria-hidden="true" />
            </a></strong>{" "}
            - the VA&apos;s structured weight-management program for enrolled veterans: real
            coaching and follow-through, not a pamphlet. If the goal is losing what the couch
            years added, this is the supported way to do it.
          </li>
          <li>
            <strong>
            <a href="https://www.va.gov/adaptivesports/" target="_blank" rel="noopener noreferrer">
              VA Adaptive Sports <i className="ti ti-external-link" aria-hidden="true" />
            </a></strong>{" "}
            - for veterans with disabilities, sport and recreation programs that meet your body
            where it is.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>Making it stick</h2>
        <p style={{ maxWidth: 640 }}>
          Treat PT like formation: same slot on the calendar, non-negotiable, small enough on hard
          weeks that you never zero out. Track something - reps, minutes, a one-line note (your
          VetPath notes work fine for this). And recruit one person: a workout partner, a unit
          buddy on the same mission, a spouse who asks how it went. The service never asked you to
          stay fit alone; do not ask it of yourself now.
        </p>
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

      <FeedbackAsk
        variant="quiet"
        event="feedback-guide"
        line="Something missing here, or wrong for your situation?"
        cta="Tell us what you need"
        sub="- a person reads every note, and it shapes what gets built next."
      />

      <p className="small muted" style={{ marginTop: 22, maxWidth: 640 }}>
        VetPath does not provide medical, fitness, or nutrition advice - the resources above are
        the professionals&apos; work, and your own provider outranks everything on this page.
        Verify program details at the linked official sources. VetPath is a planning and education
        tool, not the VA, and not affiliated with any government agency.
      </p>
    </Wrap>
  );
}
