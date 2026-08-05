"use client";
import PageSkeleton from "@/components/PageSkeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
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
        <button className="btn gold" onClick={() => { regen(); router.push("/dashboard"); }}><i className="ti ti-refresh" /> Regenerate gameplan</button>
        <button className="btn ghost" onClick={() => { if (confirm("Erase your answers and plan and start fresh?")) { reset(); router.push("/"); } }}><i className="ti ti-trash" /> Start over</button>
      </div>
      <div style={{ marginTop: 18 }}>
        <Callout kind="info">
          <i className="ti ti-lock" style={{ display: "none" }} />
          If you&apos;re signed in, your profile is saved privately to your account (encrypted, visible only to you) so it syncs across devices. Browsing without an account? It stays in your browser only. See <a href="/privacy">Privacy &amp; data</a>.
        </Callout>
      </div>

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
