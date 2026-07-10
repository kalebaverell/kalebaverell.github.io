"use client";
// App-style bottom tab bar (mobile only, ≤920px) — the five primary destinations.
// Everything else stays reachable via the hamburger menu.
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const TABS: [string, string, string][] = [
  ["/dashboard", "Home", "ti-layout-dashboard"],
  ["/pathfinder", "Path", "ti-compass"],
  ["/benefits", "Benefits", "ti-award"],
  ["/tools", "Tools", "ti-tool"],
  ["/plan", "Plan", "ti-checkbox"],
];

export default function BottomTabs() {
  const { s, ready } = useStore();
  const path = usePathname();
  const show = ready && !!s.profile;

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
