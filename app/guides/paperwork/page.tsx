// The records/documents guide (content wave 2, Sep 2026). Same contract as the
// other guides: composed entirely from claims the app already makes, cited, in
// lib/timeline.ts, lib/rules.ts, and the FAQ - no new numbers, no new rules.
import Link from "next/link";
import { routeMeta, SITE } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";
import GuideCta from "@/components/GuideCta";

export const metadata = routeMeta(
  "The paperwork that runs your transition",
  "DD-214, service medical records, the Joint Services Transcript, and the records habit - the documents that decide how smooth your military separation goes, and how to handle each one."
);

const OFFICIAL = [
  { label: "milConnect (records access)", url: "https://milconnect.dmdc.osd.mil/" },
  { label: "Joint Services Transcript", url: "https://jst.doded.mil/" },
  { label: "DOL VETS - unemployment for ex-service members (UCX)", url: "https://www.dol.gov/agencies/vets" },
];

export default function PaperworkGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "The paperwork that runs your transition",
        description: "The documents that decide how smooth a military separation goes - DD-214, service medical records, the JST, family records - and how to handle each one.",
        author: { "@type": "Organization", name: "VetPath", url: SITE },
        publisher: { "@type": "Organization", name: "VetPath", url: SITE },
        mainEntityOfPage: `${SITE}/guides/paperwork/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 2, name: "The paperwork", item: `${SITE}/guides/paperwork/` },
        ],
      },
    ],
  };

  return (
    <Wrap narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Eyebrow>Guide · verified against official sources</Eyebrow>
      <h1 style={{ maxWidth: 680 }}>The paperwork that runs your transition.</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Almost every benefit you have earned gets claimed with documents - and almost every
        transition horror story is, underneath, a documents story. A rating that stalls because a
        condition was never written down. A DD-214 error that follows someone for decades. College
        credit left unclaimed because nobody pulled a transcript. This guide covers the handful of
        records that matter most, what goes wrong with each, and the one habit that makes all of
        them easy.
      </p>

      <section style={{ marginTop: 26 }}>
        <h2>The records habit: one folder, starting today</h2>
        <p style={{ maxWidth: 640 }}>
          The single move that outperforms everything else in this guide: <strong>every injury,
          treatment, and training certificate goes into one folder, from today.</strong> Not when
          separation gets close - today, however far out you are. Future-you files claims from
          this folder, applies to schools from this folder, and answers employers from this
          folder. The habit costs minutes; rebuilding records years later can cost a claim.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>Service medical records: document everything, while you are still in</h2>
        <p style={{ maxWidth: 640 }}>
          Every condition you will ever claim needs to be documented while you are still serving -
          which means seeing your provider about the things you have been ignoring, on the record,
          before you get out. When the time comes to file, request your <strong>complete service
          treatment records</strong> and list <strong>every</strong> condition, including the
          secondary ones that ride along quietly: the knee that changed how you walk and took the
          back with it, the tinnitus, the sleep. If it is not documented, the system treats it
          like it did not happen - so make it documented.
        </p>
        <p className="small muted" style={{ maxWidth: 640 }}>
          Records access runs through{" "}
          <a href="https://milconnect.dmdc.osd.mil/" target="_blank" rel="noopener noreferrer">
            milConnect <i className="ti ti-external-link" aria-hidden="true" />
          </a>{" "}
          - worth logging into while your CAC still works.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>The DD-214: read it line by line before you sign</h2>
        <p style={{ maxWidth: 640 }}>
          The DD-214 is the document the civilian world runs on - benefits, hiring preference,
          unemployment claims, home loans all key off it. Two rules:
        </p>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Review it line by line BEFORE signing.</strong> Awards, schools, deployments,
            character of service - errors here follow you for decades, and they are far easier to
            fix while you are still standing in the building than from the outside.
          </li>
          <li>
            <strong>Safeguard it the day you get it.</strong> Along with your full records. It is
            the key that opens nearly every door that comes next - including, if income has not
            landed yet, filing a UCX unemployment claim in the state where you live, DD-214 in
            hand. That program exists for exactly this bridge, and using it is smart, not
            shameful.
          </li>
        </ul>
      </section>

      <GuideCta line="Want the records tasks sequenced into your own months?" />

      <section style={{ marginTop: 26 }}>
        <h2>The Joint Services Transcript: credit you may already have</h2>
        <p style={{ maxWidth: 640 }}>
          If education is anywhere in your plan, pull your{" "}
          <a href="https://jst.doded.mil/" target="_blank" rel="noopener noreferrer">
            Joint Services Transcript <i className="ti ti-external-link" aria-hidden="true" />
          </a>{" "}
          and request a credit review from the schools you are considering. Your military training
          may already be worth college credit - which is time and GI Bill months you do not have
          to spend twice.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>The family&apos;s records move with you too</h2>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Kids&apos; school records:</strong> request them early if a move is coming -
            mid-year school moves are the hardest part of a PCS for kids, and a transferred file
            plus a briefed counselor is most of the soft landing.
          </li>
          <li>
            <strong>Special-needs documentation:</strong> gather the EFMP file while you are still
            serving, plus the current IEP or 504 plan and provider notes - so the next school and
            care team can pick up without a gap.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>What lives in the folder</h2>
        <p className="small muted" style={{ maxWidth: 640, marginBottom: 8 }}>
          The short version of everything above, as a checklist:
        </p>
        <ul style={{ maxWidth: 640, paddingLeft: 20 }}>
          <li>Every medical visit, injury, and treatment record - as they happen</li>
          <li>Every training certificate and school completion</li>
          <li>Complete service treatment records - requested before separation</li>
          <li>DD-214 - reviewed before signing, safeguarded after</li>
          <li>Joint Services Transcript - pulled, and sent for credit review</li>
          <li>Family: school records, EFMP file, current IEP/504, provider notes</li>
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
        <h2 style={{ fontSize: 22 }}>Which documents are on your clock?</h2>
        <p style={{ margin: "6px 0 0", maxWidth: 600 }}>
          A guide lists the documents. <Link href="/onboarding">Your gameplan</Link> puts them in
          order - it builds the records tasks into your own months, next to the deadlines they
          feed. Free, about ten minutes. Prefer to keep reading first? The{" "}
          <Link href="/guides/transition-timeline">full timeline guide</Link> shows where each
          document lands in the sequence.
        </p>
      </div>

      <p className="small muted" style={{ marginTop: 22, maxWidth: 640 }}>
        Processes and access points change - verify every detail at the official source before
        acting on it. VetPath is a planning and education tool, not the VA, and not affiliated
        with any government agency.
      </p>
    </Wrap>
  );
}
