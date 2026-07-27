"use client";
// Sign-in / create-account modal. Passwords are handled by Supabase Auth
// (hashed server-side) - never stored by us. Opened via the auth context.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, MIN_PASSWORD_LENGTH, PROVIDER_META } from "@/lib/auth";
import { BRAND } from "@/lib/data";
import type { AuthMode as Mode, OAuthProvider } from "@/lib/auth";

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, signUp, signIn, requestPasswordReset,
          oauthProviders, signInWithProvider } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);            // reset link emailed
  const [confirmSent, setConfirmSent] = useState(false); // signup needs email confirmation

  // Reset transient state whenever the modal opens/closes, and honour the mode the
  // caller asked for (e.g. an expired reset link opens straight to "reset").
  useEffect(() => {
    if (authOpen) { setMode(authMode); setError(null); setSent(false); setConfirmSent(false); setPassword(""); }
    else { setError(null); setBusy(false); setPassword(""); setSent(false); setConfirmSent(false); }
  }, [authOpen, authMode]);

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

    if (mode === "reset") {
      if (!email.trim()) { setError("Enter the email address on your account."); return; }
      setBusy(true);
      await requestPasswordReset(email);
      setBusy(false);
      setSent(true); // always confirms, whether or not an account exists
      return;
    }

    if (!email.trim() || !password) { setError("Enter your email and a password."); return; }
    if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
      return;
    }
    setBusy(true);
    const res = mode === "signup"
      ? await signUp(email, password, { fullName, marketingOptIn: optIn })
      : await signIn(email, password);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    // With email confirmation required there is no session yet, so closing the modal
    // would leave them looking signed out with no idea why.
    if (mode === "signup" && "needsConfirmation" in res && res.needsConfirmation) {
      setConfirmSent(true);
      return;
    }
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
        <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" aria-label="Close" onClick={closeAuth}
            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 20, color: "var(--muted)", lineHeight: 1 }}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div style={{ padding: "0 26px 28px" }}>
          {/* Brand mark and welcome, centered: the shape people expect from a sign-in screen. */}
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <span aria-hidden="true" className="brand-mark" style={{ width: 44, height: 44, fontSize: 24, margin: "0 auto 14px" }}>
              <i className="ti ti-route" />
            </span>
            <h2 style={{ fontSize: "var(--fs-h2)", margin: "0 0 6px" }}>
              {mode === "signup" ? `Welcome to ${BRAND.name}` : mode === "reset" ? "Reset your password" : "Welcome back"}
            </h2>
            <p className="muted small" style={{ margin: "0 auto", maxWidth: 320 }}>
              {mode === "signup"
                ? "Create a free account to build and save your gameplan."
                : mode === "reset"
                ? "Enter your email and we will send you a link to set a new one. Your saved plan is untouched."
                : "Sign in to pick up right where you left off."}
            </p>
          </div>

          {confirmSent ? (
            <>
              <div className="callout" style={{ marginBottom: 16 }} role="status">
                <i className="ti ti-mail-check" aria-hidden="true" />
                <span>
                  Your account is created. We sent a confirmation link to <strong>{email.trim()}</strong>.
                  Click it and you will land right back here, signed in and ready to build your gameplan.
                  Check your spam folder if it does not arrive in a few minutes.
                </span>
              </div>
              <button type="button" className="btn block" onClick={closeAuth}>Got it</button>
            </>
          ) : sent ? (
            <>
              <div className="callout" style={{ marginBottom: 16 }} role="status">
                <i className="ti ti-mail-check" aria-hidden="true" />
                <span>
                  If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way.
                  It expires after a short time, so use it soon. Check spam if you do not see it.
                </span>
              </div>
              <button type="button" className="btn block" onClick={() => { setMode("signin"); setSent(false); setError(null); }}>
                Back to sign in
              </button>
            </>
          ) : (
          <>
          {/* Social sign-in first: one tap, no password to invent or forget, and no
              confirmation email that a corporate mail filter can consume. */}
          {mode !== "reset" && oauthProviders.length > 0 && (
            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              {oauthProviders.map((p: OAuthProvider) => (
                <button
                  key={p}
                  type="button"
                  className="btn ghost block"
                  disabled={busy}
                  onClick={async () => {
                    setError(null);
                    setBusy(true);
                    const res = await signInWithProvider(p);
                    // On success the browser leaves for the provider, so there is
                    // nothing to reset. Only an immediate failure lands back here.
                    if (res.error) { setBusy(false); setError(res.error); }
                  }}
                  style={{ justifyContent: "center", fontWeight: 600 }}
                >
                  <i className={`ti ${PROVIDER_META[p].icon}`} aria-hidden="true" />
                  Continue with {PROVIDER_META[p].label}
                </button>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span className="small muted">or use your email</span>
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
            </div>
          )}
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
            {mode !== "reset" && (
              <div style={{ marginBottom: 14 }}>
                <label className="lbl" htmlFor="au-pass">Password</label>
                <input id="au-pass" className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? `At least ${MIN_PASSWORD_LENGTH} characters` : "Your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                {mode === "signin" && (
                  <p className="small" style={{ margin: "8px 0 0", textAlign: "right" }}>
                    <button type="button" onClick={() => { setMode("reset"); setError(null); setPassword(""); }} style={linkBtn}>
                      Forgot your password?
                    </button>
                  </p>
                )}
              </div>
            )}

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
              {busy ? "Working…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
            </button>
          </form>
          </>
          )}

          {!sent && !confirmSent && (
          <p className="small" style={{ textAlign: "center", margin: "16px 0 0", color: "var(--muted)" }}>
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button type="button" onClick={() => { setMode("signin"); setError(null); }} style={linkBtn}>Sign in</button></>
            ) : mode === "reset" ? (
              <>Remembered it?{" "}
                <button type="button" onClick={() => { setMode("signin"); setError(null); }} style={linkBtn}>Back to sign in</button></>
            ) : (
              <>New here?{" "}
                <button type="button" onClick={() => { setMode("signup"); setError(null); }} style={linkBtn}>Create an account</button></>
            )}
          </p>
          )}

          <p className="small" style={{ textAlign: "center", margin: "14px 0 0", color: "var(--faint)", lineHeight: 1.6 }}>
            Your password is secured by our auth provider - we never see or store it.{" "}
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
