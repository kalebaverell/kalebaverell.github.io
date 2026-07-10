"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { NETWORKING, TRACKS, careerById } from "@/lib/data";
import { Wrap, Callout } from "@/components/ui";

function Group({ title, icon, items }: { title: string; icon: string; items: { name: string; what: string; url?: string }[] }) {
  if (!items?.length) return null;
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3><i className={`ti ${icon}`} style={{ color: "var(--accent-ink)" }} /> {title}</h3>
      {items.map((n) => (
        <div key={n.name} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <strong>{n.url ? <a href={n.url} target="_blank" rel="noopener noreferrer">{n.name} <i className="ti ti-external-link" style={{ fontSize: 14 }} /></a> : n.name}</strong>
          <div className="small muted">{n.what}</div>
        </div>
      ))}
    </div>
  );
}

export default function NetworkHub() {
  const { s, ready } = useStore();
  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;
  const career = careerById(s.chosenPath?.careerId);
  const track = career?.track;
  const minority = (s.answers.raceEthnicity || []).some((r) => r && r !== "White" && r !== "Prefer not to say");

  return (
    <Wrap>
      <h2>Networking &amp; mentorship</h2>
      <p className="muted" style={{ maxWidth: 640 }}>Most veteran jobs and first customers come through people, not portals. Start with one mentor call this week — the programs below are free.</p>
      {career && (
        <div style={{ margin: "8px 0" }}>
          <Callout kind="info">Tailored to your destination: <strong>{career.label}</strong> ({TRACKS.find((t) => t.id === track)?.label} track). Change it in the Pathfinder anytime.</Callout>
        </div>
      )}
      <Group title="Start here — free mentors" icon="ti-users-group" items={NETWORKING.general} />
      {track && <Group title={`For your track: ${TRACKS.find((t) => t.id === track)?.label}`} icon="ti-target" items={NETWORKING.byTrack[track] || []} />}
      {!track && TRACKS.map((t) => <Group key={t.id} title={`${t.label} track`} icon={t.icon} items={NETWORKING.byTrack[t.id] || []} />)}
      <Group title="VA & local" icon="ti-building-community" items={NETWORKING.vaSpecific} />
      {s.answers.sex === "Female" && <Group title="Women veteran programs" icon="ti-heart-handshake" items={NETWORKING.targeted.women} />}
      {minority && <Group title="Minority veteran & business programs" icon="ti-heart-handshake" items={NETWORKING.targeted.minority} />}
      <p className="small muted" style={{ marginTop: 16 }}>Sample list — programs change; verify each directly.</p>
      <Link className="btn ghost" href="/tools"><i className="ti ti-arrow-left" /> All tools</Link>
    </Wrap>
  );
}
