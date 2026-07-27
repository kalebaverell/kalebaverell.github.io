"use client";
// Collapsible "open this task" detail - reveals relevant sourced links (official VA/DoD pages +
// the matching VetPath tool) for an action item. Each task can be opened for help.
import { useState } from "react";
import Link from "next/link";
import { taskResources } from "@/lib/taskResources";

export default function TaskDetail({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const resources = taskResources(text);
  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--info)", padding: "2px 0", fontFamily: "inherit", fontSize: "var(--fs-small)", display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <i className={`ti ti-chevron-${open ? "down" : "right"}`} aria-hidden="true" /> {open ? "Hide resources" : "Open - resources & links"}
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
