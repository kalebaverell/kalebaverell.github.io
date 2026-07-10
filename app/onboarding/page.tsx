"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { INTAKE, INTAKE_NOTES_PROMPT, STATES, GOALS } from "@/lib/data";
import type { Answers } from "@/lib/types";
import { Wrap, ProgressBar } from "@/components/ui";

export default function Onboarding() {
  const { s, ready, createProfile } = useStore();
  if (!ready) return <Wrap narrow><p className="muted">Loading…</p></Wrap>;
  if (!s.profile) return <ProfileGate onCreate={createProfile} />;
  return <Intake />;
}

function ProfileGate({ onCreate }: { onCreate: (n: string, e: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <Wrap narrow>
      <Link href="/" className="muted small" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 14 }}>
        <i className="ti ti-arrow-left" /> Home
      </Link>
      <h2>Create your demo profile</h2>
      <p className="muted">No password, no signup — this is a local demo profile stored only in your browser.</p>
      <div className="card">
        <label className="lbl" htmlFor="pname">First name</label>
        <input className="field" id="pname" placeholder="e.g. Frank" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 16 }} />
        <label className="lbl" htmlFor="pemail">Email (optional, demo only)</label>
        <input className="field" id="pemail" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 20 }} />
        <button className="btn block" onClick={() => onCreate(name, email)}><i className="ti ti-user-plus" /> Start planning</button>
        <p className="small muted" style={{ textAlign: "center", margin: "14px 0 0" }}>
          <i className="ti ti-lock" /> Stored locally. Nothing is sent anywhere in this prototype.
        </p>
      </div>
    </Wrap>
  );
}

function Intake() {
  const { s, setStep, setAnswer, toggleMulti, toggleGoal, setStepNote, regen } = useStore();
  const router = useRouter();
  const step = Math.min(s.step, INTAKE.length - 1);
  const sec = INTAKE[step];
  const pct = (step / INTAKE.length) * 100;

  const finish = () => {
    if (!s.answers.topGoals || s.answers.topGoals.length === 0) {
      alert("Pick at least one top goal to generate your plan.");
      return;
    }
    regen();
    router.push("/dashboard");
  };

  return (
    <Wrap narrow>
      <ProgressBar pct={pct} label={`Intake progress: step ${step + 1} of ${INTAKE.length}`} />
      <p className="small muted" aria-live="polite" style={{ marginTop: 8 }}>Step {step + 1} of {INTAKE.length}</p>
      <h2>{sec.title}</h2>
      <p className="muted">{sec.subtitle}</p>
      <div className="card">
        {sec.questions.map((q: any, i: number) => (
          <div key={q.id}>
            {i > 0 && <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "22px 0" }} />}
            <Question q={q} answers={s.answers} setAnswer={setAnswer} toggleMulti={toggleMulti} toggleGoal={toggleGoal} />
          </div>
        ))}
        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "22px 0" }} />
        <label className="lbl" htmlFor={`notes-${sec.id}`}>{INTAKE_NOTES_PROMPT}</label>
        <textarea
          id={`notes-${sec.id}`}
          className="field"
          rows={3}
          placeholder="Your words, your situation — anything the boxes above missed."
          value={s.answers.stepNotes?.[sec.id] || ""}
          onChange={(e) => setStepNote(sec.id, e.target.value)}
          style={{ minHeight: 80, resize: "vertical" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <button className="btn ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <i className="ti ti-arrow-left" /> Back
        </button>
        {step < INTAKE.length - 1 ? (
          <button className="btn" onClick={() => setStep(step + 1)}>Next <i className="ti ti-arrow-right" /></button>
        ) : (
          <button className="btn gold" onClick={finish}><i className="ti ti-sparkles" /> Generate my gameplan</button>
        )}
      </div>
    </Wrap>
  );
}

function Question({ q, answers, setAnswer, toggleMulti, toggleGoal }: {
  q: any; answers: Answers;
  setAnswer: (id: keyof Answers, v: any) => void;
  toggleMulti: (id: keyof Answers, v: string) => void;
  toggleGoal: (id: string) => void;
}) {
  const val = (answers as any)[q.id];

  if (q.type === "state") {
    return (
      <div>
        <label className="lbl">{q.label}</label>
        <select className="field" value={val || ""} onChange={(e) => setAnswer(q.id, e.target.value)}>
          <option value="">Select a state…</option>
          {STATES.map((st) => <option key={st.code} value={st.code}>{st.name}</option>)}
        </select>
        {q.helper && <p className="small muted" style={{ margin: "8px 0 0" }}>{q.helper}</p>}
      </div>
    );
  }

  if (q.type === "goals") {
    const sel: string[] = val || [];
    return (
      <div>
        <label className="lbl">{q.label}</label>
        <p className="small muted" style={{ marginTop: -2 }}>Selected {sel.length} of {q.max}.</p>
        {GOALS.map((g) => {
          const on = sel.includes(g.id);
          return (
            <button key={g.id} type="button" aria-pressed={on} className={`opt goal ${on ? "sel" : ""}`} style={{ display: "flex", gap: 10, alignItems: "center" }} onClick={() => toggleGoal(g.id)}>
              <i className={`ti ${g.icon}`} aria-hidden="true" style={{ fontSize: 22, color: "var(--accent-ink)" }} />
              <span style={{ flex: 1 }}><strong>{g.label}</strong></span>
              <i className={`ti ${on ? "ti-circle-check-filled" : "ti-circle"}`} aria-hidden="true" style={{ fontSize: 22, color: on ? "var(--success)" : "var(--border)" }} />
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === "text") {
    return (
      <div>
        <label className="lbl" htmlFor={`t-${q.id}`}>{q.label}</label>
        <input id={`t-${q.id}`} className="field" placeholder={q.placeholder || ""} value={val || ""} onChange={(e) => setAnswer(q.id, e.target.value)} />
        {q.helper && <p className="small muted" style={{ margin: "8px 0 0" }}>{q.helper}</p>}
      </div>
    );
  }

  if (q.type === "multi") {
    const sel: string[] = val || [];
    const customs = sel.filter((v) => !q.options.includes(v));
    return (
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend className="lbl" style={{ padding: 0 }}>{q.label} <span className="muted small">(select all that apply)</span></legend>
        {q.helper && <p className="small muted" style={{ margin: "0 0 8px" }}>{q.helper}</p>}
        <div>
          {[...q.options, ...customs].map((o: string) => (
            <button
              key={o}
              type="button"
              aria-pressed={sel.includes(o)}
              className={`chip selectable ${sel.includes(o) ? "selected" : ""}`}
              onClick={() => toggleMulti(q.id, o)}
            >
              {o}
            </button>
          ))}
        </div>
        {q.allowCustom && <CustomAdd onAdd={(t) => toggleMulti(q.id, t)} />}
      </fieldset>
    );
  }

  // single
  const isCustomVal = val && !q.options.includes(val);
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend className="lbl" style={{ padding: 0 }}>{q.label}{q.optional && <span className="muted small"> (optional)</span>}</legend>
      {q.helper && <p className="small muted" style={{ margin: "0 0 8px" }}>{q.helper}</p>}
      {q.options.map((o: string) => (
        <button key={o} type="button" aria-pressed={val === o} className={`opt ${val === o ? "sel" : ""}`} onClick={() => setAnswer(q.id, o)}>{o}</button>
      ))}
      {q.allowCustom && (
        <OtherInput current={isCustomVal ? val : ""} onUse={(t) => setAnswer(q.id, t)} />
      )}
    </fieldset>
  );
}

function CustomAdd({ onAdd }: { onAdd: (t: string) => void }) {
  const [text, setText] = useState("");
  const add = () => { const t = text.trim(); if (t) { onAdd(t); setText(""); } };
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
      <input className="field" style={{ flex: 1, minWidth: 180 }} placeholder="Add your own…" value={text}
        onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} aria-label="Add your own answer" />
      <button type="button" className="btn ghost" onClick={add} disabled={!text.trim()}><i className="ti ti-plus" /> Add</button>
    </div>
  );
}

function OtherInput({ current, onUse }: { current: string; onUse: (t: string) => void }) {
  const [text, setText] = useState(current);
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
      <input className="field" style={{ flex: 1, minWidth: 180 }} placeholder="Other — type your own answer…" value={text}
        onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) onUse(text.trim()); }} aria-label="Other answer" />
      <button type="button" className="btn ghost" onClick={() => text.trim() && onUse(text.trim())} disabled={!text.trim()}>
        {current && current === text.trim() ? <><i className="ti ti-check" /> Using</> : "Use this"}
      </button>
    </div>
  );
}
