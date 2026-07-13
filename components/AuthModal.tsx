"use client";
// Sign-in / create-account modal. Passwords are handled by Supabase Auth
// (hashed server-side) — never stored by us. Opened via the auth context.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

type Mode = "signin" | "signup";

export default function AuthModal() {
  const { authOpen, closeAuth, signUp, signIn } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset transient state whenever the modal opens/closes.
  useEffect(() => {
    if (!authOpen) { setError(null); setBusy(false); setPassword(""); }
  }, [authOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!authOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeAuth(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError("Enter your email and a password."); return; }
    if (mode === "signup" && password.length < 8) { setError("Use at least 8 characters for your password."); return; }
    setBusy(true);
    const res = mode === "signup"
      ? await signUp(email, password, { fullName, marketingOptIn: optIn })
      : await signIn(email, password);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    closeAuth();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === "signup" ? "Create your account" : "Sign in"}
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeAuth(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, background: "rgba(11,27,43,.55)", backdropFilter: "blur(4px)",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 0, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ padding: "22px 26px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="eyebrow" style={{ margin: 0 }}>{mode === "signup" ? "Create your account" : "Welcome back"}</span>
          <button type="button" aria-label="Close" onClick={closeAuth}
            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 20, color: "var(--muted)", lineHeight: 1 }}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div style={{ padding: "8px 26px 26px" }}>
          <h2 style={{ fontSize: "var(--fs-h2)", margin: "0 0 4px" }}>
            {mode === "signup" ? "Save your gameplan" : "Sign in to VetPath"}
          </h2>
          <p className="muted small" style={{ margin: "0 0 18px" }}>
            {mode === "signup"
              ? "Create a free account to save your plan and pick up on any device."
              : "Access your saved plan and continue where you left off."}
          </p>

          <form onSubmit={submit}>
            {mode === "signup" && (
              <div style={{ marginBottom: 14 }}>
                <label className="lbl" htmlFor="au-name">Your name</label>
                <input id="au-name" className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First name is fine" autoComplete="name" />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label className="lbl" htmlFor="au-email">Email</label>
              <input id="au-email" className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="lbl" htmlFor="au-pass">Password</label>
              <input id="au-pass" className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            </div>

            {mode === "signup" && (
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "4px 0 16px", cursor: "pointer" }}>
                <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} style={{ marginTop: 3, width: 17, height: 17, flexShrink: 0, accentColor: "var(--accent)" }} />
                <span className="muted small">Email me VetPath product updates and the newsletter. You can unsubscribe anytime.</span>
              </label>
            )}

            {error && (
              <div className="callout crisis" style={{ marginBottom: 14 }} role="alert">
                <i className="ti ti-alert-triangle" aria-hidden="true" /> <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn gold block" disabled={busy}>
              {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="small" style={{ textAlign: "center", margin: "16px 0 0", color: "var(--muted)" }}>
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button type="button" onClick={() => { setMode("signin"); setError(null); }} style={linkBtn}>Sign in</button></>
            ) : (
              <>New here?{" "}
                <button type="button" onClick={() => { setMode("signup"); setError(null); }} style={linkBtn}>Create an account</button></>
            )}
          </p>

          <p className="small" style={{ textAlign: "center", margin: "14px 0 0", color: "var(--faint)", lineHeight: 1.6 }}>
            Your password is secured by our auth provider — we never see or store it.{" "}
            <Link href="/privacy" onClick={closeAuth}>Privacy &amp; data</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  border: "none", background: "transparent", color: "var(--info)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", padding: 0,
};
