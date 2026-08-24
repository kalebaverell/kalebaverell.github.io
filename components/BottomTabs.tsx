"use client";
// App-style bottom tab bar (mobile only, ≤920px) - the five primary destinations.
// Everything else stays reachable via the hamburger menu.
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

const TABS: [string, string, string][] = [
  ["/dashboard", "Gameplan", "ti-layout-dashboard"],
  ["/plan", "Actions", "ti-checkbox"],
  ["/tools", "Explore", "ti-tool"],
  ["/profile", "Profile", "ti-user-circle"],
];

export default function BottomTabs() {
  const { s, ready } = useStore();
  const { enabled: authEnabled, user } = useAuth();
  const path = usePathname();
  // Tabs appear only once a gameplan exists - before that the funnel has a
  // single action and a tab bar would just be four locked doors. Same
  // signed-in requirement as the top nav (Kaleb, Aug 24); auth-disabled
  // environments keep the gameplan-only behavior.
  const show = ready && !!s.gameplan && (!authEnabled || Boolean(user));

  useEffect(() => {
    document.body.classList.toggle("has-tabbar", show);
    return () => document.body.classList.remove("has-tabbar");
  }, [show]);

  if (!show) return null;

  return (
    <nav className="tabbar" aria-label="Primary">
      {TABS.map(([href, label, icon]) => {
        const active = path === href || path === `${href}/`;
        return (
          <Link key={href} href={href} className={`tab${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
            <i className={`ti ${icon}`} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
