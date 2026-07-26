export const siteConfig = {
  name: "Targets Logistics",
  tagline: "Same-day courier for Kitchener, Waterloo and Cambridge",
  description:
    "Targets Logistics books, tracks, and delivers same-day shipments across Kitchener, Waterloo and Cambridge, with a live tracking link on every run.",
  cities: ["Kitchener", "Waterloo", "Cambridge"] as const,
};

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const marketingNav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
