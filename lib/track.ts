// Retention analytics events via GoatCounter - the same privacy contract as
// page counting: no cookies, no identifiers, no payloads beyond the event name.
// Silently a no-op when the script hasn't loaded (localhost, blocked, SSR).

/** Ordered intake funnel events, one per step of data/intakeQuestions.json.
 *  KEEP IN SYNC with that file's `steps` array - the index is the step number,
 *  and a mismatch means a step silently stops reporting. The numeric prefix
 *  keeps them grouped and in order in GoatCounter's event list. */
export const INTAKE_STEP_EVENTS = [
  "intake-1-basics",
  "intake-2-status",
  "intake-3-priorities",
  "intake-4-weights",
  "intake-5-goals",
] as const;

const EVENTS = [
  "plan-built",
  "action-checked",
  "calendar-export",
  "install-accepted",
  "update-applied",
  "journal-entry",
  "weekly-focus",
  "calendar-subscribe",
  "phase-card",
  "journal-doorway",
  // Intake funnel (2026-08-28): 63% of people who start the intake never finish
  // it, and we could not see where they left. These say which step loses them.
  "intake-gate",
  ...INTAKE_STEP_EVENTS,
  "intake-blocked-goals",
] as const;

export type TrackEvent = (typeof EVENTS)[number];

export function track(event: TrackEvent): void {
  if (typeof window === "undefined") return;
  const gc = (window as any).goatcounter;
  if (!gc || typeof gc.count !== "function") return;
  try {
    gc.count({ path: `event/${event}`, title: event, event: true });
  } catch {
    /* analytics must never break the app */
  }
}

/** Fire an event at most once per browser session. Funnel steps need this:
 *  walking Back and Next through the intake would otherwise inflate the very
 *  step counts we are trying to read. A genuine return visit counts again,
 *  which is the honest reading of "reached this step". */
export function trackOnce(event: TrackEvent): void {
  if (typeof window === "undefined") return;
  const key = `vp_ev_${event}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* private mode: fall through and count it - a small over-count beats none */
  }
  track(event);
}
