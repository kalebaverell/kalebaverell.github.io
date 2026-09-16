"use client";
// Founder traction board (Sep 16, 2026). Frank and Terianne asked to see the
// numbers without going through Kaleb every time, so this is the read-only
// window: live counts, no login, one shared link.
//
// It can only ever show aggregates. The page calls ONE Postgres function,
// public.traction_stats(token), which is SECURITY DEFINER and builds a fixed
// json object of counts - there is no code path in it that can return an email
// address, an intake answer, or any other row-level value. Anonymous reads of
// `profiles` stay blocked by RLS exactly as before. Rotating the link is one
// UPDATE against public.app_secrets.
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Week = { week_start: string; signups: number };
type Stats = {
  generated_at: string;
  accounts: number;
  new_7d: number;
  new_30d: number;
  last_signup: string | null;
  gameplans: number;
  pathfinder: number;
  checked_action: number;
  returned: number;
  opted_in: number;
  by_week: Week[];
  emails_sent: number;
  last_email_run: string | null;
  feedback_notes: number;
};

const day = (iso: string | null) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "-";

function Depth({ label, n, of }: { label: string; n: number; of: number }) {
  const pct = of ? Math.round((n / of) * 100) : 0;
  return (
    <div style={{ padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14 }}>
        <span>{label}</span>
        <strong style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {n} <span className="muted" style={{ fontWeight: 400 }}>of {of}</span>
        </strong>
      </div>
      <div style={{ marginTop: 7, height: 4, background: "var(--border)", borderRadius: 2 }}>
        <span
          style={{ display: "block", height: "100%", width: `${pct}%`, background: "var(--primary, #0F6E56)", borderRadius: 2 }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${n} of ${of}`}
        />
      </div>
    </div>
  );
}

export default function StatsBoard() {
  const [state, setState] = useState<"loading" | "denied" | "error" | "ready">("loading");
  const [data, setData] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = new URLSearchParams(window.location.search).get("k") || "";
      if (!token || !supabase) { if (alive) setState("denied"); return; }
      const { data: d, error } = await supabase.rpc("traction_stats", { p_token: token });
      if (!alive) return;
      // A bad token and a missing one look identical on purpose.
      if (error) { setState(error.code === "42501" ? "denied" : "error"); return; }
      setData(d as Stats);
      setState("ready");
    })();
    return () => { alive = false; };
  }, []);

  if (state === "loading") return <p className="muted">Reading the numbers...</p>;

  if (state === "denied")
    return (
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ marginTop: 0 }}>This link is not valid.</h2>
        <p className="muted" style={{ margin: 0 }}>
          The traction board opens from a private link. Ask Kaleb for a current one -
          the old link stops working whenever it is rotated.
        </p>
      </div>
    );

  if (state === "error" || !data)
    return (
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ marginTop: 0 }}>The numbers did not load.</h2>
        <p className="muted" style={{ margin: 0 }}>
          The link is fine, the database did not answer. Try again in a minute, and tell
          Kaleb if it keeps happening.
        </p>
      </div>
    );

  const weeks = data.by_week.slice(-10);
  const peak = Math.max(1, ...weeks.map((w) => w.signups));

  return (
    <>
      {/* Deliberately NOT the shared <Stat>: its count-up animation runs on
          requestAnimationFrame, which browsers pause in a hidden tab, so a
          board opened in a background tab paints "0 veterans with an account"
          until it is looked at. Charm is not worth a wrong headline number on
          a page whose whole job is reporting the number. Same .stat styling. */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", margin: "0 0 26px" }}>
        {([
          [data.accounts, "veterans with an account"],
          [data.new_7d, "new in the last 7 days"],
          [data.gameplans, "have built a gameplan"],
        ] as [number, string][]).map(([n, l]) => (
          <div className="stat" key={l}>
            <div className="n" style={{ fontVariantNumeric: "tabular-nums" }}>{n}</div>
            <div className="l">{l}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: 4 }}>New accounts, by week</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Last {weeks.length} weeks. Newest account: {day(data.last_signup)}.
      </p>
      <div className="card" style={{ padding: "22px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 150 }}>
          {weeks.map((w) => (
            <div key={w.week_start} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
              <span className="small" style={{ fontVariantNumeric: "tabular-nums", marginBottom: 4, opacity: w.signups ? 1 : 0.5 }}>
                {w.signups}
              </span>
              <span
                style={{
                  display: "block",
                  width: "100%",
                  flex: "none",
                  height: Math.max(3, Math.round((w.signups / peak) * 118)),
                  background: w.signups === peak ? "var(--accent, #D98A3D)" : "var(--primary, #0F6E56)",
                  opacity: w.signups ? 1 : 0.25,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {weeks.map((w) => (
            <span key={w.week_start} className="small muted" style={{ flex: 1, textAlign: "center", fontSize: 10.5 }}>
              {day(w.week_start)}
            </span>
          ))}
        </div>
      </div>

      <h2 style={{ marginTop: 34, marginBottom: 4 }}>What they did once they were in</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Out of all {data.accounts} accounts.
      </p>
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <Depth label="Built a gameplan" n={data.gameplans} of={data.accounts} />
        <Depth label="Ran the career Pathfinder" n={data.pathfinder} of={data.accounts} />
        <Depth label="Checked off at least one action" n={data.checked_action} of={data.accounts} />
        <Depth label="Came back on a different day" n={data.returned} of={data.accounts} />
        <Depth label="Opted in to check-in emails" n={data.opted_in} of={data.accounts} />
      </div>

      <h2 style={{ marginTop: 34, marginBottom: 4 }}>Check-in emails</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        {data.emails_sent} sent in total, most recently on {day(data.last_email_run)}. The engine runs
        itself every Monday and refuses to send anyone the same message twice.
      </p>
      <p className="muted">
        Feedback notes written by veterans so far: <strong>{data.feedback_notes}</strong>.
      </p>

      <p className="small muted" style={{ marginTop: 34, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        Live as of {new Date(data.generated_at).toLocaleString()}. Refresh the page for current
        numbers. This board can only show counts - it has no way to read a veteran&apos;s email
        address, answers, or plan, and neither does anyone holding this link. For visits and
        traffic sources, use the separate analytics link.
      </p>
    </>
  );
}
