// The public verification record (Oct 2026). It makes "verified" clickable:
// every count here is computed at build time from the same data files the app
// runs on (lib/verification.ts), and the history of checks, corrections and
// open items comes from data/verificationLog.json, where each entry cites the
// repo report or commit behind it. Server component on purpose - the link
// counting runs once at build and only HTML ships. Ungated in FunnelGate for
// the same reason /trust is.
import Link from "next/link";
import type { CSSProperties } from "react";
import { routeMeta } from "@/lib/metadata";
import { STATE_BENEFITS, BENEFITS, CAREERS } from "@/lib/data";
import { METROS } from "@/lib/relocate";
import { Wrap, Eyebrow, SectionHead, Stat } from "@/components/ui";
import ReportErrorLink from "@/components/ReportErrorLink";
import { VERIFICATION_LOG, datasetFacts, sourceTotals, fmtVerified, datasetLabel } from "@/lib/verification";

export const metadata = routeMeta(
  "Verification record",
  "When each VetPath dataset was last checked against its official source, how we check, and every error we found and fixed - computed from the same data the site runs on."
);

const GRID: CSSProperties = { display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" };
const TH: CSSProperties = { textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)" };
const TD: CSSProperties = { padding: "9px 10px", borderBottom: "1px solid var(--hairline)", verticalAlign: "top" };
const ROW: CSSProperties = { padding: "12px 0", borderBottom: "1px solid var(--hairline)" };
const ROW_HEAD: CSSProperties = { display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" };
const NAME: CSSProperties = { color: "var(--ink-strong)" };

const newestFirst = (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date);

export default function VerificationPage() {
  const sets = datasetFacts();
  const total = sourceTotals(sets);
  const states = STATE_BENEFITS.states.filter((s) => s.code !== "DC").length;
  const programs = STATE_BENEFITS.states.reduce((n, s) => n + s.programs.length, 0);
  const metros = METROS.filter((m: any) => m.official).length;
  const runs = [...VERIFICATION_LOG.runs].sort(newestFirst);
  const corrections = [...VERIFICATION_LOG.corrections].sort(newestFirst);
  const open = VERIFICATION_LOG.open;

  return (
    <Wrap>
      <Eyebrow>Verification record</Eyebrow>
      <h1 style={{ maxWidth: 720 }}>What we checked, when, and what we fixed.</h1>
      <p className="muted" style={{ maxWidth: 640, fontSize: "calc(var(--fs-body) + 1px)" }}>
        &quot;Verified&quot; should be something you can check. This is the record behind every date on
        VetPath: when each set of data was last checked against its official source, how we check it,
        every mistake we found and fixed, and what is still open. The numbers on this page are counted
        from the same data files the site runs on, so they cannot drift from what you see.
      </p>

      <div style={{ ...GRID, margin: "26px 0" }}>
        <Stat n={total.urls} l="unique source links behind the data" />
        <Stat n={`${total.pct}%`} l="of those links are on .gov or .mil addresses" />
        <Stat n={programs} l={`state programs across ${states} states + D.C., each linked to its official page`} />
        <Stat n={BENEFITS.length} l="federal benefit categories, each with its official sources" />
        <Stat n={CAREERS.length} l="career paths with BLS pay and outlook figures" />
        <Stat n={metros} l="metros with cited cost, rent, jobs and VA facility data" />
      </div>

      <SectionHead
        eyebrow="Dataset by dataset"
        title="When each one was last checked"
        sub="Links are counted from each dataset's cited sources. A link used in more than one dataset counts once in the total above."
      />
      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-small)", minWidth: 640 }}>
          <thead>
            <tr>
              {["Dataset", "Official sources", "Links", ".gov / .mil", "Last verified", "Checked"].map((h) => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sets.map((d) => (
              <tr key={d.key}>
                <td style={TD}><strong style={NAME}>{d.label}</strong><br /><span className="muted">{d.scope}</span></td>
                <td style={TD}>{d.sources}</td>
                <td style={TD}>{d.urls.length}</td>
                <td style={TD}>{d.urls.length ? Math.round((100 * d.gov) / d.urls.length) : 0}%</td>
                <td style={TD}>
                  {fmtVerified(d.lastVerified)}
                  {d.note && <><br /><span className="muted">{d.note}</span></>}
                </td>
                <td style={TD}>{d.cadence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ maxWidth: 640, marginTop: 10 }}>
        Most links that are not on .gov or .mil still belong to the agency behind the program: O*NET
        OnLine is sponsored by the U.S. Department of Labor, the Veterans Crisis Line site is run by VA,
        and some states publish official pages on .us, .org or .com addresses. The rest are a
        program&apos;s own site, such as a scholarship fund or a state university system.
      </p>

      <div style={{ marginTop: 32 }}>
        <SectionHead eyebrow="Method" title="How we check" sub="On a set schedule, and again whenever someone reports a problem." />
        <div className="card">
          <ol className="steps" style={{ margin: 0 }}>
            <li>We start from the agency that runs the program - VA, the Department of Labor, the SBA, the Bureau of Labor Statistics, and each state&apos;s own veterans, revenue and wildlife agencies - and link that page, not a summary of it.</li>
            <li>On each dataset&apos;s schedule (most are quarterly: January, April, July and October) we re-open its sources and compare them with what we say: the rule, the dollar amount, the rating threshold, the deadline, and the link itself.</li>
            <li>When a page moves, we link the new page instead of relying on a redirect. When a law changes, the description changes with it.</li>
            <li>Some government sites block automated link checks. A blocked link is opened in a normal browser before we call it broken.</li>
            <li>Anything we cannot confirm on a current official page is listed under &quot;Still open&quot; until it is confirmed, corrected or removed.</li>
            <li>Changes are reviewed before they go live, and a page&apos;s date only moves once its check is done.</li>
          </ol>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionHead eyebrow="History" title="Every check, dated" />
        <div className="card">
          {runs.map((r) => (
            <div key={r.id} style={ROW}>
              <div style={ROW_HEAD}>
                <strong style={NAME}>{r.title}</strong>
                <span className="tag">{fmtVerified(r.date)}</span>
              </div>
              <ul className="small" style={{ margin: "6px 0 0", paddingLeft: 18, display: "grid", gap: 4, maxWidth: 680 }}>
                {r.summary.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionHead
          eyebrow="Found and fixed"
          title="Every mistake we caught, and what changed"
          sub="A right-looking number can still be wrong, and a right number can still cite a page that does not support it. These are the corrections that changed what a veteran is told."
        />
        <div className="card">
          {corrections.map((c) => (
            <div key={`${c.date}-${c.where}-${c.item}`} style={ROW}>
              <div style={ROW_HEAD}>
                <strong style={NAME}>{c.where}: {c.item}</strong>
                <span className="tag">{datasetLabel(c.dataset)}</span>
                <span className="small muted">{fmtVerified(c.date)}</span>
              </div>
              <p className="small" style={{ margin: "4px 0 0", maxWidth: 680 }}><strong>Was:</strong> {c.was}</p>
              <p className="small" style={{ margin: "2px 0 0", maxWidth: 680 }}>
                <strong>Now:</strong> {c.now}
                {c.source && (
                  <>
                    {" "}
                    <a href={c.source} target="_blank" rel="noopener noreferrer">
                      Official source <i className="ti ti-external-link" aria-hidden="true" />
                    </a>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {open.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <SectionHead eyebrow="Still open" title="What we have not confirmed yet" sub="Each item stays here until it is confirmed, corrected or removed." />
          <div className="card">
            {open.map((o) => (
              <div key={`${o.where}-${o.item}`} style={ROW}>
                <div style={ROW_HEAD}>
                  <strong style={NAME}>{o.where}: {o.item}</strong>
                  <span className="tag">{datasetLabel(o.dataset)}</span>
                  <span className="small muted">open since {fmtVerified(o.since)}</span>
                </div>
                <p className="small" style={{ margin: "4px 0 0", maxWidth: 680 }}>{o.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...GRID, marginTop: 32 }}>
        <div className="card">
          <div className="iconwrap" style={{ marginBottom: 12 }}><i className="ti ti-user-check" aria-hidden="true" /></div>
          <h4 style={{ marginBottom: 6 }}>Who is responsible</h4>
          <p className="muted small" style={{ margin: 0, lineHeight: 1.6 }}>
            {VERIFICATION_LOG.owner}, one of the two people who built VetPath, owns this data and this
            record. Questions about a figure or a source go straight to him at{" "}
            <a href={`mailto:${VERIFICATION_LOG.contact}`}>{VERIFICATION_LOG.contact}</a>.
          </p>
        </div>
        <div className="card">
          <div className="iconwrap" style={{ marginBottom: 12 }}><i className="ti ti-flag-3" aria-hidden="true" /></div>
          <h4 style={{ marginBottom: 6 }}>Found an error?</h4>
          <p className="muted small" style={{ margin: "0 0 12px", lineHeight: 1.6 }}>
            Tell us the page, the item, and what the official source says. A person checks every report
            against the source, and if we got it wrong, the fix is logged on this page.
          </p>
          <ReportErrorLink className="btn ghost sm" />
        </div>
      </div>

      <p className="small muted" style={{ marginTop: 24, maxWidth: 640 }}>
        VetPath never determines eligibility - rules and amounts change, so confirm every benefit at its
        official source before acting on it. Linking to an agency&apos;s page does not mean that agency
        reviews or endorses VetPath. VetPath is a planning and education tool, not the VA, and not
        affiliated with any government agency.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
        <Link className="btn" href="/onboarding"><i className="ti ti-compass" /> Build my gameplan</Link>
        <Link className="btn ghost" href="/trust"><i className="ti ti-shield-check" /> How we earn trust</Link>
      </div>
    </Wrap>
  );
}
