"use client";
// Reserve & National Guard - the option most first-termers never hear explained.
// Essentials are visible; the detail sits behind "What this means" toggles so the page
// stays readable for someone who is not fluent in benefits language.
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { residenceStates, stateName, realStateInfo, BRAND } from "@/lib/data";
import { Wrap, SectionHead, Callout } from "@/components/ui";
import {
  reserveFit,
  orderedBenefits,
  stateEducationFor,
  COMPONENTS,
  CATEGORY_META,
  RESERVES_VERIFIED,
  RESERVES_DISCLAIMER,
  RESERVES_NOT_RECRUITER,
  STATE_EDUCATION_NOTE,
  STATE_EDUCATION_COVERAGE,
} from "@/lib/reserves";
import type { ReserveBenefit } from "@/lib/reserves";

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a className="small" href={href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 6 }}>
      {label} <i className="ti ti-external-link" style={{ fontSize: 12 }} aria-hidden="true" />
    </a>
  );
}

function WhoTag({ who }: { who: ReserveBenefit["who"] }) {
  const map = {
    both: { label: "Guard & Reserve", bg: "var(--chip-bg)", ink: "var(--chip-ink)" },
    guard: { label: "National Guard", bg: "var(--accent-soft)", ink: "var(--accent-ink)" },
    reserve: { label: "Reserve", bg: "var(--success-soft)", ink: "var(--success)" },
  }[who];
  return (
    <span className="chip sm" style={{ background: map.bg, color: map.ink, margin: 0, fontWeight: 600 }}>
      {map.label}
    </span>
  );
}

function BenefitCard({ b, lead }: { b: ReserveBenefit; lead: boolean }) {
  const [open, setOpen] = useState(false);
  const meta = CATEGORY_META[b.category];
  return (
    <div className="card" style={lead ? { borderColor: "var(--accent)", borderWidth: 2 } : undefined}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="iconwrap" style={{ flex: "none" }}>
          <i className={`ti ${meta.icon}`} aria-hidden="true" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
            <span className="small muted">{meta.label}</span>
            <WhoTag who={b.who} />
            {lead && (
              <span className="chip sm gold" style={{ margin: 0, fontWeight: 600 }}>
                <i className="ti ti-star" aria-hidden="true" /> Start here
              </span>
            )}
          </div>
          <h3 style={{ margin: "0 0 4px" }}>{b.name}</h3>
          <p style={{ margin: 0 }}>{b.summary}</p>
        </div>
      </div>

      <button
        type="button"
        className="btn ghost sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ marginTop: 12 }}
      >
        <i className={`ti ti-chevron-${open ? "up" : "down"}`} aria-hidden="true" /> {open ? "Close" : "What this means"}
      </button>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <p style={{ margin: 0 }}>{b.detail}</p>
          {b.eligibility && (
            <p className="small" style={{ margin: "10px 0 0" }}>
              <strong>Who qualifies:</strong> {b.eligibility}
            </p>
          )}
          {b.note && (
            <p className="small muted" style={{ margin: "8px 0 0" }}>
              <i className="ti ti-info-circle" aria-hidden="true" /> {b.note}
            </p>
          )}
          <SourceLink href={b.source} label={b.sourceLabel} />
        </div>
      )}
    </div>
  );
}

export default function Reserves() {
  const { s, ready } = useStore();
  const [showAll, setShowAll] = useState(false);

  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;

  const a = s.answers || {};
  const fit = reserveFit(a);
  const benefits = orderedBenefits(fit);
  const codes = residenceStates(a);
  const statePrograms = stateEducationFor(codes);
  const lead = new Set(fit.leadWith.slice(0, 2));

  // Essentials first: the two or three cards that matter to this person, rest behind a toggle.
  const visible = showAll ? benefits : benefits.slice(0, 3);

  return (
    <Wrap>
      <SectionHead
        eyebrow="Reserves & National Guard"
        title="The option most people never get explained"
        sub="Most people who leave finish one contract and never hear what part-time service would actually cover. This is not a recruiting pitch. It is the honest math, so you can decide."
      />

      {/* Why this matters to this specific veteran. */}
      {fit.reasons.length > 0 && (
        <div className="card" style={{ background: "var(--primary)", color: "#fff", border: "none", marginTop: 16 }}>
          <span className="chip gold">
            <i className="ti ti-target-arrow" aria-hidden="true" /> Why we are showing you this
          </span>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {fit.reasons.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <i className={`ti ${r.icon}`} aria-hidden="true" style={{ color: "var(--accent)", fontSize: 19, marginTop: 2, flex: "none" }} />
                <span style={{ color: "#CBD8E4" }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The structural distinction. Testers flagged that people conflate these two. */}
      <h3 style={{ margin: "28px 0 0" }}>
        <i className="ti ti-git-branch" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> These are two different things
      </h3>
      <p className="muted small" style={{ margin: "4px 0 0" }}>
        People use "Guard" and "Reserve" interchangeably. They are not the same, and the difference changes which benefits you get.
      </p>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", marginTop: 12 }}>
        {COMPONENTS.map((c) => (
          <div key={c.id} className="card">
            <h4 style={{ margin: "0 0 2px" }}>{c.label}</h4>
            <p className="small" style={{ margin: "0 0 10px", color: "var(--accent-ink)", fontWeight: 600 }}>{c.essence}</p>
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
              {c.points.map((p, i) => <li key={i} className="small">{p}</li>)}
            </ul>
            <SourceLink href={c.source} label={c.sourceLabel} />
          </div>
        ))}
      </div>

      {/* The benefit stack, ordered by relevance. */}
      <h3 style={{ margin: "30px 0 0" }}>
        <i className="ti ti-stack-2" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> What part-time service actually covers
      </h3>
      <p className="muted small" style={{ margin: "4px 0 12px" }}>
        Ordered for your situation. Tap any card to see how it works and where to verify it.
      </p>
      <div style={{ display: "grid", gap: 14 }}>
        {visible.map((b) => <BenefitCard key={b.id} b={b} lead={lead.has(b.id)} />)}
      </div>
      {benefits.length > 3 && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button type="button" className="btn ghost" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
            <i className={`ti ti-chevron-${showAll ? "up" : "down"}`} aria-hidden="true" />{" "}
            {showAll ? "Show fewer" : `Show all ${benefits.length}`}
          </button>
        </div>
      )}

      {/* State education: attaches to the Guard, so it is genuinely state-specific. */}
      <h3 style={{ margin: "30px 0 0" }}>
        <i className="ti ti-map-pin" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> Your state
      </h3>
      <p className="muted small" style={{ margin: "4px 0 12px" }}>
        {STATE_EDUCATION_NOTE}{" "}
        {STATE_EDUCATION_COVERAGE >= 51
          ? "We have verified all 50 states and the District of Columbia against official sources."
          : `We have verified ${STATE_EDUCATION_COVERAGE} jurisdictions so far. If yours is not listed, that does not mean it has no program, only that we have not confirmed one yet, so go straight to your state's agency.`}
      </p>

      {statePrograms.length > 0 ? (
        <div style={{ display: "grid", gap: 14 }}>
          {statePrograms.map((p) => (
            <div key={`${p.code}-${p.program}`} className="card">
              <span className="chip sm" style={{ margin: 0 }}>{stateName(p.code) || p.code}</span>
              <h4 style={{ margin: "8px 0 4px" }}>{p.program}</h4>
              <p style={{ margin: 0 }}>{p.blurb}</p>
              {p.eligibility && (
                <p className="small" style={{ margin: "8px 0 0" }}><strong>Who qualifies:</strong> {p.eligibility}</p>
              )}
              <SourceLink href={p.source} label={p.sourceLabel} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          {codes.length > 0 ? (
            <>
              <p style={{ margin: 0 }}>
                We do not have a verified Guard education program on file for{" "}
                {codes.map((c) => stateName(c) || c).join(", ")}. That does not mean there is none. State programs change with
                state funding, so go straight to the source.
              </p>
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {codes.map((c) => {
                  const info = realStateInfo(c);
                  return info ? (
                    <SourceLink key={c} href={info.agency.url} label={`${stateName(c) || c}: ${info.agency.name}`} />
                  ) : null;
                })}
              </div>
            </>
          ) : (
            <p style={{ margin: 0 }}>
              Tell us where you live and we will pull your state's Guard education programs and agency.{" "}
              <Link href="/onboarding">Add your state</Link>.
            </p>
          )}
        </div>
      )}

      {/* Boundaries. VetPath is not a recruiter and this must never read like one. */}
      <div style={{ marginTop: 28 }}>
        <Callout kind="info">
          <strong>{BRAND.name} is not a recruiter.</strong> {RESERVES_NOT_RECRUITER}
        </Callout>
      </div>

      <p className="small muted" style={{ marginTop: 18 }}>
        Verified {RESERVES_VERIFIED}. {RESERVES_DISCLAIMER}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <Link className="btn ghost" href="/tools"><i className="ti ti-arrow-left" aria-hidden="true" /> All tools</Link>
        <Link className="btn ghost" href="/benefits"><i className="ti ti-award" aria-hidden="true" /> Benefits library</Link>
      </div>
    </Wrap>
  );
}
