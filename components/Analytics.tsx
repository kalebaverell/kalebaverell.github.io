"use client";
// Anonymous page-view counting (GoatCounter). Renders nothing; when enabled it
// loads the counter script once and reports each route change exactly once.
// Inert until lib/analytics.ts carries a site code - see the notes there, and
// never enable without the privacy page moving in the same commit.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GOATCOUNTER_CODE } from "@/lib/analytics";

declare global {
  interface Window {
    goatcounter?: { count?: (opts: { path: string }) => void; no_onload?: boolean };
  }
}

// Honor Do Not Track / Global Privacy Control - if a visitor asked not to be
// counted, they are not counted. The counter is anonymous either way, but the
// polite answer to "please don't" is "okay."
function optedOut(): boolean {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack === "1" || n.globalPrivacyControl === true;
}

export default function Analytics() {
  const path = usePathname();

  // Load the script once. `no_onload` disables its automatic first-view count
  // so the route-change effect below is the single source of counting - the
  // initial page view and client-side navigations go through the same path,
  // with no double-count on load.
  useEffect(() => {
    if (!GOATCOUNTER_CODE || optedOut()) return;
    if (document.querySelector("script[data-goatcounter]")) return;
    window.goatcounter = { no_onload: true };
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
    document.head.appendChild(s);
  }, []);

  // Count each route (the script itself skips localhost, so local QA runs and
  // the dev server never pollute the numbers). Poll briefly on first paint in
  // case the script is still arriving.
  useEffect(() => {
    if (!GOATCOUNTER_CODE || optedOut() || !path) return;
    if (window.goatcounter?.count) {
      window.goatcounter.count({ path });
      return;
    }
    const poll = setInterval(() => {
      if (window.goatcounter?.count) {
        window.goatcounter.count({ path });
        clearInterval(poll);
      }
    }, 250);
    const stop = setTimeout(() => clearInterval(poll), 6000);
    return () => { clearInterval(poll); clearTimeout(stop); };
  }, [path]);

  return null;
}
