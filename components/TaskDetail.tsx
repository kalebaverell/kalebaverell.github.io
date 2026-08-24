"use client";
// Collapsible "open this task" detail - reveals relevant sourced links (official VA/DoD pages +
// the matching VetPath tool) for an action item. Each task can be opened for help.
import { useState } from "react";
import Link from "next/link";
import { taskResources } from "@/lib/taskResources";

// Padded to a 44px touch target. This was a 27px strip, which is hard to hit
// reliably on a phone, and this audience skews older.
const TOGGLE_STYLE: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "var(--primary-800)",
  padding: "10px 0", minHeight: 44, fontFamily: "inherit", fontSize: "var(--fs-small)",
  fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6,
};

export default function TaskDetail({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const resources = taskResources(text);
  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={TOGGLE_STYLE}
      >
        <i className={`ti ti-chevron-${open ? "down" : "right"}`} aria-hidden="true" /> {open ? "Hide resources" : "Resources"}
      </button>
      {open && (
        <ul style={{ margin: "6px 0 2px", paddingLeft: 18, display: "grid", gap: 5 }}>
          {resources.map((r) => (
            <li key={r.href} className="small">
              {r.internal ? (
                <Link href={r.href}>{r.label} →</Link>
              ) : (
                <a href={r.href} target="_blank" rel="noopener noreferrer">{r.label} <i className="ti ti-external-link" style={{ fontSize: 11 }} aria-hidden="true" /></a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
