import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClasses } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: `Same-day, rush, overnight and scheduled courier service across ${siteConfig.cities.join(", ")}. Compare all four tiers.`,
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services" }]} />

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Four ways to move a shipment
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
        Every tier below runs across Kitchener, Waterloo and Cambridge. The right one usually comes
        down to how much time you actually have, not how far it&apos;s going.
      </p>

      <div className="mt-10 overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Service</TableHeaderCell>
              <TableHeaderCell>Cutoff</TableHeaderCell>
              <TableHeaderCell>Delivery commitment</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.slug}>
                <TableCell>
                  <Link href={`/services/${service.slug}`} className="font-semibold text-ink hover:underline">
                    {service.name}
                  </Link>
                </TableCell>
                <TableCell>{service.cutoff}</TableCell>
                <TableCell>{service.transitCommitment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="rounded-2xl border border-line bg-bg-raised p-6 transition-colors hover:border-primary"
          >
            <service.icon />
            <p className="mt-3 font-display text-lg font-extrabold text-ink">{service.name}</p>
            <p className="mt-1 text-sm text-ink-muted">{service.tagline}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/contact" className={buttonClasses("primary", "md")}>
          Get a quote
        </Link>
      </div>
    </div>
  );
}
