"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { GOALS, benefitById, goalById, BRAND } from "@/lib/data";
import type { Goal } from "@/lib/types";
import { Wrap, Callout } from "@/components/ui";

export default function GoalPlanning() {
  const { s } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const g = selected ? goalById(selected) : null;
  const mine = s.answers.topGoals || [];

  if (g) return <Detail g={g} mine={mine} onBack={() => setSelected(null)} />;

  return (
    <Wrap>
      <h2>Goal planning</h2>
      <p className="muted">Pick any life goal to see suggested steps, benefits, and documents.{mine.length ? " Your selected goals are highlighted." : ""}</p>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", marginTop: 14 }}>
        {GOALS.map((goal) => {
          const on = mine.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              className="card"
              onClick={() => setSelected(goal.id)}
              style={{ cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: "inherit", color: "var(--ink)", ...(on ? { borderColor: "var(--primary)", borderWidth: 2 } : {}) }}
            >
              <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="iconwrap"><i className={`ti ${goal.icon}`} aria-hidden="true" /></span>
                <span style={{ fontWeight: 600, fontSize: "var(--fs-h4)" }}>{goal.label} {on && <span className="pill low">your goal</span>}</span>
              </span>
              <span className="muted small" style={{ display: "block", margin: "10px 0 0" }}>{goal.blurb}</span>
            </button>
          );
        })}
      </div>
    </Wrap>
  );
}

function Detail({ g, mine, onBack }: { g: Goal; mine: string[]; onBack: () => void }) {
  const { addGoal } = useStore();
  const router = useRouter();
  const isMine = mine.includes(g.id);
  return (
    <Wrap narrow>
      <button type="button" className="muted" onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 14, cursor: "pointer", background: "transparent", border: "none", fontFamily: "inherit", fontSize: "var(--fs-small)", padding: "8px 8px 8px 0" }}>
        <i className="ti ti-arrow-left" aria-hidden="true" /> Back to all goals
      </button>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div className="iconwrap" style={{ width: 52, height: 52, fontSize: 26 }}><i className={`ti ${g.icon}`} /></div>
        <div><h2 style={{ margin: 0 }}>{g.label}</h2><p className="muted" style={{ margin: "2px 0 0" }}>{g.blurb}</p></div>
      </div>
      {g.sensitive && (
        <div style={{ marginTop: 14 }}>
          <Callout kind="warn">
            This area can involve legal and medical questions. {BRAND.name} offers education only — work with a <strong>free accredited VSO</strong> for claims help, and never pay for basic assistance.
          </Callout>
        </div>
      )}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Suggested steps</h3>
        <ol className="steps">{g.steps.map((st, i) => <li key={i}>{st}</li>)}</ol>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Related benefits</h3>
        <div>{g.benefits.map((id) => { const b = benefitById(id); return b ? <span key={id} className="chip"><i className={`ti ${b.icon}`} /> {b.name}</span> : null; })}</div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Documents to gather</h3>
        <div>{g.documents.map((d) => <span key={d} className="tag">{d}</span>)}</div>
      </div>
      {!isMine && (
        <button className="btn gold" style={{ marginTop: 16 }} onClick={() => { addGoal(g.id); router.push("/dashboard"); }}>
          <i className="ti ti-plus" /> Add to my top goals &amp; refresh plan
        </button>
      )}
    </Wrap>
  );
}
