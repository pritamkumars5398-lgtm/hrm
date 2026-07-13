type LogoProps = {
  className?: string
  /** Render for a dark background (the CTA band, the footer). */
  inverse?: boolean
}

/** Wordmark + keystone mark. The mark is a trapezoid — the stone that holds an arch together. */
export default function Logo({ className = '', inverse = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M5.6 2h6.8l3.1 14H2.5L5.6 2Z"
          fill={inverse ? '#FBFBFA' : '#1F4D3F'}
        />
        <path d="M7.9 6.2h2.2l1 5.6H6.9l1-5.6Z" fill={inverse ? '#1F4D3F' : '#FBFBFA'} />
      </svg>
      <span
        className={`font-display text-[19px] leading-none font-semibold tracking-[-0.02em] ${
          inverse ? 'text-paper' : 'text-ink'
        }`}
      >
        Keystone
      </span>
    </span>
  )
}
