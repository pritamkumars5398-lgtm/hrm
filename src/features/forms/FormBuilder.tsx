import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormInput, Plus, Trash2, Save, ArrowLeft, Eye, Star, CheckCircle } from 'lucide-react'
import { useFormStore, type FormField, type FormFieldType } from './store/formStore'

export default function FormBuilder() {
  const navigate = useNavigate()
  const addForm = useFormStore((s) => s.addForm)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'Appraisal' | 'Survey' | 'Feedback' | 'Onboarding'>('Appraisal')

  const [fields, setFields] = useState<FormField[]>([
    { id: 'f-1', label: 'Overall Quarterly Performance Rating (1-5)', type: 'RATING', required: true },
    { id: 'f-2', label: 'Key Achievements & Delivered Deliverables', type: 'TEXTAREA', required: true },
    { id: 'f-3', label: 'Upload Proof / Portfolio Document (PDF/ZIP)', type: 'FILE', required: false },
  ])

  const [showPreview, setShowPreview] = useState(false)

  const addField = (type: FormFieldType = 'TEXT') => {
    const newF: FormField = {
      id: `f-${Date.now()}`,
      label: 'New Question / Survey Question',
      type,
      required: true,
    }
    setFields([...fields, newF])
  }

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addForm({
      title,
      description: description || 'Custom feedback & performance review form.',
      category,
      fields,
    })

    navigate('/dashboard/forms')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/forms')}
          className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Forms
        </button>

        <h1 className="text-xl font-bold font-display text-ink">Custom Drag & Drop Form Builder</h1>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline bg-surface text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
        >
          <Eye size={15} /> {showPreview ? 'Hide Preview' : 'Live Preview'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Creator Left/Main */}
        <form onSubmit={handleSave} className={`space-y-6 bg-white p-6 rounded-2xl border border-hairline shadow-sm ${showPreview ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-ink font-bold mb-1">Form Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Q3 Leadership & Manager 360 Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-muted font-semibold mb-1">Description / Instructions</label>
              <input
                type="text"
                placeholder="e.g. Please fill out your achievements before the end of the performance cycle."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-muted font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full px-3 py-2 rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none font-semibold text-ink"
              >
                <option value="Appraisal">Performance Appraisal</option>
                <option value="Survey">Pulse Survey</option>
                <option value="Feedback">360 Feedback</option>
                <option value="Onboarding">Onboarding Checklist</option>
              </select>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4 pt-4 border-t border-hairline">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink">Form Fields ({fields.length})</h3>

              {/* Add Field Types Dropdown buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => addField('TEXT')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] hover:bg-indigo-100 transition"
                >
                  + Text
                </button>
                <button
                  type="button"
                  onClick={() => addField('RATING')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-[11px] hover:bg-amber-100 transition"
                >
                  + Rating
                </button>
                <button
                  type="button"
                  onClick={() => addField('FILE')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100 transition"
                >
                  + File
                </button>
              </div>
            </div>

            {fields.map((field, idx) => (
              <div key={field.id} className="p-4 rounded-xl border border-hairline bg-wash/30 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-xs text-indigo-600">Question #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const val = e.target.value
                    setFields((prev) => prev.map((f) => (f.id === field.id ? { ...f, label: val } : f)))
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none bg-white font-semibold text-ink"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted font-bold uppercase">Type:</span>
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const val = e.target.value as FormFieldType
                        setFields((prev) => prev.map((f) => (f.id === field.id ? { ...f, type: val } : f)))
                      }}
                      className="px-2 py-1 rounded border border-hairline font-semibold text-ink bg-white text-xs"
                    >
                      <option value="TEXT">Short Text</option>
                      <option value="TEXTAREA">Paragraph Text</option>
                      <option value="RATING">Rating Scale (1-5)</option>
                      <option value="SELECT">Multiple Choice</option>
                      <option value="FILE">File Upload</option>
                      <option value="DATE">Date Picker</option>
                      <option value="TOGGLE">Yes/No Toggle</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 text-muted font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setFields((prev) => prev.map((f) => (f.id === field.id ? { ...f, required: checked } : f)))
                      }}
                    />
                    Required
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-hairline flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Save size={16} /> Save & Publish Form
            </button>
          </div>
        </form>

        {/* Live Preview Side Panel */}
        {showPreview && (
          <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-6 sticky top-4 self-start">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Live Candidate / ESS Preview</span>
              <h2 className="text-lg font-bold mt-1">{title || 'Untitled Form'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{description || 'No description provided.'}</p>
            </div>

            <div className="space-y-4 text-xs">
              {fields.map((f, i) => (
                <div key={f.id} className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                  <label className="block font-bold text-slate-200">
                    {i + 1}. {f.label} {f.required && <span className="text-rose-400">*</span>}
                  </label>

                  {f.type === 'RATING' && (
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}

                  {f.type === 'TEXT' && (
                    <input type="text" disabled placeholder="Short text answer..." className="w-full p-2 bg-slate-900 rounded-lg text-xs text-slate-400 border border-slate-700" />
                  )}

                  {f.type === 'TEXTAREA' && (
                    <textarea rows={2} disabled placeholder="Detailed answer..." className="w-full p-2 bg-slate-900 rounded-lg text-xs text-slate-400 border border-slate-700" />
                  )}

                  {f.type === 'FILE' && (
                    <div className="p-3 bg-slate-900 border border-dashed border-slate-700 rounded-lg text-center text-slate-400 text-xs font-semibold">
                      Drag & Drop PDF or File Upload
                    </div>
                  )}

                  {f.type === 'TOGGLE' && (
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="px-3 py-1 bg-emerald-600 rounded-md">Yes</span>
                      <span className="px-3 py-1 bg-slate-700 rounded-md">No</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
