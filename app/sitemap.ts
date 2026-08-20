import type { MetadataRoute } from "next";
import { SITE } from "@/lib/metadata";

// Static-export sitemap for Search Console. Public, funnel-open pages rank
// highest; gated tool pages are listed too - they render marketing-grade
// content server-side and the gate is client-side, so crawlers see them.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  });
  return [
    at("/", 1),
    at("/trust/", 0.8),
    at("/onboarding/", 0.8),
    at("/housing/", 0.7),
    at("/benefits/", 0.7),
    at("/pathfinder/", 0.7),
    at("/relocate/", 0.6),
    at("/compare/", 0.6),
    at("/timeline/", 0.6),
    at("/family/", 0.5),
    at("/reserves/", 0.5),
    at("/support/", 0.5),
    at("/privacy/", 0.4),
    at("/terms/", 0.3),
    at("/do-not-sell/", 0.3),
  ];
}
