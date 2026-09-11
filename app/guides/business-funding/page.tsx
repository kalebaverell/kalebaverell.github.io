// Business funding guide (public). The honest page for the most scam-infested
// search in the veteran space: "grants for veteran/women business owners."
// Same contract as every guide: official sources only, no invented programs,
// and the truth stated plainly - certifications usually outrank grants.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";
import GuideCta from "@/components/GuideCta";
import FeedbackAsk from "@/components/FeedbackAsk";

export const metadata = routeMeta(
  "Funding a veteran-owned business",
  "The straight story on money for veteran entrepreneurs - why certifications like VetCert and WOSB usually beat grants, the free SBA help worth taking, what women veterans specifically qualify for, and where real federal grants actually live."
);

const OFFICIAL = [
  { label: "SBA VetCert (VOSB / SDVOSB certification)", url: "https://veterans.certify.sba.gov/" },
  { label: "SBA - Women-Owned Small Business program (WOSB / EDWOSB)", url: "https://www.sba.gov/federal-contracting/contracting-assistance-programs/women-owned-small-business-federal-contract-program" },
  { label: "SBA - Veteran-owned businesses (OVBD, VBOCs)", url: "https://www.sba.gov/business-guide/grow-your-business/veteran-owned-businesses" },
  { label: "SBA - Boots to Business", url: "https://www.sba.gov/sba-learning-platform/boots-business" },
  { label: "SBA - Women's Business Centers", url: "https://www.sba.gov/local-assistance/resource-partners/womens-business-centers" },
  { label: "IVMF - V-WISE (women veterans & spouses)", url: "https://ivmf.syracuse.edu/programs/entrepreneurship/start-up/v-wise/" },
  { label: "Grants.gov (the official federal grant database)", url: "https://www.grants.gov/" },
];

export default function BusinessFundingGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Funding a veteran-owned business: certifications, free help, and the truth about grants",
        description: "How veteran and women-veteran entrepreneurs actually get funded - certifications, SBA programs, and where real federal grants live.",
        author: { "@type": "Organization", name: "VetPath", url: SITE },
        publisher: { "@type": "Organization", name: "VetPath", url: SITE },
        mainEntityOfPage: `${SITE}/guides/business-funding/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "Funding a veteran-owned business", item: `${SITE}/guides/business-funding/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · verified against official sources</Eyebrow>
      <h1 style={{ maxWidth: 680 }}>Funding a veteran-owned business, minus the noise.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Search &ldquo;grants for veteran business owners&rdquo; and you will drown in paid lists,
        lead-generation sites, and offers to sell you what is free. Here is the version with
        sources: true grants are rare and competitive, the federal money mostly flows through
        <strong> certifications and contracts</strong>, and the best help at the start costs
        nothing. Every program below links to the official page that runs it.
      </p>

      <section style={{ marginTop: 26 }}>
        <h2>Start with the truth about grants</h2>
        <p style={{ maxWidth: 640 }}>
          There is no general federal &ldquo;grant for starting a business&rdquo; - for veterans,
          for women, or for anyone. What exists: narrow federal grants for specific industries and
          research (all listed, free, at{" "}
          <a href="https://www.grants.gov/" target="_blank" rel="noopener noreferrer">
            Grants.gov <i className="ti ti-external-link" aria-hidden="true" />
          </a>
          ), occasional state and private programs, and a hard rule worth tattooing:{" "}
          <strong>never pay anyone for a grant list or an application service.</strong> The real
          list is public. Anyone charging for it is selling you the phone book.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>The move that outranks grants: get certified</h2>
        <p style={{ maxWidth: 640 }}>
          The federal government sets aside contract dollars specifically for certified
          veteran-owned and women-owned small businesses - recurring revenue, not one-time checks.
        </p>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>VetCert (VOSB / SDVOSB)</strong> - the SBA&apos;s free certification for
            businesses at least 51% veteran-owned and controlled; service-disabled adds the SDVOSB
            tier with its own set-asides.{" "}
            <a href="https://veterans.certify.sba.gov/" target="_blank" rel="noopener noreferrer">
              Apply at SBA VetCert <i className="ti ti-external-link" aria-hidden="true" />
            </a>
          </li>
          <li>
            <strong>WOSB / EDWOSB</strong> - the parallel certification for businesses at least
            51% women-owned, opening women-owned set-asides in eligible industries.{" "}
            <a href="https://www.sba.gov/federal-contracting/contracting-assistance-programs/women-owned-small-business-federal-contract-program" target="_blank" rel="noopener noreferrer">
              SBA WOSB program <i className="ti ti-external-link" aria-hidden="true" />
            </a>{" "}
            And the part almost nobody tells women veterans: <strong>these stack.</strong> A
            woman-veteran-owned business can hold VetCert and WOSB at once and compete in both
            set-aside lanes.
          </li>
        </ul>
      </section>

      <GuideCta
        line="Business the goal? Your gameplan builds the funding stack around it."
        sub="Tell the plan you're building a business and it lines up certifications, free counseling, and the training track in order - free, about ten minutes."
      />

      <section style={{ marginTop: 26 }}>
        <h2>The free help worth taking before you spend a dollar</h2>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Boots to Business</strong> - the SBA&apos;s free entrepreneurship course inside
            TAP, with a Reboot version for veterans already out.{" "}
            <a href="https://www.sba.gov/sba-learning-platform/boots-business" target="_blank" rel="noopener noreferrer">
              SBA <i className="ti ti-external-link" aria-hidden="true" />
            </a>
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Veteran business counseling (OVBD &amp; VBOCs)</strong> - free one-on-one
            advising through the SBA&apos;s veteran business network, idea stage to expansion.{" "}
            <a href="https://www.sba.gov/business-guide/grow-your-business/veteran-owned-businesses" target="_blank" rel="noopener noreferrer">
              SBA veteran-owned businesses <i className="ti ti-external-link" aria-hidden="true" />
            </a>
          </li>
          <li>
            <strong>SBA-backed loans</strong> - not grants, but the SBA&apos;s guarantee programs
            are how most small businesses actually get capital; the same counselors above will
            walk you to the right one honestly.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>For women veterans specifically</h2>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>V-WISE (IVMF)</strong> - an entrepreneurship training program built for women
            veterans, active-duty women, and women military spouses: online phase, in-person
            residency, ongoing support.{" "}
            <a href="https://ivmf.syracuse.edu/programs/entrepreneurship/start-up/v-wise/" target="_blank" rel="noopener noreferrer">
              IVMF V-WISE <i className="ti ti-external-link" aria-hidden="true" />
            </a>
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Women&apos;s Business Centers</strong> - 100+ SBA-backed centers offering
            training, counseling, and access-to-capital help.{" "}
            <a href="https://www.sba.gov/local-assistance/resource-partners/womens-business-centers" target="_blank" rel="noopener noreferrer">
              Find a center <i className="ti ti-external-link" aria-hidden="true" />
            </a>
          </li>
          <li>
            <strong>The double certification</strong> - VetCert plus WOSB/EDWOSB, covered above:
            hold both lanes, because you earned both.
          </li>
        </ul>
        <p className="small muted" style={{ maxWidth: 640 }}>
          Inside VetPath, answering the optional demographics question is what lets the plan and
          the network page surface these automatically - it is used for exactly this and nothing
          else.
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
        Program rules, eligibility, and set-aside criteria change - verify every detail at the
        linked official source before acting on it, and treat nothing here as legal or financial
        advice. VetPath is a planning and education tool, not the VA or SBA, and not affiliated
        with any government agency.
      </p>
    </Wrap>
  );
}
