import type { Metadata } from "next";
import Link from "next/link";
import { RouteIllustration } from "@/components/illustrations/route-illustration";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `How ${siteConfig.name} runs pickups and deliveries across ${siteConfig.cities.join(", ")}.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        A local courier, built around one route
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        {siteConfig.name} moves shipments between Kitchener, Waterloo and Cambridge. That&apos;s
        the whole area we cover, on purpose. Staying close to one route means a driver can be at
        your door faster, and it means someone here actually knows the streets, the loading docks,
        and the shortcuts between the three cities.
      </p>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        Booking a pickup takes a minute. Every shipment gets scanned at pickup, at the depot, and
        again at delivery, so you and your customer can both see exactly where it is without
        having to call and ask.
      </p>

      <div className="mt-10 rounded-2xl border border-line bg-bg-raised p-6">
        <RouteIllustration className="w-full" />
      </div>

      <h2 className="mt-12 text-xl font-extrabold text-ink">How a shipment moves</h2>
      <ol className="mt-4 space-y-4 text-sm text-ink-muted">
        <li>
          <span className="font-semibold text-ink">Book.</span> Tell us the pickup address, the
          drop-off address, and how soon it needs to move.
        </li>
        <li>
          <span className="font-semibold text-ink">Pick up.</span> A driver scans it at your door,
          so the clock starts from a real timestamp, not a guess.
        </li>
        <li>
          <span className="font-semibold text-ink">Deliver.</span> It&apos;s scanned again on arrival,
          with a signature or photo as proof.
        </li>
      </ol>

      <div className="mt-10">
        <Link href="/contact" prefetch={false} className={buttonClasses("primary", "md")}>
          Book a pickup
        </Link>
      </div>
    </div>
  );
}
