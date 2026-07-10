"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { benefitById, goalById, stateName, BRAND } from "@/lib/data";

export default function PrintGameplan() {
  const { s, ready, loadSample } = useStore();
  if (!ready) return <div className="print-doc"><p className="muted">Loading…</p></div>;

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

  return (
    <div className="print-doc">
      <div className="no-print" style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
        <button className="btn" onClick={() => window.print()}><i className="ti ti-printer" /> Print / Save as PDF</button>
        <Link className="btn ghost" href="/dashboard"><i className="ti ti-arrow-left" /> Back</Link>
      </div>

      <div className="print-head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            <div><span className="muted">Status:</span> {a.status || "—"}</div>
            <div><span className="muted">State:</span> {a.state ? stateName(a.state) : "—"}</div>
            <div><span className="muted">Branch:</span> {a.branch || "—"}</div>
            <div><span className="muted">Urgency:</span> {a.urgency || "—"}</div>
          </div>
          {goals && <div style={{ marginTop: 8, fontSize: 14 }}><span className="muted">Top goals:</span> {goals}</div>}
        </div>
      </div>

      {gp.crisis && (
        <div className="print-section">
          <div className="print-box" style={{ borderColor: "#D89", background: "#FBEAEA" }}>
            <strong>Immediate support (free, confidential, 24/7):</strong> Veterans Crisis Line — dial <strong>988</strong> then press <strong>1</strong>, or text <strong>838255</strong>. Homeless Veterans line: <strong>1-877-424-3838</strong>.
          </div>
        </div>
      )}

      <div className="print-section">
        <h3>Top priorities</h3>
        <ol style={{ margin: "8px 0 0", paddingLeft: 22 }}>{gp.priorities.map((p, i) => <li key={i} style={{ marginBottom: 5 }}>{p}</li>)}</ol>
      </div>

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
        <p className="muted small">{BRAND.name} does not confirm eligibility — verify each item at its official source.</p>
        {gp.benefitCategories.map((id) => {
          const b = benefitById(id);
          if (!b) return null;
          return (
            <div key={id} className="print-box" style={{ marginBottom: 8 }}>
              <strong>{b.name}</strong> — <span className="small">{b.summary}</span>
              <div className="small" style={{ marginTop: 3 }}><span className="muted">Verify at:</span> <a href={b.official.url}>{b.official.name}</a></div>
            </div>
          );
        })}
      </div>

      {gp.decisions && gp.decisions.length > 0 && (
        <div className="print-section">
          <h3>Decisions to make</h3>
          <p className="muted small">Not tasks — calls to make, together where it&apos;s a household decision.</p>
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
          <strong>{BRAND.name} is a planning &amp; education tool — not the VA, a law firm, or an accredited claims representative.</strong> All
          benefit information here is sample/demo data for this prototype. Confirm eligibility and amounts through official sources such as
          VA.gov, your state veterans agency, or an accredited VSO (VFW, American Legion, DAV, or your county veteran service officer — their help is usually free).
        </div>
      </div>
    </div>
  );
}
