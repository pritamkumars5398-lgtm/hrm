import { useState } from 'react'
import { Users, Search, Download, FileText } from 'lucide-react'

type FormerEmployee = {
  id: string
  name: string
  jobTitle: string
  department: string
  exitDate: string
  fnfStatus: 'SETTLED' | 'IN_PROCESS'
  relievingLetter: string
}

const INITIAL_FORMER: FormerEmployee[] = [
  { id: 'f-1', name: 'Rohan Joshi', jobTitle: 'QA Lead', department: 'Engineering', exitDate: '2026-06-30', fnfStatus: 'SETTLED', relievingLetter: 'relieving_rohan.pdf' },
  { id: 'f-2', name: 'Divya Nair', jobTitle: 'Graphic Designer', department: 'Marketing', exitDate: '2026-07-15', fnfStatus: 'SETTLED', relievingLetter: 'relieving_divya.pdf' },
]

export default function FormerEmployeesPage() {
  const [former] = useState<FormerEmployee[]>(INITIAL_FORMER)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-hairline shadow-xl">
        <h1 className="text-2xl font-bold font-display">Former Employees & Exit Archives</h1>
        <p className="text-slate-300 text-sm mt-1">Full & Final (F&F) settlement records, exit dates, and relieving letters.</p>
      </div>

      <div className="bg-white rounded-2xl border border-hairline shadow-sm p-4">
        <table className="w-full text-left text-xs">
          <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
            <tr>
              <th className="p-3">Employee Name</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Department</th>
              <th className="p-3">Exit Date</th>
              <th className="p-3">F&F Settlement</th>
              <th className="p-3 text-right">Relieving Letter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {former.map(emp => (
              <tr key={emp.id} className="hover:bg-wash/30 transition">
                <td className="p-3 font-semibold text-ink">{emp.name}</td>
                <td className="p-3 text-muted">{emp.jobTitle}</td>
                <td className="p-3 text-muted">{emp.department}</td>
                <td className="p-3 text-muted">{emp.exitDate}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {emp.fnfStatus}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button className="text-indigo-600 font-bold hover:underline">
                    <Download size={14} className="inline mr-1" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
