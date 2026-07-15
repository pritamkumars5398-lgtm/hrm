import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BarChart3, Banknote, CalendarDays, Clock, Target, Users, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'
import {
  AttendancePreview,
  EmployeesPreview,
  LeavePreview,
  PayrollPreview,
  PerformancePreview,
  ReportsPreview,
} from './ModulePreviews'

type Module = {
  id: string
  name: string
  icon: LucideIcon
  headline: string
  body: string
  points: string[]
  Preview: ComponentType
}

const modules: Module[] = [
  {
    id: 'employees',
    name: 'Employee Management',
    icon: Users,
    headline: 'The whole company, one directory.',
    body: 'Every employee, department and reporting line in a single structure — with the full employment history behind each person, staying correct as they move team or get promoted.',
    points: [
      'Search, filter and sort a directory of any size',
      'Departments, designations and reporting lines',
      'Employment history and document vault per person',
    ],
    Preview: EmployeesPreview,
  },
  {
    id: 'attendance',
    name: 'Attendance',
    icon: Clock,
    headline: 'Hours that reconcile themselves.',
    body: 'Daily present, absent, late and half-day records roll straight into the monthly view — and into payroll, without a re-key.',
    points: [
      'Daily records with work-hour totals',
      'Monthly calendar view and summary cards',
      'Feeds payroll directly — no export step',
    ],
    Preview: AttendancePreview,
  },
  {
    id: 'leave',
    name: 'Leave Management',
    icon: CalendarDays,
    headline: 'Approvals that reach the right manager.',
    body: 'Balances are always current, requests route to the person who can actually approve them, and the team calendar shows who is out before you plan the sprint.',
    points: [
      'Live balances by leave type',
      'Pending, approved and rejected in one queue',
      'Shared team leave calendar',
    ],
    Preview: LeavePreview,
  },
  {
    id: 'payroll',
    name: 'Payroll',
    icon: Banknote,
    headline: 'Close the month in an afternoon.',
    body: 'Salary components, deductions, bonuses and tax computed from the attendance you already captured. Payslips generate themselves.',
    points: [
      'Salary components, deductions and bonuses',
      'Payslip preview and PDF export',
      'Tax summary for the whole run',
    ],
    Preview: PayrollPreview,
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: Target,
    headline: 'Reviews people actually finish.',
    body: 'Goals, ratings and appraisal cycles that managers can complete between meetings — with the history to show how someone has grown.',
    points: [
      'Goals with visible progress',
      'Rating scales and appraisal cycles',
      'Trends and full review history',
    ],
    Preview: PerformancePreview,
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: BarChart3,
    headline: 'Numbers your board will read.',
    body: 'Headcount, attrition, attendance and payroll cost — cut by department, ready to export, without anyone building a pivot table.',
    points: [
      'Employee, attendance, payroll and leave reports',
      'Department-level statistics',
      'One-click CSV and PDF export',
    ],
    Preview: ReportsPreview,
  },
]

export default function ModuleShowcase() {
  const [activeId, setActiveId] = useState(modules[0]!.id)
  const reduced = useReducedMotion()
  const active = modules.find((m) => m.id === activeId)!
  const { Preview } = active

  return (
    <section id="modules" className="border-t border-hairline bg-gradient-to-b from-white via-wash/20 to-white py-20 sm:py-28 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[300px] bg-[#eab308]/5 blur-[120px] rounded-full pointer-events-none" />

      <Container>
        {/* Premium Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50/50 px-3 py-1.5 text-[11px] font-bold text-[#15803d] uppercase tracking-wider shadow-sm">
              <Sparkles size={12} className="text-[#10b981] animate-pulse" />
              Product Modules
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-sans mt-6 text-[36px] leading-[1.08] font-extrabold tracking-[-0.04em] text-ink sm:text-[46px]">
              Powerful modules that{' '}
              <span className="bg-gradient-to-r from-[#15803d] via-[#10b981] to-[#eab308] bg-clip-text text-transparent">
                work together seamlessly.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted font-medium max-w-2xl mx-auto">
              Hiring, hours, absence, pay, growth and the numbers your board asks for — all reading from the same records. No exports, no reconciliation, no stale data.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10 relative">
          
          {/* Left rail — module index button deck */}
          <div className="lg:col-span-4">
            <div
              role="tablist"
              aria-label="Product modules"
              aria-orientation="vertical"
              className="flex flex-col gap-2.5 p-2.5 rounded-2xl border border-hairline bg-surface/50 backdrop-blur-sm shadow-sm"
            >
              {modules.map((m) => {
                const isActive = m.id === active.id
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    role="tab"
                    id={`tab-${m.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${m.id}`}
                    onClick={() => setActiveId(m.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm rounded-xl transition-all duration-300 ${isActive
                        ? 'bg-white shadow-[0_8px_20px_rgba(28,29,26,0.04)] border border-hairline/80 font-bold text-pine scale-[1.015]'
                        : 'text-muted hover:bg-wash/60 hover:text-ink hover:translate-x-0.5'
                      }`}
                  >
                    <div className={`flex size-7 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-pine-tint text-pine' : 'bg-wash/80 text-muted/80'}`}>
                      <Icon size={14} />
                    </div>
                    <span className="flex-1 tracking-tight">{m.name}</span>
                    {isActive && <span className="h-4.5 w-0.5 rounded-full bg-pine animate-pulse" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right — copy + high-fidelity live mock preview */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                role="tabpanel"
                id={`panel-${active.id}`}
                aria-labelledby={`tab-${active.id}`}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-8 sm:grid-cols-2"
              >
                {/* Description Column */}
                <div className="flex flex-col justify-center text-left">
                  <h3 className="font-sans text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink">
                    {active.headline}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted font-medium">{active.body}</p>
                  <ul className="mt-6 space-y-3">
                    {active.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted font-medium">
                        <span
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-pine"
                          aria-hidden="true"
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Browser Frame Preview Column */}
                <div className="relative group">
                  {/* Glowing background aura */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
                  
                  <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_15px_35px_rgba(28,29,26,0.03)] group-hover:shadow-[0_20px_45px_rgba(16,185,129,0.05)] transition-all duration-500 transform group-hover:-translate-y-0.5">
                    {/* Browser Mockup Header */}
                    <div className="flex items-center justify-between border-b border-hairline bg-wash/60 px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <span className="size-2 rounded-full bg-red-400" />
                        <span className="size-2 rounded-full bg-amber-400" />
                        <span className="size-2 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] font-medium text-muted/80 font-mono tracking-tight">keystone-app.com/hrm</span>
                      <span className="size-2" />
                    </div>
                    <div className="bg-surface">
                      <Preview />
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  )
}
