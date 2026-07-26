import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { RouteIllustration } from "@/components/illustrations/route-illustration";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { locations } from "@/lib/locations";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Locations",
  description: `Where we deliver: ${siteConfig.cities.join(", ")}. See coverage and local routes for each city.`,
};

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }])} />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Locations" }]} />

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Where we deliver
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
        Kitchener, Waterloo and Cambridge. That&apos;s the whole coverage area, on purpose, so a
        driver actually knows the block before they get there.
      </p>

      <div className="mt-10 rounded-2xl border border-line bg-bg-raised p-6">
        <RouteIllustration className="w-full" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {locations.map((location) => (
          <Link key={location.slug} href={`/locations/${location.slug}`}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardTitle>{location.name}</CardTitle>
              <CardDescription>{location.intro}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
