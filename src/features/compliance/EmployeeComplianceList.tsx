import { useEffect, useState } from 'react'
import { ShieldCheck, User, Search, AlertCircle, FileText, CheckCircle } from 'lucide-react'
import { apiClient } from '@/services/apiClient'
import { complianceService } from './complianceService'
import type { ComplianceObligation, ComplianceRequirement } from './complianceService'

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department: string;
  jobTitle: string;
}

export default function EmployeeComplianceList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [obligations, setObligations] = useState<ComplianceObligation[]>([])
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiClient.get<Employee[]>('/employees'),
      complianceService.getObligations(),
      complianceService.getRequirements(),
    ])
      .then(([empRes, oblRes, reqRes]) => {
        setEmployees(empRes.data)
        setObligations(oblRes)
        setRequirements(reqRes)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-muted text-xs animate-pulse">Loading employee compliance list...</div>
  }

  const reqMap = new Map(requirements.map(r => [r.id, r]))

  const filtered = employees.filter(e => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase()) || e.employeeId.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-hairline shadow-2xs">
        <div className="flex-1 max-w-sm relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by employee name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Employee cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-muted text-xs col-span-full bg-white rounded-2xl border border-hairline">
            No employees found matching that search.
          </div>
        ) : (
          filtered.map(emp => {
            const empObligations = obligations.filter(o => o.targetId === emp.id)
            const compliantCount = empObligations.filter(o => o.status === 'COMPLIANT' || o.status === 'WAIVED').length
            const totalCount = empObligations.length
            const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100

            return (
              <div key={emp.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">{emp.firstName} {emp.lastName}</h4>
                      <p className="text-[10px] text-muted">{emp.jobTitle} • {emp.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-muted block">Score</span>
                    <span className={`text-xs font-extrabold ${complianceRate >= 90 ? 'text-emerald-600' : complianceRate >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {complianceRate}%
                    </span>
                  </div>
                </div>

                {/* Obligations statuses */}
                <div className="space-y-1.5 border-t border-hairline pt-3">
                  <p className="text-[10px] font-bold text-muted uppercase">Active Requirements ({totalCount})</p>
                  {empObligations.length === 0 ? (
                    <p className="text-[10px] text-muted italic">No active compliance obligations assigned.</p>
                  ) : (
                    <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                      {empObligations.map(obl => {
                        const req = reqMap.get(obl.requirementId)
                        return (
                          <div key={obl.id} className="flex items-center justify-between text-[11px] py-1 bg-wash/30 px-2 rounded-lg border border-hairline/10">
                            <span className="font-medium text-ink truncate max-w-[180px]" title={req?.name}>
                              {req?.name || 'Requirement'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                              obl.status === 'COMPLIANT' || obl.status === 'WAIVED' ? 'bg-emerald-100 text-emerald-800' :
                              obl.status === 'PENDING' || obl.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {obl.status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
