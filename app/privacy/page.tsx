import Link from "next/link";
import { Wrap, Eyebrow, Callout } from "@/components/ui";

export const metadata = {
  title: "Privacy & data — VetPath",
  description: "What VetPath stores, why, how it's protected, and how to delete it.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 26 }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <div className="muted" style={{ lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <Wrap narrow>
      <Eyebrow>Privacy &amp; data</Eyebrow>
      <h1 style={{ marginTop: 0 }}>What we store, and how it&apos;s protected</h1>
      <p className="muted" style={{ fontSize: "calc(var(--fs-body) + 1px)", lineHeight: 1.7 }}>
        VetPath is a planning &amp; education tool for people leaving military service. This page
        explains, in plain language, what happens to your information. It is written for a pilot /
        testing phase and will be reviewed by counsel before any wider launch.
      </p>

      <Callout kind="info">
        <i className="ti ti-info-circle" aria-hidden="true" />
        <span>VetPath is <strong>not the VA</strong>, a law firm, or an accredited claims representative,
        and the benefit figures shown are <strong>sample/demo data</strong> until you confirm them with
        an official source.</span>
      </Callout>

      <Section title="If you don't create an account">
        Nothing you enter leaves your browser. Your answers and plan are kept in your own device&apos;s
        local storage so you can use the tools without signing up.
      </Section>

      <Section title="If you create an account">
        We store what&apos;s needed to save your plan and let you sign back in:
        <ul style={{ margin: "10px 0 0", paddingLeft: 20 }}>
          <li>your <strong>email address</strong> and, if you give it, your first name;</li>
          <li>the <strong>plan and answers</strong> you build in the app (your goals, situation, and the
            gameplan generated from them);</li>
          <li>whether you <strong>opted in</strong> to our newsletter, and when.</li>
        </ul>
        <p style={{ margin: "10px 0 0" }}>
          Your <strong>password is never seen or stored by us</strong>. Sign-in is handled by our
          authentication provider (Supabase), which stores only a securely hashed version of it.
        </p>
      </Section>

      <Section title="How it's protected">
        Account data lives in a managed Postgres database (Supabase), encrypted at rest. Access is
        governed by <strong>row-level security</strong>, meaning your row can only be read or changed by
        you when signed in — no other user can see it. We do not sell your data or share it with
        advertisers.
      </Section>

      <Section title="Email &amp; newsletter">
        If you opt in, we&apos;ll email you product updates and a newsletter. Every message includes an
        unsubscribe link, and you can opt out anytime. We only email people who chose to hear from us.
      </Section>

      <Section title="Deleting your data">
        You can delete your saved plan and profile from your account at any time — this removes your row
        from our database. To also fully remove your login record, email us and we&apos;ll purge it.
        We&apos;ll add one-click full deletion before public launch.
      </Section>

      <Section title="Crisis support">
        VetPath can&apos;t provide emergency help. If you&apos;re in crisis, call or text{" "}
        <strong>988 and press 1</strong> for the Veterans Crisis Line — free, confidential, 24/7.
      </Section>

      <Section title="Questions">
        Reach out to the VetPath team through the address you were invited from. This is a pilot; your
        feedback shapes how we handle data going forward.
      </Section>

      <p style={{ marginTop: 28 }}>
        <Link className="btn ghost" href="/"><i className="ti ti-arrow-left" aria-hidden="true" /> Back to VetPath</Link>
      </p>
    </Wrap>
  );
}
