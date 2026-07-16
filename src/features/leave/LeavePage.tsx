import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  Check,
  Loader2,
  Plus,
  X,
  Sun,
  Activity,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LeaveError, type LeaveRequest, type LeaveStatus, type LeaveType } from '@/services/leaveService'
import { useLeaveStore } from './store/leaveStore'
import ApplyLeaveModal from './components/ApplyLeaveModal'
import LeavePolicyCard from './components/LeavePolicyCard'
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

const getAvatarTheme = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const themes = [
    { bg: 'bg-pine-tint text-pine-deep border-pine/20' },
    { bg: 'bg-clay-tint text-clay-deep border-clay/20' },
    { bg: 'bg-ochre-tint text-ochre-deep border-ochre/20' },
    { bg: 'bg-wash text-ink border-hairline-strong' },
  ]
  return themes[hash % themes.length]
}

const getRelativeLeaveStatus = (start: string, end: string) => {
  const todayStr = new Date().toISOString().slice(0, 10)
  const today = new Date(`${todayStr}T00:00:00`)
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)

  if (today >= startDate && today <= endDate) {
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return { label: 'Ends today', tone: 'accent' as const }
    return { label: 'Off today', tone: 'accent' as const }
  }

  const diffTime = startDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return { label: 'Starts tomorrow', tone: 'warning' as const }
  if (diffDays <= 7) return { label: `Starts in ${diffDays}d`, tone: 'neutral' as const }
  return null
}

function BalanceCard({
  label,
  total,
  used,
  type,
}: {
  label: string
  total: number
  used: number
  type: LeaveType
}) {
  const remaining = Math.max(0, total - used)
  const pct = total === 0 ? 0 : Math.min(100, (used / total) * 100)

  const config = {
    ANNUAL: {
      icon: Sun,
      iconBg: 'bg-pine-tint text-pine',
      barColor: 'bg-pine',
      glow: 'hover:shadow-[0_0_15px_rgba(31,77,63,0.06)]',
      borderColor: 'hover:border-pine/30',
    },
    SICK: {
      icon: Activity,
      iconBg: 'bg-clay-tint text-clay',
      barColor: 'bg-clay',
      glow: 'hover:shadow-[0_0_15px_rgba(156,66,33,0.06)]',
      borderColor: 'hover:border-clay/30',
    },
    PERSONAL: {
      icon: User,
      iconBg: 'bg-ochre-tint text-ochre-deep',
      barColor: 'bg-ochre',
      glow: 'hover:shadow-[0_0_15px_rgba(169,121,28,0.06)]',
      borderColor: 'hover:border-ochre/30',
    },
    UNPAID: {
      icon: Clock,
      iconBg: 'bg-wash text-muted',
      barColor: 'bg-muted',
      glow: 'hover:shadow-[0_0_15px_rgba(107,109,102,0.06)]',
      borderColor: 'hover:border-hairline-strong',
    },
  }[type]

  const Icon = config.icon

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className={`p-4 h-full flex flex-col justify-between transition-all duration-300 border border-hairline ${config.glow} ${config.borderColor}`}>
        <div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex p-2 rounded-ctl ${config.iconBg}`}>
              <Icon size={16} />
            </span>
            <span className="tnum text-[11px] font-medium text-muted bg-wash px-2 py-0.5 rounded-full">
              {used} / {total === 0 ? '∞' : `${total}d`}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted">{label}</p>
            <p className="tnum font-display mt-1 text-[30px] leading-none font-bold text-ink">
              {total === 0 ? '—' : remaining}
            </p>
            <p className="mt-1 text-[11.5px] text-muted">
              {total === 0 ? 'unlimited' : 'days left'}
            </p>
          </div>
        </div>

        {total > 0 && (
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-wash">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${config.barColor}`}
              />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export default function LeavePage() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, load, apply, decide, updatePolicy } = useLeaveStore()

  const [tab, setTab] = useState<LeaveStatus>('PENDING')
  const [applyOpen, setApplyOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const viewer = { permissions: user.permissions, name: user.name }

  useEffect(() => {
    void load(viewer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, user.permissions, user.name])

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
    const isExpanded = expandedId === request.id
    const avatarTheme = getAvatarTheme(request.employeeName)

    return (
      <motion.li
        key={request.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`border-b border-hairline last:border-0 hover:bg-paper/40 transition-colors ${
          isExpanded ? 'bg-wash/35' : ''
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpandedId(isExpanded ? null : request.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setExpandedId(isExpanded ? null : request.id)
            }
          }}
          className="flex flex-wrap items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
        >
          <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-semibold ${avatarTheme.bg}`}>
            {request.avatarInitials}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13.5px] font-medium text-ink">
                {request.employeeName}
                {isMine && <span className="ml-1.5 text-[11px] font-normal text-muted bg-wash px-1.5 py-0.5 rounded-full">(you)</span>}
              </p>
              <span className="hidden sm:inline-flex text-[10.5px] text-muted bg-wash/80 px-2 py-0.5 rounded-full border border-hairline font-medium">
                {request.department}
              </span>
            </div>
            <p className="tnum mt-0.5 truncate text-[12px] text-muted">
              {LEAVE_TYPE_SHORT[request.type]} · {formatRange(request.startDate, request.endDate)} ·{' '}
              <span className="font-semibold text-ink">{request.days} {request.days === 1 ? 'day' : 'days'}</span>
            </p>
          </div>

          <p className="hidden max-w-48 truncate text-[12.5px] text-muted lg:block">
            {request.reason}
          </p>

          <div className="flex items-center gap-2">
            {!canDecide && (
              <Badge tone={LEAVE_STATUS_TONE[request.status]}>
                {LEAVE_STATUS_LABEL[request.status]}
              </Badge>
            )}
            
            {canDecide && (
              <span className="text-[11px] font-medium text-pine bg-pine-tint px-2 py-0.5 rounded-full border border-pine/20 animate-pulse">
                Needs review
              </span>
            )}

            <span className="text-muted shrink-0 transition-transform duration-200">
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </span>
          </div>
        </div>

        {/* Expanded Panel */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-hairline bg-paper/20"
            >
              <div className="px-4 py-4 space-y-4 text-[13px]">
                {/* Meta details grid */}
                <div className="grid gap-3 sm:grid-cols-3 bg-surface border border-hairline rounded-ctl p-3">
                  <div>
                    <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Department</span>
                    <span className="font-medium text-ink">{request.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Manager</span>
                    <span className="font-medium text-ink">{request.managerName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Requested on</span>
                    <span className="font-medium text-ink tnum">
                      {new Date(`${request.requestedAt}T00:00:00`).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Justification */}
                <div>
                  <span className="text-[11px] text-muted block font-semibold uppercase tracking-wider mb-1">Reason for leave</span>
                  <div className="bg-wash/30 border border-hairline p-3 rounded-ctl italic text-ink text-[13px] leading-relaxed">
                    "{request.reason}"
                  </div>
                </div>

                {/* Timeline / Activity Logs */}
                <div className="space-y-2 border-t border-hairline/60 pt-3">
                  <span className="text-[11px] text-muted block font-semibold uppercase tracking-wider">Activity Log</span>
                  
                  <div className="flex flex-col gap-3 pl-1">
                    {/* Submitted */}
                    <div className="flex items-start gap-3 relative">
                      <span className="absolute left-[7px] top-[14px] bottom-[-18px] w-px bg-hairline-strong" />
                      <span className="z-10 flex size-4 items-center justify-center rounded-full bg-pine text-white text-[8px] font-bold">
                        ✓
                      </span>
                      <div className="min-w-0 -mt-0.5">
                        <p className="text-[12.5px] font-medium text-ink">Request submitted</p>
                        <p className="text-[11.5px] text-muted">
                          By {request.employeeName} on {new Date(`${request.requestedAt}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>

                    {/* Decision */}
                    <div className="flex items-start gap-3">
                      {request.status === 'PENDING' ? (
                        <>
                          <span className="z-10 flex size-4 items-center justify-center rounded-full bg-ochre text-white text-[8px] animate-pulse">
                            ●
                          </span>
                          <div className="min-w-0 -mt-0.5">
                            <p className="text-[12.5px] font-medium text-ink">Pending Review</p>
                            <p className="text-[11.5px] text-muted">
                              Awaiting decision from {request.managerName || 'manager'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className={`z-10 flex size-4 items-center justify-center rounded-full text-white text-[8px] font-bold ${
                            request.status === 'APPROVED' ? 'bg-pine' : 'bg-clay'
                          }`}>
                            ✓
                          </span>
                          <div className="min-w-0 -mt-0.5">
                            <p className="text-[12.5px] font-medium text-ink">
                              Request {request.status.toLowerCase()}
                            </p>
                            <p className="text-[11.5px] text-muted">
                              Decided by {request.decidedBy || 'System'} on {request.decidedAt ? new Date(`${request.decidedAt}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approve/Decline actions inside the expanded panel if allowed */}
                {canDecide && (
                  <div className="flex items-center gap-2 border-t border-hairline/60 pt-3.5 mt-2 justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void onDecide(request.id, 'REJECTED')
                      }}
                      disabled={busy}
                      className="inline-flex h-8.5 items-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface px-3.5 text-[12.5px] font-medium text-muted transition-colors hover:border-clay hover:text-clay disabled:opacity-50"
                    >
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                      Decline
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void onDecide(request.id, 'APPROVED')
                      }}
                      disabled={busy}
                      className="inline-flex h-8.5 items-center gap-1.5 rounded-ctl bg-pine px-4.5 text-[12.5px] font-medium text-white transition-colors hover:bg-pine-deep disabled:opacity-50 shadow-sm"
                    >
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.li>
    )
  }

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
              Leave
            </h1>
            <span className="flex size-6 items-center justify-center rounded-full bg-pine-tint text-pine">
              <Sparkles size={13} />
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-muted">
            {data?.scope === 'me'
              ? 'Request leave, and see your balance and history.'
              : "Who's off, your leave policy, and requests to decide on."}
          </p>
        </div>

        {data?.scope === 'me' && data.hasEmployeeRecord && (
          <Button onClick={() => setApplyOpen(true)} className="self-start sm:self-auto shadow-sm">
            <Plus size={15} />
            Request leave
          </Button>
        )}
      </div>

      {data?.scope === 'me' && !data.hasEmployeeRecord && (
        <Card className="flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <p className="text-[13.5px] leading-relaxed text-clay">
            There's no employee record on file for you in this company, so there's nothing to
            apply leave against. Ask your Owner or HR to add one.
          </p>
        </Card>
      )}

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
          {/* Quick stats — company-wide glance, not shown on the personal view */}
          {data && data.scope === 'company' && (data.pendingApprovals.length > 0 || data.upcoming.some((r) => {
            const todayStr = new Date().toISOString().slice(0, 10)
            return todayStr >= r.startDate && todayStr <= r.endDate
          })) && (
            <div className="flex flex-wrap gap-4 text-[13px] bg-wash/30 border border-hairline px-4 py-3 rounded-ctl text-muted">
              {data.pendingApprovals.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-ochre" />
                  <span>
                    <strong className="text-ink">{data.pendingApprovals.length}</strong> request{data.pendingApprovals.length === 1 ? '' : 's'} waiting decision
                  </span>
                </div>
              )}
              {data.upcoming.filter(r => {
                const todayStr = new Date().toISOString().slice(0, 10)
                return todayStr >= r.startDate && todayStr <= r.endDate
              }).length > 0 && (
                <>
                  {data.pendingApprovals.length > 0 && <span className="hidden sm:inline text-hairline-strong">|</span>}
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-pine" />
                    <span>
                      <strong className="text-ink">
                        {data.upcoming.filter(r => {
                          const todayStr = new Date().toISOString().slice(0, 10)
                          return todayStr >= r.startDate && todayStr <= r.endDate
                        }).length}
                      </strong> off today
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Balances — your own leave, self-service only */}
          {(isLoading || !data || data.scope === 'me') && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      type={b.type}
                      label={LEAVE_TYPE_SHORT[b.type]}
                      total={b.total}
                      used={b.used}
                    />
                  ))}
            </div>
          )}

          {/* Leave policy — company-wide setting, editable by whoever decides leave */}
          {data && data.scope === 'company' && (
            <LeavePolicyCard policy={data.policy} onSave={(patch) => updatePolicy(viewer, patch)} />
          )}

          {actionError && (
            <div
              role="alert"
              className="mt-4 flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3"
            >
              <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
              <p className="text-[13px] text-clay">{actionError}</p>
            </div>
          )}

          <div className={`grid gap-6 ${data?.scope === 'company' ? 'lg:grid-cols-3' : ''}`}>
            {/* Requests */}
            <Card flush className={data?.scope === 'company' ? 'lg:col-span-2' : ''}>
              <div className="flex items-center gap-1 border-b border-hairline px-2 py-2">
                {TABS.map((t) => {
                  const count = (data?.requests ?? []).filter((r) => r.status === t.key).length
                  const active = tab === t.key

                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setTab(t.key)
                        setExpandedId(null)
                      }}
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
                <ul className="divide-y divide-hairline">
                  <AnimatePresence initial={false}>
                    {visible.map(renderRequest)}
                  </AnimatePresence>
                </ul>
              )}
            </Card>

            {/* Who's off — company-wide visibility, not shown on the personal view */}
            {data && data.scope === 'company' && (
              <Card flush>
                <div className="border-b border-hairline px-4 py-3">
                  <h2 className="text-[13px] font-semibold">Who's off</h2>
                  <p className="mt-0.5 text-[12px] text-muted">Approved leave, next 30 days</p>
                </div>

                {data.upcoming.length === 0 ? (
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
                  <ul className="divide-y divide-hairline">
                    {data.upcoming.map((r) => {
                      const rel = getRelativeLeaveStatus(r.startDate, r.endDate)
                      const avatarTheme = getAvatarTheme(r.employeeName)

                      return (
                        <li
                          key={r.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-paper/30 transition-colors"
                        >
                          <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${avatarTheme.bg}`}>
                            {r.avatarInitials}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <p className="truncate text-[13px] font-medium text-ink">{r.employeeName}</p>
                              {rel && (
                                <Badge tone={rel.tone} className="text-[9.5px] px-1.5 py-0.2 shrink-0">
                                  {rel.label}
                                </Badge>
                              )}
                            </div>
                            <p className="tnum mt-0.5 text-[11.5px] text-muted">
                              {formatRange(r.startDate, r.endDate)} · <span className="font-medium text-ink">{r.days}d</span>
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Card>
            )}
          </div>
        </>
      )}

      <ApplyLeaveModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        balances={data?.balances ?? []}
        onApply={(payload) => apply(viewer, payload)}
      />
    </motion.div>
  )
}
