# VetPath — App Architecture

> **Status:** Prototype. Last updated 2026-07-06.
> **Reminder:** Prototype benefit data is SAMPLE data. No real auth, no server, local-first.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)** | File-based routing, RSC-ready, easy to grow into a backend. |
| Language | **TypeScript** | Typed data models for Profile, Benefit, Gameplan, etc. |
| Styling | **Tailwind CSS** | Design tokens from `DESIGN_SYSTEM.md` (Option A palette). |
| Data | **Local JSON in `/data`** | Mock/sample benefits, goals templates, rules config. No paid APIs. |
| State/persistence | **Browser `localStorage`** | Mocked profile + intake answers. No password, no real auth. |
| Rules engine | **Pure TS in `/lib`** | Deterministic mapping: intake answers → gameplan. |
| Zero-install demo | **`/demo/vetpath-demo.html`** | Single-file HTML/CSS/JS; double-click to open. |

---

## 2. Folder Structure

```
vetpath/
├─ app/                          # Next.js App Router
│  ├─ layout.tsx                 # Root layout, BRAND, global disclaimer banner
│  ├─ page.tsx                   # / (Landing)
│  ├─ onboarding/
│  │  └─ page.tsx                # Mocked profile + intake
│  ├─ dashboard/
│  │  └─ page.tsx                # Gameplan Dashboard
│  ├─ benefits/
│  │  └─ page.tsx                # Benefits & Resources Library
│  ├─ goals/
│  │  └─ page.tsx                # Goal Planning
│  ├─ plan/
│  │  └─ page.tsx                # Action Plan / Checklist
│  ├─ profile/
│  │  └─ page.tsx                # Profile
│  └─ admin/
│     └─ page.tsx                # Admin / Strategy (internal)
│
├─ components/                   # Reusable UI
│  ├─ Button.tsx
│  ├─ Card.tsx
│  ├─ Badge.tsx                  # chips / status badges
│  ├─ ProgressBar.tsx
│  ├─ Checklist.tsx
│  ├─ Disclaimer.tsx             # "SAMPLE data / verify at official source"
│  ├─ Callout.tsx                # info / warning / crisis-line callouts
│  ├─ PriorityCard.tsx           # a gameplan priority
│  ├─ BenefitCard.tsx
│  ├─ GoalCard.tsx
│  ├─ IntakeForm.tsx
│  └─ Nav.tsx / Header.tsx / Footer.tsx
│
├─ lib/                          # Logic (no UI)
│  ├─ config.ts                  # BRAND, feature flags, palette token names
│  ├─ rulesEngine.ts             # intake -> gameplan (deterministic)
│  ├─ storage.ts                 # localStorage read/write helpers
│  ├─ types.ts                   # TypeScript interfaces (see §4)
│  └─ format.ts                  # dates, labels
│
├─ data/                         # Local JSON (SAMPLE data)
│  ├─ benefits.json              # sample benefits catalog
│  ├─ goals.json                 # goal templates & pathways
│  ├─ states.json                # placeholder per-state benefits
│  └─ rules.json                 # rule config (goal -> priorities/actions)
│
├─ demo/
│  └─ vetpath-demo.html          # zero-install single-file demo
│
├─ docs/                         # This documentation set
│  ├─ PRODUCT_BRIEF.md
│  ├─ BUSINESS_PLAN.md
│  ├─ APP_ARCHITECTURE.md
│  ├─ UX_FLOW.md
│  ├─ BENEFITS_RESEARCH_NOTES.md
│  ├─ QUESTIONS_FOR_FRANK.md
│  ├─ DECISIONS_LOG.md
│  ├─ IMPLEMENTATION_LOG.md
│  └─ DESIGN_SYSTEM.md
│
├─ public/                       # static assets (logo, icons)
├─ tailwind.config.ts
├─ tsconfig.json
└─ package.json
```

---

## 3. Components List

| Component | Purpose |
|---|---|
| `Header` / `Nav` / `Footer` | App shell; persistent demo/disclaimer note. |
| `Disclaimer` | "SAMPLE data — not the VA — verify at official source." |
| `Callout` | Info / warning / danger / crisis-line messages. |
| `Button` | Primary (navy), accent (gold), secondary/ghost. |
| `Card` / `PriorityCard` / `BenefitCard` / `GoalCard` | Dashboard-style content blocks. |
| `Badge` | Chips: life stage, category, status, "SAMPLE". |
| `ProgressBar` | Gameplan / checklist completion. |
| `Checklist` | 30/60/90 action items with check state. |
| `IntakeForm` | Onboarding questions with branching. |

---

## 4. Data Model (TypeScript Interfaces)

```ts
// lib/types.ts

export type LifeStage =
  | "transitioning"     // 0–24 months from separation (primary)
  | "mid-career"
  | "disability-navigating"
  | "retiring"
  | "spouse-family";

export type GoalCategory =
  | "home" | "education" | "business" | "employment"
  | "wellness" | "retirement" | "disability" | "financial" | "community";

export type Priority = "high" | "medium" | "low";
export type Timeframe = "30" | "60" | "90";

export interface Profile {
  firstName: string;
  email: string;              // mocked, no password
  createdAt: string;          // ISO date
  intakeComplete: boolean;
}

export interface IntakeAnswers {
  lifeStage: LifeStage;
  state: string;              // 2-letter code, e.g. "TX"
  age: number;
  veteranStatus: "active-transitioning" | "veteran" | "spouse-family";
  monthsFromSeparation?: number;
  goals: GoalCategory[];
  needs: string[];            // e.g. ["healthcare", "housing", "resume"]
}

export interface Benefit {
  id: string;
  title: string;
  category: GoalCategory;
  summary: string;            // plain-language, non-guaranteeing
  officialSource: {           // where to VERIFY eligibility
    label: string;            // e.g. "VA.gov — Home Loans"
    url: string;
  };
  sampleData: true;           // ALWAYS true in prototype
  lastVerified?: string;      // ISO date (future/real version)
  documents?: string[];       // docs to gather
}

export interface Goal {
  id: string;
  category: GoalCategory;
  label: string;              // "Buy a home"
  rationale: string;          // "why this matters"
  pathway: string[];          // ordered steps / resources
}

export interface ActionItem {
  id: string;
  timeframe: Timeframe;       // 30 / 60 / 90
  label: string;
  category: GoalCategory;
  documents?: string[];
  verifyAt?: { label: string; url: string };
  done: boolean;
}

export interface Gameplan {
  generatedAt: string;
  priorities: {
    category: GoalCategory;
    priority: Priority;
    rationale: string;        // "why this matters"
  }[];
  benefitCategories: GoalCategory[];
  actions: ActionItem[];      // grouped by timeframe in UI
  disclaimers: string[];
}

// App-level UI/session state (prototype)
export interface State {
  profile?: Profile;
  intake?: IntakeAnswers;
  gameplan?: Gameplan;
  goals: Goal[];
}
```

---

## 5. Gameplan Rules Engine (Deterministic)

**Principle:** Same inputs → same outputs. No AI black box; transparent, auditable rules a founder/VSO can read (surfaced on the Admin screen).

**Flow:**

```
IntakeAnswers ─▶ rules.json + rulesEngine.ts ─▶ Gameplan
```

**Rule shape (in `data/rules.json`):**

```jsonc
{
  "byLifeStage": {
    "transitioning": {
      "priorities": ["employment", "education", "home", "wellness"],
      "actions30": ["Complete benefits review", "Start/refresh resume"],
      "note": "Prioritize transition checklist."
    }
  },
  "byGoal": {
    "home":     { "priority": "high", "benefits": ["va-home-loan"] },
    "education":{ "priority": "high", "benefits": ["gi-bill", "vre"] },
    "business": { "priority": "high", "benefits": ["sba-vboc", "boots-to-business"] },
    "disability": { "priority": "high", "handoff": "accredited-vso", "advice": "non-legal-only" }
  }
}
```

**Algorithm (simplified):**

1. Read life stage → seed a priority ordering and baseline actions.
2. For each selected goal → attach benefit categories, set priority, generate 30/60/90 actions and document checklists.
3. For `state` → attach placeholder state benefits with a **"verify"** note.
4. For `disability` goals → emit **non-legal** guidance only and a **warm handoff to an accredited VSO**; never guarantee ratings/eligibility.
5. Deduplicate, sort by priority, attach `rationale` ("why this matters") and official `verifyAt` links.
6. Always append standard disclaimers (SAMPLE data, not the VA, verify officially, crisis line 988→1).

---

## 6. Future Backend Architecture

| Concern | Prototype | Future (v1+) |
|---|---|---|
| Auth | Mocked (localStorage, no password) | Real auth (email magic link / OAuth), sessions. |
| Database | JSON in `/data` | **Postgres / Supabase**; per-user encrypted records. |
| Content | Static JSON | **Headless CMS** for benefits data; editorial workflow with last-verified dates. |
| State data | `states.json` placeholder | **Per-state data pipeline** with sources + citations. |
| API | none | REST/GraphQL for gameplan generation & content. |
| Rules | `rulesEngine.ts` | Same deterministic engine, server-side + versioned. |

---

## 7. Security & Privacy Considerations

**Sensitive data:** disability rating, health details, finances, veteran status.

| Principle | Prototype | Future |
|---|---|---|
| **Data minimization** | Collect only intake needed for the plan. | Same; drop anything not driving value. |
| **Local-first** | All data in browser `localStorage`; nothing leaves the device. | Explicit user account, opt-in cloud sync. |
| **Encryption** | N/A (local only) | **Encryption in transit (TLS) and at rest.** |
| **No selling data** | N/A | **Never sell personal data**; aggregates only if de-identified + opt-in. |
| **Consent** | Demo notice | Explicit consent for storage/sharing; clear privacy policy. |
| **HIPAA-adjacent caution** | Not a covered entity, but treat health/disability info as sensitive | Same caution; minimize collection; secure handling even though not a HIPAA-covered entity. |
| **Crisis safety** | Show Veterans Crisis Line (988 → 1) | Same, prominently. |

### 7.1 Accounts & Secure Storage — v1 design (adopted 2026-07-10; REQUIRED before real veterans enter real data)

The prototype's localStorage model is correct for a demo and **wrong for a product** holding household,
disability, and financial context. The gate is hard: no pilot collects real personal data until this ships.

**Architecture (lean, buildable):**
- **Auth:** managed provider (Supabase Auth or Auth0) — email magic-link + optional passkeys;
  no passwords to breach; MFA available. No SSN, no DoD ID — we never need them.
- **Database:** Postgres (Supabase) with **row-level security** so a user's rows are readable only by
  their session; per-column encryption for the sensitive trio (disability rating band, health
  priorities, household details) using app-held keys (e.g., pgsodium).
- **Data model:** `users`, `profiles` (intake answers, versioned), `gameplans` (generated snapshots
  for adaptive diffs), `events` (life-event log powering the adaptive engine). Benefit/career/state
  content stays public and versioned — user data never mixes with content tables.
- **Migration path:** on first login, offer one-tap import of the existing localStorage plan
  (client-side read → API write), then clear local. Guests keep working local-only forever —
  accounts stay opt-in, which is itself a trust feature.
- **Transport/at rest:** TLS everywhere; provider-managed AES-256 at rest; encrypted backups;
  no third-party analytics on authenticated pages until a privacy policy is published.
- **User rights:** self-serve export (JSON) and hard delete (cascade + backup purge on schedule);
  both are UI buttons, not support tickets.
- **Boundaries:** never sell data; no data sharing without explicit per-recipient consent (e.g., a
  veteran choosing to share their plan with a VSO counselor is v2, opt-in, scoped, revocable).
- **PWA note:** the service worker caches only static shell + public content, never authenticated
  API responses; cache is versioned and cleared on logout.

**Effort estimate:** ~2–3 weeks with Supabase for auth+DB+RLS+import/export; the deterministic
engines are already pure functions and move server-side or stay client-side unchanged.
