import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { siteConfig } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: `Book a pickup or ask a question. ${siteConfig.name} serves ${siteConfig.cities.join(", ")}.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Tell us what needs to move
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        Send us the details and we&apos;ll follow up with a quote and a pickup time.
        We cover Kitchener, Waterloo and Cambridge.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
