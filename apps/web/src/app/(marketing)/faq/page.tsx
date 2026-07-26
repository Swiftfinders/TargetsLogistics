import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { generalFaq } from "@/lib/faq";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Common questions about booking, tracking and pricing with ${siteConfig.name}.`,
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: generalFaq.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
          })),
        }}
      />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Frequently asked questions
      </h1>

      <div className="mt-8 space-y-8">
        {generalFaq.map((entry) => (
          <div key={entry.question}>
            <h2 className="text-lg font-extrabold text-ink">{entry.question}</h2>
            <p className="mt-2 text-base leading-relaxed text-ink-muted">{entry.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
