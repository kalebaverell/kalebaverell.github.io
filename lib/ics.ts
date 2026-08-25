// Client-side .ics generation - VetPath deadlines land in the calendar app the
// veteran already opens every day. All-day events only: our dates are planning
// dates, never times. A date is never invented - callers gate on real dates.
import { track } from "@/lib/track";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function icsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** RFC 5545 text escaping for SUMMARY/DESCRIPTION values. */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export interface IcsEvent {
  title: string;
  /** All-day event date. */
  date: Date;
  description?: string;
  url?: string;
}

export function buildIcs(ev: IcsEvent): string {
  const next = new Date(ev.date);
  next.setDate(next.getDate() + 1); // DTEND is exclusive for all-day events
  const stamp = new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VetPath//Transition Timeline//EN",
    "BEGIN:VEVENT",
    `UID:${icsDate(ev.date)}-${ev.title.replace(/\W+/g, "").slice(0, 24)}@vetpathusa.com`,
    `DTSTAMP:${icsDate(stamp)}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDate(ev.date)}`,
    `DTEND;VALUE=DATE:${icsDate(next)}`,
    `SUMMARY:${esc(ev.title)}`,
    ev.description ? `DESCRIPTION:${esc(ev.description)}${ev.url ? esc("\n" + ev.url) : ""}` : ev.url ? `DESCRIPTION:${esc(ev.url)}` : "",
    ev.url ? `URL:${ev.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  // ics requires CRLF line endings
  return lines.join("\r\n") + "\r\n";
}

/** Blob download (works on iOS Safari where data: URIs are unreliable). */
export function downloadIcs(ev: IcsEvent): void {
  const blob = new Blob([buildIcs(ev)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 48) || "vetpath-event"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  track("calendar-export");
}
