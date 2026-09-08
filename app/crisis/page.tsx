// Crisis support - a standalone, always-public page. This page is never gated,
// never carries a funnel pitch, and never will: someone who lands here heavy
// gets help lines first and silence from us otherwise. Every resource is the
// official one, linked at its source. Facts here match components/ui.tsx
// CrisisBanner - if one changes, change both.
import { routeMeta } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";

export const metadata = routeMeta(
  "Crisis support for veterans",
  "The Veterans Crisis Line and other free, confidential, 24/7 supports - call 988 then press 1, text 838255, or chat online. For veterans, service members, and the people who love them."
);

const BIG: { href: string; icon: string; label: string; sub: string }[] = [
  { href: "tel:988", icon: "ti-urgent", label: "Call 988, then press 1", sub: "Veterans Crisis Line - free, confidential, 24/7" },
  { href: "sms:838255", icon: "ti-messages", label: "Text 838255", sub: "Same line, by text" },
  { href: "https://www.veteranscrisisline.net/get-help-now/chat/", icon: "ti-lifebuoy", label: "Chat online", sub: "veteranscrisisline.net" },
];

const MORE: { label: string; sub: string; url: string }[] = [
  { label: "Vet Centers", sub: "Free counseling for combat veterans and their families, in your community - no VA enrollment required.", url: "https://www.vetcenter.va.gov/" },
  { label: "VA mental health care", sub: "Ongoing care - therapy, medication, peer support - through VA health care.", url: "https://www.va.gov/health-care/health-needs-conditions/mental-health/" },
  { label: "Military OneSource", sub: "Free, confidential support for service members and families - counseling referrals included.", url: "https://www.militaryonesource.mil/" },
  { label: "National Call Center for Homeless Veterans", sub: "Housing unstable or at risk? 1-877-424-3838, around the clock.", url: "https://www.va.gov/homeless/nationalcallcenter.asp" },
];

export default function CrisisPage() {
  return (
    <Wrap narrow>
      <Eyebrow>You matter</Eyebrow>
      <h1 style={{ maxWidth: 620 }}>If right now is heavy, start here.</h1>
      <p className="muted" style={{ maxWidth: 600 }}>
        Whatever brought you to this page - a bad night, a long slide, worry about a buddy - the
        people below answer around the clock, they are free, and they are confidential. You do not
        need to be enrolled in anything, and you do not need to be sure it counts as a crisis.
        Reaching out early is the strong move, not the weak one.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
        {BIG.map((b) => (
          <a key={b.href} href={b.href} className="card" target={b.href.startsWith("http") ? "_blank" : undefined} rel={b.href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ display: "flex", gap: 16, alignItems: "center", textDecoration: "none", color: "var(--ink)", borderLeft: "4px solid var(--danger)" }}>
            <span aria-hidden="true" style={{ width: 46, height: 46, borderRadius: 12, background: "var(--miss-bg, #F6E3DA)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23, flexShrink: 0 }}>
              <i className={`ti ${b.icon}`} />
            </span>
            <span>
              <strong style={{ display: "block", fontSize: 17, color: "var(--ink-strong)" }}>{b.label}</strong>
              <span className="muted small">{b.sub}</span>
            </span>
          </a>
        ))}
      </div>
      <p className="small muted" style={{ margin: "10px 0 0" }}>
        If someone is in immediate danger, call <strong>911</strong>.
      </p>

      <section style={{ marginTop: 30 }}>
        <h2>Worried about a buddy?</h2>
        <p style={{ maxWidth: 600 }}>
          You do not need the perfect words. Stay with them, listen more than you talk, and help
          them make the call - the Veterans Crisis Line takes calls <em>about</em> a veteran too,
          and they will tell you what to do next. Asking someone directly how they are doing does
          not plant the idea; it opens the door. The{" "}
          <a href="https://www.veteranscrisisline.net/" target="_blank" rel="noopener noreferrer">
            Veterans Crisis Line site <i className="ti ti-external-link" aria-hidden="true" />
          </a>{" "}
          has guidance for family, friends, and battle buddies.
        </p>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2>Beyond tonight: ongoing support</h2>
        <div className="card" style={{ marginTop: 8 }}>
          {MORE.map((m) => (
            <div key={m.label} style={{ padding: "12px 0", borderBottom: "1px solid var(--hairline)" }}>
              <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--ink-strong)" }}>
                {m.label} <i className="ti ti-external-link" aria-hidden="true" />
              </a>
              <p className="small muted" style={{ margin: "3px 0 0", maxWidth: 620 }}>{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="small muted" style={{ marginTop: 24, maxWidth: 620 }}>
        VetPath is a planning and education tool, not a medical or crisis provider - the
        organizations above are the professionals, and this page exists only to put them one tap
        away. Free, no account, always.
      </p>
    </Wrap>
  );
}
