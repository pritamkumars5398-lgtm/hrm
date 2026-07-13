import { useEffect } from 'react'
import { AlertCircle, Banknote, CalendarDays, RotateCw, Target, UserPlus } from 'lucide-react'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useDashboardStore } from './store/dashboardStore'
import type { ActivityItem } from '@/services/dashboardService'

const ACTIVITY_ICON = {
  leave: CalendarDays,
  payroll: Banknote,
  employee: UserPlus,
  performance: Target,
} as const

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function StatSkeleton() {
  return (
    <div className="rounded-card border border-hairline bg-surface p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-wash" />
      <div className="mt-3 h-7 w-16 animate-pulse rounded bg-wash" />
      <div className="mt-2.5 h-3 w-24 animate-pulse rounded bg-wash" />
    </div>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = ACTIVITY_ICON[item.kind]

  return (
    <li className="flex gap-3 border-b border-hairline px-4 py-3.5 last:border-0">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-tint">
        <Icon size={13} className="text-pine" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[13.5px] leading-snug font-medium">{item.title}</p>
        <p className="tnum mt-0.5 text-[12px] text-muted">{item.meta}</p>
      </div>
    </li>
  )
}

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, load } = useDashboardStore()

  useEffect(() => {
    void load(user.role)
  }, [load, user.role])

  const firstName = user.name.split(' ')[0]
  const greeting = greetingFor(new Date().getHours())

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            Here's what needs your attention today.
          </p>
        </div>

        {status === 'ready' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void load(user.role, { force: true })}
          >
            <RotateCw size={14} />
            Refresh
          </Button>
        )}
      </div>

      {status === 'error' && (
        <div className="mt-6 flex items-start gap-3 rounded-card border border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <div>
            <p className="text-[14px] font-medium text-clay">{error}</p>
            <button
              type="button"
              onClick={() => void load(user.role, { force: true })}
              className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {status !== 'error' && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {status === 'ready' && data
              ? data.stats.map((stat) => (
                  <div key={stat.id} className="rounded-card border border-hairline bg-surface p-4">
                    <p className="text-[12px] text-muted">{stat.label}</p>
                    <p className="tnum font-display mt-1.5 text-[26px] leading-none font-semibold">
                      {stat.value}
                    </p>
                    {stat.delta && (
                      <p className="tnum mt-2 text-[12px] text-pine">{stat.delta}</p>
                    )}
                  </div>
                ))
              : [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)}
          </div>

          <div className="mt-6 overflow-hidden rounded-card border border-hairline bg-surface">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="text-[13px] font-semibold">Recent activity</h2>
            </div>

            {status === 'ready' && data ? (
              data.activity.length > 0 ? (
                <ul>
                  {data.activity.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-12 text-center">
                  <p className="text-[14px] font-medium">Nothing to catch up on</p>
                  <p className="mt-1 text-[13px] text-muted">
                    Activity from your team will show up here.
                  </p>
                </div>
              )
            ) : (
              <ul>
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex gap-3 border-b border-hairline px-4 py-3.5 last:border-0">
                    <div className="size-7 shrink-0 animate-pulse rounded-full bg-wash" />
                    <div className="flex-1">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-wash" />
                      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-wash" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
