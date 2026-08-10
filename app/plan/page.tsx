"use client";
import PageSkeleton from "@/components/PageSkeleton";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { ActionItem, Status } from "@/lib/types";
import { Wrap, ProgressBar } from "@/components/ui";
import TaskDetail from "@/components/TaskDetail";

const PRIORITY_RANK: Record<ActionItem["priority"], number> = { high: 0, medium: 1, low: 2 };

export default function ActionPlan() {
  const { s, ready, cycleStatus } = useStore();
  const [showAll, setShowAll] = useState(false);
  if (!ready) return <PageSkeleton kind="cards" />;
  if (!s.gameplan) {
    return (
      <Wrap narrow>
        <div style={{ textAlign: "center" }}>
          <h2>No plan yet</h2>
          <Link className="btn gold" href="/onboarding"><i className="ti ti-compass" /> Build my gameplan</Link>
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
  const status = (it: ActionItem): Status => s.statuses[it.id] || "todo";
  // Hidden by default: untouched medium/low items. Anything started or finished
  // always shows - progress never disappears behind a filter.
  const hiddenTotal = all.filter((it) => status(it) === "todo" && it.priority !== "high").length;

  return (
    <Wrap>
      <h2>Action plan</h2>
      <p className="muted">Tap a box to update it - once for in progress, again for done. Progress saves automatically and syncs to your account when you&apos;re signed in.</p>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
          <strong>Overall progress</strong>
          <span className="muted small">{done} of {all.length} complete</span>
        </div>
        <ProgressBar pct={all.length ? (done / all.length) * 100 : 0} label={`Overall progress: ${done} of ${all.length} actions complete`} />
        {hiddenTotal > 0 && (
          <p className="small muted" style={{ margin: "10px 0 0" }}>
            {showAll ? (
              <button type="button" className="linklike" onClick={() => setShowAll(false)}>Focus on high priority only</button>
            ) : (
              <>Showing high priority first. <button type="button" className="linklike" onClick={() => setShowAll(true)}>Show all {all.length} tasks</button></>
            )}
          </p>
        )}
      </div>
      {groups.map(([title, items]) => {
        // Open tasks first (high to low), completed sink to the bottom struck through.
        const open = items
          .filter((it) => status(it) !== "done" && (showAll || it.priority === "high" || status(it) === "prog"))
          .sort((x, y) => PRIORITY_RANK[x.priority] - PRIORITY_RANK[y.priority]);
        const finished = items.filter((it) => status(it) === "done");
        const hidden = items.length - open.length - finished.length;
        return (
          <div key={title} className="card" style={{ marginTop: 16 }}>
            <h3><i className="ti ti-calendar" style={{ color: "var(--accent-ink)" }} /> {title}</h3>
            {open.map((it) => <CheckRow key={it.id} it={it} status={status(it)} onClick={() => cycleStatus(it.id)} showPriority={showAll} />)}
            {open.length === 0 && finished.length === 0 && (
              <p className="muted small">{hidden > 0 ? "Nothing high-priority in this window." : "No items."}</p>
            )}
            {open.length === 0 && finished.length > 0 && (
              <p className="small" style={{ color: "var(--success)", fontWeight: 600 }}>
                <i className="ti ti-circle-check" aria-hidden="true" /> All done here. Well earned.
              </p>
            )}
            {finished.length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px dashed var(--border)" }}>
                <span className="small muted" style={{ fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", fontSize: 11 }}>Done</span>
                {finished.map((it) => <CheckRow key={it.id} it={it} status="done" onClick={() => cycleStatus(it.id)} showPriority={showAll} />)}
              </div>
            )}
            {hidden > 0 && !showAll && <p className="small muted" style={{ margin: "8px 0 0" }}>+{hidden} lower-priority hidden</p>}
          </div>
        );
      })}
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link className="btn ghost" href="/dashboard"><i className="ti ti-layout-dashboard" /> Back to my gameplan</Link>
      </div>
    </Wrap>
  );
}

function CheckRow({ it, status, onClick, showPriority }: { it: ActionItem; status: Status; onClick: () => void; showPriority?: boolean }) {
  const boxClass = status === "done" ? "box done" : status === "prog" ? "box prog" : "box";
  const inner = status === "done" ? <i className="ti ti-check" aria-hidden="true" /> : status === "prog" ? <i className="ti ti-dots" aria-hidden="true" /> : null;
  const label = status === "done" ? "Completed" : status === "prog" ? "In progress" : "Not started";
  const next = status === "todo" ? "In progress" : status === "prog" ? "Completed" : "Not started";
  return (
    <div className={`check ${status === "done" ? "done" : ""}`}>
      <button type="button" className={boxClass} onClick={onClick} aria-label={`${it.text} - status: ${label}. Click to mark as ${next}.`} title={`Status: ${label} - click to mark as ${next}`}>
        {inner}
      </button>
      <div style={{ flex: 1 }}>
        {/* In the default high-priority-only view every visible row is high, so the
            badge is pure noise there; it earns its place in the mixed all-tasks view. */}
        {showPriority && <span className={`pill ${it.priority}`}>{it.priority} priority</span>}
        <div className="txt" style={{ marginTop: showPriority ? 4 : 0 }}>{it.text}</div>
        {status !== "todo" && <span className="small muted">{label}</span>}
        <TaskDetail text={it.text} />
      </div>
    </div>
  );
}
