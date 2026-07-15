import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Download, X } from 'lucide-react'

/*
  Small, honest mock-ups of each module's real UI, drawn with DOM only — no
  screenshots. They share the app's tokens, so the landing page and the product
  cannot drift apart. Every surface here is border + background step, no shadow.
*/

const cell = 'px-4 py-3.5 text-[13px]'

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pine/15 to-emerald-500/10 text-[10.5px] font-bold text-pine border border-pine/10 shadow-sm uppercase select-none">
      {initials}
    </span>
  )
}

export function EmployeesPreview() {
  const rows = [
    { name: 'Priya Nair', initials: 'PN', dept: 'Design', status: 'Active' as const },
    { name: 'Samuel Okafor', initials: 'SO', dept: 'Payroll', status: 'On leave' as const },
    { name: 'Marta Lindqvist', initials: 'ML', dept: 'Engineering', status: 'Active' as const },
    { name: 'Dan Whitfield', initials: 'DW', dept: 'Sales', status: 'Probation' as const },
  ]
  const tone: Record<string, string> = {
    Active: 'bg-green-50 text-green-700 border-green-200/50',
    'On leave': 'bg-amber-50 text-amber-700 border-amber-200/50',
    Probation: 'bg-slate-50 text-slate-700 border-slate-200/50',
  }

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-hairline bg-wash/40 px-4 py-2.5">
        <span className="h-8 flex-1 rounded-lg border border-hairline bg-surface px-3 text-[12px] leading-8 text-muted/80 font-medium">
          🔍 Search 248 employees…
        </span>
        <span className="h-8 rounded-lg border border-hairline bg-surface px-3 text-[12px] leading-8 text-muted/80 font-medium cursor-pointer hover:bg-wash transition-colors">
          Filter
        </span>
      </div>
      <table className="w-full">
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-hairline last:border-0 hover:bg-wash/30 transition-colors duration-150">
              <td className={cell}>
                <span className="flex items-center gap-2.5">
                  <Avatar initials={r.initials} />
                  <span className="font-bold text-ink">{r.name}</span>
                </span>
              </td>
              <td className={`${cell} text-muted font-semibold`}>{r.dept}</td>
              <td className={`${cell} text-right`}>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${tone[r.status]}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AttendancePreview() {
  // 0 present · 1 late · 2 leave · 3 weekend/empty
  const days = [
    3, 0, 0, 0, 0, 0, 3, 3, 0, 1, 0, 0, 0, 3, 3, 0, 0, 2, 2, 0, 3, 3, 0, 0, 0, 1, 0, 3, 3, 0,
  ]
  const fill = [
    'bg-pine shadow-sm shadow-pine/20', 
    'bg-ochre shadow-sm shadow-ochre/20', 
    'bg-clay shadow-sm shadow-clay/20', 
    'bg-hairline-strong/30'
  ]

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink">March 2026</span>
        <span className="tnum text-[11.5px] font-bold text-muted bg-wash px-2 py-0.5 rounded-md">21 present · 2 late · 2 leave</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="pb-1 text-center text-[10px] font-bold text-muted/70 uppercase">
            {d}
          </span>
        ))}
        {days.map((state, i) => (
          <span
            key={i}
            className="flex aspect-square items-center justify-center rounded-[4px] border border-hairline bg-surface/50"
          >
            <span className={`size-1.5 rounded-full ${fill[state]}`} />
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-hairline pt-3 text-[11px] text-muted font-bold">
        {[
          ['bg-pine', 'Present'],
          ['bg-ochre', 'Late'],
          ['bg-clay', 'Leave'],
        ].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${c}`} /> {l}
          </span>
        ))}
      </div>
    </div>
  )
}

export function LeavePreview() {
  const balances = [
    { type: 'Annual', used: 11, total: 24 },
    { type: 'Sick', used: 3, total: 12 },
    { type: 'Personal', used: 1, total: 5 },
  ]

  return (
    <div className="p-4">
      <div className="space-y-4">
        {balances.map((b) => (
          <div key={b.type}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[13px] font-bold text-ink">{b.type}</span>
              <span className="tnum text-[11.5px] font-semibold text-muted">
                {b.total - b.used} of {b.total} days left
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-wash">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(b.used / b.total) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-pine to-emerald-400"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-hairline bg-wash/30 p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Avatar initials="SO" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">Samuel Okafor</p>
            <p className="tnum text-[12px] text-muted font-semibold">Annual · 18–22 Mar · 5 days</p>
          </div>
        </div>
        <div className="mt-3.5 flex gap-2">
          <span className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-pine text-[12px] font-bold text-white shadow-sm hover:bg-pine-deep hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer">
            <Check size={13} strokeWidth={3} /> Approve
          </span>
          <span className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-hairline-strong bg-surface text-[12px] font-bold hover:bg-wash/80 transition-all duration-200 cursor-pointer">
            <X size={13} strokeWidth={3} /> Decline
          </span>
        </div>
      </div>
    </div>
  )
}

export function PayrollPreview() {
  const lines = [
    ['Gross pay', '£4,250.00'],
    ['Income tax', '−£680.00'],
    ['Pension (5%)', '−£212.50'],
    ['Expenses', '+£84.20'],
  ]

  return (
    <div>
      <div className="flex items-center justify-between border-b border-hairline bg-wash/40 px-4 py-2.5">
        <span className="text-[13px] font-bold text-ink">March payslip · P. Nair</span>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-pine bg-pine-tint px-2.5 py-1 rounded-md border border-pine/15 cursor-pointer hover:bg-pine/20 transition-all">
          <Download size={13} strokeWidth={2.5} /> PDF
        </span>
      </div>
      <div className="p-4">
        <dl>
          {lines.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-hairline py-2.5 text-[13px] hover:bg-wash/10 transition-colors"
            >
              <dt className="text-muted font-semibold">{label}</dt>
              <dd className={`tnum font-bold ${value.startsWith('−') ? 'text-rose-600' : value.startsWith('+') ? 'text-pine' : 'text-ink'}`}>{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3">
            <dt className="text-[13.5px] font-bold text-ink">Net pay</dt>
            <dd className="tnum font-display text-xl font-extrabold text-pine">£3,441.70</dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-hairline pt-3 text-[12px] text-muted font-semibold">
          Paid 28 Mar · 248 employees · £847,204 total run
        </p>
      </div>
    </div>
  )
}

export function PerformancePreview() {
  const people = [
    { name: 'Priya Nair', initials: 'PN', rating: 5, goal: 92 },
    { name: 'Marta Lindqvist', initials: 'ML', rating: 4, goal: 78 },
    { name: 'Dan Whitfield', initials: 'DW', rating: 3, goal: 45 },
  ]

  return (
    <div className="p-4">
      <div className="space-y-4.5">
        {people.map((p) => (
          <div key={p.name} className="border-b border-hairline pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-2.5">
              <Avatar initials={p.initials} />
              <span className="flex-1 text-[13px] font-bold text-ink">{p.name}</span>
              <span className="flex gap-1" aria-label={`${p.rating} of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`size-2 rounded-full shadow-sm transition-all duration-300 ${n <= p.rating ? 'bg-pine' : 'bg-hairline-strong/60'}`}
                  />
                ))}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-wash">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${p.goal}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-pine to-emerald-400" 
                />
              </div>
              <span className="tnum w-16 text-right text-[11px] font-bold text-muted">{p.goal}% goals</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReportsPreview() {
  const bars = [38, 52, 44, 61, 55, 72, 68, 80]

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 divide-x divide-hairline rounded-xl border border-hairline bg-surface shadow-sm">
        {[
          ['Headcount', '248'],
          ['Attrition', '4.1%'],
          ['Avg. tenure', '3.2y'],
        ].map(([label, value]) => (
          <div key={label} className="px-3 py-2.5 text-center">
            <p className="text-[11px] font-bold text-muted/80 uppercase tracking-wider">{label}</p>
            <p className="tnum font-display mt-1 text-xl font-extrabold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-2.5 text-[12px] font-bold text-muted">Headcount by quarter</p>
        <div className="flex h-24 items-end gap-2">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
              className="flex-1 rounded-t-[3px] bg-gradient-to-t from-pine to-emerald-400"
              style={{ opacity: 0.4 + (i / bars.length) * 0.6 }}
            />
          ))}
        </div>
        <div className="mt-3.5 flex items-center justify-between border-t border-hairline pt-3">
          <span className="text-[12px] font-semibold text-muted">Q1 2024 — Q4 2025</span>
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-pine cursor-pointer hover:text-pine-deep transition-colors">
            Export CSV <ArrowUpRight size={13} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </div>
  )
}
