"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Wrap } from "@/components/ui";
import { STATES, BRAND, residenceStates } from "@/lib/data";
import { buildStateCompare, COMPARE_CATEGORIES, CATEGORY_LABEL, STATES_WITH_COST } from "@/lib/compare";

const src = (url: string, label: string) => (
  <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
);

export default function ComparePage() {
  const { s, ready } = useStore();
  // Default to two states that carry cost data so the table is populated on arrival…
  const [codes, setCodes] = useState<string[]>([STATES_WITH_COST[0] || "TX", STATES_WITH_COST[1] || "FL", ""]);
  // …but if the veteran told us they have homes in more than one state, compare those instead.
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (prefilled || !ready) return;
    const mine = residenceStates(s.answers || {});
    if (mine.length >= 2) setCodes([mine[0] || "", mine[1] || "", mine[2] || ""]);
    setPrefilled(true);
  }, [prefilled, ready, s.answers]);

  const selected = codes.filter(Boolean);
  const compares = selected.map(buildStateCompare);

  const setAt = (i: number, v: string) => setCodes((c) => c.map((x, j) => (j === i ? v : x)));

  const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid var(--border)", verticalAlign: "top" };
  const td: React.CSSProperties = { padding: "10px 12px", borderBottom: "1px solid var(--border)", verticalAlign: "top", fontSize: "var(--fs-small)" };
  const rowLabel: React.CSSProperties = { ...td, fontWeight: 600, color: "var(--ink-strong)", whiteSpace: "nowrap" };

  return (
    <Wrap>
      <h2><i className="ti ti-columns-3" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Compare states</h2>
      <p className="muted" style={{ maxWidth: 640 }}>
        Because so many veteran benefits — property-tax relief, tuition waivers, hiring preference — are set by the
        state, where you land changes the math. Pick two or three to compare, side by side, from verified sources.
      </p>

      <div className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, minWidth: 180 }}>
            <label className="lbl" htmlFor={`cmp-${i}`}>{i < 2 ? `State ${i + 1}` : "State 3 (optional)"}</label>
            <select id={`cmp-${i}`} className="field" value={codes[i]} onChange={(e) => setAt(i, e.target.value)}>
              <option value="">{i < 2 ? "Select a state…" : "Add a third…"}</option>
              {STATES.map((st) => (
                <option key={st.code} value={st.code}>{st.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {compares.length < 2 ? (
        <p className="muted" style={{ marginTop: 18 }}>Pick at least two states to see the comparison.</p>
      ) : (
        <>
          <div className="card" style={{ overflowX: "auto", marginTop: 16, padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={{ ...th, minWidth: 150 }}></th>
                  {compares.map((c) => (
                    <th key={c.code} style={th}><span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{c.name}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={rowLabel}>State veterans agency</td>
                  {compares.map((c) => (
                    <td key={c.code} style={td}>{c.agency ? src(c.agency.url, c.agency.name) : "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td style={rowLabel}>Benefit programs (total)</td>
                  {compares.map((c) => (
                    <td key={c.code} style={td}><strong style={{ fontSize: 16, color: "var(--primary)" }}>{c.totalPrograms || "—"}</strong></td>
                  ))}
                </tr>
                {COMPARE_CATEGORIES.map((cat) => (
                  <tr key={cat}>
                    <td style={rowLabel}>{CATEGORY_LABEL[cat]}</td>
                    {compares.map((c) => {
                      const b = c.byCategory[cat];
                      return (
                        <td key={c.code} style={td}>
                          {b.count > 0 ? (
                            <>
                              <strong>{b.count}</strong>
                              {b.top && <div className="muted" style={{ marginTop: 2 }}>{src(b.top.source, b.top.name)}</div>}
                            </>
                          ) : <span className="muted">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td style={rowLabel}>Cost of living <span className="muted small">(BEA RPP)</span></td>
                  {compares.map((c) => (
                    <td key={c.code} style={td}>
                      {c.cost?.rpp
                        ? <>{src(c.cost.rpp.source, String(c.cost.rpp.value))}<div className="muted" style={{ marginTop: 2 }}>{c.cost.metro} · {c.cost.rpp.year}</div></>
                        : <span className="muted">no metro data</span>}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={rowLabel}>Rent, 2-bed <span className="muted small">(HUD FMR)</span></td>
                  {compares.map((c) => (
                    <td key={c.code} style={td}>
                      {c.cost?.fmr2br
                        ? <>{src(c.cost.fmr2br.source, `$${c.cost.fmr2br.value.toLocaleString()}/mo`)}<div className="muted" style={{ marginTop: 2 }}>{c.cost.fmr2br.year}</div></>
                        : <span className="muted">—</span>}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={rowLabel}>Unemployment <span className="muted small">(BLS)</span></td>
                  {compares.map((c) => (
                    <td key={c.code} style={td}>
                      {c.cost?.unemployment
                        ? <>{src(c.cost.unemployment.source, `${c.cost.unemployment.value}%`)}<div className="muted" style={{ marginTop: 2 }}>{c.cost.unemployment.asOf}</div></>
                        : <span className="muted">—</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="small muted" style={{ marginTop: 12 }}>
            Cost of living is the BEA Regional Price Parity for a representative metro in each state, where{" "}
            <strong>100 = the U.S. average</strong> — lower is cheaper. Rent is HUD&apos;s Fair Market Rent for a 2-bedroom;
            unemployment is the BLS metro rate. State-benefit counts come from each state&apos;s official veterans agency.
            {BRAND.name} does not determine eligibility — confirm every program at its linked official source.
          </p>
          <p className="small" style={{ marginTop: 8 }}>
            <Link href="/benefits"><i className="ti ti-award" aria-hidden="true" /> See full benefit details for your state →</Link>
            <span style={{ margin: "0 10px", color: "var(--faint)" }}>·</span>
            <Link href="/relocate"><i className="ti ti-map-2" aria-hidden="true" /> Full relocation planner →</Link>
          </p>
        </>
      )}
    </Wrap>
  );
}
