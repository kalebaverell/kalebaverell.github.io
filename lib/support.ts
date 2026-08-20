// Supporter contributions - INERT until a payment link is set.
//
// Empty DONATE_URL means /support renders its interim state: an email
// path instead of a card button. This mirrors lib/marketing.ts: the
// capability ships dark, activation is a single deliberate edit.
//
// ACTIVATION IS KALEB'S STEP, ON PURPOSE. Creating the payment account
// (Stripe Payment Link, Ko-fi, etc.) means credentials and payouts, and
// before the Texas LLC + business bank account exist, payouts land as
// personal income. The full checklist lives in
// docs/donations-activation-runbook.md - read it before pasting a URL.
//
// Copy constraint carried by app/support/page.tsx: VetPath is not a
// charity or 501(c)(3) and contributions are NOT tax-deductible. Any
// wording change on that page keeps those two facts stated plainly.
// Live Stripe Payment Link "Support the mission" (customers choose what
// to pay; $25 preset, $5 min), created Aug 20, 2026 in Kaleb's account.
export const DONATE_URL = "https://buy.stripe.com/eVq4gzadsdnQ5OL4rMbwk00";

export const DONATE_CONFIGURED = Boolean(DONATE_URL);

export const SUPPORT_EMAIL = "kaleb@vetpathusa.com";
