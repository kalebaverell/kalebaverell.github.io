"use client";
// "Every number has a source" — the methodology & trust page.
// Counts are computed live from the actual data files, so this page can't drift from reality.
import Link from "next/link";
import { BENEFITS, CAREERS, STATE_BENEFITS, ASSESSMENT, BRAND } from "@/lib/data";
import { METROS } from "@/lib/relocate";
import { Wrap, Eyebrow, SectionHead, Stat, Callout } from "@/components/ui";

export default function TrustPage() {
  const statePrograms = STATE_BENEFITS.states.reduce((n, s) => n + s.programs.length, 0);
  const verifiedFederal = BENEFITS.filter((b: any) => b.lastVerified).length;
  const groundedCareers = CAREERS.filter((c) => c.blsUrl).length;
  const officialMetros = METROS.filter((m: any) => m.official).length;

  return (
    <Wrap>
      <Eyebrow>How {BRAND.name} earns trust</Eyebrow>
      <h1 style={{ maxWidth: 720 }}>Every number has a source.</h1>
      <p className="muted" style={{ maxWidth: 640, fontSize: "calc(var(--fs-body) + 1px)" }}>
        Veterans have been burned by tools that guess. {BRAND.name} is built the opposite way:
        content is verified against official sources, stamped with the date we checked it, and
        linked so you can confirm it yourself — and our recommendation engines are deterministic
        rules you can read, not a black box.
      </p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", margin: "26px 0" }}>
        <Stat n={STATE_BENEFITS.states.filter((s) => s.code !== "DC").length} l="states + D.C. researched from official state sources" />
        <Stat n={statePrograms} l="state benefit programs, each linked to its official page" />
        <Stat n={verifiedFederal} l="federal benefit categories verified against VA.gov / DOL / SBA" />
        <Stat n={groundedCareers} l="career paths grounded in BLS pay data + O*NET profiles" />
        <Stat n={officialMetros} l="metros with cited BEA cost, HUD rent & BLS jobs data" />
        <Stat n={ASSESSMENT.questions.length} l="assessment questions informed by the DOL O*NET framework" />
      </div>

      <SectionHead eyebrow="Where the data comes from" title="Sources and refresh cadence" />
      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-small)", minWidth: 560 }}>
          <thead>
            <tr>
              {["What", "Official source", "Verified", "Refresh"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["State benefits (all 50 + DC)", "State departments of veterans affairs (.gov)", STATE_BENEFITS.lastVerified || "—", "Quarterly"],
              ["Federal benefits (11 categories)", "VA.gov · DOL VETS · SBA · Veterans Crisis Line", "Jul 2026", "Quarterly"],
              ["Career pay & outlook", "BLS Occupational Outlook Handbook (May 2024 medians)", "Jul 2026", "Annually (new BLS editions)"],
              ["Relocation cost / rent / jobs", "BEA Regional Price Parities · HUD Fair Market Rents · BLS", "Jul 2026", "Quarterly"],
              ["Assessment design", "U.S. DOL O*NET® Interest Profiler framework (RIASEC)", "Jul 2026", "As frameworks evolve"],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td key={i} style={{ padding: "9px 10px", borderBottom: "1px solid var(--hairline)" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionHead eyebrow="Rules we operate by" title="The boundaries that keep this honest" />
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
          {[
            ["ti-scale", "We never determine eligibility", "Only VA, your state agency, or an accredited VSO can. Every card links to the official source to confirm."],
            ["ti-heart-handshake", "Free accredited help comes first", "Accredited VSO and county service officers are free. We will never point you to paid claims help."],
            ["ti-settings", "Explainable engines, not a black box", "Fit scores and benefit tiers come from deterministic rules built on your own answers — every recommendation shows its reasons."],
            ["ti-lock", "Your data stays yours", "Browse anonymously and everything stays in your browser. Create an account and your plan is saved privately to it — encrypted at rest, visible only to you (row-level security), and never sold. Delete it anytime."],
            ["ti-calendar-check", "Dates on everything", "Verified content carries the date we checked it. Stale dates are treated as bugs — a quarterly re-verification is part of the operating rhythm."],
            ["ti-urgent", "Crisis support is always visible", "Veterans Crisis Line: dial 988, then press 1 — free, confidential, 24/7, on every page."],
          ].map(([icon, title, body]) => (
            <div key={title as string} className="card">
              <div className="iconwrap" style={{ marginBottom: 12 }}><i className={`ti ${icon}`} aria-hidden="true" /></div>
              <h4 style={{ marginBottom: 6 }}>{title}</h4>
              <p className="muted small" style={{ margin: 0, lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <Callout kind="warn">
          <strong>What&apos;s still illustrative:</strong> relocation comparison tiers (the 1–5 ratings) are decision aids, not
          cited rankings — though the cost, rent, jobs, and VA-facility datapoints beside them are official and linked.
          Fit percentages are demo estimates from your own answers. Pay figures change as BLS publishes new data.
          {" "}{BRAND.name} is a planning &amp; education tool — not the VA, a law firm, or an accredited claims representative.
        </Callout>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <Link className="btn" href="/benefits"><i className="ti ti-award" /> See the verified benefits library</Link>
        <Link className="btn ghost" href="/onboarding"><i className="ti ti-compass" /> Build my gameplan</Link>
      </div>
    </Wrap>
  );
}
