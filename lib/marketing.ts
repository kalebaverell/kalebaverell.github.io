// Retargeting pixel configuration - INERT until an ID is set.
//
// Both IDs empty means components/MarketingPixels.tsx renders nothing and
// no ad-platform script ever loads. This mirrors the GoatCounter pattern
// in lib/analytics.ts: the capability ships dark, activation is a single
// deliberate edit.
//
// ACTIVATION IS A PAIRED COMMIT, ON PURPOSE. The privacy page currently
// promises "no advertising scripts, tracking pixels, or cross-site
// tracking," and the printed VSO one-pager promises "no ads." Setting an
// ID here without moving those in the same commit makes both into lies.
// The full checklist - account creation (Kaleb's step, we never create
// accounts), privacy rewrite, Do Not Sell/Share opt-out link, one-pager
// reprint, telling Frank - lives in docs/ads-activation-runbook.md.
export const META_PIXEL_ID = "";
export const GOOGLE_ADS_TAG_ID = "";

// The only routes where a pixel may ever load. Marketing surfaces only -
// pages where veterans answer questions about disability, health, housing,
// or family (onboarding, dashboard, pathfinder, benefits, plan, profile)
// must NEVER carry an ad pixel. Widening this list is a privacy-page
// change, not a config tweak.
export const PIXEL_ALLOWED_ROUTES = ["/", "/trust"];

// True once any ad platform is configured. Drives the visitor-facing
// opt-out link: a "Do Not Sell or Share" control is required once we share
// visit data with an ad platform, and is only confusing before that, when
// there is nothing to switch off.
export const PIXELS_CONFIGURED = Boolean(META_PIXEL_ID || GOOGLE_ADS_TAG_ID);
