import { Eyebrow } from "@/components/ui";
import { routeMeta } from "@/lib/metadata";
import { DONATE_CONFIGURED, DONATE_URL, SUPPORT_EMAIL } from "@/lib/support";

export const metadata = routeMeta(
  "Support VetPath",
  "VetPath is free for every veteran who uses it. Supporters keep it that way."
);

export default function SupportPage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 22px 72px", textAlign: "center" }}>
      <Eyebrow>For supporters</Eyebrow>
      <h1 style={{ marginTop: 0, fontSize: "clamp(34px, 6vw, 46px)" }}>Support the mission</h1>
      <p className="muted" style={{ fontSize: "calc(var(--fs-body) + 2px)", lineHeight: 1.65, margin: "10px auto 36px", maxWidth: 460 }}>
        VetPath is free for every veteran who uses it.
        <br />
        Supporters keep it that way.
      </p>

      <div
        className="grain"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(160deg, #11785E 0%, #0F6E56 45%, #0A4A3C 100%)",
          padding: "clamp(40px, 7vw, 56px) clamp(24px, 5vw, 48px)",
          boxShadow: "0 18px 44px rgba(7, 61, 48, .28)",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
          style={{ position: "absolute", right: -46, bottom: -52, width: 210, height: 210, opacity: 0.14 }}
        >
          <circle cx="100" cy="100" r="96" stroke="#FBFAF7" strokeWidth="2" />
          <circle cx="100" cy="100" r="70" stroke="#FBFAF7" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="44" stroke="#FBFAF7" strokeWidth="1" />
          <path d="M100 14 L108 92 L100 100 L92 92 Z" fill="#D98A3D" />
          <path d="M100 186 L92 108 L100 100 L108 108 Z" fill="#FBFAF7" />
        </svg>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(28px, 5vw, 38px)",
              lineHeight: 1.18,
              letterSpacing: "-.012em",
              color: "#FBFAF7",
              maxWidth: 400,
              margin: "0 auto 30px",
            }}
          >
            Keep it free for the{" "}
            <span style={{ color: "#F3D9B8" }}>next veteran.</span>
          </div>

          {DONATE_CONFIGURED ? (
            <a
              className="btn gold"
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "calc(var(--fs-btn) + 2px)", padding: "16px 38px" }}
            >
              <i className="ti ti-heart" aria-hidden="true" /> Support the mission
            </a>
          ) : (
            <a
              className="btn gold"
              href={`mailto:${SUPPORT_EMAIL}?subject=Supporting%20VetPath`}
              style={{ fontSize: "calc(var(--fs-btn) + 2px)", padding: "16px 38px" }}
            >
              <i className="ti ti-mail" aria-hidden="true" /> Email us about contributing
            </a>
          )}

          <div style={{ marginTop: 18, fontSize: 13.5, color: "rgba(251, 250, 247, .78)" }}>
            Any amount helps &middot; Secure checkout by Stripe
          </div>
        </div>
      </div>

      <p className="muted" style={{ margin: "34px auto 0", maxWidth: 480, lineHeight: 1.65 }}>
        Prefer to help for free? Send <strong>vetpathusa.com</strong> to one veteran - or{" "}
        <a href={`mailto:${SUPPORT_EMAIL}?subject=VetPath%20introduction`} style={{ fontWeight: 600 }}>
          introduce us
        </a>{" "}
        to a transition office or VSO.
      </p>

      <p className="muted" style={{ margin: "26px auto 0", maxWidth: 480, fontSize: 12.5, lineHeight: 1.6 }}>
        Contributions buy nothing, unlock nothing, and never touch any veteran&apos;s information.
        VetPath is a planning tool - not the VA, and not affiliated with the government.
      </p>
    </div>
  );
}
