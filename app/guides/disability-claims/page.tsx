// Disability claims guide (public). The heaviest search topic in the veteran
// space and the one with the most predators circling it. Same contract as
// every guide: official sources only, nothing invented, and the money truth
// stated plainly - the claim is free to file and the best help is free too.
// VetPath's red line applies here hardest: we never sell claims help and
// never take referral fees from anyone who does.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";
import GuideCta from "@/components/GuideCta";
import FeedbackAsk from "@/components/FeedbackAsk";

export const metadata = routeMeta(
  "The VA disability claim, start to finish",
  "How to file your VA disability claim the right way - the intent-to-file move that protects your effective date, the BDD window while you're still in uniform, the accredited help that costs nothing, and how to spot the sharks who charge for what is free."
);

const OFFICIAL = [
  { label: "VA - How to file a disability claim", url: "https://www.va.gov/disability/how-to-file-claim/" },
  { label: "VA - Your intent to file (VA Form 21-0966)", url: "https://www.va.gov/resources/your-intent-to-file-a-va-claim/" },
  { label: "VA - Pre-discharge claims (BDD)", url: "https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/" },
  { label: "VA - Get help from an accredited representative or VSO", url: "https://www.va.gov/get-help-from-accredited-representative/" },
  { label: "VA - Find an accredited representative (official search)", url: "https://www.va.gov/get-help-from-accredited-representative/find-rep/" },
  { label: "VA - The claim exam (C&P)", url: "https://www.va.gov/resources/va-claim-exam/" },
  { label: "VA - Decision reviews and appeals", url: "https://www.va.gov/decision-reviews/" },
  { label: "VSAFE - the official fraud-protection site for veterans & families", url: "https://vsafe.gov/" },
];

export default function DisabilityClaimsGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "The VA disability claim, start to finish: effective dates, BDD, accredited help, and the sharks",
        description: "How veterans actually file a strong VA disability claim - intent to file, the BDD window, free accredited representation, the C&P exam, and decision reviews.",
        author: { "@type": "Organization", name: "VetPath", url: SITE },
        publisher: { "@type": "Organization", name: "VetPath", url: SITE },
        mainEntityOfPage: `${SITE}/guides/disability-claims/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "The VA disability claim", item: `${SITE}/guides/disability-claims/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · verified against official sources</Eyebrow>
      <h1 style={{ maxWidth: 680 }}>The VA disability claim, minus the sharks.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Two things are true about the disability claim, and a whole industry hopes you never
        learn either one. Filing is <strong>free</strong>. And the help most worth having is{" "}
        <strong>free too</strong> - accredited, regulated, and searchable on VA&apos;s own site.
        Here is the whole route, each step linked to the official page that governs it.
      </p>

      <section style={{ marginTop: 26 }}>
        <h2>Move one: protect your date before anything else</h2>
        <p style={{ maxWidth: 640 }}>
          The single most expensive mistake in this process is a late start date. An{" "}
          <strong>intent to file</strong> sets a potential effective date for your benefits -
          if your claim is approved, back pay can reach to the date VA processed your intent,
          not the day you finally finished the paperwork. Once you notify VA, you have{" "}
          <strong>one year</strong> to complete and file the claim. Starting the disability
          application online notifies VA automatically; you can also call or mail{" "}
          <strong>VA Form 21-0966</strong>.{" "}
          <a href="https://www.va.gov/resources/your-intent-to-file-a-va-claim/" target="_blank" rel="noopener noreferrer">
            How intent to file works <i className="ti ti-external-link" aria-hidden="true" />
          </a>
        </p>
        <p style={{ maxWidth: 640 }}>
          Then build the evidence file: service medical records, the conditions list, and the
          paper trail that proves what happened and when. Our{" "}
          <Link href="/guides/paperwork">paperwork guide</Link> covers the one-folder habit
          that makes this painless.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>Still in uniform? The BDD window is the fast lane</h2>
        <p style={{ maxWidth: 640 }}>
          <strong>Benefits Delivery at Discharge</strong> lets you file your claim{" "}
          <strong>180 to 90 days before separation</strong>, while your records are complete,
          your providers are on base, and the exam can happen before you out-process. File
          inside that window and a decision can land close to your first civilian day instead
          of months after it. Miss it, and you file the standard way after separation - still
          fine, just slower.{" "}
          <a href="https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/" target="_blank" rel="noopener noreferrer">
            The pre-discharge claim <i className="ti ti-external-link" aria-hidden="true" />
          </a>
        </p>
      </section>

      <GuideCta
        line="BDD is a window, not a suggestion - and it's on your calendar already."
        sub="Build your gameplan and the claim window lands on your own timeline, next to every other deadline your dates create - free, about ten minutes."
      />

      <section style={{ marginTop: 26 }}>
        <h2>The only help worth having is accredited</h2>
        <p style={{ maxWidth: 640 }}>
          Three kinds of people can responsibly represent you on a VA claim: accredited{" "}
          <strong>VSO representatives</strong> (DAV, VFW, American Legion, your county veteran
          service officer, and others), accredited <strong>attorneys</strong>, and accredited{" "}
          <strong>claims agents</strong>. In VA&apos;s own words, the services an accredited VSO
          representative provides on your benefit claims are <strong>always free</strong>.
          Attorneys and claims agents can charge fees, and the law regulates when and how much.{" "}
          <a href="https://www.va.gov/get-help-from-accredited-representative/" target="_blank" rel="noopener noreferrer">
            How representation works <i className="ti ti-external-link" aria-hidden="true" />
          </a>
        </p>
        <p style={{ maxWidth: 640 }}>
          The rule that beats every sales pitch: <strong>look them up before you sign
          anything.</strong> VA runs the official accreditation search - if the person or
          company pitching you is not in it, walk away. And if anyone offers to
          &ldquo;maximize your rating&rdquo; for a percentage of your back pay, that
          percentage is your money, for a claim you could file free with an accredited rep
          beside you. <strong>VSAFE.gov</strong> is the government&apos;s official
          fraud-protection site for veterans and families - when a pitch feels off, check it
          there and report it there.{" "}
          <a href="https://www.va.gov/get-help-from-accredited-representative/find-rep/" target="_blank" rel="noopener noreferrer">
            Search the accreditation list <i className="ti ti-external-link" aria-hidden="true" />
          </a>
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>The claim exam: this is not the day to tough it out</h2>
        <p style={{ maxWidth: 640 }}>
          After you file, VA may schedule a claim exam (the C&amp;P exam) to help rate your
          conditions. Go to it, and answer like the record depends on it, because it does.
          Describe your <em>worst</em> days, not your best ones - the examiner is documenting
          how conditions actually affect your life, and twenty years of &ldquo;I&apos;m
          fine&rdquo; is the one habit that hurts you in that room. Honest and complete is the
          whole assignment.{" "}
          <a href="https://www.va.gov/resources/va-claim-exam/" target="_blank" rel="noopener noreferrer">
            What happens at the exam <i className="ti ti-external-link" aria-hidden="true" />
          </a>
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>If the decision comes back wrong</h2>
        <p style={{ maxWidth: 640 }}>
          A denial or a low rating is not the end of the road. VA gives you three decision
          review options - adding new evidence with a <strong>Supplemental Claim</strong>,
          asking a senior reviewer to take a fresh look with a{" "}
          <strong>Higher-Level Review</strong>, or appealing to the{" "}
          <strong>Board of Veterans&apos; Appeals</strong>. This later stage is where accredited
          attorneys and claims agents typically earn their fees - and where free accredited VSO
          help still exists too.{" "}
          <a href="https://www.va.gov/decision-reviews/" target="_blank" rel="noopener noreferrer">
            The three review options <i className="ti ti-external-link" aria-hidden="true" />
          </a>
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
        Claim rules, forms, and timelines change - verify every detail at the linked official
        source before acting on it, and treat nothing here as legal advice. VetPath is a
        planning and education tool, not the VA, and not affiliated with any government
        agency. We never sell claims help and never take referral fees from anyone who does.
      </p>
    </Wrap>
  );
}
