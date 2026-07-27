"use client";
// Recommended benefit categories on the dashboard - each one expands inline to show what it is,
// who it's for, and the official source to verify, so a veteran can see the detail without
// leaving the page.
import { useState } from "react";
import Link from "next/link";
import { benefitById } from "@/lib/data";

export default function BenefitCategoryList({ ids }: { ids: string[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {ids.map((id) => {
        const b = benefitById(id);
        if (!b) return null;
        const open = openId === id;
        return (
          <div key={id} style={{ border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden", background: "var(--surface)" }}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : id)}
              aria-expanded={open}
              style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit", fontSize: "inherit", color: "var(--ink)" }}
            >
              <i className={`ti ${b.icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)", fontSize: 18, flex: "0 0 auto" }} />
              <span style={{ flex: 1, fontWeight: 500 }}>{b.name}</span>
              <i className={`ti ti-chevron-${open ? "down" : "right"}`} aria-hidden="true" style={{ color: "var(--muted)", flex: "0 0 auto" }} />
            </button>
            {open && (
              <div style={{ padding: "0 14px 12px 44px" }}>
                <p className="small" style={{ margin: "0 0 6px" }}>{b.summary}</p>
                {b.whoFor && <p className="small muted" style={{ margin: "0 0 6px" }}><strong>Who it&apos;s for:</strong> {b.whoFor}</p>}
                <a className="small" href={b.official.url} target="_blank" rel="noopener noreferrer">
                  {b.official.name} <i className="ti ti-external-link" style={{ fontSize: 11 }} aria-hidden="true" />
                </a>
                <span style={{ margin: "0 10px", color: "var(--faint)" }}>·</span>
                <Link className="small" href="/benefits">Full library →</Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
