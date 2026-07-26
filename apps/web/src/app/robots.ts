import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Explicitly allowing AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
// OAI-SearchBot, Google-Extended) is a business choice to make this site
// citable by AI answer engines and assistants. Remove these rules if that's
// not something you want — see docs/DECISIONS.md.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/portal", "/staff"] },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
