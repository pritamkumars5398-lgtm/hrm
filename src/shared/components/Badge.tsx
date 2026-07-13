import type { ReactNode } from 'react'

/**
 * Semantic, not literal: callers ask for `success`, never for "green".
 * Restyling the whole product's status colours is then a change to this file
 * plus the tokens it names — not a hunt through every screen.
 */
export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-wash text-muted',
  accent: 'bg-pine-tint text-pine-deep',
  success: 'bg-pine-tint text-pine-deep',
  warning: 'bg-ochre-tint text-ochre-deep',
  danger: 'bg-clay-tint text-clay-deep',
}

type BadgeProps = {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

/** Pill-shaped by design — a real convention for tags and status chips (§7.2). */
export default function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/** Roles map to tones and labels in one place, so every screen badges a role identically. */
const ROLE_TONE: Record<string, BadgeTone> = {
  OWNER: 'accent',
  HR: 'warning',
  MANAGER: 'neutral',
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Owner',
  HR: 'HR',
  MANAGER: 'Manager',
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge tone={ROLE_TONE[role] ?? 'neutral'}>{ROLE_LABEL[role] ?? role}</Badge>
}
