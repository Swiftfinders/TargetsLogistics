import type { ComponentType } from "react";
import { OvernightIcon, RushIcon, SameDayIcon, ScheduledIcon } from "@/components/illustrations/service-icons";

export interface ServiceFaqEntry {
  question: string;
  answer: string;
}

export interface ServiceRecord {
  slug: string;
  code: string;
  name: string;
  icon: ComponentType;
  tagline: string;
  cutoff: string;
  transitCommitment: string;
  description: string[];
  bestFor: string[];
  faq: ServiceFaqEntry[];
}

// Placeholder tier list — see CLAUDE.md and docs/DECISIONS.md. Replace with the
// real service catalog before this route tree is treated as final SEO content.
export const services: ServiceRecord[] = [
  {
    slug: "same-day",
    code: "SVC-01",
    name: "Same Day",
    icon: SameDayIcon,
    tagline: "Pickup and delivery inside one business day.",
    cutoff: "Book by 1:00 PM for same-day pickup",
    transitCommitment: "Delivered by end of business day",
    description: [
      "Same Day is the default when something needs to move today but doesn't need to beat the clock to get there. A driver picks it up, scans it, and works it into the day's route across Kitchener, Waterloo and Cambridge.",
      "It's the tier most businesses reach for when a supplier is out of stock, a signed document has to reach a client's desk, or a part needs to get from one job site to another before the crew packs up.",
    ],
    bestFor: [
      "Documents that need a signature the same afternoon",
      "Parts or supplies between job sites",
      "Anything that can wait a few hours but not until tomorrow",
    ],
    faq: [
      {
        question: "What time do I need to book Same Day by?",
        answer:
          "Book by 1:00 PM for pickup and delivery the same business day. Requests after that are moved to the next available slot, usually first thing the next morning.",
      },
      {
        question: "Does Same Day cover all three cities?",
        answer: "Yes. Same Day runs between Kitchener, Waterloo and Cambridge, including pickups and drop-offs that cross city lines.",
      },
    ],
  },
  {
    slug: "rush",
    code: "SVC-02",
    name: "Rush",
    icon: RushIcon,
    tagline: "For when the clock is the whole problem.",
    cutoff: "Dispatched within the hour",
    transitCommitment: "Direct run, no route stops",
    description: [
      "Rush skips the route. A driver is dispatched directly to the pickup address and drives straight to the drop-off, no stops in between, no waiting for a route to swing by.",
      "It costs more than Same Day for exactly that reason: a dedicated driver, a direct line between two addresses, and a delivery window measured in an hour or two rather than a business day.",
    ],
    bestFor: [
      "A machine down on the shop floor waiting on one part",
      "A closing document that has to be at the lawyer's office before a specific meeting",
      "Anything where \"later today\" isn't good enough",
    ],
    faq: [
      {
        question: "How is Rush different from Same Day?",
        answer:
          "Same Day fits your shipment into a driver's route across the day. Rush sends a driver straight from pickup to drop-off with no other stops, so it's faster but priced higher.",
      },
      {
        question: "How fast is Rush, exactly?",
        answer:
          "A driver is dispatched within the hour of booking. Actual delivery time depends on distance within Kitchener, Waterloo and Cambridge, but it's typically well under two hours door to door.",
      },
    ],
  },
  {
    slug: "overnight",
    code: "SVC-03",
    name: "Overnight",
    icon: OvernightIcon,
    tagline: "Ready for pickup first thing the next morning.",
    cutoff: "Book anytime today for tomorrow morning",
    transitCommitment: "Delivered before 9:00 AM the next business day",
    description: [
      "Overnight is for shipments that don't need to move tonight, just need to be there before the workday starts tomorrow. Book it any time today and it's picked up that evening or first thing the next morning, then delivered before 9:00 AM.",
      "It's the cheaper option when the deadline is \"tomorrow morning\" rather than \"today,\" without paying for speed you don't actually need.",
    ],
    bestFor: [
      "Paperwork due at the start of the business day",
      "Restocking a site before a crew arrives",
      "Anything booked after Same Day's cutoff that can wait until morning",
    ],
    faq: [
      {
        question: "What time will it arrive?",
        answer: "Before 9:00 AM the next business day, at the destination address in Kitchener, Waterloo or Cambridge.",
      },
      {
        question: "Can I book Overnight after hours?",
        answer: "Yes. Overnight requests can be placed any time today for delivery the next morning.",
      },
    ],
  },
  {
    slug: "scheduled",
    code: "SVC-04",
    name: "Scheduled",
    icon: ScheduledIcon,
    tagline: "Recurring runs on a schedule you set.",
    cutoff: "Set up once, runs on your schedule",
    transitCommitment: "Same time, same route, every time",
    description: [
      "Scheduled is for shipments that repeat: a daily bank run, a weekly parts transfer between two locations, an interoffice document run every morning. Set the route and the cadence once, and it runs without rebooking each time.",
      "Because the route and timing are fixed in advance, it's usually the most cost-effective way to move something that needs to happen regularly rather than once.",
    ],
    bestFor: [
      "Daily or weekly runs between two fixed addresses",
      "Interoffice mail and document transfers",
      "Recurring supply drops between a warehouse and a storefront",
    ],
    faq: [
      {
        question: "Can I change a scheduled run later?",
        answer: "Yes. Contact us to adjust the timing, route or frequency of an existing scheduled run at any time.",
      },
      {
        question: "Is Scheduled cheaper than booking Same Day repeatedly?",
        answer:
          "Usually, since the route and timing are fixed in advance rather than dispatched fresh each time. Ask for a quote comparing both against your actual frequency.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceRecord | undefined {
  return services.find((service) => service.slug === slug);
}
