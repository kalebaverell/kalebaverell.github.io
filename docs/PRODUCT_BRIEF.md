# VetPath — Product Brief

> **BRAND:** `VetPath` (working name, stored as a single config value `BRAND` — easy to rename later).
> **Status:** Prototype / demo. Last updated 2026-07-06.

> **IMPORTANT — What VetPath is NOT:** VetPath is a demo and education tool. It is **not** the U.S. Department of Veterans Affairs (VA), a law firm, a claims agent, a financial advisor, or an accredited Veterans Service Organization (VSO). **All benefit data in the prototype is SAMPLE/DEMO data** and is labeled as such throughout the app. Eligibility must always be verified through official sources.

---

## 1. Product Summary

VetPath is a calm, professional web app that helps U.S. veterans turn the benefits and transition information they *already* hear about into a **personalized strategic life plan** — a "gameplan." A veteran answers a short intake (life stage, state, age, goals, needs, veteran status), and VetPath produces a prioritized, plain-language plan with **30 / 60 / 90-day action steps**, the documents to gather, the official resources to verify eligibility with, and a clear "why this matters" for each recommendation.

VetPath **complements** — it does not replace — VA.gov, VSOs, the Transition Assistance Program (TAP), and state veteran affairs agencies. It is the "so what do I actually do next?" layer that sits on top of official information.

---

## 2. Problem Statement

Veterans repeatedly encounter the same benefits information — at TAP briefings, VSO meetings, base transition offices, and local veteran gatherings (like Frank's meetings). They hear about the GI Bill, VA home loans, disability compensation, and SBA resources over and over.

**But they leave without a personalized gameplan.** The information is:

- **Generic** — presented to a room, not tailored to one veteran's stage, state, and goals.
- **Fragmented** — spread across many agencies, sites, and offices.
- **Overwhelming** — lots of programs, acronyms, and eligibility caveats with no clear "start here."
- **Not action-oriented** — a veteran knows a benefit *exists* but not the concrete next 3 steps to pursue it.

The result: capable veterans miss benefits, delay transitions, and feel like they are navigating alone. VetPath translates repeated general information into a specific, prioritized, verifiable plan.

---

## 3. Target Audience

**Primary emphasis (build for these first):**

| Segment | Who they are | Core need |
|---|---|---|
| **Transitioning service members (0–24 months from separation)** | Active-duty members preparing to separate or recently separated | A clear transition checklist: benefits review, employment, resume, housing, education, healthcare enrollment |

**Also served (any life stage):**

| Segment | Who they are | Core need |
|---|---|---|
| **Mid-career veterans** | Separated years ago, working or job-changing | Education, entrepreneurship, financial wellness, career advancement |
| **Disability-navigating veterans** | Managing service-connected conditions or filing/appealing | Careful, non-legal orientation + a warm handoff to an **accredited VSO** |
| **Retiring / older veterans** | Approaching or in retirement | Retirement benefits, healthcare, long-term resources, high-readability guidance |
| **Spouses & family members** | Dependents and caregivers | Family benefits, education transfer, survivor resources, caregiver support |

Design must be **high-readability and accessible for older veterans** (min 16px body text, calm layout, plain language).

---

## 4. Core Value Proposition

**"You've heard the information. VetPath turns it into your plan."**

- **Personalized, not generic** — a plan built from *your* stage, state, age, goals, and needs.
- **Actionable** — prioritized 30/60/90-day steps, not a wall of programs.
- **Trustworthy** — every recommendation points to an **official source to verify** and never guarantees eligibility.
- **Calm and credible** — dashboard-like, readable, respectful; no military clichés, no aggressive patriotic styling.
- **Complementary** — routes veterans *to* VA.gov, VSOs, SBA, DOL VETS, and state agencies rather than competing with them.

---

## 5. MVP Scope — The 8 Screens

| # | Screen | Purpose |
|---|---|---|
| 1 | **Landing** | Explain the value in one screen; set the "demo / sample data" expectation; CTA to start. |
| 2 | **Mocked Profile + Onboarding Intake** | Light mocked profile (first name / email in localStorage, no password), then the intake questions (life stage, state, age, veteran status, goals, needs). |
| 3 | **Gameplan Dashboard** | The generated, prioritized gameplan: top priorities, 30/60/90 plan, benefit categories, progress. |
| 4 | **Benefits & Resources Library** | Browsable/filterable sample benefits with "SAMPLE DATA — verify at official source" labels and links. |
| 5 | **Goal Planning** | Add/edit goals (buy a home, education, start a business, employment, wellness, retirement); see mapped pathways. |
| 6 | **Action Plan / Checklist** | Actionable checklist of 30/60/90 items with documents to gather and status tracking. |
| 7 | **Profile** | View/edit intake answers and mocked profile; re-run the gameplan. |
| 8 | **Admin / Strategy** | Internal view: rules-engine logic, data sources, monetization strategy, demo notes (for founder/demo use). |

---

## 6. Non-Goals (Explicit Boundaries)

VetPath will **not**:

- Present itself as the VA, an accredited VSO, a law firm, or a claims/benefits agent.
- **Guarantee eligibility** for any benefit — it always directs users to official verification.
- Provide **legal, medical, or financial advice**, or file claims on a veteran's behalf.
- Use real veteran benefit determinations — **all prototype benefit data is SAMPLE data**.
- Include **weapons, tactical training, paramilitary activity, political organizing, extremist activity, or militia content**. VetPath is strictly for veteran life planning, benefits education, transition support, and resource navigation. Focus stays on veterans, families, benefits, goals, wellness, career, education, housing, entrepreneurship, retirement, and community support.

If a user is in crisis, VetPath surfaces the **Veterans Crisis Line: dial 988, then press 1** (or text 838255).

---

## 7. Product Risks

| Risk | Description | Mitigation |
|---|---|---|
| **Mistaken authority** | Users think VetPath is the VA or gives official determinations. | Persistent "demo / not the VA" disclaimer; "verify at official source" on every benefit; no eligibility guarantees. |
| **Stale / wrong benefit data** | Benefits change; sample data misleads. | Label all data SAMPLE; last-verified dates in the real version; citations to official sources. |
| **Liability from advice** | Perceived legal/medical/financial guidance. | Non-goals enforced in copy; careful disability language; warm handoff to accredited VSOs. |
| **Sensitive data exposure** | Disability rating, health, finances are sensitive. | Data minimization; local-first prototype (localStorage); encryption + consent in future backend; never sell data. |
| **Boundary drift** | Content creep toward tactical/political/militia material. | Hard product boundary documented and enforced in content review. |
| **Over-promising in demo** | Demo polish implies a finished product. | Clearly label prototype status; roadmap for real data pipeline and verification. |
| **Accessibility gaps** | Older veterans struggle with small text / dense UI. | Mobile-first, 16px+ body, high contrast, calm layout, plain language. |
