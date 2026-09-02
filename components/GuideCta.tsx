// Mid-guide account CTA (Sep 2, account-first direction). The guides exist to
// capture search traffic; this is the conversion surface that meets that
// visitor while they are warm, mid-read. Server-safe - no client hooks.
import Link from "next/link";

export default function GuideCta({ line, sub }: { line: string; sub?: string }) {
  return (
    <div className="card" style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", borderLeft: "4px solid var(--primary)" }}>
      <div style={{ flex: 1, minWidth: 250 }}>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--ink-strong)" }}>{line}</p>
        <p className="muted small" style={{ margin: "3px 0 0" }}>
          {sub ?? "Answer a few questions and this lands on your own timeline - free, about ten minutes."}
        </p>
      </div>
      <Link className="btn gold" href="/onboarding" style={{ flexShrink: 0 }}>
        <i className="ti ti-compass" aria-hidden="true" /> Build my gameplan
      </Link>
    </div>
  );
}
