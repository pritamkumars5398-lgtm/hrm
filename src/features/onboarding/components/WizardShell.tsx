import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import Container from '@/shared/components/Container'
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
    <ol className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = current > s.n
        const active = current === s.n

        return (
          <li key={s.n} className="flex flex-1 items-center gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tnum ${
                  done
                    ? 'border-pine bg-pine text-white'
                    : active
                      ? 'border-pine bg-pine-tint text-pine-deep'
                      : 'border-hairline-strong bg-surface text-muted'
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : s.n}
              </span>

              <span className="min-w-0">
                <span
                  className={`block truncate text-[13px] font-medium ${
                    active || done ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {s.label}
                </span>
                <span className="hidden truncate text-[11px] text-muted sm:block">{s.hint}</span>
              </span>
            </div>

            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`h-px flex-1 ${done ? 'bg-pine' : 'bg-hairline'}`}
              />
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
    <div className="min-h-dvh">
      <header className="border-b border-hairline">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <p className="tnum text-[13px] text-muted">Step {current} of {steps.length}</p>
          </div>
        </Container>
      </header>

      <Container>
        <div className="mx-auto max-w-xl py-10 sm:py-14">
          <nav aria-label="Onboarding progress">
            <Stepper current={current} />
          </nav>

          <motion.div
            key={current}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <h1 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{subtitle}</p>

            <div className="mt-8 rounded-card border border-hairline bg-surface p-6 sm:p-7">
              {children}
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  )
}
