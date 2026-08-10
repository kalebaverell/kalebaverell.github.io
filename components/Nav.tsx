"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { BRAND } from "@/lib/data";

// Post-plan nav: four destinations, not seven. Pathfinder, goals, and benefits
// are reached from inside the gameplan, where they have context, instead of
// competing as top-level tabs.
const APP_LINKS: [string, string, string][] = [
  ["/dashboard", "My gameplan", "ti-layout-dashboard"],
  ["/plan", "Action plan", "ti-checkbox"],
  ["/tools", "Explore", "ti-tool"],
  ["/profile", "Profile", "ti-user-circle"],
];
// Pre-plan nav: the funnel is a single action, so the only link besides the
// build-my-gameplan CTA (rendered in nav-actions) is the credibility page.
const MARKETING_LINKS: [string, string, string][] = [
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
  // The funnel decides the nav: until a gameplan exists there is nothing to
  // navigate to, so visitors get one link and one CTA. Once a plan exists the
  // app links follow the user everywhere - including the homepage, where a
  // returning veteran needs a way back into their plan, not a restart pitch.
  const started = Boolean(s.gameplan);
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
          {!started && path !== "/onboarding" && path !== "/onboarding/" && (
            <Link className="btn gold sm" href="/onboarding">
              <i className="ti ti-compass" aria-hidden="true" /> Build my gameplan
            </Link>
          )}
          {started && onHome && (
            <Link className="btn gold sm" href="/dashboard">
              <i className="ti ti-map-check" aria-hidden="true" /> Open my gameplan
            </Link>
          )}
          <button
            onClick={cycleTextSize}
            aria-label={`Text size: ${sizeLabel}. Click to change.`}
            title={`Text size: ${sizeLabel} - click to change`}
            className="nav-aa"
            style={{ fontSize: s.textSize === "base" ? 16 : s.textSize === "lg" ? 18 : 20 }}
          >
            Aa
          </button>
          {/* nav-user carries no inline display style: the ≤920px media query hides
              the chip, and an inline style would defeat it and shove the CTA off
              small screens. */}
          {authEnabled ? (
            user ? (
              <span className="nav-user">
                <i className="ti ti-user-circle" aria-hidden="true" />
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {(user.user_metadata as any)?.full_name || user.email}
                </span>
                <button type="button" onClick={signOut} className="nav-signout">Sign out</button>
              </span>
            ) : (
              <button type="button" onClick={() => openAuth("signin")} className="btn gold sm nav-signin">
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
