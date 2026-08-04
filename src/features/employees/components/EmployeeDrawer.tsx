import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Briefcase,
  Building2,
  Download,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  TriangleAlert,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Drawer from '@/shared/components/Drawer'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'
import { employeeService, type Employee, type EmployeeUpdate } from '@/services/employeeService'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission } from '@/shared/config/navigation'
import EmployeeStatusBadge from './EmployeeStatusBadge'
import { EMPLOYMENT_TYPE_LABEL } from '../labels'
import { leaveService, type LeaveRequest } from '@/services/leaveService'
import { attendanceService, type DaySummary } from '@/services/attendanceService'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const TYPE_TO_LABEL: Record<Employee['employmentType'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
}

type EditForm = {
  firstName: string
  lastName: string
  employeeId: string
  jobTitle: string
  department: string
  contactNumber: string
  employmentType: string
  workLocation: string
  startDate: string
}

function deriveForm(e: Employee): EditForm {
  return {
    firstName: e.firstName ?? e.name.split(' ')[0] ?? '',
    lastName: e.lastName ?? e.name.split(' ').slice(1).join(' ') ?? '',
    employeeId: e.employeeId ?? '',
    jobTitle: e.designation,
    department: e.department,
    contactNumber: e.phone,
    employmentType: TYPE_TO_LABEL[e.employmentType] ?? 'Full-time',
    workLocation: e.location,
    startDate: e.joinedAt ? e.joinedAt.slice(0, 10) : '',
  }
}

function Field({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="truncate text-[13.5px] font-medium">{value}</p>
      </div>
    </div>
  )
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-12 animate-pulse rounded-full bg-wash" />
        <div className="flex-1">
          <div className="h-4 w-32 animate-pulse rounded bg-wash" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-wash" />
        </div>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-10 animate-pulse rounded bg-wash" />
      ))}
    </div>
  )
}

export default function EmployeeDrawer({
  employeeId,
  onClose,
  onChanged,
}: {
  employeeId: string | null
  onClose: () => void
  /** Fires after a successful edit or delete, so the directory list can refresh. */
  onChanged?: () => void
}) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'leaves' | 'documents'>('profile')
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [attendanceDays, setAttendanceDays] = useState<DaySummary[]>([])
  const [loadingExtra, setLoadingExtra] = useState(false)

  // Attendance history filters
  const now = new Date()
  const [viewYear, setViewYear] = useState<number>(now.getFullYear())
  const [viewMonth, setViewMonth] = useState<number>(now.getMonth())
  const [attendanceFilter, setAttendanceFilter] = useState<string>('ALL')

  // Leaves history filters
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('ALL')
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('ALL')

  const permissions = useAuthStore((s) => s.user?.permissions)
  const canManage = hasPermission(permissions, 'employees.manage')
  const departments = employeeService.getDepartmentOptions()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>()

  // Load employee profile & leaves (only when employeeId changes)
  useEffect(() => {
    if (!employeeId) return

    let cancelled = false
    setEmployee(null)
    setError(null)
    setMode('view')
    setSaveError(null)
    setDeleteOpen(false)
    setLeaves([])
    setActiveTab('profile')

    // Reset month selector and filters to current
    const d = new Date()
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
    setAttendanceFilter('ALL')
    setLeaveStatusFilter('ALL')
    setLeaveTypeFilter('ALL')

    void employeeService
      .getById(employeeId)
      .then((data) => {
        if (!cancelled) setEmployee(data)
      })
      .catch(() => {
        if (!cancelled) setError('We could not load this profile.')
      })

    const currentUser = useAuthStore.getState().user
    const viewer = currentUser ? { permissions: currentUser.permissions, name: currentUser.name } : null

    if (viewer) {
      void leaveService.get(viewer).then((leaveData) => {
        if (!cancelled) {
          const empRequests = leaveData.requests.filter((r) => r.employeeId === employeeId)
          setLeaves(empRequests)
        }
      })
    }

    return () => {
      cancelled = true
    }
  }, [employeeId])

  // Load attendance records (when employeeId, viewYear, or viewMonth changes)
  useEffect(() => {
    if (!employeeId) return

    let cancelled = false
    setAttendanceDays([])
    setLoadingExtra(true)

    const currentUser = useAuthStore.getState().user
    const viewer = currentUser ? { permissions: currentUser.permissions, name: currentUser.name } : null

    if (viewer) {
      void attendanceService.getMonth({
        year: viewYear,
        month: viewMonth,
        permissions: viewer.permissions,
        viewerName: viewer.name,
        employeeId: employeeId,
      }).then((attData) => {
        if (!cancelled) {
          setAttendanceDays(attData.days)
          setLoadingExtra(false)
        }
      }).catch(() => {
        if (!cancelled) setLoadingExtra(false)
      })
    } else {
      setLoadingExtra(false)
    }

    return () => {
      cancelled = true
    }
  }, [employeeId, viewYear, viewMonth])

  const startEdit = () => {
    if (!employee) return
    setSaveError(null)
    setMode('edit')
  }

  // Populate the form once the edit fields are mounted, so selects/inputs get
  // their real values (calling reset before mount can drop them).
  useEffect(() => {
    if (mode === 'edit' && employee) reset(deriveForm(employee))
  }, [mode, employee, reset])

  const onSave = handleSubmit(async (values) => {
    if (!employee) return
    setSaveError(null)
    const patch: EmployeeUpdate = {
      firstName: values.firstName,
      lastName: values.lastName,
      employeeId: values.employeeId,
      jobTitle: values.jobTitle,
      department: values.department,
      contactNumber: values.contactNumber,
      employmentType: values.employmentType,
      workLocation: values.workLocation,
      startDate: values.startDate,
    }
    try {
      const updated = await employeeService.update(employee.id, patch)
      setEmployee(updated)
      setMode('view')
      onChanged?.()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'We could not save those changes.')
    }
  })

  const subtitle = mode === 'edit' ? 'Editing profile' : employee?.designation

  return (
    <>
      <Drawer open={employeeId !== null} onClose={onClose} title={employee?.name ?? 'Employee'} subtitle={subtitle} size="xl">
        {error ? (
          <p className="text-[14px] text-clay">{error}</p>
        ) : !employee ? (
          <DrawerSkeleton />
        ) : mode === 'edit' ? (
          <form onSubmit={onSave} noValidate className="space-y-5">
            {saveError && (
              <div className="rounded-ctl border border-clay/30 bg-clay/5 p-3 text-[13px] text-clay">{saveError}</div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
            </div>
            <Input label="Employee ID" error={errors.employeeId?.message} {...register('employeeId', { required: 'Required' })} />
            <Input label="Job Title" error={errors.jobTitle?.message} {...register('jobTitle', { required: 'Required' })} />
            <Select label="Department" options={departments} {...register('department')} />
            <Input label="Phone" type="tel" {...register('contactNumber')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Employment Type"
                options={[
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Part-time', label: 'Part-time' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Intern', label: 'Intern' },
                ]}
                {...register('employmentType')}
              />
              <Input label="Location" {...register('workLocation')} />
            </div>
            <Input label="Start Date" type="date" {...register('startDate')} />

            <div className="flex items-center justify-end gap-2 border-t border-hairline pt-4">
              <Button type="button" variant="secondary" onClick={() => setMode('view')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-7">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-pine-tint text-[15px] font-semibold text-pine-deep">
                {employee.avatarInitials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">{employee.name}</p>
                <div className="mt-1.5">
                  <EmployeeStatusBadge status={employee.status} />
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface text-[13px] font-medium transition-colors hover:border-pine hover:text-pine"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-ctl border border-clay/40 bg-surface text-[13px] font-medium text-clay transition-colors hover:bg-clay/5"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-hairline mb-5">
              {(['profile', 'attendance', 'leaves', 'documents'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-[13px] font-medium border-b-2 capitalize transition-colors -mb-px ${
                    activeTab === tab
                      ? 'border-pine text-pine font-semibold'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-7">
                <section>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field icon={Mail} label="Email" value={employee.email} />
                    <Field icon={Phone} label="Phone" value={employee.phone || '—'} />
                    <Field icon={Building2} label="Department" value={employee.department} />
                    <Field icon={Briefcase} label="Employment" value={EMPLOYMENT_TYPE_LABEL[employee.employmentType]} />
                    <Field icon={MapPin} label="Location" value={employee.location} />
                    <Field icon={User} label="Reports to" value={employee.managerName ?? '—'} />
                  </div>
                  <p className="mt-4 border-t border-hairline pt-3 text-[12px] text-muted">
                    Joined {formatDate(employee.joinedAt)}
                  </p>
                </section>

                <section>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                    Employment history
                  </h3>
                  <ol className="space-y-0">
                    {employee.employmentHistory.map((event, i, all) => (
                      <li key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pine" />
                          {i < all.length - 1 && <span className="w-px flex-1 bg-hairline" />}
                        </div>
                        <div className="pb-5">
                          <p className="text-[13.5px] font-medium">{event.title}</p>
                          <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{event.detail}</p>
                          <p className="tnum mt-1 text-[11px] text-muted">{formatDate(event.date)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-5">
                {/* Month/Year selector */}
                <div className="flex items-center justify-between gap-2 bg-wash/50 p-2 rounded-ctl border border-hairline">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMonth((m) => {
                        if (m === 0) {
                          setViewYear((y) => y - 1)
                          return 11
                        }
                        return m - 1
                      })
                    }}
                    className="inline-flex size-7 items-center justify-center rounded-ctl border border-hairline-strong bg-surface hover:bg-wash transition-colors cursor-pointer text-muted hover:text-ink"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[13px] font-semibold text-ink">
                    {MONTHS[viewMonth]} {viewYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMonth((m) => {
                        if (m === 11) {
                          setViewYear((y) => y + 1)
                          return 0
                        }
                        return m + 1
                      })
                    }}
                    className="inline-flex size-7 items-center justify-center rounded-ctl border border-hairline-strong bg-surface hover:bg-wash transition-colors cursor-pointer text-muted hover:text-ink"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] font-bold text-muted uppercase tracking-wider">Status:</span>
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="text-[12.5px] font-medium text-ink bg-surface border border-hairline-strong rounded-ctl px-2 py-1 focus:border-pine focus:outline-none cursor-pointer hover:border-muted/50 transition-colors"
                  >
                    <option value="ALL">All days</option>
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late</option>
                    <option value="HALF_DAY">Half-day</option>
                    <option value="LEAVE">On Leave</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>

                <section>
                  {loadingExtra ? (
                    <p className="text-[13px] text-muted animate-pulse py-4 text-center">Loading attendance...</p>
                  ) : attendanceDays.length === 0 ? (
                    <p className="text-[13px] text-muted py-4 text-center">No attendance records found for this period.</p>
                  ) : (
                    <div className="overflow-hidden rounded-card border border-hairline bg-surface max-h-[350px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-wash/50 border-b border-hairline text-[11px] font-bold uppercase tracking-wider text-muted">
                            <th className="px-3.5 py-2">Date</th>
                            <th className="px-3.5 py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline text-[13px]">
                          {[...attendanceDays]
                            .reverse()
                            .filter((day) => {
                              if (attendanceFilter === 'ALL') return true
                              if (attendanceFilter === 'PRESENT') return day.present > 0
                              if (attendanceFilter === 'LATE') return day.late > 0
                              if (attendanceFilter === 'HALF_DAY') return day.halfDay > 0
                              if (attendanceFilter === 'LEAVE') return day.leave > 0
                              if (attendanceFilter === 'ABSENT') return day.present === 0 && day.late === 0 && day.halfDay === 0 && day.leave === 0
                              return true
                            })
                            .map((day) => {
                              const dateStr = new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                              return (
                                <tr key={day.date} className="hover:bg-wash/30">
                                  <td className="px-3.5 py-2.5 font-medium text-ink">{dateStr}</td>
                                  <td className="px-3.5 py-2.5 text-right">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                      day.present > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/55' :
                                      day.late > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200/55' :
                                      day.halfDay > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200/55' :
                                      day.leave > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/55' :
                                      'bg-rose-50 text-rose-700 border border-rose-200/55'
                                    }`}>
                                      {day.present > 0 ? 'Present' :
                                       day.late > 0 ? 'Late' :
                                       day.halfDay > 0 ? 'Half-day' :
                                       day.leave > 0 ? 'On Leave' :
                                       'Absent'}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === 'leaves' && (
              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Leave Balances</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['ANNUAL', 'SICK', 'PERSONAL'].map((type) => {
                      const approved = leaves.filter((r) => r.status === 'APPROVED')
                      const total = type === 'ANNUAL' ? 25 : type === 'SICK' ? 10 : 5
                      const used = approved.filter((r) => r.type === type).reduce((sum, r) => sum + r.days, 0)
                      return (
                        <div key={type} className="rounded-card border border-hairline bg-wash/30 p-3 text-center">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{type.toLowerCase()}</p>
                          <p className="tnum mt-1.5 text-[18px] font-bold text-ink">{total - used} <span className="text-[12px] font-medium text-muted">/ {total}</span></p>
                          <p className="text-[10px] text-muted mt-0.5">days left</p>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Filter Panel */}
                <div className="flex gap-3 bg-wash/30 p-2.5 rounded-ctl border border-hairline">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={leaveStatusFilter}
                      onChange={(e) => setLeaveStatusFilter(e.target.value)}
                      className="w-full text-[12px] font-medium text-ink bg-surface border border-hairline-strong rounded-ctl px-2 py-1 focus:border-pine focus:outline-none cursor-pointer hover:border-muted/50 transition-colors"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Type</label>
                    <select
                      value={leaveTypeFilter}
                      onChange={(e) => setLeaveTypeFilter(e.target.value)}
                      className="w-full text-[12px] font-medium text-ink bg-surface border border-hairline-strong rounded-ctl px-2 py-1 focus:border-pine focus:outline-none cursor-pointer hover:border-muted/50 transition-colors"
                    >
                      <option value="ALL">All Types</option>
                      <option value="ANNUAL">Annual</option>
                      <option value="SICK">Sick</option>
                      <option value="PERSONAL">Personal</option>
                      <option value="UNPAID">Unpaid</option>
                    </select>
                  </div>
                </div>

                <section>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Leave Requests</h3>
                  {leaves.length === 0 ? (
                    <p className="text-[13px] text-muted">No leave requests submitted.</p>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {leaves
                        .filter((req) => {
                          const matchesStatus = leaveStatusFilter === 'ALL' || req.status === leaveStatusFilter
                          const matchesType = leaveTypeFilter === 'ALL' || req.type === leaveTypeFilter
                          return matchesStatus && matchesType
                        })
                        .map((req) => (
                          <div key={req.id} className="p-3 rounded-card border border-hairline bg-surface hover:border-muted/40 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-[12.5px] font-bold text-ink">{req.type.charAt(0) + req.type.slice(1).toLowerCase()}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                                req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                                'bg-amber-50 text-amber-700'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <p className="text-[11.5px] text-muted mt-1">
                              {formatDate(req.startDate)} - {formatDate(req.endDate)} ({req.days} {req.days === 1 ? 'day' : 'days'})
                            </p>
                            {req.reason && <p className="text-[12px] text-ink mt-1.5 italic bg-wash/50 p-1.5 rounded border border-hairline/40 font-medium">"{req.reason}"</p>}
                          </div>
                        ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === 'documents' && (
              <section>
                <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Documents</h3>
                {employee.documents.length === 0 ? (
                  <p className="text-[13px] text-muted">No documents uploaded.</p>
                ) : (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {employee.documents.map((doc) => {
                      const fileType = doc.fileType || 'PDF'
                      const categoryConfig = {
                        Policies: { bg: 'bg-pine-tint text-pine', border: 'hover:border-pine/30' },
                        Templates: { bg: 'bg-ochre-tint text-ochre-deep', border: 'hover:border-ochre/30' },
                        Contracts: { bg: 'bg-wash text-ink', border: 'hover:border-hairline-strong' },
                        Compliance: { bg: 'bg-clay-tint text-clay-deep', border: 'hover:border-clay/30' },
                        Onboarding: { bg: 'bg-wash text-muted border border-hairline', border: 'hover:border-hairline-strong' },
                      }[doc.category] || { bg: 'bg-wash text-muted border border-hairline', border: 'hover:border-hairline-strong' }

                      const fileTypeConfig = {
                        PDF: 'bg-clay-tint text-clay-deep border border-clay/10',
                        DOCX: 'bg-pine-tint text-pine-deep border border-pine/10',
                        XLSX: 'bg-pine-tint text-pine border border-pine/15',
                      }[fileType] || 'bg-wash text-muted border border-hairline'

                      const handleDownload = (e: React.MouseEvent) => {
                        if (!doc.cloudinaryUrl) return
                        e.preventDefault()
                        e.stopPropagation()
                        const ext = fileType.toLowerCase()
                        const filename = doc.name.toLowerCase().endsWith(`.${ext}`) ? doc.name : `${doc.name}.${ext}`
                        
                        fetch(doc.cloudinaryUrl)
                          .then((res) => res.blob())
                          .then((blob) => {
                            const blobUrl = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = blobUrl
                            a.download = filename
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            window.URL.revokeObjectURL(blobUrl)
                          })
                          .catch((err) => console.error('Failed to download', err))
                      }

                      return (
                        <div 
                          key={doc.id} 
                          className={`rounded-card border border-hairline bg-surface flex flex-col p-3 justify-between transition-all duration-300 ${categoryConfig.border} hover:shadow-[0_0_10px_rgba(0,0,0,0.03)] h-full`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className={`flex size-7.5 shrink-0 items-center justify-center rounded-ctl ${categoryConfig.bg}`}>
                                <FileText size={13} aria-hidden="true" />
                              </span>
                              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-ctl uppercase ${fileTypeConfig}`}>
                                {fileType}
                              </span>
                            </div>

                            <div className="mt-2">
                              <p className="truncate text-[12px] font-semibold text-ink" title={doc.name}>
                                {doc.name}
                              </p>
                              <p className="tnum mt-0.5 text-[10px] text-muted font-medium">
                                Size: {doc.sizeKb >= 1024 ? `${(doc.sizeKb / 1024).toFixed(1)} MB` : `${doc.sizeKb} KB`}
                              </p>
                            </div>

                            {doc.description && (
                              <p className="mt-1.5 line-clamp-2 text-[11px] leading-normal text-muted font-medium">
                                {doc.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline/60 pt-2">
                            <span className="text-[9.5px] text-muted font-semibold truncate">
                              {formatDate(doc.uploadedAt)}
                            </span>

                            {doc.cloudinaryUrl ? (
                              <button
                                type="button"
                                onClick={handleDownload}
                                aria-label={`Download ${doc.name}`}
                                className="inline-flex h-6.5 items-center justify-center gap-1.5 rounded-ctl bg-gradient-to-r from-[#10b981] to-[#15803d] px-2.5 text-[10.5px] font-bold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
                              >
                                <Download size={10.5} />
                                Download
                              </button>
                            ) : (
                              <Button 
                                size="sm" 
                                aria-label={`Download ${doc.name}`} 
                                className="h-6.5 text-[10.5px] font-bold shadow-sm px-2.5"
                              >
                                <Download size={10.5} />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </Drawer>

      {employee && (
        <DeleteEmployeeDialog
          open={deleteOpen}
          employee={employee}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => {
            setDeleteOpen(false)
            onChanged?.()
            onClose()
          }}
        />
      )}
    </>
  )
}

function DeleteEmployeeDialog({
  open,
  employee,
  onClose,
  onDeleted,
}: {
  open: boolean
  employee: Employee
  onClose: () => void
  onDeleted: () => void
}) {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const phrase = `delete record for ${employee.name}`
  const confirmed = confirmText.trim() === phrase

  // Reset the typed phrase whenever the dialog opens for a (possibly different) person.
  useEffect(() => {
    if (open) {
      setConfirmText('')
      setError(null)
    }
  }, [open, employee.id])

  const doDelete = async () => {
    if (!confirmed) return
    setDeleting(true)
    setError(null)
    try {
      await employeeService.remove(employee.id)
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not delete that record.')
      setDeleting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete employee record">
      <div className="space-y-4">
        <div className="flex gap-3 rounded-ctl border border-clay/30 bg-clay/5 p-3">
          <TriangleAlert size={17} className="mt-px shrink-0 text-clay" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-clay">
            This permanently deletes the HR record for <span className="font-semibold">{employee.name}</span>. This
            cannot be undone. (Their portal login is managed separately in Team Members.)
          </p>
        </div>

        <div>
          <label htmlFor="delete-confirm" className="block text-[13px] font-medium">
            To confirm, type <span className="font-semibold text-ink">{phrase}</span>
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            aria-invalid={confirmText.length > 0 && !confirmed}
            className="mt-1.5 h-10 w-full rounded-ctl border border-hairline-strong bg-surface px-3 text-[14px] transition-colors placeholder:text-muted/60 hover:border-muted/50 focus:border-clay focus:outline-none"
            placeholder={phrase}
          />
        </div>

        {error && <p className="text-[12px] text-clay">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={() => void doDelete()}
            disabled={!confirmed || deleting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-ctl border border-clay bg-clay px-4 text-sm font-medium text-white transition-colors hover:bg-clay/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Deleting…
              </>
            ) : (
              'Delete record'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
