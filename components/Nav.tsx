"use client";
import { useEffect, useRef, useState } from "react";
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
// Pre-plan nav (fortune-preview port): the enterprise link set. Gated pages
// funnel first-time visitors into the quiz pitch by design - the gate IS the
// conversion surface, so these links feed it rather than fighting it.
const MARKETING_LINKS: [string, string, string][] = [
  ["/#how-it-works", "How it works", "ti-route"],
  ["/benefits", "Benefits", "ti-award"],
  ["/trust", "Why trust us", "ti-shield-check"],
  ["/family", "For families", "ti-users"],
];
const TOOL_ITEMS: [string, string, string][] = [
  ["/pathfinder", "Career pathfinder", "ti-compass"],
  ["/relocate", "Relocation planner", "ti-map-2"],
  ["/timeline", "Transition timeline", "ti-calendar-check"],
  ["/compare", "Compare places", "ti-git-compare"],
  ["/resume", "Resume builder", "ti-file-text"],
  ["/tools", "All tools", "ti-arrow-right"],
];

export default function Nav() {
  const { s, cycleTextSize } = useStore();
  const { enabled: authEnabled, user, openAuth, signOut } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const sizeLabel = s.textSize === "base" ? "Normal" : s.textSize === "lg" ? "Large" : "Extra large";
  const onHome = path === "/" || path === "";
  // The funnel decides the nav: until a gameplan exists there is nothing to
  // navigate to, so visitors get the marketing set and one CTA. Once a plan
  // exists the app links follow the user everywhere - including the homepage,
  // where a returning veteran needs a way back into their plan, not a restart pitch.
  // App tabs additionally require a signed-in account (Kaleb, Aug 24): a local
  // plan without a session - a loaded sample, a legacy pre-auth plan - browses
  // as a visitor until sign-in. When auth is not configured (local dev fallback),
  // the gameplan alone still unlocks the tabs.
  const started = Boolean(s.gameplan) && (!authEnabled || Boolean(user));
  const links = started ? APP_LINKS : MARKETING_LINKS;

  // Close menus whenever navigation happens
  useEffect(() => { setOpen(false); setToolsOpen(false); }, [path]);

  // Track scroll only on the homepage: the ribbon floats transparent over the
  // hero at the top and turns solid white as soon as the user starts scrolling.
  useEffect(() => {
    if (!onHome) { setScrolled(false); return; }
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  // Tools dropdown: close on outside click or Escape.
  useEffect(() => {
    if (!toolsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setToolsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setToolsOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [toolsOpen]);

  return (
    <>
      <div className="announce">
        Built with veterans - <b>every number cited to its official source</b>, always free for those who served.
      </div>
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
            {!started && (
              <div className="nav-drop" ref={dropRef}>
                <button
                  type="button"
                  className={`nav-link nav-drop-btn${toolsOpen ? " active" : ""}`}
                  aria-expanded={toolsOpen}
                  aria-haspopup="true"
                  onClick={() => setToolsOpen(!toolsOpen)}
                >
                  <i className="ti ti-tool" aria-hidden="true" style={{ fontSize: 16 }} />
                  Tools
                  <i className={`ti ${toolsOpen ? "ti-chevron-up" : "ti-chevron-down"}`} aria-hidden="true" style={{ fontSize: 14 }} />
                </button>
                {toolsOpen && (
                  <div className="nav-drop-panel">
                    {TOOL_ITEMS.map(([href, label, icon]) => (
                      <Link key={href} href={href} onClick={() => { setToolsOpen(false); setOpen(false); }}>
                        <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 16 }} />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                <button type="button" onClick={() => openAuth("signin")} className="btn ghost sm nav-signin">
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
    </>
  );
}
