"use client";
import { useStore } from "@/lib/store";
import { BRAND } from "@/lib/data";

export function ThemeSwitcher({ align = "center" }: { align?: "center" | "flex-start" }) {
  const { s, setTheme } = useStore();
  const btn = (t: "professional" | "warm" | "civic", label: string) => {
    const on = s.theme === t;
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => setTheme(t)}
        style={{
          border: "1.5px solid var(--border)",
          background: on ? "var(--primary)" : "var(--surface)",
          color: on ? "#fff" : "var(--ink)",
          borderColor: on ? "var(--primary)" : "var(--border)",
          borderRadius: 20, padding: "6px 15px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
        }}
      >
        {label}
      </button>
    );
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: align, flexWrap: "wrap", fontSize: 13, color: "var(--muted)" }}>
      <span style={{ fontWeight: 500 }}>Preview theme:</span> {btn("professional", "Professional")} {btn("warm", "Warm")} {btn("civic", "Civic")}
    </div>
  );
}

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
          <ThemeSwitcher />
        </div>

        <hr className="hairline" style={{ margin: "22px 0" }} />

        <div className="disclaimer" style={{ textAlign: "left" }}>
          <a href="/trust" style={{ fontWeight: 600 }}>How we earn trust — every number has a source →</a>
          <br />
          <strong style={{ color: "var(--ink-strong)" }}>{BRAND.name} is a planning &amp; education tool — not the VA, a law firm, or an accredited claims representative.</strong>{" "}
          All benefit information here is <strong>sample/demo data</strong>. Eligibility and amounts must be confirmed through official sources such as{" "}
          <a href="https://www.va.gov" target="_blank" rel="noopener noreferrer">VA.gov</a>, your state veterans agency, or an accredited VSO.
          <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 8, color: "var(--danger)", fontWeight: 500 }}>
            <i className="ti ti-urgent" aria-hidden="true" /> In crisis? Dial 988, then press 1 — free, confidential, 24/7.
          </div>
          <div style={{ marginTop: 14, fontSize: 12.5 }}>
            <a href="/privacy">Privacy &amp; data</a>
            <span aria-hidden="true" style={{ margin: "0 8px", color: "var(--faint)" }}>·</span>
            <a href="/admin">Strategy view (for the team)</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
