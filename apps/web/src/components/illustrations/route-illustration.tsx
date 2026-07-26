const CITIES = [
  { label: "KITCHENER", x: 40, y: 170, textY: 196, anchor: "middle" },
  { label: "WATERLOO", x: 380, y: 90, textY: 72, anchor: "middle" },
  { label: "CAMBRIDGE", x: 600, y: 60, textY: 40, anchor: "end" },
] as const;

export function RouteIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 220"
      role="img"
      aria-label="Route line connecting Kitchener, Waterloo and Cambridge with a delivery van"
      className={className}
    >
      <path
        d="M40 170 C 160 60, 260 200, 380 90 S 560 40, 600 60"
        fill="none"
        className="stroke-primary"
        strokeWidth="4"
        strokeDasharray="2 14"
        strokeLinecap="round"
      />
      {CITIES.map((city) => (
        <g key={city.label}>
          <circle cx={city.x} cy={city.y} r="7" className="fill-accent" />
          <text
            x={city.anchor === "end" ? city.x - 12 : city.x}
            y={city.textY}
            fontFamily="var(--font-mono)"
            fontSize="12"
            className="fill-ink-muted"
            textAnchor={city.anchor}
          >
            {city.label}
          </text>
        </g>
      ))}
      <g transform="translate(255 118)">
        <rect x="0" y="10" width="62" height="30" rx="6" className="fill-primary" />
        <rect x="50" y="18" width="24" height="22" rx="4" className="fill-primary" />
        <rect x="55" y="22" width="14" height="9" rx="2" className="fill-bg" opacity="0.85" />
        <circle cx="16" cy="42" r="7" className="fill-ink" />
        <circle cx="16" cy="42" r="3" className="fill-bg-raised" />
        <circle cx="58" cy="42" r="7" className="fill-ink" />
        <circle cx="58" cy="42" r="3" className="fill-bg-raised" />
      </g>
    </svg>
  );
}
