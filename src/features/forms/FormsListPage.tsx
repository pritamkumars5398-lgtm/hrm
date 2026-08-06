import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormInput, Plus, Share2, Copy, Check, Send, QrCode, X } from 'lucide-react'

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
  const [sharingForm, setSharingForm] = useState<FormItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [dispatched, setDispatched] = useState(false)

  const getFormUrl = (id: string) => `${window.location.origin}/dashboard/forms/fill/${id}`

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(getFormUrl(id))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDispatchNotification = (type: 'whatsapp' | 'email') => {
    setDispatched(true)
    setTimeout(() => setDispatched(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FormInput size={14} /> Custom Form Builder & Appraisal Engine
          </div>
          <h1 className="text-2xl font-bold font-display">Survey, Appraisal & Onboarding Forms</h1>
          <p className="text-slate-300 text-sm mt-1">Build dynamic drag-and-drop feedback forms, performance surveys, and share them instantly with your team.</p>
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSharingForm(f)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Share2 size={13} /> Share Form
                </button>
                <Link
                  to={`/dashboard/forms/fill/${f.id}`}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Fill →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Form Modal */}
      {sharingForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-hairline space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Shareable Form Link</span>
                <h3 className="font-bold text-lg text-ink mt-0.5">{sharingForm.title}</h3>
              </div>
              <button onClick={() => setSharingForm(null)} className="text-muted hover:text-ink cursor-pointer p-1">
                <X size={18} />
              </button>
            </div>

            {/* Link Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink block">Direct Form URL</label>
              <div className="flex items-center gap-2 bg-wash p-2 rounded-xl border border-hairline">
                <input
                  type="text"
                  readOnly
                  value={getFormUrl(sharingForm.id)}
                  className="flex-1 bg-transparent text-xs font-mono text-ink outline-none px-2"
                />
                <button
                  onClick={() => handleCopyLink(sharingForm.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition cursor-pointer shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Broadcast Options */}
            <div className="space-y-3 pt-3 border-t border-hairline">
              <label className="text-xs font-bold text-ink block">Automated Dispatch Options</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => handleDispatchNotification('whatsapp')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  <Send size={15} /> Send via WhatsApp Bot
                </button>

                <button
                  onClick={() => handleDispatchNotification('email')}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 font-bold hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Send size={15} /> Email Team Blast
                </button>
              </div>

              {dispatched && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold text-center animate-pulse">
                  ✓ Notification broadcast dispatched to target employees!
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="p-4 bg-wash rounded-xl border border-hairline flex items-center gap-4">
              <div className="size-16 bg-white p-2 rounded-lg border border-hairline flex items-center justify-center text-indigo-600">
                <QrCode size={40} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-ink">Mobile QR Code</p>
                <p className="text-muted mt-0.5">Employees can scan this QR code with their mobile device camera to open and submit the form directly on ESS mobile view.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
