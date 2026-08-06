import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle2, Star, Upload, Calendar } from 'lucide-react'
import { useFormStore } from './store/formStore'

export default function FillFormPage() {
  const navigate = useNavigate()
  const { formId } = useParams<{ formId: string }>()
  const { forms, submitResponse } = useFormStore()

  // Find form definition or fallback
  const form = forms.find((f) => f.id === formId) || forms[0]

  const [answers, setAnswers] = useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {}
    form.fields.forEach((f) => {
      if (f.type === 'RATING') initial[f.id] = 5
      else initial[f.id] = ''
    })
    return initial
  })

  const [respondentName, setRespondentName] = useState('Current User')
  const [submitted, setSubmitted] = useState(false)

  const handleFieldValueChange = (fieldId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitResponse(form.id, respondentName, answers)
    setSubmitted(true)
    setTimeout(() => {
      navigate('/dashboard/forms')
    }, 2000)
  }

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-hairline shadow-sm text-center max-w-md mx-auto my-12 space-y-4">
        <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-ink">Form Response Submitted!</h2>
        <p className="text-xs text-muted">Thank you for submitting your response. Redirecting to forms catalog...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/dashboard/forms')}
        className="flex items-center gap-1 text-xs font-bold text-muted hover:text-ink cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Forms
      </button>

      <div className="bg-white p-6 rounded-2xl border border-hairline shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {form.category}
            </span>
            <span className="text-[11px] font-mono text-muted font-bold">ID: {form.id}</span>
          </div>

          <h1 className="text-2xl font-bold font-display text-ink mt-3">{form.title}</h1>
          <p className="text-xs text-muted mt-1 leading-relaxed">{form.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-hairline text-xs">
          <div>
            <label className="block text-ink font-bold mb-1">Your Name / Designation *</label>
            <input
              type="text"
              required
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none font-semibold text-ink"
            />
          </div>

          {form.fields.map((f, i) => (
            <div key={f.id} className="space-y-2 bg-wash/30 p-4 rounded-xl border border-hairline">
              <label className="block text-ink font-bold">
                {i + 1}. {f.label} {f.required && <span className="text-rose-500">*</span>}
              </label>

              {f.type === 'RATING' && (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => handleFieldValueChange(f.id, star)}
                      className={`p-2 rounded-lg border transition cursor-pointer ${
                        Number(answers[f.id] ?? 5) >= star
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'bg-white border-hairline text-muted'
                      }`}
                    >
                      <Star size={20} fill={Number(answers[f.id] ?? 5) >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-ink">{answers[f.id] ?? 5} / 5 Stars</span>
                </div>
              )}

              {f.type === 'TEXT' && (
                <input
                  type="text"
                  required={f.required}
                  value={String(answers[f.id] ?? '')}
                  onChange={(e) => handleFieldValueChange(f.id, e.target.value)}
                  placeholder="Your answer..."
                  className="w-full p-2.5 rounded-xl border border-hairline bg-white focus:border-indigo-500 focus:outline-none font-medium"
                />
              )}

              {f.type === 'TEXTAREA' && (
                <textarea
                  rows={3}
                  required={f.required}
                  value={String(answers[f.id] ?? '')}
                  onChange={(e) => handleFieldValueChange(f.id, e.target.value)}
                  placeholder="Your answer..."
                  className="w-full p-2.5 rounded-xl border border-hairline bg-white focus:border-indigo-500 focus:outline-none font-medium"
                />
              )}

              {f.type === 'FILE' && (
                <div className="p-4 bg-white border border-dashed border-hairline rounded-xl text-center space-y-2">
                  <Upload size={24} className="mx-auto text-indigo-500" />
                  <p className="font-bold text-ink">Upload Document / File</p>
                  <input
                    type="file"
                    onChange={(e) => handleFieldValueChange(f.id, e.target.files?.[0]?.name || 'Uploaded_Document.pdf')}
                    className="text-xs text-muted"
                  />
                </div>
              )}

              {f.type === 'DATE' && (
                <input
                  type="date"
                  required={f.required}
                  value={String(answers[f.id] ?? '')}
                  onChange={(e) => handleFieldValueChange(f.id, e.target.value)}
                  className="p-2.5 rounded-xl border border-hairline bg-white font-semibold text-ink"
                />
              )}

              {f.type === 'TOGGLE' && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleFieldValueChange(f.id, 'Yes')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      answers[f.id] === 'Yes' ? 'bg-emerald-600 text-white' : 'bg-white border border-hairline text-ink'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldValueChange(f.id, 'No')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      answers[f.id] === 'No' ? 'bg-slate-700 text-white' : 'bg-white border border-hairline text-ink'
                    }`}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Send size={15} /> Submit Response
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
