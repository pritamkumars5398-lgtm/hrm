import { useState, useEffect, useCallback } from 'react'
import {
  Timer,
  CheckCircle,
  Clock,
  Plus,
  Save,
  Send,
  Loader2,
  Trash2,
  Users,
  User,
  Check,
  XCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import {
  timesheetsService,
  type TimeRow,
  type Timesheet,
} from '@/services/timesheetsService'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission } from '@/shared/config/navigation'

/** A fresh, empty line for a new week */
const blankRow = (): TimeRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  client: '',
  project: '',
  task: '',
  hours: [0, 0, 0, 0, 0, 0, 0],
  isBillable: true,
})

export default function TimesheetsPage() {
  const user = useAuthStore((s) => s.user)
  const canApprove =
    user?.role === 'OWNER' ||
    user?.role === 'HR' ||
    user?.role === 'MANAGER' ||
    hasPermission(user?.permissions ?? [], 'timesheets.manage')

  const [activeTab, setActiveTab] = useState<'my' | 'approvals'>('my')

  // My Timesheet State
  const [timesheetId, setTimesheetId] = useState<string>('')
  const [rows, setRows] = useState<TimeRow[]>(() => [blankRow()])
  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('DRAFT')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [weekStartDate, setWeekStartDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Team Approvals State
  const [allTimesheets, setAllTimesheets] = useState<Timesheet[]>([])
  const [loadingApprovals, setLoadingApprovals] = useState(false)

  // Rejection Dialog State
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [targetRejectId, setTargetRejectId] = useState<string | null>(null)
  const [reasonInput, setReasonInput] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const loadMyTimesheet = useCallback(async () => {
    try {
      setLoading(true)
      const data = await timesheetsService.getCurrent()
      if (data) {
        setTimesheetId(data.id)
        setStatus(data.status)
        setWeekStartDate(data.weekStartDate)
        setRejectionReason(data.rejectionReason || '')
        if (data.rows && data.rows.length > 0) {
          setRows(data.rows)
        }
      }
    } catch (err) {
      console.error('Timesheet load failed', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTeamApprovals = useCallback(async () => {
    if (!canApprove) return
    try {
      setLoadingApprovals(true)
      const list = await timesheetsService.getAll()
      setAllTimesheets(list)
    } catch (err) {
      console.error('Failed to load team timesheets', err)
    } finally {
      setLoadingApprovals(false)
    }
  }, [canApprove])

  useEffect(() => {
    loadMyTimesheet()
    if (canApprove) {
      loadTeamApprovals()
    }
  }, [loadMyTimesheet, loadTeamApprovals, canApprove])

  const handleHourChange = (rowId: string, dayIdx: number, val: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          const newH = [...r.hours]
          newH[dayIdx] = Math.max(0, Math.min(24, val))
          return { ...r, hours: newH }
        }
        return r
      }),
    )
  }

  const handleRowFieldChange = (rowId: string, field: 'client' | 'project' | 'task', val: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: val } : r)),
    )
  }

  const handleAddRow = () => {
    setRows([...rows, blankRow()])
  }

  const handleDeleteRow = (rowId: string) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((r) => r.id !== rowId))
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      const saved = await timesheetsService.save(rows, weekStartDate)
      setTimesheetId(saved.id)
      setStatus(saved.status)
      alert('Timesheet saved successfully!')
    } catch (err) {
      console.error('Failed to save timesheet', err)
      alert('Could not save the timesheet.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      const saved = await timesheetsService.save(rows, weekStartDate)
      setTimesheetId(saved.id)
      const submitted = await timesheetsService.submit(saved.id)
      setStatus(submitted.status)
      setRejectionReason('')
      alert('Timesheet submitted for manager approval!')
      loadTeamApprovals()
    } catch (err) {
      console.error('Failed to submit timesheet', err)
      alert('Could not submit the timesheet.')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (idToApprove: string) => {
    try {
      setApprovingId(idToApprove)
      const approved = await timesheetsService.approve(idToApprove)
      if (idToApprove === timesheetId) {
        setStatus(approved.status)
      }
      setAllTimesheets((prev) =>
        prev.map((t) => (t.id === idToApprove ? { ...t, status: 'APPROVED' } : t)),
      )
      alert('Timesheet approved and locked!')
    } catch (err) {
      console.error('Failed to approve timesheet', err)
      alert('Could not approve the timesheet.')
    } finally {
      setApprovingId(null)
    }
  }

  const openRejectModal = (id: string) => {
    setTargetRejectId(id)
    setReasonInput('')
    setRejectModalOpen(true)
  }

  const confirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetRejectId) return
    try {
      setRejecting(true)
      const rejected = await timesheetsService.reject(targetRejectId, reasonInput.trim())
      if (targetRejectId === timesheetId) {
        setStatus(rejected.status)
        setRejectionReason(rejected.rejectionReason || reasonInput.trim())
      }
      setAllTimesheets((prev) =>
        prev.map((t) =>
          t.id === targetRejectId
            ? { ...t, status: 'REJECTED', rejectionReason: reasonInput.trim() }
            : t,
        ),
      )
      setRejectModalOpen(false)
      alert('Timesheet returned to employee for revisions.')
    } catch (err) {
      console.error('Reject failed', err)
      alert('Failed to return timesheet.')
    } finally {
      setRejecting(false)
      setTargetRejectId(null)
    }
  }

  const calculateTotal = (row: TimeRow) => row.hours.reduce((a, b) => a + (Number(b) || 0), 0)
  const grandTotal = rows.reduce((acc, r) => acc + calculateTotal(r), 0)
  const billableTotal = rows
    .filter((r) => r.isBillable)
    .reduce((acc, r) => acc + calculateTotal(r), 0)

  const pendingApprovals = allTimesheets.filter((t) => t.status === 'SUBMITTED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-pine uppercase tracking-wider">
            <Timer size={14} /> Time & Productivity Suite
          </div>
          <h1 className="text-xl font-display font-bold text-ink mt-0.5">
            Weekly Timesheets & Approvals
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Track daily work hours, project tasks, and process manager sign-offs.
          </p>
        </div>

        {/* Tab Switcher for Managers / Owners */}
        {canApprove && (
          <div className="flex items-center bg-wash p-1 rounded-ctl border border-hairline text-xs font-semibold">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ctl transition cursor-pointer ${
                activeTab === 'my'
                  ? 'bg-surface text-ink font-bold shadow-2xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <User size={13} /> My Timesheet
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ctl transition cursor-pointer relative ${
                activeTab === 'approvals'
                  ? 'bg-surface text-ink font-bold shadow-2xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Users size={13} /> Team Approvals
              {pendingApprovals.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'approvals' && canApprove ? (
        /* Team Approvals Tab */
        <div className="space-y-4">
          <div className="bg-surface rounded-card border border-hairline p-4">
            <h2 className="text-sm font-bold text-ink mb-1">Pending Team Submissions</h2>
            <p className="text-xs text-muted">
              Review, approve or return weekly timesheets submitted by your direct reports and department team.
            </p>
          </div>

          <div className="bg-surface rounded-card border border-hairline overflow-hidden">
            {loadingApprovals ? (
              <div className="p-8 text-center text-xs text-muted">
                <Loader2 size={18} className="animate-spin mx-auto mb-2 text-pine" />
                Loading submissions...
              </div>
            ) : allTimesheets.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                No timesheet submissions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-hairline bg-wash/50 text-muted font-bold">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Week</th>
                      <th className="p-3 text-center">Total Hours</th>
                      <th className="p-3 text-center">Billable</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Decisions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {allTimesheets.map((ts) => (
                      <tr key={ts.id} className="hover:bg-wash/30 transition">
                        <td className="p-3 font-semibold text-ink">
                          {ts.employeeName || 'Team Member'}
                        </td>
                        <td className="p-3 text-muted">
                          {ts.weekStartDate
                            ? new Date(ts.weekStartDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Current Week'}
                        </td>
                        <td className="p-3 text-center font-bold text-ink">
                          {ts.totalHours ?? 0} hrs
                        </td>
                        <td className="p-3 text-center text-muted">
                          {ts.billableHours ?? 0} hrs
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ts.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : ts.status === 'SUBMITTED'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : ts.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ts.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {ts.status === 'SUBMITTED' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openRejectModal(ts.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-ctl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs cursor-pointer"
                              >
                                <XCircle size={12} />
                                Return
                              </button>
                              <button
                                onClick={() => handleApprove(ts.id)}
                                disabled={approvingId === ts.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-ctl bg-pine hover:bg-pine-deep text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                              >
                                {approvingId === ts.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                                Approve
                              </button>
                            </div>
                          ) : ts.status === 'APPROVED' ? (
                            <span className="text-[11px] text-muted font-medium">Approved & Locked</span>
                          ) : ts.status === 'REJECTED' ? (
                            <span className="text-[11px] text-rose-600 font-medium">Returned for Revisions</span>
                          ) : (
                            <span className="text-[11px] text-muted italic">Draft</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* My Timesheet Tab */
        <div className="space-y-6">
          {/* Edge Case Rejection Banner */}
          {status === 'REJECTED' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-card flex items-start gap-3 text-rose-900">
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-950">
                  Timesheet Returned by Manager for Revision
                </h4>
                <p className="text-xs mt-0.5 text-rose-800">
                  Reason:{' '}
                  <span className="font-semibold italic">
                    "{rejectionReason || 'Please adjust the logged hours and resubmit.'}"
                  </span>
                </p>
                <p className="text-[11px] text-rose-700 mt-1">
                  You can modify your project rows below and click "Resubmit for Approval".
                </p>
              </div>
            </div>
          )}

          {/* Action Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface rounded-card border border-hairline">
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : status === 'SUBMITTED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                Status: {status}
              </span>
              <span className="text-xs text-muted">
                Week: {weekStartDate ? new Date(weekStartDate).toLocaleDateString() : 'Current Cycle'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {(status === 'DRAFT' || status === 'REJECTED') && (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-ctl border border-hairline bg-surface hover:bg-wash text-xs font-semibold text-ink transition cursor-pointer"
                  >
                    <Save size={13} /> {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-ctl bg-pine hover:bg-pine-deep text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <Send size={13} /> {status === 'REJECTED' ? 'Resubmit for Approval' : 'Submit for Approval'}
                  </button>
                </>
              )}
              {status === 'SUBMITTED' && canApprove && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openRejectModal(timesheetId)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-ctl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                  >
                    <XCircle size={13} /> Return
                  </button>
                  <button
                    onClick={() => handleApprove(timesheetId)}
                    disabled={approvingId === timesheetId}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-ctl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <CheckCircle size={13} /> Manager Approve
                  </button>
                </div>
              )}
              {status === 'SUBMITTED' && !canApprove && (
                <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-ctl border border-amber-200">
                  Awaiting Manager Approval
                </span>
              )}
              {status === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-ctl border border-emerald-200">
                  <CheckCircle size={13} /> Approved & Locked
                </span>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface p-4 rounded-card border border-hairline shadow-2xs">
              <span className="text-muted text-xs font-medium">Total Weekly Hours</span>
              <p className="text-xl font-bold text-ink mt-1">{grandTotal} hrs</p>
              <span className="text-[11px] text-muted">Target: 40 hrs</span>
            </div>
            <div className="bg-surface p-4 rounded-card border border-hairline shadow-2xs">
              <span className="text-muted text-xs font-medium">Billable Hours</span>
              <p className="text-xl font-bold text-pine mt-1">{billableTotal} hrs</p>
              <span className="text-[11px] text-muted">
                {grandTotal > 0 ? Math.round((billableTotal / grandTotal) * 100) : 0}% Billable
              </span>
            </div>
            <div className="bg-surface p-4 rounded-card border border-hairline shadow-2xs">
              <span className="text-muted text-xs font-medium">Timesheet Status</span>
              <p
                className={`text-xl font-bold mt-1 ${
                  status === 'APPROVED'
                    ? 'text-emerald-700'
                    : status === 'SUBMITTED'
                      ? 'text-amber-600'
                      : status === 'REJECTED'
                        ? 'text-rose-600'
                        : 'text-slate-700'
                }`}
              >
                {status}
              </p>
              <span className="text-[11px] text-muted">
                {status === 'APPROVED' ? 'Locked for Payroll' : 'Editable'}
              </span>
            </div>
          </div>

          {/* Grid Table */}
          <div className="bg-surface rounded-card border border-hairline overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-hairline bg-wash/40 text-muted font-bold">
                    <th className="p-3 w-40">Client / Project</th>
                    <th className="p-3 min-w-[140px]">Task Description</th>
                    <th className="p-3 w-24">Type</th>
                    {days.map((d) => (
                      <th key={d} className="p-2 text-center w-14">
                        {d}
                      </th>
                    ))}
                    <th className="p-3 text-right w-16">Total</th>
                    <th className="p-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-wash/20 transition">
                      <td className="p-3">
                        <input
                          type="text"
                          disabled={status === 'APPROVED'}
                          placeholder="Client name"
                          value={row.client}
                          onChange={(e) => handleRowFieldChange(row.id, 'client', e.target.value)}
                          className="font-semibold text-xs text-ink bg-transparent border-0 border-b border-transparent focus:border-pine focus:outline-none w-full"
                        />
                        <input
                          type="text"
                          disabled={status === 'APPROVED'}
                          placeholder="Project name"
                          value={row.project}
                          onChange={(e) => handleRowFieldChange(row.id, 'project', e.target.value)}
                          className="text-[11px] text-muted bg-transparent border-0 border-b border-transparent focus:border-pine focus:outline-none w-full mt-1"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          disabled={status === 'APPROVED'}
                          placeholder="What did you work on?"
                          value={row.task}
                          onChange={(e) => handleRowFieldChange(row.id, 'task', e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-pine focus:outline-none text-xs text-ink"
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          disabled={status === 'APPROVED'}
                          onClick={() =>
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, isBillable: !r.isBillable } : r,
                              ),
                            )
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            row.isBillable
                              ? 'bg-pine-tint text-pine border border-pine/20'
                              : 'bg-wash text-muted'
                          }`}
                        >
                          {row.isBillable ? 'Billable' : 'Non-Billable'}
                        </button>
                      </td>
                      {row.hours.map((h, dayIdx) => (
                        <td key={dayIdx} className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            disabled={status === 'APPROVED'}
                            value={h}
                            onChange={(e) =>
                              handleHourChange(row.id, dayIdx, parseFloat(e.target.value) || 0)
                            }
                            className="w-12 text-center py-1 rounded border border-hairline text-xs font-semibold focus:border-pine focus:outline-none bg-wash/30 disabled:bg-wash"
                          />
                        </td>
                      ))}
                      <td className="p-3 text-right font-bold text-ink">
                        {calculateTotal(row)}h
                      </td>
                      <td className="p-2 text-center">
                        {status !== 'APPROVED' && rows.length > 1 && (
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="text-muted hover:text-rose-600 transition p-1 cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-wash/40 border-t border-hairline flex items-center justify-between">
              <button
                onClick={handleAddRow}
                disabled={status === 'APPROVED'}
                className="flex items-center gap-1.5 text-xs font-bold text-pine hover:text-pine-deep cursor-pointer disabled:opacity-50"
              >
                <Plus size={14} /> Add Project Row
              </button>

              <div className="text-xs font-bold text-ink">
                Weekly Total:{' '}
                <span className="text-pine text-sm font-bold ml-1">{grandTotal} Hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return / Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-2xs p-4">
          <div className="bg-surface border border-hairline w-full max-w-md p-5 rounded-card shadow-overlay text-ink">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-rose-600" />
              Return Timesheet for Revisions
            </h3>
            <p className="text-xs text-muted mb-4">
              Specify what needs to be adjusted so the employee can correct their logged hours.
            </p>

            <form onSubmit={confirmReject} className="space-y-3">
              <div>
                <label className="block text-[11.5px] font-semibold text-ink mb-1">
                  Feedback / Reason for Return
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Wednesday client hours exceed the 8h billing cap; please verify task breakdown."
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full p-2.5 rounded-ctl border border-hairline text-xs text-ink focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-3 py-1.5 rounded-ctl border border-hairline text-muted hover:bg-wash text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting || !reasonInput.trim()}
                  className="px-4 py-1.5 rounded-ctl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {rejecting ? 'Returning...' : 'Send Back to Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
