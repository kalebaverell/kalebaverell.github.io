"use client";
// The opt-out switch itself. Two rules shape this component:
//  1. No dark patterns. Opting out is exactly as easy as opting back in -
//     one click either way, same prominence, no confirmation nag, no
//     "are you sure you'll miss out" copy. State privacy laws require the
//     opt-out path to be no harder than the opt-in path.
//  2. Tell the truth about the current state. While no ad platform is
//     configured (the situation today), the page says so plainly instead
//     of implying we are sharing something we are not.
import { useEffect, useState } from "react";
import { isAdOptedOut, setAdOptOut } from "@/lib/adConsent";
import { PIXELS_CONFIGURED } from "@/lib/marketing";

export default function AdOptOutControl() {
  // Server-render the neutral state, then read the device's real choice.
  const [optedOut, setOptedOut] = useState<boolean | null>(null);
  useEffect(() => setOptedOut(isAdOptedOut()), []);

  const choose = (next: boolean) => {
    setAdOptOut(next);
    setOptedOut(next);
  };

  const on = optedOut === true;

  return (
    <div className="card" style={{ marginTop: 22, borderColor: "var(--accent)", borderWidth: 2 }}>
      {!PIXELS_CONFIGURED && (
        <p className="small muted" style={{ margin: "0 0 12px" }}>
          <i className="ti ti-info-circle" aria-hidden="true" />{" "}
          <strong>As of today there is nothing to switch off.</strong> VetPath runs no advertising
          pixels at all - the only measurement on the site is an anonymous page counter that cannot
          identify anyone. You can still set your choice now and we will honor it if that ever changes.
        </p>
      )}

      <h3 style={{ marginTop: 0, marginBottom: 6 }}>
        {optedOut === null
          ? "Sharing with advertising platforms"
          : on
            ? "Sharing is off on this device"
            : "Sharing is allowed on this device"}
      </h3>
      <p className="muted" style={{ margin: "0 0 14px", lineHeight: 1.7 }}>
        {on
          ? "We will not share your visits to our public pages with any advertising platform on this device."
          : "Visits to our public marketing pages may be shared with an advertising platform so we can show you a follow-up ad. Never your answers, your rating, or your plan."}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className={on ? "btn ghost" : "btn"}
          aria-pressed={on}
          onClick={() => choose(true)}
        >
          <i className="ti ti-shield-check" aria-hidden="true" /> Do not share my information
        </button>
        <button
          type="button"
          className={on ? "btn" : "btn ghost"}
          aria-pressed={!on}
          onClick={() => choose(false)}
        >
          Allow sharing
        </button>
      </div>

      <p className="small muted" style={{ margin: "12px 0 0" }}>
        Saved on this device the moment you choose. No account, no email, no confirmation step.
      </p>
    </div>
  );
}
