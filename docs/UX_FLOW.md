# VetPath — UX Flow

> **Status:** Prototype. Last updated 2026-07-06.
> **Reminder:** All benefit data is SAMPLE data. VetPath is not the VA and does not guarantee eligibility. Every recommendation points to an official source to verify.

---

## 1. User Journey (End to End)

```
Landing ──▶ Mocked profile ──▶ Onboarding intake ──▶ Gameplan generated
   │                                                        │
   └──────────────── learn "demo / sample data" ────────────┘
                                                            ▼
      Gameplan Dashboard ◀──▶ Benefits Library
             │                     │
             ▼                     ▼
      Goal Planning ──▶ Action Plan / Checklist ──▶ Profile (edit & re-run)
                                                            │
                                                            ▼
                                            Admin / Strategy (internal)
```

A veteran arrives, sees clearly this is a **demo with sample data**, creates a light mocked profile, answers a short intake, and immediately receives a **personalized, prioritized gameplan** with 30/60/90 actions. From there they explore benefits, refine goals, work the checklist, and can edit their profile to regenerate the plan.

---

## 2. Screen-by-Screen (All 8 Screens)

### 1) Landing
- **Purpose:** Explain the value in one calm screen and set expectations.
- **Content:** Value line ("You've heard the information. VetPath turns it into your plan."), 3 benefit bullets, primary CTA ("Build my gameplan"), and a persistent **demo / sample-data / not-the-VA** disclaimer.
- **Exit:** CTA → Mocked profile.

### 2) Mocked Profile + Onboarding Intake
- **Mocked profile:** first name + email only, stored in `localStorage`, **no password**. Framed as "so we can save your plan on this device."
- **Intake:** short branching questionnaire (see §3).
- **Exit:** Submitting intake triggers gameplan generation → Dashboard.

### 3) Gameplan Dashboard
- **Purpose:** The payoff — the personalized plan.
- **Content:** Top priorities (ranked with "why this matters"), 30/60/90 plan preview, benefit categories relevant to the veteran, progress bar, quick links to Benefits, Goals, Action Plan.
- **Every benefit reference** carries a "SAMPLE — verify at [official source]" note.

### 4) Benefits & Resources Library
- **Purpose:** Browse/filter the sample benefits catalog.
- **Content:** Filter by category (home, education, business, employment, wellness, retirement, disability, financial) and state. Each card: plain-language summary, documents to gather, and **official source link to verify**. "SAMPLE DATA" badge on every card.

### 5) Goal Planning
- **Purpose:** Add/edit goals and see mapped pathways.
- **Content:** Goal chips (buy a home, education, start a business, employment, wellness, retirement, family, financial). Selecting a goal reveals its pathway and rationale. Changing goals updates the gameplan.

### 6) Action Plan / Checklist
- **Purpose:** Do the work.
- **Content:** Actions grouped by **30 / 60 / 90 days**, each with documents to gather, a "verify at" link, and a checkbox. Progress reflected on the Dashboard.

### 7) Profile
- **Purpose:** View/edit intake answers and mocked profile; **re-run the gameplan**.
- **Content:** Editable life stage, state, age, veteran status, goals, needs; "Regenerate plan" action.

### 8) Admin / Strategy (Internal)
- **Purpose:** Demo/founder view.
- **Content:** The rules-engine logic, data sources, monetization strategy summary, and demo notes. Not part of the veteran journey.

---

## 3. Onboarding Intake — Questions & Branching

| # | Question | Options | Branching effect |
|---|---|---|---|
| 1 | What best describes you right now? | Transitioning (0–24 mo) · Veteran · Spouse/Family | Sets `lifeStage` / `veteranStatus`; transitioning path emphasizes checklist. |
| 2 | (If transitioning) How far from separation? | 0–6 · 6–12 · 12–24 months | Tightens 30/60/90 urgency. |
| 3 | Which life stage fits best? | Transitioning · Mid-career · Disability-navigating · Retiring · Spouse/family | Seeds priority ordering. |
| 4 | What state are you in? | US states dropdown | Attaches placeholder state benefits + "verify" note. |
| 5 | Your age range | Ranges | Adjusts retirement/education emphasis and readability defaults. |
| 6 | What are your top goals? (multi) | Home · Education · Business · Employment · Wellness · Retirement · Disability · Financial · Community | Drives benefit mapping + actions. |
| 7 | Any immediate needs? (multi) | Healthcare enrollment · Housing · Resume/job · Money/benefits review · Support/community | Adds high-priority near-term actions. |

**Branch highlights:**
- **Transitioning** → transition checklist first (benefits review, healthcare enrollment, resume, employment).
- **Disability selected** → non-legal orientation + **accredited VSO handoff** (no eligibility claims).
- **Business selected** → SBA/VBOC/Boots to Business pathway.
- **Spouse/family** → family/education-transfer/survivor resources.

---

## 4. Gameplan Generation Logic (Step by Step)

**Inputs:** `IntakeAnswers` (life stage, state, age, veteran status, goals, needs).

1. **Seed by life stage.** Establish baseline priority order and baseline near-term actions (e.g., transitioning → benefits review + resume in the 30-day bucket).
2. **Map each goal → benefit categories + actions.** Attach documents to gather and an official source to verify.
3. **Apply state.** Attach placeholder state benefits with a prominent **"verify with your state veteran affairs office"** note.
4. **Apply needs.** Promote urgent needs (e.g., healthcare enrollment, housing) into the 30-day bucket.
5. **Handle disability carefully.** Emit **non-legal** guidance only; recommend an **accredited VSO** (VFW/AL/DAV/county CVSO); never estimate ratings or guarantee eligibility.
6. **Prioritize & sort.** Rank priorities high/medium/low; dedupe actions; attach a **"why this matters"** rationale to each priority.
7. **Attach disclaimers.** SAMPLE data, not the VA, verify officially, and the **Veterans Crisis Line (988 → press 1)**.

**Output:** A `Gameplan` with prioritized categories, **30/60/90 action plans**, documents to gather, official resources to verify, and rationales.

---

## 5. Worked Examples

| Goal / situation | VetPath output (education, non-guaranteeing) |
|---|---|
| **Buy a home** | VA home loan **education** + Certificate of Eligibility explanation; **document checklist** (COE, income docs, DD-214); "verify at VA.gov — Home Loans." |
| **Education** | GI Bill and **VR&E (VA Readiness & Employment, "Chapter 31")** pathways; enrollment/benefit-transfer steps; "verify at VA.gov — Education." |
| **Start a business** | **SBA veteran resources** — VBOC and **Boots to Business**; business-plan and funding-orientation steps; "verify at SBA.gov." |
| **Transitioning** | Transition checklist: benefits review, healthcare enrollment, **resume + employment** (DOL VETS / American Job Centers), education review; 30/60/90 sequencing. |
| **Disability goals** | **Careful, non-legal** orientation; documents to organize; **recommend an accredited VSO** for claims; no rating estimates, no guarantees. |
| **Selecting a state** | Placeholder **sample** state benefits shown with a clear **"verify with your state veteran affairs office"** note. |

> Across all examples: outputs are **educational**, **labeled sample**, and always paired with an **official source to verify** and (where relevant) a **warm handoff to accredited help**.
