import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'

const logos = ['Alderway', 'Bright Harbour', 'Nordkap', 'Fieldstone', 'Verity Health']

/** A compact, real-looking fragment of the product's own dashboard. */
function DashboardMock() {
  const bars = [72, 88, 64, 91, 78, 24, 18, 84, 93, 70, 86, 61, 30, 22]

  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline bg-wash px-4 py-3">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="font-medium">Dashboard</span>
          <span className="text-hairline-strong">/</span>
          <span className="text-muted">March 2026</span>
        </div>
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-pine text-[10px] font-semibold text-white">
          PN
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline">
        {[
          { label: 'Employees', value: '248', delta: '+4 this month' },
          { label: 'Departments', value: '12', delta: 'across 4 offices' },
          { label: 'Present today', value: '231', delta: '93.1%' },
        ].map((s) => (
          <div key={s.label} className="px-4 py-3.5">
            <p className="text-[11px] tracking-[0.02em] text-muted">{s.label}</p>
            <p className="tnum font-display mt-1 text-[26px] leading-none font-semibold">
              {s.value}
            </p>
            <p className="tnum mt-1.5 text-[11px] text-pine">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-hairline px-4 py-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[12px] font-medium">Attendance · last 14 days</p>
          <p className="tnum text-[11px] text-muted">avg 92%</p>
        </div>
        <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-[2px] ${h < 40 ? 'bg-hairline' : 'bg-pine'}`}
              style={{ height: `${h}%`, opacity: h < 40 ? 1 : 0.4 + (h / 100) * 0.6 }}
            />
          ))}
        </div>
      </div>

      <table className="w-full">
        <tbody>
          {[
            ['Priya Nair', 'Design', 'In · 09:02'],
            ['Samuel Okafor', 'Payroll', 'On leave'],
            ['Marta Lindqvist', 'Engineering', 'In · 08:47'],
          ].map(([name, dept, status]) => (
            <tr key={name} className="border-b border-hairline last:border-0">
              <td className="px-4 py-2.5 text-[13px] font-medium">{name}</td>
              <td className="px-4 py-2.5 text-[13px] text-muted">{dept}</td>
              <td className="tnum px-4 py-2.5 text-right text-[12px] text-muted">{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Hero() {
  const reduced = useReducedMotion()

  // A single, restrained load sequence — the only entrance animation on the page (§7.4)
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <section className="relative overflow-hidden border-b border-hairline">
      {/* Faint structural rules — a drafting grid, not decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, transparent 0 calc(100% / 6 - 1px), var(--color-hairline) calc(100% / 6 - 1px) calc(100% / 6))',
        }}
      />

      <Container className="relative">
        <div className="grid items-center gap-12 pt-4 pb-16 sm:pt-4 sm:pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-6 lg:pb-24">
          <div className="lg:col-span-5">
            <motion.p
              {...rise(0)}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-[12px] font-medium text-muted"
            >
              <span className="size-1.5 rounded-full bg-pine" />
              One workspace for your entire organisation
            </motion.p>

            <motion.h1
              {...rise(0.08)}
              className="font-display mt-6 text-[42px] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-[56px]"
            >
              Manage your entire company from one workspace.
            </motion.h1>

            <motion.p {...rise(0.16)} className="mt-5 max-w-md text-[16px] leading-relaxed text-muted">
              Keystone is one platform to manage your organisation end to end — every employee,
              department and team, from the day they are hired through attendance, leave, payroll,
              performance and reporting.
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/signup" size="lg">
                Start your workspace
                <ArrowRight size={16} />
              </Button>
              <Button href="#modules" variant="secondary" size="lg">
                Explore Features
              </Button>
            </motion.div>

            <motion.p {...rise(0.3)} className="mt-5 text-[13px] text-muted">
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
            className="lg:col-span-7"
          >
            <DashboardMock />
          </motion.div>
        </div>

        <div className="relative flex flex-col gap-4 border-t border-hairline py-7 sm:flex-row sm:items-center sm:gap-10">
          <p className="text-[12px] tracking-[0.02em] whitespace-nowrap text-muted">
            Companies running on Keystone
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {logos.map((l) => (
              <span
                key={l}
                className="font-display text-[15px] font-medium tracking-[-0.01em] text-muted/80"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
