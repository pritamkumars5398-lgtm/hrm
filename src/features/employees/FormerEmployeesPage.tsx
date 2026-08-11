import { useState, useEffect } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { employeeService, type Employee } from '@/services/employeeService'
import EmployeeDrawer from '@/features/employees/components/EmployeeDrawer'

export default function FormerEmployeesPage() {
  const [former, setFormer] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchFormer = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await employeeService.getAll({ pageSize: 100 }, 'INACTIVE')
      setFormer(data.rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exit archives.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFormer()
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-hairline shadow-xl">
        <h1 className="text-2xl font-bold font-display">Former Employees & Exit Archives</h1>
        <p className="text-slate-300 text-sm mt-1">Full & Final (F&F) settlement records, exit dates, and relieving letters.</p>
      </div>

      {error && (
        <div className="rounded-ctl border border-clay/30 bg-clay/5 p-3 text-[13px] text-clay">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-hairline shadow-sm p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="animate-spin text-muted" size={24} />
            <p className="text-xs text-muted">Loading exit archives...</p>
          </div>
        ) : former.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted">No former employees found in exit archives.</p>
          </div>
        ) : (
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
              {former.map(emp => {
                const exitDate = emp.joinedAt ? new Date(emp.joinedAt).toLocaleDateString('en-GB') : '—'
                return (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedId(emp.id)}
                    className="hover:bg-wash/30 transition cursor-pointer"
                  >
                    <td className="p-3 font-semibold text-ink flex items-center gap-2">
                      {emp.photoUrl ? (
                        <img src={emp.photoUrl} className="size-6 rounded-full object-cover" alt="" />
                      ) : (
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-pine-tint text-[10px] font-semibold text-pine-deep">
                          {emp.avatarInitials}
                        </span>
                      )}
                      {emp.name}
                    </td>
                    <td className="p-3 text-muted">{emp.designation}</td>
                    <td className="p-3 text-muted">{emp.department}</td>
                    <td className="p-3 text-muted">{exitDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        SETTLED
                      </span>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <EmployeeDrawer
        employeeId={selectedId}
        onClose={() => setSelectedId(null)}
        onChanged={fetchFormer}
      />
    </div>
  )
}
