import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'
import Banner from '../../../../public/banner4.png'

const logoItems = [
  {
    name: 'Alderway',
    icon: (
      <svg className="size-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 22h20L12 2z" />
      </svg>
    )
  },
  {
    name: 'Bright Harbour',
    icon: (
      <svg className="size-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20M2 12h20" />
      </svg>
    )
  },
  {
    name: 'Nordkap',
    icon: (
      <svg className="size-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22L12 2l8 20H4z" />
      </svg>
    )
  },
  {
    name: 'Fieldstone',
    icon: (
      <svg className="size-3.5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    )
  },
  {
    name: 'Verity Health',
    icon: (
      <svg className="size-3.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    )
  }
]

export default function Hero() {
  const reduced = useReducedMotion()

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <section className="relative overflow-hidden border-b border-hairline bg-white">
      <Container className="relative">
        <div className="grid items-center gap-12 pt-4 pb-16 sm:pt-4 sm:pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-6 lg:pb-24">
          <div className="lg:col-span-5 text-left">
            <motion.p
              {...rise(0)}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-[12px] font-bold text-muted shadow-sm"
            >
              <Sparkles size={12} className="text-pine animate-pulse" />
              One workspace for your entire organisation
            </motion.p>

            <motion.h1
              {...rise(0.08)}
              className="font-sans mt-6 text-[44px] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance sm:text-[58px] text-ink"
            >
              Manage your entire company from{' '}
              <span className="bg-gradient-to-r from-[#15803d] via-[#10b981] to-[#eab308] bg-clip-text text-transparent">
                one workspace.
              </span>
            </motion.h1>

            <motion.p {...rise(0.16)} className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-muted font-medium">
              Keystone is one platform to manage your organisation end to end — every employee,
              department and team, from the day they are hired through attendance, leave, payroll,
              performance and reporting.
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                to="/signup"
                variant="premium"
                size="lg"
                className="group relative overflow-hidden font-bold"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -left-full group-hover:animate-shine pointer-events-none" />
                <span className="relative z-10 flex items-center gap-2">
                  Start your workspace
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Button>
              <Button
                href="#modules"
                variant="secondary"
                size="lg"
                className="hover:bg-wash/70 border border-[#10b981]/15 text-[#15803d] hover:border-[#10b981]/30 transition-all duration-300 font-bold shadow-sm"
              >
                Explore Features
              </Button>
            </motion.div>

            <motion.p {...rise(0.3)} className="mt-5 text-[13px] text-muted font-medium">
              14-day trial · No card required · Your company is live in an afternoon
            </motion.p>
          </div>

          <motion.div
            {...(reduced
              ? {}
              : {
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] as const },
              })}
            className="lg:col-span-7 flex items-center justify-center"
          >
            <img
              src={Banner}
              alt="Keystone Workspace graphic"
              className="w-full h-120 object-contain select-none"
            />
          </motion.div>
        </div>

        <div className="relative flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:gap-10">
          {/* Custom gradient top border rule */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-hairline to-transparent" />

          <p className="text-[11px] font-bold uppercase tracking-wider text-muted/60 whitespace-nowrap">
            Companies running on Keystone
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {logoItems.map((l) => (
              <span
                key={l.name}
                className="flex items-center gap-2 text-[14px] font-bold text-muted hover:text-ink transition-colors duration-200 cursor-default"
              >
                {l.icon}
                <span>{l.name}</span>
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
