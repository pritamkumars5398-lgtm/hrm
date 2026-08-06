import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormInput, Plus, Share2, Copy, Check, Send, QrCode, X, Eye, Download, Users, FileText, CheckCircle2 } from 'lucide-react'
import { useFormStore, type FormDefinition } from './store/formStore'

export default function FormsListPage() {
  const { forms } = useFormStore()
  const [search, setSearch] = useState('')
  
  const [sharingForm, setSharingForm] = useState<FormDefinition | null>(null)
  const [inspectingResponses, setInspectingResponses] = useState<FormDefinition | null>(null)
  
  const [copied, setCopied] = useState(false)
  const [dispatched, setDispatched] = useState(false)

  const filteredForms = forms.filter((f) => {
    if (search && !f.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getFormUrl = (id: string) => `${window.location.origin}/dashboard/forms/fill/${id}`

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(getFormUrl(id))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDispatchNotification = () => {
    setDispatched(true)
    setTimeout(() => setDispatched(false), 3000)
  }

  const handleExportCSV = (form: FormDefinition) => {
    const headers = ['Respondent Name', 'Submitted At', ...form.fields.map(f => `"${f.label}"`)].join(',')
    const rows = form.responses.map(r => {
      const fieldAnswers = form.fields.map(f => `"${r.answers[f.id] ?? 'N/A'}"`).join(',')
      return `"${r.respondentName}","${r.submittedAt}",${fieldAnswers}`
    })
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_Responses.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <p className="text-slate-300 text-sm mt-1">Build dynamic feedback forms, share links, and inspect single-submission response analytics.</p>
        </div>
        <Link
          to="/dashboard/forms/builder"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md shrink-0"
        >
          <Plus size={16} /> Create Custom Form
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-hairline shadow-2xs">
        <span className="text-xs font-bold text-ink px-2">Total Forms Catalog ({forms.length})</span>

        <input
          type="text"
          placeholder="Search forms by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none w-full sm:w-72"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredForms.map((f) => (
          <div
            key={f.id}
            className="bg-white p-5 rounded-2xl border border-hairline hover:border-indigo-300 shadow-xs flex flex-col justify-between space-y-4 transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-wash text-ink border border-hairline">
                  {f.category}
                </span>

                <span className="text-[10px] font-bold text-muted bg-slate-100 px-2 py-0.5 rounded-md">
                  Single Submission
                </span>
              </div>

              <h3 className="font-bold text-sm text-ink mt-3 leading-snug">{f.title}</h3>
              <p className="text-xs text-muted mt-1 line-clamp-2">{f.description}</p>
              <p className="text-[10px] text-muted/70 mt-2">Created on {f.createdAt} · {f.fields.length} questions</p>
            </div>

            <div className="pt-3 border-t border-hairline flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-ink flex items-center gap-1">
                  <Users size={13} className="text-indigo-600" /> {f.responses.length} Submissions
                </span>

                <button
                  onClick={() => setInspectingResponses(f)}
                  className="text-indigo-600 font-bold hover:underline flex items-center gap-1 text-[11.5px]"
                >
                  <Eye size={13} /> View Responses
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setSharingForm(f)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Share2 size={13} /> Share Form
                </button>

                <Link
                  to={`/dashboard/forms/fill/${f.id}`}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  Fill / Open →
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

            <div className="space-y-3 pt-3 border-t border-hairline">
              <label className="text-xs font-bold text-ink block">Automated Dispatch Options</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={handleDispatchNotification}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  <Send size={15} /> Send via WhatsApp Bot
                </button>

                <button
                  onClick={handleDispatchNotification}
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

      {/* Inspect Responses Modal */}
      {inspectingResponses && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-2xl p-6 shadow-2xl border border-hairline space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-hairline pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Submitted Responses Inspector</span>
                <h3 className="font-bold text-lg text-ink mt-0.5">{inspectingResponses.title}</h3>
                <p className="text-xs text-muted">{inspectingResponses.responses.length} total submitted responses</p>
              </div>
              <div className="flex items-center gap-2">
                {inspectingResponses.responses.length > 0 && (
                  <button
                    onClick={() => handleExportCSV(inspectingResponses)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition cursor-pointer"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                )}
                <button onClick={() => setInspectingResponses(null)} className="text-muted hover:text-ink cursor-pointer p-1">
                  <X size={18} />
                </button>
              </div>
            </div>

            {inspectingResponses.responses.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs space-y-2">
                <FileText size={32} className="mx-auto text-slate-300" />
                <p className="font-bold text-ink">No submissions yet for this form</p>
                <p>Share the form link or QR code with employees to start collecting responses.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {inspectingResponses.responses.map((resp) => (
                  <div key={resp.id} className="bg-wash/40 p-4 rounded-xl border border-hairline space-y-3">
                    <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="size-7 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                          {resp.respondentName[0]}
                        </span>
                        <span className="font-bold text-xs text-ink">{resp.respondentName}</span>
                      </div>
                      <span className="text-[11px] text-muted font-mono">{resp.submittedAt}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {inspectingResponses.fields.map((f) => (
                        <div key={f.id} className="bg-white p-2.5 rounded-lg border border-hairline/60">
                          <p className="font-bold text-muted text-[11px]">{f.label}</p>
                          <p className="font-bold text-ink mt-0.5">
                            {String(resp.answers[f.id] ?? '—')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
