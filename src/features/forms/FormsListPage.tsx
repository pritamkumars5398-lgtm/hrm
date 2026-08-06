import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormInput, Plus, FileText, CheckCircle, Clock, Search } from 'lucide-react'

type FormItem = {
  id: string
  title: string
  category: 'Appraisal' | 'Survey' | 'Feedback' | 'Onboarding'
  responsesCount: number
  status: 'PUBLISHED' | 'DRAFT'
  createdAt: string
}

const INITIAL_FORMS: FormItem[] = [
  { id: 'form-1', title: 'Q3 2026 360-Degree Performance Appraisal', category: 'Appraisal', responsesCount: 38, status: 'PUBLISHED', createdAt: '2026-08-01' },
  { id: 'form-2', title: 'Employee Workplace Engagement & Pulse Survey', category: 'Survey', responsesCount: 14, status: 'PUBLISHED', createdAt: '2026-08-03' },
  { id: 'form-3', title: 'New Joiner 30-Day Onboarding Feedback', category: 'Onboarding', responsesCount: 6, status: 'PUBLISHED', createdAt: '2026-07-15' },
]

export default function FormsListPage() {
  const [forms] = useState<FormItem[]>(INITIAL_FORMS)

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FormInput size={14} /> Custom Form Builder & Appraisal Engine
          </div>
          <h1 className="text-2xl font-bold font-display">Survey, Appraisal & Onboarding Forms</h1>
          <p className="text-slate-300 text-sm mt-1">Build dynamic drag-and-drop feedback forms, performance surveys, and checklists.</p>
        </div>
        <Link
          to="/dashboard/forms/builder"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
        >
          <Plus size={16} /> Create Custom Form
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forms.map(f => (
          <div key={f.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-wash text-ink border border-hairline">
                  {f.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  {f.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-ink mt-3">{f.title}</h3>
              <p className="text-xs text-muted mt-1">Created on {f.createdAt}</p>
            </div>

            <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">{f.responsesCount} Submissions</span>
              <Link
                to={`/dashboard/forms/fill/${f.id}`}
                className="text-indigo-600 font-bold hover:underline"
              >
                Fill Form →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
