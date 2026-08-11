// Privacy-safe page-view counting via GoatCounter (goatcounter.com):
// open source, no cookies, no fingerprinting, no personal identifiers,
// no cross-site tracking. It records that a page was viewed - path,
// referrer, browser family, and country-level region - in aggregate.
//
// ACTIVATION IS A TWO-PART COMMIT, ON PURPOSE. The privacy page currently
// promises "no analytics on this site," which is true while this constant
// is empty (the component renders nothing and no script ever loads).
// To turn counting on:
//   1. Kaleb creates the free GoatCounter account and picks a site code.
//   2. Set that code here (e.g. "vetpath" for vetpath.goatcounter.com).
//   3. In the SAME commit, update app/privacy/page.tsx: the "what we do
//      not do" analytics line, the "who else touches your data" list
//      (GoatCounter joins it), and the anonymous-counting section.
// Never flip this on without the privacy page moving with it.
export const GOATCOUNTER_CODE = "";
