import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { RouteIllustration } from "@/components/illustrations/route-illustration";
import { VanIllustration } from "@/components/illustrations/van-illustration";
import { ScanTicker } from "@/components/scan-ticker";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { locations } from "@/lib/locations";
import { services } from "@/lib/services";
import { getSiteUrl, siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: getSiteUrl(),
          description: siteConfig.description,
          areaServed: siteConfig.cities.map((city) => ({ "@type": "City", name: city })),
        }}
      />

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
              {siteConfig.cities.join(" · ")}
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              We&apos;ll get it there today
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-muted">
              Send us the details and we&apos;ll follow up fast with a quote and a pickup time.
              Every shipment is scanned at pickup, at the depot, and at delivery.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" prefetch={false} className={buttonClasses("primary", "md")}>
                Book a pickup
              </Link>
              <Link href="/about" prefetch={false} className={buttonClasses("outline", "md")}>
                How it works
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <VanIllustration className="w-full max-w-sm" />
          </div>
        </div>

        <div className="mt-12">
          <ScanTicker />
        </div>
      </section>

      <section className="border-t border-line bg-bg-raised py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-2xl font-extrabold text-ink">What we run</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Four ways to move a shipment, depending on how much time you&apos;ve got.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {services.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <service.icon />
                  <CardTitle className="mt-3">{service.name}</CardTitle>
                  <CardDescription>{service.tagline}</CardDescription>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/services" className={buttonClasses("outline", "sm")}>
              Compare all services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-2xl font-extrabold text-ink">Where we run</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Pickups and deliveries across Kitchener, Waterloo and Cambridge.
          </p>
          <div className="mt-8 rounded-2xl border border-line bg-bg-raised p-6">
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
      </section>
    </>
  );
}
