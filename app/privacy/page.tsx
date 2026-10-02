import Link from "next/link";
import { Wrap, Eyebrow, Callout } from "@/components/ui";

// Update when the substance of this page changes, not for typo fixes.
const LAST_UPDATED = "October 2, 2026";

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
          <li>We do not sell your data, and we do not share it with advertisers.</li>
          <li>Offices that hand out VetPath links see counts only, like how many accounts came through their link - never your name, email, answers, or plan.</li>
          <li>No trackers and no advertising pixels. The only measurement is an anonymous page counter that cannot identify you - explained below.</li>
          <li>The guides and crisis resources need no account. The planning tools open once you build a free gameplan, which needs an account.</li>
          <li>Your password is never seen or stored by us.</li>
          <li>You can delete your account and everything in it yourself, in one step, from your profile page.</li>
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
        The guides, the crisis resources, and the trust and privacy pages are open to everyone, no sign-up needed.
        The planning tools, including the benefits library, compare states, the relocation planner, the
        Reserves and Guard tab, and the resume scanner, open once you build a free gameplan. Some of what you
        type in those tools stays only in your own browser&apos;s local storage on that device; what saves to
        your account is listed in the next section.
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
          <li>Your separation month, if you give it. It is optional, and it is used only to put real dates on your timeline, on your calendar feed if you subscribe, and in the check-in emails if you opted in to them. Its one other use: if you are on active duty and left the question about how far out separation is blank, it fills in that answer.</li>
          <li>Your VA disability rating, if you tell us.</li>
          <li>Your employment and housing situation, including if you indicate housing is unstable.</li>
          <li>Sex and race or ethnicity, if you choose to answer. Both questions are optional.</li>
          <li>Your goals, priorities, pay target, and the free-text notes you write at each step.</li>
          <li>Your generated gameplan and which steps you have checked off.</li>
          <li>Your Pathfinder answers and, if you use the resume scanner, the resume text you paste in.</li>
          <li>The notes you add to your plan from your profile or a task, up to 4,000 characters each.</li>
          <li>
            The dates you open VetPath while signed in - just the date, not the time or the pages you
            looked at. We only ever count these as totals, to learn whether people come back.
          </li>
          <li>If you get check-in emails, a record of which ones we sent and when, so no one gets the same email twice.</li>
          <li>Display settings like your theme and text size.</li>
          <li>
            If you use the feedback box, the note you write and the page you sent it from. If you
            used a &quot;Report an error&quot; link, the note also names the item you were
            reporting, shown to you above the box before you send. Notes are linked to your
            account when you are signed in, anonymous when you are not, read by the founders,
            and never published.
          </li>
          <li>
            If you first arrived from one of our flyers, QR codes, or shared links, the campaign tag
            on that link (for example &quot;vso&quot; for the sheet we hand to veteran service posts),
            plus the site that referred you. If you arrived through an app&apos;s built-in browser
            (like Facebook&apos;s) that hides the referring site, we note just the app&apos;s name as
            the channel instead. If the link came from a partner office, such as a county veterans
            service office or a transition counselor, it also carries a short random partner code,
            and we note when you first used it. This tells us which outreach actually reaches veterans.
            It records how you found us - never what you did on other sites.
          </li>
          <li>
            If you open one of the free accredited-help links in your plan (the VA&apos;s
            representative search, a county veterans service office, or a veterans service
            organization&apos;s service officers), a yes and the date you first did. Nothing about
            who you contacted or what you did on those sites.
          </li>
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
            <strong>Supabase</strong> hosts our database and handles sign-in. Your saved plan and your
            login live there, in Amazon Web Services&apos; West US (Oregon) region.
          </li>
          <li>
            <strong>Resend</strong> delivers our emails: account emails like password resets, and check-in
            emails if you have them on. It receives your email address, your first name, and the email
            itself, which can mention your transition phase and how many steps you have checked off -
            nothing else from your plan.
          </li>
          <li>
            <strong>GitHub Pages</strong> serves the website itself. Like any web host, its servers log the
            IP addresses that request pages.
          </li>
          <li>
            <strong>GoatCounter</strong> counts page views anonymously so we can tell which pages actually
            help. No cookies, no personal identifiers - it cannot tell who you are, and neither can we.
            Explained plainly below.
          </li>
        </ul>
        <p style={{ margin: "10px 0 0" }}>
          Fonts and icons are served from this site directly, not from a font network, so no additional
          service learns that you visited.
        </p>
        <p style={{ margin: "10px 0 0" }}>
          Nobody else. No data brokers, no advertising networks, no lead buyers.
        </p>
      </Section>

      <Section title="Partner offices and the counts they see">
        Some veterans service offices and transition counselors hand out VetPath links and QR codes
        that carry a partner code: six random characters, like &quot;k7m3qx&quot;, that do not name
        the office. If your first visit came through one of those links, the code is saved with how
        you found us, as described above.
        <p style={{ margin: "10px 0 0" }}>
          Each partner office gets a private report with counts only: how many accounts came through
          its code, and how many of those built a plan, checked off a step, gave a separation date,
          reached the pre-discharge claim window, opened a free accredited-help link, or said yes to
          email check-ins, plus the total number of steps checked off once at least five people have
          checked one. Any count from 1 to 4 shows as &quot;&lt;5&quot;, so small groups are harder to
          single out. Partners see totals, never a list of people. The report has no way to show a name, an
          email address, an answer, or a plan, and partners never get access to our database.
        </p>
        <p style={{ margin: "10px 0 0" }}>
          A partner code changes nothing about your plan. The plan is the same, and free, with or
          without one.
        </p>
      </Section>

      <Section title="What we do not do today">
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
          <li>We do not sell, rent, or trade your information.</li>
          <li>We do not run advertising scripts, tracking pixels, or cross-site tracking of any kind. The only measurement on this site is the anonymous page counter described in the next section.</li>
          <li>We do not use your answers to train any AI model. Your plan is produced by fixed rules we wrote, not by a language model.</li>
          <li>We do not share anything about you with the VA or any government agency, and they do not see your account. If a county or state veterans service office hands out VetPath, it sees only the counts-only partner report described above.</li>
        </ul>
        <p style={{ margin: "10px 0 0" }}>
          Down the road, VetPath may offer sponsored connections - for example, an introduction to a
          lender or real estate agent who knows VA loans, where a partner pays us for the introduction.
          If and when that launches, it will be clearly labeled as sponsored, it will only ever happen
          when you ask for the connection, and this page will be updated first.
        </p>
      </Section>

      <Section title="The anonymous page counter, in plain terms">
        We use GoatCounter, an open-source counter built for exactly one job: telling us how many times
        each page was viewed. Here is everything it records about a visit: which page, which site linked
        to it (or the campaign tag on the link, if it had one), the browser family, the screen size, and
        the country. It also counts a few named button presses, such as building a plan or opening a
        free accredited-help link, as plain totals. Here is what it does not have: no
        cookies, no fingerprinting, no names, no emails, no link to your account, and no way to recognize
        you if you come back tomorrow.
        <p style={{ margin: "10px 0 0" }}>
          If we ever add advertising measurement, you will be able to switch it off for your device on
          the <Link href="/do-not-sell">do not sell or share my information</Link> page, which works today
          and needs no account. We cannot look anyone up in the counter, and neither can anyone else -
          there is nothing personal in it to look up. It never sees what you type, your answers, or your plan; those follow the rules in the
          sections above. If your browser sends a Do Not Track or Global Privacy Control signal, we do not
          count the visit at all. GoatCounter publishes its own privacy policy at{" "}
          <a href="https://www.goatcounter.com/help/privacy" target="_blank" rel="noopener noreferrer">goatcounter.com/help/privacy</a>.
        </p>
      </Section>

      <Section title="How it's protected">
        Your saved plan lives in a managed Postgres database, encrypted at rest, and everything travels
        over an encrypted connection. Access is governed by <strong>row-level security</strong>, which
        means the database itself enforces that your row can only be read or changed while signed in as
        you. Another signed-in user cannot query your data even if they try. The one exception is a
        calendar link you choose to create: anyone holding it sees your phase dates, with no name or
        email. Our own server code touches rows only to send the emails you opted into, to carry out an
        unsubscribe or account deletion you ask for, and to compute counts-only reports.
        <p style={{ margin: "10px 0 0" }}>
          Every safeguard, and what we have not done yet, is listed on our <Link href="/security">security page</Link>.
        </p>
      </Section>

      <Section title="Email">
        We send the emails needed to run your account, such as resetting your password. Check-in emails,
        product updates, and the newsletter only go to people who ticked the box when signing up (or who
        turn check-ins on from their profile), and every one of those has an unsubscribe link.
        Unsubscribing never affects your account or your saved plan. Our emails are delivered by Resend.
      </Section>

      <Section title="Seeing, exporting, or deleting your data">
        Your plan is visible to you in the app at any time, and the print view gives you a copy you can
        keep or hand to someone helping you.
        <p style={{ margin: "10px 0 0" }}>
          To delete your account entirely, open your profile and choose <strong>Delete my account</strong>.
          It removes your login and everything saved to it - plan, answers, notes, visit dates, email
          history, and feedback you sent while signed in - right away. We do not ask for a reason. If you
          would rather we do it, email us and we will. Delivery records our email provider keeps for a
          limited time, and short-lived service logs at our hosting provider, expire on their own
          schedule. <Link href="/security/#delete">What deletion covers</Link>.
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
        Email <a href="mailto:kaleb@vetpathusa.com">kaleb@vetpathusa.com</a> and a person will answer. That
        is also where to send a deletion request or report a security problem.
      </Section>

      <p style={{ marginTop: 30 }}>
        <Link className="btn ghost" href="/"><i className="ti ti-arrow-left" aria-hidden="true" /> Back to VetPath</Link>
      </p>
    </Wrap>
  );
}
