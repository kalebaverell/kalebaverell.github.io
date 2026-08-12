"use client";
// The single-action funnel: until the gameplan quiz is complete, every app route
// shows one card with one button instead of its content. One gate here beats a
// dozen per-page empty states, and it means no route can leak the full UI to a
// first-time visitor. Marketing, legal, and account-recovery paths stay open.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Wrap } from "@/components/ui";
import PageSkeleton from "@/components/PageSkeleton";

// Reachable without a gameplan. Everything else funnels to the quiz.
const OPEN_PATHS = new Set([
  "", // home
  "onboarding", // the quiz itself
  "trust", // the credibility promise stays public
  "privacy",
  "terms",
  "do-not-sell", // a privacy control can never be behind a funnel
  "admin", // internal controls (sample loader)
  "reset", // password reset must never be gated
]);

export default function FunnelGate({ children }: { children: React.ReactNode }) {
  const { s, ready } = useStore();
  const path = usePathname() || "/";
  const first = path.split("/").filter(Boolean)[0] || "";
  const open = OPEN_PATHS.has(first);

  if (open || s.gameplan) return <>{children}</>;
  // Not ready yet: show a neutral skeleton rather than flashing the gate (or the page).
  if (!ready) return <PageSkeleton kind="narrow" />;

  // Mid-intake visitors get a resume card, not a start-over pitch (suggestion #6b):
  // their answers are saved, and the card says so with the exact step to rejoin.
  const midIntake = s.step > 0;
  return (
    <Wrap narrow>
      <div className="card" style={{ textAlign: "center", padding: "44px 28px", marginTop: 24 }}>
        <div className="iconwrap" style={{ width: 54, height: 54, fontSize: 26, margin: "0 auto 14px" }}>
          <i className={`ti ${midIntake ? "ti-player-play" : "ti-map-2"}`} aria-hidden="true" />
        </div>
        <h2 style={{ margin: "0 0 8px" }}>{midIntake ? "Pick up where you left off" : "First, build your gameplan"}</h2>
        <p className="muted" style={{ maxWidth: 400, margin: "0 auto 20px" }}>
          {midIntake
            ? `You're on step ${Math.min(s.step + 1, 5)} of 5 and your answers are saved - a few more questions and the plan is yours.`
            : "A few quick questions. Everything here unlocks once your plan exists, so it can all point at your next steps."}
        </p>
        <Link className="btn gold" href="/onboarding" style={{ display: "inline-flex" }}>
          <i className={`ti ${midIntake ? "ti-player-play" : "ti-compass"}`} /> {midIntake ? "Continue my gameplan" : "Build my gameplan"}
        </Link>
        <p className="small muted" style={{ margin: "18px 0 0" }}>
          {midIntake ? "Saved automatically" : "About 10 minutes"} · free · <Link href="/trust">why you can trust it</Link>
        </p>
      </div>
    </Wrap>
  );
}
