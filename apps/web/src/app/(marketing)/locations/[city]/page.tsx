import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClasses } from "@/components/ui/button";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { getLocationBySlug, locations } from "@/lib/locations";
import { services } from "@/lib/services";
import { getSiteUrl, siteConfig } from "@/lib/site";

type Params = Promise<{ city: string }>;

export function generateStaticParams() {
  return locations.map((location) => ({ city: location.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city } = await params;
  const location = getLocationBySlug(city);
  if (!location) return {};
  return { title: location.name, description: location.metaDescription };
}

export default async function LocationDetailPage({ params }: { params: Params }) {
  const { city } = await params;
  const location = getLocationBySlug(city);
  if (!location) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
          { name: location.name, path: `/locations/${location.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Courier delivery",
          provider: { "@type": "Organization", name: siteConfig.name, url: getSiteUrl() },
          areaServed: { "@type": "City", name: location.name },
          description: location.metaDescription,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: location.faq.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
          })),
        }}
      />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }, { label: location.name }]} />

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Courier delivery in {location.name}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">{location.intro}</p>

      {location.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="mt-4 text-base leading-relaxed text-ink-muted">
          {paragraph}
        </p>
      ))}

      <h2 id="areas-we-cover" className="mt-10 text-xl font-extrabold text-ink">
        Areas we cover in {location.name}
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {location.industrialAreas.map((area) => (
          <li key={area} className="rounded-xl border border-line bg-bg-raised px-4 py-2.5 text-sm text-ink">
            {area}
          </li>
        ))}
      </ul>

      <h2 id="services" className="mt-10 text-xl font-extrabold text-ink">
        Services available in {location.name}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="flex items-center justify-between rounded-xl border border-line bg-bg px-4 py-3 text-sm font-medium text-ink hover:border-primary"
          >
            {service.name}
            <span aria-hidden="true" className="text-ink-muted">
              &rarr;
            </span>
          </Link>
        ))}
      </div>

      <h2 id="faq" className="mt-10 text-xl font-extrabold text-ink">
        {location.name} questions
      </h2>
      <div className="mt-4 space-y-6">
        {location.faq.map((entry) => (
          <div key={entry.question}>
            <h3 className="text-base font-semibold text-ink">{entry.question}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{entry.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/contact" className={buttonClasses("primary", "md")}>
          Book a pickup in {location.name}
        </Link>
      </div>
    </div>
  );
}
