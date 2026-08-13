"use client";
// Running checklist, everywhere (tester note 6, 2026-08-13): a compact pill
// showing done/total that expands into the next open actions, tickable in
// place. Hidden where the information already lives natively (dashboard,
// plan) and on public/funnel pages; renders only once a gameplan exists.
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const HIDE = new Set(["", "onboarding", "plan", "dashboard", "admin", "privacy", "terms", "trust", "do-not-sell", "reset"]);
const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function ProgressStrip() {
  const { s, ready, toggleDone } = useStore();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const first = pathname.split("/").filter(Boolean)[0] || "";
  if (!ready || !s.gameplan || HIDE.has(first)) return null;

  const gp = s.gameplan;
  const all = [...gp.plan30, ...gp.plan60, ...gp.plan90];
  const done = all.filter((it) => s.statuses[it.id] === "done").length;
  const next = [gp.plan30, gp.plan60, gp.plan90]
    .flatMap((win) => [...win].sort((x, y) => PRIORITY_RANK[x.priority] - PRIORITY_RANK[y.priority]))
    .filter((it) => s.statuses[it.id] !== "done")
    .slice(0, 3);

  return (
    <div className="progress-strip">
      {open && (
        <div className="card" style={{ width: 300, maxWidth: "calc(100vw - 28px)", marginBottom: 8, boxShadow: "0 6px 24px rgba(11,27,43,.18)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <strong className="small">{done} of {all.length} actions done</strong>
            <Link className="small" href="/plan">Full plan &rarr;</Link>
          </div>
          {next.length === 0 ? (
            <p className="small muted" style={{ margin: "8px 0 0" }}>Everything is checked off. Add a goal or revisit your plan.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "grid", gap: 6 }}>
              {next.map((it) => (
                <li key={it.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <button
                    type="button"
                    aria-label={`Mark done: ${it.text}`}
                    onClick={() => toggleDone(it.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--primary)", fontSize: 18, lineHeight: 1.2 }}
                  >
                    <i className="ti ti-square" aria-hidden="true" />
                  </button>
                  <span className="small" style={{ lineHeight: 1.45 }}>{it.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button
        type="button"
        className="btn"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{ borderRadius: 999, boxShadow: "0 4px 16px rgba(11,27,43,.22)", display: "inline-flex", gap: 8 }}
      >
        <i className={`ti ${open ? "ti-x" : "ti-checklist"}`} aria-hidden="true" /> {done}/{all.length}
      </button>
    </div>
  );
}
