"use client";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Wrap, Callout } from "@/components/ui";

export default function Admin() {
  const { loadSample } = useStore();
  const router = useRouter();
  return (
    <Wrap narrow>
      <h2>Internal controls</h2>
      <Callout kind="warn">Internal preview tools - not part of the veteran-facing product.</Callout>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}><i className="ti ti-user-check" style={{ color: "var(--accent-ink)" }} /> Sample veteran</h3>
        <p className="muted small" style={{ margin: "4px 0 12px" }}>Load a demo profile and gameplan, then jump to the dashboard.</p>
        <button className="btn gold" onClick={() => { loadSample(); router.push("/dashboard"); }}>
          <i className="ti ti-user-check" /> Load a sample veteran &amp; plan
        </button>
      </div>

    </Wrap>
  );
}
