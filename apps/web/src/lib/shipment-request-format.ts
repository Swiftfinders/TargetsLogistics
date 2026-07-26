export const SERVICE_TIER_LABELS: Record<string, string> = {
  SAME_DAY: "Same Day",
  RUSH: "Rush",
  OVERNIGHT: "Overnight",
  SCHEDULED: "Scheduled",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  ACKNOWLEDGED: "Acknowledged",
  CLOSED: "Closed",
};

export function formatNeededBy(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
