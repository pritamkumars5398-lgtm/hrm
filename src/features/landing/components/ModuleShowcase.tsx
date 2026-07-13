import { useState, type ComponentType } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BarChart3, Banknote, CalendarDays, Clock, Target, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Container from '@/shared/components/Container'
import SectionHeading from '@/shared/components/SectionHeading'
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
    <section id="modules" className="border-t border-hairline bg-wash py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            label="The modules"
            title="Powerful modules that work together seamlessly."
            intro="Hiring, hours, absence, pay, growth and the numbers your board asks for — all reading from the same organisation-wide records. No exports, no reconciliation, no version that is three weeks stale."
          />
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left rail — module index */}
          <div className="lg:col-span-4">
            <div
              role="tablist"
              aria-label="Product modules"
              aria-orientation="vertical"
              className="overflow-hidden rounded-card border border-hairline bg-surface"
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
                    className={`flex w-full items-center gap-3 border-b border-hairline px-4 py-3.5 text-left text-sm transition-colors last:border-0 ${isActive
                        ? 'bg-pine-tint font-medium text-pine-deep'
                        : 'text-muted hover:bg-wash hover:text-ink'
                      }`}
                  >
                    <Icon size={16} className={isActive ? 'text-pine' : 'text-muted'} />
                    <span className="flex-1">{m.name}</span>
                    {isActive && <span className="h-4 w-0.5 rounded-full bg-pine" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right — copy + live mock of the module */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                role="tabpanel"
                id={`panel-${active.id}`}
                aria-labelledby={`tab-${active.id}`}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-6 sm:grid-cols-2 sm:gap-8"
              >
                <div>
                  <h3 className="font-display text-2xl leading-snug font-semibold tracking-[-0.015em]">
                    {active.headline}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{active.body}</p>
                  <ul className="mt-5 space-y-2.5">
                    {active.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-[14px] leading-relaxed">
                        <span
                          className="mt-2 size-1 shrink-0 rounded-full bg-pine"
                          aria-hidden="true"
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="overflow-hidden rounded-card border border-hairline bg-surface">
                  <Preview />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  )
}
