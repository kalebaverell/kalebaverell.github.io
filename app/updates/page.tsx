"use client";
// Adaptive planning: report a life event, preview exactly what changes in the
// gameplan, then commit the update through the existing store actions.
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { STATES, careerById, benefitById } from "@/lib/data";
import { generateGameplan } from "@/lib/rules";
import { LIFE_EVENTS, applyEvent, lifeEventById, type LifeEvent } from "@/lib/lifeEvents";
import { diffPlans, type PlanDiff, type PlanPhase } from "@/lib/planDiff";
import type { Answers, Gameplan } from "@/lib/types";
import { Wrap, Eyebrow, Callout } from "@/components/ui";

const PHASE_LABEL: Record<PlanPhase, string> = {
  "30": "Next 30 days",
  "60": "Days 31–60",
  "90": "Days 61–90",
};

interface Preview {
  patched: Answers;
  nextPlan: Gameplan;
  diff: PlanDiff;
}

function changedKeys(prev: Answers, patched: Answers): (keyof Answers)[] {
  const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(patched)]));
  return keys.filter(
    (k) => JSON.stringify((prev as any)[k]) !== JSON.stringify((patched as any)[k])
  ) as (keyof Answers)[];
}

export default function Updates() {
  const { s, ready, setAnswer, regen } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [applied, setApplied] = useState(false);

  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;
  if (!s.profile) {
    return (
      <Wrap narrow>
        <div style={{ textAlign: "center" }}>
          <h2>No profile yet</h2>
          <p className="muted">Create a demo profile and finish intake — then this page can adapt your plan when life changes.</p>
          <Link className="btn" href="/onboarding">Create profile</Link>
        </div>
      </Wrap>
    );
  }

  const ev = lifeEventById(selectedId);

  const select = (e: LifeEvent) => {
    setSelectedId(e.id);
    const pre: Record<string, string> = {};
    for (const f of e.fields) pre[f.answerId] = ((s.answers as any)[f.answerId] as string) || "";
    setInputs(pre);
    setPreview(null);
    setApplied(false);
  };

  const setInput = (id: string, v: string) => {
    setInputs((p) => ({ ...p, [id]: v }));
    setPreview(null); // inputs changed — any previous preview is stale
    setApplied(false);
  };

  const doPreview = () => {
    if (!ev) return;
    const patched = applyEvent(s.answers, ev, inputs);
    const career = careerById(s.chosenPath?.careerId);
    const nextPlan = generateGameplan(
      patched,
      career ? { career, fitPct: s.chosenPath?.fitPct ?? null } : null
    );
    const diff = diffPlans(s.gameplan, nextPlan);
    setPreview({ patched, nextPlan, diff });
    setApplied(false);
  };

  const doApply = () => {
    if (!preview) return;
    // Commit only through existing store actions: one setAnswer per changed
    // field (arrays included — setAnswer accepts any value), then regenerate.
    for (const k of changedKeys(s.answers, preview.patched)) {
      setAnswer(k, (preview.patched as any)[k]);
    }
    regen();
    setApplied(true);
  };

  return (
    <Wrap narrow>
      <Eyebrow>Adaptive planning</Eyebrow>
      <h2 style={{ marginTop: 0 }}>Life changed? Update your plan</h2>
      <p className="muted">
        Pick what happened. We&apos;ll show you exactly what changes in your gameplan <strong>before</strong> anything is saved.
      </p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", marginTop: 14 }}>
        {LIFE_EVENTS.map((e) => {
          const on = e.id === selectedId;
          return (
            <button
              key={e.id}
              type="button"
              className="card"
              aria-pressed={on}
              onClick={() => select(e)}
              style={{
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                fontSize: "inherit",
                color: "var(--ink)",
                ...(on ? { borderColor: "var(--primary)", borderWidth: 2 } : {}),
              }}
            >
              <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="iconwrap"><i className={`ti ${e.icon}`} aria-hidden="true" /></span>
                <span style={{ fontWeight: 600, fontSize: "var(--fs-h4)" }}>
                  {e.label} {on && <span className="pill low">selected</span>}
                </span>
              </span>
              <span className="muted small" style={{ display: "block", margin: "10px 0 0" }}>{e.blurb}</span>
            </button>
          );
        })}
      </div>

      {ev && !applied && (
        <div className="card" style={{ marginTop: 18 }}>
          <h3 style={{ marginTop: 0 }}><i className={`ti ${ev.icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {ev.label}</h3>
          {ev.fields.length === 0 ? (
            <p className="muted small" style={{ marginTop: 0 }}>
              No extra details needed — we&apos;ll adjust your answers automatically and show you the change first.
            </p>
          ) : (
            <p className="muted small" style={{ marginTop: 0 }}>Update the details below, then preview the change.</p>
          )}
          {ev.id === "career-change" && (
            <Callout kind="info">
              A career change is a big shift. After you apply this update, consider re-running the <strong>Pathfinder</strong> to pick a new destination — the plan is only as good as where it&apos;s pointed.
            </Callout>
          )}
          <div style={{ marginTop: ev.fields.length ? 14 : 0 }}>
            {ev.fields.map((f) => {
              if (f.type === "state") {
                return (
                  <div key={f.answerId} style={{ marginBottom: 16 }}>
                    <label className="lbl" htmlFor={`ev-${f.answerId}`}>{f.label}</label>
                    <select
                      id={`ev-${f.answerId}`}
                      className="field"
                      value={inputs[f.answerId] || ""}
                      onChange={(e) => setInput(f.answerId, e.target.value)}
                    >
                      <option value="">Select a state…</option>
                      {STATES.map((st) => <option key={st.code} value={st.code}>{st.name}</option>)}
                    </select>
                  </div>
                );
              }
              if (f.type === "text") {
                return (
                  <div key={f.answerId} style={{ marginBottom: 16 }}>
                    <label className="lbl" htmlFor={`ev-${f.answerId}`}>{f.label}</label>
                    <input
                      id={`ev-${f.answerId}`}
                      className="field"
                      value={inputs[f.answerId] || ""}
                      onChange={(e) => setInput(f.answerId, e.target.value)}
                      placeholder="e.g. San Antonio"
                    />
                  </div>
                );
              }
              // single-choice options
              return (
                <fieldset key={f.answerId} style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                  <legend className="lbl" style={{ padding: 0 }}>{f.label}</legend>
                  {(f.options || []).map((o) => (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={inputs[f.answerId] === o}
                      className={`opt ${inputs[f.answerId] === o ? "sel" : ""}`}
                      onClick={() => setInput(f.answerId, o)}
                    >
                      {o}
                    </button>
                  ))}
                </fieldset>
              );
            })}
          </div>
          <button className="btn gold" onClick={doPreview}>
            <i className="ti ti-zoom-scan" aria-hidden="true" /> Preview what changes
          </button>
        </div>
      )}

      {ev && preview && !applied && <DiffPanel diff={preview.diff} nextPlan={preview.nextPlan} onApply={doApply} />}

      {applied && ev && (
        <>
          <div className="card" style={{ marginTop: 18, borderColor: "var(--success)", borderWidth: 2 }} role="status">
            <h3 style={{ marginTop: 0 }}>
              <i className="ti ti-circle-check" aria-hidden="true" style={{ color: "var(--success)" }} /> Plan updated
            </h3>
            <p className="muted">Your answers were updated and the gameplan regenerated — same plan, new reality.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn" href="/dashboard"><i className="ti ti-layout-dashboard" aria-hidden="true" /> See your dashboard</Link>
              <Link className="btn ghost" href="/plan"><i className="ti ti-list-check" aria-hidden="true" /> Open the action plan</Link>
            </div>
          </div>
          {ev.id === "career-change" && (
            <div className="card" style={{ marginTop: 16, borderColor: "var(--accent)", borderWidth: 2 }}>
              <h3 style={{ marginTop: 0 }}><i className="ti ti-compass" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Big shift? Re-run the Pathfinder</h3>
              <p className="muted small">A new career deserves a new destination. Ten quick questions re-match you against 24 veteran-friendly paths.</p>
              <Link className="btn gold" href="/pathfinder"><i className="ti ti-route" aria-hidden="true" /> Re-run the Pathfinder</Link>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 18 }}>
        <Callout kind="info">
          Honest note: reporting a life event just updates your intake answers and regenerates the same local demo plan. Nothing is sent anywhere, and none of this is official VA guidance.
        </Callout>
      </div>
    </Wrap>
  );
}

function DiffPanel({ diff, nextPlan, onApply }: { diff: PlanDiff; nextPlan: Gameplan; onApply: () => void }) {
  const added = diff.addedActions.length;
  const removed = diff.removedActions.length;
  const noChange =
    added === 0 && removed === 0 && diff.addedBenefits.length === 0 &&
    diff.removedBenefits.length === 0 && diff.addedPriorities.length === 0 && !diff.headlineChanged;

  const summaryParts: string[] = [];
  summaryParts.push(`${added} new action${added === 1 ? "" : "s"}, ${removed} retired`);
  if (diff.addedBenefits.length || diff.removedBenefits.length) {
    summaryParts.push(`${diff.addedBenefits.length} benefit area${diff.addedBenefits.length === 1 ? "" : "s"} added, ${diff.removedBenefits.length} removed`);
  }

  return (
    <div className="card" style={{ marginTop: 16 }} aria-live="polite">
      <h3 style={{ marginTop: 0 }}><i className="ti ti-git-compare" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> What changes</h3>

      {noChange ? (
        <Callout kind="info">
          Your current plan already covers this — applying will save the updated answers, but no actions change.
        </Callout>
      ) : (
        <>
          <p style={{ margin: "0 0 14px" }}>
            <span className="chip gold"><i className="ti ti-sparkles" aria-hidden="true" /> {summaryParts.join(" · ")}</span>
          </p>

          {diff.headlineChanged && (
            <p className="muted small" style={{ margin: "0 0 14px" }}>
              New headline: <strong style={{ color: "var(--ink-strong)" }}>&ldquo;{nextPlan.headline}&rdquo;</strong>
            </p>
          )}

          {diff.addedPriorities.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ margin: "0 0 6px" }}>New priorities</h4>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {diff.addedPriorities.map((p) => (
                  <li key={p} style={{ marginBottom: 4 }}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {(["30", "60", "90"] as PlanPhase[]).map((phase) => {
            const adds = diff.addedActions.filter((x) => x.phase === phase);
            const rems = diff.removedActions.filter((x) => x.phase === phase);
            if (adds.length === 0 && rems.length === 0) return null;
            return (
              <div key={phase} style={{ marginBottom: 14 }}>
                <h4 style={{ margin: "0 0 6px" }}>{PHASE_LABEL[phase]}</h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {adds.map((x) => (
                    <li key={`+${x.text}`} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0" }}>
                      <span aria-hidden="true" style={{ color: "var(--success)", fontWeight: 700, flexShrink: 0 }}>+</span>
                      <span><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Added: </span>{x.text}</span>
                    </li>
                  ))}
                  {rems.map((x) => (
                    <li key={`-${x.text}`} className="muted" style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0" }}>
                      <span aria-hidden="true" style={{ fontWeight: 700, flexShrink: 0 }}>−</span>
                      <s><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>No longer in plan: </span>{x.text}</s>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {(diff.addedBenefits.length > 0 || diff.removedBenefits.length > 0) && (
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ margin: "0 0 8px" }}>Benefit areas</h4>
              <div>
                {diff.addedBenefits.map((id) => {
                  const b = benefitById(id);
                  return (
                    <span key={id} className="chip gold">
                      {b?.icon && <i className={`ti ${b.icon}`} aria-hidden="true" />} + {b?.name || id}
                    </span>
                  );
                })}
                {diff.removedBenefits.map((id) => {
                  const b = benefitById(id);
                  return (
                    <span key={id} className="chip" style={{ opacity: 0.65 }}>
                      − <s>{b?.name || id}</s>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
        <button className="btn" onClick={onApply}>
          <i className="ti ti-check" aria-hidden="true" /> Apply to my plan
        </button>
      </div>
      <p className="small muted" style={{ margin: "12px 0 0" }}>
        Nothing changes until you apply. Applying updates your answers and regenerates the plan locally.
      </p>
    </div>
  );
}
