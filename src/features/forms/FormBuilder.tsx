import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormInput, Plus, Trash2, Save, ArrowLeft } from 'lucide-react'

type Field = {
  id: string
  label: string
  type: 'TEXT' | 'RATING' | 'SELECT' | 'TEXTAREA'
  required: boolean
}

export default function FormBuilder() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Appraisal')
  const [fields, setFields] = useState<Field[]>([
    { id: 'f-1', label: 'Overall Quarterly Performance Rating (1-5)', type: 'RATING', required: true },
    { id: 'f-2', label: 'Key Achievements & Completed Deliverables', type: 'TEXTAREA', required: true }
  ])

  const addField = () => {
    const newF: Field = {
      id: `f-${Date.now()}`,
      label: 'New Question / Rating Field',
      type: 'TEXT',
      required: true
    }
    setFields([...fields, newF])
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    navigate('/dashboard/forms')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/forms')}
          className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Forms
        </button>

        <h1 className="text-xl font-bold font-display text-ink">Custom Form & Appraisal Builder</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-hairline shadow-sm space-y-6">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-muted font-semibold mb-1">Form Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Leadership & Manager 360 Review"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-muted font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
            >
              <option value="Appraisal">Performance Appraisal</option>
              <option value="Survey">Pulse Survey</option>
              <option value="Feedback">360 Feedback</option>
              <option value="Onboarding">Onboarding Checklist</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-hairline">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink">Form Fields & Questions</h3>
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <Plus size={14} /> Add Field
            </button>
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
                onChange={e => {
                  const val = e.target.value
                  setFields(prev => prev.map(f => f.id === field.id ? { ...f, label: val } : f))
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none bg-white font-medium"
              />

              <div className="flex items-center gap-4 text-xs">
                <select
                  value={field.type}
                  onChange={e => {
                    const val = e.target.value as Field['type']
                    setFields(prev => prev.map(f => f.id === field.id ? { ...f, type: val } : f))
                  }}
                  className="px-2 py-1 rounded border border-hairline font-semibold text-ink bg-white"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="TEXTAREA">Paragraph Text</option>
                  <option value="RATING">Rating Scale (1-5)</option>
                  <option value="SELECT">Multiple Choice</option>
                </select>

                <label className="flex items-center gap-1 text-muted font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={e => {
                      const checked = e.target.checked
                      setFields(prev => prev.map(f => f.id === field.id ? { ...f, required: checked } : f))
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
            <Save size={16} /> Publish Form
          </button>
        </div>
      </form>
    </div>
  )
}
