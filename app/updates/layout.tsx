// Route title only - pages in this segment are client components, so the tab
// title lives here. Description inherits from the root layout.
export const metadata = { title: "Life changes - VetPath" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
