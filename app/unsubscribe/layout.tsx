// Route title, description, and link-preview card. The page is a client
// component, so metadata lives here. noindex: an unsubscribe landing is a
// transactional page (like /reset/ and /feedback/), so it stays out of search
// and out of the sitemap.
import type { Metadata } from "next";
import { routeMeta } from "@/lib/metadata";

export const metadata: Metadata = {
  ...routeMeta("Email check-ins"),
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
