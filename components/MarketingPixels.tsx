"use client";
// Retargeting pixel loader. Inert today: both IDs in lib/marketing.ts are
// empty, so this renders nothing and injects nothing. When an ID is set
// (see docs/ads-activation-runbook.md for everything that must move in
// that same commit), the rules below are enforced in order:
//
//  1. Marketing routes only (PIXEL_ALLOWED_ROUTES). The script tag itself
//     is injected only while the visitor is on an allowlisted route, and
//     page events fire only there. Pages where veterans enter disability,
//     health, or housing answers never load or ping a pixel. Those answers
//     also never appear in URLs, so a pixel cannot see them indirectly.
//  2. Do Not Track / Global Privacy Control wins, silently - same signal
//     handling as the anonymous page counter in components/Analytics.tsx.
//  3. localhost never loads pixels.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, GOOGLE_ADS_TAG_ID, PIXEL_ALLOWED_ROUTES } from "@/lib/marketing";

function optedOut(): boolean {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack === "1" || n.globalPrivacyControl === true;
}

// Static export serves /trust/ with a trailing slash; compare normalized.
const norm = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);

export default function MarketingPixels() {
  const pathname = usePathname();

  useEffect(() => {
    if (!META_PIXEL_ID && !GOOGLE_ADS_TAG_ID) return; // inert until configured
    if (!PIXEL_ALLOWED_ROUTES.includes(norm(pathname || "/"))) return;
    if (optedOut()) return;
    if (window.location.hostname === "localhost") return;

    if (META_PIXEL_ID && !document.getElementById("vp-meta-pixel")) {
      const s = document.createElement("script");
      s.id = "vp-meta-pixel";
      // Standard Meta base code with automatic configuration disabled, so
      // the pixel fires only the events we send it, only on these routes.
      s.innerHTML =
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?` +
        `n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;` +
        `n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;` +
        `t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}` +
        `(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
        `fbq('set','autoConfig',false,'${META_PIXEL_ID}');` +
        `fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`;
      document.head.appendChild(s);
    } else if (META_PIXEL_ID) {
      const w = window as Window & { fbq?: (...a: unknown[]) => void };
      w.fbq?.("track", "PageView");
    }

    if (GOOGLE_ADS_TAG_ID && !document.getElementById("vp-google-tag")) {
      const loader = document.createElement("script");
      loader.id = "vp-google-tag";
      loader.async = true;
      loader.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG_ID}`;
      document.head.appendChild(loader);
      const init = document.createElement("script");
      init.innerHTML =
        `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}` +
        `gtag('js',new Date());gtag('config','${GOOGLE_ADS_TAG_ID}',{send_page_view:true});`;
      document.head.appendChild(init);
    }
  }, [pathname]);

  return null;
}
