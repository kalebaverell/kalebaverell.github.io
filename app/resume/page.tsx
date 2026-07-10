"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { CAREERS, careerById } from "@/lib/data";
import { analyzeResume, type ResumeResult } from "@/lib/resume";
import { Wrap, Callout } from "@/components/ui";

export default function ResumeScanner() {
  const { s, ready, setResume } = useStore();
  const [text, setText] = useState("");
  const [careerId, setCareerId] = useState("");
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (ready && !hydrated) {
      setText(s.resume?.text || "");
      setCareerId(s.resume?.careerId || s.chosenPath?.careerId || "");
      setHydrated(true);
    }
  }, [ready, hydrated, s.resume, s.chosenPath]);

  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;

  const run = () => {
    const career = careerById(careerId);
    setResume({ text, careerId });
    setResult(analyzeResume(text, career));
  };

  const ring = (score: number) => (score >= 80 ? "var(--success)" : score >= 60 ? "var(--accent)" : "var(--danger)");

  return (
    <Wrap>
      <h2>Resume scanner</h2>
      <p className="muted" style={{ maxWidth: 640 }}>Paste your resume and we&apos;ll grade it like a civilian recruiter would — jargon, numbers, keywords for your target path. Nothing leaves your browser in this demo.</p>
      <div style={{ margin: "8px 0 16px" }}>
        <Callout kind="info">Demo feedback from simple rules — a coaching aid, not a hiring guarantee. For a human review, your DOL VETS rep is free.</Callout>
      </div>

      <div className="card">
        <label className="lbl" htmlFor="target">Target career path</label>
        <select id="target" className="field" value={careerId} onChange={(e) => setCareerId(e.target.value)} style={{ marginBottom: 16 }}>
          <option value="">General (no specific path)</option>
          {CAREERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <label className="lbl" htmlFor="rtext">Paste your resume text</label>
        <textarea id="rtext" className="field" rows={10} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"JOHN VETERAN\njohn@email.com · (555) 555-0100\n\nEXPERIENCE\nSquad Leader, U.S. Army..."} style={{ minHeight: 220, resize: "vertical", fontFamily: "var(--font-mono, monospace)", fontSize: 14 }} />
        <button className="btn gold" style={{ marginTop: 14 }} disabled={text.trim().length < 40} onClick={run}>
          <i className="ti ti-scan" /> Scan my resume
        </button>
      </div>

      {result && (
        <>
          <div className="card" style={{ marginTop: 16, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 110, height: 110, borderRadius: "50%", border: `10px solid ${ring(result.score)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>{result.score}</span>
              <span className="small muted">/ 100</span>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3 style={{ margin: "0 0 6px" }}>{result.score >= 80 ? "Strong — polish and send" : result.score >= 60 ? "Good bones — tighten these up" : "Worth a rework before you send it"}</h3>
              <p className="muted small" style={{ margin: 0 }}>{result.words} words · {result.issues.length} fixes flagged · demo score</p>
            </div>
          </div>

          {result.strengths.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3><i className="ti ti-thumb-up" style={{ color: "var(--success)" }} /> What&apos;s working</h3>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{result.strengths.map((x, i) => <li key={i} style={{ marginBottom: 4 }}>{x}</li>)}</ul>
            </div>
          )}

          {result.issues.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3><i className="ti ti-tool" style={{ color: "var(--accent-ink)" }} /> Fix these (highest impact first)</h3>
              {result.issues.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity])).map((iss, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className={`pill ${iss.severity === "high" ? "high" : iss.severity === "medium" ? "medium" : "low"}`}>{iss.severity}</span>
                  <div style={{ marginTop: 4 }}><strong>{iss.title}.</strong> <span className="small">{iss.detail}</span></div>
                </div>
              ))}
            </div>
          )}

          {result.jargonFound.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3><i className="ti ti-language" style={{ color: "var(--accent-ink)" }} /> Translate for civilians</h3>
              {result.jargonFound.map((j) => (
                <div key={j.term} className="kv"><span className="k">{j.term}</span><span style={{ textAlign: "right" }}>{j.plain}</span></div>
              ))}
            </div>
          )}

          {careerId && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3><i className="ti ti-key" style={{ color: "var(--accent-ink)" }} /> Keywords for {careerById(careerId)?.label}</h3>
              <p className="small muted">Work missing terms into real accomplishments — never stuff them.</p>
              <div>
                {result.keywordsHit.map((k) => <span key={k} className="chip" style={{ background: "var(--success-soft)", color: "var(--success)" }}><i className="ti ti-check" /> {k}</span>)}
                {result.keywordsMissing.map((k) => <span key={k} className="chip"><i className="ti ti-plus" /> {k}</span>)}
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: 16 }}>
            <h3><i className="ti ti-arrow-right" style={{ color: "var(--accent-ink)" }} /> Next steps</h3>
            <ol className="steps">{result.nextSteps.map((n, i) => <li key={i}>{n}</li>)}</ol>
          </div>
        </>
      )}

      <div style={{ marginTop: 20 }}>
        <Link className="btn ghost" href="/tools"><i className="ti ti-arrow-left" /> All tools</Link>
      </div>
    </Wrap>
  );
}
