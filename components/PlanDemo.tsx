"use client";
// "Watch a plan build itself" — an auto-looping product demonstration.
// Three acts: your story → your path → your plan adapting to life.
// Pure CSS/JS motion; reduced-motion users get the complete final frame, static.
import { useEffect, useRef, useState } from "react";

const ACTS = 3;
const ACT_MS = 3400;

export default function PlanDemo() {
  const [act, setAct] = useState(0);
  const [fit, setFit] = useState(0);
  const [reduced, setReduced] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    if (rm) { setAct(ACTS - 1); setFit(93); return; }
    const t = setInterval(() => setAct((a) => (a + 1) % ACTS), ACT_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (reduced) return;
    if (act === 1) {
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1400);
        setFit(Math.round(93 * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf.current);
    }
    if (act === 0) setFit(0);
  }, [act, reduced]);

  const show = (n: number) => reduced || act >= n;
  const chip = (text: string, on: boolean, delay = 0) => (
    <span
      className="chip"
      style={{
        opacity: on ? 1 : 0.18,
        transform: on ? "none" : "translateY(6px)",
        transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms`,
      }}
    >
      {text}
    </span>
  );

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }} aria-label="Demonstration: a veteran's plan assembling from their answers">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", minHeight: 250 }}>
        {/* Act 1 — the story */}
        <div style={{ padding: "22px 24px", borderRight: "1px solid var(--hairline)" }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>1 · Your story</div>
          <div>
            {chip("Texas", show(0), 0)}
            {chip("Army · 8 years", show(0), 120)}
            {chip("60–90% rated", show(0), 240)}
            {chip("Family of four", show(0), 360)}
            {chip("Wants hands-on work", show(0), 480)}
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>Ten questions — boxes or your own words.</p>
        </div>

        {/* Act 2 — the path */}
        <div style={{ padding: "22px 24px", borderRight: "1px solid var(--hairline)", opacity: show(1) ? 1 : 0.35, transition: "opacity .5s ease" }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>2 · Your path</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 500, color: "var(--primary)", lineHeight: 1, minWidth: 96, fontVariantNumeric: "tabular-nums" }}>
              {reduced ? 93 : fit}%
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Electrician</div>
              <div className="small muted">Skilled trades · $62k median (BLS)</div>
            </div>
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>Recommended with reasons — never a black box.</p>
        </div>

        {/* Act 3 — the adaptive plan */}
        <div style={{ padding: "22px 24px", opacity: show(2) ? 1 : 0.35, transition: "opacity .5s ease" }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>3 · Your plan — alive</div>
          {[
            "File VA claim in the BDD window",
            "Apply: Helmets to Hardhats",
            "Check Hazlewood Act (Texas)",
          ].map((t, i) => (
            <div key={t} style={{ display: "flex", gap: 9, alignItems: "center", padding: "4px 0", opacity: show(2) ? 1 : 0.25, transform: show(2) ? "none" : "translateY(5px)", transition: `all .45s ease ${i * 160}ms` }}>
              <i className="ti ti-square-check" aria-hidden="true" style={{ color: "var(--success)", fontSize: 19 }} />
              <span className="small">{t}</span>
            </div>
          ))}
          <div className="chip gold" style={{ marginTop: 10, opacity: show(2) ? 1 : 0, transition: "opacity .5s ease 600ms" }}>
            <i className="ti ti-refresh" /> New baby? The plan adapts.
          </div>
        </div>
      </div>
      <div style={{ background: "var(--surface-2)", borderTop: "1px solid var(--hairline)", padding: "10px 24px", display: "flex", gap: 8, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: act === i && !reduced ? 22 : 8, height: 8, borderRadius: 8, background: act === i && !reduced ? "var(--accent)" : "var(--border)", transition: "all .4s ease" }} />
        ))}
        <span className="small muted" style={{ marginLeft: "auto" }}>A real walkthrough of how {""}the engine works — sample data</span>
      </div>
    </div>
  );
}
