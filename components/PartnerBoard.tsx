"use client";
// Partner report (Oct 2026). An office that hands out VetPath links - a county
// or state veterans service office, an accredited rep, a TAP counselor - gets
// one private link to this page. Like the founder board (StatsBoard.tsx) it can
// only ever show counts: the page calls ONE Postgres function,
// public.partner_stats(token), which is SECURITY DEFINER, finds the partner by
// the SHA-256 of the token, and returns a fixed json object of counts for that
// partner's code alone. Every count from 1 to 4 already arrives from the
// database as the string "<5" (a true 0 stays 0), so suppression does not
// depend on this page.
//
// The token rides in the URL fragment (#k=...). Browsers never send the
// fragment to a server, so it stays out of the host's logs and out of the page
// counter's request (count.js sends location.search, not the hash).
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type Cell = number | "<5";
type Report = {
  generated_at: string;
  code: string;
  label: string;
  since: string;
  signups: Cell;
  plans_built: Cell;
  checked_a_step: Cell;
  steps_checked: number | null;
  separation_date_given: Cell;
  bdd_window: Cell;
  opened_free_help: Cell;
  email_opt_in: Cell;
};

const BDD_SOURCE = "https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/";

const day = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

// Same row as the founder board's Depth, with one difference: a suppressed
// count has no honest percentage, so the bar only draws when both numbers are real.
function Row({ label, n, of, note }: { label: string; n: Cell; of: Cell; note?: ReactNode }) {
  const real = typeof n === "number" && typeof of === "number" && of > 0;
  const pct = real ? Math.round(((n as number) / (of as number)) * 100) : 0;
  return (
    <div style={{ padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14 }}>
        <span>{label}</span>
        <strong style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {n}
          {real && <span className="muted" style={{ fontWeight: 400 }}> of {of}</span>}
        </strong>
      </div>
      {note && <p className="small muted" style={{ margin: "4px 0 0" }}>{note}</p>}
      {real && (
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
      )}
    </div>
  );
}

export default function PartnerBoard() {
  const [state, setState] = useState<"loading" | "denied" | "error" | "ready">("loading");
  const [data, setData] = useState<Report | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("k") || "";
      if (!token || !supabase) { if (alive) setState("denied"); return; }
      const { data: d, error } = await supabase.rpc("partner_stats", { p_token: token });
      if (!alive) return;
      // A bad token, a revoked one, and a missing one look identical on purpose.
      if (error) { setState(error.code === "42501" ? "denied" : "error"); return; }
      setData(d as Report);
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
          Partner reports open from a private link. If yours stopped working it may have been
          replaced - email kaleb@vetpathusa.com for the current one.
        </p>
      </div>
    );

  if (state === "error" || !data)
    return (
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ marginTop: 0 }}>The numbers did not load.</h2>
        <p className="muted" style={{ margin: 0 }}>
          The link is fine, the database did not answer. Try again in a minute.
        </p>
      </div>
    );

  return (
    <>
      <p className="muted" style={{ marginTop: 0 }}>
        <strong>{data.label}</strong> - partner code {data.code}, counting since {day(data.since)}.
      </p>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", margin: "0 0 26px" }}>
        {([
          [data.signups, "created a free account through your link"],
          [data.plans_built, "built a gameplan"],
          [data.opened_free_help, "opened a free accredited-help link"],
        ] as [Cell, string][]).map(([n, l]) => (
          <div className="stat" key={l}>
            <div className="n" style={{ fontVariantNumeric: "tabular-nums" }}>{n}</div>
            <div className="l">{l}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: 4 }}>What they did next</h2>
      <p className="muted small" style={{ marginTop: 0 }}>Out of the accounts that came through your link.</p>
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <Row label="Built a gameplan" n={data.plans_built} of={data.signups} />
        <Row
          label="Checked off at least one step"
          n={data.checked_a_step}
          of={data.signups}
          note={data.steps_checked != null ? `${data.steps_checked} steps checked off in all.` : undefined}
        />
        <Row label="Gave a separation date" n={data.separation_date_given} of={data.signups} />
        <Row
          label="Have been inside the BDD claim window since signing up"
          n={data.bdd_window}
          of={data.signups}
          note={<>Benefits Delivery at Discharge claims are filed 180 to 90 days before separation.{" "}<a href={BDD_SOURCE} target="_blank" rel="noopener noreferrer">VA.gov</a></>}
        />
        <Row label="Opened a free accredited-help link from their plan" n={data.opened_free_help} of={data.signups} />
        <Row label="Said yes to email check-ins" n={data.email_opt_in} of={data.signups} />
      </div>

      <p className="small muted" style={{ marginTop: 34, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        Live: every count is read from the database when you open this page. Any count from 1 to 4
        shows as &quot;&lt;5&quot; so no single veteran can be picked out, and a percentage only
        shows when both numbers are real. This page can only show counts - it has no way to read a
        veteran&apos;s name, email address, answers, or plan, and neither does anyone holding this link.
        Scans of your code that did not lead to an account are not counted here. Read from the
        database {new Date(data.generated_at).toLocaleString()}.
      </p>
      <p className="small muted">
        VetPath is a free planning tool. It is not the VA, and it does not prepare or file claims.
      </p>
    </>
  );
}
