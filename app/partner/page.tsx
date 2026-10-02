// Partner report. Not linked from anywhere on the site, not in the sitemap,
// disallowed in robots.txt, and noindex - it opens only from the private link
// each partner office holds. Everything it can show is a count, and any count
// from 1 to 4 is suppressed by the database itself; see components/PartnerBoard.tsx.
import type { Metadata } from "next";
import { Wrap, Eyebrow } from "@/components/ui";
import PartnerBoard from "@/components/PartnerBoard";
import { routeMeta } from "@/lib/metadata";

export const metadata: Metadata = {
  ...routeMeta("Partner report", "A counts-only report for an office that hands out VetPath."),
  robots: { index: false, follow: false, nocache: true },
};

export default function PartnerPage() {
  return (
    <Wrap narrow>
      <Eyebrow>Partner report</Eyebrow>
      <h1 style={{ maxWidth: 620 }}>What happened after the hand-off.</h1>
      <p className="muted" style={{ maxWidth: 560 }}>
        Read from the database each time you open this page, and counted only for veterans who
        first arrived through your office&apos;s link or QR code. You see totals, never a list of
        people.
      </p>
      <div style={{ marginTop: 26 }}>
        <PartnerBoard />
      </div>
    </Wrap>
  );
}
