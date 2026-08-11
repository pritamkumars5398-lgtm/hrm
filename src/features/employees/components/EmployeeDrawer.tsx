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
  Calendar,
  Clock,
  Landmark,
  Award,
  History,
  Coins,
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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

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

  const [activeTab, setActiveTab] = useState<'profile' | 'employment' | 'attendance' | 'leave' | 'documents' | 'performance' | 'payroll' | 'history'>('profile')
  const [attendance, setAttendance] = useState<any[] | null>(null)
  const [leaves, setLeaves] = useState<any[] | null>(null)
  const [payroll, setPayroll] = useState<any[] | null>(null)
  const [performance, setPerformance] = useState<{ goals: any[]; reviews: any[] } | null>(null)
  const [docs, setDocs] = useState<any[] | null>(null)
  const [historyData, setHistoryData] = useState<{ employmentHistory: any[]; auditLogs: any[] } | null>(null)
  const [tabLoading, setTabLoading] = useState(false)

  const permissions = useAuthStore((s) => s.user?.permissions)
  const canManage = hasPermission(permissions, 'employees.manage')
  const departments = employeeService.getDepartmentOptions()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>()

  useEffect(() => {
    if (!employeeId) return

    let cancelled = false
    setEmployee(null)
    setError(null)
    setMode('view')
    setSaveError(null)
    setDeleteOpen(false)
    setActiveTab('profile')

    void employeeService
      .getById(employeeId)
      .then((data) => {
        if (!cancelled) setEmployee(data)
      })
      .catch(() => {
        if (!cancelled) setError('We could not load this profile.')
      })

    return () => {
      cancelled = true
    }
  }, [employeeId])

  useEffect(() => {
    if (!employeeId || !employee || mode === 'edit') return

    let cancelled = false
    setTabLoading(true)

    const loadTab = async () => {
      try {
        switch (activeTab) {
          case 'attendance':
            const att = await employeeService.getAttendance(employeeId)
            if (!cancelled) setAttendance(att)
            break
          case 'leave':
            const lvs = await employeeService.getLeave(employeeId)
            if (!cancelled) setLeaves(lvs)
            break
          case 'payroll':
            const pay = await employeeService.getPayroll(employeeId)
            if (!cancelled) setPayroll(pay)
            break
          case 'performance':
            const perf = await employeeService.getPerformance(employeeId)
            if (!cancelled) setPerformance(perf)
            break
          case 'documents':
            const d = await employeeService.getDocuments(employeeId)
            if (!cancelled) setDocs(d)
            break
          case 'history':
            const hist = await employeeService.getHistory(employeeId)
            if (!cancelled) setHistoryData(hist)
            break
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setTabLoading(false)
      }
    }

    void loadTab()

    return () => {
      cancelled = true
    }
  }, [activeTab, employeeId, employee, mode])

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
      <Drawer open={employeeId !== null} onClose={onClose} title={employee?.name ?? 'Employee'} subtitle={subtitle}>
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

            {/* Premium Navigation Tabs */}
            <div className="flex border-b border-hairline overflow-x-auto scrollbar-none mb-4 -mx-6 px-6">
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'employment', label: 'Employment' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'leave', label: 'Leave' },
                { id: 'documents', label: 'Documents' },
                { id: 'performance', label: 'Performance' },
                { id: 'payroll', label: 'Payroll' },
                { id: 'history', label: 'History' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 whitespace-nowrap -mb-px transition cursor-pointer ${
                    activeTab === t.id
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content rendering */}
            <section className="min-h-[220px]">
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Personal Profile</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field icon={Mail} label="Email" value={employee.email} />
                    <Field icon={Phone} label="Phone" value={employee.phone || '—'} />
                  </div>
                  <div className="border-t border-hairline pt-3">
                    <p className="text-[11px] text-muted font-bold uppercase mb-1">Home Address</p>
                    <p className="text-[13.5px] font-medium">{employee.homeAddress || '—'}</p>
                  </div>
                  {employee.financialDetails && (
                    <div className="border-t border-hairline pt-3">
                      <p className="text-[11px] text-muted font-bold uppercase mb-2">Bank / Financial Details</p>
                      <div className="grid gap-3 sm:grid-cols-2 bg-wash/30 p-3 rounded-ctl border border-hairline">
                        <div className="text-[13px]"><span className="text-muted">Bank Name:</span> {employee.financialDetails.bankName || '—'}</div>
                        <div className="text-[13px]"><span className="text-muted">Account Name:</span> {employee.financialDetails.accName || '—'}</div>
                        <div className="text-[13px]"><span className="text-muted">Account Number:</span> {employee.financialDetails.accNumber || '—'}</div>
                        <div className="text-[13px]"><span className="text-muted">IFSC Code:</span> {employee.financialDetails.ifscCode || '—'}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="space-y-5">
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Employment Details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field icon={Building2} label="Department" value={employee.department} />
                    <Field icon={Briefcase} label="Employment Type" value={EMPLOYMENT_TYPE_LABEL[employee.employmentType] || '—'} />
                    <Field icon={MapPin} label="Work Location" value={employee.location || '—'} />
                    <Field icon={User} label="Reporting Manager" value={employee.managerName || '—'} />
                  </div>
                  <div className="border-t border-hairline pt-3 text-[12px] text-muted">
                    Joined Alderway Labs on {formatDate(employee.joinedAt)}
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Recent Logs</h3>
                  {tabLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted" size={20} /></div>
                  ) : !attendance || attendance.length === 0 ? (
                    <p className="text-[13px] text-muted text-center py-6">No attendance logs found.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-ctl border border-hairline bg-surface">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-wash border-b border-hairline text-muted uppercase text-[9px] font-bold">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Check In</th>
                            <th className="p-2.5">Check Out</th>
                            <th className="p-2.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline">
                          {attendance.map((r: any) => {
                            const checkInStr = r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
                            const checkOutStr = r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
                            return (
                              <tr key={r.id}>
                                <td className="p-2.5 font-medium">{r.date}</td>
                                <td className="p-2.5 text-muted">{checkInStr}</td>
                                <td className="p-2.5 text-muted">{checkOutStr}</td>
                                <td className="p-2.5 text-right">
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-800">
                                    PRESENT
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'leave' && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Leave History</h3>
                  {tabLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted" size={20} /></div>
                  ) : !leaves || leaves.length === 0 ? (
                    <p className="text-[13px] text-muted text-center py-6">No leave applications found.</p>
                  ) : (
                    <div className="space-y-3">
                      {leaves.map((l: any) => (
                        <div key={l.id} className="border border-hairline p-3 rounded-ctl bg-wash/10 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-[13px]">{l.type} LEAVE</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                              l.status === 'REJECTED' ? 'bg-clay/10 text-clay' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted">
                            {new Date(l.startDate).toLocaleDateString('en-GB')} to {new Date(l.endDate).toLocaleDateString('en-GB')}
                          </p>
                          {l.reason && <p className="text-[12.5px] italic text-muted mt-1">"{l.reason}"</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Employee Attachments</h3>
                  {tabLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted" size={20} /></div>
                  ) : !docs || docs.length === 0 ? (
                    <p className="text-[13px] text-muted text-center py-6">No documents uploaded.</p>
                  ) : (
                    <ul className="overflow-hidden rounded-ctl border border-hairline bg-surface">
                      {docs.map((doc: any) => (
                        <li key={doc.id} className="flex items-center gap-3 border-b border-hairline px-3.5 py-3 last:border-0">
                          <FileText size={15} className="shrink-0 text-muted" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium">{doc.name}</p>
                            <p className="tnum mt-0.5 text-[11px] text-muted">
                              {doc.category} · {doc.sizeKb} KB
                            </p>
                          </div>
                          <a
                            href={doc.cloudinaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Download ${doc.name}`}
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-ctl border border-hairline bg-surface text-muted transition-colors hover:border-pine hover:text-pine"
                          >
                            <Download size={13} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-5">
                  <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Target Appraisals</h3>
                  {tabLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted" size={20} /></div>
                  ) : !performance ? (
                    <p className="text-[13px] text-muted text-center py-6">No performance records found.</p>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-[11px] font-bold text-muted uppercase tracking-[0.1em] mb-2">Cycle Goals</h4>
                        {performance.goals.length === 0 ? (
                          <p className="text-xs text-muted">No goals set for this cycle.</p>
                        ) : (
                          <div className="space-y-3">
                            {performance.goals.map((g: any) => (
                              <div key={g.id} className="border border-hairline p-3 rounded-ctl space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold">{g.title}</span>
                                  <span className="text-muted">Due {g.dueOn}</span>
                                </div>
                                <div className="w-full bg-wash h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-600 h-full" style={{ width: `${g.progress}%` }} />
                                </div>
                                <p className="text-[10px] text-muted text-right">{g.progress}% complete</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="border-t border-hairline pt-3">
                        <h4 className="text-[11px] font-bold text-muted uppercase tracking-[0.1em] mb-2">Reviews</h4>
                        {performance.reviews.length === 0 ? (
                          <p className="text-xs text-muted">No reviews submitted.</p>
                        ) : (
                          <div className="space-y-3">
                            {performance.reviews.map((r: any) => (
                              <div key={r.id} className="border border-hairline p-3 bg-wash/30 rounded-ctl space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[12px] font-semibold text-emerald-700">Rating: {r.rating} / 5</span>
                                  <span className="text-[10px] text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[12.5px] leading-relaxed text-muted">{r.summary}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payroll' && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Salary Slips</h3>
                  {tabLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted" size={20} /></div>
                  ) : !payroll || payroll.length === 0 ? (
                    <p className="text-[13px] text-muted text-center py-6">No payslips found.</p>
                  ) : (
                    <div className="space-y-3">
                      {payroll.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between border border-hairline p-3 rounded-ctl bg-wash/10">
                          <div>
                            <p className="font-semibold text-[13px]">{p.month}</p>
                            <p className="text-[10px] text-muted uppercase font-bold">{p.status}</p>
                          </div>
                          <div className="text-right">
                            {p.snapshot && (
                              <>
                                <p className="font-medium text-[13.5px]">Net: £{p.snapshot.netSalary.toLocaleString()}</p>
                                <p className="text-[10px] text-muted">Gross: £{p.snapshot.grossEarnings.toLocaleString()}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-5">
                  <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Activity & Timeline</h3>
                  {tabLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted" size={20} /></div>
                  ) : !historyData ? (
                    <p className="text-[13px] text-muted text-center py-6">No history data found.</p>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[11px] font-bold text-muted uppercase tracking-[0.1em] mb-3">Employment Timeline</h4>
                        <ol className="space-y-0">
                          {historyData.employmentHistory.map((event: any, i: number, all: any[]) => (
                            <li key={event.id} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pine" />
                                {i < all.length - 1 && <span className="w-px flex-1 bg-hairline" />}
                              </div>
                              <div className="pb-4">
                                <p className="text-[13.5px] font-medium">{event.title}</p>
                                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{event.detail}</p>
                                <p className="tnum mt-1 text-[11px] text-muted">{formatDate(event.date)}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                      {historyData.auditLogs.length > 0 && (
                        <div className="border-t border-hairline pt-4">
                          <h4 className="text-[11px] font-bold text-muted uppercase tracking-[0.1em] mb-3">Audit Logs (System)</h4>
                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {historyData.auditLogs.map((log: any) => (
                              <div key={log.id} className="text-[12px] border border-hairline p-2.5 rounded-ctl bg-wash/30 space-y-1">
                                <div className="flex justify-between text-muted text-[10px]">
                                  <span className="font-semibold text-ink uppercase">{log.action}</span>
                                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-muted"><span className="text-ink">Actor:</span> {log.userEmail}</p>
                                {log.details && (
                                  <p className="font-mono text-[10px] text-muted break-all mt-1 bg-wash p-1 rounded-ctl">
                                    {log.details}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
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
