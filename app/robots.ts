import type { MetadataRoute } from "next";
import { SITE } from "@/lib/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/reset/"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
