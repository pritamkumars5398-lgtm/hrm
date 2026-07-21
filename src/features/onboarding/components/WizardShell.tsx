import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import type { OnboardingStep } from '../store/onboardingStore'

type WizardShellProps = {
  current: OnboardingStep
  title: string
  subtitle: string
  children: ReactNode
}

const steps = [
  { n: 1, label: 'Personal details', hint: 'About you' },
  { n: 2, label: 'Company details', hint: 'Creates your workspace' },
] as const

function Stepper({ current }: { current: OnboardingStep }) {
  return (
    <ol className="flex items-center">
      {steps.map((s, i) => {
        const done = current > s.n
        const active = current === s.n
        return (
          <li key={s.n} className="flex flex-1 items-center">
            <div className="flex items-center gap-2.5">
              <div className={[
                'flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold shrink-0 transition-all duration-300',
                done ? 'bg-teal-500 text-white'
                  : active ? 'bg-teal-500 text-white ring-4 ring-teal-500/20'
                  : 'bg-gray-100 text-gray-400',
              ].join(' ')}>
                {done ? <Check size={12} strokeWidth={3} /> : s.n}
              </div>
              <div>
                <p className={`text-[12px] font-semibold leading-none ${active || done ? 'text-gray-800' : 'text-gray-400'}`}>
                  {s.label}
                </p>
                <p className="text-[10.5px] text-gray-400 mt-0.5">{s.hint}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className="h-px bg-gray-200 relative overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-teal-500"
                    initial={{ width: '0%' }}
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default function WizardShell({ current, title, subtitle, children }: WizardShellProps) {
  const reduced = useReducedMotion()

  return (
    <div className="min-h-dvh overflow-y-auto bg-[#f8f9fa] flex flex-col">

      {/* Header — compact */}
      <header className="shrink-0 bg-white border-b border-gray-100 px-8 h-14 flex items-center justify-between">
        <Link to="/" aria-label="Keystone — home">
          <Logo />
        </Link>
        <span className="text-[12px] text-gray-400 font-medium">Step {current} of {steps.length}</span>
      </header>

      {/* Content — centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <motion.div
          key={current}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          {/* Stepper */}
          <nav aria-label="Onboarding progress" className="mb-7">
            <Stepper current={current} />
          </nav>

          {/* Heading */}
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-gray-900 leading-tight">
            {title}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-400">
            {subtitle}
          </p>

          {/* Form area — clean card container with minimal shadow */}
          <div className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
