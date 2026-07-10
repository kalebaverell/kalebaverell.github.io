"use client";
// Transition Timeline — discovery interview first, then a personalized,
// phase-based plan for the last 12 months in uniform + first 24 months out.
// Grouped, multiple-choice-first questions; the plan is deterministic and
// every deadline cites the official source it was checked against.
import { useEffect, useState } from "react";
import Link from "next/link";
import { STATES } from "@/lib/data";
import {
  buildTimeline, freshTimelineAnswers, FOCUS_META, TIMELINE_VERIFIED,
  type TimelineAnswers, type TransitionTimeline, type TimelineTask, type FocusArea, type Goal, type FamilyFlag,
} from "@/lib/timeline";
import { Wrap, Eyebrow, Callout } from "@/components/ui";

const LS_KEY = "vetpath-timeline-v1";

const BRANCHES = ["Army", "Navy", "Air Force", "Marine Corps", "Coast Guard", "Space Force", "Guard / Reserve"];
const RANKS = ["E-1 to E-4", "E-5 to E-6", "E-7 to E-9", "Warrant officer", "O-1 to O-3", "O-4 and above"];
const SEP_OPTIONS: { v: TimelineAnswers["sepWindow"]; label: string }[] = [
  { v: "12+", label: "12+ months out" },
  { v: "9-12", label: "9–12 months" },
  { v: "6-9", label: "6–9 months" },
  { v: "3-6", label: "3–6 months" },
  { v: "0-3", label: "Under 3 months" },
  { v: "out", label: "Already separated" },
];
const YOS_OPTIONS: { v: TimelineAnswers["yearsOfService"]; label: string }[] = [
  { v: "0-4", label: "Under 4 years" },
  { v: "4-10", label: "4–10 years" },
  { v: "10-20", label: "10–20 years" },
  { v: "20+", label: "20+ (retiring)" },
];
const GOAL_OPTIONS: { v: Goal; label: string; icon: string }[] = [
  { v: "employment", label: "Civilian job", icon: "ti-briefcase" },
  { v: "education", label: "School / certifications", icon: "ti-school" },
  { v: "business", label: "Start a business", icon: "ti-building-store" },
  { v: "undecided", label: "Honestly undecided", icon: "ti-compass" },
];
const FAMILY_OPTIONS: { v: FamilyFlag; label: string }[] = [
  { v: "spouse", label: "Spouse / partner" },
  { v: "school-kids", label: "School-age kids" },
  { v: "young-kids", label: "Young kids" },
  { v: "none", label: "Just me" },
];
const CLAIMS_OPTIONS: { v: TimelineAnswers["claims"]; label: string; hint: string }[] = [
  { v: "yes", label: "Yes", hint: "I have conditions to claim" },
  { v: "unsure", label: "Not sure", hint: "Worth a free VSO screening" },
  { v: "no", label: "No", hint: "Nothing to claim right now" },
];
const FIN_OPTIONS: { v: TimelineAnswers["finances"]; label: string; hint: string }[] = [
  { v: "runway", label: "Solid runway", hint: "6+ months of expenses saved" },
  { v: "some", label: "Some savings", hint: "A few months of cushion" },
  { v: "income-now", label: "Need income fast", hint: "Little cushion after separation" },
  { v: "pension", label: "Pension coming", hint: "Retirement pay will land monthly" },
];

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  past: { label: "Behind you", cls: "" },
  current: { label: "You are here", cls: "gold" },
  ahead: { label: "Ahead", cls: "low" },
};

export default function TimelinePage() {
  const [a, setA] = useState<TimelineAnswers>(freshTimelineAnswers());
  const [step, setStep] = useState(0); // 0..3 interview, 4 = plan
  const [plan, setPlan] = useState<TransitionTimeline | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once from localStorage (answers only — the plan regenerates deterministically).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const merged = { ...freshTimelineAnswers(), ...saved.answers };
        setA(merged);
        if (saved.done) { setPlan(buildTimeline(merged)); setStep(4); }
      }
    } catch { /* fresh start beats a crash */ }
    setHydrated(true);
  }, []);

  const save = (answers: TimelineAnswers, done: boolean) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ answers, done })); } catch { /* private mode */ }
  };

  const set = <K extends keyof TimelineAnswers>(k: K, v: TimelineAnswers[K]) => {
    setA((p) => { const next = { ...p, [k]: v }; save(next, false); return next; });
  };
  // Multi-selects toggle inside the functional updater — computing the new list
  // from render-time state drops selections when clicks land in the same batch.
  const toggleIn = (k: "goals" | "family" | "priorities", v: string, max?: number) => {
    setA((p) => {
      const list = p[k] as string[];
      const nextList = list.includes(v)
        ? list.filter((x) => x !== v)
        : max && list.length >= max ? list : [...list, v];
      const next = { ...p, [k]: nextList };
      save(next, false);
      return next;
    });
  };
  const toggleFamily = (v: FamilyFlag) => {
    setA((p) => {
      const cur = p.family;
      const nextList: FamilyFlag[] = v === "none"
        ? (cur.includes("none") ? [] : ["none"])
        : (() => { const base = cur.filter((x) => x !== "none"); return base.includes(v) ? base.filter((x) => x !== v) : [...base, v]; })();
      const next = { ...p, family: nextList };
      save(next, false);
      return next;
    });
  };

  const finish = () => {
    setPlan(buildTimeline(a));
    setStep(4);
    save(a, true);
    window.scrollTo({ top: 0 });
  };
  const restart = () => {
    setPlan(null);
    setStep(0);
    save(a, false);
    window.scrollTo({ top: 0 });
  };

  if (!hydrated) return <Wrap><p className="muted">Loading…</p></Wrap>;

  return (
    <Wrap narrow>
      <Eyebrow>Transition timeline</Eyebrow>
      <h2 style={{ marginTop: 0 }}>{plan ? "Your transition timeline" : "Your last 12 months in — first 24 months out"}</h2>

      {!plan && (
        <>
          <p className="muted">
            A few grouped questions, then a personalized month-by-month plan. Missing a window — a claim
            deadline, an insurance conversion, an enrollment date — is expensive; this puts every one on
            a single timeline you control.
          </p>
          <div style={{ display: "flex", gap: 6, margin: "14px 0 18px" }} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ height: 6, flex: 1, borderRadius: 3, background: i <= step ? "var(--accent)" : "var(--border)" }} />
            ))}
          </div>

          {step === 0 && (
            <div className="card">
              <h3 style={{ marginTop: 0 }}><i className="ti ti-id-badge-2" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Service snapshot</h3>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                <legend className="lbl" style={{ padding: 0 }}>Branch</legend>
                {BRANCHES.map((b) => (
                  <button key={b} type="button" aria-pressed={a.branch === b} className={`opt ${a.branch === b ? "sel" : ""}`} onClick={() => set("branch", b)}>{b}</button>
                ))}
              </fieldset>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                <legend className="lbl" style={{ padding: 0 }}>How far from separation?</legend>
                {SEP_OPTIONS.map((o) => (
                  <button key={o.v} type="button" aria-pressed={a.sepWindow === o.v} className={`opt ${a.sepWindow === o.v ? "sel" : ""}`} onClick={() => set("sepWindow", o.v)}>{o.label}</button>
                ))}
              </fieldset>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                <legend className="lbl" style={{ padding: 0 }}>Years of service</legend>
                {YOS_OPTIONS.map((o) => (
                  <button key={o.v} type="button" aria-pressed={a.yearsOfService === o.v} className={`opt ${a.yearsOfService === o.v ? "sel" : ""}`} onClick={() => set("yearsOfService", o.v)}>{o.label}</button>
                ))}
              </fieldset>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                <legend className="lbl" style={{ padding: 0 }}>Rank group</legend>
                {RANKS.map((r) => (
                  <button key={r} type="button" aria-pressed={a.rankGroup === r} className={`opt ${a.rankGroup === r ? "sel" : ""}`} onClick={() => set("rankGroup", r)}>{r}</button>
                ))}
              </fieldset>
              <label className="lbl" htmlFor="tl-mos">Your MOS / rate / AFSC (optional, any wording)</label>
              <input id="tl-mos" className="field" value={a.mos} onChange={(e) => set("mos", e.target.value)} placeholder="e.g. 12B combat engineer, IT rating, aircraft maintenance" />
              <div style={{ marginTop: 16 }}>
                <button className="btn gold" onClick={() => setStep(1)}>Next <i className="ti ti-arrow-right" aria-hidden="true" /></button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="card">
              <h3 style={{ marginTop: 0 }}><i className="ti ti-map-2" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Where you&apos;re headed</h3>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                <legend className="lbl" style={{ padding: 0 }}>After service, you&apos;re aiming for… (pick all that apply)</legend>
                {GOAL_OPTIONS.map((g) => (
                  <button key={g.v} type="button" aria-pressed={a.goals.includes(g.v)} className={`opt ${a.goals.includes(g.v) ? "sel" : ""}`} onClick={() => toggleIn("goals", g.v)}>
                    <i className={`ti ${g.icon}`} aria-hidden="true" /> {g.label}
                  </button>
                ))}
              </fieldset>
              <label className="lbl" htmlFor="tl-state">Target state (leave blank if undecided)</label>
              <select id="tl-state" className="field" value={a.targetState} onChange={(e) => set("targetState", e.target.value)}>
                <option value="">Still deciding — that&apos;s fine</option>
                {STATES.map((st) => <option key={st.code} value={st.code}>{st.name}</option>)}
              </select>
              <fieldset style={{ border: "none", padding: 0, margin: "16px 0" }}>
                <legend className="lbl" style={{ padding: 0 }}>Who&apos;s transitioning with you? (pick all that apply)</legend>
                {FAMILY_OPTIONS.map((f) => (
                  <button key={f.v} type="button" aria-pressed={a.family.includes(f.v)} className={`opt ${a.family.includes(f.v) ? "sel" : ""}`}
                    onClick={() => toggleFamily(f.v)}>
                    {f.label}
                  </button>
                ))}
              </fieldset>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button className="btn ghost" onClick={() => setStep(0)}><i className="ti ti-arrow-left" aria-hidden="true" /> Back</button>
                <button className="btn gold" onClick={() => setStep(2)}>Next <i className="ti ti-arrow-right" aria-hidden="true" /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h3 style={{ marginTop: 0 }}><i className="ti ti-stethoscope" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Health &amp; money, big picture</h3>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                <legend className="lbl" style={{ padding: 0 }}>Planning to claim service-connected conditions through the VA?</legend>
                {CLAIMS_OPTIONS.map((c) => (
                  <button key={c.v} type="button" aria-pressed={a.claims === c.v} className={`opt ${a.claims === c.v ? "sel" : ""}`} onClick={() => set("claims", c.v)}>
                    <strong>{c.label}</strong> — {c.hint}
                  </button>
                ))}
              </fieldset>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                <legend className="lbl" style={{ padding: 0 }}>Financial picture at separation (roughly)</legend>
                {FIN_OPTIONS.map((f) => (
                  <button key={f.v} type="button" aria-pressed={a.finances === f.v} className={`opt ${a.finances === f.v ? "sel" : ""}`} onClick={() => set("finances", f.v)}>
                    <strong>{f.label}</strong> — {f.hint}
                  </button>
                ))}
              </fieldset>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn ghost" onClick={() => setStep(1)}><i className="ti ti-arrow-left" aria-hidden="true" /> Back</button>
                <button className="btn gold" onClick={() => setStep(3)}>Next <i className="ti ti-arrow-right" aria-hidden="true" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card">
              <h3 style={{ marginTop: 0 }}><i className="ti ti-adjustments" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> What matters most</h3>
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 6px" }}>
                <legend className="lbl" style={{ padding: 0 }}>Pick up to three areas to weight the plan toward</legend>
                {(Object.keys(FOCUS_META) as FocusArea[]).map((k) => (
                  <button key={k} type="button" aria-pressed={a.priorities.includes(k)} className={`opt ${a.priorities.includes(k) ? "sel" : ""}`}
                    onClick={() => toggleIn("priorities", k, 3)}>
                    <i className={`ti ${FOCUS_META[k].icon}`} aria-hidden="true" /> {FOCUS_META[k].label}
                  </button>
                ))}
              </fieldset>
              <p className="muted small">Everything still appears — your picks just rise to the top of each phase.</p>
              <label className="lbl" htmlFor="tl-notes">Anything else on your mind? (optional, your words)</label>
              <textarea id="tl-notes" className="field" rows={3} value={a.notes} onChange={(e) => set("notes", e.target.value)}
                placeholder="e.g. spouse is mid-degree, elderly parent nearby, worried about losing my crew…" />
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button className="btn ghost" onClick={() => setStep(2)}><i className="ti ti-arrow-left" aria-hidden="true" /> Back</button>
                <button className="btn gold" onClick={finish}><i className="ti ti-timeline" aria-hidden="true" /> Build my timeline</button>
              </div>
            </div>
          )}
        </>
      )}

      {plan && (
        <>
          <p className="muted" style={{ marginTop: 0 }}>{plan.summary}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "4px 0 18px" }}>
            <button className="btn ghost" onClick={() => window.print()}><i className="ti ti-printer" aria-hidden="true" /> Print this timeline</button>
            <button className="btn ghost" onClick={restart}><i className="ti ti-pencil" aria-hidden="true" /> Change my answers</button>
          </div>

          {a.notes.trim() && (
            <Callout kind="info">
              <strong>Your notes, kept front and center:</strong> &ldquo;{a.notes.trim()}&rdquo; — bring these
              to your TAP counselor and VSO; the human conversations are where the edge cases get solved.
            </Callout>
          )}

          {plan.catchUp.length > 0 && (
            <div className="card" style={{ borderColor: "var(--accent)", borderWidth: 2, marginTop: 14 }}>
              <h3 style={{ marginTop: 0 }}><i className="ti ti-alert-triangle" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Catch-up list — do these first</h3>
              <p className="muted small" style={{ marginTop: 0 }}>
                Based on your date, these windows are normally earlier — none of them are lost, they just move to the front of the line.
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {plan.catchUp.map((t) => (
                  <li key={t.id} style={{ marginBottom: 6 }}>
                    <strong>{t.title}.</strong> <span className="muted">{t.notes}</span>{" "}
                    {t.source && <SourceLink s={t.source} />}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.phases.map((p) => (
            <div key={p.id} className="card" style={{ marginTop: 16, ...(p.status === "current" ? { borderColor: "var(--primary)", borderWidth: 2 } : {}) }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>{p.label}</h3>
                <span className="muted small">{p.window}</span>
                <span className={`pill ${STATUS_CHIP[p.status].cls}`}>{STATUS_CHIP[p.status].label}</span>
              </div>
              <p className="muted small" style={{ margin: "8px 0 12px" }}>{p.narrative}</p>
              {p.tasks.length === 0 ? (
                <p className="muted small" style={{ margin: 0 }}>Nothing extra in this window for your situation — breathe.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="tl-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-small)" }}>
                    <thead>
                      <tr>
                        <th style={th}>Task</th>
                        <th style={th}>Focus area</th>
                        <th style={th}>Notes &amp; deadlines</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.tasks.map((t) => (
                        <tr key={t.id} style={{ borderTop: "1px solid var(--hairline)" }}>
                          <td style={td}>
                            <strong style={{ color: "var(--ink-strong)" }}>{t.title}</strong>
                            {t.deadline && <span className="pill gold" style={{ marginLeft: 8 }}>deadline</span>}
                            {t.weighted && !t.deadline && <span className="pill low" style={{ marginLeft: 8 }}>your priority</span>}
                          </td>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>
                            <i className={`ti ${FOCUS_META[t.area].icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {FOCUS_META[t.area].label}
                          </td>
                          <td style={td}>
                            {t.notes} {t.source && <SourceLink s={t.source} />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}><i className="ti ti-clock-exclamation" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> The dates that don&apos;t forgive</h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {plan.deadlines.map((t) => (
                <li key={t.id} style={{ marginBottom: 6 }}>
                  <strong>{t.title}.</strong> <span className="muted">{t.notes}</span> {t.source && <SourceLink s={t.source} />}
                </li>
              ))}
            </ul>
            <p className="muted small" style={{ margin: "12px 0 0" }}>
              Deadline details checked against the linked official sources as of {TIMELINE_VERIFIED} (demo) —
              rules change, so confirm each one before acting on it.
            </p>
          </div>

          <Callout kind="info">
            <strong>Want this even more personal?</strong> In the full product you&apos;ll be able to upload a
            resume, LES, or separation packet to tighten the plan around your actual record. This demo
            personalizes from your answers only — nothing you typed leaves your browser.
          </Callout>

          <div className="disclaimer" style={{ marginTop: 16 }}>
            <strong style={{ color: "var(--ink-strong)" }}>This timeline is a planning aid, not a substitute for professional guidance.</strong>{" "}
            Confirm disability claims with an accredited VSO or representative, financial commitments with a licensed
            financial advisor, legal questions with a legal assistance office, and medical matters with your provider.
            Benefit details are sample/demo data — verify through <a href="https://www.va.gov" target="_blank" rel="noopener noreferrer">VA.gov</a>,
            your state veterans agency, or your installation&apos;s transition office.
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            {a.goals.includes("undecided") && (
              <Link className="btn gold" href="/pathfinder"><i className="ti ti-compass" aria-hidden="true" /> Undecided? Run the Pathfinder</Link>
            )}
            {!a.targetState && (
              <Link className="btn" href="/relocate"><i className="ti ti-map-2" aria-hidden="true" /> Compare places to land</Link>
            )}
            <Link className="btn ghost" href="/tools"><i className="ti ti-tools" aria-hidden="true" /> All tools</Link>
          </div>
        </>
      )}
    </Wrap>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "8px 10px 8px 0", color: "var(--muted)", fontWeight: 600, fontSize: "var(--fs-small)" };
const td: React.CSSProperties = { padding: "10px 10px 10px 0", verticalAlign: "top", lineHeight: 1.55 };

function SourceLink({ s }: { s: { label: string; url: string } }) {
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="small" style={{ whiteSpace: "nowrap" }}>
      <i className="ti ti-external-link" aria-hidden="true" /> {s.label}
    </a>
  );
}
