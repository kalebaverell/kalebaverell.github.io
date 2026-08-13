// Funded Path - the stacked-benefits funnel for a matched trajectory. Reads top-to-bottom as a
// plain story: here's how you pay for the training (benefits that combine), then what the
// destination job adds on top. Content + selection come from lib/funding (all sourced).
import type { Answers, Career } from "@/lib/types";
import { buildFundedPath, FUNDING_VERIFIED, type FundingProgram } from "@/lib/funding";

// Color-code each program by where the money comes from, so a veteran can scan public vs.
// scholarship vs. employer at a glance.
function typeColor(type: string): string {
  if (/scholarship/i.test(type)) return "var(--accent-ink)"; // gold - scholarships
  if (/employer/i.test(type)) return "var(--success)";       // green - private employers
  return "var(--primary)";                                    // navy - federal / government
}

function Item({ p }: { p: FundingProgram }) {
  const c = typeColor(p.type);
  return (
    <div style={{ display: "flex", border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ width: 5, background: c, flex: "0 0 auto" }} aria-hidden="true" />
      <div style={{ padding: "11px 14px", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <strong style={{ color: "var(--ink-strong)" }}>{p.name}</strong>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: c, whiteSpace: "nowrap" }}>{p.type}</span>
        </div>
        <p style={{ margin: "3px 0 5px", fontSize: "var(--fs-small)", color: "var(--ink)" }}>{p.amount}</p>
        <p className="small muted" style={{ margin: 0 }}>{p.eligibility}</p>
        {p.tip && (
          <p className="small" style={{ margin: "4px 0 0", color: "var(--accent-ink)" }}>
            <i className="ti ti-bulb" aria-hidden="true" /> {p.tip}
          </p>
        )}
        <a className="small" href={p.source} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 5 }}>
          {p.sourceLabel} <i className="ti ti-external-link" style={{ fontSize: 12 }} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function Layer({ n, icon, title, hint, items }: { n: number; icon: string; title: string; hint: string; items: FundingProgram[] }) {
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--primary)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flex: "0 0 auto" }}>{n}</span>
        <strong style={{ color: "var(--ink-strong)" }}><i className={`ti ${icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)", marginRight: 6 }} />{title}</strong>
      </div>
      <p className="small muted" style={{ margin: "4px 0 10px 36px" }}>{hint}</p>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((p) => <Item key={p.id} p={p} />)}
      </div>
    </div>
  );
}

export default function FundedPath({ a, career }: { a: Answers; career?: Career }) {
  const { education, career: careerLayer } = buildFundedPath(a, career);
  const dest = career?.label;
  return (
    <div className="card feature">
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span className="iconwrap"><i className="ti ti-stack-2" aria-hidden="true" /></span>
        <div>
          <h3 style={{ margin: 0 }}>Your funded path</h3>
          <p className="small muted" style={{ margin: "2px 0 0" }}>
            How to pay for {dest ? <strong>{dest}</strong> : "your path"} - and what the job adds on top.
          </p>
        </div>
      </div>

      {/* Low-GI-Bill pivot (tester feedback 2026-08-13: "1-2 months left,
          which programs still pay?"). Real programs only, each linked. */}
      {(a.giBillRemaining === "1-6 months" || a.giBillRemaining === "None - used it up") && (
        <div style={{ marginTop: 16, background: "var(--accent-soft)", borderRadius: 10, padding: "12px 16px" }}>
          <strong className="small" style={{ color: "var(--accent-ink)" }}>
            <i className="ti ti-hourglass-low" aria-hidden="true" /> Running low on GI Bill - these still pay:
          </strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
            <li className="small"><strong>VR&amp;E (Chapter 31)</strong> - a separate program with its own entitlement, for a service-connected disability with an employment need. Running out of GI Bill does not close this door. <a href="https://www.va.gov/careers-employment/vocational-rehabilitation/" target="_blank" rel="noopener noreferrer">VA.gov</a></li>
            <li className="small"><strong>Rogers STEM Scholarship</strong> - up to 9 additional months of Post-9/11 benefits for qualifying STEM programs when your entitlement runs out. <a href="https://www.va.gov/education/other-va-education-benefits/stem-scholarship/" target="_blank" rel="noopener noreferrer">VA.gov</a></li>
            <li className="small"><strong>Your state&apos;s own tuition programs</strong> - many pay regardless of your federal months (Texas&apos;s Hazlewood Act is a strong example). Check your state on the Benefits page.</li>
            <li className="small"><strong>Federal student aid</strong> - Pell Grants and FAFSA are entirely separate from VA benefits, and veterans qualify like anyone else. <a href="https://studentaid.gov/" target="_blank" rel="noopener noreferrer">studentaid.gov</a></li>
            <li className="small"><strong>Registered apprenticeships</strong> - earn a paycheck while you train, with little or no tuition to fund at all. <a href="https://www.apprenticeship.gov/" target="_blank" rel="noopener noreferrer">apprenticeship.gov</a></li>
          </ul>
          <p className="small muted" style={{ margin: "8px 0 0" }}>
            Check your exact remaining months in your <a href="https://www.va.gov/education/check-remaining-benefits/" target="_blank" rel="noopener noreferrer">VA.gov education benefits status</a> before planning around them.
          </p>
        </div>
      )}

      <Layer n={1} icon="ti-cash" title="Pay for the training" hint="Stack several of these together." items={education} />
      <Layer n={2} icon="ti-briefcase" title="Then land the job" hint="Money your destination adds on top." items={careerLayer} />

      <p className="small muted" style={{ marginTop: 16 }}>
        Verified {FUNDING_VERIFIED}. Amounts and eligibility vary and change - confirm each program at its official source. {"VetPath"} doesn&apos;t determine eligibility.
      </p>
    </div>
  );
}
