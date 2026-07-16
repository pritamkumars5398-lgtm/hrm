import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Target,
  TrendingUp,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Search,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import Drawer from '@/shared/components/Drawer'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { PerformanceRecord } from '@/services/performanceService'
import { usePerformanceStore } from './store/performanceStore'

const getAvatarTheme = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const themes = [
    { bg: 'bg-emerald-50 text-emerald-800 border-emerald-100/50' },
    { bg: 'bg-clay-tint text-clay-deep border-clay/20' },
    { bg: 'bg-ochre-tint text-ochre-deep border-ochre/20' },
    { bg: 'bg-wash text-ink border-hairline-strong' },
  ]
  return themes[hash % themes.length]
}

/** 5 stars, filled to the rating. */
function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-[11.5px] font-medium text-muted bg-wash px-2 py-0.5 rounded-full">Pending</span>
  }

  return (
    <span className="flex items-center gap-1.5" aria-label={`${rating} out of 5`}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={12}
            className={n <= rating ? 'text-ochre fill-ochre' : 'text-hairline'}
          />
        ))}
      </span>
      <span className="tnum text-[11.5px] font-bold text-ink bg-ochre-tint px-2 py-0.2 rounded-full border border-ochre/15">
        {rating}.0
      </span>
    </span>
  )
}

type PerformanceStatType = 'reviewed' | 'pending' | 'rating' | 'goals'

function StatCard({
  type,
  icon: Icon,
  label,
  value,
  hint,
}: {
  type: PerformanceStatType
  icon: typeof Star
  label: string
  value: string
  hint?: string
}) {
  const configs = {
    reviewed: {
      bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
      glow: 'hover:shadow-[0_4px_20px_rgba(16,185,129,0.08)] hover:border-emerald-500/20',
      sparkline: 'emerald',
    },
    pending: {
      bg: 'bg-clay-tint text-clay border border-clay/20',
      glow: 'hover:shadow-[0_0_20px_rgba(156,66,33,0.1)] hover:border-clay/30',
      sparkline: 'orange',
    },
    rating: {
      bg: 'bg-ochre-tint text-ochre-deep border border-ochre/20',
      glow: 'hover:shadow-[0_0_20px_rgba(169,121,28,0.1)] hover:border-ochre/30',
      sparkline: 'purple',
    },
    goals: {
      bg: 'bg-teal-50/80 text-teal-600 border border-teal-100/50',
      glow: 'hover:shadow-[0_0_20px_rgba(13,148,136,0.1)] hover:border-teal-500/30',
      sparkline: 'teal',
    },
  }[type]

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={`relative p-4 h-[155px] flex flex-col justify-between transition-all duration-300 border border-hairline overflow-hidden hover:shadow-lg ${configs.glow}`}>
        <div className="flex items-start justify-between w-full">
          <div className={`p-2.5 rounded-full shrink-0 flex items-center justify-center ${configs.bg}`}>
            <Icon size={16} aria-hidden="true" />
          </div>
          <button type="button" className="text-muted hover:text-ink transition-colors p-1 rounded-ctl hover:bg-wash cursor-pointer">
            <MoreVertical size={16} />
          </button>
        </div>
        
        <div className="min-w-0 flex-1 mt-3">
          <p className="text-[11px] text-muted font-bold uppercase tracking-wider leading-none">{label}</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="tnum font-display text-[26px] leading-none font-bold text-ink">
              {value}
            </p>
            {hint && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-hairline/40 bg-wash/50 text-muted leading-none">
                {hint}
              </span>
            )}
          </div>
        </div>

        {/* Sparkline Graph */}
        <div className="absolute bottom-0 inset-x-0 h-10 overflow-hidden pointer-events-none rounded-b-card">
          {configs.sparkline === 'teal' && (
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spark-teal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0,26 C 15,28 30,14 45,16 C 60,18 75,6 90,8 C 95,9 98,4 100,3" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0,26 C 15,28 30,14 45,16 C 60,18 75,6 90,8 C 95,9 98,4 100,3 L 100,30 L 0,30 Z" fill="url(#spark-teal)" />
              <circle cx="100" cy="3" r="1.5" fill="#0d9488" />
            </svg>
          )}
          {configs.sparkline === 'emerald' && (
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spark-emerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0,16 C 10,8 20,24 30,16 C 40,8 50,24 60,16 C 70,8 80,24 90,16 C 95,12 98,16 100,12" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0,16 C 10,8 20,24 30,16 C 40,8 50,24 60,16 C 70,8 80,24 90,16 C 95,12 98,16 100,12 L 100,30 L 0,30 Z" fill="url(#spark-emerald)" />
              <circle cx="100" cy="12" r="1.5" fill="#10b981" />
            </svg>
          )}
          {configs.sparkline === 'orange' && (
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spark-orange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0,28 C 15,28 30,28 45,12 C 55,4 65,22 80,24 C 90,25 97,27 100,28" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0,28 C 15,28 30,28 45,12 C 55,4 65,22 80,24 C 90,25 97,27 100,28 L 100,30 L 0,30 Z" fill="url(#spark-orange)" />
              <circle cx="100" cy="28" r="1.5" fill="#f97316" />
            </svg>
          )}
          {configs.sparkline === 'purple' && (
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spark-purple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0,14 C 15,12 30,22 45,18 C 60,10 75,8 90,6 C 95,5 98,6 100,5" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0,14 C 15,12 30,22 45,18 C 60,10 75,8 90,6 C 95,5 98,6 100,5 L 100,30 L 0,30 Z" fill="url(#spark-purple)" />
              <circle cx="100" cy="5" r="1.5" fill="#8b5cf6" />
            </svg>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function ReviewDrawer({
  record,
  onClose,
  role,
  viewerName,
}: {
  record: PerformanceRecord | null
  onClose: () => void
  role: string
  viewerName: string
}) {
  const { submitReview } = usePerformanceStore()
  const [submitting, setSubmitting] = useState(false)
  const [ratingInput, setRatingInput] = useState(5)
  const [summaryInput, setSummaryInput] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Reset review form when record changes
  useEffect(() => {
    setRatingInput(5)
    setSummaryInput('')
    setSubmitError(null)
  }, [record])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return
    if (!summaryInput.trim()) {
      setSubmitError('Please enter a review summary.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await submitReview(role as any, viewerName, record.id, {
        rating: ratingInput,
        summary: summaryInput,
      })
      onClose()
    } catch {
      setSubmitError('We could not submit that appraisal review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={record !== null}
      onClose={onClose}
      title={record?.employeeName ?? 'Performance'}
      subtitle={record?.designation}
    >
      {record && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Rating overview card */}
          <div className="flex items-center justify-between rounded-card border border-hairline bg-surface p-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted">Current rating</p>
              <div className="mt-2">
                <RatingStars rating={record.rating} />
              </div>
            </div>
            {record.previousRating !== null && record.rating !== null && (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted">vs. last cycle</p>
                <div className="mt-2 flex items-center justify-end gap-1">
                  {record.rating >= record.previousRating ? (
                    <TrendingUp size={14} className="text-pine" />
                  ) : (
                    <TrendingDown size={14} className="text-clay" />
                  )}
                  <p
                    className={`tnum text-[13.5px] font-bold ${
                      record.rating >= record.previousRating ? 'text-pine' : 'text-clay-deep'
                    }`}
                  >
                    {record.rating >= record.previousRating ? '+' : ''}
                    {(record.rating - record.previousRating).toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Goals section */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase border-b border-hairline pb-1.5 flex justify-between items-center">
              <span>Goals</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100/40 px-2 py-0.5 rounded-full lowercase">tracked</span>
            </h3>
            
            <div className="space-y-4 bg-surface border border-hairline rounded-ctl p-4">
              {record.goals.map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] font-semibold text-ink">{goal.title}</p>
                    <p className="tnum shrink-0 text-[12px] font-bold text-emerald-600">{goal.progress}%</p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-wash/80 border border-hairline/25">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Complete Review Form (if pending review) */}
          {record.rating === null && (
            <section className="bg-surface border border-hairline rounded-ctl p-4 space-y-4">
              <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase border-b border-hairline pb-1.5 flex justify-between items-center">
                <span>Complete Review</span>
                <span className="text-[10px] text-ochre-deep font-medium bg-ochre-tint px-1.5 py-0.2 rounded-full lowercase">required</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="flex gap-2 rounded-ctl border border-clay/35 bg-clay/5 p-3 text-[12px] text-clay-deep">
                    <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
                    <p>{submitError}</p>
                  </div>
                )}

                {/* Rating Input */}
                <div className="space-y-1.5">
                  <span className="text-[11.5px] font-semibold text-muted block">Select Rating Score</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRatingInput(n)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <Star
                          size={20}
                          className={n <= ratingInput ? 'text-ochre fill-ochre' : 'text-hairline-strong'}
                        />
                      </button>
                    ))}
                    <span className="tnum text-[12px] font-bold text-ink bg-ochre-tint px-2 py-0.5 rounded-full ml-1 border border-ochre/15">
                      {ratingInput}.0
                    </span>
                  </div>
                </div>

                {/* Feedback Input */}
                <div className="space-y-1.5">
                  <label htmlFor="summary" className="text-[11.5px] font-semibold text-muted block">
                    Review Comments / Appraisal Summary
                  </label>
                  <textarea
                    id="summary"
                    value={summaryInput}
                    onChange={(e) => setSummaryInput(e.target.value)}
                    placeholder="e.g. Consistent delivery, took ownership of projects, and collaborated efficiently with product teams."
                    className="w-full h-24 rounded-ctl border border-hairline-strong bg-surface p-2.5 text-[13px] text-ink transition-colors hover:border-muted/50 focus:border-pine focus:outline-none placeholder:text-muted/50"
                  />
                </div>

                 <div className="flex justify-end gap-2 border-t border-hairline pt-3.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting}
                    className="font-bold shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Submit Appraisal'
                    )}
                  </Button>
                </div>
              </form>
            </section>
          )}

          {/* Review History */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase border-b border-hairline pb-1.5 flex justify-between items-center">
              <span>Review history</span>
              <span className="text-[10px] text-ochre-deep font-medium bg-ochre-tint px-1.5 py-0.2 rounded-full lowercase">archive</span>
            </h3>

            {record.reviews.length === 0 ? (
              <div className="px-4 py-8 text-center bg-wash/30 rounded-ctl border border-hairline">
                <p className="text-[13px] text-muted font-medium">No reviews yet for this person.</p>
              </div>
            ) : (
              <ul className="space-y-3.5">
                {record.reviews.map((review) => {
                  const reviewerTheme = getAvatarTheme(review.reviewer)
                  return (
                    <li key={review.id} className="rounded-card border border-hairline bg-surface p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-hairline pb-2">
                        <p className="text-[13.5px] font-bold text-ink">{review.cycle}</p>
                        <RatingStars rating={review.rating} />
                      </div>
                      
                      <p className="text-[13px] leading-relaxed text-ink italic bg-wash/20 border-l-2 border-hairline-strong pl-3 py-0.5">
                        "{review.summary}"
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <span className={`inline-flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold ${reviewerTheme.bg}`}>
                          {review.reviewer.split(' ').map(n => n[0]).join('')}
                        </span>
                        <p className="text-[11.5px] text-muted font-medium">
                          Reviewed by <span className="text-ink">{review.reviewer}</span>
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </motion.div>
      )}
    </Drawer>
  )
}

export default function PerformancePage() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, load } = usePerformanceStore()
  const [open, setOpen] = useState<PerformanceRecord | null>(null)
  
  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'REVIEWED' | 'PENDING'>('ALL')

  useEffect(() => {
    void load(user.role, user.name)
  }, [load, user.role, user.name])

  const isLoading = status === 'loading' || !data
  const maxCount = data ? Math.max(1, ...data.distribution.map((d) => d.count)) : 1

  // Filter records based on inputs
  const visibleRecords = (data?.records ?? []).filter((r) => {
    const matchesSearch = r.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    if (filterStatus === 'REVIEWED') return matchesSearch && r.rating !== null
    if (filterStatus === 'PENDING') return matchesSearch && r.rating === null
    return matchesSearch
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              Performance
            </h1>
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
              <Sparkles size={13} />
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-muted">
            {data?.scope === 'team'
              ? `Your team's goals and reviews — ${data.cycle}.`
              : `Ratings, goals and appraisals — ${data?.cycle ?? 'current cycle'}.`}
          </p>
        </div>
      </div>

      {status === 'error' && (
        <Card className="mt-6 flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <div>
            <p className="text-[14px] font-medium text-clay">{error}</p>
            <button
              type="button"
              onClick={() => void load(user.role, user.name, { force: true })}
              className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {status !== 'error' && (
        <>
          {/* Stat summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              [0, 1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-wash" />
                  <div className="mt-3 h-7 w-14 animate-pulse rounded bg-wash" />
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  type="reviewed"
                  icon={CheckCircle2}
                  label="Reviewed"
                  value={String(data.summary.reviewed)}
                  hint={`of ${data.records.length} this cycle`}
                />
                <StatCard
                  type="pending"
                  icon={Clock}
                  label="Awaiting review"
                  value={String(data.summary.pending)}
                  hint="not started yet"
                />
                <StatCard
                  type="rating"
                  icon={Star}
                  label="Average rating"
                  value={data.summary.avgRating.toFixed(1)}
                  hint="out of 5"
                />
                <StatCard
                  type="goals"
                  icon={Target}
                  label="Goal progress"
                  value={`${data.summary.avgGoalProgress}%`}
                  hint="average across all goals"
                />
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* People directory card */}
            <Card flush className="lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="border-b border-hairline px-4 py-3 flex items-center justify-between">
                  <h2 className="text-[13px] font-semibold text-ink">
                    People Directory
                    {data && (
                      <span className="tnum ml-1.5 font-normal text-muted bg-wash px-2 py-0.5 rounded-full text-[11px]">
                        {visibleRecords.length} of {data.records.length}
                      </span>
                    )}
                  </h2>
                </div>

                {/* Inline Directory Search & Filtering */}
                {data && (
                  <div className="flex flex-col sm:flex-row gap-3 border-b border-hairline px-4 py-3 bg-wash/10">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-2.5 text-muted" />
                      <input
                        type="text"
                        placeholder="Search by employee name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-ctl border border-hairline-strong bg-surface text-[12.5px] transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 placeholder:text-muted/50 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1 border border-hairline bg-surface rounded-ctl p-0.5">
                      {(['ALL', 'REVIEWED', 'PENDING'] as const).map((filter) => {
                        const label = { ALL: 'All', REVIEWED: 'Reviewed', PENDING: 'Pending' }[filter]
                        const isActive = filterStatus === filter
                        return (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setFilterStatus(filter)}
                            className={`px-2.5 py-1 text-[11.5px] font-semibold rounded-ctl transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100/50 font-bold shadow-sm'
                                : 'text-muted hover:text-ink hover:bg-wash border border-transparent'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <ul>
                    {[0, 1, 2, 3].map((i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 border-b border-hairline px-4 py-3.5 last:border-0"
                      >
                        <div className="size-8 shrink-0 animate-pulse rounded-full bg-wash" />
                        <div className="flex-1">
                          <div className="h-3.5 w-32 animate-pulse rounded bg-wash" />
                          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-wash" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : visibleRecords.length === 0 ? (
                  <div className="px-4 py-16 text-center">
                    <p className="text-[14px] font-medium text-ink">No matching records</p>
                    <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-relaxed text-muted">
                      Try updating your search query or switching your status filter.
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-[32rem] overflow-y-auto divide-y divide-hairline">
                    <AnimatePresence initial={false}>
                      {visibleRecords.map((record) => {
                        const avatarTheme = getAvatarTheme(record.employeeName)
                        const avgGoal =
                          record.goals.length === 0
                            ? 0
                            : Math.round(
                                record.goals.reduce((s, g) => s + g.progress, 0) / record.goals.length,
                              )

                        return (
                          <motion.li
                            key={record.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <button
                              type="button"
                              onClick={() => setOpen(record)}
                              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-wash/50 cursor-pointer"
                            >
                              <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${avatarTheme.bg}`}>
                                {record.avatarInitials}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-1">
                                  <p className="truncate text-[13.5px] font-semibold text-ink">
                                    {record.employeeName}
                                  </p>
                                  <span className="tnum text-[11.5px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100/30 px-2.5 py-0.5 rounded-full">{avgGoal}% goals</span>
                                </div>
                                
                                <div className="mt-2 flex items-center justify-between gap-2 max-w-xs">
                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash/80 border border-hairline/25">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                      style={{ width: `${avgGoal}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 pl-3">
                                {record.rating === null ? (
                                  <Badge tone="warning">Pending</Badge>
                                ) : (
                                  <RatingStars rating={record.rating} />
                                )}
                                <ChevronRight size={15} className="text-muted shrink-0" />
                              </div>
                            </button>
                          </motion.li>
                        )
                      })}
                    </AnimatePresence>
                  </ul>
                )}
              </div>
            </Card>

            {/* Distribution chart card */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-muted" aria-hidden="true" />
                  <h2 className="text-[13px] font-semibold text-ink">Rating distribution</h2>
                </div>
                <p className="mt-1 text-[12px] text-muted">Reviewed people, this cycle</p>

                {isLoading ? (
                  <div className="mt-5 space-y-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 animate-pulse rounded bg-wash" />
                    ))}
                  </div>
                ) : (
                  <ul className="mt-5 space-y-3.5">
                    {[...data.distribution].reverse().map((bucket) => (
                      <li key={bucket.rating} className="flex items-center gap-3">
                        <span className="tnum w-3 shrink-0 text-[12px] font-bold text-ink">
                          {bucket.rating}★
                        </span>
                        <div className="h-4 flex-1 overflow-hidden rounded-[3px] bg-wash border border-hairline/40">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(bucket.count / maxCount) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-[3px] bg-gradient-to-r from-emerald-400 to-emerald-600 transition-[width]"
                            style={{
                              opacity: 0.45 + (bucket.rating / 5) * 0.55,
                            }}
                          />
                        </div>
                        <span className="tnum w-5 shrink-0 text-right text-[12px] text-muted font-bold">
                          {bucket.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!isLoading && (
                <div className="mt-6 bg-ochre-tint/40 border border-ochre/15 rounded-ctl p-3 text-[11.5px] text-ochre-deep leading-relaxed">
                  <strong>Bell curve summary:</strong> Ratings are normally distributed around the average rating of {data.summary.avgRating.toFixed(1)}★.
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      <ReviewDrawer
        record={open}
        onClose={() => setOpen(null)}
        role={user.role}
        viewerName={user.name}
      />
    </motion.div>
  )
}
