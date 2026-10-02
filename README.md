# VetPath

**A clear gameplan for life after service.** Live at https://vetpathusa.com

VetPath is a free planning tool for U.S. veterans and transitioning service members. A veteran
answers a short intake and gets a personal 30/60/90-day plan: the federal and state benefits worth
checking, civilian careers that fit, how to pay for the training, and the separation deadlines that
do not forgive.

> **VetPath is a planning and education tool - not the VA, a law firm, or an accredited claims
> representative, and not affiliated with any government agency.** It never determines eligibility.
> Confirm everything at the official source linked on each card, or with an accredited representative
> (VA's search: https://www.va.gov/get-help-from-accredited-representative/find-rep/).
> In crisis? Dial **988**, then press **1**.

## Where the data comes from

Benefit and career content is verified against official sources and dated, and every item links to
the page it came from.

| Data | Official sources | File |
|---|---|---|
| State benefits, all 50 states and D.C. | State veterans agencies and statutes | `data/stateBenefits.json` |
| Federal benefit categories | VA.gov, DOL VETS, SBA, Veterans Crisis Line | `data/sampleBenefits.json` |
| Career pay and outlook | BLS Occupational Outlook Handbook, O*NET | `data/sampleCareers.json` |
| Relocation cost, rent, jobs, VA facility | BEA, HUD, BLS, VA | `data/relocationMetros.json` (`official` blocks) |
| Funding programs | VA, StudentAid.gov, OPM, SBA, and each program's own site | `data/funding.json` |
| Reserve and Guard benefits | VA.gov, TRICARE, DOL, U.S. Code, state Guard pages and statutes | `data/reserves.json` |
| Transition deadlines | VA.gov, DoD TAP, DOL, TRICARE | `lib/timeline.ts` |

Each dataset carries a last-verified date that the site shows. Re-verification runs quarterly
(January, April, July, October); reports live in `docs/refresh-reports/`. `npm run build` first runs
`scripts/check-freshness.mjs`, which fails the build if any verification date is more than 100 days old.

**Still illustrative, and labeled that way on the site:** relocation comparison tiers (the 1-5 ratings)
and starter-home notes, the location examples in `data/sampleLocations.json`, and the college-credit
examples in `data/sampleCreditMap.json`. Some file names begin with `sample` for historical reasons;
the `_note` at the top of each data file says what it is.

## No AI

Plans, fit scores, and benefit tiers come from fixed rules anyone can read (`lib/rules.ts`,
`lib/pathfinder.ts`, `lib/optimizer.ts`, `lib/timeline.ts`). There is no language model in the product.

## Running it

Requires Node.js 18.17+ (CI uses Node 20).

    npm install
    npm run dev        # http://localhost:3000
    npm run build      # freshness check, then a static export to ./out

Accounts and saved plans use Supabase. Without `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` the app runs in a local-only mode. See `SUPABASE-SETUP.md`.

`demo/vetpath-demo.html` is a single-file offline demo for meetings. Its data is a July 2026
snapshot; the live site is the current source.

## Deploying

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the static export and publishes
it to GitHub Pages. See `DEPLOY.md`.

## Safety boundary
This product is strictly for veteran life planning, benefits education, transition support,
and resource navigation. It intentionally excludes weapons, tactical training, paramilitary
or militia content, and political organizing.
