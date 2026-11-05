import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useFormStore } from './store/formStore'

export default function MyFormsPage() {
  const user = useAuthStore((s) => s.user)!
  const { forms, loading, fetchForms, hasUserSubmitted } = useFormStore()

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <h1 className="text-2xl font-bold font-display">My Assigned Forms & Appraisals</h1>
        <p className="text-slate-300 text-sm mt-1">Complete your pending performance reviews and workplace surveys.</p>
      </div>

      {loading && <p className="text-[13px] text-muted">Loading forms…</p>}

      {!loading && forms.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-hairline text-center text-[13px] text-muted">
          No forms have been published for you yet.
        </div>
      )}

      <div className="space-y-4">
        {forms.map((f) => {
          const submitted = Boolean(hasUserSubmitted(f.id, user.name))

          return (
            <div key={f.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-ink">{f.title}</h3>
                <p className="text-xs text-muted mt-1">
                  {f.category} · Published {String(f.createdAt).slice(0, 10)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  submitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {submitted ? 'SUBMITTED' : 'PENDING'}
                </span>

                {!submitted && (
                  <Link
                    to={`/dashboard/forms/fill/${f.id}`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs"
                  >
                    Fill Form
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
