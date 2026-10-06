import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site";

/**
 * Target Logistics mark: a speeding blue delivery truck with an orange clock and
 * check mark. Fixed brand colours — a logo shouldn't shift hue with the theme.
 * The ring around each wheel is a cut-out in the original artwork, so it's drawn
 * in the surface colour (`gap`) rather than white, to read on dark backgrounds.
 */
export function LogoMark({
  className,
  gap = "var(--color-bg)",
  height,
}: {
  className?: string;
  gap?: string;
  /** Explicit pixel size, for renderers that ignore CSS (the OG image). */
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 750 405"
      {...(height ? { height, width: Math.round((height * 750) / 405) } : {})}
      role="img" aria-label={`${siteConfig.name} logo`}
      className={cn("h-10 w-auto", className)}
    >
      <path
        d="M42 134H92M120 134H230M72 190H240M24 245H72M120 245H240M38 300H260"
        fill="none"
        stroke="#2444b5"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path d="M200 105H578a12 12 0 0 1 12 12V340H190z" fill="#2444b5" />
      <path
        d="M600 158H660Q668 158 674 166L722 232Q728 240 728 250V340H600z"
        fill="#2444b5"
        stroke="#2444b5"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path d="M606 178H655L684 230H606z" fill="#ff7f11" stroke="#ff7f11" strokeWidth="10" strokeLinejoin="round" />
      {/* Wheels: blue tyre with a hub hole, ringed in the surface colour */}
      <path
        d="M228 350a44 44 0 1 0 88 0a44 44 0 1 0-88 0zM259 350a13 13 0 1 1 26 0a13 13 0 1 1-26 0zM590 350a44 44 0 1 0 88 0a44 44 0 1 0-88 0zM621 350a13 13 0 1 1 26 0a13 13 0 1 1-26 0z"
        fill="#2444b5"
        fillRule="evenodd"
        strokeWidth="10"
        style={{ stroke: gap }}
      />
      <circle cx="338" cy="168" r="129" fill="#fff" stroke="#ff7f11" strokeWidth="28" />
      <path d="M338 54V76M338 260V282M224 168H246M430 168H452" stroke="#ff7f11" strokeWidth="8" strokeLinecap="round" />
      <path d="M266 138L292 114L330 154L464 40L330 210z" fill="#ff7f11" stroke="#ff7f11" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, slogan = false }: { className?: string; slogan?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="inline-flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight text-ink">{siteConfig.name}</span>
        {slogan && <span className="mt-1 text-[11px] font-medium text-primary">{siteConfig.slogan}</span>}
      </span>
    </span>
  );
}
