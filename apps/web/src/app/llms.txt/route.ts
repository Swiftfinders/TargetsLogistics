import { locations } from "@/lib/locations";
import { services } from "@/lib/services";
import { getSiteUrl, siteConfig } from "@/lib/site";

export const revalidate = 3600;

export function GET() {
  const base = getSiteUrl();

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `Serves: ${siteConfig.cities.join(", ")} only.`,
    "",
    "## Services",
    ...services.map((service) => `- [${service.name}](${base}/services/${service.slug}): ${service.tagline}`),
    "",
    "## Locations",
    ...locations.map((location) => `- [${location.name}](${base}/locations/${location.slug}): ${location.metaDescription}`),
    "",
    "## Other pages",
    `- [About](${base}/about)`,
    `- [FAQ](${base}/faq)`,
    `- [Contact](${base}/contact)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
