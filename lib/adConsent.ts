// Visitor-level advertising opt-out.
//
// Several state privacy laws (California, Colorado, Connecticut, Texas, and
// others) treat sharing site-visit data with an ad platform for targeted
// advertising as something a person must be able to switch off, through a
// clearly labeled link and without dark patterns. This module is that
// switch: a single first-party flag, honored by components/MarketingPixels
// before any ad script is injected.
//
// It is separate from Do Not Track / Global Privacy Control, which the
// pixel loader also honors. Those are browser-level signals; this is an
// explicit choice made on our own site, and it wins for that visitor on
// that device forever.
export const AD_OPT_OUT_KEY = "vp-ad-opt-out";

export function isAdOptedOut(): boolean {
  try {
    return localStorage.getItem(AD_OPT_OUT_KEY) === "1";
  } catch {
    // If storage is unavailable we cannot prove the visitor opted in, so
    // fail closed: no pixel. Privacy defaults must never depend on storage.
    return true;
  }
}

export function setAdOptOut(optedOut: boolean): void {
  try {
    if (optedOut) localStorage.setItem(AD_OPT_OUT_KEY, "1");
    else localStorage.removeItem(AD_OPT_OUT_KEY);
  } catch {
    /* nothing we can do; the read path fails closed */
  }
}
