"use client";
// "Report an error" (Oct 2026) - the door that makes "verified" two-way. Opens
// the feedback box in report mode with the page and the item already attached.
// The item travels in sessionStorage, never in the URL: plan task text can name
// a state, a career, or a health topic, and a URL ends up in browser history and
// server logs. Only the bare "#report" flag is in the link, and the page counter
// records the path alone (components/Analytics.tsx), so neither reaches it.
import Link from "next/link";
import type { CSSProperties } from "react";
import { track } from "@/lib/track";

/** Read, then cleared, by components/FeedbackForm.tsx. */
export const REPORT_ITEM_KEY = "vp_feedback_item";

export default function ReportErrorLink({
  item,
  label = "Report an error",
  className = "small",
  style,
}: {
  /** What the veteran was looking at, e.g. "Texas: Disabled Veteran Property Tax Exemptions (Tiered)". */
  item?: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  function remember() {
    try {
      sessionStorage.setItem("vp_feedback_from", window.location.pathname);
      sessionStorage.setItem(REPORT_ITEM_KEY, JSON.stringify({ item: (item || "").slice(0, 200), at: Date.now() }));
    } catch { /* hint only - the form still opens in report mode from #report */ }
    track("feedback-error");
  }
  return (
    <Link
      href="/feedback#report"
      onClick={remember}
      className={className}
      style={style ?? (className === "small" ? { color: "var(--muted)" } : undefined)}
      aria-label={item ? `Report an error: ${item}` : undefined}
    >
      <i className="ti ti-flag-3" aria-hidden="true" /> {label}
    </Link>
  );
}
