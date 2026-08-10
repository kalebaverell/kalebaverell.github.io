"use client";
import PageSkeleton from "@/components/PageSkeleton";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { benefitById, stateName, BRAND, WEIGHT_LEVEL_LABEL, residenceStates, careerById, careerMedianPay } from "@/lib/data";
import { rankedPriorities } from "@/lib/pathfinder";
import type { ActionItem } from "@/lib/types";
import { Wrap, Stat, CrisisBanner } from "@/components/ui";
import FundedPath from "@/components/FundedPath";
import TaskDetail from "@/components/TaskDetail";
import BenefitCategoryList from "@/components/BenefitCategoryList";

// The dashboard leads with what to DO, not what we know. Order: who you are,
// where you're headed, your next actions, the three tracks. Every data-heavy
// section lives behind "Show the full picture" so the first screen is a plan,
// not a briefing.
const PRIORITY_RANK: Record<ActionItem["priority"], number> = { high: 0, medium: 1, low: 2 };

export default function Dashboard() {
  const { s, ready, toggleDone } = useStore();
  const [showMore, setShowMore] = useState(false);
  if (!ready) return <PageSkeleton kind="dashboard" />;
  if (!s.gameplan) {
    return (
      <Wrap narrow>
        <div style={{ textAlign: "center" }}>
          <h2>No gameplan yet</h2>
          <p className="muted">A few quick questions build it.</p>
          <Link className="btn gold" href="/onboarding"><i className="ti ti-compass" /> Build my gameplan</Link>
        </div>
      </Wrap>
    );
  }
  const gp = s.gameplan;
  const a = s.answers;
  const stateStr = residenceStates(a).map((c) => stateName(c) || c).join(", ");
  const all = [...gp.plan30, ...gp.plan60, ...gp.plan90];
  const done = all.filter((it) => s.statuses[it.id] === "done").length;
  const dest = gp.destination;
  // The pay-target flag from the Pathfinder results follows the choice onto the
  // dashboard - the caveat matters most at the moment it became the plan.
  const destCareer = careerById(s.chosenPath?.careerId);
  const salMin = typeof a.salaryTarget?.min === "number" ? a.salaryTarget.min : null;
  const destMedian = destCareer ? careerMedianPay(destCareer) : null;
  const destBelowTarget = salMin != null && destMedian != null && destMedian < salMin;
  // The whole plan lives on /plan. Here: only the next three open tasks -
  // earliest window first, highest priority within it - so there is exactly
  // one obvious thing to do, and finishing it pulls the next one in.
  const nextThree = [gp.plan30, gp.plan60, gp.plan90]
    .flatMap((win) => [...win].sort((x, y) => PRIORITY_RANK[x.priority] - PRIORITY_RANK[y.priority]))
    .filter((it) => s.statuses[it.id] !== "done")
    .slice(0, 3);

  return (
    <Wrap>
      {gp.crisis && <CrisisBanner />}
      <div className="card" style={{ background: "var(--primary)", color: "#fff", border: "none" }}>
        <span className="chip gold">
          <i className="ti ti-map-pin" /> {a.status || "Veteran"}{stateStr ? ` · ${stateStr}` : ""}{a.branch ? ` · ${a.branch}` : ""}
        </span>
        <h2 style={{ color: "#fff", margin: "10px 0 4px" }}>Your gameplan, {s.profile?.name}</h2>
        <p style={{ color: "#CBD8E4", margin: 0, maxWidth: 640 }}>{gp.headline}</p>
      </div>

      {/* The journey in three steps. Disappears once all three are done - it exists
          to point at the next move, not to decorate the page. */}
      {!(dest && done > 0) && (
        <div className="card" style={{ marginTop: 16, display: "flex", gap: "8px 22px", flexWrap: "wrap", alignItems: "center", padding: "14px 20px" }}>
          <JourneyStep n={1} label="Plan built" state="done" />
          <i className="ti ti-chevron-right" aria-hidden="true" style={{ color: "var(--faint)" }} />
          <JourneyStep n={2} label="Pick your path" state={dest ? "done" : "now"} />
          <i className="ti ti-chevron-right" aria-hidden="true" style={{ color: "var(--faint)" }} />
          <JourneyStep n={3} label="Check off your first win" state={done > 0 ? "done" : dest ? "now" : "next"} />
        </div>
      )}

      {dest ? (
        <div className="card" style={{ marginTop: 16, border: "2px solid var(--accent)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="iconwrap" style={{ width: 52, height: 52, fontSize: 26 }}><i className="ti ti-flag-3" aria-hidden="true" /></div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span className="small muted">Your destination</span>
            <h3 style={{ margin: "2px 0 0" }}>{dest.label}</h3>
            {destBelowTarget && (
              <span className="chip sm" style={{ marginTop: 6, background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
                <i className="ti ti-trending-down" aria-hidden="true" /> Median ~${destMedian!.toLocaleString()} - below the pay you&apos;re aiming for
              </span>
            )}
          </div>
          {dest.fitPct && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>{dest.fitPct}%</div>
              <div className="small muted">fit estimate</div>
            </div>
          )}
          <Link className="btn ghost sm" href="/pathfinder"><i className="ti ti-compass" /> Change path</Link>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 16, border: "2px dashed var(--border)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="iconwrap"><i className="ti ti-compass" aria-hidden="true" /></div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: 0 }}>Pick your path</h3>
            <p className="small muted" style={{ margin: "2px 0 0" }}>10 questions. A career path that fits, and this plan re-routes around it.</p>
          </div>
          <Link className="btn gold" href="/pathfinder"><i className="ti ti-compass" /> Pick my path</Link>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", margin: "24px 0 0" }}>
        <h3 style={{ margin: 0 }}><i className="ti ti-checklist" style={{ color: "var(--accent-ink)" }} /> Do these first</h3>
        <span className="small muted">{done} of {all.length} done</span>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        {nextThree.length > 0 ? (
          nextThree.map((it) => (
            <div key={it.id} className="check" style={{ padding: "12px 0" }}>
              <button
                type="button"
                className="box"
                onClick={() => toggleDone(it.id)}
                aria-label={`${it.text} - tap to mark complete`}
              />
              <div style={{ flex: 1 }}>
                <div className="txt" style={{ fontWeight: 600 }}>{it.text}</div>
                <TaskDetail text={it.text} />
              </div>
            </div>
          ))
        ) : (
          <p className="small" style={{ color: "var(--success)", fontWeight: 600, margin: 0 }}>
            <i className="ti ti-circle-check" aria-hidden="true" /> Every action is done. Rebuild or print your plan below.
          </p>
        )}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--hairline)" }}>
          <Link className="btn sm" href="/plan"><i className="ti ti-checkbox" /> Full action plan ({all.length - done} open)</Link>
          <span className="small muted">Three at a time. Finish one and the next steps in.</span>
        </div>
      </div>

      <h3 style={{ margin: "28px 0 0" }}><i className="ti ti-route" style={{ color: "var(--accent-ink)" }} /> Your three tracks</h3>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 12 }}>
        {([
          ["/pathfinder", "ti-briefcase", "Career", "Your path, your fit, and the benefits that fund the training."],
          ["/relocate", "ti-home", "Housing", "The VA loan, and where to land: care, cost, jobs, community."],
          ["/goals", "ti-building-store", "Start a business", "From idea to plan, with veteran programs behind it."],
        ] as const).map(([href, icon, title, blurb]) => (
          <Link key={href} href={href} className="card" style={{ textDecoration: "none", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
            <h4 style={{ margin: "0 0 4px" }}><i className={`ti ${icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {title}</h4>
            <span className="muted small">{blurb}</span>
            {/* Cards that navigate need to say so - without this cue they read as static labels. */}
            <span className="small" style={{ marginTop: 10, fontWeight: 600, color: "var(--info)", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Open <i className="ti ti-arrow-right" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "center", margin: "26px 0 2px" }}>
        <button type="button" className="btn ghost" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore}>
          <i className={`ti ti-chevron-${showMore ? "up" : "down"}`} aria-hidden="true" /> {showMore ? "Hide the full picture" : "Show the full picture"}
        </button>
      </div>

      {showMore && (
      <>
      <div style={{ marginTop: 16 }}>
        <FundedPath a={a} career={careerById(s.chosenPath?.careerId)} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3><i className="ti ti-award" style={{ color: "var(--accent-ink)" }} /> Recommended benefit categories</h3>
        <p className="muted small" style={{ marginBottom: 10 }}>Tap any to see what it is and where to verify it.</p>
        <BenefitCategoryList ids={gp.benefitCategories} />
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", margin: "16px 0" }}>
        <Stat n={gp.priorities.length} l="top priorities" />
        <Stat n={gp.benefitCategories.length} l="benefit categories" />
        <Stat n={`${done}/${all.length}`} l="actions completed" />
      </div>

      <div className="card">
        <h3><i className="ti ti-flag-3" style={{ color: "var(--accent-ink)" }} /> Top priorities</h3>
        <ol className="steps" style={{ marginTop: 8 }}>{gp.priorities.map((p, i) => <li key={i}>{p}</li>)}</ol>
      </div>

      {a.priorityWeights && Object.keys(a.priorityWeights).length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3><i className="ti ti-adjustments-horizontal" style={{ color: "var(--accent-ink)" }} /> What matters most to you</h3>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {rankedPriorities(a).map((d) => (
              <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className={`ti ${d.icon}`} aria-hidden="true" style={{ fontSize: 18, color: "var(--accent-ink)", width: 20, textAlign: "center" }} />
                <span style={{ flex: 1, fontWeight: d.level >= 3 ? 600 : 400, color: d.level === 0 ? "var(--muted)" : "var(--ink)" }}>{d.label}</span>
                <span className="chip sm" style={{ background: d.level >= 3 ? "var(--accent-soft)" : "var(--surface-2)", color: d.level >= 3 ? "var(--accent-ink)" : "var(--muted)", fontWeight: d.level >= 3 ? 600 : 500 }}>{WEIGHT_LEVEL_LABEL[d.level]}</span>
              </div>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 10 }}><Link href="/onboarding">Adjust your weights →</Link></p>
        </div>
      )}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginTop: 16 }}>
        <div className="card">
          <h3><i className="ti ti-telescope" style={{ color: "var(--accent-ink)" }} /> Long-term opportunities</h3>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>{gp.longTerm.map((l, i) => <li key={i} style={{ marginBottom: 6 }}>{l}</li>)}</ul>
        </div>
        <div className="card">
          <h3><i className="ti ti-folders" style={{ color: "var(--accent-ink)" }} /> Documents to gather</h3>
          <div style={{ marginTop: 8 }}>
            {gp.documents.length ? gp.documents.map((d) => <span key={d} className="tag">{d}</span>) : <span className="muted small">No documents flagged yet.</span>}
          </div>
        </div>
      </div>

      {(gp.skillBridge || (gp.disabilityPrep && gp.disabilityPrep.length > 0)) && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginTop: 16 }}>
          {gp.skillBridge && (
            <div className="card">
              <h3><i className="ti ti-bridge" style={{ color: "var(--accent-ink)" }} /> SkillBridge window</h3>
              <p className="small" style={{ margin: "6px 0 0" }}>Still in service? Intern with a civilian employer during your <strong>last 180 days on military pay</strong>. Ask your command early; slots take approval time.</p>
              <a className="btn ghost sm" style={{ marginTop: 10 }} href="https://skillbridge.osd.mil" target="_blank" rel="noopener noreferrer">SkillBridge program <i className="ti ti-external-link" /></a>
            </div>
          )}
          {gp.disabilityPrep && gp.disabilityPrep.length > 0 && (
            <div className="card">
              <h3><i className="ti ti-clipboard-heart" style={{ color: "var(--accent-ink)" }} /> Get your full disability benefit - the honest way</h3>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{gp.disabilityPrep.map((d, i) => <li key={i} className="small" style={{ marginBottom: 5 }}>{d}</li>)}</ul>
              <p className="small muted" style={{ margin: "8px 0 0" }}>Education only - an accredited VSO&apos;s help is free and beats anyone charging for claims.</p>
            </div>
          )}
        </div>
      )}

      {(gp.networking?.length || gp.locationTips?.length) && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginTop: 16 }}>
          {gp.networking && gp.networking.length > 0 && (
            <div className="card">
              <h3><i className="ti ti-users-group" style={{ color: "var(--accent-ink)" }} /> Your networking moves</h3>
              {gp.networking.slice(0, 5).map((n) => (
                <div key={n.name} className="kv">
                  <span className="k">{n.url ? <a href={n.url} target="_blank" rel="noopener noreferrer">{n.name}</a> : n.name}</span>
                </div>
              ))}
              <Link className="btn ghost sm" style={{ marginTop: 10 }} href="/network"><i className="ti ti-arrow-right" /> Full networking hub</Link>
            </div>
          )}
          {gp.locationTips && gp.locationTips.length > 0 && (
            <div className="card">
              <h3><i className="ti ti-map-2" style={{ color: "var(--accent-ink)" }} /> Location fit (sample)</h3>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{gp.locationTips.slice(0, 2).map((t, i) => <li key={i} className="small" style={{ marginBottom: 5 }}>{t}</li>)}</ul>
              {gp.metroSuggestions && gp.metroSuggestions.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {gp.metroSuggestions.map((m) => <span key={m.name} className="tag">{m.name}{m.state !== "-" ? `, ${m.state}` : ""}</span>)}
                </div>
              )}
              <p className="small muted" style={{ margin: "8px 0 0" }}>Verify at the <a href="https://www.va.gov/find-locations/" target="_blank" rel="noopener noreferrer">VA facility locator</a>.</p>
            </div>
          )}
        </div>
      )}

      {gp.decisions && gp.decisions.length > 0 && (
        <div className="card feature" style={{ marginTop: 16 }}>
          <h3><i className="ti ti-scale" style={{ color: "var(--accent-ink)" }} /> Decisions to make</h3>
          <ol className="steps" style={{ marginTop: 8 }}>{gp.decisions.map((d, i) => <li key={i}>{d}</li>)}</ol>
          {gp.familyCheckpoints && gp.familyCheckpoints.length > 0 && (
            <p className="small" style={{ marginTop: 12 }}>
              <Link href="/family"><i className="ti ti-users" aria-hidden="true" /> See your full family checkpoints →</Link>
            </p>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3><i className="ti ti-bulb" style={{ color: "var(--accent-ink)" }} /> Why this matters</h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>{gp.whyItMatters.map((w, i) => <li key={i} style={{ marginBottom: 6 }}>{w}</li>)}</ul>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3><i className="ti ti-checklist" style={{ color: "var(--accent-ink)" }} /> Official resources to verify</h3>
        <p className="muted small">{BRAND.name} never confirms eligibility. Verify each item at its official source.</p>
        {gp.resources.map((id) => {
          const b = benefitById(id);
          return b ? (
            <div key={id} className="kv">
              <span className="k">{b.name}</span>
              <a href={b.official.url} target="_blank" rel="noopener noreferrer">{b.official.name} <i className="ti ti-external-link" /></a>
            </div>
          ) : null;
        })}
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginTop: 16 }}>
        <Link href="/updates" className="card" style={{ textDecoration: "none", color: "var(--ink)" }}>
          <h4 style={{ margin: "0 0 4px" }}><i className="ti ti-refresh" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Life changed?</h4>
          <span className="muted small">Moved, new rating, new child - see how your plan adapts.</span>
        </Link>
        <Link href="/family" className="card" style={{ textDecoration: "none", color: "var(--ink)" }}>
          <h4 style={{ margin: "0 0 4px" }}><i className="ti ti-users" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Plan as a household</h4>
          <span className="muted small">Checkpoints the whole family should see.</span>
        </Link>
      </div>
      </>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
        {/* One primary action: the checklist. Print is real but secondary - gold
            is reserved for the next step in the funnel, not utilities. */}
        <Link className="btn" href="/plan"><i className="ti ti-checkbox" /> Open my action checklist</Link>
        <Link className="btn ghost" href="/print"><i className="ti ti-printer" /> Print my gameplan</Link>
      </div>
    </Wrap>
  );
}

// One node of the three-step journey strip.
function JourneyStep({ n, label, state }: { n: number; label: string; state: "done" | "now" | "next" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: state === "now" ? 700 : 500, color: state === "next" ? "var(--muted)" : "var(--ink)" }}>
      <span
        aria-hidden="true"
        style={{
          width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
          background: state === "done" ? "var(--success)" : state === "now" ? "var(--accent)" : "var(--surface-2)",
          color: state === "next" ? "var(--muted)" : "#fff",
        }}
      >
        {state === "done" ? <i className="ti ti-check" /> : n}
      </span>
      {label}
      {state === "now" && <span className="pill high" style={{ marginLeft: 2 }}>you are here</span>}
    </span>
  );
}
