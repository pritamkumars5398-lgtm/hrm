import type { ReactNode } from 'react'

type SectionHeadingProps = {
  /** Small uppercase eyebrow above the title. */
  label: string
  title: ReactNode
  intro?: string
  className?: string
}

export default function SectionHeading({
  label,
  title,
  intro,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <span className="h-px w-6 bg-hairline-strong" aria-hidden="true" />
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          {label}
        </span>
      </div>
      <h2 className="font-display mt-4 max-w-2xl text-3xl leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[40px]">
        {title}
      </h2>
      {intro && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{intro}</p>}
    </div>
  )
}
