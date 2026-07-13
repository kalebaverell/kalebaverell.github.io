"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { goalById, stateName } from "@/lib/data";
import { Wrap, Callout } from "@/components/ui";

export default function Profile() {
  const { s, ready, setStep, regen, reset } = useStore();
  const router = useRouter();
  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;
  if (!s.profile) {
    return (
      <Wrap narrow>
        <div style={{ textAlign: "center" }}>
          <h2>No profile yet</h2>
          <Link className="btn" href="/onboarding">Create profile</Link>
        </div>
      </Wrap>
    );
  }
  const a = s.answers;
  const rows: [string, string | undefined][] = [
    ["Name", s.profile.name],
    ["Email", s.profile.email || "—"],
    ["Age", a.ageRange],
    ["State", a.state ? stateName(a.state) : "—"],
    ["Branch", a.branch],
    ["Service era", a.serviceEra],
    ["Status", a.status],
    ["Disability rating", a.disabilityRating || "—"],
    ["Employment", a.employment],
    ["Housing", a.housing],
    ["Urgency", a.urgency],
  ];
  const goals = (a.topGoals || []).map((id) => goalById(id)?.label).filter(Boolean).join(", ") || "—";

  return (
    <Wrap narrow>
      <h2>Your profile</h2>
      <p className="muted">Edit anything and regenerate your gameplan.</p>
      <div className="card">
        {rows.map(([k, v]) => (
          <div key={k} className="kv"><span className="k">{k}</span><span>{v || "—"}</span></div>
        ))}
        <div className="kv"><span className="k">Top goals</span><span style={{ textAlign: "right" }}>{goals}</span></div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <button className="btn" onClick={() => { setStep(0); router.push("/onboarding"); }}><i className="ti ti-edit" /> Edit answers</button>
        <button className="btn gold" onClick={() => { regen(); router.push("/dashboard"); }}><i className="ti ti-refresh" /> Regenerate gameplan</button>
        <button className="btn ghost" onClick={() => { if (confirm("Clear this demo profile and all answers?")) { reset(); router.push("/"); } }}><i className="ti ti-trash" /> Reset demo</button>
      </div>
      <div style={{ marginTop: 18 }}>
        <Callout kind="info">
          <i className="ti ti-lock" style={{ display: "none" }} />
          If you&apos;re signed in, your profile is saved privately to your account (encrypted, visible only to you) so it syncs across devices. Browsing without an account? It stays in your browser only. See <a href="/privacy">Privacy &amp; data</a>.
        </Callout>
      </div>
    </Wrap>
  );
}
