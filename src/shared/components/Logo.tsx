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
        width="20"
        height="20"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        <path
          d="M5.6 2h6.8l3.1 14H2.5L5.6 2Z"
          fill={inverse ? '#FBFBFA' : 'url(#logoGrad)'}
        />
        <path d="M7.9 6.2h2.2l1 5.6H6.9l1-5.6Z" fill={inverse ? '#1F4D3F' : '#FBFBFA'} />
      </svg>
      <span
        className={`font-sans text-[20px] font-extrabold tracking-[-0.03em] select-none ${
          inverse ? 'text-paper' : 'text-ink'
        }`}
      >
        Key<span className={inverse ? 'text-[#a4dbc6]' : 'text-[#15803d]'}>stone</span>
      </span>
    </span>
  )
}
