"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BRAND, STATE_BENEFITS } from "@/lib/data";
import { Wrap, Stat, Callout, Eyebrow, SectionHead } from "@/components/ui";
import PlanDemo from "@/components/PlanDemo";

/** Mission-band media: looping public-domain TAP-class footage; still photo when the user prefers reduced motion. */
function MissionMedia() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  if (reduced === null || reduced) {
    return (
      <img
        className="photo"
        src="/img/transition-summit-mentors.jpg"
        alt="A soldier takes notes as volunteer mentors walk her through her resume at a veterans transition summit"
        width={1600}
        height={1064}
        loading="lazy"
      />
    );
  }
  return (
    <video
      ref={(el) => { el?.play().catch(() => {}); }}
      className="photo"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/video/hero-poster.jpg"
      src="/video/hero-loop.mp4"
      aria-label="A transitioning soldier works through a Transition Assistance Program workbook in a classroom"
    />
  );
}

/** Hero backdrop: ambient looping footage under a navy scrim. Renders nothing when the user
 *  prefers reduced motion (or before hydration) — the hero-wrap gradient is the fallback. */
function HeroBackdrop() {
  const [motionOk, setMotionOk] = useState(false);
  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  if (!motionOk) return null;
  return (
    <>
      <video
        ref={(el) => { el?.play().catch(() => {}); }}
        className="hero-media"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/video/career-summit-poster.jpg?v=2"
        src="/video/career-summit-loop.mp4?v=2"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="hero-scrim" aria-hidden="true" />
    </>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div style={{ position: "relative", minHeight: 380 }}>
        {/* Animated route: A → destination, dashes marching toward the flag */}
        <svg className="route-svg" viewBox="0 0 440 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="march" d="M28 356 C 150 330, 70 240, 180 205 S 320 150, 402 52" stroke="rgba(255,255,255,.34)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="28" cy="356" r="6" fill="rgba(255,255,255,.55)" />
          <circle cx="180" cy="205" r="4.5" fill="rgba(255,255,255,.4)" />
          <circle className="pulse" cx="402" cy="52" r="7" fill="var(--accent)" />
        </svg>
        {/* Primary floating gameplan card */}
        <div className="floatcard f1" style={{ position: "absolute", top: 10, left: 0, right: 24, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent-soft)", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}><i className="ti ti-flag-3" /></span>
            <div>
              <div style={{ fontSize: 11.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 }}>Your destination</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, color: "var(--ink-strong)" }}>Electrician</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 500, color: "var(--primary)", lineHeight: 1 }}>93%</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>fit</div>
            </div>
          </div>
          <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 20, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: "60%", height: "100%", background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Days 1–90 · 6 of 10 actions started</div>
        </div>
        {/* Secondary stat chip */}
        <div className="floatcard f2" style={{ position: "absolute", top: 168, left: 40, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}><i className="ti ti-school" /></span>
          <div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>GI Bill housing stipend</div>
            <div style={{ fontWeight: 600, color: "var(--ink-strong)" }}>Paid while you apprentice</div>
          </div>
        </div>
        {/* Tertiary resource card */}
        <div className="floatcard f3" style={{ position: "absolute", top: 250, right: 6, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--success-soft)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}><i className="ti ti-map-pin" /></span>
          <div style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: "var(--ink-strong)" }}>Pittsburgh, PA</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>2 VA medical centers nearby</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <section className="hero-wrap">
        <HeroBackdrop />
        <div className="hero-orb" aria-hidden="true" />
        <div className="hero hero-inner">
          <div>
            <Eyebrow onDark>Veteran life planning · benefits · transition</Eyebrow>
            <h1 style={{ maxWidth: 620 }}>
              Stop hearing the same brief. Leave with <span className="accent-word">your</span> gameplan.
            </h1>
            <p className="hero-sub">
              {BRAND.name} turns your goals, family, and service into one adaptive roadmap — a recommended path, benefits optimized to your situation, 30/60/90-day steps, and a plan that changes when life does.
            </p>
            <div className="hero-cta">
              <Link className="btn gold" href="/onboarding"><i className="ti ti-compass" /> Build my gameplan</Link>
              <Link className="btn ghost" href="#how-it-works" style={{ background: "rgba(255,255,255,.08)", color: "#fff", borderColor: "rgba(255,255,255,.28)" }}>
                <i className="ti ti-arrow-down" /> See how it works
              </Link>
            </div>
            <div className="hero-trust">
              <span className="t"><i className="ti ti-shield-check" /> Built with and for veterans</span>
              <span className="t"><i className="ti ti-lock" /> Private — nothing shared</span>
              <span className="t"><i className="ti ti-circle-check" /> Points you to official sources</span>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <div className="trust-bar">
        <div className="trust-bar-inner">
          <span className="item"><i className="ti ti-map-pin-check" /> {STATE_BENEFITS.states.length} states verified from official sources</span>
          <span className="sep" />
          <span className="item"><i className="ti ti-award" /> {STATE_BENEFITS.states.reduce((n, s) => n + s.programs.length, 0)} benefit programs, each cited</span>
          <span className="sep" />
          <span className="item"><i className="ti ti-chart-bar" /> Careers on official BLS pay data</span>
          <span className="sep" />
          <Link className="item" href="/trust" style={{ color: "var(--accent-ink)", fontWeight: 600 }}>
            <i className="ti ti-shield-check" /> Every number has a source →
          </Link>
        </div>
      </div>

      <Wrap>
        <SectionHead
          eyebrow="Who it's for"
          title="Wherever you are after service, there's a path"
          sub="Whether you know exactly what's next or have no idea where to start, VetPath meets you where you are."
        />
        <div className="index-list">
          {([
            ["ti-plane-departure", "Transitioning out", "Separating soon and need benefits enrolled, a job or school lined up, and nothing left behind before your last day."],
            ["ti-briefcase", "Building a career", "Ready for a better job, a degree, a trade, or a business — and the veteran benefits that fund the move."],
            ["ti-clipboard-heart", "Navigating disability", "Understand the process, apply for the benefit you've earned, and get free accredited help — no guesswork."],
            ["ti-beach", "Retiring or organizing", "Plan the next chapter — pay, survivor protection, healthcare, and every document in one secure place."],
          ] as const).map(([icon, title, body], i) => (
            <div className="index-row" key={title} data-reveal={i * 70}>
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <span className="ttl"><i className={`ti ${icon}`} aria-hidden="true" /><h4>{title}</h4></span>
              <p className="desc">{body}</p>
            </div>
          ))}
        </div>

        <div id="how-it-works" style={{ marginTop: 56, scrollMarginTop: 80 }}>
          <SectionHead
            eyebrow="How it works"
            title="From where you stand to where you're headed"
            sub="Four steps. The plan updates itself as your answers and goals change."
          />
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
            {[
              ["ti-messages", "Tell us your story", "Age, state, service, goals — in the boxes or in your own words."],
              ["ti-compass", "Find your path", "The Pathfinder recommends a best-fit direction with a clear % fit and the reasoning behind it."],
              ["ti-map-2", "Get your gameplan", "Prioritized benefits and a 30/60/90-day action plan, all pointed at your destination."],
              ["ti-circle-check", "Act & verify", "Check off steps, gather documents, and confirm each one at VA.gov or an accredited VSO."],
            ].map(([icon, title, body], i) => (
              <div key={i} className="card" data-reveal={i * 90} style={{ position: "relative", paddingTop: 26 }}>
                <span style={{ position: "absolute", top: 18, right: 20, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 500, color: "var(--border)" }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="iconwrap" style={{ marginBottom: 14 }}><i className={`ti ${icon}`} aria-hidden="true" /></div>
                <h4 style={{ marginBottom: 6 }}>{title}</h4>
                <p className="muted small" style={{ margin: 0, lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 56 }} data-reveal="true">
          <SectionHead
            eyebrow="See it work"
            title="Watch a plan build itself"
            sub="From a veteran's answers to a recommended path to a living 30/60/90 plan — this is the engine, not a mockup."
          />
          <PlanDemo />
        </div>
      </Wrap>

      {/* Mission band — real transition-assistance footage (public domain; see /video/CREDITS.md).
          Video for most users; the still photo for reduced-motion users. */}
      <section className="mission-band grain">
        <MissionMedia />
        <div className="scrim" aria-hidden="true" />
        <div className="band-inner" data-reveal="true">
          <Eyebrow onDark>On the ground</Eyebrow>
          <h2>Nobody figures this out alone.</h2>
          <p className="band-sub">
            Across the country, mentors sit down with transitioning service members — one resume, one plan at a time. {BRAND.name} brings that same one-on-one clarity to your kitchen table.
          </p>
        </div>
        <span className="credit">U.S. Army footage, Fort Bliss SFL-TAP · public domain</span>
      </section>

      <Wrap>
        <div>
          <Callout kind="info">
            <strong>A planning tool, not the VA.</strong> {BRAND.name} helps you organize and prioritize. It does not determine eligibility or provide legal, medical, or financial advice. Benefit content is verified against official sources where marked — <Link href="/trust">see how we earn trust</Link>.
          </Callout>
        </div>

        <div className="card" data-reveal="true" style={{ marginTop: 24, textAlign: "center", padding: "40px 24px", background: "var(--surface-2)", border: "1px solid var(--hairline)", position: "relative", overflow: "hidden" }}>
          <svg className="compass-mark" viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <circle cx="100" cy="100" r="96" stroke="var(--primary)" strokeWidth="2" />
            <circle cx="100" cy="100" r="70" stroke="var(--primary)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="44" stroke="var(--primary)" strokeWidth="1" />
            <path d="M100 14 L108 92 L100 100 L92 92 Z" fill="var(--primary)" />
            <path d="M100 186 L92 108 L100 100 L108 108 Z" fill="var(--accent)" />
            <path d="M14 100 L92 92 L100 100 L92 108 Z" fill="var(--primary)" opacity=".55" />
            <path d="M186 100 L108 108 L100 100 L108 92 Z" fill="var(--primary)" opacity=".55" />
          </svg>
          <Eyebrow>Your next mission</Eyebrow>
          <h2 style={{ margin: "0 0 8px", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>Ten minutes now saves months of guessing later.</h2>
          <p className="muted" style={{ maxWidth: 480, margin: "0 auto 22px" }}>Answer a few questions and walk away with a plan you can actually follow.</p>
          <Link className="btn" href="/onboarding" style={{ display: "inline-flex" }}><i className="ti ti-arrow-right" /> Start my gameplan</Link>
        </div>
      </Wrap>
    </>
  );
}
