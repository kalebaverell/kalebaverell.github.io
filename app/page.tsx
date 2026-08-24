"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BRAND, STATE_BENEFITS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Wrap, Stat, Eyebrow, SectionHead } from "@/components/ui";
import PlanDemo from "@/components/PlanDemo";

/** The homepage CTA follows the funnel: build a plan if you don't have one,
 *  get back into it if you do. Sending a returning veteran to the quiz they
 *  already finished reads like the site forgot them. */
function CtaLink({ xl, style }: { xl?: boolean; style?: React.CSSProperties }) {
  const { s, ready } = useStore();
  const hasPlan = ready && Boolean(s.gameplan);
  return (
    <Link className={`btn gold${xl ? " xl" : ""}`} href={hasPlan ? "/dashboard" : "/onboarding"} style={style}>
      <i className={`ti ${hasPlan ? "ti-map-check" : "ti-compass"}`} /> {hasPlan ? "Open my gameplan" : "Build my gameplan"}
    </Link>
  );
}

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

/* Hero backdrop: a smooth crossfading slideshow of public-domain veteran-transition
   imagery under a navy scrim - spanning mentorship, interview prep, networking, trade
   training, and planning. See public/img/CREDITS.md for sourcing (all DVIDS, public domain). */
const HERO_SLIDES: { src: string; alt: string }[] = [
  { src: "/img/transition-summit-mentors.jpg", alt: "Volunteer mentors walk a transitioning soldier through her resume at a veterans summit" },
  { src: "/img/hero-workshop.jpg", alt: "A transition workshop on what to say in civilian interviews" },
  { src: "/img/hero-networking.jpg", alt: "Service members and civilian recruiters connect at a career summit" },
  { src: "/img/tap-electrical-training.jpg", alt: "A transitioning service member trains in a licensed electrical trade" },
  { src: "/video/hero-poster.jpg", alt: "A service member works through a transition-planning workbook in a classroom" },
];

/** Renders a single static image before hydration and under prefers-reduced-motion; the
 *  crossfading, slowly-zooming slideshow otherwise. Always sits beneath the navy scrim. */
function HeroBackdrop() {
  const [motionOk, setMotionOk] = useState<boolean | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!motionOk) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), 5200);
    return () => clearInterval(t);
  }, [motionOk]);

  if (motionOk === null || !motionOk) {
    return (
      <>
        <div className="hero-slideshow" aria-hidden="true">
          <div className="hero-slide active" style={{ backgroundImage: `url(${HERO_SLIDES[0].src})` }} />
        </div>
        <div className="hero-scrim" aria-hidden="true" />
      </>
    );
  }

  // The outgoing slide is kept fully opaque *beneath* the incoming one (the ".prev" layer)
  // so the crossfade never lets the dark background bleed through at the midpoint.
  const prevIdx = (idx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
  return (
    <>
      <div className="hero-slideshow" aria-hidden="true">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.src}
            className={`hero-slide${i === idx ? " active" : i === prevIdx ? " prev" : ""}`}
            style={{ backgroundImage: `url(${s.src})` }}
          />
        ))}
      </div>
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
        <div className="hero hero-inner">
          <div>
            {/* Proof before the pitch: real counts, pulled from the same data the site cites. */}
            <span className="hero-proof">
              <i className="ti ti-shield-check" aria-hidden="true" />
              {STATE_BENEFITS.states.reduce((n, s) => n + s.programs.length, 0)} benefit programs · 51 states &amp; D.C. · every number sourced
            </span>
            <h1 style={{ maxWidth: 620 }}>
              Find your <span className="accent-word">next</span> steps.
            </h1>
            <p className="hero-sub">
              Answer a few questions. Get a plan for your next 90 days: the career, the benefits, the place to land.
            </p>
            <div className="hero-cta">
              <CtaLink xl />
            </div>
            <div className="hero-trust">
              <span className="t"><i className="ti ti-shield-check" /> Free. Built with veterans</span>
              <span className="t"><i className="ti ti-lock" /> Private, nothing shared</span>
              <span className="t"><i className="ti ti-circle-check" /> Every number has an official source</span>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <div className="trust-bar">
        <div className="trust-bar-inner">
          <span className="item"><i className="ti ti-map-pin-check" /> {STATE_BENEFITS.states.filter((s) => s.code !== "DC").length} states + D.C. verified from official sources</span>
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
            ["ti-briefcase", "Building a career", "Ready for a better job, a degree, a trade, or a business, with the veteran benefits that fund the move."],
            ["ti-clipboard-heart", "Navigating disability", "Understand the process, apply for the benefit you've earned, and get free accredited help. No guesswork."],
            ["ti-beach", "Retiring or organizing", "Plan the next chapter: pay, survivor protection, healthcare, and every document in one secure place."],
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
              ["ti-messages", "Tell us your story", "Age, state, service, goals. In the boxes or in your own words."],
              ["ti-compass", "Find your path", "The Pathfinder recommends a best-fit direction with a clear % fit and the reasoning behind it."],
              ["ti-map-2", "Get your gameplan", "Prioritized benefits and a 30/60/90-day action plan, all pointed at your destination."],
              ["ti-circle-check", "Act & verify", "Check off steps, gather documents, and confirm each one at VA.gov or an accredited VSO."],
            ].map(([icon, title, body], i) => (
              <div key={i} className="card" data-reveal={i * 90}>
                <span className="step-num" aria-hidden="true">Step {String(i + 1).padStart(2, "0")}</span>
                <h4 style={{ margin: "12px 0 6px" }}><i className={`ti ${icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {title}</h4>
                <p className="muted small" style={{ margin: 0, lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 26 }} data-reveal="true">
            <CtaLink />
          </div>
        </div>

        <div style={{ marginTop: 56 }} data-reveal="true">
          <SectionHead
            eyebrow="See it work"
            title="Watch a plan build itself"
            sub="A sample veteran's answers becoming a real plan. Yours works the same way."
          />
          <PlanDemo />
          <div style={{ textAlign: "center", marginTop: 26 }} data-reveal="true">
            <CtaLink />
          </div>
        </div>
      </Wrap>

      {/* Mission band - real transition-assistance footage (public domain; see /video/CREDITS.md).
          Video for most users; the still photo for reduced-motion users. */}
      <section className="mission-band grain">
        <MissionMedia />
        <div className="scrim" aria-hidden="true" />
        <div className="band-inner" data-reveal="true">
          <Eyebrow onDark>On the ground</Eyebrow>
          <h2>Nobody figures this out alone.</h2>
          <p className="band-sub">
            Across the country, mentors sit down with transitioning service members - one resume, one plan at a time. {BRAND.name} brings that same one-on-one clarity to your kitchen table.
          </p>
        </div>
        <span className="credit">U.S. Army footage, Fort Bliss SFL-TAP · public domain</span>
      </section>

      {/* Beyond the plan - tool doorways ordered by real engagement
          (state benefits and family lead; see docs/traction notes). */}
      <Wrap>
        <div style={{ marginTop: 56, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }} data-reveal="true">
          <SectionHead
            eyebrow="Beyond the plan"
            title="Start with the plan. Go deeper when you're ready."
          />
          <Link href="/tools" style={{ fontWeight: 600, color: "var(--primary-800)", display: "inline-flex", alignItems: "center", gap: 6, paddingBottom: 24 }}>
            All tools <i className="ti ti-arrow-right" aria-hidden="true" />
          </Link>
        </div>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {([
            ["/benefits", "ti-map-2", "Benefits in your state", "Property tax to tuition - what your state actually offers on top of your federal benefits, verified and cited.", "Most used"],
            ["/family", "ti-users", "Plan as a household", "Spouse careers, school moves, caregiving - shared checkpoints so the whole family lands together.", "Family favorite"],
            ["/pathfinder", "ti-compass", "Career pathfinder", "Eleven questions. Your best-fit civilian paths, ranked and explained, with real federal pay data.", "11 questions"],
          ] as const).map(([href, icon, title, body, tag], i) => (
            <Link key={href} href={href} className="card" data-reveal={i * 90} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <div className="iconwrap" style={{ marginBottom: 14 }}><i className={`ti ${icon}`} aria-hidden="true" /></div>
              <h4 style={{ marginBottom: 6 }}>{title}</h4>
              <p className="muted small" style={{ margin: 0, lineHeight: 1.6 }}>{body}</p>
              <span className="chip gold" style={{ marginTop: 14, fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>{tag}</span>
            </Link>
          ))}
        </div>
      </Wrap>

      <Wrap>
        {/* Final CTA - flat centered treatment from the fortune preview:
            no card box, wider measure, micro trust line under the button. */}
        <div data-reveal="true" style={{ marginTop: 40, marginBottom: 8, textAlign: "center", padding: "24px 24px 0" }}>
          <Eyebrow>Your next mission</Eyebrow>
          <h2 style={{ margin: "0 0 10px", maxWidth: 660, marginLeft: "auto", marginRight: "auto" }}>Ten minutes now saves months of guessing later.</h2>
          <p className="muted" style={{ maxWidth: 520, margin: "0 auto 26px" }}>Answer a few questions and walk away with a plan you can actually follow.</p>
          <CtaLink xl style={{ display: "inline-flex" }} />
          <p className="muted" style={{ fontSize: 13.5, margin: "16px 0 0" }}>Free &middot; no app &middot; works on any phone</p>
        </div>

        {/* Supporter band - a visible doorway for family and community.
            Gold stays reserved for the veteran CTA above; this answers in
            the mission-band's green with a cream button, so the two asks
            read as different conversations, not competing ones. */}
        <div
          id="for-supporters"
          data-reveal="true"
          style={{
            marginTop: 44,
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(160deg, #11785E 0%, #0F6E56 45%, #0A4A3C 100%)",
            padding: "30px 38px",
            boxShadow: "0 14px 36px rgba(7, 61, 48, .24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 320px", minWidth: 260 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 23,
                lineHeight: 1.2,
                letterSpacing: "-.012em",
                color: "#FBFAF7",
              }}
            >
              Keep it free for the <em style={{ fontStyle: "italic", color: "#F3D9B8" }}>next veteran.</em>
            </div>
            <div style={{ marginTop: 5, fontSize: 13.5, color: "rgba(251, 250, 247, .78)" }}>
              {BRAND.name} runs on supporters, not ads - any amount helps.
            </div>
          </div>
          <a
            className="btn"
            href="/support"
            style={{ background: "#FBFAF7", color: "var(--primary-800)", boxShadow: "0 2px 10px rgba(7, 61, 48, .3)" }}
          >
            <i className="ti ti-heart" aria-hidden="true" /> Support the mission
          </a>
        </div>
      </Wrap>
    </>
  );
}
