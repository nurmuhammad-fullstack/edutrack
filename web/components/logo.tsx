// EduTrack brand mark: a checkmark that rises into an up-right arrow.
// Pure SVG so it stays crisp at any size and keeps the blue→violet gradient.

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="et-logo-grad" x1="11" y1="37" x2="40" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B56E0" />
          <stop offset="0.55" stopColor="#6D40E8" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      <g
        stroke="url(#et-logo-grad)"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* checkmark rising into the arrow shaft */}
        <path d="M12 23 L21 32 L38 12" />
        {/* arrowhead at the top-right tip */}
        <path d="M26 12 L38 12 L38 24" />
      </g>
    </svg>
  );
}

export function LogoWordmark({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Logo className="size-7" />
      <span className={textClassName ?? "font-bold text-lg tracking-tight"}>EduTrack</span>
    </span>
  );
}
