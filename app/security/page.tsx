// Security - the "is this a hobby project?" answer, in facts only.
// Every line was checked against the code or the live database on
// LAST_CHECKED. When any of it changes (a new table, a new service provider,
// the uptime check, the delete flow) this page changes in the same commit,
// exactly like the privacy page.
import Link from "next/link";
import { routeMeta } from "@/lib/metadata";
import { Wrap, Eyebrow, Callout } from "@/components/ui";

const LAST_CHECKED = "October 2, 2026";
// public schema after the partner migration: profiles, journal_entries, visit_days, email_log, feedback, app_secrets, partner_codes - relrowsecurity true on all seven.
const TABLES = 7;

export const metadata = routeMeta(
  "Security",
  "How VetPath protects your account: what we store, row-level security on every table, no data sale, no AI, one-step account deletion, automated uptime checks, and how to report a problem."
);

function Section({ id, icon, title, children }: { id?: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ marginTop: 28, scrollMarginTop: 90 }}>
      <h3 style={{ marginBottom: 8 }}>
        <i className={`ti ${icon}`} aria-hidden="true" style={{ color: "var(--accent-ink)" }} /> {title}
      </h3>
      <div className="muted" style={{ lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <Wrap narrow>
      <Eyebrow>Security</Eyebrow>
      <h1 style={{ marginTop: 0 }}>How your account is protected</h1>
      <p className="muted" style={{ fontSize: "calc(var(--fs-body) + 1px)", lineHeight: 1.7 }}>
        Whether you are a veteran deciding to make an account or a service officer deciding whether to
        hand VetPath to one, here is exactly how your information is handled. Every line on this page
        was checked against our code and our live database. Nothing here is a plan for later.
      </p>
      <p className="small muted" style={{ marginTop: 6 }}>Last checked {LAST_CHECKED}.</p>

      <div className="card" style={{ marginTop: 22, borderColor: "var(--accent)", borderWidth: 2 }}>
        <h3 style={{ marginTop: 0 }}>
          <i className="ti ti-list-check" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> The short version
        </h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>Row-level security is on for every one of VetPath&apos;s database tables - {TABLES} of {TABLES}.</li>
          <li>We do not sell your data, and no advertising pixel is switched on.</li>
          <li>There is no AI in VetPath. Your plan comes from fixed rules we wrote.</li>
          <li>You can delete your whole account yourself, in one step, from your profile page.</li>
          <li>An automated check tests the site, sign-in, and database about every 30 minutes.</li>
        </ul>
      </div>

      <Section icon="ti-file-text" title="What we store">
        Without an account, nothing you type leaves your browser unless you send us a note through the
        feedback box. With an account, we store your email
        address, your name, and your email settings; your intake answers and gameplan; the notes you
        write; the dates you open VetPath while signed in (the date only, counted as totals); a record of
        which check-in emails we sent you; any feedback you send while signed in; the campaign tag
        on the link you first arrived from, or a partner office&apos;s random code if its link brought you;
        your separation month if you give it; and the date you first opened each free accredited-help
        link in your plan. Your password is handled by our sign-in provider and kept
        only as a scrambled hash that cannot be read back. The full list, including which questions are
        sensitive and optional, is on the <Link href="/privacy">privacy page</Link>.
      </Section>

      <Section icon="ti-shield-lock" title="Locked to you by the database itself">
        Our database has {TABLES} tables, and row-level security is switched on for all {TABLES}. That
        means the database, not just our website code, decides who can see each row:
        <ul style={{ margin: "10px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
          <li>Your profile, plan, notes, visit dates, and email history can only be read while signed in as you.</li>
          <li>Feedback notes can be dropped in by anyone, but no one can read them back through the site - only the founders, inside the database dashboard.</li>
          <li>Two internal tables - our settings and the partner-code list - have no public access at all.</li>
        </ul>
        <p style={{ margin: "10px 0 0" }}>
          The one exception is a calendar link you choose to create: anyone holding that private link sees
          your plan&apos;s phase dates, with no name or email, and it stops working when you delete your
          account. Our automated check also asks the database for every user table without signing in,
          about every 30 minutes, and confirms it gets nothing back.
        </p>
      </Section>

      <Section icon="ti-heart-handshake" title="Never sold, never shared with advertisers">
        We do not sell, rent, or trade your information, and we do not share it with advertisers. No VA
        office or other government agency can see your account. If a county or state veterans service
        office hands out VetPath, it sees only the counts-only partner report. If any of that ever
        changes, the privacy page will say so first.
      </Section>

      <Section icon="ti-chart-bar" title="Counting visits without tracking you">
        We count page views with GoatCounter, an open-source counter with no cookies, no personal
        identifiers, and nothing that links a visit to your account. It also counts a few named button
        presses, such as building a plan, as plain totals. If your browser sends a Do Not
        Track or Global Privacy Control signal, we do not count the visit at all. No advertising pixel is
        switched on: the slots for them in our code are empty, and if that ever changes, the privacy
        page will say so first.
      </Section>

      <Section icon="ti-settings" title="No AI">
        VetPath has no AI in it. Your plan, benefit matches, and career fits come from fixed rules we
        wrote, and every recommendation shows its reasons. No AI model reads your answers, and none is
        trained on them. The site is built on four code libraries - Next.js, React, React DOM, and
        Supabase&apos;s client - and none of them is an AI service.
      </Section>

      <Section id="delete" icon="ti-trash-x" title="Delete your account yourself">
        On your profile page, <strong>Delete my account</strong> removes your login and everything saved
        to it - plan, answers, notes, visit dates, email history, and any feedback you sent while signed
        in - from our database right away. It also clears VetPath&apos;s saved data from the browser you
        use to do it. No email to us, no reason needed.
        <p style={{ margin: "10px 0 0" }}>
          Four things it cannot reach: emails already delivered to your inbox; delivery records our email
          provider keeps for a limited time, and short-lived service logs at our hosting provider, which
          expire on their own schedule; the anonymous page counts (they were never tied to you); and a
          copy of your plan saved in another browser where you used VetPath. Sign out there, or clear
          that browser&apos;s site data, to remove it.
        </p>
      </Section>

      <Section icon="ti-map-pin" title="Where it lives">
        Your account and plan are stored by Supabase in Amazon Web Services&apos; West US (Oregon)
        region. Supabase encrypts stored data with AES-256 and data in transit with TLS, and reports
        that it is SOC 2 Type 2 compliant - see{" "}
        <a href="https://supabase.com/security" target="_blank" rel="noopener noreferrer">supabase.com/security</a>.
        The website is served by GitHub Pages over HTTPS. Emails come from vetpathusa.com through Resend,
        with SPF, DKIM, and DMARC set to reject mail that only pretends to be us.
      </Section>

      <Section icon="ti-heartbeat" title="Watched around the clock">
        About every 30 minutes, an automated check on GitHub loads our home page, the benefits library,
        the separation checklist, and the trust page, confirms the sign-in service is answering, and runs
        the database check above. If anything fails, we get an alert. Every run is logged in public on{" "}
        <a href="https://github.com/kalebaverell/kalebaverell.github.io/actions/workflows/uptime.yml" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </Section>

      <Section icon="ti-mail" title="Found a security problem?">
        Email <a href="mailto:kaleb@vetpathusa.com">kaleb@vetpathusa.com</a>. A person reads every report.
        Tell us what you found and how to see it, and please do not open or change anyone else&apos;s
        data to prove it.
      </Section>

      <div style={{ marginTop: 28 }}>
        <Callout kind="warn">
          <strong>What we have not done yet:</strong> VetPath has not had an independent security audit,
          and accounts do not offer two-step sign-in. Our database provider is audited; we are not. When
          either changes, this page will say so.
        </Callout>
      </div>

      <p style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn ghost" href="/privacy"><i className="ti ti-lock" aria-hidden="true" /> Privacy &amp; data</Link>
        <Link className="btn ghost" href="/trust"><i className="ti ti-shield-check" aria-hidden="true" /> Where our numbers come from</Link>
      </p>
    </Wrap>
  );
}
