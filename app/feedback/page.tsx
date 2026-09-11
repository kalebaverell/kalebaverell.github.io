// Public feedback page - the mechanism behind "we want feedback from vets."
// Ungated on purpose: most of the veterans Frank and Wallace send will not have
// accounts, and the point is to lower the wall, not raise it.
import { routeMeta } from "@/lib/metadata";
import { Wrap, Eyebrow } from "@/components/ui";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata = routeMeta(
  "Tell us what you need",
  "VetPath is built with veterans. Tell us what would help, what is missing, or what is plain wrong - every note is read by a person and shapes what gets built next."
);

export default function FeedbackPage() {
  return (
    <Wrap narrow>
      <Eyebrow>Built with veterans</Eyebrow>
      <h1 style={{ maxWidth: 620 }}>Tell us what you need.</h1>
      <p className="muted" style={{ maxWidth: 560 }}>
        VetPath only gets right what veterans point at. Tell us what would actually help you -
        something this site should cover and does not, a step that did not fit your situation,
        or anything here that is confusing or plain wrong. Suggestions and complaints are both
        welcome, and the blunter the better.
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
