"use client";
// Separation month capture (Oct 2026). Every date-driven feature - the phase
// card, the dashboard countdown, Coming up, the calendar feed, the T-minus
// check-in emails - reads answers.easDate as "YYYY-MM". On Oct 2, 2026 none of
// the 21 in-uniform accounts had a usable value, so all of it stayed silent.
//
// Two plain selects, not <input type="month">: Firefox and desktop Safari have
// no month picker and fall back to a free-text box.
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { isEas, normalizeEas, blankHorizonFill, IN_UNIFORM_STATUSES } from "@/lib/timeline";
import { track } from "@/lib/track";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Month + year pickers. Emits "YYYY-MM" once both halves are chosen and ""
 *  when either is cleared. A half-made pick lives only here. */
export function MonthYearSelect({ value, onChange, idPrefix }: {
  value: string;
  onChange: (v: string) => void;
  idPrefix: string;
}) {
  const [half, setHalf] = useState({ m: "", y: "" });
  const full = isEas(value) ? value : "";
  const m = full ? full.slice(5, 7) : half.m;
  const y = full ? full.slice(0, 4) : half.y;
  const now = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => String(now - 1 + i));
  if (y && !years.includes(y)) years.push(y);
  years.sort();
  const pick = (nm: string, ny: string) => {
    if (nm && ny) {
      setHalf({ m: "", y: "" });
      if (`${ny}-${nm}` !== value) onChange(`${ny}-${nm}`);
    } else {
      setHalf({ m: nm, y: ny });
      if (full) onChange("");
    }
  };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <select id={`${idPrefix}-month`} className="field" style={{ maxWidth: 200 }} aria-label="Month" value={m} onChange={(e) => pick(e.target.value, y)}>
        <option value="">Month…</option>
        {MONTHS.map((name, i) => <option key={name} value={String(i + 1).padStart(2, "0")}>{name}</option>)}
      </select>
      <select id={`${idPrefix}-year`} className="field" style={{ maxWidth: 140 }} aria-label="Year" value={y} onChange={(e) => pick(m, e.target.value)}>
        <option value="">Year…</option>
        {years.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
      </select>
    </div>
  );
}

const KEY = "vp_eas_prompt_done";

/** One-time dashboard ask for members still in uniform with no usable
 *  separation month. Saving swaps it for PhaseNow; "No thanks" retires it on
 *  this device. Encourage, never nag - same contract as InstallNudge. */
export default function SeparationMonthPrompt() {
  const { s, setAnswer } = useStore();
  const { enabled, user } = useAuth();
  const [open, setOpen] = useState(false);
  // Pre-filled from a stored value we could not read, so that member only confirms.
  const [draft, setDraft] = useState(() => normalizeEas(s.answers.easDate) || "");

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch { /* storage blocked: stay quiet rather than ask on every visit */ }
  }, []);

  if (!open) return null;
  // Members only: a signed-out local value can be dropped at sign-in (ProfileSync: remote wins).
  if (enabled && !user) return null;
  if (!(IN_UNIFORM_STATUSES as readonly string[]).includes(s.answers.status || "")) return null;
  if (isEas(s.answers.easDate)) return null;

  const done = () => { try { localStorage.setItem(KEY, "1"); } catch { /* best effort */ } };
  const save = () => {
    if (!isEas(draft)) return;
    setAnswer("easDate", draft);
    // Same rule as the intake: fill a blank horizon from the month, never
    // overwrite one the member picked. No regen - the plan is left as it is.
    const h = blankHorizonFill(s.answers, draft);
    if (h) { setAnswer("horizon", h); setAnswer("horizonAuto", true); }
    done();
    track("eas-prompt-saved");
  };
  const dismiss = () => {
    done();
    setOpen(false);
    track("eas-prompt-dismissed");
  };

  return (
    <div className="card" style={{ marginTop: 16, display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", borderLeft: "3px solid var(--primary)" }}>
      <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 10, background: "var(--chip-bg)", color: "var(--chip-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        <i className="ti ti-calendar-due" />
      </span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h4 id="eas-prompt-title" style={{ margin: "0 0 2px" }}>Know your separation month?</h4>
        <span className="muted small">
          Add it and this page starts showing real dates: the phase you are in, what opens next, and when.
          A best guess is fine - you can change it anytime on your timeline.
        </span>
        <div role="group" aria-labelledby="eas-prompt-title" style={{ marginTop: 12 }}>
          <MonthYearSelect idPrefix="eas-prompt" value={draft} onChange={setDraft} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" className="btn sm" disabled={!isEas(draft)} onClick={save}>
            <i className="ti ti-calendar-check" aria-hidden="true" /> Save
          </button>
          <button type="button" className="btn ghost sm" onClick={dismiss}>No thanks</button>
        </div>
      </div>
    </div>
  );
}
