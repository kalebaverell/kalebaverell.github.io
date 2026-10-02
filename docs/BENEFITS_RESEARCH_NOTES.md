# VetPath — Benefits Research Notes

> **Status:** Live product with verified, dated benefit content. Latest runs: docs/refresh-reports/refresh-2026-10-01.md and refresh-2026-10-02.md.

---

## Data Refresh Cadence (adopted 2026-07-10)

What is verified, and what is still illustrative:
- **State benefits:** all 50 states and D.C., researched from official state sources, one `lastVerified`
  stamp and a source URL per program (`data/stateBenefits.json`). The site computes the program count from the file.
- **Federal categories:** each verified against VA.gov/DOL/SBA with `lastVerified` + `sources` (`data/sampleBenefits.json`).
- **Careers:** BLS OOH May 2025 medians and 2025-35 projections + O*NET links (`data/sampleCareers.json`, `lastVerified`).
- **Funding and Reserves:** `data/funding.json`, `data/reserves.json`, full-date `lastVerified`.
- **Family programs:** verified rules with per-entry `verified` dates (`data/familyResources.json`).
- **Still illustrative:** relocation 1-5 tiers and starter-home notes (the BEA/HUD/BLS/VA datapoints beside them
  are cited), location examples (`data/sampleLocations.json`), college-credit examples (`data/sampleCreditMap.json`).

**The cadence — quarterly re-verification (Jan / Apr / Jul / Oct):**
1. Re-run the state research fleet per `scripts/research-runbook.md` (10 batches, incremental saves);
   merge with `node scripts/merge-states.mjs`; diff against the previous `stateBenefits.json` and
   review changes by hand before shipping.
2. Re-verify the 11 federal categories against their `sources` URLs (one agent, incremental saves);
   update texts + `lastVerified`.
3. Refresh BLS medians/outlooks when BLS publishes new OOH data (annually, ~spring) and re-check the
   four "pending" claim checks (FMCSA waiver, FAA A&P crediting, Helmets to Hardhats, SBA VetCert).
4. Bump every `lastVerified`; the UI displays these dates — stale dates are a visible product bug.
5. **Owner:** Kaleb Averell (runs each refresh and signs off the diff; named publicly on /verification). **Enforcement:** `scripts/check-freshness.mjs`
   runs before every build and fails it when any verification date is over 100 days old (warns past 90); a weekly
   scheduled workflow runs the same check when nothing is pushed. **Trigger discipline:** any user
   report of an incorrect benefit gets a 48-hour verify-and-fix, not batched to the quarter.
   After every refresh, also update the VERIFIED constant in the send-checkins edge function
   (source: `supabase/functions/send-checkins/index.ts`).
   Error reports arrive in `public.feedback` with a body starting `[Error report]`.
6. **Log it publicly:** add the run to `data/verificationLog.json` (date, what was checked, report
   path or commit), add every correction that changes what a veteran is told, and move anything
   unconfirmed to `open`. Never delete a correction.

---

## What VetPath does not do

VetPath shows benefit information verified against official sources and dated. It does not:
- Guarantee eligibility for any benefit.
- Provide legal, medical, or financial advice.
- Act as the VA, an accredited VSO, a law firm, or a claims agent.

VetPath **always** directs veterans to **official sources** and **accredited help** to verify eligibility and take action.

---

## 1. Official Sources to Use for the Real Version

| Domain | Official source | Use for |
|---|---|---|
| **General benefits** | **VA.gov** (includes functions formerly on eBenefits) | Authoritative benefits info, applications, records. |
| **State benefits** | **Your state Department of Veterans Affairs** | State-specific benefits (property tax, tuition, licensing, etc.). |
| **Entrepreneurship** | **SBA veteran business resources** — Veterans Business Outreach Centers (**VBOC**), **Boots to Business** | Starting/growing a veteran-owned business. |
| **Employment** | **U.S. Dept. of Labor VETS** + **American Job Centers** | Job search, employment rights (USERRA), placement. |
| **Education** | **VA Education** — GI Bill programs and **VR&E (VA Readiness & Employment, "Chapter 31")** | Tuition, training, career readiness. |
| **Housing** | **VA Home Loan program** | Home loan guaranty, Certificate of Eligibility. |
| **Claims / advocacy** | **Accredited VSOs** — VFW, American Legion, DAV, and **county veteran service officers (CVSOs)** | Free, accredited help filing/appealing claims. |
| **Crisis support** | **Veterans Crisis Line** — dial **988, then press 1** (or text **838255**) | Immediate mental-health crisis support. |

> Always link to the **official** page and encourage the veteran to confirm details there. Program names, amounts, and rules change.

---

## 2. Research Task List (Future / Real Version)

| Task | Detail |
|---|---|
| **Per-benefit eligibility rules** | Document real eligibility criteria per benefit, sourced and cited; encode as data, not prose. |
| **Per-state benefits matrix** | Build a state-by-state matrix (all 50 states + territories) of veteran benefits with source links. |
| **Keeping data current** | Define a refresh cadence; assign owners; monitor official-source changes. |
| **Citation + last-verified dates** | Every benefit record carries `source`, `sourceUrl`, and `lastVerified` (ISO date). Show these in the UI. |
| **Change log** | Track when a benefit's data changed and why. |
| **Editorial/legal review** | Review copy for the non-advice boundary and accuracy before publishing. |
| **Accessibility of language** | Plain-language pass for older-veteran readability. |

**Suggested data record shape (real version):**

```jsonc
{
  "id": "va-home-loan",
  "title": "VA Home Loan (Guaranty)",
  "category": "home",
  "summary": "Helps eligible veterans obtain a home loan...",
  "eligibilityNotes": "General guidance only — verify at official source.",
  "documents": ["Certificate of Eligibility (COE)", "DD-214", "income documents"],
  "source": "U.S. Department of Veterans Affairs",
  "sourceUrl": "https://www.va.gov/housing-assistance/home-loans/",
  "lastVerified": "2026-07-06"
}
```

---

## 3. Prominent Warnings (Must Appear in the Product)

- **"SAMPLE DATA"** badge on every benefit in the prototype.
- **"VetPath is not the VA"** and **"we do not guarantee eligibility."**
- **"Verify eligibility at the official source"** with a direct link on every benefit.
- **"For claims and appeals, work with a free accredited VSO"** (VFW, American Legion, DAV, or your county veteran service officer).
- **Disability content:** careful, **non-legal** orientation only; always recommend accredited help.
- **Crisis:** **Veterans Crisis Line — dial 988, then press 1** (text 838255), shown prominently.

> **Boundary reminder:** VetPath is strictly for veteran life planning, benefits education, transition support, and resource navigation. It never includes weapons, tactical training, paramilitary/militia, political organizing, or extremist content.
