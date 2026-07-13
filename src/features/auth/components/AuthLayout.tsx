import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Logo from '@/shared/components/Logo'

type AuthLayoutProps = {
  title: string
  subtitle: ReactNode
  children: ReactNode
  /** Shown under the form — the "no account? sign up" line. */
  footer: ReactNode
}

/** The pine panel: proof, not decoration. Same stat tiles the product actually renders. */
function ContextPanel() {
  return (
    <div className="relative hidden flex-col justify-between bg-pine-deep p-10 lg:flex xl:p-12">
      <Link to="/" aria-label="Keystone — home">
        <Logo inverse />
      </Link>

      <div>
        <blockquote className="font-display max-w-md text-[26px] leading-[1.35] font-semibold tracking-[-0.02em] text-balance text-paper">
          “We closed payroll in ninety minutes last month. It used to take two people the better
          part of three days, and we still found errors afterwards.”
        </blockquote>

        <div className="mt-7 flex items-center gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[12px] font-semibold text-paper">
            PN
          </span>
          <span>
            <span className="block text-[14px] font-medium text-paper">Priya Nair</span>
            <span className="block text-[13px] text-paper/60">Head of People, Alderway Labs</span>
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-6 border-t border-white/12 pt-7">
        {[
          ['248', 'employees managed'],
          ['12', 'departments'],
          ['99.8%', 'payroll accuracy'],
        ].map(([value, label]) => (
          <div key={label}>
            <dt className="tnum font-display text-[24px] leading-none font-semibold text-paper">
              {value}
            </dt>
            <dd className="mt-1.5 text-[12px] leading-snug text-paper/60">{label}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const reduced = useReducedMotion()

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <ContextPanel />

      <div className="flex flex-col px-5 py-8 sm:px-8">
        {/* The mark only appears on this side when the pine panel is hidden */}
        <div className="lg:hidden">
          <Link to="/" aria-label="Keystone — home">
            <Logo />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            <h1 className="font-display text-[30px] leading-tight font-semibold tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-8 border-t border-hairline pt-6 text-[14px] text-muted">{footer}</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
