export default function Logo({ className = 'h-7 w-7', animado = false }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Overload">
      <title>Overload</title>
      <mask id="corte-diagonal">
        <rect width="48" height="48" fill="white" />
        <path d="M11 39 L39 11" stroke="black" strokeWidth="9" strokeLinecap="round" />
      </mask>
      <circle
        cx="24"
        cy="24"
        r="16"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="7"
        mask="url(#corte-diagonal)"
      />
      <path
        d="M14 36 L38 12"
        stroke="var(--color-brand)"
        strokeWidth="4.5"
        strokeLinecap="round"
        className={animado ? 'origin-center' : undefined}
      />
    </svg>
  );
}
