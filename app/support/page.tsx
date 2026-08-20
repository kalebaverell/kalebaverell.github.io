import { Wrap, Eyebrow } from "@/components/ui";
import { routeMeta } from "@/lib/metadata";
import { DONATE_CONFIGURED, DONATE_URL, SUPPORT_EMAIL } from "@/lib/support";

export const metadata = routeMeta(
  "Support VetPath",
  "VetPath is free for veterans, always. If you want to help carry the costs that keep it that way, this is the page."
);

const waysToHelp = [
  {
    icon: "ti-users-group",
    title: "Send it to one veteran",
    body:
      "The single most valuable thing you can do costs nothing: one text to someone separating in the next year. vetpathusa.com works on any phone, no app.",
  },
  {
    icon: "ti-mail",
    title: "Introduce us to a transition office or VSO",
    body:
      "If you know someone at a base transition program, a county veterans office, or a VSO, a one-line introduction puts VetPath in front of every veteran they serve.",
  },
  {
    icon: "ti-messages",
    title: "Tell us what's wrong or missing",
    body:
      "Found a figure that's off, a broken link, or a benefit we should cover? Saying so makes the tool better for everyone after you.",
  },
];

export default function SupportPage() {
  return (
    <Wrap narrow>
      <Eyebrow>For supporters</Eyebrow>
      <h1 style={{ marginTop: 0 }}>Keep it free for the next veteran</h1>
      <p className="muted" style={{ fontSize: "calc(var(--fs-body) + 1px)", lineHeight: 1.7 }}>
        VetPath is free for veterans - no ads, no paid tiers, and nothing sold to the people using
        it. That&apos;s a promise, not a business model, which means the costs of running it are
        carried by the two of us who built it. This page exists for everyone else: family, friends,
        and people who simply want transition to go better for those who served.
      </p>

      <div className="card" style={{ marginTop: 26, padding: "26px 26px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
            }}
          >
            <i className="ti ti-heart-handshake" />
          </span>
          <h2 style={{ margin: 0 }}>Chip in toward the costs</h2>
        </div>
        <p className="muted" style={{ lineHeight: 1.7, margin: "0 0 18px" }}>
          Contributions go toward the direct costs of running VetPath: hosting, the domain, and the
          ongoing work of keeping every benefit figure verified against its official source. Any
          amount helps, and none of it is expected.
        </p>
        {DONATE_CONFIGURED ? (
          <a className="btn" href={DONATE_URL} target="_blank" rel="noopener noreferrer">
            <i className="ti ti-heart" aria-hidden="true" /> Contribute securely
          </a>
        ) : (
          <>
            <p style={{ lineHeight: 1.7, margin: "0 0 14px" }}>
              Card contributions are almost online. Until then, email us and we&apos;ll reply
              personally with a way to help.
            </p>
            <a className="btn" href={`mailto:${SUPPORT_EMAIL}?subject=Supporting%20VetPath`}>
              <i className="ti ti-mail" aria-hidden="true" /> Email us about contributing
            </a>
          </>
        )}
      </div>

      <div style={{ marginTop: 34 }}>
        <h2 style={{ marginBottom: 6 }}>Three ways to help that cost nothing</h2>
        <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
          {waysToHelp.map((w) => (
            <div key={w.title} className="card" style={{ padding: "18px 20px", display: "flex", gap: 14 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "var(--surface-2)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                }}
              >
                <i className={`ti ${w.icon}`} />
              </span>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "calc(var(--fs-body) + 2px)" }}>{w.title}</h3>
                <div className="muted" style={{ lineHeight: 1.65, fontSize: "var(--fs-body)" }}>{w.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="disclaimer" style={{ marginTop: 34, textAlign: "left", lineHeight: 1.7 }}>
        <strong>The honest fine print.</strong> VetPath is an independent project, not a charity or
        501(c)(3), so contributions are not tax-deductible. They are voluntary support for a free
        tool: they buy nothing, unlock nothing, and never grant anyone access to any veteran&apos;s
        information. VetPath is a planning and education tool - not the VA, and not affiliated with
        or endorsed by the government.
      </div>

      <p style={{ marginTop: 26 }}>
        <a className="btn ghost" href="/trust">
          <i className="ti ti-arrow-left" aria-hidden="true" /> How we earn trust
        </a>
      </p>
    </Wrap>
  );
}
