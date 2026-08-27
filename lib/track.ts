// Retention analytics events via GoatCounter - the same privacy contract as
// page counting: no cookies, no identifiers, no payloads beyond the event name.
// Silently a no-op when the script hasn't loaded (localhost, blocked, SSR).
const EVENTS = [
  "plan-built",
  "action-checked",
  "calendar-export",
  "install-accepted",
  "update-applied",
  "journal-entry",
  "weekly-focus",
  "calendar-subscribe",
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
