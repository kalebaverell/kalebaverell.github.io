# Donations activation runbook

The /support page shipped live with contributions INERT (lib/support.ts,
`DONATE_URL = ""`). In that state the page shows an email path instead of
a card button, so nothing on the site is broken or waiting. Activation is
one paste - but the order below matters.

## Why it ships dark

- Creating the payment account means credentials and bank details -
  Kaleb's hands only, never Claude's.
- Until the Texas LLC and its bank account exist (September calendar),
  payouts from any processor land in Kaleb's PERSONAL account and are
  personal income to him at tax time. Activating after the business bank
  account exists is materially cleaner. Activating before is legal, just
  messier - his call, eyes open.

## Activation checklist (in order)

1. **Preferably after**: LLC filed -> EIN -> business bank account
   (September plan). If activating earlier, know the payout lands
   personally.
2. Create the payment surface. Two good shapes:
   - **Stripe Payment Link** (recommended once the LLC exists): a single
     no-code link with preset amounts. Stripe accounts require entity +
     bank details.
   - **Ko-fi or Buy Me a Coffee** (fine interim): supporter-tipping
     platforms, personal payouts, lower setup friction. Avoid presenting
     as "donations to a charity" - our page copy already handles this.
3. Paste the link into `lib/support.ts` -> `DONATE_URL`. That single edit
   swaps the email path for a "Contribute securely" button that opens in
   a new tab.
4. Build + deploy as usual. No other file changes needed.
5. Tell Frank the page is live so he answers questions consistently.

## Copy rules that survive any rewording (from the site's standing rules)

- DECIDED (Kaleb, Aug 20, 2026): the ask is simply "support the
  mission" - the page and checkout carry NO charity/tax-deductibility
  disclaimers. Do not re-add them. The line that must never be crossed
  is implying the opposite: never say or suggest tax-deductible,
  nonprofit, or charity. Flagged as a one-question item for the
  attorney during September LLC formation.
- Contributions buy nothing, unlock nothing, and never touch veteran
  data. Free-for-veterans is a promise the donate ask must reinforce,
  not undermine.
- No fabricated numbers: no invented costs, donor counts, or impact
  stats. When real figures exist (e.g., "hosting costs $X/yr"), cite
  them honestly or say nothing.
- Never present as the VA or government-affiliated - the page carries
  the standard disclaimer.
- If the ask ever appears in printed material or social posts, the
  not-tax-deductible line travels with it.

## Charitable-solicitation note (why the wording is careful)

Many states regulate soliciting "charitable donations"; a for-profit
asking for support is fine, but presenting as a charity without
registering is not. The page therefore asks supporters to "chip in
toward the costs" of a free tool and labels VetPath an independent
project. Keep that frame. If VetPath ever forks a real 501(c)(3), this
page gets rewritten with counsel, not before.
