import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, Star, Target, TrendingUp } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import Drawer from '@/shared/components/Drawer'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { PerformanceRecord } from '@/services/performanceService'
import { usePerformanceStore } from './store/performanceStore'

/** 5 dots, filled to the rating. A number alone doesn't show the scale. */
function RatingDots({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-[12px] text-muted">Not reviewed</span>
  }

  return (
    <span className="flex items-center gap-1" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          className={`size-1.5 rounded-full ${n <= rating ? 'bg-pine' : 'bg-hairline'}`}
        />
      ))}
      <span className="tnum ml-1 text-[12px] font-medium">{rating}.0</span>
    </span>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Star
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-muted" aria-hidden="true" />
        <p className="text-[12px] text-muted">{label}</p>
      </div>
      <p className="tnum font-display mt-2 text-[26px] leading-none font-semibold">{value}</p>
      {hint && <p className="mt-2 text-[12px] text-muted">{hint}</p>}
    </Card>
  )
}

function ReviewDrawer({
  record,
  onClose,
}: {
  record: PerformanceRecord | null
  onClose: () => void
}) {
  return (
    <Drawer
      open={record !== null}
      onClose={onClose}
      title={record?.employeeName ?? 'Performance'}
      subtitle={record?.designation}
    >
      {record && (
        <div className="space-y-7">
          <div className="flex items-center justify-between rounded-card border border-hairline bg-surface p-4">
            <div>
              <p className="text-[12px] text-muted">Current rating</p>
              <div className="mt-1.5">
                <RatingDots rating={record.rating} />
              </div>
            </div>
            {record.previousRating !== null && record.rating !== null && (
              <div className="text-right">
                <p className="text-[12px] text-muted">vs. last cycle</p>
                <p
                  className={`tnum mt-1 text-[13px] font-medium ${
                    record.rating >= record.previousRating ? 'text-pine' : 'text-clay'
                  }`}
                >
                  {record.rating >= record.previousRating ? '+' : ''}
                  {record.rating - record.previousRating}
                </p>
              </div>
            )}
          </div>

          <section>
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Goals
            </h3>
            <div className="space-y-4">
              {record.goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] font-medium">{goal.title}</p>
                    <p className="tnum shrink-0 text-[12px] text-muted">{goal.progress}%</p>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-wash">
                    <div
                      className="h-full rounded-full bg-pine"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Review history
            </h3>

            {record.reviews.length === 0 ? (
              <p className="text-[13px] text-muted">No reviews yet for this person.</p>
            ) : (
              <ul className="space-y-3">
                {record.reviews.map((review) => (
                  <li key={review.id} className="rounded-card border border-hairline bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium">{review.cycle}</p>
                      <RatingDots rating={review.rating} />
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                      {review.summary}
                    </p>
                    <p className="mt-2 text-[11.5px] text-muted">
                      Reviewed by {review.reviewer}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Drawer>
  )
}

export default function PerformancePage() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, load } = usePerformanceStore()
  const [open, setOpen] = useState<PerformanceRecord | null>(null)

  useEffect(() => {
    void load(user.role, user.name)
  }, [load, user.role, user.name])

  const isLoading = status === 'loading' || !data
  const maxCount = data ? Math.max(1, ...data.distribution.map((d) => d.count)) : 1

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            Performance
          </h1>
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  icon={CheckCircle2}
                  label="Reviewed"
                  value={String(data.summary.reviewed)}
                  hint={`of ${data.records.length} this cycle`}
                />
                <StatCard
                  icon={Clock}
                  label="Awaiting review"
                  value={String(data.summary.pending)}
                  hint="not started yet"
                />
                <StatCard
                  icon={Star}
                  label="Average rating"
                  value={data.summary.avgRating.toFixed(1)}
                  hint="out of 5"
                />
                <StatCard
                  icon={Target}
                  label="Goal progress"
                  value={`${data.summary.avgGoalProgress}%`}
                  hint="average across all goals"
                />
              </>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* People */}
            <Card flush className="lg:col-span-2">
              <div className="border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold">
                  People
                  {data && (
                    <span className="tnum ml-1.5 font-normal text-muted">
                      {data.records.length}
                    </span>
                  )}
                </h2>
              </div>

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
              ) : data.records.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <p className="text-[14px] font-medium">Nobody reports to you yet</p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted">
                    People assigned to you will appear here at review time.
                  </p>
                </div>
              ) : (
                <ul className="max-h-[32rem] overflow-y-auto">
                  {data.records.map((record) => {
                    const avgGoal =
                      record.goals.length === 0
                        ? 0
                        : Math.round(
                            record.goals.reduce((s, g) => s + g.progress, 0) / record.goals.length,
                          )

                    return (
                      <li key={record.id}>
                        <button
                          type="button"
                          onClick={() => setOpen(record)}
                          className="flex w-full items-center gap-3 border-b border-hairline px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-wash"
                        >
                          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-wash text-[11px] font-semibold text-muted">
                            {record.avatarInitials}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-medium">
                              {record.employeeName}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="h-1 w-20 overflow-hidden rounded-full bg-wash">
                                <div
                                  className="h-full rounded-full bg-pine"
                                  style={{ width: `${avgGoal}%` }}
                                />
                              </div>
                              <span className="tnum text-[11px] text-muted">{avgGoal}% goals</span>
                            </div>
                          </div>

                          {record.rating === null ? (
                            <Badge tone="warning">Pending</Badge>
                          ) : (
                            <RatingDots rating={record.rating} />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>

            {/* Distribution */}
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-muted" aria-hidden="true" />
                <h2 className="text-[13px] font-semibold">Rating distribution</h2>
              </div>
              <p className="mt-1 text-[12px] text-muted">Reviewed people, this cycle</p>

              {isLoading ? (
                <div className="mt-5 space-y-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-wash" />
                  ))}
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {[...data.distribution].reverse().map((bucket) => (
                    <li key={bucket.rating} className="flex items-center gap-3">
                      <span className="tnum w-3 shrink-0 text-[12px] font-medium">
                        {bucket.rating}
                      </span>
                      <div className="h-4 flex-1 overflow-hidden rounded-[3px] bg-wash">
                        <div
                          className="h-full rounded-[3px] bg-pine transition-[width]"
                          style={{
                            width: `${(bucket.count / maxCount) * 100}%`,
                            opacity: 0.45 + (bucket.rating / 5) * 0.55,
                          }}
                        />
                      </div>
                      <span className="tnum w-5 shrink-0 text-right text-[12px] text-muted">
                        {bucket.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      <ReviewDrawer record={open} onClose={() => setOpen(null)} />
    </div>
  )
}
