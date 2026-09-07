import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { siteConfig } from "@/lib/site";
import { OrderForm } from "@/components/order-form";

export const metadata: Metadata = {
  title: "Book a delivery",
  description: `Book a courier pickup and get an instant estimate. ${siteConfig.name} serves ${siteConfig.cities.join(", ")}.`,
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Book a delivery" }]} />

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Book a delivery</h1>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        Tell us the pickup, delivery and shipment details for an instant estimate. Our dispatch team confirms timing and
        the final price after you submit. We cover Kitchener, Waterloo and Cambridge.
      </p>

      <div className="mt-10">
        <OrderForm mode="public" />
      </div>
    </div>
  );
}
