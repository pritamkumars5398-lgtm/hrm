import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormInput, CheckCircle, Clock, FileText } from 'lucide-react'

export default function MyFormsPage() {
  const [assignedForms] = useState([
    { id: 'form-1', title: 'Q3 2026 360-Degree Performance Appraisal', dueBy: '15th Aug 2026', status: 'PENDING' },
    { id: 'form-2', title: 'Employee Workplace Engagement & Pulse Survey', dueBy: '10th Aug 2026', status: 'SUBMITTED' },
  ])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <h1 className="text-2xl font-bold font-display">My Assigned Forms & Appraisals</h1>
        <p className="text-slate-300 text-sm mt-1">Complete your pending performance reviews and workplace surveys.</p>
      </div>

      <div className="space-y-4">
        {assignedForms.map(f => (
          <div key={f.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-ink">{f.title}</h3>
              <p className="text-xs text-muted mt-1">Due by {f.dueBy}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                f.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {f.status}
              </span>

              {f.status === 'PENDING' && (
                <Link
                  to={`/dashboard/forms/fill/${f.id}`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs"
                >
                  Fill Form
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
