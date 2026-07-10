"use client";
import React, { useEffect, useRef, useState } from "react";

export function Wrap({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div style={{ maxWidth: narrow ? 760 : 1180, margin: "0 auto", padding: "40px 22px" }}>{children}</div>;
}

export function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return <span className={`eyebrow${onDark ? " on-dark" : ""}`}>{children}</span>;
}

export function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 22, maxWidth: 640 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {sub && <p className="muted" style={{ margin: "10px 0 0" }}>{sub}</p>}
    </div>
  );
}

export function Callout({ kind = "info", children }: { kind?: "info" | "warn" | "crisis"; children: React.ReactNode }) {
  const icon = kind === "crisis" ? "ti-urgent" : kind === "warn" ? "ti-alert-triangle" : "ti-info-circle";
  return (
    <div className={`callout ${kind}`}>
      <i className={`ti ${icon}`} />
      <div>{children}</div>
    </div>
  );
}

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || to === 0) { setV(to); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 750;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span ref={ref}>{v}</span>;
}

export function Stat({ n, l }: { n: React.ReactNode; l: string }) {
  const numeric = typeof n === "number" || (typeof n === "string" && /^\d+$/.test(n));
  return (
    <div className="stat">
      <div className="n">{numeric ? <CountUp to={Number(n)} /> : n}</div>
      <div className="l">{l}</div>
    </div>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="bar" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label || "Progress"}>
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function Pill({ priority }: { priority: "high" | "medium" | "low" }) {
  return <span className={`pill ${priority}`}>{priority}</span>;
}

/** Quiet corner line-art for index cards — same compass/route/waypoint family as the hero. */
export function CardArt({ kind }: { kind: "compass" | "doc" | "layers" | "nodes" }) {
  return (
    <svg className="card-art" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      {kind === "compass" && (
        <>
          <circle cx="78" cy="42" r="40" />
          <circle cx="78" cy="42" r="26" />
          <path d="M78 8 L86 34 L78 42 L70 34 Z" fill="currentColor" stroke="none" />
          <path d="M78 76 L70 50 L78 42 L86 50 Z" />
        </>
      )}
      {kind === "doc" && (
        <>
          <rect x="42" y="6" width="66" height="86" rx="8" />
          <path d="M56 28 H94 M56 42 H94 M56 56 H80" />
          <path d="M56 74 l7 7 l13 -14" />
        </>
      )}
      {kind === "layers" && (
        <>
          <path d="M78 8 L116 28 L78 48 L40 28 Z" />
          <path d="M46 40 L40 44 L78 64 L116 44 L110 40" />
          <path d="M46 56 L40 60 L78 80 L116 60 L110 56" />
        </>
      )}
      {kind === "nodes" && (
        <>
          <circle cx="50" cy="24" r="10" />
          <circle cx="100" cy="46" r="10" />
          <circle cx="66" cy="84" r="10" />
          <path d="M59 28 L91 42 M93 54 L72 76 M55 33 L63 74" />
        </>
      )}
    </svg>
  );
}

export function CrisisBanner() {
  return (
    <div className="callout crisis" style={{ marginBottom: 16 }}>
      <i className="ti ti-urgent" />
      <div>
        <strong>You matter, and help is available 24/7.</strong> If you&apos;re in crisis or feeling unsafe, dial <strong>988</strong> then press <strong>1</strong>, or text <strong>838255</strong>. For housing instability, contact the National Call Center for Homeless Veterans at <strong>1-877-424-3838</strong>. These are free and confidential.
      </div>
    </div>
  );
}
