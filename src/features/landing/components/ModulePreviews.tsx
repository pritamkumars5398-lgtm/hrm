import { ArrowUpRight, Check, Download, X } from 'lucide-react'
import Badge, { type BadgeTone } from '@/shared/components/Badge'

/*
  Small, honest mock-ups of each module's real UI, drawn with DOM only — no
  screenshots. They share the app's tokens, so the landing page and the product
  cannot drift apart. Every surface here is border + background step, no shadow.
*/

const cell = 'px-4 py-3 text-[13px]'

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-wash text-[11px] font-semibold text-muted">
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
  const tone: Record<string, BadgeTone> = {
    Active: 'success',
    'On leave': 'warning',
    Probation: 'neutral',
  }

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-hairline bg-wash px-4 py-2.5">
        <span className="h-7 flex-1 rounded-ctl border border-hairline bg-surface px-2.5 text-[12px] leading-7 text-muted">
          Search 248 employees…
        </span>
        <span className="h-7 rounded-ctl border border-hairline bg-surface px-2.5 text-[12px] leading-7 text-muted">
          Department
        </span>
      </div>
      <table className="w-full">
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-hairline last:border-0">
              <td className={cell}>
                <span className="flex items-center gap-2.5">
                  <Avatar initials={r.initials} />
                  <span className="font-medium">{r.name}</span>
                </span>
              </td>
              <td className={`${cell} text-muted`}>{r.dept}</td>
              <td className={`${cell} text-right`}>
                <Badge tone={tone[r.status]}>{r.status}</Badge>
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
  const fill = ['bg-pine', 'bg-ochre', 'bg-clay', 'bg-hairline']

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium">March 2026</span>
        <span className="tnum text-[12px] text-muted">21 present · 2 late · 2 leave</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="pb-1 text-center text-[10px] font-medium text-muted">
            {d}
          </span>
        ))}
        {days.map((state, i) => (
          <span
            key={i}
            className="flex aspect-square items-center justify-center rounded-[4px] border border-hairline bg-surface"
          >
            <span className={`size-1.5 rounded-full ${fill[state]}`} />
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-hairline pt-3 text-[11px] text-muted">
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
      <div className="space-y-3.5">
        {balances.map((b) => (
          <div key={b.type}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[13px] font-medium">{b.type}</span>
              <span className="tnum text-[12px] text-muted">
                {b.total - b.used} of {b.total} days left
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-wash">
              <div
                className="h-full rounded-full bg-pine"
                style={{ width: `${(b.used / b.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-ctl border border-hairline bg-wash p-3">
        <div className="flex items-center gap-2.5">
          <Avatar initials="SO" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">Samuel Okafor</p>
            <p className="tnum text-[12px] text-muted">Annual · 18–22 Mar · 5 days</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-ctl bg-pine text-[12px] font-medium text-white">
            <Check size={13} /> Approve
          </span>
          <span className="inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface text-[12px] font-medium">
            <X size={13} /> Decline
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
      <div className="flex items-center justify-between border-b border-hairline bg-wash px-4 py-2.5">
        <span className="text-[13px] font-medium">March payslip · P. Nair</span>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-pine">
          <Download size={13} /> PDF
        </span>
      </div>
      <div className="p-4">
        <dl>
          {lines.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-hairline py-2.5 text-[13px]"
            >
              <dt className="text-muted">{label}</dt>
              <dd className="tnum font-medium">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3">
            <dt className="text-[13px] font-medium">Net pay</dt>
            <dd className="tnum font-display text-xl font-semibold text-pine">£3,441.70</dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-hairline pt-3 text-[12px] text-muted">
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
      <div className="space-y-4">
        {people.map((p) => (
          <div key={p.name} className="border-b border-hairline pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-2.5">
              <Avatar initials={p.initials} />
              <span className="flex-1 text-[13px] font-medium">{p.name}</span>
              <span className="flex gap-1" aria-label={`${p.rating} of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`size-1.5 rounded-full ${n <= p.rating ? 'bg-pine' : 'bg-hairline'}`}
                  />
                ))}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash">
                <div className="h-full rounded-full bg-pine" style={{ width: `${p.goal}%` }} />
              </div>
              <span className="tnum w-16 text-right text-[11px] text-muted">{p.goal}% goals</span>
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
      <div className="grid grid-cols-3 divide-x divide-hairline rounded-ctl border border-hairline">
        {[
          ['Headcount', '248'],
          ['Attrition', '4.1%'],
          ['Avg. tenure', '3.2y'],
        ].map(([label, value]) => (
          <div key={label} className="px-3 py-2.5">
            <p className="text-[11px] text-muted">{label}</p>
            <p className="tnum font-display mt-0.5 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="mb-2.5 text-[12px] text-muted">Headcount by quarter</p>
        <div className="flex h-24 items-end gap-2">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[3px] bg-pine"
              style={{ height: `${h}%`, opacity: 0.35 + (i / bars.length) * 0.65 }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
          <span className="text-[12px] text-muted">Q1 2024 — Q4 2025</span>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-pine">
            Export CSV <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </div>
  )
}
