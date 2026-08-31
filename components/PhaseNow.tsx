"use client";
// "Where you are right now" - the plan moving on its own.
//
// A returning veteran used to land on an identical dashboard no matter how much
// time had passed, even though their transition window was moving the whole
// while. This card reads their own separation date and says which phase they
// are standing in and what opens next. It is driven by the calendar, never by
// how long they have been away: there is no "you haven't visited in N days"
// here and there should never be one.
//
// It renders nothing at all without a real EAS date - we do not invent dates.
import Link from "next/link";
import { currentPhaseFor, nextPhaseIn } from "@/lib/timeline";
import { track } from "@/lib/track";

const DATE_FMT: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };

export default function PhaseNow({ easDate }: { easDate?: string }) {
  if (!easDate) return null;
  const phase = currentPhaseFor(easDate);
  const next = nextPhaseIn(easDate);
  if (!phase && !next) return null;

  // Far out from separation: no modelled phase yet, but the first one has a real
  // date, so say when the clock actually starts instead of showing nothing.
  const heading = phase ? phase.label : "Your timeline hasn't started yet";
  const detail = phase
    ? `${phase.window}${phase.dates ? ` · ${phase.dates}` : ""}`
    : "The phases below begin about a year before you separate.";

  return (
    <Link
      href="/timeline"
      onClick={() => track("phase-card")}
      className="card"
      style={{
        marginTop: 16,
        display: "flex",
        gap: 14,
        alignItems: "center",
        flexWrap: "wrap",
        textDecoration: "none",
        color: "var(--ink)",
        borderLeft: "3px solid var(--primary)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 40, height: 40, borderRadius: 10, background: "var(--chip-bg)", color: "var(--chip-ink)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
        }}
      >
        <i className="ti ti-map-pin" />
      </span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <span className="small muted" style={{ fontWeight: 600, letterSpacing: ".02em" }}>Where you are right now</span>
        <h4 style={{ margin: "2px 0" }}>{heading}</h4>
        <span className="muted small">{detail}</span>
        {next && (
          <span className="small" style={{ display: "block", marginTop: 6, color: "var(--accent-ink)", fontWeight: 600 }}>
            <i className="ti ti-arrow-right" aria-hidden="true" /> {next.label} opens {next.date.toLocaleDateString(undefined, DATE_FMT)}
            {next.days > 0 ? ` - ${next.days} day${next.days === 1 ? "" : "s"} out` : ""}
          </span>
        )}
      </div>
      <span className="small" style={{ fontWeight: 600, color: "var(--info)", display: "inline-flex", alignItems: "center", gap: 4 }}>
        See the timeline <i className="ti ti-arrow-right" aria-hidden="true" />
      </span>
    </Link>
  );
}
