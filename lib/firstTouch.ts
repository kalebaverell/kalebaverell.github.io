// First-touch campaign attribution, first-party only.
//
// When a visitor first lands from a tagged link (?utm_campaign=vso on the
// post one-pager QR, ?utm_campaign=tx-checklist on the checklist, a future
// ad, an email) - or from any outside referrer - we record which outreach
// brought them: campaign tag, source, referring site, landing page, and
// when. It is stored in localStorage on their device and leaves the device
// exactly once: if they create an account, ProfileSync copies it to their
// profile row so we can tell which flyers, QR codes, and partners actually
// bring veterans in.
//
// Rules this module must keep:
//  - First touch wins. Never overwrite an existing capture.
//  - First-party only. No cookies, nothing readable by any other site.
//  - Disclosed on /privacy (the account-storage list). If what this
//    captures ever grows, that page moves in the same commit.
export type FirstTouch = {
  campaign: string | null;
  source: string | null;
  medium: string | null;
  ref: string | null;
  referrer: string | null;
  landing: string;
  at: string;
};

const KEY = "vp-first-touch";

// Caps stray/malicious query values so junk can't bloat the profile row.
const clean = (v: string | null) => (v ? v.slice(0, 120) : null);

// Auth and infrastructure hosts must never claim first touch: the return leg
// of an OAuth sign-in arrives with accounts.google.com as the referrer, and
// letting it through masks wherever the person actually came from (week-two
// snapshot: 2 of 7 signups attributed to the Google redirect, 0 to the real
// channel).
const INFRA_REFERRERS = [
  "accounts.google.com",
  "appleid.apple.com",
  "login.microsoftonline.com",
  "supabase.co",
];

// Facebook's and Instagram's in-app browsers strip document.referrer, which
// erased the week-two Facebook wave from attribution. Their user agents carry
// stable markers, so when a landing has no signal at all we can still record
// the channel (just the channel - no campaign, nothing new about the person).
function inAppSource(): string | null {
  const ua = navigator.userAgent || "";
  if (/FB_IAB|FBAN|FBAV/.test(ua)) return "facebook-inapp";
  if (/Instagram/.test(ua)) return "instagram-inapp";
  return null;
}

export function captureFirstTouch(): void {
  try {
    if (localStorage.getItem(KEY)) return; // first touch wins
    const q = new URLSearchParams(window.location.search);
    const campaign = clean(q.get("utm_campaign") || q.get("campaign"));
    let source = clean(q.get("utm_source"));
    const medium = clean(q.get("utm_medium"));
    const ref = clean(q.get("ref"));
    let referrer =
      document.referrer && !document.referrer.startsWith(window.location.origin)
        ? document.referrer.slice(0, 200)
        : null;
    if (referrer && INFRA_REFERRERS.some((h) => referrer!.includes(h))) referrer = null;
    // No tag and no usable referrer: an in-app browser marker is the last
    // remaining signal worth keeping.
    if (!campaign && !source && !ref && !referrer) source = inAppSource();
    // Untagged direct visit: capture nothing, so a later visit that DOES
    // carry a tag (they kept the flyer) can still claim first touch.
    if (!campaign && !source && !ref && !referrer) return;
    const ft: FirstTouch = {
      campaign,
      source,
      medium,
      ref,
      referrer,
      landing: window.location.pathname,
      at: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(ft));
  } catch {
    // Storage unavailable (private mode, hard quotas): attribution is
    // best-effort and must never break the page.
  }
}

export function readFirstTouch(): FirstTouch | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}
