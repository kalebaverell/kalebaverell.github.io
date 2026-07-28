// Per-route metadata helper.
//
// Next merges metadata shallowly, so a route that sets `openGraph` to override
// just the title would drop the parent's image, url, and site name with it.
// This rebuilds the whole block from shared constants, keeping deep links
// accurate without duplicating the card definition in 21 layout files.
import type { Metadata } from "next";

export const SITE = "https://kalebaverell.github.io";

export const OG_IMAGE = {
  // Public-domain U.S. Army footage of mentors working through resumes at a
  // transition summit. See public/img/CREDITS.md.
  url: "/img/transition-summit-mentors.jpg",
  width: 1600,
  height: 1064,
  alt: "Volunteer mentors walking a soldier through her resume at a veterans transition summit",
};

const SHARED_DESCRIPTION =
  "Benefits, career paths, and the next 90 days, built around your service and your goals. Free for veterans, and every figure links to an official source.";

/**
 * Metadata for one route. The browser tab, the search snippet, and the link
 * preview all get the route's own name, so sharing a deep link says what the
 * page actually is instead of repeating the homepage title.
 */
export function routeMeta(name: string, description?: string): Metadata {
  const title = `${name} - VetPath`;
  const desc = description ?? SHARED_DESCRIPTION;
  return {
    title,
    description: desc,
    openGraph: {
      type: "website",
      siteName: "VetPath",
      locale: "en_US",
      title,
      description: desc,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [OG_IMAGE.url],
    },
  };
}
