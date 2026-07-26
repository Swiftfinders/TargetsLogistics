export interface FaqEntry {
  question: string;
  answer: string;
}

export const generalFaq: FaqEntry[] = [
  {
    question: "What cities do you deliver to?",
    answer:
      "We serve Kitchener, Waterloo and Cambridge only. If an address falls outside those three cities, we don't cover it yet.",
  },
  {
    question: "How do I track a shipment?",
    answer:
      "Every shipment is scanned at pickup, at the depot, and at delivery. A tracking link is on its way as part of a future update; for now, contact us directly for a status update on an active shipment.",
  },
  {
    question: "Do I need an account to book a pickup?",
    answer:
      "Not yet. For now, send us the details through the contact form and we'll follow up with a quote and a pickup time. A self-serve booking portal is planned for a later release.",
  },
  {
    question: "How is pricing worked out?",
    answer:
      "We quote based on distance, service tier and what's being moved. There's no published rate card yet, so every job gets a quote before you book, not an estimate you have to double-check.",
  },
  {
    question: "What's the difference between Same Day and Rush?",
    answer:
      "Same Day fits your shipment into a driver's route across the day and is delivered by end of business. Rush sends a driver directly from pickup to drop-off with no other stops, so it's faster but costs more.",
  },
  {
    question: "Can I set up a recurring pickup?",
    answer:
      "Yes, that's what Scheduled is for: a fixed route and cadence, set up once, that runs without rebooking each time. Contact us to set one up.",
  },
];
