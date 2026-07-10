"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { BENEFITS, STATE_GENERIC, STATE_BENEFITS, realStateInfo, stateName, stateSamples, BRAND, benefitById } from "@/lib/data";
import type { Benefit } from "@/lib/types";
import { Wrap, Callout, SectionHead } from "@/components/ui";
import { optimizeBenefits, type OptimizedBenefit, type Tier } from "@/lib/optimizer";

const CAT_ICON: Record<string, string> = {
  tax: "ti-receipt-tax", education: "ti-school", employment: "ti-briefcase", housing: "ti-home",
  recreation: "ti-trees", health: "ti-stethoscope", business: "ti-rocket", other: "ti-star",
};

const TIER_META: Record<Tier, { label: string; icon: string; blurb: string }> = {
  now: { label: "Act on these now", icon: "ti-bolt", blurb: "Timing or your situation makes these the first moves." },
  check: { label: "Worth checking", icon: "ti-zoom-check", blurb: "Likely relevant — confirm the details against your exact situation." },
  later: { label: "Later", icon: "ti-clock", blurb: "Keep on the radar; nothing urgent from your answers." },
  unlikely: { label: "Probably not a fit right now", icon: "ti-circle-dashed", blurb: "Based on your answers — revisit if things change." },
};

/** Extra verified-metadata fields present in the JSON but not in the shared Benefit type (types.ts is read-only). */
type VerifiedBenefit = Benefit & { lastVerified?: string; sources?: string[] };

export default function Benefits() {
  const { s } = useStore();
  const a = s.answers;
  const real = realStateInfo(a.state);
  const samples = stateSamples(a.state);
  const stateList = a.state ? (samples && samples.length ? samples : [STATE_GENERIC]) : [];

  const hasProfile = !!s.profile;
  const optimized = useMemo(() => (hasProfile ? optimizeBenefits(a) : []), [hasProfile, a]);

  // Accordion open state is lifted so "Optimized for you" items can open + scroll to a category.
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => (BENEFITS[0] ? { [BENEFITS[0].id]: true } : {}));
  const toggle = (id: string) => setOpenIds((p) => ({ ...p, [id]: !p[id] }));
  const jumpTo = (id: string) => {
    setOpenIds((p) => ({ ...p, [id]: true }));
    document.getElementById(`benefit-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Wrap>
      <h2>Benefits &amp; resources library</h2>
      <p className="muted">Every card links to the official source you should use to verify.</p>
      <div style={{ margin: "8px 0 18px" }}>
        <Callout kind="warn">
          {BRAND.name} does not determine eligibility — confirm everything with VA.gov, your state agency, or an accredited VSO. Federal content below was checked against official sources (see the verified date on each card), but rules change — always confirm current details.
        </Callout>
      </div>

      {hasProfile ? (
        <OptimizedSection name={s.profile!.name} optimized={optimized} onJump={jumpTo} />
      ) : (
        <div className="card feature" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}><i className="ti ti-route" style={{ color: "var(--accent-ink)" }} /> See what likely applies to you — and when</h3>
          <p style={{ margin: "6px 0 14px" }}>
            Answer a few questions about your service, rating, family, and goals, and {BRAND.name} will order this
            library around your situation: what to act on now, what to check, and what can wait.
          </p>
          <Link className="btn gold" href="/onboarding">Build my gameplan <i className="ti ti-arrow-right" /></Link>
        </div>
      )}

      {a.state && real ? (
        <div className="card feature" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}><i className="ti ti-map-pin" style={{ color: "var(--accent-ink)" }} /> {real.name} — state benefits</h3>
            <span className="chip" style={{ background: "var(--success-soft)", color: "var(--success)", margin: 0 }}>
              <i className="ti ti-circle-check" /> Verified {STATE_BENEFITS.lastVerified}
            </span>
          </div>
          <p className="small" style={{ margin: "8px 0 12px" }}>
            Your state agency: <a href={real.agency.url} target="_blank" rel="noopener noreferrer"><strong>{real.agency.name}</strong> <i className="ti ti-external-link" style={{ fontSize: 14 }} /></a>
          </p>
          {real.programs.map((p) => (
            <div key={p.name} style={{ padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <i className={`ti ${CAT_ICON[p.category] || CAT_ICON.other}`} aria-hidden="true" style={{ color: "var(--accent-ink)", fontSize: 19, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <strong>{p.name}</strong>
                  <div className="small" style={{ margin: "2px 0 4px" }}>{p.blurb}</div>
                  <a className="small" href={p.source} target="_blank" rel="noopener noreferrer">Official source <i className="ti ti-external-link" style={{ fontSize: 13 }} /></a>
                </div>
              </div>
            </div>
          ))}
          <p className="small muted" style={{ marginTop: 10 }}>
            Program rules change — details were verified against official sources on {STATE_BENEFITS.lastVerified}; always confirm current terms with {real.agency.name} before acting.
          </p>
        </div>
      ) : a.state ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3><i className="ti ti-map-pin" style={{ color: "var(--accent-ink)" }} /> {stateName(a.state)} — state benefits (sample)</h3>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{stateList.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p className="small muted" style={{ marginTop: 10 }}>Placeholder examples only. Verify with your state Department of Veterans Affairs.</p>
        </div>
      ) : null}

      {BENEFITS.map((b) => (
        <Accordion key={b.id} b={b} open={!!openIds[b.id]} onToggle={() => toggle(b.id)} />
      ))}
    </Wrap>
  );
}

function OptimizedSection({ name, optimized, onJump }: { name: string; optimized: OptimizedBenefit[]; onJump: (id: string) => void }) {
  const [showUnlikely, setShowUnlikely] = useState(false);
  const tiers: Tier[] = ["now", "check", "later", "unlikely"];

  return (
    <section aria-label="Benefits optimized for you" style={{ marginBottom: 28 }}>
      <SectionHead
        eyebrow="Optimized for you"
        title={`${name}, here's what likely applies — and when`}
        sub="Built from your own answers: rating, status, family, state, goals, and timing."
      />
      <div style={{ margin: "0 0 16px" }}>
        <Callout kind="info">
          This ordering is <strong>decision support from your answers — not an eligibility determination</strong>. Only VA, your state agency, or an accredited VSO can confirm eligibility; verify each item at its official source.
        </Callout>
      </div>

      {tiers.map((tier) => {
        const items = optimized.filter((o) => o.tier === tier);
        if (items.length === 0) return null;
        const meta = TIER_META[tier];
        const collapsed = tier === "unlikely" && !showUnlikely;

        return (
          <div key={tier} style={{ marginBottom: 18 }}>
            {tier === "unlikely" ? (
              <button
                type="button"
                aria-expanded={showUnlikely}
                onClick={() => setShowUnlikely((v) => !v)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: "6px 0", fontFamily: "inherit", color: "var(--muted)", fontSize: "inherit" }}
              >
                <i className={`ti ${meta.icon}`} aria-hidden="true" />
                <strong>{meta.label} ({items.length})</strong>
                <i className="ti ti-chevron-down" aria-hidden="true" style={{ transform: showUnlikely ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
            ) : (
              <h3 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                <i className={`ti ${meta.icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {meta.label}
              </h3>
            )}
            {!collapsed && (
              <>
                {tier !== "unlikely" && <p className="muted small" style={{ margin: "0 0 10px" }}>{meta.blurb}</p>}
                <div style={{ display: "grid", gap: 10 }}>
                  {items.map((o) => <OptimizedCard key={o.id} o={o} onJump={onJump} />)}
                </div>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}

function OptimizedCard({ o, onJump }: { o: OptimizedBenefit; onJump: (id: string) => void }) {
  const b = benefitById(o.id);
  if (!b) return null;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="iconwrap" style={{ width: 38, height: 38, fontSize: 18, ...(b.crisis ? { background: "var(--danger-soft)", color: "var(--danger)" } : {}) }}>
          <i className={`ti ${b.icon}`} aria-hidden="true" />
        </div>
        <h4 style={{ margin: 0, flex: "1 1 auto" }}>{b.name}</h4>
        {o.timing && (
          <span className="chip gold" style={{ margin: 0 }}>
            <i className="ti ti-calendar-time" aria-hidden="true" /> {o.timing}
          </span>
        )}
      </div>
      <ul style={{ margin: "10px 0 12px", paddingLeft: 20 }}>
        {o.reasons.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
      </ul>
      <button type="button" className="btn ghost sm" onClick={() => onJump(o.id)}>
        Details &amp; official source <i className="ti ti-arrow-down" aria-hidden="true" />
      </button>
    </div>
  );
}

function Accordion({ b, open, onToggle }: { b: Benefit; open: boolean; onToggle: () => void }) {
  const vb = b as VerifiedBenefit;
  return (
    <div id={`benefit-${b.id}`} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 12, background: "var(--surface)", scrollMarginTop: 90 }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, cursor: "pointer", width: "100%", textAlign: "left", background: "transparent", border: "none", fontFamily: "inherit", color: "var(--ink)" }}
      >
        <div className="iconwrap" style={b.crisis ? { background: "var(--danger-soft)", color: "var(--danger)" } : {}}>
          <i className={`ti ${b.icon}`} aria-hidden="true" />
        </div>
        <div>
          <h4 style={{ margin: 0 }}>
            {b.name} {b.placeholder && <span className="pill low">placeholder</span>} {b.sensitive && <span className="pill medium">handle with care</span>}
          </h4>
          <p className="muted small" style={{ margin: "2px 0 0" }}>{b.summary}</p>
        </div>
        <i className="ti ti-chevron-down" aria-hidden="true" style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 22, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <p><strong>Who it&apos;s for:</strong> {b.whoFor}</p>
          <div style={{ marginBottom: 12 }}>
            <Callout kind="info"><strong>Eligibility:</strong> {b.eligibility}</Callout>
          </div>
          {b.steps && b.steps.length > 0 && (
            <>
              <h4>First steps</h4>
              <ol className="steps" style={{ marginBottom: 12 }}>{b.steps.map((st, i) => <li key={i}>{st}</li>)}</ol>
            </>
          )}
          {b.documents.length > 0 && (
            <>
              <h4>Documents</h4>
              <div style={{ marginBottom: 12 }}>{b.documents.map((d) => <span key={d} className="tag">{d}</span>)}</div>
            </>
          )}
          <a className="btn ghost sm" href={b.official.url} target="_blank" rel="noopener noreferrer">{b.official.name} <i className="ti ti-external-link" /></a>
          {vb.lastVerified && (
            <p className="small muted" style={{ margin: "10px 0 0" }}>
              Checked against official sources on {vb.lastVerified} — rules change; confirm current details at the link above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
