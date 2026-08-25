"use client";
// One-time home-screen nudge, mobile only, shown after a plan exists. Android
// Chrome gets the real install prompt via beforeinstallprompt; iOS Safari has
// no prompt API, so it gets the two-step instruction instead. Dismissal is
// permanent - this card appears once, never again. Encourage, never nag.
import { useEffect, useState } from "react";
import { track } from "@/lib/track";

const KEY = "vp_install_nudge_done";

export default function InstallNudge() {
  const [mode, setMode] = useState<"hidden" | "android" | "ios">("hidden");
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
      if (window.matchMedia("(display-mode: standalone)").matches) return; // already installed
      if (!window.matchMedia("(max-width: 920px)").matches) return; // mobile-sized screens only
      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIos) { setMode("ios"); return; }
      const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e); setMode("android"); };
      window.addEventListener("beforeinstallprompt", onPrompt);
      return () => window.removeEventListener("beforeinstallprompt", onPrompt);
    } catch { /* never let a nudge break the dashboard */ }
  }, []);

  if (mode === "hidden") return null;

  const dismiss = () => { try { localStorage.setItem(KEY, "1"); } catch {} setMode("hidden"); };
  const install = async () => {
    try {
      if (deferred) {
        deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice?.outcome === "accepted") track("install-accepted");
      }
    } catch { /* declined or unsupported - nothing to do */ }
    dismiss();
  };

  return (
    <div className="card" style={{ marginTop: 16, display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
      <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        <i className="ti ti-map-check" />
      </span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h4 style={{ margin: "0 0 4px" }}>Keep your plan one tap away</h4>
        {mode === "ios" ? (
          <p className="muted small" style={{ margin: 0 }}>
            Add VetPath to your home screen: tap <strong>Share</strong> in Safari, then <strong>Add to Home Screen</strong>. No app store, nothing to download.
          </p>
        ) : (
          <p className="muted small" style={{ margin: 0 }}>
            Put VetPath on your home screen - it opens like an app, and your plan is right there. No app store, nothing to download.
          </p>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          {mode === "android" && (
            <button type="button" className="btn sm" onClick={install}><i className="ti ti-map-check" aria-hidden="true" /> Add to home screen</button>
          )}
          <button type="button" className="btn ghost sm" onClick={dismiss}>{mode === "ios" ? "Got it" : "No thanks"}</button>
        </div>
      </div>
    </div>
  );
}
