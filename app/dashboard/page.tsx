"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { benefitById, stateName, BRAND } from "@/lib/data";
import type { ActionItem } from "@/lib/types";
import { Wrap, Stat, CrisisBanner } from "@/components/ui";

export default function Dashboard() {
  const { s, ready } = useStore();
  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;
  if (!s.gameplan) {
    return (
      <Wrap narrow>
        <div style={{ textAlign: "center" }}>
          <h2>No gameplan yet</h2>
          <p className="muted">Answer a few quick questions to generate your plan.</p>
          <Link className="btn" href="/onboarding">Start intake</Link>
        </div>
      </Wrap>
    );
  }
  const gp = s.gameplan;
  const a = s.answers;
  const all = [...gp.plan30, ...gp.plan60, ...gp.plan90];
  const done = all.filter((it) => s.statuses[it.id] === "done").length;
  const dest = gp.destination;

  return (
    <Wrap>
      {gp.crisis && <CrisisBanner />}
      <div className="card" style={{ background: "var(--primary)", color: "#fff", border: "none" }}>
        <span className="chip gold">
          <i className="ti ti-map-pin" /> {a.status || "Veteran"}{a.state ? ` · ${stateName(a.state)}` : ""}{a.branch ? ` · ${a.branch}` : ""}
        </span>
        <h2 style={{ color: "#fff", margin: "10px 0 4px" }}>Your gameplan, {s.profile?.name}</h2>
        <p style={{ color: "#CBD8E4", margin: 0, maxWidth: 640 }}>{gp.headline}</p>
      </div>

      {dest ? (
        <div className="card" style={{ marginTop: 16, border: "2px solid var(--accent)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="iconwrap" style={{ width: 52, height: 52, fontSize: 26 }}><i className="ti ti-flag-3" aria-hidden="true" /></div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span className="small muted">Your destination</span>
            <h3 style={{ margin: "2px 0 0" }}>{dest.label}</h3>
            <p className="small muted" style={{ margin: "2px 0 0" }}>Every action below routes toward this. Fit scores are demo estimates.</p>
          </div>
          {dest.fitPct && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>{dest.fitPct}%</div>
              <div className="small muted">fit (demo)</div>
            </div>
          )}
          <Link className="btn ghost sm" href="/pathfinder"><i className="ti ti-compass" /> Change path</Link>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 16, border: "2px dashed var(--border)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="iconwrap"><i className="ti ti-compass" aria-hidden="true" /></div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: 0 }}>Your plan needs a destination</h3>
            <p className="small muted" style={{ margin: "2px 0 0" }}>Run the Pathfinder — 10 questions, a recommended career path with a % fit, and this whole plan re-routes around it.</p>
          </div>
          <Link className="btn gold" href="/pathfinder"><i className="ti ti-compass" /> Find my path</Link>
        </div>
      )}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", margin: "16px 0" }}>
        <Stat n={gp.priorities.length} l="top priorities" />
        <Stat n={gp.benefitCategories.length} l="benefit categories" />
        <Stat n={`${done}/${all.length}`} l="actions completed" />
      </div>

      <div className="card">
        <h3><i className="ti ti-flag-3" style={{ color: "var(--accent-ink)" }} /> Top priorities</h3>
        <ol className="steps" style={{ marginTop: 8 }}>{gp.priorities.map((p, i) => <li key={i}>{p}</li>)}</ol>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3><i className="ti ti-award" style={{ color: "var(--accent-ink)" }} /> Recommended benefit categories</h3>
        <p className="muted small">Tap any to learn more and see the official source to verify.</p>
        <div>
          {gp.benefitCategories.map((id) => {
            const b = benefitById(id);
            return b ? <Link key={id} className="chip" href="/benefits"><i className={`ti ${b.icon}`} /> {b.name}</Link> : null;
          })}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginTop: 16 }}>
        <PlanCard title="Next 30 days" icon="ti-calendar-due" items={gp.plan30} />
        <PlanCard title="Days 31–60" icon="ti-calendar" items={gp.plan60} />
        <PlanCard title="Days 61–90" icon="ti-calendar-plus" items={gp.plan90} />
      </div>

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
              <p className="small" style={{ margin: "6px 0 0" }}>Still in service? DoD SkillBridge lets you intern with a civilian employer during your <strong>last 180 days on military pay</strong>. Big career shifts get much easier with civilian experience already on your resume — ask your command early; slots take approval time.</p>
              <a className="btn ghost sm" style={{ marginTop: 10 }} href="https://skillbridge.osd.mil" target="_blank" rel="noopener noreferrer">SkillBridge program <i className="ti ti-external-link" /></a>
            </div>
          )}
          {gp.disabilityPrep && gp.disabilityPrep.length > 0 && (
            <div className="card">
              <h3><i className="ti ti-clipboard-heart" style={{ color: "var(--accent-ink)" }} /> Get your full disability benefit — the honest way</h3>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{gp.disabilityPrep.map((d, i) => <li key={i} className="small" style={{ marginBottom: 5 }}>{d}</li>)}</ul>
              <p className="small muted" style={{ margin: "8px 0 0" }}>Education only — an accredited VSO's help is free and beats anyone charging for claims.</p>
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
                  {gp.metroSuggestions.map((m) => <span key={m.name} className="tag">{m.name}{m.state !== "—" ? `, ${m.state}` : ""}</span>)}
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
          <p className="muted small">A plan isn&apos;t just tasks — these are the calls to make (together, where it&apos;s a household decision).</p>
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
          <span className="muted small">Moved, new rating, new child, career change — see exactly how your plan adapts before you commit.</span>
        </Link>
        <Link href="/family" className="card" style={{ textDecoration: "none", color: "var(--ink)" }}>
          <h4 style={{ margin: "0 0 4px" }}><i className="ti ti-users" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Plan as a household</h4>
          <span className="muted small">Spouse, kids, caregiver — checkpoints and decisions the whole family should see.</span>
        </Link>
        <Link href="/relocate" className="card" style={{ textDecoration: "none", color: "var(--ink)" }}>
          <h4 style={{ margin: "0 0 4px" }}><i className="ti ti-map-2" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Where should we live?</h4>
          <span className="muted small">Compare places on VA access, cost, jobs for your path, schools, and community.</span>
        </Link>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
        <Link className="btn" href="/plan"><i className="ti ti-checkbox" /> Open my action checklist</Link>
        <Link className="btn gold" href="/print"><i className="ti ti-printer" /> Print my gameplan</Link>
        <Link className="btn ghost" href="/goals"><i className="ti ti-target" /> Explore goals</Link>
      </div>
    </Wrap>
  );
}

function PlanCard({ title, icon, items }: { title: string; icon: string; items: ActionItem[] }) {
  return (
    <div className="card">
      <h4><i className={`ti ${icon}`} style={{ color: "var(--accent-ink)" }} /> {title}</h4>
      <div style={{ marginTop: 6 }}>
        {items.length ? items.map((it) => (
          <div key={it.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span className={`pill ${it.priority}`}>{it.priority}</span>
            <div style={{ marginTop: 5, fontSize: 14 }}>{it.text}</div>
          </div>
        )) : <p className="muted small">Nothing scheduled here.</p>}
      </div>
    </div>
  );
}
