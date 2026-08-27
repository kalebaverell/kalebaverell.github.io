"use client";
import PageSkeleton from "@/components/PageSkeleton";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { benefitById, goalById, stateName, BRAND, residenceStates, careerById } from "@/lib/data";
import { buildFundedPath, FUNDING_VERIFIED, FUNDING_DISCLAIMER } from "@/lib/funding";
import { reserveFit, orderedBenefits, RESERVES_NOT_RECRUITER } from "@/lib/reserves";
import Topo from "@/components/Topo";

export default function PrintGameplan() {
  const { s, ready, loadSample } = useStore();
  if (!ready) return <PageSkeleton kind="print" />;

  if (!s.gameplan || !s.profile) {
    return (
      <div className="print-doc" style={{ textAlign: "center", padding: "48px 20px" }}>
        <h2>No gameplan to print yet</h2>
        <p className="muted">Complete the intake to generate a plan, then print it here.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
          <Link className="btn" href="/onboarding">Start intake</Link>
          <button className="btn ghost" onClick={loadSample}>Load a sample plan</button>
        </div>
      </div>
    );
  }

  const gp = s.gameplan;
  const a = s.answers;
  const goals = (a.topGoals || []).map((id) => goalById(id)?.label).filter(Boolean).join(" · ");

  // The two things a veteran most needs on paper: how the training gets paid for,
  // and whether part-time service is worth a look. Both use the same rules as the
  // screen, so the printout can never disagree with what they were just shown.
  const dest = gp.destination;
  const funded = buildFundedPath(a, careerById(s.chosenPath?.careerId));
  const rFit = reserveFit(a);
  const reserveTop = rFit.level !== "background" ? orderedBenefits(rFit).slice(0, 4) : [];

  return (
    <div className="print-doc">
      <div className="no-print" style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
        <button className="btn" onClick={() => window.print()}><i className="ti ti-printer" /> Print / Save as PDF</button>
        <Link className="btn ghost" href="/dashboard"><i className="ti ti-arrow-left" /> Back</Link>
      </div>

      <div className="print-head">
        <Topo opacity={0.05} color="var(--primary)" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-route" />
          </span>
          <strong style={{ fontSize: 20, color: "var(--primary)" }}>{BRAND.name}</strong>
          <span className="muted small" style={{ marginLeft: "auto" }}>{BRAND.tagline}</span>
        </div>
        <h1 style={{ margin: "12px 0 4px" }}>Personal veteran gameplan</h1>
        <p className="muted" style={{ margin: 0 }}>Prepared for <strong>{s.profile.name}</strong>{gp.crisis ? " · includes urgent support resources" : ""}</p>
      </div>

      <div className="print-section">
        <div className="print-box" style={{ background: "var(--chip-bg)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, fontSize: 14 }}>
            <div><span className="muted">Status:</span> {a.status || "-"}</div>
            <div><span className="muted">State(s):</span> {residenceStates(a).map((c) => stateName(c) || c).join(", ") || "-"}</div>
            <div><span className="muted">Branch:</span> {a.branch || "-"}</div>
            <div><span className="muted">Urgency:</span> {a.urgency || "-"}</div>
          </div>
          {goals && <div style={{ marginTop: 8, fontSize: 14 }}><span className="muted">Top goals:</span> {goals}</div>}
        </div>
      </div>

      {gp.crisis && (
        <div className="print-section">
          <div className="print-box" style={{ borderColor: "#D89", background: "#FBEAEA" }}>
            <strong>Immediate support (free, confidential, 24/7):</strong> Veterans Crisis Line - dial <strong>988</strong> then press <strong>1</strong>, or text <strong>838255</strong>. Homeless Veterans line: <strong>1-877-424-3838</strong>.
          </div>
        </div>
      )}

      <div className="print-section">
        <h3>Top priorities</h3>
        <ol style={{ margin: "8px 0 0", paddingLeft: 22 }}>{gp.priorities.map((p, i) => <li key={i} style={{ marginBottom: 5 }}>{p}</li>)}</ol>
      </div>

      {(funded.education.length > 0 || funded.career.length > 0) && (
        <div className="print-section print-break">
          <h3>How to pay for it</h3>
          <p className="muted small" style={{ margin: "0 0 10px" }}>
            {dest
              ? `Funding toward your destination: ${dest.label}. These stack, so read them together rather than picking one.`
              : "These stack, so read them together rather than picking one."}
          </p>

          {funded.education.length > 0 && (
            <>
              <strong style={{ fontSize: 14 }}>Pay for the training</strong>
              <ul style={{ margin: "6px 0 12px", paddingLeft: 22 }}>
                {funded.education.map((p) => (
                  <li key={p.id} style={{ marginBottom: 7 }}>
                    <strong>{p.name}</strong> ({p.type}). {p.amount}
                    <div className="muted" style={{ fontSize: 12 }}>Verify: {p.sourceLabel} - {p.source}</div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {funded.career.length > 0 && (
            <>
              <strong style={{ fontSize: 14 }}>Then land the job</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 22 }}>
                {funded.career.map((p) => (
                  <li key={p.id} style={{ marginBottom: 7 }}>
                    <strong>{p.name}</strong> ({p.type}). {p.amount}
                    <div className="muted" style={{ fontSize: 12 }}>Verify: {p.sourceLabel} - {p.source}</div>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="muted" style={{ fontSize: 12, margin: "10px 0 0" }}>
            Verified {FUNDING_VERIFIED}. {FUNDING_DISCLAIMER}
          </p>
        </div>
      )}

      {reserveTop.length > 0 && (
        <div className="print-section">
          <h3>Worth a look: Reserves &amp; National Guard</h3>
          {rFit.reasons.length > 0 && (
            <ul style={{ margin: "6px 0 10px", paddingLeft: 22 }}>
              {rFit.reasons.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r.text}</li>)}
            </ul>
          )}
          <ul style={{ margin: "0", paddingLeft: 22 }}>
            {reserveTop.map((b) => (
              <li key={b.id} style={{ marginBottom: 7 }}>
                <strong>{b.name}</strong>. {b.summary}
                <div className="muted" style={{ fontSize: 12 }}>Verify: {b.sourceLabel} - {b.source}</div>
              </li>
            ))}
          </ul>
          <p className="muted" style={{ fontSize: 12, margin: "10px 0 0" }}>
            {BRAND.name} is not a recruiter. {RESERVES_NOT_RECRUITER}
          </p>
        </div>
      )}

      <div className="print-section">
        <h3>Your 30 / 60 / 90-day action plan</h3>
        {[["Next 30 days", gp.plan30], ["Days 31–60", gp.plan60], ["Days 61–90", gp.plan90]].map(([title, items]: any) => (
          <div key={title} style={{ marginTop: 10 }}>
            <strong>{title}</strong>
            <div style={{ marginTop: 4 }}>
              {items.map((it: any) => (
                <div key={it.id} style={{ padding: "4px 0", fontSize: 14 }}>
                  <span className="chk" /> {it.text} <span className="muted small">({it.priority})</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="print-section print-break">
        <h3>Recommended benefits &amp; official sources to verify</h3>
        <p className="muted small">{BRAND.name} does not confirm eligibility - verify each item at its official source.</p>
        {gp.benefitCategories.map((id) => {
          const b = benefitById(id);
          if (!b) return null;
          return (
            <div key={id} className="print-box" style={{ marginBottom: 8 }}>
              <strong>{b.name}</strong> - <span className="small">{b.summary}</span>
              <div className="small" style={{ marginTop: 3 }}><span className="muted">Verify at:</span> <a href={b.official.url}>{b.official.name}</a></div>
            </div>
          );
        })}
      </div>

      {gp.decisions && gp.decisions.length > 0 && (
        <div className="print-section">
          <h3>Decisions to make</h3>
          <p className="muted small">Not tasks - calls to make, together where it&apos;s a household decision.</p>
          <ol style={{ margin: "6px 0 0", paddingLeft: 22 }}>
            {gp.decisions.map((d, i) => <li key={i} style={{ marginBottom: 5 }}>{d}</li>)}
          </ol>
        </div>
      )}

      <div className="print-section">
        <h3>Documents to gather</h3>
        <div>{gp.documents.map((d) => <div key={d} style={{ padding: "3px 0", fontSize: 14 }}><span className="chk" /> {d}</div>)}</div>
      </div>

      <div className="print-section">
        <h3>Why this matters</h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>{gp.whyItMatters.map((w, i) => <li key={i} style={{ marginBottom: 4 }}>{w}</li>)}</ul>
      </div>

      <div className="print-section">
        <div className="print-box" style={{ fontSize: 12, color: "var(--muted)" }}>
          <strong>{BRAND.name} is a planning &amp; education tool - not the VA, a law firm, or an accredited claims representative.</strong> All
          benefit information here is sample/demo data for this prototype. Confirm eligibility and amounts through official sources such as
          VA.gov, your state veterans agency, or an accredited VSO (VFW, American Legion, DAV, or your county veteran service officer - their help is usually free).
        </div>
      </div>
    </div>
  );
}
