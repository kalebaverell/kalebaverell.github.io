"use client";
// The ask that makes the feedback box real (Sep 11). The drop box shipped
// Sep 1 with exactly one door - a footer link - and collected nothing in ten
// days. Not silence: invisibility. These are the other doors, placed at the
// moments a veteran actually has an opinion.
//
// Framing matters as much as placement. "Tell us what's off" asks for bug
// reports; a veteran who wants something ADDED does not think anything is
// off, so that wording never reached them. These ask what they need.
import Link from "next/link";
import { track } from "@/lib/track";
import type { TrackEvent } from "@/lib/track";

/** Remember which page the veteran was reading when they decided to speak up.
 *  The feedback table has a `page` column for exactly this, but it was filled
 *  from document.referrer - and these links are client-side route transitions,
 *  which never set one. Without this, every note from a guide or the dashboard
 *  lands with page=null, and "the fitness info is wrong" arrives with no way
 *  to know they meant the fitness guide. */
function rememberSource() {
  try { sessionStorage.setItem("vp_feedback_from", window.location.pathname); } catch { /* hint only */ }
}

export default function FeedbackAsk({
  line,
  sub,
  cta,
  event,
  variant = "card",
}: {
  line: string;
  sub: string;
  cta: string;
  /** Which door was used - so we learn which placement actually works. */
  event: Extract<TrackEvent, "feedback-dashboard" | "feedback-guide">;
  variant?: "card" | "quiet";
}) {
  if (variant === "quiet") {
    // End-of-article: a line, not a box. The guides are for reading, and a
    // second loud card after the official-sources block would compete with
    // the gameplan CTA that is already mid-read.
    return (
      <p className="small muted" style={{ marginTop: 26, maxWidth: 640, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <i className="ti ti-bulb" aria-hidden="true" style={{ color: "var(--accent-ink)", marginRight: 6 }} />
        {line}{" "}
        <Link href="/feedback" onClick={() => { rememberSource(); track(event); }}>
          {cta}
        </Link>{" "}
        {sub}
      </p>
    );
  }

  return (
    <Link
      href="/feedback"
      onClick={() => { rememberSource(); track(event); }}
      className="card"
      style={{ marginTop: 16, display: "flex", gap: 14, alignItems: "center", textDecoration: "none", color: "var(--ink)", flexWrap: "wrap" }}
    >
      <span
        aria-hidden="true"
        style={{ width: 40, height: 40, borderRadius: 10, background: "var(--chip-bg)", color: "var(--chip-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}
      >
        <i className="ti ti-bulb" />
      </span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h4 style={{ margin: "0 0 2px" }}>{line}</h4>
        <span className="muted small">{sub}</span>
      </div>
      <span className="small" style={{ fontWeight: 600, color: "var(--info)", display: "inline-flex", alignItems: "center", gap: 4 }}>
        {cta} <i className="ti ti-arrow-right" aria-hidden="true" />
      </span>
    </Link>
  );
}
