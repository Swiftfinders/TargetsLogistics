import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site";

/**
 * Target Logistics mark: a navy target disc with a gold ring and a bold two-tone
 * "T" (purple stem, gold crossbar). Fixed brand colours — a logo shouldn't shift
 * hue with the theme — chosen to read on both light and dark surfaces.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" role="img" aria-label={`${siteConfig.name} logo`} className={cn("size-9", className)}>
      <circle cx="20" cy="20" r="19" fill="#1c1b46" />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="#f5a623" strokeWidth="2.4" />
      {/* T stem (purple) then crossbar (gold) on top */}
      <rect x="17.4" y="11" width="5.2" height="18" rx="1.6" fill="#6a54e6" />
      <rect x="10" y="11" width="20" height="5.2" rx="1.8" fill="#f5a623" />
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
