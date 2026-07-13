import { useEffect, useState } from 'react'
import { AlertCircle, CalendarDays, Check, Loader2, Plus, X } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LeaveError, type LeaveRequest, type LeaveStatus } from '@/services/leaveService'
import { useLeaveStore } from './store/leaveStore'
import ApplyLeaveModal from './components/ApplyLeaveModal'
import {
  LEAVE_STATUS_LABEL,
  LEAVE_STATUS_TONE,
  LEAVE_TYPE_SHORT,
} from './labels'

const TABS: Array<{ key: LeaveStatus; label: string }> = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
]

const formatRange = (start: string, end: string) => {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const from = new Date(`${start}T00:00:00`).toLocaleDateString('en-GB', opts)
  if (start === end) return from
  const to = new Date(`${end}T00:00:00`).toLocaleDateString('en-GB', opts)
  return `${from} – ${to}`
}

function BalanceCard({ label, total, used }: { label: string; total: number; used: number }) {
  const remaining = Math.max(0, total - used)
  const pct = total === 0 ? 0 : Math.min(100, (used / total) * 100)

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] text-muted">{label}</p>
        <p className="tnum text-[11.5px] text-muted">
          {used}/{total}
        </p>
      </div>

      <p className="tnum font-display mt-2 text-[26px] leading-none font-semibold">
        {total === 0 ? '—' : remaining}
      </p>
      <p className="mt-1 text-[11.5px] text-muted">
        {total === 0 ? 'no allowance' : 'days left'}
      </p>

      {total > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-wash">
          <div className="h-full rounded-full bg-pine" style={{ width: `${pct}%` }} />
        </div>
      )}
    </Card>
  )
}

export default function LeavePage() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, load, apply, decide } = useLeaveStore()

  const [tab, setTab] = useState<LeaveStatus>('PENDING')
  const [applyOpen, setApplyOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const viewer = { role: user.role, name: user.name }

  useEffect(() => {
    void load(viewer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, user.role, user.name])

  const isLoading = status === 'loading'
  const visible = (data?.requests ?? []).filter((r) => r.status === tab)
  const approvableIds = new Set((data?.pendingApprovals ?? []).map((r) => r.id))

  const onDecide = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setBusyId(id)
    setActionError(null)

    try {
      await decide(viewer, id, decision)
    } catch (err) {
      setActionError(
        err instanceof LeaveError ? err.message : 'We could not record that decision.',
      )
    } finally {
      setBusyId(null)
    }
  }

  const renderRequest = (request: LeaveRequest) => {
    const canDecide = approvableIds.has(request.id)
    const busy = busyId === request.id
    const isMine = request.employeeName === user.name

    return (
      <li
        key={request.id}
        className="flex flex-wrap items-center gap-3 border-b border-hairline px-4 py-3.5 last:border-0"
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-wash text-[11px] font-semibold text-muted">
          {request.avatarInitials}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium">
            {request.employeeName}
            {isMine && <span className="ml-1.5 text-[12px] font-normal text-muted">(you)</span>}
          </p>
          <p className="tnum mt-0.5 truncate text-[12px] text-muted">
            {LEAVE_TYPE_SHORT[request.type]} · {formatRange(request.startDate, request.endDate)} ·{' '}
            {request.days} {request.days === 1 ? 'day' : 'days'}
          </p>
        </div>

        <p className="hidden max-w-48 truncate text-[12.5px] text-muted lg:block">
          {request.reason}
        </p>

        {canDecide ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void onDecide(request.id, 'APPROVED')}
              disabled={busy}
              className="inline-flex h-8 items-center gap-1.5 rounded-ctl bg-pine px-2.5 text-[12px] font-medium text-white transition-colors hover:bg-pine-deep disabled:opacity-50"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Approve
            </button>

            <button
              type="button"
              onClick={() => void onDecide(request.id, 'REJECTED')}
              disabled={busy}
              aria-label={`Decline ${request.employeeName}'s request`}
              className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-clay hover:text-clay disabled:opacity-50"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <Badge tone={LEAVE_STATUS_TONE[request.status]}>
            {LEAVE_STATUS_LABEL[request.status]}
          </Badge>
        )}
      </li>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            Leave
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            {data?.scope === 'team'
              ? 'Your balance, and the requests waiting on you.'
              : 'Balances, requests and who is off across the company.'}
          </p>
        </div>

        <Button onClick={() => setApplyOpen(true)}>
          <Plus size={15} />
          Request leave
        </Button>
      </div>

      {status === 'error' && (
        <Card className="mt-6 flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <div>
            <p className="text-[14px] font-medium text-clay">{error}</p>
            <button
              type="button"
              onClick={() => void load(viewer, { force: true })}
              className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {status !== 'error' && (
        <>
          {/* Balances */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading || !data
              ? [0, 1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-wash" />
                    <div className="mt-3 h-7 w-12 animate-pulse rounded bg-wash" />
                    <div className="mt-3 h-1.5 w-full animate-pulse rounded-full bg-wash" />
                  </Card>
                ))
              : data.balances.map((b) => (
                  <BalanceCard
                    key={b.type}
                    label={LEAVE_TYPE_SHORT[b.type]}
                    total={b.total}
                    used={b.used}
                  />
                ))}
          </div>

          {actionError && (
            <div
              role="alert"
              className="mt-4 flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3"
            >
              <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
              <p className="text-[13px] text-clay">{actionError}</p>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Requests */}
            <Card flush className="lg:col-span-2">
              <div className="flex items-center gap-1 border-b border-hairline px-2 py-2">
                {TABS.map((t) => {
                  const count = (data?.requests ?? []).filter((r) => r.status === t.key).length
                  const active = tab === t.key

                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      aria-pressed={active}
                      className={`rounded-ctl px-3 py-1.5 text-[13px] transition-colors ${
                        active
                          ? 'bg-pine-tint font-medium text-pine-deep'
                          : 'text-muted hover:bg-wash hover:text-ink'
                      }`}
                    >
                      {t.label}
                      {data && <span className="tnum ml-1.5 text-[12px]">{count}</span>}
                    </button>
                  )
                })}
              </div>

              {isLoading || !data ? (
                <ul>
                  {[0, 1, 2].map((i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 border-b border-hairline px-4 py-3.5 last:border-0"
                    >
                      <div className="size-8 shrink-0 animate-pulse rounded-full bg-wash" />
                      <div className="flex-1">
                        <div className="h-3.5 w-32 animate-pulse rounded bg-wash" />
                        <div className="mt-2 h-3 w-44 animate-pulse rounded bg-wash" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : visible.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <p className="text-[14px] font-medium">
                    Nothing {LEAVE_STATUS_LABEL[tab].toLowerCase()}
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted">
                    {tab === 'PENDING'
                      ? 'No requests are waiting on a decision.'
                      : `No ${LEAVE_STATUS_LABEL[tab].toLowerCase()} requests to show.`}
                  </p>
                </div>
              ) : (
                <ul>{visible.map(renderRequest)}</ul>
              )}
            </Card>

            {/* Who's off */}
            <Card flush>
              <div className="border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold">Who's off</h2>
                <p className="mt-0.5 text-[12px] text-muted">Approved leave, next 30 days</p>
              </div>

              {isLoading || !data ? (
                <ul>
                  {[0, 1].map((i) => (
                    <li key={i} className="border-b border-hairline px-4 py-3 last:border-0">
                      <div className="h-3.5 w-28 animate-pulse rounded bg-wash" />
                      <div className="mt-2 h-3 w-20 animate-pulse rounded bg-wash" />
                    </li>
                  ))}
                </ul>
              ) : data.upcoming.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-wash">
                    <CalendarDays size={16} className="text-muted" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-[13.5px] font-medium">Everyone's in</p>
                  <p className="mt-1 text-[12.5px] text-muted">
                    No approved leave in the next 30 days.
                  </p>
                </div>
              ) : (
                <ul>
                  {data.upcoming.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-0"
                    >
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-tint text-[10px] font-semibold text-pine-deep">
                        {r.avatarInitials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{r.employeeName}</p>
                        <p className="tnum mt-0.5 text-[11.5px] text-muted">
                          {formatRange(r.startDate, r.endDate)} · {r.days}d
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      <ApplyLeaveModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        balances={data?.balances ?? []}
        onApply={(payload) => apply(viewer, payload)}
      />
    </div>
  )
}
