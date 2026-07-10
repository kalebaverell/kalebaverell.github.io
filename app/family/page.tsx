"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { careerById } from "@/lib/data";
import { Wrap, Callout } from "@/components/ui";
import {
  buildFamilyPlan,
  hasFamilySelections,
  familyAudiences,
  FAMILY_GROUPS,
  FAMILY_NOTE,
} from "@/lib/family";
import type { FamilyAudience, FamilyCheckpoint, FamilyEntry, FamilyWho } from "@/lib/family";

const WHO: Record<FamilyWho, { label: string; icon: string }> = {
  spouse: { label: "Spouse", icon: "ti-heart" },
  kids: { label: "Kids", icon: "ti-school" },
  caregiver: { label: "Caregiver", icon: "ti-heart-handshake" },
  household: { label: "Household", icon: "ti-home" },
};

const AUDIENCE_LABEL: Record<FamilyAudience, string> = {
  spouse: "Spouse",
  kids: "Kids",
  caregiver: "Caregiver",
  survivor: "Survivor planning",
  household: "Whole household",
};

const WHEN_GROUPS: { key: FamilyCheckpoint["when"]; title: string; icon: string }[] = [
  { key: "30", title: "Next 30 days", icon: "ti-calendar-due" },
  { key: "60", title: "Days 31–60", icon: "ti-calendar" },
  { key: "90", title: "Days 61–90", icon: "ti-calendar-plus" },
  { key: "long", title: "Long-term", icon: "ti-telescope" },
];

function WhoChip({ who }: { who: FamilyWho }) {
  const w = WHO[who];
  return (
    <span className="chip gold" style={{ padding: "3px 10px", fontSize: 12.5, margin: 0 }}>
      <i className={`ti ${w.icon}`} aria-hidden="true" /> {w.label}
    </span>
  );
}

function EntryRow({ e }: { e: FamilyEntry }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <strong>
        {e.url ? (
          <a href={e.url} target="_blank" rel="noopener noreferrer">
            {e.name} <i className="ti ti-external-link" aria-hidden="true" style={{ fontSize: 14 }} />
          </a>
        ) : e.internal ? (
          <Link href={e.internal}>
            {e.name} <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: 14 }} />
          </Link>
        ) : (
          e.name
        )}
      </strong>
      <div className="small muted">{e.what}</div>
      {e.scopeNote && (
        <div className="small" style={{ color: "var(--warn)", marginTop: 4 }}>
          <i className="ti ti-alert-triangle" aria-hidden="true" style={{ fontSize: 14 }} /> {e.scopeNote}
        </div>
      )}
      {e.verified && (
        <div className="small muted" style={{ marginTop: 2 }}>
          Facts checked against the official source {e.verified} — always confirm before deciding.
        </div>
      )}
    </div>
  );
}

export default function FamilyPlanning() {
  const { s, ready, setStep } = useStore();
  if (!ready) return <Wrap><p className="muted">Loading…</p></Wrap>;

  const a = s.answers;
  const hasFamily = hasFamilySelections(a);

  // ----- Warm empty state: household lens explained, solo is fine too -----
  if (!hasFamily) {
    return (
      <Wrap narrow>
        <h2>Family-centered planning</h2>
        <p className="muted" style={{ maxWidth: 640 }}>
          Veterans don&apos;t transition alone — spouses, kids, and caregivers live every one of these decisions too.
          This page turns your plan into a household plan.
        </p>
        <div className="card" style={{ marginTop: 16, textAlign: "center", padding: "36px 24px" }}>
          <i className="ti ti-users" aria-hidden="true" style={{ fontSize: 44, color: "var(--accent-ink)" }} />
          <h3 style={{ margin: "12px 0 6px" }}>No family selections yet — and that&apos;s okay</h3>
          <p className="muted" style={{ maxWidth: 520, margin: "0 auto" }}>
            If there&apos;s a spouse, kids, or a caregiver in the picture, VetPath can fold them into your gameplan —
            GI Bill transfers, spouse career moves, childcare timing, caregiver support. Tell us in step 3 of the
            intake and this page builds the shared checkpoints for you.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 18 }}>
            <Link className="btn gold" href="/onboarding" onClick={() => setStep(2)}>
              <i className="ti ti-users-plus" /> Add family needs (intake step 3)
            </Link>
            <Link className="btn ghost" href="/dashboard">
              <i className="ti ti-arrow-right" /> Keep planning for just me
            </Link>
          </div>
          <p className="small muted" style={{ margin: "16px 0 0" }}>
            A plan for just you is a complete plan — this lens is here whenever your household needs it.
          </p>
        </div>
        <p className="small muted" style={{ marginTop: 16 }}>{FAMILY_NOTE}</p>
      </Wrap>
    );
  }

  // ----- Household plan -----
  const career = careerById(s.chosenPath?.careerId);
  const plan = buildFamilyPlan(a, career?.label);
  const audiences = familyAudiences(a);
  const selections = (a.familyNeeds || []).filter((f) => f && f !== "None");
  const resourcesByGroup = FAMILY_GROUPS.map((g) => ({
    group: g,
    entries: plan.resources.filter((e) => e.groupId === g.id),
  })).filter((g) => g.entries.length > 0);

  return (
    <Wrap>
      <h2>Family-centered planning</h2>
      <p className="muted" style={{ maxWidth: 640 }}>
        You decide as a household — so your plan should too. Shared checkpoints, decisions to make together, and
        official resources for everyone under your roof. Sample guidance only; verify everything at the official source.
      </p>

      {/* Household snapshot */}
      <div className="card" style={{ marginTop: 16, background: "var(--primary)", color: "#fff", border: "none" }}>
        <h3 style={{ color: "#fff", margin: "0 0 8px" }}>
          <i className="ti ti-home-heart" aria-hidden="true" /> Household snapshot
        </h3>
        <p style={{ color: "#CBD8E4", margin: "0 0 12px", maxWidth: 640 }}>
          {a.status ? `${a.status}. ` : ""}
          {a.disabilityRating && a.disabilityRating !== "Prefer not to say" ? `VA rating: ${a.disabilityRating}. ` : ""}
          Planning together for:
        </p>
        <div>
          {audiences.map((aud) => (
            <span key={aud} className="chip gold">
              <i className={`ti ${WHO[(aud === "survivor" ? "household" : aud) as FamilyWho].icon}`} aria-hidden="true" />{" "}
              {AUDIENCE_LABEL[aud]}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <span className="small" style={{ color: "#CBD8E4" }}>Your intake selections: </span>
          {selections.map((f) => (
            <span key={f} className="tag" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>{f}</span>
          ))}
        </div>
      </div>

      {career && (
        <div style={{ margin: "12px 0 0" }}>
          <Callout kind="info">
            Planned around your destination: <strong>{career.label}</strong> — the household checkpoints below assume
            the family is making that move with you. Change it anytime in the Pathfinder.
          </Callout>
        </div>
      )}

      {/* Family checkpoints timeline */}
      <section aria-labelledby="family-checkpoints" style={{ marginTop: 20 }}>
        <h3 id="family-checkpoints">
          <i className="ti ti-timeline" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Family checkpoints
        </h3>
        <p className="muted small" style={{ maxWidth: 640 }}>
          Grouped by when to handle them, and tagged with who each one is for.
        </p>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 10 }}>
          {WHEN_GROUPS.map((wg) => {
            const items = plan.checkpoints.filter((c) => c.when === wg.key);
            return (
              <div className="card" key={wg.key}>
                <h4>
                  <i className={`ti ${wg.icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {wg.title}
                </h4>
                <div style={{ marginTop: 6 }}>
                  {items.length ? (
                    items.map((c, i) => (
                      <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                        <WhoChip who={c.who} />
                        <div style={{ marginTop: 6, fontSize: "var(--fs-small)" }}>{c.text}</div>
                      </div>
                    ))
                  ) : (
                    <p className="muted small">Nothing scheduled here.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Decisions to make together */}
      {plan.decisions.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>
            <i className="ti ti-scale" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Decisions to make together
          </h3>
          <p className="muted small">These aren&apos;t solo calls — put them on the kitchen table, not just your to-do list.</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {plan.decisions.map((d, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources by group */}
      <section aria-labelledby="family-resources" style={{ marginTop: 20 }}>
        <h3 id="family-resources">
          <i className="ti ti-lifebuoy" aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> Resources for your household
        </h3>
        <p className="muted small" style={{ maxWidth: 640 }}>
          Filtered to who you&apos;re planning for. Official sources only — always verify there before acting.
        </p>
        {resourcesByGroup.map(({ group, entries }) => (
          <div className="card" style={{ marginTop: 16 }} key={group.id}>
            <h3>
              <i className={`ti ${group.icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {group.label}
            </h3>
            {entries.map((e) => (
              <EntryRow key={e.name} e={e} />
            ))}
          </div>
        ))}
      </section>

      <div style={{ marginTop: 16 }}>
        <Callout kind="warn">
          {FAMILY_NOTE} VetPath is not the VA and never confirms eligibility for you or your family.
        </Callout>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
        <Link className="btn" href="/dashboard"><i className="ti ti-layout-dashboard" /> Back to my gameplan</Link>
        <Link className="btn ghost" href="/benefits"><i className="ti ti-award" /> Benefits (incl. state programs)</Link>
      </div>
    </Wrap>
  );
}
