"use client";
import { useState } from "react";
import Link from "next/link";
import { CREDIT_MAP } from "@/lib/data";
import { Wrap, Callout } from "@/components/ui";

export default function SmartTranscript() {
  const branches = [...new Set(CREDIT_MAP.roles.map((r) => r.branch))];
  const [branch, setBranch] = useState("");
  const [code, setCode] = useState("");
  const roles = CREDIT_MAP.roles.filter((r) => r.branch === branch);
  const role = roles.find((r) => r.code === code);
  const total = role ? role.credits.reduce((s, c) => s + c.hours, 0) : 0;

  return (
    <Wrap>
      <h2>Smart transcript</h2>
      <p className="muted" style={{ maxWidth: 640 }}>Your military training may already be college credit. Pick your role to see illustrative examples of what schools often award — then pull your real transcript and make them honor it.</p>
      <div style={{ margin: "8px 0 16px" }}>
        <Callout kind="warn">Sample estimates in the style of ACE recommendations. Your ACTUAL credit comes from your Joint Services Transcript (JST) or CCAF transcript — and each school&apos;s registrar decides what transfers.</Callout>
      </div>

      <div className="card">
        <label className="lbl" htmlFor="branch">Branch</label>
        <select id="branch" className="field" value={branch} onChange={(e) => { setBranch(e.target.value); setCode(""); }} style={{ marginBottom: 16 }}>
          <option value="">Select branch…</option>
          {branches.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        {branch && (
          <>
            <label className="lbl" htmlFor="mos">Your MOS / rating / AFSC</label>
            <select id="mos" className="field" value={code} onChange={(e) => setCode(e.target.value)}>
              <option value="">Select role…</option>
              {roles.map((r) => <option key={r.code} value={r.code}>{r.code} — {r.title}</option>)}
            </select>
            <p className="small muted" style={{ margin: "8px 0 0" }}>Don&apos;t see yours? This demo has {CREDIT_MAP.roles.length} sample roles — the real version maps every rating via the JST/ACE database.</p>
          </>
        )}
      </div>

      {role && (
        <>
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>{role.code} — {role.title}</h3>
              <span className="chip gold" style={{ fontSize: "var(--fs-h4)" }}><i className="ti ti-school" /> ~{total} sample credit hours</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: "var(--fs-small)" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "2px solid var(--border)" }}>Course area</th>
                  <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "2px solid var(--border)" }}>Hours</th>
                  <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "2px solid var(--border)" }}>Level</th>
                </tr>
              </thead>
              <tbody>
                {role.credits.map((c) => (
                  <tr key={c.area}>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>{c.area}</td>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>{c.hours}</td>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>{c.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {role.note && <p className="small" style={{ margin: "10px 0 0" }}><i className="ti ti-bulb" style={{ color: "var(--accent-ink)" }} /> {role.note}</p>}
          </div>
        </>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3><i className="ti ti-file-certificate" style={{ color: "var(--accent-ink)" }} /> How to turn this into real credit</h3>
        <ol className="steps">{CREDIT_MAP.howItWorks.map((h, i) => <li key={i}>{h}</li>)}</ol>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <a className="btn ghost sm" href="https://jst.doded.mil" target="_blank" rel="noopener noreferrer">Joint Services Transcript <i className="ti ti-external-link" /></a>
          <a className="btn ghost sm" href="https://www.airuniversity.af.edu/Barnes/CCAF/" target="_blank" rel="noopener noreferrer">CCAF (Air Force / Space Force) <i className="ti ti-external-link" /></a>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link className="btn ghost" href="/tools"><i className="ti ti-arrow-left" /> All tools</Link>
      </div>
    </Wrap>
  );
}
