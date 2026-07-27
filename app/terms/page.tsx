import Link from "next/link";
import { Wrap, Eyebrow, Callout } from "@/components/ui";

// Update when the substance of these terms changes, not for typo fixes.
const LAST_UPDATED = "July 27, 2026";

export const metadata = {
  title: "Terms of use - VetPath",
  description:
    "What VetPath is, what it is not, and the rules for using it. Written in plain language for the pilot.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <div className="muted" style={{ lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Wrap narrow>
      <Eyebrow>Terms of use</Eyebrow>
      <h1 style={{ marginTop: 0 }}>The rules, in plain language</h1>
      <p className="muted" style={{ fontSize: "calc(var(--fs-body) + 1px)", lineHeight: 1.7 }}>
        Most terms of use are written so nobody reads them. These are written so you can. Using VetPath
        means you accept what is on this page. If something here does not sit right with you, please do
        not use the site, and tell us why.
      </p>
      <p className="small muted" style={{ marginTop: 6 }}>Last updated {LAST_UPDATED}.</p>

      {/* The single most important thing on the page. */}
      <div className="card" style={{ marginTop: 22, borderColor: "var(--accent)", borderWidth: 2 }}>
        <h3 style={{ marginTop: 0 }}>
          <i className="ti ti-alert-triangle" style={{ color: "var(--accent-ink)" }} aria-hidden="true" /> What VetPath is not
        </h3>
        <p style={{ margin: "6px 0 0" }}>
          VetPath is a planning and education tool. It is <strong>not</strong> the Department of Veterans
          Affairs or any government agency. It is <strong>not</strong> a law firm, an accredited claims
          representative, a Veterans Service Organization, a financial or insurance advisor, a medical
          provider, or a military recruiter.
        </p>
        <p style={{ margin: "10px 0 0" }}>
          We do not file anything on your behalf, we do not represent you, and we never decide whether you
          are eligible for a benefit. Only the VA, your state agency, your school, or an accredited
          representative can do that.
        </p>
      </div>

      <Section title="What the site actually does">
        You answer questions about your situation and goals. Fixed rules that we wrote turn those answers
        into a suggested path, a list of benefit categories worth looking into, and a 30, 60, and 90 day
        action plan. There is no artificial intelligence deciding your future here: the same answers
        always produce the same plan, which is why we can explain every step of it.
        <p style={{ margin: "10px 0 0" }}>
          Think of the output as a well-researched starting point for a conversation with someone who can
          actually act on it, not as a decision that has been made for you.
        </p>
      </Section>

      <Section title="About the information we show you">
        We work hard on accuracy. Federal benefit content is checked against official sources and carries
        the date it was verified. Career pay and outlook figures come from the Bureau of Labor Statistics
        and O*NET and are labeled with their source. State program details are cited to that state&apos;s
        statute or agency.
        <p style={{ margin: "10px 0 0" }}>
          Even so, please treat all of it as informational rather than authoritative. Programs change,
          legislatures cut funding mid-year, eligibility rules get rewritten, and a page that was correct
          when we checked it can be out of date by the time you read it. <strong>Always confirm the
          details at the official source we link before you make a decision, sign anything, or turn down
          another option.</strong>
        </p>
        <p style={{ margin: "10px 0 0" }}>
          Fit percentages, pay ranges, and cost comparisons are estimates meant to help you compare
          choices. They are not predictions, promises, or guarantees of any outcome, income, or award.
        </p>
      </Section>

      <Section title="This is not professional advice">
        Nothing on VetPath is legal, medical, financial, tax, or insurance advice, and using the site does
        not create any professional relationship between us. Decisions about a disability claim, a
        mortgage, an insurance policy, a school, or a job carry real consequences, and they deserve a
        qualified professional who knows your full situation. Where we can, we point you to free
        accredited help.
      </Section>

      <Section title="Your account">
        You need a free account to build and save a gameplan. When you create one, please give accurate
        information, keep your password to yourself, and let us know if you think someone else has gotten
        into your account. You are responsible for what happens under your login.
        <p style={{ margin: "10px 0 0" }}>
          You must be at least 13 to have an account. You can close it at any time, and{" "}
          <Link href="/privacy">our privacy page</Link> explains how to have your data deleted.
        </p>
      </Section>

      <Section title="Your information stays yours">
        The answers, notes, and resume text you enter belong to you. We do not claim ownership of them, we
        do not sell them, and we do not use them to train any AI model. We use them for one thing: running
        the tools for you and saving your plan so it comes back when you sign in. The{" "}
        <Link href="/privacy">privacy page</Link> lists exactly what is stored and who else can see it.
      </Section>

      <Section title="Using the site fairly">
        Please do not use VetPath to break the law, to harass anyone, to scrape or bulk-copy the content,
        to attempt to reach another user&apos;s account or data, or to interfere with how the site runs. Do
        not present our content as your own or resell it. The site&apos;s design, code, and written content
        belong to us, though the underlying government information we cite is public and you are welcome
        to go read it at the source.
      </Section>

      <Section title="Links to other sites">
        We link to VA.gov, state agencies, schools, and other organizations so you can verify things and
        take action. We do not control those sites and are not responsible for their content or their
        privacy practices. A link is a pointer to the authoritative source, not an endorsement.
      </Section>

      <Section title="This is a pilot">
        VetPath is being tested with a small group. Features will change, break, and occasionally
        disappear. The site is provided as is, without warranties of any kind, and we cannot promise it
        will always be available, error free, or complete.
        <p style={{ margin: "10px 0 0" }}>
          To the fullest extent the law allows, we are not liable for losses arising from your use of the
          site or from decisions you make based on what you read here. That is exactly why we ask you to
          confirm everything at the official source first.
        </p>
      </Section>

      <Section title="If we ever earn money from a referral">
        We do not currently take any payment for connecting you with a lender, a real estate agent, an
        insurance agent, or anyone else. If that ever changes, we will say so plainly on the page where it
        happens, we will always show you more than one option, and payment will never change what we
        recommend or the order we show it in. We would rather lose the fee than lose your trust.
      </Section>

      <Section title="Changes to these terms">
        If we change something meaningful here, we will update the date at the top. These are plain
        language pilot terms and will be reviewed by counsel, and replaced with formal terms including
        the governing law, before any wider public launch.
      </Section>

      <Section title="If you are in crisis">
        VetPath cannot provide emergency help, and nothing you type here is monitored by a person in real
        time. If you are in crisis, call or text <strong>988 and press 1</strong> for the Veterans Crisis
        Line. It is free, confidential, and staffed 24 hours a day.
      </Section>

      <Section title="Questions">
        Reach the VetPath team at the address you were invited from. If something here is unclear or feels
        unfair, we would genuinely like to know.
      </Section>

      <div style={{ marginTop: 22 }}>
        <Callout kind="info">
          <i className="ti ti-shield-check" aria-hidden="true" />
          <span>
            See also <Link href="/privacy">Privacy &amp; data</Link> for what we store, and{" "}
            <Link href="/trust">How we earn trust</Link> for where every number on the site comes from.
          </span>
        </Callout>
      </div>

      <p style={{ marginTop: 28 }}>
        <Link className="btn ghost" href="/"><i className="ti ti-arrow-left" aria-hidden="true" /> Back to VetPath</Link>
      </p>
    </Wrap>
  );
}
