import { Wrap, Eyebrow } from "@/components/ui";
import AdOptOutControl from "@/components/AdOptOutControl";

export const metadata = {
  title: "Do not sell or share my information - VetPath",
  description:
    "Turn off any sharing of your visit with advertising platforms. One switch, no account needed, no reason required.",
};

export default function DoNotSellPage() {
  return (
    <Wrap narrow>
      <Eyebrow>Your choice</Eyebrow>
      <h1 style={{ marginTop: 0 }}>Do not sell or share my personal information</h1>
      <p className="muted" style={{ fontSize: "calc(var(--fs-body) + 1px)", lineHeight: 1.7 }}>
        We have never sold anyone&apos;s information and we never will - that one is a rule, not a
        setting. This page controls the other thing the law groups under the same heading:
        whether a visit to our public pages may be shared with an advertising platform so we can
        show you a follow-up ad.
      </p>

      <AdOptOutControl />

      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 8 }}>What this switch does and does not reach</h3>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
            <li>
              It only ever concerned our public marketing pages. The pages where you answer questions
              about your service, disability rating, health, housing, or family have never carried an
              advertising script and never will.
            </li>
            <li>
              It does not touch your account, your answers, or your gameplan. Those follow the rules on
              the <a href="/privacy">privacy page</a>, and no advertiser sees them.
            </li>
            <li>
              Your choice is stored on this device only, so please set it again on your phone if you set
              it on a computer. We do not create an account or a profile to remember it, because doing
              that would defeat the point.
            </li>
            <li>
              If your browser sends a Global Privacy Control or Do Not Track signal, we already treat
              that as an opt-out without you having to visit this page.
            </li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 8 }}>Prefer to write to us?</h3>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          You can send the request instead of using the switch, and you can ask us to delete everything
          we hold at the same time. Reach the VetPath team at the address you were invited from. We do
          not ask for a reason and we do not try to talk you out of it.
        </div>
      </div>

      <p style={{ marginTop: 30 }}>
        <a className="btn ghost" href="/privacy"><i className="ti ti-arrow-left" aria-hidden="true" /> Back to privacy &amp; data</a>
      </p>
    </Wrap>
  );
}
