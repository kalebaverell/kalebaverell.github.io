"use client";
// "Show it back" (Kaleb, 2026-10-12). The intake ends with one optional box
// for anything the questions missed (answers.stepNotes). No plan rule reads
// it, so instead of letting it sit unseen, the note is shown back here - on
// the dashboard and the action plan - for the veteran and anyone helping them.
// The card says plainly that the plan is not built from it. Renders nothing
// when there is no note. /print reuses gatherNotes behind an opt-in checkbox.
//
// The card is screen-only (no-print): the privacy page promises the note is on
// a printout only if the veteran ticks the box on /print, so a browser print
// of /plan or /dashboard must not carry it.
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useStore } from "@/lib/store";
import { INTAKE } from "@/lib/data";
import type { Answers } from "@/lib/types";

/** The step the intake's notes box writes to today: its last step. Edits made
 *  here go to the same place, so the intake and this card always agree. */
export const NOTE_STEP_ID: string = INTAKE[INTAKE.length - 1].id;

export interface WordsNote {
  stepId: string;
  text: string;
}

/** Every non-empty note, trimmed. Intake step order first, then any other
 *  keys (older accounts kept one note per step under an earlier design).
 *  Identical text shows once - and when an older note repeats the current
 *  note word for word, the current note owns it, so the editor below is the
 *  one place that text can be changed or cleared. */
export function gatherNotes(answers: Answers): WordsNote[] {
  const raw = answers.stepNotes || {};
  const stepIds = INTAKE.map((st) => st.id);
  const order = [...stepIds, ...Object.keys(raw).filter((k) => !stepIds.includes(k))];
  const current = typeof raw[NOTE_STEP_ID] === "string" ? raw[NOTE_STEP_ID].trim() : "";
  const seen = new Set<string>();
  const out: WordsNote[] = [];
  for (const stepId of order) {
    const v = raw[stepId];
    const text = typeof v === "string" ? v.trim() : "";
    if (!text || seen.has(text)) continue;
    if (stepId !== NOTE_STEP_ID && text === current) continue;
    seen.add(text);
    out.push({ stepId, text });
  }
  return out;
}

export const YOUR_WORDS_HONEST =
  "Your plan is built from your answers, not from this note. It's here for you, and for anyone helping you.";

const REMOVED_LINE =
  "Your note was removed. You can write a new one at the end of the intake (Profile, then Edit answers).";

/** One note as written: line breaks kept, long words wrapped, React-escaped. */
export function NoteText({ text }: { text: string }) {
  return (
    <blockquote style={{ margin: 0, padding: "2px 0 2px 14px", borderLeft: "3px solid var(--accent)", whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: "var(--ink-strong)" }}>
      {text}
    </blockquote>
  );
}

export default function YourWords({ style }: { style?: CSSProperties }) {
  const { s, setStepNote } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  // What the last Save did, said out loud (role="status") and on screen. It
  // also keeps the card mounted for this visit after the only note is cleared,
  // so the removal is confirmed instead of the card silently vanishing.
  const [saved, setSaved] = useState<"" | "saved" | "removed">("");
  const uid = useId();
  const headingId = `${uid}-h`;
  const fieldId = `${uid}-field`;
  const honestId = `${uid}-honest`;
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const wasEditing = useRef(false);

  // Keyboard users land in the box when it opens, and back on Edit when it
  // closes - or on the confirmation when clearing the note left nothing to
  // edit - instead of being dropped at the top of the page.
  useEffect(() => {
    if (editing) fieldRef.current?.focus();
    else if (wasEditing.current) (editRef.current ?? statusRef.current)?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const notes = gatherNotes(s.answers);
  if (notes.length === 0 && saved !== "removed") return null;

  const current = (s.answers.stepNotes?.[NOTE_STEP_ID] || "").trim();
  // Notes saved under other steps stay as they are; the editor only writes the
  // last step's note, so these are shown read-only while editing.
  const others = notes.filter((n) => n.stepId !== NOTE_STEP_ID);

  const open = () => {
    setDraft(s.answers.stepNotes?.[NOTE_STEP_ID] || "");
    setSaved("");
    setEditing(true);
  };
  const save = () => {
    const text = draft.trim();
    setStepNote(NOTE_STEP_ID, text);
    // An older note that repeated the current one word for word was shown as
    // this note (gatherNotes), so it changes with it - otherwise it would pop
    // back up as a separate note the moment this one is edited or cleared.
    if (current && text !== current) {
      for (const [stepId, v] of Object.entries(s.answers.stepNotes || {})) {
        if (stepId !== NOTE_STEP_ID && typeof v === "string" && v.trim() === current) setStepNote(stepId, "");
      }
    }
    setSaved(text ? (text === current ? "" : "saved") : current ? "removed" : "");
    setEditing(false);
  };
  const cancel = () => setEditing(false);

  const statusText = saved === "removed" ? REMOVED_LINE : saved === "saved" ? "Your note was saved." : "";

  return (
    <section className="card no-print" aria-labelledby={headingId} style={{ marginTop: 16, ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h3 id={headingId} style={{ margin: 0 }}>
          <i className="ti ti-messages" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> In your words
        </h3>
        {!editing && notes.length > 0 && (
          <button ref={editRef} type="button" className="btn ghost sm" onClick={open} aria-label="Edit your note">
            <i className="ti ti-pencil" aria-hidden="true" /> Edit
          </button>
        )}
      </div>

      {!editing ? (
        notes.length > 0 && (
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {notes.map((n) => <NoteText key={n.stepId} text={n.text} />)}
          </div>
        )
      ) : (
        <div style={{ marginTop: 12 }}>
          {others.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p className="small muted" style={{ margin: "0 0 8px" }}>
                Also saved from an earlier version of the intake. These stay as they are:
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                {others.map((n) => <NoteText key={n.stepId} text={n.text} />)}
              </div>
            </div>
          )}
          <label className="lbl" htmlFor={fieldId}>Your note</label>
          <textarea
            ref={fieldRef}
            id={fieldId}
            className="field"
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-describedby={honestId}
            style={{ minHeight: 100, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <button type="button" className="btn sm" onClick={save}>
              <i className="ti ti-check" aria-hidden="true" /> Save
            </button>
            <button type="button" className="btn ghost sm" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Always in the card, so screen readers hear the change when it fills. */}
      <p ref={statusRef} role="status" tabIndex={-1} className="small" style={{ margin: statusText ? "12px 0 0" : 0, fontWeight: 600 }}>
        {statusText}
      </p>

      {(notes.length > 0 || editing) && (
        <p id={honestId} className="small muted" style={{ margin: "14px 0 0" }}>{YOUR_WORDS_HONEST}</p>
      )}
    </section>
  );
}
