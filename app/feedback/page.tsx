// Public feedback page - the mechanism behind "we want feedback from vets."
// Ungated on purpose: most of the veterans Frank and Wallace send will not have
// accounts, and the point is to lower the wall, not raise it.
import { routeMeta } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata = routeMeta(
  "Tell us what's off",
  "VetPath is built with veterans. Tell us what's confusing, wrong, or missing - every note is read by a person and shapes what gets built next."
);

export default function FeedbackPage() {
  return (
    <Wrap narrow>
      <Eyebrow>Built with veterans</Eyebrow>
      <h1 style={{ maxWidth: 620 }}>Tell us what&apos;s off.</h1>
      <p className="muted" style={{ maxWidth: 560 }}>
        VetPath only gets right what veterans point at. If something here is confusing, wrong,
        missing, or just rubbed you the wrong way, that is exactly what we want to hear - and
        the blunter the better.
      </p>
      <div style={{ marginTop: 20 }}>
        <FeedbackForm />
      </div>
      <p className="small muted" style={{ marginTop: 18, maxWidth: 560 }}>
        Notes are stored privately and never published. If you are signed in, your note is
        linked to your account so we can follow up; otherwise it is anonymous. Want a reply
        for sure? Email <a href="mailto:kaleb@vetpathusa.com">kaleb@vetpathusa.com</a>.
      </p>
    </Wrap>
  );
}
