"use client";
// Where a password-recovery link lands. Supabase puts a recovery token in the URL
// fragment; the client is configured with detectSessionInUrl, so by the time this
// renders the user has a short-lived session and can set a new password.
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Wrap, Callout } from "@/components/ui";

export default function ResetPassword() {
  const { enabled, ready, user, updatePassword, openAuth } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!enabled) {
    return (
      <Wrap narrow>
        <h2>Password reset is not available here</h2>
        <p className="muted">Accounts are not configured in this environment.</p>
        <Link className="btn ghost" href="/"><i className="ti ti-arrow-left" aria-hidden="true" /> Back to VetPath</Link>
      </Wrap>
    );
  }

  if (!ready) return <Wrap narrow><p className="muted">Loading…</p></Wrap>;

  // No session means the link was already used, expired, or was opened in a
  // different browser than the one that requested it.
  if (!user && !done) {
    return (
      <Wrap narrow>
        <h2>This reset link is not valid anymore</h2>
        <p className="muted">
          Reset links expire after a short time and can only be used once. They also have to be opened
          in the same browser you requested them from. Request a fresh one and it will work.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <button className="btn gold" onClick={() => openAuth("reset")}><i className="ti ti-mail" aria-hidden="true" /> Send a new link</button>
          <Link className="btn ghost" href="/"><i className="ti ti-arrow-left" aria-hidden="true" /> Back to VetPath</Link>
        </div>
      </Wrap>
    );
  }

  if (done) {
    return (
      <Wrap narrow>
        <h2>Your password is updated</h2>
        <p className="muted">
          You are signed in on this device, and your saved gameplan is exactly where you left it.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <Link className="btn gold" href="/dashboard"><i className="ti ti-layout-dashboard" aria-hidden="true" /> Go to my gameplan</Link>
          <Link className="btn ghost" href="/"><i className="ti ti-home" aria-hidden="true" /> Home</Link>
        </div>
      </Wrap>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Use at least 8 characters for your new password."); return; }
    if (password !== confirm) { setError("The two passwords do not match."); return; }
    setBusy(true);
    const res = await updatePassword(password);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    setDone(true);
  };

  return (
    <Wrap narrow>
      <h2>Set a new password</h2>
      <p className="muted">Pick something you have not used elsewhere. Your saved plan is not affected.</p>

      <div className="card" style={{ marginTop: 16 }}>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label className="lbl" htmlFor="np">New password</label>
            <input
              id="np" className="field" type="password" required autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl" htmlFor="np2">Confirm new password</label>
            <input
              id="np2" className="field" type="password" required autoComplete="new-password"
              placeholder="Type it again"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <div className="callout crisis" style={{ marginBottom: 14 }} role="alert">
              <i className="ti ti-alert-triangle" aria-hidden="true" /> <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn gold block" disabled={busy}>
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 18 }}>
        <Callout kind="info">
          <i className="ti ti-lock" aria-hidden="true" />
          <span>We never see or store your password. It is hashed by our authentication provider before it is saved.</span>
        </Callout>
      </div>
    </Wrap>
  );
}
