// Transition questions, answered straight - each answer is the same verified
// claim the tools already make, with the same official source. No new numbers
// are introduced on this page; if a rule is not in the linked source, we do
// not state it.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";

export const metadata = routeMeta(
  "Veteran transition questions, answered",
  "Straight answers to the questions transitioning service members actually ask - BDD timing, TAP requirements, the VGLI window, GI Bill transfer rules - each linked to its official source."
);

const FAQS: { q: string; a: string; source?: { label: string; url: string } }[] = [
  {
    q: "Is TAP actually mandatory?",
    a: "Yes - the Transition Assistance Program is required by law, and you are supposed to begin no later than 365 days before separation. Pick the track that matches your goal: employment, education, or entrepreneurship.",
    source: { label: "DoD TAP", url: "https://www.dodtap.mil/" },
  },
  {
    q: "When can I file a disability claim before separation?",
    a: "The Benefits Delivery at Discharge (BDD) window runs from 180 to 90 days before separation. File inside it and your exams happen while you are still in, so a decision can land shortly after you are out.",
    source: { label: "VA - pre-discharge (BDD) claims", url: "https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/" },
  },
  {
    q: "What if I'm already inside 90 days - did I miss my chance?",
    a: "No. The BDD window is closed, but an Intent to File preserves your claim's effective date for a year while you build the claim properly. File it, then get free help from an accredited VSO.",
    source: { label: "VA - Intent to File", url: "https://www.va.gov/resources/your-intent-to-file-a-va-claim/" },
  },
  {
    q: "Can I transfer my GI Bill to my spouse or kids after I get out?",
    a: "No - the Post-9/11 GI Bill transfer can only be elected while you are still serving, and it adds a service commitment. If a transfer is even a possibility, have the conversation early, while every option is still open.",
    source: { label: "VA - transfer Post-9/11 GI Bill benefits", url: "https://www.va.gov/education/transfer-post-9-11-gi-bill-benefits/" },
  },
  {
    q: "What is SkillBridge and when do I ask?",
    a: "SkillBridge lets you intern with a civilian employer during your last 180 days while staying on military pay. It needs command approval and slots take lead time, so raise it with your command well before the window opens.",
    source: { label: "DoD SkillBridge", url: "https://skillbridge.osd.mil/" },
  },
  {
    q: "What happens to my SGLI life insurance when I separate?",
    a: "It does not follow you automatically. You can convert to VGLI - apply within 240 days of separation and no health questions are asked. The absolute deadline is 1 year and 120 days, but the 240-day mark is the one that matters.",
    source: { label: "VA - VGLI", url: "https://www.va.gov/life-insurance/options-eligibility/vgli/" },
  },
  {
    q: "Can I file for unemployment after I separate?",
    a: "Yes - ex-service members can file for unemployment compensation (UCX) in the state where they live, with the DD-214 in hand. It exists for exactly this bridge, and using it is smart, not shameful.",
    source: { label: "DOL VETS", url: "https://www.dol.gov/agencies/vets" },
  },
  {
    q: "Do I need a disability rating before applying for VA health care?",
    a: "No - enrollment is separate from claims, so apply without waiting on a rating. Recent-era combat veterans and several other groups have enhanced eligibility windows, so check yours and get in the system.",
    source: { label: "VA - apply for health care", url: "https://www.va.gov/health-care/how-to-apply/" },
  },
  {
    q: "Should I pay someone to file my disability claim?",
    a: "You should never pay a percentage of your benefits to anyone. Accredited Veteran Service Organizations help with claims and benefits at no cost - their help is free, always.",
    source: { label: "VA - accredited representatives", url: "https://www.va.gov/get-help-from-accredited-representative/" },
  },
  {
    q: "Do state benefits stack on top of federal ones?",
    a: "Yes - states run their own programs on top of the federal stack, and they vary a lot: property tax exemptions, tuition programs like Texas's Hazlewood Act, hiring preference, and more. They are also the benefits veterans most often never hear about.",
  },
  {
    q: "Why does everyone say to check the DD-214 so carefully?",
    a: "Because errors on it follow you for decades - awards, schools, deployments, character of service all feed later eligibility. Review it line by line before signing, while you are still standing in the building where it can be fixed.",
  },
  {
    q: "What covers my family's health care right after separation?",
    a: "Some separations qualify for 180 days of transitional TRICARE coverage under TAMP. Confirm whether yours does and line up what follows it, so the household never has a coverage gap.",
    source: { label: "TRICARE - TAMP", url: "https://www.tricare.mil/tamp" },
  },
  {
    q: "When should transition planning actually start?",
    a: "The formal timeline begins about a year out, but the highest-leverage moves exist earlier: the GI Bill transfer decision, Tuition Assistance while you serve, and building the records habit that future claims are filed from.",
  },
  {
    q: "Is VetPath part of the VA or the government?",
    a: "No. VetPath is a free planning and education tool - not the VA, not a claims service, and not affiliated with any government agency. We never confirm eligibility; every claim on this site links to the official source so you can verify it yourself, and we never sell your data.",
  },
];

export default function FaqGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "Questions answered", item: `${SITE}/guides/faq/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · every answer linked to its source</Eyebrow>
      <h1 style={{ maxWidth: 640 }}>Transition questions, answered straight.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        The questions below come up over and over - and the honest answers are usually shorter than
        the runaround. Where a rule has an official page, it is linked, because the source is the
        only version that counts.
      </p>

      {FAQS.map((f) => (
        <div key={f.q} className="card" style={{ marginTop: 14 }}>
          <h2 style={{ fontSize: 19, fontFamily: "var(--font-sans)", fontWeight: 600 }}>{f.q}</h2>
          <p className="small" style={{ margin: "6px 0 0", maxWidth: 640 }}>
            {f.a}{" "}
            {f.source && (
              <a href={f.source.url} target="_blank" rel="noopener noreferrer">
                {f.source.label} <i className="ti ti-external-link" aria-hidden="true" />
              </a>
            )}
          </p>
        </div>
      ))}

      <div className="card feature" style={{ marginTop: 26, borderLeft: "4px solid var(--accent)" }}>
        <h2 style={{ fontSize: 22 }}>The next question is &ldquo;which of these apply to me?&rdquo;</h2>
        <p style={{ margin: "6px 0 0", maxWidth: 600 }}>
          That one takes your answers, not ours. <Link href="/onboarding">Build your gameplan</Link>{" "}
          - about ten minutes, free - or read the{" "}
          <Link href="/guides/transition-timeline">full transition timeline</Link> and the{" "}
          <Link href="/guides/state-benefits">state benefits directory</Link> first.
        </p>
      </div>

      <p className="small muted" style={{ marginTop: 22, maxWidth: 640 }}>
        Educational content, not legal, medical, or financial advice - rules change, so verify at the
        linked official sources before acting.
      </p>
    </Wrap>
  );
}
