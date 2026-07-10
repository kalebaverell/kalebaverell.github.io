"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { TRACKS, CAREERS, ASSESSMENT, careerById, trackById } from "@/lib/data";
import { scoreCareers, topTrack, locationGuidance } from "@/lib/pathfinder";
import type { Career, CareerFit } from "@/lib/types";
import { Wrap, Callout, ProgressBar, Eyebrow } from "@/components/ui";

type View = { kind: "intro" } | { kind: "browse"; track?: string } | { kind: "assess"; q: number } | { kind: "results" } | { kind: "detail"; careerId: string; fromResults?: boolean };

export default function Pathfinder() {
  const { s, ready } = useStore();
  const [view, setView] = useState<View>({ kind: "intro" });
  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;

  if (view.kind === "intro") return <Intro setView={setView} hasPath={!!s.chosenPath} />;
  if (view.kind === "browse") return <Browse track={view.track} setView={setView} />;
  if (view.kind === "assess") return <Assess q={view.q} setView={setView} />;
  if (view.kind === "results") return <Results setView={setView} />;
  return <Detail careerId={view.careerId} fromResults={view.fromResults} setView={setView} />;
}

function Intro({ setView, hasPath }: { setView: (v: View) => void; hasPath: boolean }) {
  const { s } = useStore();
  const chosen = careerById(s.chosenPath?.careerId);
  return (
    <Wrap>
      <div className="intro-split" style={{ marginBottom: 8 }}>
        <div>
          <Eyebrow>Decision engine</Eyebrow>
          <h2>Pathfinder — pick your next mission</h2>
          <p className="muted" style={{ maxWidth: 640, margin: 0 }}>
            Transition programs teach four tracks out of the service. Choose one directly, or let the decision engine recommend your best-fit path from what matters to you.
          </p>
        </div>
        <figure className="photo-frame">
          <img
            src="/img/tap-electrical-training.jpg"
            alt="A transitioning soldier wires a training panel during a hands-on electrical trades program"
            width={880}
            height={708}
          />
          <figcaption className="photo-cap">
            Hands-on before the last day in uniform: a Fort Bliss soldier trains for a civilian electrical career. <span style={{ opacity: 0.75 }}>U.S. government photo · public domain</span>
          </figcaption>
        </figure>
      </div>
      {chosen && (
        <div style={{ margin: "12px 0" }}>
          <Callout kind="info">
            <strong>Current destination: {chosen.label}</strong>{s.chosenPath?.fitPct ? ` — ${s.chosenPath.fitPct}% fit (demo)` : ""}. You can change it anytime below.
          </Callout>
        </div>
      )}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", margin: "18px 0" }}>
        {TRACKS.map((t) => (
          <button key={t.id} type="button" className="card" onClick={() => setView({ kind: "browse", track: t.id })}
            style={{ cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: "inherit", color: "var(--ink)" }}>
            <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="iconwrap"><i className={`ti ${t.icon}`} aria-hidden="true" /></span>
              <span style={{ fontWeight: 600, fontSize: "var(--fs-h4)" }}>{t.label}</span>
            </span>
            <span className="muted small" style={{ display: "block", margin: "10px 0 0" }}>{t.blurb}</span>
          </button>
        ))}
      </div>
      <div className="card" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ maxWidth: 420 }}>
          <h3 style={{ margin: 0 }}>Not sure which track?</h3>
          <p className="muted small" style={{ margin: "4px 0 0" }}>Answer {ASSESSMENT.questions.length} quick questions. We&apos;ll rank your best-fit paths with a % fit and show you exactly why — then build your plan around the one you pick.</p>
        </div>
        <button className="btn gold" onClick={() => setView({ kind: "assess", q: 0 })}><i className="ti ti-compass" /> Help me decide</button>
      </div>
      <p className="small muted" style={{ marginTop: 14 }}>
        Fit scores are demo estimates from your own answers — a decision aid, not a guarantee. Verify programs at official sources.
      </p>
    </Wrap>
  );
}

function Browse({ track, setView }: { track?: string; setView: (v: View) => void }) {
  const t = trackById(track);
  const list = track ? CAREERS.filter((c) => c.track === track) : CAREERS;
  return (
    <Wrap>
      <button type="button" className="muted" onClick={() => setView({ kind: "intro" })} style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 14, cursor: "pointer", background: "transparent", border: "none", fontFamily: "inherit", fontSize: "var(--fs-small)", padding: "8px 8px 8px 0" }}>
        <i className="ti ti-arrow-left" aria-hidden="true" /> All tracks
      </button>
      <h2>{t ? t.label : "All paths"}</h2>
      {t && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="muted small" style={{ margin: 0 }}>{t.blurb}</p>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>{t.fastFacts.map((f, i) => <li key={i} className="small" style={{ marginBottom: 4 }}>{f}</li>)}</ul>
        </div>
      )}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
        {list.map((c) => (
          <button key={c.id} type="button" className="card" onClick={() => setView({ kind: "detail", careerId: c.id })}
            style={{ cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: "inherit", color: "var(--ink)" }}>
            <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="iconwrap"><i className={`ti ${c.icon}`} aria-hidden="true" /></span>
              <span>
                <span style={{ fontWeight: 600, display: "block", fontSize: "var(--fs-h4)" }}>{c.label}</span>
                <span className="muted small">{c.paySample} · {c.outlookSample}</span>
              </span>
            </span>
            <span className="muted small" style={{ display: "block", margin: "10px 0 0" }}>{c.blurb}</span>
          </button>
        ))}
      </div>
    </Wrap>
  );
}

function Assess({ q, setView }: { q: number; setView: (v: View) => void }) {
  const { s, setAssessment, setAssessmentFree } = useStore();
  const total = ASSESSMENT.questions.length;
  const isFree = q >= total;
  const question = ASSESSMENT.questions[Math.min(q, total - 1)];
  const chosen = s.assessment[question?.id];

  return (
    <Wrap narrow>
      <ProgressBar pct={(q / (total + 1)) * 100} label={`Pathfinder question ${Math.min(q + 1, total + 1)} of ${total + 1}`} />
      <p className="small muted" aria-live="polite" style={{ marginTop: 8 }}>Question {Math.min(q + 1, total + 1)} of {total + 1}</p>
      {!isFree ? (
        <>
          <h2>{question.label}</h2>
          <div className="card">
            {question.options.map((o) => (
              <button key={o.label} type="button" aria-pressed={chosen === o.label} className={`opt ${chosen === o.label ? "sel" : ""}`}
                onClick={() => { setAssessment(question.id, o.label); setTimeout(() => setView({ kind: "assess", q: q + 1 }), 150); }}>
                {o.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2>Last one — in your own words</h2>
          <p className="muted">{ASSESSMENT.freePrompt}</p>
          <div className="card">
            <textarea className="field" rows={4} value={s.assessmentFree} placeholder="Optional — write anything"
              onChange={(e) => setAssessmentFree(e.target.value)} style={{ minHeight: 110, resize: "vertical" }} />
          </div>
        </>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <button className="btn ghost" onClick={() => (q === 0 ? setView({ kind: "intro" }) : setView({ kind: "assess", q: q - 1 }))}>
          <i className="ti ti-arrow-left" /> Back
        </button>
        {isFree ? (
          <button className="btn gold" onClick={() => setView({ kind: "results" })}><i className="ti ti-sparkles" /> Show my best-fit paths</button>
        ) : (
          <button className="btn" disabled={!chosen} onClick={() => setView({ kind: "assess", q: q + 1 })}>
            {chosen ? "Next" : "Pick one to continue"} <i className="ti ti-arrow-right" />
          </button>
        )}
      </div>
    </Wrap>
  );
}

function Results({ setView }: { setView: (v: View) => void }) {
  const { s } = useStore();
  const fits = scoreCareers({ answers: s.assessment, free: s.assessmentFree, intake: s.answers });
  const top = fits[0];
  const runners = fits.slice(1, 4);
  const tt = trackById(topTrack(fits));

  return (
    <Wrap>
      <button type="button" className="muted" onClick={() => setView({ kind: "assess", q: ASSESSMENT.questions.length })} style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 14, cursor: "pointer", background: "transparent", border: "none", fontFamily: "inherit", fontSize: "var(--fs-small)", padding: "8px 8px 8px 0" }}>
        <i className="ti ti-arrow-left" aria-hidden="true" /> Adjust answers
      </button>
      <h2>Your best-fit path</h2>
      <p className="muted">Recommended track: <strong>{tt?.label}</strong>. Fit scores are demo estimates built only from your answers — here&apos;s the reasoning, not a black box.</p>

      <div className="card" style={{ border: "2px solid var(--accent)", marginTop: 8 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div className="iconwrap" style={{ width: 56, height: 56, fontSize: 28 }}><i className={`ti ${top.career.icon}`} aria-hidden="true" /></div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <span className="chip gold" style={{ marginBottom: 6 }}><i className="ti ti-target-arrow" /> Recommended</span>
            <h3 style={{ margin: 0 }}>{top.career.label}</h3>
            <p className="muted small" style={{ margin: "2px 0 0" }}>{top.career.paySample} · {top.career.outlookSample} · {trackById(top.career.track)?.label}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>{top.fit}%</div>
            <div className="small muted">fit (demo)</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <strong className="small">Why this fits you:</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {top.why.map((w, i) => <li key={i} className="small" style={{ marginBottom: 3 }}>{w}</li>)}
            {top.boosts.map((b, i) => <li key={`b${i}`} className="small" style={{ marginBottom: 3 }}>{b}.</li>)}
          </ul>
        </div>
        <button className="btn gold" style={{ marginTop: 14 }} onClick={() => setView({ kind: "detail", careerId: top.career.id, fromResults: true })}>
          See the full route <i className="ti ti-arrow-right" />
        </button>
      </div>

      <h3 style={{ marginTop: 24 }}>Strong runners-up</h3>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
        {runners.map((f) => (
          <button key={f.career.id} type="button" className="card" onClick={() => setView({ kind: "detail", careerId: f.career.id, fromResults: true })}
            style={{ cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: "inherit", color: "var(--ink)" }}>
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <i className={`ti ${f.career.icon}`} aria-hidden="true" style={{ fontSize: 22, color: "var(--accent-ink)" }} />
                <span style={{ fontWeight: 600 }}>{f.career.label}</span>
              </span>
              <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 20 }}>{f.fit}%</span>
            </span>
            <span className="muted small" style={{ display: "block", marginTop: 8 }}>{f.career.blurb}</span>
          </button>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 16 }}>None of these feel right? <button type="button" onClick={() => setView({ kind: "browse" })} style={{ background: "none", border: "none", color: "var(--info)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", padding: 0, textDecoration: "underline" }}>Browse all paths</button> or adjust your answers.</p>
      <p className="small muted" style={{ marginTop: 18, marginBottom: 4 }}>
        Question design informed by the U.S. Department of Labor&apos;s O*NET&reg; Interest Profiler framework (Holland RIASEC) and O*NET Work Values; VetPath is an independent tool — USDOL/ETA has not approved, endorsed, or tested this adaptation.
      </p>
      <p className="small" style={{ margin: 0 }}>
        <a href="https://www.mynextmove.org/vets/" target="_blank" rel="noopener noreferrer">Compare with the official My Next Move for Veterans &rarr;</a>
        <span className="muted"> — the Department of Labor&apos;s validated interest instrument, with a military-to-civilian career crosswalk.</span>
      </p>
    </Wrap>
  );
}

function Detail({ careerId, fromResults, setView }: { careerId: string; fromResults?: boolean; setView: (v: View) => void }) {
  const { s, choosePath } = useStore();
  const router = useRouter();
  const c = careerById(careerId) as Career;
  if (!c) return <Wrap><p className="muted">Path not found.</p></Wrap>;

  const fits = fromResults ? scoreCareers({ answers: s.assessment, free: s.assessmentFree, intake: s.answers }) : null;
  const fit: CareerFit | undefined = fits?.find((f) => f.career.id === c.id);
  const place = ASSESSMENT.questions.find((q) => q.id === "place")?.options.find((o) => o.label === s.assessment["place"])?.place;
  const loc = locationGuidance(s.answers, place, c);
  const t = trackById(c.track);
  const isCurrent = s.chosenPath?.careerId === c.id;

  const lockIn = () => {
    choosePath(c.id, fit?.fit ?? null, fit?.why ?? []);
    router.push("/dashboard");
  };

  return (
    <Wrap narrow>
      <button type="button" className="muted" onClick={() => setView(fromResults ? { kind: "results" } : { kind: "browse", track: c.track })} style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 14, cursor: "pointer", background: "transparent", border: "none", fontFamily: "inherit", fontSize: "var(--fs-small)", padding: "8px 8px 8px 0" }}>
        <i className="ti ti-arrow-left" aria-hidden="true" /> Back
      </button>
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div className="iconwrap" style={{ width: 52, height: 52, fontSize: 26 }}><i className={`ti ${c.icon}`} aria-hidden="true" /></div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{c.label}</h2>
          <p className="muted" style={{ margin: "2px 0 0" }}>{t?.label} track · {c.paySample} · {c.outlookSample} <span className="small">(figures change — verify at source)</span></p>
          {(c.blsUrl || c.onetUrl) && (
            <p className="small muted" style={{ margin: "4px 0 0" }}>
              Pay/outlook:{" "}
              {c.blsUrl && <a href={c.blsUrl} target="_blank" rel="noopener noreferrer">BLS OOH</a>}
              {c.blsUrl && c.onetUrl && " · "}
              {c.onetUrl && <a href={c.onetUrl} target="_blank" rel="noopener noreferrer">O*NET profile</a>}
            </p>
          )}
        </div>
        {fit && <div style={{ textAlign: "center" }}><div style={{ fontSize: 34, fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>{fit.fit}%</div><div className="small muted">fit (demo)</div></div>}
      </div>
      <p style={{ marginTop: 12 }}>{c.blurb}</p>

      <div className="card" style={{ marginTop: 8 }}>
        <h3><i className="ti ti-medal" style={{ color: "var(--accent-ink)" }} /> Why veterans win here</h3>
        <p className="small" style={{ margin: 0 }}>{c.whyVets}</p>
        {c.mosBridges.length > 0 && <p className="small muted" style={{ margin: "8px 0 0" }}>Common bridges: {c.mosBridges.join(" · ")}</p>}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3><i className="ti ti-route" style={{ color: "var(--accent-ink)" }} /> The route</h3>
        <ol className="steps">{c.entryPath.map((st, i) => <li key={i}>{st}</li>)}</ol>
        {c.skillbridge && <div style={{ marginTop: 10 }}><Callout kind="info"><strong>Still in service?</strong> This path is SkillBridge-friendly — intern with a civilian employer during your last 180 days while keeping military pay. Ask your command early.</Callout></div>}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3><i className="ti ti-map-pin" style={{ color: "var(--accent-ink)" }} /> Where to live for this path (sample)</h3>
        <ul style={{ margin: "6px 0 10px", paddingLeft: 18 }}>{loc.tips.map((tp, i) => <li key={i} className="small" style={{ marginBottom: 4 }}>{tp}</li>)}</ul>
        {loc.metros.map((m) => (
          <div key={m.name} className="kv"><span className="k">{m.name}{m.state !== "—" ? `, ${m.state}` : ""}</span><span className="small" style={{ textAlign: "right" }}>{m.va}</span></div>
        ))}
        <p className="small muted" style={{ margin: "10px 0 0" }}>Examples only — verify facilities via the <a href="https://www.va.gov/find-locations/" target="_blank" rel="noopener noreferrer">VA facility locator</a>.</p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
        {isCurrent ? (
          <Link className="btn" href="/dashboard"><i className="ti ti-layout-dashboard" /> This is your destination — view plan</Link>
        ) : (
          <button className="btn gold" onClick={lockIn}><i className="ti ti-flag-3" /> Set as my destination &amp; update my plan</button>
        )}
        <Link className="btn ghost" href="/resume"><i className="ti ti-file-text" /> Scan my resume for this path</Link>
      </div>
    </Wrap>
  );
}
