"use client";
import PageSkeleton from "@/components/PageSkeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { goalById, stateName, residenceStates } from "@/lib/data";
import { Wrap, Callout } from "@/components/ui";

export default function Profile() {
  const { s, ready, setStep, regen, reset } = useStore();
  const { enabled, user, deleteAccount } = useAuth();
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  if (!ready) return <PageSkeleton kind="narrow" />;
  if (!s.profile) {
    return (
      <Wrap narrow>
        <div style={{ textAlign: "center" }}>
          <h2>No gameplan yet</h2>
          <Link className="btn" href="/onboarding">Build my gameplan</Link>
        </div>
      </Wrap>
    );
  }
  const a = s.answers;
  const rows: [string, string | undefined][] = [
    ["Name", s.profile.name],
    ["Email", s.profile.email || "-"],
    ["Age", a.ageRange],
    ["State(s)", residenceStates(a).map((c) => stateName(c) || c).join(", ") || "-"],
    ["Branch", a.branch],
    ...(a.mos ? [["Military job (MOS)", a.mos] as [string, string]] : []),
    ["Service era", a.serviceEra],
    ["Status", a.status],
    ["Disability rating", a.disabilityRating || "-"],
    ["Employment", a.employment],
    ["Housing", (Array.isArray(a.housing) ? a.housing.join(", ") : a.housing) || "-"],
    ["Urgency", a.urgency],
  ];
  const goals = (a.topGoals || []).map((id) => goalById(id)?.label).filter(Boolean).join(", ") || "-";

  return (
    <Wrap narrow>
      <h2>Your profile</h2>
      <p className="muted">Edit anything and regenerate your gameplan.</p>
      <div className="card">
        {rows.map(([k, v]) => (
          <div key={k} className="kv"><span className="k">{k}</span><span>{v || "-"}</span></div>
        ))}
        <div className="kv"><span className="k">Top goals</span><span style={{ textAlign: "right" }}>{goals}</span></div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <button className="btn" onClick={() => { setStep(0); router.push("/onboarding"); }}><i className="ti ti-edit" /> Edit answers</button>
        <button className="btn" onClick={() => { regen(); router.push("/dashboard"); }}><i className="ti ti-refresh" /> Regenerate gameplan</button>
        <button className="btn ghost" onClick={() => { if (confirm("Erase your answers and plan and start fresh?")) { reset(); router.push("/"); } }}><i className="ti ti-trash" /> Start over</button>
      </div>
      <div style={{ marginTop: 18 }}>
        <Callout kind="info">
          <i className="ti ti-lock" style={{ display: "none" }} />
          If you&apos;re signed in, your profile is saved privately to your account (encrypted, visible only to you) so it syncs across devices. Browsing without an account? It stays in your browser only. See <a href="/privacy">Privacy &amp; data</a>.
        </Callout>
      </div>

      {enabled && user && <EmailPrefs userId={user.id} />}

      {enabled && user && (
        <div className="card" style={{ marginTop: 22, borderColor: "#E0A6A6" }}>
          <h3 style={{ marginTop: 0 }}><i className="ti ti-user-x" aria-hidden="true" style={{ color: "#A32D2D" }} /> Delete my account data</h3>
          <p className="muted small" style={{ maxWidth: 560 }}>
            Permanently removes your saved plan and profile from our servers, clears this device, and signs
            you out. To also purge the login record tied to your email, use the contact route on the{" "}
            <Link href="/privacy">privacy page</Link> - we delete both, no questions asked.
          </p>
          {deleteError && (
            <div className="callout crisis" role="alert" style={{ marginBottom: 12 }}>
              <i className="ti ti-alert-triangle" aria-hidden="true" /> <span>{deleteError} Nothing was deleted - try again, or use the contact route on the privacy page.</span>
            </div>
          )}
          {!confirmingDelete ? (
            <button className="btn ghost" style={{ color: "#A32D2D", borderColor: "#E0A6A6" }} onClick={() => setConfirmingDelete(true)}>
              <i className="ti ti-trash-x" /> Delete my data&hellip;
            </button>
          ) : (
            <div className="callout crisis" role="alertdialog" aria-label="Confirm deletion">
              <i className="ti ti-alert-triangle" aria-hidden="true" style={{ display: "none" }} />
              <div>
                <p style={{ margin: "0 0 10px" }}><strong>This can&apos;t be undone.</strong> Your plan and profile are deleted from our servers immediately.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn" style={{ background: "#A32D2D" }} disabled={deleting}
                    onClick={async () => {
                      setDeleting(true); setDeleteError(null);
                      const { error } = await deleteAccount();
                      if (error) { setDeleting(false); setDeleteError(error); return; }
                      reset();
                      router.push("/");
                    }}>
                    {deleting ? "Deleting…" : "Yes, delete everything"}
                  </button>
                  <button className="btn ghost" disabled={deleting} onClick={() => setConfirmingDelete(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Wrap>
  );
}

/** Email check-in preferences (Return Loop Phase 3). Reads and writes the
 *  profiles.prefs column directly - own-row RLS makes this safe, and the
 *  cron sender honors these flags on every run. Unsubscribing from an email
 *  link flips both off; this card is where they come back on. */
function EmailPrefs({ userId }: { userId: string }) {
  const [prefs, setPrefs] = useState<{ tminus: boolean; verification: boolean } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("profiles").select("prefs").eq("id", userId).single().then(({ data, error }) => {
      if (error) { setError(true); return; }
      const p = (data?.prefs as any) || {};
      setPrefs({ tminus: !!p.tminus, verification: !!p.verification });
    });
  }, [userId]);

  const setPref = async (key: "tminus" | "verification", value: boolean) => {
    if (!supabase || !prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next); // optimistic - a failed write flips it back below
    const { error } = await supabase.from("profiles").update({ prefs: next }).eq("id", userId);
    if (error) { setPrefs(prefs); setError(true); }
  };

  const ROWS: { key: "tminus" | "verification"; icon: string; label: string; sub: string }[] = [
    { key: "tminus", icon: "ti-calendar-check", label: "Timeline check-ins", sub: "A short note when your countdown enters a new stretch - or an occasional progress check-in. Never more than one email at a time." },
    { key: "verification", icon: "ti-shield-check", label: "Data re-verification notes", sub: "A quarterly line confirming your plan's numbers were re-checked against their official sources." },
  ];

  return (
    <div className="card" style={{ marginTop: 22 }}>
      <h3 style={{ marginTop: 0 }}><i className="ti ti-calendar-check" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Email check-ins</h3>
      <p className="muted small" style={{ marginTop: 0 }}>Short, cited, and rare - and replying reaches a person, not a robot.</p>
      {error && <p className="small" style={{ color: "var(--danger)" }}>Couldn&apos;t save just now - try again in a moment.</p>}
      {!prefs ? (
        <p className="muted small">Loading your preferences&hellip;</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {ROWS.map((r) => (
            <label key={r.key} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={prefs[r.key]}
                onChange={(e) => setPref(r.key, e.target.checked)}
                style={{ width: 20, height: 20, marginTop: 3, accentColor: "var(--primary)", flexShrink: 0 }}
              />
              <span>
                <span style={{ fontWeight: 600, color: "var(--ink-strong)" }}><i className={`ti ${r.icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {r.label}</span>
                <span className="muted small" style={{ display: "block", marginTop: 2 }}>{r.sub}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
