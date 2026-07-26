import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClasses } from "@/components/ui/button";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { getServiceBySlug, services } from "@/lib/services";
import { getSiteUrl, siteConfig } from "@/lib/site";

type Params = Promise<{ service: string }>;

export function generateStaticParams() {
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  if (!service) return {};
  return {
    title: service.name,
    description: `${service.tagline} ${service.transitCommitment}. Serving ${siteConfig.cities.join(", ")}.`,
  };
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { service: serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: service.name,
          provider: { "@type": "Organization", name: siteConfig.name, url: getSiteUrl() },
          areaServed: siteConfig.cities.map((city) => ({ "@type": "City", name: city })),
          description: service.tagline,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: service.faq.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
          })),
        }}
      />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.name }]} />

      <p className="mt-4 font-mono text-xs uppercase tracking-wide text-ink-muted">{service.code}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{service.name}</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">{service.tagline}</p>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-bg-raised p-6 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-ink-muted">Cutoff</dt>
          <dd className="mt-1 text-sm font-medium text-ink">{service.cutoff}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-ink-muted">Delivery commitment</dt>
          <dd className="mt-1 text-sm font-medium text-ink">{service.transitCommitment}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-ink-muted">Coverage</dt>
          <dd className="mt-1 text-sm font-medium text-ink">{siteConfig.cities.join(", ")}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wide text-ink-muted">Rate</dt>
          <dd className="mt-1 text-sm font-medium text-ink">Quoted per shipment, contact us</dd>
        </div>
      </dl>

      <h2 id="when-to-use-it" className="mt-10 text-xl font-extrabold text-ink">
        When to use {service.name}
      </h2>
      {service.description.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="mt-4 text-base leading-relaxed text-ink-muted">
          {paragraph}
        </p>
      ))}

      <h2 id="best-for" className="mt-10 text-xl font-extrabold text-ink">
        Best for
      </h2>
      <ul className="mt-4 space-y-2 text-sm text-ink-muted">
        {service.bestFor.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="text-accent">
              &bull;
            </span>
            {item}
          </li>
        ))}
      </ul>

      <h2 id="faq" className="mt-10 text-xl font-extrabold text-ink">
        Questions about {service.name}
      </h2>
      <div className="mt-4 space-y-6">
        {service.faq.map((entry) => (
          <div key={entry.question}>
            <h3 className="text-base font-semibold text-ink">{entry.question}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{entry.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/contact" className={buttonClasses("primary", "md")}>
          Get a quote
        </Link>
        <Link href="/locations" className={buttonClasses("outline", "md")}>
          See where we deliver
        </Link>
      </div>
    </div>
  );
}
