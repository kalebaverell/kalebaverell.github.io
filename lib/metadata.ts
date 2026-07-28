// Per-route metadata helper.
//
// Next merges metadata shallowly, so a route that sets `openGraph` to override
// just the title would drop the parent's image, url, and site name with it.
// This rebuilds the whole block from shared constants, keeping deep links
// accurate without duplicating the card definition in 21 layout files.
import type { Metadata } from "next";

export const SITE = "https://kalebaverell.github.io";

export const OG_IMAGE = {
  // Purpose-built 1200x630 card rendered from scripts/og-card.html over a
  // public-domain DVIDS photo. See public/img/CREDITS.md.
  url: "/og-card.jpg",
  width: 1200,
  height: 630,
  alt: "VetPath: leave with your gameplan. Benefits, career paths, and the next 90 days, built around your service and your goals.",
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
