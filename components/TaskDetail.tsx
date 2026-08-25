"use client";
// Collapsible "open this task" detail - reveals relevant sourced links (official VA/DoD pages +
// the matching VetPath tool) for an action item, plus a private note that saves to the journal.
import { useState } from "react";
import Link from "next/link";
import { taskResources } from "@/lib/taskResources";
import { useAuth } from "@/lib/auth";
import { addEntry } from "@/lib/journal";

// Padded to a 44px touch target. This was a 27px strip, which is hard to hit
// reliably on a phone, and this audience skews older.
const TOGGLE_STYLE: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "var(--primary-800)",
  padding: "10px 0", minHeight: 44, fontFamily: "inherit", fontSize: "var(--fs-small)",
  fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6,
};

export default function TaskDetail({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [noting, setNoting] = useState(false);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const { enabled, user } = useAuth();
  const resources = taskResources(text);

  const saveNote = async () => {
    if (!note.trim()) return;
    try {
      await addEntry(enabled && user ? user.id : null, note, text);
      setNote(""); setNoting(false); setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch { /* the journal card surfaces persistent errors; here we just stay open */ }
  };

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
        <>
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
          {noting ? (
            <div style={{ margin: "8px 0 2px" }}>
              <textarea
                className="field"
                rows={2}
                placeholder="A thought to keep with this task - private to you."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ resize: "vertical", minHeight: 52 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button type="button" className="btn sm" onClick={saveNote} disabled={!note.trim()}>Save note</button>
                <button type="button" className="btn ghost sm" onClick={() => setNoting(false)}>Cancel</button>
              </div>
            </div>
          ) : saved ? (
            <p className="small" style={{ margin: "6px 0 0", color: "var(--success)" }}><i className="ti ti-check" aria-hidden="true" /> Saved to your notes</p>
          ) : (
            <button type="button" onClick={() => setNoting(true)} style={{ ...TOGGLE_STYLE, minHeight: 34, padding: "4px 0" }}>
              <i className="ti ti-file-text" aria-hidden="true" /> Add a note
            </button>
          )}
        </>
      )}
    </div>
  );
}
