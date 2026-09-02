"use client";
// Veteran feedback drop box (Sep 1, 2026). Write-only by design: the client can
// insert a note and nothing else - no reads, no edits, no thread. Signed-in
// notes carry user_id via the column default (auth.uid()); anonymous notes are
// welcome too, because most of the veterans Frank sends will not have accounts.
// When Supabase is not configured (local fallback), the box degrades to email.
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/track";

export default function FeedbackForm() {
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    const trimmed = body.trim();
    if (trimmed.length < 3 || !supabase) return;
    setState("sending");
    // Same-origin referrer path only - a hint about where the note came from,
    // never a full URL and never another site.
    let page: string | null = null;
    try {
      const r = document.referrer;
      if (r && r.startsWith(window.location.origin)) page = new URL(r).pathname.slice(0, 200);
    } catch { /* hint only */ }
    const { error } = await supabase.from("feedback").insert({ body: trimmed.slice(0, 2000), page });
    if (error) { setState("error"); return; }
    track("feedback-sent");
    setBody("");
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="card" style={{ textAlign: "center", padding: "36px 28px" }}>
        <div className="iconwrap" style={{ width: 54, height: 54, fontSize: 26, margin: "0 auto 14px" }}>
          <i className="ti ti-mail-check" aria-hidden="true" />
        </div>
        <h2 style={{ margin: "0 0 8px" }}>Received.</h2>
        <p className="muted" style={{ maxWidth: 420, margin: "0 auto 18px" }}>
          Thank you. Your note goes straight to the founders, and it shapes what gets built next.
        </p>
        <button type="button" className="btn ghost sm" onClick={() => setState("idle")}>
          Send another note
        </button>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="card">
        <p style={{ margin: 0 }}>
          The feedback box is not available right now. Email us instead:{" "}
          <a href="mailto:kaleb@vetpathusa.com">kaleb@vetpathusa.com</a> - a person reads it.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <label htmlFor="fb-body" style={{ display: "block", fontWeight: 600, color: "var(--ink-strong)", marginBottom: 6 }}>
        What&apos;s confusing, wrong, or missing?
      </label>
      <textarea
        id="fb-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={5}
        placeholder="Blunt is useful. A sentence is plenty."
        style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", font: "inherit", lineHeight: 1.55 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        <button
          type="button"
          className="btn"
          onClick={submit}
          disabled={state === "sending" || body.trim().length < 3}
        >
          {state === "sending" ? "Sending..." : "Send it"} <i className="ti ti-arrow-right" aria-hidden="true" />
        </button>
        <span className="small muted">Anonymous unless you are signed in. No reply expected, every note read.</span>
      </div>
      {state === "error" && (
        <p className="small" role="alert" style={{ color: "var(--danger)", margin: "10px 0 0" }}>
          That didn&apos;t go through. Try again, or email{" "}
          <a href="mailto:kaleb@vetpathusa.com">kaleb@vetpathusa.com</a>.
        </p>
      )}
    </div>
  );
}
