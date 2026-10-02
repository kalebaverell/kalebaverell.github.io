# VetPath — Design System

> **Direction:** Option A "Calm professional," elevated to a **"Trust & Authority"** aesthetic (2026-07-08).
> Calm, credible, editorial, and premium — Fortune-500-grade — while staying high-readability for older
> veterans, mobile-first, and accessible. Avoid military clichés, aggressive patriotic styling, and
> AI-purple/pink gradients. All colors/fonts are **design tokens** so themes (professional/warm/civic)
> and text size (base/lg/xl) swap without touching components.

---

## 0. "Trust & Authority" elevation (2026-07-08) — what changed and why

The original build read as "generic clean / template-like" (everything Inter, flat uniform cards,
soft gradients). The elevation, guided by the ui-ux-pro-max "Trust & Authority" pattern
(healthcare/finance/enterprise), makes it feel bespoke and institutional:

- **Serif display typography.** Headings (`h1`/`h2`, stat numbers, brand wordmark) now use
  **Fraunces** — an old-style serif with optical sizing — for editorial gravitas; **Inter** stays for
  all body, UI, and `h3`/`h4`. The hero accent word is Fraunces *italic* gold. This single change does
  most of the "premium" lift. `--font-display` / `--font-sans` are tokens.
- **Layered depth.** A 3-step shadow scale (`--shadow-sm/md/lg`), hairline borders (`--hairline`),
  and interactive cards that lift on hover — instead of one flat shadow everywhere.
- **Eyebrows / kickers.** Uppercase tracked labels with a gold rule above section titles (`.eyebrow`,
  `SectionHead`) — a hallmark of enterprise marketing pages.
- **Signature hero.** Navy gradient + a faint concentric-ring "compass" motif (ties to Pathfinder),
  a soft gold glow, and layered floating product cards (destination + benefit + location) so the hero
  shows the product, not just text. A trust strip sits directly beneath.
- **Refined system pieces.** Nav with a gold underline active-state + brand lockup; stat cards with a
  gold top-tab and display numerals (tabular figures); numbered steps in filled navy circles;
  gradient progress bars; structured footer with brand lockup.

Everything remains token-driven and theme-swappable (verified in professional + warm), text-size
scaling intact, WCAG focus rings and reduced-motion preserved.

---

---

## 1. Colors (Option A — Active)

### Brand & Text
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#16324D` | Deep navy — primary brand, headers, primary buttons, nav. |
| `--color-accent` | `#C8863C` | Warm gold — accents, key CTAs, highlights (use sparingly). |
| `--color-text` | `#1B2A3A` | Slate — body and heading text. |
| `--color-muted` | `#5A6B7B` | Muted — secondary text, captions, helper copy. |

### Surfaces & Borders
| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F4F6F8` | Page background. |
| `--color-surface` | `#FFFFFF` | Cards, panels, inputs. |
| `--color-border` | `#E3E8EC` | Card/input borders, dividers. |

### Semantic
| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#0F6E56` | Completed steps, positive status. |
| `--color-warning` | `#8A5A1C` | "Verify eligibility" / caution notes. |
| `--color-danger` | `#A32D2D` | Errors, crisis-line callout emphasis. |
| `--color-info` | `#185FA5` | Informational callouts, links. |

> **Accent discipline:** gold is a highlight, not a flood. Navy + white + slate carry the interface; gold marks the one thing that matters on a screen.

---

## 2. Typography

- **Font family:** **Inter** / system sans-serif. Serif only for occasional editorial moments (e.g., a quote), never for UI.
- **Case:** **sentence case** for headings, buttons, and labels (calm and readable — not shouty).
- **Readability:** **minimum 16px body text** (older-veteran accessibility). Generous line-height (~1.5–1.6).

| Role | Size | Weight | Notes |
|---|---|---|---|
| Display / H1 | 30–36px | 700 | Page titles. |
| H2 | 24px | 600 | Section headers. |
| H3 | 20px | 600 | Card titles. |
| Body | **16–18px** | 400 | Never below 16px. |
| Small / caption | 14px | 400–500 | Helper text, timestamps (avoid for essential content). |
| Button label | 16px | 600 | Sentence case. |

---

## 3. Layout Style

- **Mobile-first**, responsive up to comfortable desktop widths.
- **Card / dashboard** structure — content in clear, self-contained cards.
- **Generous spacing** — roomy padding (16–24px inside cards), clear separation between sections; nothing cramped.
- **Predictable rhythm** — consistent spacing scale (4 / 8 / 12 / 16 / 24 / 32 px).
- **High contrast**, clear focus states, large tap targets (min ~44px) for accessibility.

---

## 4. Component Style

| Component | Style |
|---|---|
| **Buttons** | Primary = navy fill, white text. Accent = gold fill for the single most important CTA. Secondary/ghost = navy outline. Rounded ~8px, 16px label, generous padding, clear hover/focus. |
| **Cards** | White surface, `--color-border`, subtle shadow, rounded ~12px, generous internal padding. |
| **Chips / badges** | Small rounded pills for life stage, category, and status. A **"Verified"** chip carries the date the item was checked against its official source. |
| **Progress bars** | Navy fill on light track; success green when complete; used on Dashboard and Checklist. |
| **Checklists** | Large checkboxes, 16px+ labels, grouped by 30/60/90; completed items use success color. |
| **Disclaimers / callouts** | Info (blue), warning (gold-brown "verify"), danger (crisis line). A "confirm at the official source" line sits wherever benefits appear. Placement of the "not the VA" line follows the rule below. |

**Standing callouts to include:**
- A dated **"Verified"** stamp and an official-source link on every benefit.
- **"VetPath is a planning and education tool - not the VA, and it never determines eligibility."** In the footer and the legal places listed below only.
- **Veterans Crisis Line - dial 988, then press 1** (danger/info styling, always reachable).

**Disclaimer placement rule (Oct 2026).** Lead with what VetPath adds: the dated plan, the linked sources, and the handoff to accredited help. The contrast line ("not the VA", "not affiliated with any government agency") appears only in:
footers, the privacy, terms, and trust pages' fine print, the FAQ answer to "Is VetPath part of the VA?", page-bottom caveats, print and email footers, social-profile fine print, and signature blocks on government-facing mail.
It never appears in a hero, an H1 or H2, a meta, OG, manifest, or structured-data description, an email subject or opening sentence, or a bullet heading.
On one-pagers the promise is phrased as the handoff: **"We hand off, we don't decide."**
Also out: "every" or "nothing" claims that a linked page cannot back item by item (say "official sources linked", not "every figure"), and "benefits to claim" (say "benefits to check").

---

## 5. Alternate Design Directions (Swap via Tokens)

Because colors are tokens, these can be A/B tested by swapping a theme file. Only the token values change — components stay the same.

### Option B — Warm & approachable
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#0F6E56` | Warm teal — brand, headers, primary buttons. |
| `--color-bg` | `#FBF7EF` | Cream — page background. |
| `--color-accent` | `#C8863C` | Gold accent (can carry over) or a complementary warm tone. |
| Text / muted / border | reuse slate `#1B2A3A` / `#5A6B7B` / warm-tinted border | Keep readability. |

Feel: warmer, softer, community-oriented. Test whether veterans find it more or less credible than navy.

### Option C — Neutral & understated
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#2E3338` | Charcoal — brand, headers, primary buttons. |
| `--color-accent` | `#55708A` | Muted blue-gray — accents, links. |
| `--color-bg` | `#F4F6F8` | Light neutral background (reuse). |
| Text / muted / border | slate `#1B2A3A` / `#5A6B7B` / `#E3E8EC` | Reuse. |

Feel: quiet, serious, utilitarian. Test against the navy/gold for perceived trust and calm.

> **Rule:** all three options keep **16px+ body text**, high contrast, generous spacing, and a **calm, non-clichéd** tone. Only the palette shifts.
