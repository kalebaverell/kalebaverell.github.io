"use client";
// Home prices + the VA loan (tester note 4a, 2026-08-12): compare two states,
// drill into specific towns, and see what buying there typically costs -
// pointed at the VA loan the veteran has already earned. Every figure carries
// its source and data month. The sponsored-partner slot is deliberately empty
// (lib/housing.ts, task #32) - only neutral, no-strings guidance ships today.
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { realStateInfo } from "@/lib/data";
import { HOUSING, HOUSING_PARTNERS, fetchPlaces, fmtUsd, type HousingPlace } from "@/lib/housing";
import { Wrap, Eyebrow, Callout } from "@/components/ui";

const CODES = Object.keys(HOUSING.states).sort((a, b) =>
  HOUSING.states[a].name.localeCompare(HOUSING.states[b].name));

function taxProgramsFor(code: string): { name: string; source: string }[] {
  const st = realStateInfo(code);
  return (st?.programs || []).filter((p: any) => p.category === "tax").map((p: any) => ({ name: p.name, source: p.source }));
}

function StatePanel({ code, other }: { code: string; other?: string }) {
  const st = HOUSING.states[code];
  const [places, setPlaces] = useState<HousingPlace[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    let live = true;
    setPlaces(null); setError(false); setQ("");
    fetchPlaces(code).then((p) => { if (live) setPlaces(p); }, () => { if (live) setError(true); });
    return () => { live = false; };
  }, [code]);

  const shown = useMemo(() => {
    if (!places) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return [...places].sort((a, b) => a.r - b.r).slice(0, 8); // largest towns first until they search
    return places.filter((p) => p.n.toLowerCase().includes(needle)).slice(0, 12);
  }, [places, q]);

  const taxes = taxProgramsFor(code);
  const delta = other ? st.value - HOUSING.states[other].value : 0;

  return (
    <div className="card" style={{ flex: 1, minWidth: 290 }}>
      <h3 style={{ margin: 0 }}>{st.name}</h3>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: "var(--primary)" }}>{fmtUsd(st.value)}</span>
        <span className="small muted">typical home statewide</span>
      </div>
      {other && delta !== 0 && (
        <p className="small muted" style={{ margin: "4px 0 0" }}>
          {delta > 0 ? `${fmtUsd(Math.abs(delta))} more` : `${fmtUsd(Math.abs(delta))} less`} than {HOUSING.states[other].name}.
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        <label className="small" style={{ fontWeight: 600 }} htmlFor={`town-${code}`}>Look up a town</label>
        <input id={`town-${code}`} className="field" placeholder="Start typing a town or city" value={q}
          onChange={(e) => setQ(e.target.value)} style={{ marginTop: 6 }} />
        {error && <p className="small muted" style={{ margin: "8px 0 0" }}>Town data didn&apos;t load - check your connection and try again.</p>}
        {places && shown.length === 0 && <p className="small muted" style={{ margin: "8px 0 0" }}>No towns match - Zillow doesn&apos;t publish a value for every small place.</p>}
        {!places && !error && <p className="small muted" style={{ margin: "8px 0 0" }}>Loading towns&hellip;</p>}
        {shown.map((p) => (
          <div key={p.n} className="kv"><span className="k">{p.n}</span><span style={{ fontWeight: 600 }}>{fmtUsd(p.v)}</span></div>
        ))}
        {places && !q && <p className="small muted" style={{ margin: "8px 0 0" }}>Showing the largest {shown.length} of {places.length.toLocaleString()} places - type to search them all.</p>}
      </div>

      {taxes.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <strong className="small">Veteran property-tax relief here:</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {taxes.map((t) => (
              <li key={t.name} className="small" style={{ marginBottom: 3 }}>
                {t.name} - <a href={t.source} target="_blank" rel="noopener noreferrer">verify at source</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function HousingPage() {
  const { s } = useStore();
  // Default the left panel to the veteran's own state when we know it.
  const homeState = ((): string => {
    const a = s.answers?.state;
    const first = Array.isArray(a) ? a[0] : a;
    const hit = CODES.find((c) => HOUSING.states[c].name === first || c === first);
    return hit || "TX";
  })();
  const [left, setLeft] = useState(homeState);
  const [right, setRight] = useState(homeState === "TX" ? "TN" : "TX");

  return (
    <Wrap>
      <Eyebrow>Housing</Eyebrow>
      <h2>What homes cost, and the loan you&apos;ve already earned</h2>
      <p className="muted" style={{ maxWidth: 680 }}>
        Compare two states, drill into the towns you&apos;re actually considering, and put real numbers
        under the buy-vs-rent question. The VA loan is one of the most valuable benefits most veterans
        never use.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "14px 0" }}>
        {[{ v: left, set: setLeft, label: "First state" }, { v: right, set: setRight, label: "Second state" }].map((sel) => (
          <label key={sel.label} className="small" style={{ fontWeight: 600 }}>
            {sel.label}
            <select className="field" value={sel.v} onChange={(e) => sel.set(e.target.value)} style={{ display: "block", marginTop: 6 }}>
              {CODES.map((c) => <option key={c} value={c}>{HOUSING.states[c].name}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatePanel code={left} other={right} />
        <StatePanel code={right} other={left} />
      </div>

      <p className="small muted" style={{ margin: "10px 0 0" }}>
        Home values: {HOUSING.meta.source}, {HOUSING.meta.dataMonth} data
        (<a href={HOUSING.meta.sourceUrl} target="_blank" rel="noopener noreferrer">zillow.com/research/data</a>).{" "}
        {HOUSING.meta.note}
      </p>

      <div className="card" style={{ marginTop: 20, border: "2px solid var(--accent)" }}>
        <h3 style={{ marginTop: 0 }}><i className="ti ti-home-check" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> The VA loan, in four sentences</h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
          <li className="small">In most cases: <strong>no down payment and no monthly mortgage insurance</strong>. The VA guarantees part of the loan - a private lender actually makes it.</li>
          <li className="small">Step one is your <strong>Certificate of Eligibility</strong> - <a href="https://www.va.gov/housing-assistance/home-loans/how-to-request-coe/" target="_blank" rel="noopener noreferrer">request it at VA.gov</a> in minutes.</li>
          <li className="small">A one-time VA funding fee usually applies, but <strong>veterans receiving disability compensation are typically exempt</strong> - <a href="https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/" target="_blank" rel="noopener noreferrer">check the current rules</a>.</li>
          <li className="small">It&apos;s reusable. Using it once does not use it up.</li>
        </ul>
      </div>

      {/* "Do I qualify?" - tester note 3 (2026-08-13), neutral version. */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}><i className="ti ti-clipboard-check" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> Find out if you qualify - it&apos;s one conversation</h3>
        <p className="muted small" style={{ margin: "4px 0 10px", maxWidth: 640 }}>
          Prequalification is a free, no-commitment conversation where a lender looks at your income and
          credit and tells you what you could borrow. It does not obligate you to anything, and doing it
          early tells you whether &quot;buy&quot; is realistic for this move or the next one.
        </p>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          <div>
            <strong className="small">Bring to the lender conversation:</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, display: "grid", gap: 4 }}>
              <li className="small">Your Certificate of Eligibility (or they can pull it)</li>
              <li className="small">Recent LES or pay stubs; W-2s if you have civilian income</li>
              <li className="small">Roughly two years of work or service history</li>
              <li className="small">A ballpark of monthly debts - car, cards, student loans</li>
            </ul>
          </div>
          <div>
            <strong className="small">Ask the lender:</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, display: "grid", gap: 4 }}>
              <li className="small">&quot;How many VA loans did you close last year?&quot;</li>
              <li className="small">&quot;What rate and total fees would I qualify for today?&quot;</li>
              <li className="small">&quot;Am I funding-fee exempt?&quot; (you typically are if you receive disability compensation)</li>
              <li className="small">&quot;What would make me a stronger applicant in 6 months?&quot;</li>
            </ul>
          </div>
          <div>
            <strong className="small">Ask a real-estate agent:</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, display: "grid", gap: 4 }}>
              <li className="small">&quot;How many VA purchases have you closed?&quot;</li>
              <li className="small">&quot;Will you push back on sellers who wrongly assume VA offers are weaker?&quot;</li>
              <li className="small">Ask your VSO post or local veteran community who they used - a referral from another veteran beats any ad.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Neutral lender guidance. HOUSING_PARTNERS stays empty until task #32
          is decided - see lib/housing.ts for the full rule. */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}><i className="ti ti-building-bank" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> Finding a lender or agent</h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
          <li className="small">The VA does not lend money or endorse lenders - <strong>almost any bank, credit union, or mortgage company can make a VA loan</strong>.</li>
          <li className="small">Get quotes from <strong>at least two lenders</strong>. Rates and fees on VA loans vary more than most people expect, and comparing is free.</li>
          <li className="small">Ask an agent two questions: have you closed VA purchases before, and will you push back on sellers who wrongly assume VA offers are weaker? Both matter.</li>
          <li className="small">Never pay anyone just to be &quot;connected&quot; to a VA lender, and treat cold calls about your VA loan benefit as spam - <a href="https://www.consumerfinance.gov/consumer-tools/mortgages/" target="_blank" rel="noopener noreferrer">CFPB&apos;s mortgage guides</a> are free.</li>
        </ul>
        {HOUSING_PARTNERS.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <strong className="small">Sponsored connections (paid partnerships, clearly labeled):</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {HOUSING_PARTNERS.map((p) => (
                <li key={p.name} className="small">{p.name} - {p.role} · <a href={p.url} target="_blank" rel="noopener noreferrer sponsored">visit</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <Callout kind="info">
          <i className="ti ti-info-circle" aria-hidden="true" />
          <span>
            Home values are market estimates, not appraisals, and they move. Confirm prices with current
            listings, and confirm loan terms with your lender and{" "}
            <a href="https://www.va.gov/housing-assistance/home-loans/" target="_blank" rel="noopener noreferrer">VA.gov</a>.
            VetPath is not the VA, not a lender, and not a real-estate brokerage.
          </span>
        </Callout>
      </div>
    </Wrap>
  );
}
