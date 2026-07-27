import Link from "next/link";
import { Wrap, Eyebrow, Callout } from "@/components/ui";

// Update when the substance of this page changes, not for typo fixes.
const LAST_UPDATED = "July 27, 2026";

export const metadata = {
  title: "Privacy & data - VetPath",
  description:
    "Exactly what VetPath stores, who else can see it, what we never do with it, and how to get it deleted.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 28 }}>
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
        You are being asked for real details about your service, your health, and your family. You
        deserve a straight answer about where that goes. This page is written in plain language, and
        it describes what the site actually does today, not what we hope to do later.
      </p>
      <p className="small muted" style={{ marginTop: 6 }}>Last updated {LAST_UPDATED}.</p>

      {/* The 20-second version, for anyone who will not read the rest. */}
      <div className="card" style={{ marginTop: 22, borderColor: "var(--accent)", borderWidth: 2 }}>
        <h3 style={{ marginTop: 0 }}>
          <i className="ti ti-list-check" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> The short version
        </h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>We never sell your data, and we do not share it with advertisers.</li>
          <li>There are no analytics tools, no trackers, and no advertising pixels on this site.</li>
          <li>You can use most of the tools without an account. Building and saving a gameplan needs one.</li>
          <li>Your password is never seen or stored by us.</li>
          <li>You can ask us to delete everything, and we will.</li>
        </ul>
      </div>

      <div style={{ marginTop: 18 }}>
        <Callout kind="info">
          <i className="ti ti-info-circle" aria-hidden="true" />
          <span>
            VetPath is <strong>not the VA</strong>, a law firm, or an accredited claims representative.
            We never submit anything to the VA on your behalf and we never determine your eligibility.
          </span>
        </Callout>
      </div>

      <Section title="Using VetPath without an account">
        Most of the tools, including the benefits library, compare states, the relocation planner, the
        Reserves and Guard tab, and the resume scanner, work without signing up. What you type stays in
        your own browser&apos;s local storage on that device. It is not sent to us and we cannot see it.
        Clearing your browser data erases it, and it does not follow you to another device.
        <p style={{ margin: "10px 0 0" }}>
          Building a gameplan does require a free account, because the whole point is that it saves and
          comes back to you every time you sign in.
        </p>
      </Section>

      <Section title="What we store when you create an account">
        Your account itself holds your email address, a securely hashed password, your first name if you
        give one, and whether you opted in to email updates and when.
        <p style={{ margin: "10px 0 0" }}>
          Once you are signed in, the work you do in the app saves to your private row in our database so
          it can come back on your next visit. That includes:
        </p>
        <ul style={{ margin: "10px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
          <li>Your intake answers: age range, the state or states you live in, city, branch, military job, service era, and current status.</li>
          <li>Your VA disability rating, if you tell us.</li>
          <li>Your employment and housing situation, including if you indicate housing is unstable.</li>
          <li>Sex and race or ethnicity, if you choose to answer. Both questions are optional.</li>
          <li>Your goals, priorities, pay target, and the free-text notes you write at each step.</li>
          <li>Your generated gameplan and which steps you have checked off.</li>
          <li>Your Pathfinder answers and, if you use the resume scanner, the resume text you paste in.</li>
          <li>Display settings like your theme and text size.</li>
        </ul>
        <p style={{ margin: "10px 0 0" }}>
          Your <strong>password is never seen or stored by us</strong>. Sign-in is handled by our
          authentication provider, which stores only a hashed version that cannot be read back.
        </p>
      </Section>

      <Section title="The sensitive parts, called out plainly">
        Some of the above is more sensitive than an email address: a disability rating, race or ethnicity,
        sex, and whether your housing is at risk. Several state privacy laws treat those categories as
        sensitive personal information, and so do we.
        <p style={{ margin: "10px 0 0" }}>
          Every one of those questions is optional. You can build a useful plan without answering any of
          them. We ask only because some programs are specifically aimed at those groups, and skipping the
          question means we cannot point you to those programs. We do not use this information for
          anything else.
        </p>
      </Section>

      <Section title="Who else touches your data">
        We keep this list short on purpose, and this is the whole list:
        <ul style={{ margin: "10px 0 0", paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>
            <strong>Supabase</strong> hosts our database and handles sign-in and account emails. Your saved
            plan and your login live there.
          </li>
          <li>
            <strong>GitHub Pages</strong> serves the website itself. Like any web host, its servers log the
            IP addresses that request pages.
          </li>
          <li>
            <strong>Google Fonts and Cloudflare</strong> deliver the fonts and icons the page uses. Your
            browser requests those files directly, which means those services can see your IP address and
            which page you are on. They do not receive your answers or your plan.
          </li>
        </ul>
        <p style={{ margin: "10px 0 0" }}>
          Nobody else. No data brokers, no advertising networks, no lead buyers.
        </p>
      </Section>

      <Section title="What we do not do">
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
          <li>We do not sell, rent, or trade your information to anyone.</li>
          <li>We do not run analytics, tracking pixels, or advertising scripts. There are none on this site.</li>
          <li>We do not sell your details as a sales lead to lenders, insurers, agents, or schools.</li>
          <li>We do not use your answers to train any AI model. Your plan is produced by fixed rules we wrote, not by a language model.</li>
          <li>We do not share anything with the VA or any government agency, and they do not see your account.</li>
        </ul>
      </Section>

      <Section title="How it's protected">
        Your saved plan lives in a managed Postgres database, encrypted at rest, and everything travels
        over an encrypted connection. Access is governed by <strong>row-level security</strong>, which
        means the database itself enforces that your row can only be read or changed while signed in as
        you. Another signed-in user cannot query your data even if they try.
      </Section>

      <Section title="Email">
        We send the emails needed to run your account, such as confirming your address or resetting your
        password. Product updates and the newsletter only go to people who ticked the box when signing up,
        and every one of those has an unsubscribe link. Unsubscribing never affects your account or your
        saved plan.
      </Section>

      <Section title="Seeing, exporting, or deleting your data">
        Your plan is visible to you in the app at any time, and the print view gives you a copy you can
        keep or hand to someone helping you.
        <p style={{ margin: "10px 0 0" }}>
          To delete your saved plan and your account entirely, contact us and we will purge both, including
          your login record. We are building one-click deletion into the profile page and will remove this
          manual step when it ships. Until then, a request from you is enough. We do not ask for a reason.
        </p>
      </Section>

      <Section title="Children">
        VetPath is built for service members, veterans, and their families, and it is not directed at
        children. Please do not create an account for anyone under 13.
      </Section>

      <Section title="If you are in crisis">
        VetPath cannot provide emergency help, and nothing you type here is monitored by a human in real
        time. If you are in crisis, call or text <strong>988 and press 1</strong> for the Veterans Crisis
        Line. It is free, confidential, and staffed 24 hours a day.
      </Section>

      <Section title="Changes to this page">
        If we start collecting something new or bring in another service provider, we will update this page
        and change the date at the top. We are in a pilot, and this page will be reviewed by counsel before
        any wider public launch.
      </Section>

      <Section title="Questions or requests">
        Reach the VetPath team at the address you were invited from, and we will answer. That is also where
        to send a deletion request.
      </Section>

      <p style={{ marginTop: 30 }}>
        <Link className="btn ghost" href="/"><i className="ti ti-arrow-left" aria-hidden="true" /> Back to VetPath</Link>
      </p>
    </Wrap>
  );
}
