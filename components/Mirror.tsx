"use client";
// The Me Dashboard (Return Loop Phase 2): a mirror, not a checklist. Everything
// here reflects the veteran's own answers and actions - nothing is invented,
// and every empty state says how to fill it rather than pretending.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { RADAR_AXES, assessmentVector } from "@/lib/pathfinder";
import { upcomingPhaseStarts } from "@/lib/timeline";
import { downloadIcs } from "@/lib/ics";
import { supabase, supabaseUrl } from "@/lib/supabase";
import { track } from "@/lib/track";
import Topo from "@/components/Topo";
import { listEntries, addEntry, deleteEntry, importLocalEntries, type JournalEntry } from "@/lib/journal";
import type { ActionItem } from "@/lib/types";

const DATE_FMT: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

export default function Mirror() {
  const { s } = useStore();
  const { enabled, user } = useAuth();
  const userId = enabled && user ? user.id : null;
  return (
    <section aria-label="Your reflection" style={{ marginBottom: 8 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
        <RadarCard assessment={s.assessment} />
        <JournalCard userId={userId} />
        <MilestonesCard gameplan={s.gameplan} statuses={s.statuses} doneAt={s.doneAt || {}} />
        <UpcomingCard easDate={s.answers.easDate || ""} userId={userId} />
      </div>
    </section>
  );
}

/* ---- Priorities radar: the same 0-5 vector the career scorer uses. ---- */
function RadarCard({ assessment }: { assessment: Record<string, string | string[]> }) {
  const vec = assessmentVector(assessment);
  return (
    <div className="card" style={!vec ? { position: "relative", overflow: "hidden" } : undefined}>
      <h3 style={{ marginTop: 0 }}><i className="ti ti-compass" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Your shape</h3>
      {!vec ? (
        <>
          <Topo opacity={0.05} color="var(--primary)" />
          <p className="muted small" style={{ margin: 0, position: "relative" }}>
            Take the career test and this becomes a map of what you told us matters - the same signals that rank your paths.
          </p>
          <Link className="btn ghost sm" href="/pathfinder" style={{ marginTop: 12, position: "relative" }}>Take the career test</Link>
        </>
      ) : (
        <>
          <Radar values={RADAR_AXES.map((ax) => vec[ax.dim])} labels={RADAR_AXES.map((ax) => ax.label)} />
          <p className="muted small" style={{ margin: "8px 0 0" }}>From your own answers - re-take the test anytime and this moves with you.</p>
        </>
      )}
    </div>
  );
}

function Radar({ values, labels }: { values: number[]; labels: string[] }) {
  const C = 150, R = 104, n = values.length;
  const pt = (i: number, r: number): [number, number] => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [C + r * Math.cos(ang), C + r * Math.sin(ang)];
  };
  const ring = (k: number) => Array.from({ length: n }, (_, i) => pt(i, (R * k) / 5).join(",")).join(" ");
  const poly = values.map((v, i) => pt(i, (R * Math.max(0.4, Math.min(5, v))) / 5).join(",")).join(" ");
  const desc = labels.map((l, i) => `${l} ${values[i].toFixed(1)} of 5`).join(", ");
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={`Priorities radar: ${desc}`} className="radar-anim" style={{ width: "100%", maxWidth: 320, display: "block", margin: "0 auto" }}>
      {[1, 2, 3, 4, 5].map((k) => (
        <polygon key={k} points={ring(k)} fill="none" stroke="var(--border)" strokeWidth={k === 5 ? 1.4 : 0.7} />
      ))}
      {labels.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--hairline)" />;
      })}
      {/* Personality Pass 3: the polygon grows from center, the dots land in a
          stagger. Reduced-motion users see the finished shape instantly. */}
      <polygon className="radar-data" points={poly} fill="rgba(15,110,86,.18)" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = pt(i, (R * Math.max(0.4, Math.min(5, v))) / 5);
        return <circle key={i} className="radar-pt" style={{ animationDelay: `${0.3 + i * 0.045}s` }} cx={x} cy={y} r="3.4" fill="var(--primary)" />;
      })}
      {labels.map((l, i) => {
        const [x, y] = pt(i, R + 24);
        return (
          <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11.5, fontWeight: 600, fill: "var(--muted)", fontFamily: "inherit" }}>
            {l}
          </text>
        );
      })}
    </svg>
  );
}

/* ---- Milestones: checked actions with their dates. ---- */
function MilestonesCard({ gameplan, statuses, doneAt }: { gameplan: any; statuses: Record<string, string>; doneAt: Record<string, string> }) {
  const all: ActionItem[] = gameplan ? [...(gameplan.plan30 || []), ...(gameplan.plan60 || []), ...(gameplan.plan90 || [])] : [];
  const done = all
    .filter((it) => statuses[it.id] === "done")
    .map((it) => ({ ...it, when: doneAt[it.id] || "" }))
    .sort((a, b) => (b.when || "").localeCompare(a.when || ""));
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}><i className="ti ti-check" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Milestones met</h3>
      {done.length === 0 ? (
        <p className="muted small" style={{ margin: 0 }}>
          Your first checked action lands here. One small step this week is how the whole thing moves - <Link href="/plan">your action plan has the shortlist</Link>.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {done.slice(0, 4).map((it) => (
            <div key={it.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--chip-bg)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 1 }}><i className="ti ti-check" /></span>
              <span className="small">
                {it.text}
                {it.when && <span className="muted" style={{ display: "block", fontSize: 12 }}>{new Date(it.when).toLocaleDateString(undefined, DATE_FMT)}</span>}
              </span>
            </div>
          ))}
          {done.length > 4 && <p className="muted small" style={{ margin: 0 }}>+ {done.length - 4} more - every one of them yours.</p>}
          {(() => {
            // The recap (4.2): how far you've come, computed from your own stamps.
            const dated = done.filter((d) => d.when).map((d) => d.when).sort();
            if (dated.length === 0) return null;
            const first = new Date(dated[0]);
            const q = new Date(); q.setMonth(q.getMonth() - 3);
            const recent = dated.filter((w) => new Date(w) > q).length;
            const since = first.toLocaleDateString(undefined, { month: "short", year: "numeric" });
            return (
              <p className="small" style={{ margin: "4px 0 0", paddingTop: 10, borderTop: "1px solid var(--border)", color: "var(--ink-strong)", fontWeight: 600 }}>
                Since {since}: {done.length} action{done.length === 1 ? "" : "s"} checked{recent > 0 && recent !== done.length ? `, ${recent} in the last quarter` : ""}. Forward is forward.
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ---- Coming up: real phase-start dates, each exportable to a calendar. ---- */
function UpcomingCard({ easDate, userId }: { easDate: string; userId: string | null }) {
  const upcoming = easDate ? upcomingPhaseStarts(easDate, 3) : [];
  const [feedMsg, setFeedMsg] = useState<string | null>(null);

  // Live subscription beats a one-time download: the feed URL is token-gated
  // (profiles.feed_token, its own capability - not the unsubscribe token) and
  // calendar apps re-poll it, so date changes flow in on their own.
  const subscribe = async (mode: "open" | "copy") => {
    if (!supabase || !userId) return;
    try {
      const { data, error } = await supabase.from("profiles").select("feed_token").eq("id", userId).single();
      if (error || !data?.feed_token) { setFeedMsg("Couldn't fetch your calendar link - try again in a moment."); return; }
      const https = `${supabaseUrl}/functions/v1/calendar-feed?token=${data.feed_token}`;
      track("calendar-subscribe");
      if (mode === "open") {
        window.location.href = https.replace(/^https:/, "webcal:");
        setFeedMsg("Your calendar app should open - accept the subscription and future date changes flow in on their own.");
      } else {
        await navigator.clipboard.writeText(https);
        setFeedMsg("Link copied. In Google Calendar, choose “Other calendars”, then “From URL”, and paste it.");
      }
    } catch {
      setFeedMsg("Couldn't fetch your calendar link - try again in a moment.");
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}><i className="ti ti-calendar-check" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Coming up</h3>
      {upcoming.length === 0 ? (
        <p className="muted small" style={{ margin: 0 }}>
          Give the <Link href="/timeline">transition timeline</Link> your separation date and your next real dates appear here - exportable straight to your calendar.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {upcoming.map((u) => (
            <div key={u.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span className="small" style={{ flex: 1, minWidth: 160 }}>
                <strong>{u.label}</strong>
                <span className="muted" style={{ display: "block", fontSize: 12 }}>{u.date.toLocaleDateString(undefined, DATE_FMT)}</span>
              </span>
              <button
                type="button"
                className="btn ghost sm"
                onClick={() => downloadIcs({
                  title: `${u.label} begins - VetPath timeline`,
                  date: u.date,
                  description: "Planning marker computed from your separation month (mid-month anchor) - open your timeline for this phase's tasks.",
                  url: "https://vetpathusa.com/timeline/",
                })}
              >
                <i className="ti ti-calendar-check" aria-hidden="true" /> Calendar
              </button>
            </div>
          ))}
          {userId && (
            <div style={{ marginTop: 2, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              <p className="small muted" style={{ margin: "0 0 8px" }}>
                Or keep them live: subscribe once and when your dates change, your calendar updates itself.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" className="btn sm" onClick={() => subscribe("open")}>
                  <i className="ti ti-calendar-plus" aria-hidden="true" /> Subscribe on this device
                </button>
                <button type="button" className="btn ghost sm" onClick={() => subscribe("copy")}>
                  <i className="ti ti-copy" aria-hidden="true" /> Copy link for Google Calendar
                </button>
              </div>
              {feedMsg && <p className="small" style={{ margin: "8px 0 0", fontWeight: 600, color: "var(--ink)" }}>{feedMsg}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Journal: yours, private, importable from browser to account. ---- */
function JournalCard({ userId }: { userId: string | null }) {
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (userId) await importLocalEntries(userId);
        const list = await listEntries(userId, 8);
        if (alive) setEntries(list);
      } catch { if (alive) { setErr(true); setEntries([]); } }
    })();
    return () => { alive = false; };
  }, [userId]);

  const save = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true); setErr(false);
    try {
      const e = await addEntry(userId, draft);
      setEntries([e, ...(entries || [])]);
      setDraft("");
    } catch { setErr(true); }
    setBusy(false);
  };

  const remove = async (id: string) => {
    setEntries((entries || []).filter((e) => e.id !== id));
    try { await deleteEntry(userId, id); } catch { setErr(true); }
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}><i className="ti ti-file-text" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Your notes</h3>
      <p className="muted small" style={{ marginTop: 0 }}>
        Reminders, considerations, things to not forget - {userId ? "saved privately to your account." : "saved in this browser; sign in and they follow you."}
      </p>
      <textarea
        className="field"
        rows={2}
        placeholder="e.g. Ask the VSO about the knee - it's documented in 2019 records."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        style={{ resize: "vertical", minHeight: 56 }}
      />
      <div style={{ marginTop: 8 }}>
        <button type="button" className="btn sm" onClick={save} disabled={busy || !draft.trim()}>
          {busy ? "Saving…" : "Save note"}
        </button>
      </div>
      {err && <p className="small" style={{ color: "var(--danger)", margin: "8px 0 0" }}>That didn&apos;t save. Not your fault - give it a second and hit it again.</p>}
      {entries === null ? (
        <p className="muted small" style={{ margin: "12px 0 0" }}>Pulling your notes&hellip;</p>
      ) : entries.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          {entries.slice(0, 4).map((e) => (
            <div key={e.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span className="small" style={{ flex: 1, whiteSpace: "pre-wrap" }}>
                {e.body}
                <span className="muted" style={{ display: "block", fontSize: 12 }}>
                  {new Date(e.created_at).toLocaleDateString(undefined, DATE_FMT)}{e.task_ref ? ` · on: ${e.task_ref.slice(0, 48)}` : ""}
                </span>
              </span>
              <button type="button" onClick={() => remove(e.id)} aria-label="Delete note" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 6, minHeight: 32 }}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
