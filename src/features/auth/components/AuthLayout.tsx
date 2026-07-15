import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Logo from '@/shared/components/Logo'

type AuthLayoutProps = {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer: ReactNode
  compact?: boolean
  /** When true: form is LEFT, illustration is RIGHT (used for Login) */
  reverse?: boolean
  /** Custom illustration image path (defaults to /hrm-illustration.png) */
  image?: string
}

function FloatCard({
  className,
  delay = 0,
  children,
}: {
  className?: string
  delay?: number
  children: ReactNode
}) {
  return (
    <motion.div
      className={`absolute z-20 ${className}`}
      initial={{ opacity: 0, y: 18, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function ContextPanel({ image }: { image: string }) {
  return (
    <div className="relative hidden lg:flex flex-col overflow-hidden h-full">

      {/* ── Full-cover illustration ── */}
      <img
        src={image}
        alt="HR management"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Light overlay — shows image clearly, keeps text readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/50 z-10" />

      {/* ── All content on top of image ── */}
      <div className="relative z-20 flex flex-col justify-between h-full p-9 xl:p-12">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" aria-label="Keystone — home">
            <Logo inverse />
          </Link>
        </motion.div>

        {/* ── Floating animated cards — positioned in the middle ── */}
        <div className="relative flex-1">

          {/* Card — Employees (top-left) */}
          <FloatCard className="top-6 left-0" delay={0.35}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/25 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <div className="text-[20px] font-bold text-white leading-none">248</div>
                <div className="text-[10px] text-white/60 mt-0.5 uppercase tracking-wider">Employees</div>
              </div>
            </div>
          </FloatCard>

          {/* Card — Payroll accuracy (top-right) */}
          <FloatCard className="top-6 right-0" delay={0.5}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-blue-400/25 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <div className="text-[20px] font-bold text-white leading-none">99.8%</div>
                <div className="text-[10px] text-white/60 mt-0.5 uppercase tracking-wider">Payroll accuracy</div>
              </div>
            </div>
          </FloatCard>

          {/* Card — Leave approved notification (left-center) */}
          <FloatCard className="top-1/3 left-0" delay={0.6}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <div>
                <div className="text-[12.5px] font-semibold text-white leading-none">Leave approved</div>
                <div className="text-[10px] text-white/55 mt-1">Priya N. · Just now</div>
              </div>
            </div>
          </FloatCard>

          {/* Card — Departments (right-center) */}
          <FloatCard className="top-1/3 right-0" delay={0.7}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-purple-400/25 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </div>
              <div>
                <div className="text-[20px] font-bold text-white leading-none">12</div>
                <div className="text-[10px] text-white/60 mt-0.5 uppercase tracking-wider">Departments</div>
              </div>
            </div>
          </FloatCard>

          {/* Card — New hire (center, floats in middle) */}
          <FloatCard className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max" delay={0.8}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-teal-500/25 backdrop-blur-md border border-teal-400/40 shadow-xl px-4 py-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                S
              </div>
              <div className="text-[12.5px] font-semibold text-white">Samuel joined Engineering 🎉</div>
            </div>
          </FloatCard>

          {/* Card — Attendance mini chart (bottom-left) */}
          <FloatCard className="bottom-8 left-0" delay={0.9}>
            <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl px-4 py-3">
              <div className="text-[10px] text-white/60 uppercase tracking-wider mb-2">Attendance · this week</div>
              <div className="flex items-end gap-1.5 h-9">
                {[65, 82, 58, 93, 76, 42, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-teal-400 to-emerald-300"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: 0.95 + i * 0.07, ease: 'easeOut' }}
                    style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-[9px] text-white/35 flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>
          </FloatCard>

          {/* Card — Payslip generated (bottom-right) */}
          <FloatCard className="bottom-8 right-0" delay={1.0}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/25 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-white leading-none">Payslip generated</div>
                <div className="text-[10px] text-white/55 mt-1">Samuel K. · May 2025</div>
              </div>
            </div>
          </FloatCard>
        </div>

        {/* ── Bottom headline + testimonial ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-widest text-teal-200 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              HR Management Platform
            </div>
            <h2 className="font-display text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-white drop-shadow-md">
              Everything HR in one intelligent workspace.
            </h2>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/65">
              Attendance, payroll, leave and performance — connected, accurate, and always in sync.
            </p>
          </motion.div>

          {/* Testimonial strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-5 flex items-center gap-4 bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl px-5 py-4"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-[13px] font-bold text-white shrink-0">
              PN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] italic text-white/80 leading-relaxed">
                "Payroll closed in 90 minutes. It used to take three days."
              </p>
              <p className="text-[11px] text-white/45 mt-1">Priya Nair · Head of People, Alderway Labs</p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  compact = false,
  reverse = false,
  image = '/hrm-illustration.png',
}: AuthLayoutProps) {
  const reduced = useReducedMotion()

  return (
    <div className="grid h-dvh lg:grid-cols-2 overflow-hidden">
      {/* Illustration panel — order-1 default (left), order-2 when reversed (right) */}
      <div className={`h-full ${reverse ? 'order-2' : 'order-1'}`}>
        <ContextPanel image={image} />
      </div>

      {/* Form panel — order-2 default (right), order-1 when reversed (left) */}
      <div className={`flex flex-col h-full overflow-hidden bg-[#f8f9fa] ${reverse ? 'order-1' : 'order-2'}`}>

        <div className="flex flex-1 items-center justify-center px-8">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[360px]"
          >
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-gray-900 leading-tight">
              {title}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-gray-400">
              {subtitle}
            </p>

            <div className="mt-7">{children}</div>

            <div className="mt-6 text-center text-[13px] text-gray-400">
              {footer}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
