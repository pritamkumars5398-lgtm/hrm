import { useState } from 'react'
import { useParams, useNavigate } from 'react'
import { ArrowLeft, Send, CheckCircle2, Star } from 'lucide-react'

export default function FillFormPage() {
  const navigate = useNavigate()
  const { formId } = useParams()

  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      navigate('/dashboard/forms')
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-hairline shadow-sm text-center max-w-md mx-auto my-12 space-y-4">
        <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
        <h2 className="text-xl font-bold text-ink">Form Response Submitted!</h2>
        <p className="text-xs text-muted">Thank you for submitting your appraisal response. Redirecting to forms catalog...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xs font-bold text-muted hover:text-ink cursor-pointer"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white p-6 rounded-2xl border border-hairline shadow-sm space-y-6">
        <div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-wash text-ink border border-hairline">
            Form ID: {formId || 'form-1'}
          </span>
          <h1 className="text-xl font-bold font-display text-ink mt-2">Q3 2026 360-Degree Performance Appraisal</h1>
          <p className="text-xs text-muted mt-1">Please answer all required questions accurately for your performance cycle.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-hairline text-xs">
          <div>
            <label className="block text-ink font-bold mb-2">1. Overall Quarterly Performance Self-Rating (1 to 5 Stars) *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg border transition ${
                    rating >= star ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-wash border-hairline text-muted'
                  }`}
                >
                  <Star size={20} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="ml-2 font-bold text-ink">{rating} / 5 Rating</span>
            </div>
          </div>

          <div>
            <label className="block text-ink font-bold mb-2">2. Key Achievements & Highlights for Q3 *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe key projects delivered, metrics achieved, or milestones completed..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="w-full p-3 rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none"
            />
          </div>

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
