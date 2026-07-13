import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  /** Clips children to the radius — for cards containing tables or lists. */
  flush?: boolean
  /** A floating overlay (menu, popover). The only place a shadow is allowed (§7.2). */
  overlay?: boolean
  className?: string
}

/**
 * The one definition of "a surface". Elevation comes from a 1px hairline and a
 * background step — never a shadow (§7.2). If a card here ever grows a shadow,
 * it grows it for the whole product, which is the point.
 */
export default function Card({
  children,
  flush = false,
  overlay = false,
  className = '',
}: CardProps) {
  return (
    <div
      className={`rounded-card border border-hairline bg-surface ${flush ? 'overflow-hidden' : ''} ${
        overlay ? 'shadow-overlay' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
