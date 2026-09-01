// Server shell for the homepage (phone-performance pass). Its one job beyond
// rendering the client page: preload the first hero slide - it is the LCP
// element, but as a CSS background image the browser otherwise discovers it
// late and fetches it at low priority.
import { preload } from "react-dom";
import HomePage from "@/components/HomePage";

export default function Page() {
  preload("/img/transition-summit-mentors.jpg", { as: "image", fetchPriority: "high" });
  return <HomePage />;
}
