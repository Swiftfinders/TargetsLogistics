function IconFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="size-9">
      {children}
    </svg>
  );
}

export function SameDayIcon() {
  return (
    <IconFrame>
      <rect x="6" y="6" width="28" height="28" rx="7" className="fill-primary" />
      <path d="M14 20l4 4 8-8" className="stroke-bg" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </IconFrame>
  );
}

export function RushIcon() {
  return (
    <IconFrame>
      <circle cx="20" cy="20" r="14" className="fill-accent" />
      <path d="M20 12v9l6 4" className="stroke-bg" strokeWidth="3" fill="none" strokeLinecap="round" />
    </IconFrame>
  );
}

export function OvernightIcon() {
  return (
    <IconFrame>
      <rect x="7" y="12" width="26" height="18" rx="4" className="fill-confirm" />
      <rect x="14" y="6" width="12" height="10" rx="2" className="fill-confirm" />
    </IconFrame>
  );
}

export function ScheduledIcon() {
  return (
    <IconFrame>
      <rect x="6" y="8" width="28" height="26" rx="5" className="fill-ink" />
      <rect x="6" y="8" width="28" height="8" rx="5" className="fill-primary" />
      <circle cx="14" cy="24" r="2.5" className="fill-bg" />
      <circle cx="20" cy="24" r="2.5" className="fill-bg" />
      <circle cx="26" cy="24" r="2.5" className="fill-bg" />
    </IconFrame>
  );
}
