// Founder traction board. Not linked from anywhere on the site, not in the
// sitemap, disallowed in robots.txt, and noindex - it opens only from the
// private link Frank and Terianne hold. Everything it can show is a count;
// see components/StatsBoard.tsx for why that is structural, not a promise.
import { Wrap, Eyebrow } from "@/components/ui";
import StatsBoard from "@/components/StatsBoard";

export const metadata = {
  title: "Traction - VetPath",
  robots: { index: false, follow: false, nocache: true },
};

export default function StatsPage() {
  return (
    <Wrap narrow>
      <Eyebrow>Founders only</Eyebrow>
      <h1 style={{ maxWidth: 620 }}>Where VetPath stands.</h1>
      <p className="muted" style={{ maxWidth: 560 }}>
        Live from the database, every time you open this page. These are the same numbers
        Kaleb sees, with one difference: this page can count veterans but can never look at
        one.
      </p>
      <div style={{ marginTop: 26 }}>
        <StatsBoard />
      </div>
    </Wrap>
  );
}
