interface ScanEvent {
  time: string;
  event: string;
  zone: string;
  state: "confirmed" | "pending";
}

const EXAMPLE_EVENTS: ScanEvent[] = [
  { time: "14:32", event: "Picked up, downtown Kitchener", zone: "ZONE K-1", state: "confirmed" },
  { time: "14:47", event: "Arrived, Kitchener depot", zone: "ZONE K-1", state: "confirmed" },
  { time: "15:05", event: "Out for delivery, Waterloo", zone: "ZONE W-2", state: "pending" },
];

/** Illustrative sample timeline for the marketing site. Real tracking ships in Phase 6. */
export function ScanTicker() {
  return (
    <div className="rounded-2xl border border-line bg-ink p-1">
      <p className="px-4 pb-1 pt-3 font-mono text-[0.7rem] uppercase tracking-wide text-bg/50">
        Example tracking timeline
      </p>
      <div className="divide-y divide-bg/10 px-4 pb-3 font-mono text-sm text-bg">
        {EXAMPLE_EVENTS.map((row, index) => (
          <div key={row.event} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-2 sm:grid-cols-[3.5rem_1fr_6rem_6rem]">
            <span className="tabular-nums text-bg/90">
              <span className={index === 0 ? "inline-block animate-[flap-cycle_4s_ease-in-out_infinite]" : undefined}>
                {row.time}
              </span>
            </span>
            <span className="truncate">{row.event}</span>
            <span className="hidden text-bg/50 sm:inline">{row.zone}</span>
            <span
              className={
                "justify-self-end rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide " +
                (row.state === "confirmed" ? "border-confirm text-confirm" : "border-accent text-accent")
              }
            >
              {row.state === "confirmed" ? "Confirmed" : "In transit"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
