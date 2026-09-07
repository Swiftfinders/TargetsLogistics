export const siteConfig = {
  name: "Target Logistics",
  slogan: "On target. On time. Every time.",
  tagline: "Same-day courier for Kitchener, Waterloo and Cambridge",
  description:
    "Target Logistics runs same-day, rush, overnight and scheduled courier service across Kitchener, Waterloo and Cambridge, with every shipment scanned at pickup, at the depot, and at delivery.",
  cities: ["Kitchener", "Waterloo", "Cambridge"] as const,
};

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const marketingNav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Locations", href: "/locations" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;
