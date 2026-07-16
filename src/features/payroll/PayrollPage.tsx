import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission } from '@/shared/config/navigation'
import SalaryStructuresView from './components/SalaryStructuresView'
import MonthlyPayrollView from './components/MonthlyPayrollView'

const TABS = [
  { key: 'salary', label: 'Salary structures' },
  { key: 'monthly', label: 'Monthly payroll' },
] as const

export default function PayrollPage() {
  const user = useAuthStore((s) => s.user)!
  const canManage = hasPermission(user.permissions, 'payroll.manage')
  const [searchParams] = useSearchParams()
  // Coming back from a payslip page (?tab=monthly) should land on the tab you left, not reset to the first one.
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>(
    searchParams.get('tab') === 'monthly' ? 'monthly' : 'salary',
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Payroll
          </h1>
          <span className="flex size-6 items-center justify-center rounded-full bg-pine-tint text-pine">
            <Sparkles size={13} />
          </span>
        </div>
        <p className="mt-1.5 text-[14px] text-muted">
          Salary components, monthly earnings and deductions, and payslips.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-hairline">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`px-3 py-2 text-[13.5px] font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              tab === t.key
                ? 'border-pine text-pine-deep font-semibold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'salary' && <SalaryStructuresView canManage={canManage} />}
      {tab === 'monthly' && <MonthlyPayrollView canManage={canManage} />}
    </motion.div>
  )
}
