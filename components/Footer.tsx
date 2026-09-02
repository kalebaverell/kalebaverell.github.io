"use client";
import { BRAND } from "@/lib/data";
import { PIXELS_CONFIGURED } from "@/lib/marketing";
import { useAuth } from "@/lib/auth";

// Columned enterprise footer (fortune-preview port). Dark ground, four link
// columns, and the standing required rows: the not-the-VA disclaimer and the
// crisis line stay on every page.
const COLS: { head: string; links: [string, string][] }[] = [
  {
    head: "Product",
    links: [
      ["/#how-it-works", "How it works"],
      ["/benefits", "Benefits library"],
      ["/pathfinder", "Career pathfinder"],
      ["/tools", "All tools"],
    ],
  },
  {
    head: "Guides",
    links: [
      ["/guides/transition-timeline", "Transition timeline"],
      ["/guides/state-benefits", "State benefits"],
      ["/guides/faq", "Questions answered"],
      ["/guides", "All guides"],
    ],
  },
  {
    head: "Company",
    links: [
      ["/trust", "Why trust us"],
      ["/support", "Support the mission"],
      ["/feedback", "Tell us what's off"],
      ["mailto:kaleb@vetpathusa.com", "Contact us"],
    ],
  },
  {
    head: "Legal",
    links: [
      ["/privacy", "Privacy & data"],
      ["/terms", "Terms of use"],
    ],
  },
];

export default function Footer() {
  const { enabled: authEnabled, user, openAuth } = useAuth();
  return (
    <footer style={{ marginTop: 56, background: "var(--primary-900)", color: "rgba(251,250,247,.75)", fontSize: 14 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 22px 30px" }}>
        <div className="foot-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
              <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent)", color: "var(--primary-900)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}><i className="ti ti-route" /></span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500, color: "#FBFAF7" }}>{BRAND.name}</span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, maxWidth: 260, margin: 0 }}>
              {BRAND.tagline} Built with veterans - every number cited to its official source.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.head}>
              <h5 className="foot-head">{col.head}</h5>
              {col.links.map(([href, label]) => (
                <a key={label} className="foot-link" href={href}>{label}</a>
              ))}
              {col.head === "Legal" && PIXELS_CONFIGURED && (
                <a className="foot-link" href="/do-not-sell">Do not sell or share my personal information</a>
              )}
            </div>
          ))}
          <div>
            <h5 className="foot-head">Get started</h5>
            <a className="foot-link" href="/onboarding">Build my gameplan</a>
            {authEnabled && !user && (
              <button type="button" className="foot-link" onClick={() => openAuth("signin")} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", padding: "5px 0", textAlign: "left", width: "100%" }}>
                Sign in
              </button>
            )}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(251,250,247,.14)", marginTop: 40, paddingTop: 20, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "rgba(251,250,247,.6)" }}>
          <span>
            <a href="/trust" style={{ color: "var(--band-gold)", fontWeight: 600 }}>How we earn trust - every number has a source →</a>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#F5B8A9", fontWeight: 600 }}>
            <i className="ti ti-urgent" aria-hidden="true" /> In crisis? Dial 988, then press 1 - free, confidential, 24/7.
          </span>
        </div>
        <div style={{ marginTop: 12, fontSize: 12.5, color: "rgba(251,250,247,.55)" }}>
          {BRAND.name} is a planning &amp; education tool - not the VA, and not affiliated with the government.
        </div>
      </div>
    </footer>
  );
}
