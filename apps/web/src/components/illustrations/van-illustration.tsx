export function VanIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 220" role="img" aria-label="Illustration of a delivery van with packages" className={className}>
      <rect x="20" y="150" width="260" height="6" rx="3" className="fill-line" />
      <rect x="60" y="90" width="120" height="60" rx="10" className="fill-primary" />
      <rect x="170" y="105" width="55" height="45" rx="8" className="fill-primary" />
      <rect x="180" y="115" width="30" height="20" rx="4" className="fill-bg" opacity="0.85" />
      <circle cx="95" cy="155" r="15" className="fill-ink" />
      <circle cx="95" cy="155" r="6" className="fill-bg-raised" />
      <circle cx="205" cy="155" r="15" className="fill-ink" />
      <circle cx="205" cy="155" r="6" className="fill-bg-raised" />
      <rect x="30" y="60" width="34" height="34" rx="5" className="fill-accent" transform="rotate(-8 47 77)" />
      <rect x="235" y="70" width="28" height="28" rx="5" className="fill-confirm" transform="rotate(10 249 84)" />
    </svg>
  );
}
