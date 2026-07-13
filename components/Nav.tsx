"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { BRAND } from "@/lib/data";

// Full app nav — shown once someone has signed in or started a plan.
const APP_LINKS: [string, string, string][] = [
  ["/dashboard", "Dashboard", "ti-layout-dashboard"],
  ["/pathfinder", "Pathfinder", "ti-compass"],
  ["/goals", "Goals", "ti-target"],
  ["/benefits", "Benefits", "ti-award"],
  ["/tools", "Tools", "ti-tool"],
  ["/plan", "Action plan", "ti-checkbox"],
  ["/profile", "Profile", "ti-user-circle"],
];
// Explore nav — shown to first-time / logged-out visitors. Every one of these
// works without an account, so there are no dead-end empty states. "Strategy"
// (the internal founder/pitch view) is intentionally not in the public nav.
const MARKETING_LINKS: [string, string, string][] = [
  ["/pathfinder", "Pathfinder", "ti-compass"],
  ["/benefits", "Benefits", "ti-award"],
  ["/tools", "Tools", "ti-tool"],
  ["/trust", "Why trust us", "ti-shield-check"],
];

export default function Nav() {
  const { s, cycleTextSize } = useStore();
  const { enabled: authEnabled, user, openAuth, signOut } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sizeLabel = s.textSize === "base" ? "Normal" : s.textSize === "lg" ? "Large" : "Extra large";
  // On the homepage the nav floats transparently over the hero image, then turns solid
  // once the reader scrolls past the hero (or opens the mobile menu). Every other page
  // keeps the standard solid bar.
  const onHome = path === "/" || path === "";
  // The public landing page always shows the clean marketing nav (Pathfinder · Benefits ·
  // Tools · Why trust us) — even for signed-in / returning visitors — so the official link
  // looks the same for everyone. Inside the app (any non-home page) a signed-in user or
  // someone who started a plan still gets the full workspace nav.
  const started = Boolean(user || s.profile) && !onHome;
  const links = started ? APP_LINKS : MARKETING_LINKS;

  // Close the mobile menu whenever navigation happens
  useEffect(() => { setOpen(false); }, [path]);

  // Track scroll only on the homepage so the floating nav knows when to go solid.
  useEffect(() => {
    if (!onHome) { setScrolled(false); return; }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  return (
    <header className={`nav${onHome ? " nav--hero" : ""}${started ? " nav--app" : ""}${onHome && (scrolled || open) ? " is-solid" : ""}`}>
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className="nav-inner">
        <Link href="/" aria-label={`${BRAND.name} home`} className="brand-lock">
          <span aria-hidden="true" className="brand-mark"><i className="ti ti-route" /></span>
          <span className="brand-word">{BRAND.name}</span>
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <i className={`ti ${open ? "ti-x" : "ti-menu-2"}`} aria-hidden="true" />
        </button>
        <nav aria-label="Main" id="main-nav" className={`nav-links${open ? " open" : ""}`}>
          {links.map(([href, label, icon]) => {
            const active = path === href || path === `${href}/`;
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`nav-link${active ? " active" : ""}`} onClick={() => setOpen(false)}>
                <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 16 }} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="nav-actions">
          <button
            onClick={cycleTextSize}
            aria-label={`Text size: ${sizeLabel}. Click to change.`}
            title={`Text size: ${sizeLabel} — click to change`}
            className="nav-aa"
            style={{ fontSize: s.textSize === "base" ? 16 : s.textSize === "lg" ? 18 : 20 }}
          >
            Aa
          </button>
          {authEnabled ? (
            user ? (
              <span className="nav-user" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className="ti ti-user-circle" aria-hidden="true" />
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {(user.user_metadata as any)?.full_name || user.email}
                </span>
                <button type="button" onClick={signOut} className="nav-signout">Sign out</button>
              </span>
            ) : (
              <button type="button" onClick={openAuth} className="btn gold sm nav-signin">
                <i className="ti ti-user-plus" aria-hidden="true" /> Sign in
              </button>
            )
          ) : (
            s.profile && (
              <span className="nav-user"><i className="ti ti-user-circle" aria-hidden="true" /> {s.profile.name}</span>
            )
          )}
        </div>
      </div>
    </header>
  );
}
