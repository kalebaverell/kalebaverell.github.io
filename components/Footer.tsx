"use client";
import { BRAND } from "@/lib/data";
import { PIXELS_CONFIGURED } from "@/lib/marketing";

export default function Footer() {
  return (
    <footer style={{ marginTop: 56, borderTop: "1px solid var(--hairline)", background: "var(--surface-2)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 22px" }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 9, background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}><i className="ti ti-route" /></span>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500, color: "var(--ink-strong)" }}>{BRAND.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>{BRAND.tagline}</div>
            </div>
          </div>
        </div>

        <hr className="hairline" style={{ margin: "22px 0" }} />

        <div className="disclaimer" style={{ textAlign: "left" }}>
          <a href="/trust" style={{ fontWeight: 600 }}>How we earn trust - every number has a source →</a>
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, color: "var(--danger)", fontWeight: 500 }}>
            <i className="ti ti-urgent" aria-hidden="true" /> In crisis? Dial 988, then press 1 - free, confidential, 24/7.
          </div>
          <div style={{ marginTop: 14, fontSize: 12.5, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="/privacy">Privacy &amp; data</a>
            <a href="/terms">Terms of use</a>
            <a href="mailto:kaleb@vetpathusa.com">Contact us</a>
            {/* Required in the footer once visit data reaches an ad platform, and
                only confusing before that - so it appears with the pixels. */}
            {PIXELS_CONFIGURED && (
              <a href="/do-not-sell">Do not sell or share my personal information</a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
