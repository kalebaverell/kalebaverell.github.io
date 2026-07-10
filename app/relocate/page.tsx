"use client";
// Relocation Planner — compare places to live across what veterans actually weigh,
// scored by THEIR priorities and (optionally) their chosen path. SAMPLE data only.
import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { careerById, realStateInfo, stateName } from "@/lib/data";
import { Wrap, SectionHead, Callout } from "@/components/ui";
import {
  METROS,
  RELOC_DIMS,
  PRIORITY_LABELS,
  scoreMetros,
  compareMetros,
  metroById,
  type Metro,
  type Priority,
  type RelocPriorities,
  type ScoredMetro,
} from "@/lib/relocate";

const DEFAULT_PRIORITIES: RelocPriorities = {
  vaAccess: 1, cost: 1, jobs: 1, schools: 0, community: 1, safety: 0, business: 0, airport: 0,
};

const PRIORITY_OPTIONS: Priority[] = [0, 1, 2];

function vaLocatorUrl(m: Metro): string {
  if (!m.state || m.state === "—") return "https://www.va.gov/find-locations";
  return `https://www.va.gov/find-locations/?address=${encodeURIComponent(`${m.name}, ${m.state}`)}`;
}

/** Cited official datapoints (BEA / HUD / BLS / VA) merged in by scripts/merge-reloc.mjs. */
type OfficialPoint = { value: number | string; year?: string; asOf?: string; source: string } | null;
type OfficialData = { rpp?: OfficialPoint; fmr2br?: OfficialPoint; unemployment?: OfficialPoint; vamc?: { name: string; source: string } | null };

function OfficialFacts({ m }: { m: Metro }) {
  const o = (m as Metro & { official?: OfficialData }).official;
  if (!o) return null;
  const fact = (label: string, p: OfficialPoint, fmt: (v: number | string) => string) =>
    p ? (
      <a key={label} className="tag" href={p.source} target="_blank" rel="noopener noreferrer" title={`${label} — official source`} style={{ textDecoration: "none" }}>
        {label}: {fmt(p.value)} {(p.year || p.asOf) ? `(${p.year || p.asOf})` : ""}
      </a>
    ) : null;
  return (
    <div className="small" style={{ marginTop: 2 }}>
      <span className="muted" style={{ marginRight: 6 }}>Official:</span>
      {fact("Cost index", o.rpp ?? null, (v) => `${v} RPP`)}
      {fact("2BR rent", o.fmr2br ?? null, (v) => (typeof v === "number" ? `$${v.toLocaleString()}` : String(v)))}
      {fact("Unemployment", o.unemployment ?? null, (v) => `${v}%`)}
      {o.vamc && (
        <a className="tag" href={o.vamc.source} target="_blank" rel="noopener noreferrer" title="VA facility — official source" style={{ textDecoration: "none" }}>
          {o.vamc.name}
        </a>
      )}
    </div>
  );
}

function VaChip({ m }: { m: Metro }) {
  const label =
    m.va.level === "VAMC" ? "VA medical center" :
    m.va.level === "nearby" ? "Clinics + VAMC nearby" : "VA clinic (CBOC)";
  return (
    <span className={`chip ${m.va.level === "VAMC" ? "gold" : ""}`}>
      <i className="ti ti-building-hospital" aria-hidden="true" /> {label}
    </span>
  );
}

function StateBenefitsTeaser({ m }: { m: Metro }) {
  const info = realStateInfo(m.state !== "—" ? m.state : undefined);
  if (!info) {
    return (
      <p className="small muted" style={{ margin: "10px 0 0" }}>
        State benefits follow the state you pick — once you narrow it down, the{" "}
        <Link href="/benefits">Benefits page</Link> has the verified list per state.
      </p>
    );
  }
  const flagship = info.programs[0];
  return (
    <p className="small muted" style={{ margin: "10px 0 0" }}>
      <i className="ti ti-map-pin" aria-hidden="true" />{" "}
      <strong>{stateName(m.state)} benefits:</strong> {info.agency.name}
      {flagship ? <> — e.g., {flagship.name}</> : null}. See the{" "}
      <Link href="/benefits">Benefits page</Link> for the verified list.
    </p>
  );
}

function MetroCard({
  r, rank, selected, atLimit, onToggleCompare,
}: {
  r: ScoredMetro;
  rank: number;
  selected: boolean;
  atLimit: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const m = r.metro;
  const disabled = !selected && atLimit;
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>
            {rank}. {m.name}{m.state !== "—" ? `, ${m.state}` : ""}
          </h3>
          <div className="small muted">{m.colNote}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 34, lineHeight: 1, color: "var(--ink-strong)" }}>
            {r.score}
          </div>
          <div className="small muted">sample fit / 100</div>
        </div>
      </div>

      <div><VaChip m={m} /><span className="chip">{m.vibe === "big" ? "Big metro" : m.vibe === "mid" ? "Mid-size" : "Small city / rural"}</span></div>

      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {r.whyBullets.map((b, i) => (
          <li key={i} className={b.startsWith("A gentle note") ? "muted" : undefined} style={{ marginBottom: 4 }}>
            {b}
          </li>
        ))}
      </ul>

      <OfficialFacts m={m} />

      <StateBenefitsTeaser m={m} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: "auto", paddingTop: 6 }}>
        <a href={vaLocatorUrl(m)} target="_blank" rel="noopener noreferrer" className="small">
          <i className="ti ti-external-link" aria-hidden="true" /> Verify VA facilities near {m.name.split("–")[0]}
        </a>
        <label
          className={`chip selectable${selected ? " selected" : ""}`}
          style={{ position: "relative", marginLeft: "auto", opacity: disabled ? 0.45 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
        >
          <input
            type="checkbox"
            checked={selected}
            disabled={disabled}
            onChange={() => onToggleCompare(m.id)}
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
          />
          {selected ? "In comparison" : "Compare"}
        </label>
      </div>
    </div>
  );
}

export default function RelocatePage() {
  const { s, ready } = useStore();
  const [prio, setPrio] = useState<RelocPriorities>(DEFAULT_PRIORITIES);
  const [useProfile, setUseProfile] = useState(false);
  const [shown, setShown] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const career = careerById(s.chosenPath?.careerId);
  const rating = s.answers.disabilityRating || "";
  const highVaNeed =
    rating === "60–90%" ||
    rating === "100%" ||
    (s.answers.wellnessPriorities || []).some((w) => w.includes("VA healthcare") || w.includes("Mental health"));
  const hasProfileSignal = Boolean(career || rating);

  const results = useMemo(() => {
    if (!shown) return null;
    return scoreMetros(prio, useProfile ? { careerId: career?.id, highVaNeed } : undefined);
  }, [shown, prio, useProfile, career?.id, highVaNeed]);

  const top6 = results ? results.slice(0, 6) : [];
  const compareRows = useMemo(
    () => (compareIds.length >= 2 ? compareMetros(compareIds) : []),
    [compareIds]
  );
  const compareMetroList = compareIds.map((id) => metroById(id)).filter((m): m is Metro => Boolean(m));
  const nothingSelected = RELOC_DIMS.every((d) => prio[d.key] === 0);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;

  return (
    <Wrap>
      <SectionHead
        eyebrow="Relocation planner"
        title="Where should the next chapter happen?"
        sub="Tell us what matters — VA access, cost, your career path, schools, community — and compare places side by side, with each state's real benefits attached."
      />

      <Callout kind="warn">
        <strong>Sample decision-support data.</strong> These ratings exist for comparison only — tiers are
        illustrative, not rankings from a cited index. Always verify VA facilities at{" "}
        <a href="https://www.va.gov/find-locations" target="_blank" rel="noopener noreferrer">va.gov/find-locations</a>{" "}
        and check housing, schools, safety, and the job market independently before any move.
      </Callout>

      {/* ---- Step 1: priorities ---- */}
      <div style={{ marginTop: 28 }}>
        <h3><i className="ti ti-adjustments" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Step 1 — what matters to you?</h3>
        <p className="muted" style={{ maxWidth: 640, marginTop: 4 }}>
          Mark each factor <strong>Skip</strong>, <strong>Nice to have</strong>, or <strong>Must have</strong>.
          Must-haves count double. There are no wrong answers — this is your move.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14, marginTop: 14 }}>
          {RELOC_DIMS.map((d) => (
            <div key={d.key} className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 600, color: "var(--ink-strong)" }}>
                <i className={`ti ${d.icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {d.label}
              </div>
              <div className="small muted" style={{ margin: "4px 0 10px" }}>{d.help}</div>
              <div role="group" aria-label={`${d.label} priority`} style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PRIORITY_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`chip selectable${prio[d.key] === v ? " selected" : ""}`}
                    aria-pressed={prio[d.key] === v}
                    onClick={() => setPrio((p) => ({ ...p, [d.key]: v } as RelocPriorities))}
                  >
                    {PRIORITY_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {nothingSelected && (
          <p className="small muted" style={{ marginTop: 10 }}>
            Everything is set to skip — we&apos;ll weigh all factors evenly until you choose.
          </p>
        )}
      </div>

      {/* ---- Step 2: profile toggle ---- */}
      <div className="card" style={{ marginTop: 22 }}>
        <h3><i className="ti ti-user-check" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Step 2 — use your profile &amp; path? (optional)</h3>
        <p className="muted" style={{ maxWidth: 640, marginTop: 4 }}>
          If you turn this on, we boost metros that are strong for your chosen career path
          {career ? <> (<strong>{career.label}</strong>)</> : null}, and if your rating or health priorities
          suggest VA care matters, we&apos;ll add a gentle reminder about VA access — never a filter, never a rule.
        </p>
        <label className={`chip selectable${useProfile ? " selected" : ""}`} style={{ position: "relative", minHeight: "var(--tap)" }}>
          <input
            type="checkbox"
            checked={useProfile}
            onChange={(e) => setUseProfile(e.target.checked)}
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
          />
          {useProfile ? "Using my profile & path" : "Use my profile & path"}
        </label>
        {useProfile && !hasProfileSignal && (
          <p className="small muted" style={{ marginTop: 10 }}>
            No saved path or rating yet — that&apos;s fine, your priorities above still drive everything.
            Want tailored job boosts? Find your path in the <Link href="/pathfinder">Pathfinder</Link> first.
          </p>
        )}
        {useProfile && career && (
          <p className="small muted" style={{ marginTop: 10 }}>
            Job scores now favor metros strong for <strong>{career.label}</strong>. Change your path anytime in the{" "}
            <Link href="/pathfinder">Pathfinder</Link>.
          </p>
        )}
      </div>

      {/* ---- Step 3: results ---- */}
      <div style={{ marginTop: 22 }}>
        <button type="button" className="btn gold" onClick={() => setShown(true)}>
          <i className="ti ti-map-search" aria-hidden="true" /> Show my matches
        </button>
        {shown && (
          <span className="small muted" style={{ marginLeft: 12 }}>
            Live-updates as you change priorities above.
          </span>
        )}
      </div>

      {results && (
        <div style={{ marginTop: 22 }}>
          <h3>Your top matches <span className="muted small">(top 6 of {results.length} sample places)</span></h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginTop: 12 }}>
            {top6.map((r, i) => (
              <MetroCard
                key={r.metro.id}
                r={r}
                rank={i + 1}
                selected={compareIds.includes(r.metro.id)}
                atLimit={compareIds.length >= 3}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Pick up to 3 places with <strong>Compare</strong> to see them side by side.
            {compareIds.length === 1 && " Pick at least one more to compare."}
          </p>
        </div>
      )}

      {/* ---- Step 4: side-by-side comparison ---- */}
      {compareRows.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <h3><i className="ti ti-columns-3" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Side by side</h3>
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 220 + compareMetroList.length * 260 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: "left", padding: "14px 18px", borderBottom: "2px solid var(--border)", color: "var(--muted)", fontSize: "var(--fs-small)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Factor
                  </th>
                  {compareMetroList.map((m) => (
                    <th key={m.id} scope="col" style={{ textAlign: "left", padding: "14px 18px", borderBottom: "2px solid var(--border)", color: "var(--ink-strong)" }}>
                      {m.name}{m.state !== "—" ? `, ${m.state}` : ""}
                      <div style={{ marginTop: 4 }}>
                        <a href={vaLocatorUrl(m)} target="_blank" rel="noopener noreferrer" className="small" style={{ fontWeight: 400 }}>
                          VA locator <i className="ti ti-external-link" style={{ fontSize: 12 }} aria-hidden="true" />
                        </a>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.dimension}>
                    <th scope="row" style={{ textAlign: "left", verticalAlign: "top", padding: "12px 18px", borderBottom: "1px solid var(--hairline)", color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {row.dimension}
                    </th>
                    {row.cells.map((c) => (
                      <td key={c.metroId} style={{ verticalAlign: "top", padding: "12px 18px", borderBottom: "1px solid var(--hairline)" }}>
                        <div style={{ fontWeight: 600, color: "var(--ink-strong)" }}>{c.value}</div>
                        {c.detail && <div className="small muted" style={{ marginTop: 2 }}>{c.detail}</div>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn ghost sm" style={{ marginTop: 12 }} onClick={() => setCompareIds([])}>
            <i className="ti ti-x" aria-hidden="true" /> Clear comparison
          </button>
        </div>
      )}

      <p className="small muted" style={{ marginTop: 26 }}>
        Sample list of {METROS.length} illustrative places — real decisions need a visit, current listings,
        and a conversation with veterans who already live there. VetPath is not the VA.
      </p>
      <Link className="btn ghost" href="/tools"><i className="ti ti-arrow-left" aria-hidden="true" /> All tools</Link>
    </Wrap>
  );
}
