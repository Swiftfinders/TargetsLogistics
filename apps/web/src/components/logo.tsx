import { cn } from "@/lib/cn";

/**
 * Badge mark: a target reticle, literally "Targets." Kept to a ring and a
 * dot on purpose — an earlier version added a line through the ring for
 * "Logistics" motion, but at favicon size that read as a no-entry sign, not
 * an arrow. Bold and legible beats clever and ambiguous.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" role="img" aria-label="Targets Logistics" className={cn("size-8", className)}>
      <rect x="1" y="1" width="38" height="38" rx="10" className="fill-primary" />
      <circle cx="20" cy="20" r="10" fill="none" className="stroke-bg" strokeWidth="3" />
      <circle cx="20" cy="20" r="3.5" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-lg font-extrabold tracking-tight text-ink">Targets Logistics</span>
    </span>
  );
}
