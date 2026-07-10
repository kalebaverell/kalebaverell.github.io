"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { ActionItem, Status } from "@/lib/types";
import { Wrap, ProgressBar } from "@/components/ui";

export default function ActionPlan() {
  const { s, ready, cycleStatus } = useStore();
  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;
  if (!s.gameplan) {
    return (
      <Wrap narrow>
        <div style={{ textAlign: "center" }}>
          <h2>No plan yet</h2>
          <Link className="btn" href="/onboarding">Start intake</Link>
        </div>
      </Wrap>
    );
  }
  const gp = s.gameplan;
  const groups: [string, ActionItem[]][] = [
    ["Next 30 days", gp.plan30],
    ["Days 31–60", gp.plan60],
    ["Days 61–90", gp.plan90],
  ];
  const all = [...gp.plan30, ...gp.plan60, ...gp.plan90];
  const done = all.filter((it) => s.statuses[it.id] === "done").length;

  return (
    <Wrap>
      <h2>Action plan &amp; checklist</h2>
      <p className="muted">Check items off as you go. Progress saves automatically in this demo.</p>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <strong>Overall progress</strong>
          <span className="muted small">{done} of {all.length} complete</span>
        </div>
        <ProgressBar pct={all.length ? (done / all.length) * 100 : 0} label={`Overall progress: ${done} of ${all.length} actions complete`} />
      </div>
      {groups.map(([title, items]) => (
        <div key={title} className="card" style={{ marginTop: 16 }}>
          <h3><i className="ti ti-calendar" style={{ color: "var(--accent-ink)" }} /> {title}</h3>
          {items.length ? items.map((it) => <CheckRow key={it.id} it={it} status={s.statuses[it.id] || "todo"} onClick={() => cycleStatus(it.id)} />) : <p className="muted small">No items.</p>}
        </div>
      ))}
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link className="btn ghost" href="/dashboard"><i className="ti ti-layout-dashboard" /> Back to dashboard</Link>
      </div>
    </Wrap>
  );
}

function CheckRow({ it, status, onClick }: { it: ActionItem; status: Status; onClick: () => void }) {
  const boxClass = status === "done" ? "box done" : status === "prog" ? "box prog" : "box";
  const inner = status === "done" ? <i className="ti ti-check" aria-hidden="true" /> : status === "prog" ? <i className="ti ti-dots" aria-hidden="true" /> : null;
  const label = status === "done" ? "Completed" : status === "prog" ? "In progress" : "Not started";
  const next = status === "todo" ? "In progress" : status === "prog" ? "Completed" : "Not started";
  return (
    <div className={`check ${status === "done" ? "done" : ""}`}>
      <button type="button" className={boxClass} onClick={onClick} aria-label={`${it.text} — status: ${label}. Click to mark as ${next}.`} title={`Status: ${label} — click to mark as ${next}`}>
        {inner}
      </button>
      <div style={{ flex: 1 }}>
        <span className={`pill ${it.priority}`}>{it.priority} priority</span>
        <div className="txt" style={{ marginTop: 4 }}>{it.text}</div>
        <span className="small muted">{label} — click the box to update</span>
      </div>
    </div>
  );
}
