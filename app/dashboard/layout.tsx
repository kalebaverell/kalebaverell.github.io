// Route title, description, and link-preview card. Pages in this segment are
// client components, so metadata lives here.
import { routeMeta } from "@/lib/metadata";

export const metadata = routeMeta("Your gameplan");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
