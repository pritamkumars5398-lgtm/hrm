import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  UserX,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import Card from '@/shared/components/Card'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'
import { employeeService, type Employee, type EmployeeUpdate } from '@/services/employeeService'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission } from '@/shared/config/navigation'
import EmployeeStatusBadge from './components/EmployeeStatusBadge'
import { EMPLOYMENT_TYPE_LABEL } from './labels'
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
  status: string
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
    status: e.status,
  }
}

function Field({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex gap-3 bg-wash/30 p-3 rounded-ctl border border-hairline/60">
      <Icon size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">{label}</p>
        <p className="truncate text-[14px] font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function EmployeeDetailsPage({ isSelfProfile }: { isSelfProfile?: boolean }) {
  const { employeeId: routeEmployeeId } = useParams<{ employeeId: string }>()
  const navigate = useNavigate()

  const [employeeId, setEmployeeId] = useState<string | undefined>(isSelfProfile ? undefined : routeEmployeeId)
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
  const [attendanceViewMode, setAttendanceViewMode] = useState<'calendar' | 'list'>('calendar')

  // Leaves history filters
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('ALL')
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('ALL')

  const permissions = useAuthStore((s) => s.user?.permissions)
  const canManage = hasPermission(permissions, 'employees.manage')
  const canEditProfile = canManage || isSelfProfile
  const departments = employeeService.getDepartmentOptions()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>()

  // Load employee profile & leaves (only when employeeId/isSelfProfile changes)
  useEffect(() => {
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
    setAttendanceViewMode('calendar')
    setLeaveStatusFilter('ALL')
    setLeaveTypeFilter('ALL')

    const loadProfile = async () => {
      try {
        const data = isSelfProfile
          ? await employeeService.getMe()
          : await employeeService.getById(employeeId!)

        if (cancelled) return
        setEmployee(data)
        if (isSelfProfile) {
          setEmployeeId(data.id)
        }

        const currentUser = useAuthStore.getState().user
        const viewer = currentUser ? { permissions: currentUser.permissions, name: currentUser.name } : null

        if (viewer) {
          const leaveData = await leaveService.get(viewer)
          if (!cancelled) {
            const empRequests = leaveData.requests.filter((r) => r.employeeId === data.id)
            setLeaves(empRequests)
          }
        }
      } catch {
        if (!cancelled) setError('We could not load this profile.')
      }
    }

    if (isSelfProfile || employeeId) {
      void loadProfile()
    }

    return () => {
      cancelled = true
    }
  }, [employeeId, isSelfProfile])

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

  useEffect(() => {
    if (mode === 'edit' && employee) reset(deriveForm(employee))
  }, [mode, employee, reset])

  const onSave = handleSubmit(async (values) => {
    if (!employee || !employeeId) return
    setSaveError(null)
    const patch: EmployeeUpdate = isSelfProfile
      ? {
          firstName: values.firstName,
          lastName: values.lastName,
          contactNumber: values.contactNumber,
        }
      : {
          firstName: values.firstName,
          lastName: values.lastName,
          employeeId: values.employeeId,
          jobTitle: values.jobTitle,
          department: values.department,
          contactNumber: values.contactNumber,
          employmentType: values.employmentType,
          workLocation: values.workLocation,
          startDate: values.startDate,
          status: values.status,
        }
    try {
      const updated = await employeeService.update(employeeId, patch)
      setEmployee(updated)
      setMode('view')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'We could not save those changes.')
    }
  })

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard/employees" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
          <ArrowLeft size={14} /> Back to Directory
        </Link>
        <Card className="p-5 border-clay/35 bg-clay/5">
          <p className="text-[14px] text-clay font-medium">{error}</p>
        </Card>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-pine size-8" />
        <p className="text-[14px] text-muted mt-2 font-medium">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link to="/dashboard/employees" className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted hover:text-ink transition-colors">
        <ArrowLeft size={14} /> Back to Directory
      </Link>

      {/* Header Profile Info Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            {employee.photoUrl ? (
              <img
                src={employee.photoUrl}
                alt={employee.name}
                className="size-14 shrink-0 rounded-full border border-pine/20 object-cover shadow-sm"
              />
            ) : (
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-pine-tint text-[18px] font-bold text-pine-deep border border-pine/20 shadow-sm">
                {employee.avatarInitials}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-[20px] font-bold text-ink leading-tight">{employee.name}</h1>
              <p className="text-[13.5px] text-muted mt-1 font-medium">{employee.designation}</p>
              <div className="mt-2.5">
                <EmployeeStatusBadge status={employee.status} />
              </div>
            </div>
          </div>

          {mode === 'view' && (canEditProfile || canManage) && (
            <div className="flex flex-wrap gap-2">
              {canEditProfile && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface text-[13px] font-medium transition-colors hover:border-pine hover:text-pine cursor-pointer"
                >
                  <Pencil size={14} />
                  Edit Profile
                </button>
              )}

              {canEditProfile && (
                <>
                  {/* Quick status toggle */}
                  {employee.status !== 'INACTIVE' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('Mark this employee as Left Company (Inactive)?')) return
                        try {
                          const updated = await employeeService.update(employeeId!, { status: 'INACTIVE' })
                          setEmployee(updated)
                        } catch {/* ignore */}
                      }}
                      className="inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-ctl border border-orange-300 bg-orange-50 text-[13px] font-medium text-orange-700 transition-colors hover:bg-orange-100 cursor-pointer"
                    >
                      <UserX size={14} />
                      Mark as Left
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('Restore this employee as Active?')) return
                        try {
                          const updated = await employeeService.update(employeeId!, { status: 'ACTIVE' })
                          setEmployee(updated)
                        } catch {/* ignore */}
                      }}
                      className="inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-ctl border border-emerald-300 bg-emerald-50 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      Restore Active
                    </button>
                  )}
                </>
              )}

              {canManage && (
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-ctl border border-clay/40 bg-surface text-[13px] font-medium text-clay transition-colors hover:bg-clay/5 cursor-pointer"
                >
                  <Trash2 size={14} />
                  Delete Record
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {mode === 'edit' ? (
        <Card className="p-6">
          <form onSubmit={onSave} noValidate className="space-y-5">
            {saveError && (
              <div className="rounded-ctl border border-clay/30 bg-clay/5 p-3 text-[13px] text-clay">{saveError}</div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
            </div>
            <Input label="Employee ID" error={errors.employeeId?.message} disabled={isSelfProfile} {...register('employeeId', { required: 'Required' })} />
            <Input label="Job Title" error={errors.jobTitle?.message} disabled={isSelfProfile} {...register('jobTitle', { required: 'Required' })} />
            <Select label="Department" options={departments} disabled={isSelfProfile} {...register('department')} />
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
                disabled={isSelfProfile}
                {...register('employmentType')}
              />
              <Input label="Location" disabled={isSelfProfile} {...register('workLocation')} />
            </div>
            <Input label="Start Date" type="date" disabled={isSelfProfile} {...register('startDate')} />
            <Select
              label="Status"
              options={[
                { value: 'ACTIVE', label: '✅ Active' },
                { value: 'PROBATION', label: '🟡 Probation' },
                { value: 'ON_LEAVE', label: '🔵 On Leave' },
                { value: 'NOTICE', label: '🟠 Notice Period' },
                { value: 'INACTIVE', label: '🔴 Inactive (Left Company)' },
              ]}
              disabled={isSelfProfile}
              {...register('status')}
            />

            <div className="flex items-center justify-end gap-2.5 border-t border-hairline pt-4 mt-6">
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
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Tabs selector column */}
          <div className="md:col-span-1 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {(['profile', 'attendance', 'leaves', 'documents'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2.5 rounded-ctl text-[13.5px] capitalize transition-all border shrink-0 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#10b981] to-[#15803d] font-semibold text-white shadow-sm shadow-emerald-500/10 border-transparent'
                    : 'bg-surface text-muted border-transparent hover:bg-wash hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Details Panels column */}
          <div className="md:col-span-3">
            <Card className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-7">
                  <section>
                    <h3 className="mb-4 text-[11.5px] font-bold tracking-[0.12em] text-muted uppercase">Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field icon={Mail} label="Email" value={employee.email} />
                      <Field icon={Phone} label="Phone" value={employee.phone || '—'} />
                      <Field icon={Building2} label="Department" value={employee.department} />
                      <Field icon={Briefcase} label="Employment" value={EMPLOYMENT_TYPE_LABEL[employee.employmentType]} />
                      <Field icon={MapPin} label="Location" value={employee.location} />
                      <Field icon={User} label="Reports to" value={employee.managerName ?? '—'} />
                    </div>
                    <p className="mt-6 border-t border-hairline pt-4 text-[12.5px] text-muted">
                      Joined {formatDate(employee.joinedAt)}
                    </p>
                  </section>

                  <section>
                    <h3 className="mb-4 text-[11.5px] font-bold tracking-[0.12em] text-muted uppercase border-t border-hairline pt-5">
                      Employment history
                    </h3>
                    <ol className="space-y-0 pl-1">
                      {employee.employmentHistory.map((event, i, all) => (
                        <li key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-pine shadow-sm" />
                            {i < all.length - 1 && <span className="w-px flex-1 bg-hairline" />}
                          </div>
                          <div className="pb-5">
                            <p className="text-[14px] font-semibold text-ink">{event.title}</p>
                            <p className="mt-1 text-[13px] leading-relaxed text-muted">{event.detail}</p>
                            <p className="tnum mt-1.5 text-[11px] text-muted font-medium">{formatDate(event.date)}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              )}

              {activeTab === 'attendance' && (() => {
                const getCalendarDays = () => {
                  const firstDay = new Date(viewYear, viewMonth, 1)
                  const lastDay = new Date(viewYear, viewMonth + 1, 0)
                  const daysInMonth = lastDay.getDate()
                  const startDayIndex = firstDay.getDay()
                  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate()
                  
                  const cells: { date: Date; isCurrentMonth: boolean; dateString: string }[] = []
                  
                  // Prev padding
                  for (let i = startDayIndex - 1; i >= 0; i--) {
                    const d = prevMonthLastDay - i
                    const m = viewMonth === 0 ? 11 : viewMonth - 1
                    const y = viewMonth === 0 ? viewYear - 1 : viewYear
                    const dateObj = new Date(y, m, d)
                    cells.push({
                      date: dateObj,
                      isCurrentMonth: false,
                      dateString: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                    })
                  }
                  
                  // Current month
                  for (let d = 1; d <= daysInMonth; d++) {
                    const dateObj = new Date(viewYear, viewMonth, d)
                    cells.push({
                      date: dateObj,
                      isCurrentMonth: true,
                      dateString: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                    })
                  }
                  
                  // Next padding
                  const remaining = 42 - cells.length
                  for (let d = 1; d <= remaining; d++) {
                    const m = viewMonth === 11 ? 0 : viewMonth + 1
                    const y = viewMonth === 11 ? viewYear + 1 : viewYear
                    const dateObj = new Date(y, m, d)
                    cells.push({
                      date: dateObj,
                      isCurrentMonth: false,
                      dateString: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                    })
                  }
                  
                  return cells
                }

                const getDaySummary = (dateString: string) => {
                  return attendanceDays.find((day) => day.date.slice(0, 10) === dateString)
                }

                const calendarCells = getCalendarDays()

                return (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Header Controls (Month & View Mode) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-wash p-3 rounded-ctl border border-hairline">
                      <div className="flex items-center gap-2">
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
                          className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface hover:bg-wash transition-colors cursor-pointer text-muted hover:text-ink shadow-sm"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <span className="text-[14px] font-bold text-ink w-32 text-center">
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
                          className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface hover:bg-wash transition-colors cursor-pointer text-muted hover:text-ink shadow-sm"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>

                      {/* View togglers */}
                      <div className="flex items-center gap-2 bg-surface p-1 rounded-ctl border border-hairline/60">
                        <button
                          type="button"
                          onClick={() => setAttendanceViewMode('calendar')}
                          className={`px-3 py-1 rounded-ctl text-[12px] font-bold transition-all cursor-pointer ${
                            attendanceViewMode === 'calendar'
                              ? 'bg-pine text-white shadow-sm'
                              : 'text-muted hover:text-ink'
                          }`}
                        >
                          Calendar
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendanceViewMode('list')}
                          className={`px-3 py-1 rounded-ctl text-[12px] font-bold transition-all cursor-pointer ${
                            attendanceViewMode === 'list'
                              ? 'bg-pine text-white shadow-sm'
                              : 'text-muted hover:text-ink'
                          }`}
                        >
                          List View
                        </button>
                      </div>
                    </div>

                    {/* Filter Selector & Legend */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] font-bold text-muted uppercase tracking-wider">Status Filter:</span>
                        <select
                          value={attendanceFilter}
                          onChange={(e) => setAttendanceFilter(e.target.value)}
                          className="text-[12.5px] font-semibold text-ink bg-surface border border-hairline-strong rounded-ctl px-3 py-1.5 focus:border-pine focus:outline-none cursor-pointer hover:border-muted/50 transition-colors shadow-sm"
                        >
                          <option value="ALL">All days</option>
                          <option value="PRESENT">Present</option>
                          <option value="LATE">Late</option>
                          <option value="HALF_DAY">Half-day</option>
                          <option value="LEAVE">On Leave</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                      </div>

                      {/* Calendar mini-legend */}
                      {attendanceViewMode === 'calendar' && (
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                          <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-emerald-500" /> Present</span>
                          <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-amber-500" /> Late / Half</span>
                          <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-indigo-500" /> Leave</span>
                          <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-rose-500" /> Absent</span>
                        </div>
                      )}
                    </div>

                    <section>
                      {loadingExtra ? (
                        <p className="text-[13.5px] text-muted animate-pulse py-8 text-center">Loading attendance...</p>
                      ) : attendanceDays.length === 0 ? (
                        <p className="text-[13.5px] text-muted py-8 text-center">No attendance records found for this period.</p>
                      ) : attendanceViewMode === 'list' ? (
                        /* List View Table */
                        <div className="overflow-hidden rounded-card border border-hairline bg-surface">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-wash/50 border-b border-hairline text-[11.5px] font-bold uppercase tracking-wider text-muted">
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-hairline text-[13.5px]">
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
                                  const dateStr = new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' })
                                  return (
                                    <tr key={day.date} className="hover:bg-wash/30">
                                      <td className="px-4 py-3 font-medium text-ink">{dateStr}</td>
                                      <td className="px-4 py-3 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                          day.present > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200/55' :
                                          day.late > 0 ? 'bg-amber-50 text-amber-700 border-amber-200/55' :
                                          day.halfDay > 0 ? 'bg-amber-50 text-amber-700 border-amber-200/55' :
                                          day.leave > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200/55' :
                                          'bg-rose-50 text-rose-700 border-rose-200/55'
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
                      ) : (
                        /* Calendar Grid View */
                        <div className="grid grid-cols-7 gap-px border border-hairline bg-hairline rounded-card overflow-hidden">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="bg-wash py-2 text-center text-[10.5px] font-bold uppercase tracking-wider text-muted">
                              {day}
                            </div>
                          ))}
                          {calendarCells.map((cell, idx) => {
                            const summary = cell.isCurrentMonth ? getDaySummary(cell.dateString) : null
                            const dayNum = cell.date.getDate()
                            const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6
                            const isToday = cell.date.toDateString() === new Date().toDateString()
                            
                            let statusBg = 'bg-surface'
                            let statusText = ''
                            let badgeStyle = ''
                            let matchesFilter = true

                            if (cell.isCurrentMonth) {
                              statusBg = 'bg-surface hover:bg-wash/30 text-ink'
                              if (summary) {
                                if (summary.present > 0) {
                                  statusText = 'Present'
                                  badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                } else if (summary.late > 0) {
                                  statusText = 'Late'
                                  badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200/60'
                                } else if (summary.halfDay > 0) {
                                  statusText = 'Half-day'
                                  badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200/60'
                                } else if (summary.leave > 0) {
                                  statusText = 'Leave'
                                  badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                                } else {
                                  statusText = 'Absent'
                                  badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/60'
                                }
                              } else {
                                const isFuture = cell.date > new Date()
                                if (!isWeekend && !isFuture) {
                                  statusText = 'Absent'
                                  badgeStyle = 'bg-rose-50/50 text-rose-700 border-rose-200/40'
                                }
                              }

                              // Filter matching logic
                              if (attendanceFilter !== 'ALL') {
                                if (attendanceFilter === 'PRESENT') matchesFilter = summary ? summary.present > 0 : false
                                else if (attendanceFilter === 'LATE') matchesFilter = summary ? summary.late > 0 : false
                                else if (attendanceFilter === 'HALF_DAY') matchesFilter = summary ? summary.halfDay > 0 : false
                                else if (attendanceFilter === 'LEAVE') matchesFilter = summary ? summary.leave > 0 : false
                                else if (attendanceFilter === 'ABSENT') {
                                  matchesFilter = summary 
                                    ? (summary.present === 0 && summary.late === 0 && summary.halfDay === 0 && summary.leave === 0) 
                                    : !isWeekend && cell.date <= new Date()
                                }
                              }
                            } else {
                              statusBg = 'bg-surface hover:bg-wash/30 text-muted/30'
                            }

                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  if (!cell.isCurrentMonth) {
                                    setViewYear(cell.date.getFullYear())
                                    setViewMonth(cell.date.getMonth())
                                  }
                                }}
                                className={`min-h-[85px] p-2 flex flex-col justify-between transition-all bg-surface select-none relative ${statusBg} ${
                                  !matchesFilter ? 'opacity-25 saturate-50' : ''
                                } ${!cell.isCurrentMonth ? 'cursor-pointer hover:bg-wash/40' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <span className={`text-[12px] font-bold ${
                                    cell.isCurrentMonth 
                                      ? isToday 
                                        ? 'bg-pine text-white size-5 flex items-center justify-center rounded-full shadow-sm' 
                                        : 'text-ink font-semibold' 
                                      : 'text-muted/40 font-medium'
                                  }`}>
                                    {dayNum}
                                  </span>
                                </div>
                                {statusText && (
                                  <span className={`inline-flex items-center justify-center py-0.5 rounded-ctl text-[9px] font-bold border truncate tracking-wide ${badgeStyle}`}>
                                    {statusText}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </section>
                  </div>
                )
              })()}

              {activeTab === 'leaves' && (
                <div className="space-y-6">
                  <section>
                    <h3 className="mb-3 text-[11.5px] font-bold tracking-[0.12em] text-muted uppercase">Leave Balances</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['ANNUAL', 'SICK', 'PERSONAL'].map((type) => {
                        const approved = leaves.filter((r) => r.status === 'APPROVED')
                        const total = type === 'ANNUAL' ? 25 : type === 'SICK' ? 10 : 5
                        const used = approved.filter((r) => r.type === type).reduce((sum, r) => sum + r.days, 0)
                        return (
                          <div key={type} className="rounded-card border border-hairline bg-wash/30 p-4 text-center">
                            <p className="text-[10px] font-extrabold text-muted uppercase tracking-wider">{type.toLowerCase()}</p>
                            <p className="tnum mt-2 text-[20px] font-bold text-ink">{total - used} <span className="text-[13px] font-medium text-muted">/ {total}</span></p>
                            <p className="text-[10.5px] text-muted mt-1">days left</p>
                          </div>
                        )
                      })}
                    </div>
                  </section>

                  {/* Filter Panel */}
                  <div className="flex gap-3 bg-wash p-3 rounded-ctl border border-hairline">
                    <div className="flex-1">
                      <label className="block text-[10.5px] font-bold text-muted uppercase tracking-wider mb-1">Status</label>
                      <select
                        value={leaveStatusFilter}
                        onChange={(e) => setLeaveStatusFilter(e.target.value)}
                        className="w-full text-[12.5px] font-semibold text-ink bg-surface border border-hairline-strong rounded-ctl px-3 py-1.5 focus:border-pine focus:outline-none cursor-pointer hover:border-muted/50 transition-colors shadow-sm"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10.5px] font-bold text-muted uppercase tracking-wider mb-1">Type</label>
                      <select
                        value={leaveTypeFilter}
                        onChange={(e) => setLeaveTypeFilter(e.target.value)}
                        className="w-full text-[12.5px] font-semibold text-ink bg-surface border border-hairline-strong rounded-ctl px-3 py-1.5 focus:border-pine focus:outline-none cursor-pointer hover:border-muted/50 transition-colors shadow-sm"
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
                    <h3 className="mb-4 text-[11.5px] font-bold tracking-[0.12em] text-muted uppercase border-t border-hairline pt-5">Leave Requests</h3>
                    {leaves.length === 0 ? (
                      <p className="text-[13px] text-muted">No leave requests submitted.</p>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {leaves
                          .filter((req) => {
                            const matchesStatus = leaveStatusFilter === 'ALL' || req.status === leaveStatusFilter
                            const matchesType = leaveTypeFilter === 'ALL' || req.type === leaveTypeFilter
                            return matchesStatus && matchesType
                          })
                          .map((req) => (
                            <div key={req.id} className="p-3.5 rounded-card border border-hairline bg-surface hover:border-muted/40 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-ink">{req.type.charAt(0) + req.type.slice(1).toLowerCase()}</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <p className="text-[12px] text-muted mt-1">
                                {formatDate(req.startDate)} - {formatDate(req.endDate)} ({req.days} {req.days === 1 ? 'day' : 'days'})
                              </p>
                              {req.reason && <p className="text-[12.5px] text-ink mt-2.5 italic bg-wash/50 p-2 rounded border border-hairline/40 font-medium">"{req.reason}"</p>}
                            </div>
                          ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {activeTab === 'documents' && (
                <section>
                  <h3 className="mb-4 text-[11.5px] font-bold tracking-[0.12em] text-muted uppercase">Documents</h3>
                  {employee.documents.length === 0 ? (
                    <p className="text-[13px] text-muted">No documents uploaded.</p>
                  ) : (
                    <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2">
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
                          <Card 
                            key={doc.id} 
                            className={`flex flex-col p-3.5 justify-between transition-all duration-300 border border-hairline ${categoryConfig.border} hover:shadow-[0_0_10px_rgba(0,0,0,0.03)] h-full`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className={`flex size-8 shrink-0 items-center justify-center rounded-ctl ${categoryConfig.bg}`}>
                                  <FileText size={14} aria-hidden="true" />
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-ctl uppercase ${fileTypeConfig}`}>
                                  {fileType}
                                </span>
                              </div>

                              <div className="mt-2.5">
                                <p className="truncate text-[12.5px] font-semibold text-ink" title={doc.name}>
                                  {doc.name}
                                </p>
                                <p className="tnum mt-0.5 text-[10.5px] text-muted font-medium">
                                  Size: {doc.sizeKb >= 1024 ? `${(doc.sizeKb / 1024).toFixed(1)} MB` : `${doc.sizeKb} KB`}
                                </p>
                              </div>

                              {doc.description && (
                                <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-muted font-medium">
                                  {doc.description}
                                </p>
                              )}
                            </div>

                            <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-hairline/60 pt-2.5">
                              <span className="text-[10px] text-muted font-semibold truncate">
                                Uploaded {formatDate(doc.uploadedAt)}
                              </span>

                              {doc.cloudinaryUrl ? (
                                <button
                                  type="button"
                                  onClick={handleDownload}
                                  aria-label={`Download ${doc.name}`}
                                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-ctl bg-gradient-to-r from-[#10b981] to-[#15803d] px-2.5 text-[11px] font-bold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
                                >
                                  <Download size={11} />
                                  Download
                                </button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  aria-label={`Download ${doc.name}`} 
                                  className="h-7 text-[11px] font-bold shadow-sm px-2.5"
                                >
                                  <Download size={11} />
                                  Download
                                </Button>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </section>
              )}
            </Card>
          </div>
        </div>
      )}

      {employee && (
        <DeleteEmployeeDialog
          open={deleteOpen}
          employee={employee}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => {
            setDeleteOpen(false)
            navigate('/dashboard/employees')
          }}
        />
      )}
    </div>
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
  const confirmed = confirmText.trim().toLowerCase() === phrase.toLowerCase()

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
            cannot be undone.
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
