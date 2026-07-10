# VetPath — Benefits Research Notes

> **Status:** Prototype with VERIFIED benefit content. Last updated 2026-07-10.

---

## Data Refresh Cadence (adopted 2026-07-10)

As of July 2026 the prototype's benefit content is no longer all sample data:
- **State benefits:** 51/51 jurisdictions, 259 programs, researched from official state sources with
  per-state `lastVerified` dates and per-program source URLs (`data/stateBenefits.json`).
- **Federal categories:** all 11 verified against VA.gov/DOL/SBA with `lastVerified` + `sources`
  (`data/sampleBenefits.json`).
- **Careers:** BLS OOH May-2024 medians and 2024–34 projections + O*NET links (`data/sampleCareers.json`).
- **Family programs:** verified rules (PCAFC 70%+, DEA/Ch35, transfer-while-serving, CHAMPVA P&T)
  (`data/familyResources.json`).
- **Still illustrative:** relocation cost/safety/business tiers (official anchors — BEA RPP, HUD FMR,
  BLS unemployment, VAMC identification — being gathered into `data/research/reloc-batch*.json`).

**The cadence — quarterly re-verification (Jan / Apr / Jul / Oct):**
1. Re-run the state research fleet per `scripts/research-runbook.md` (10 batches, incremental saves);
   merge with `node scripts/merge-states.mjs`; diff against the previous `stateBenefits.json` and
   review changes by hand before shipping.
2. Re-verify the 11 federal categories against their `sources` URLs (one agent, incremental saves);
   update texts + `lastVerified`.
3. Refresh BLS medians/outlooks when BLS publishes new OOH data (annually, ~spring) and re-check the
   four "pending" claim checks (FMCSA waiver, FAA A&P crediting, Helmets to Hardhats, SBA VetCert).
4. Bump every `lastVerified`; the UI displays these dates — stale dates are a visible product bug.
5. **Owner:** unassigned (decide at the Frank working session). **Trigger discipline:** any user
   report of an incorrect benefit gets a 48-hour verify-and-fix, not batched to the quarter.

---

## ⚠️ Critical Notice — Remaining SAMPLE Data

**Every benefit shown in the VetPath prototype is SAMPLE/DEMO data.** It exists to demonstrate the product experience, not to provide accurate, current, or personalized benefit determinations. It is labeled "SAMPLE DATA" in the app.

VetPath **does not**:
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
