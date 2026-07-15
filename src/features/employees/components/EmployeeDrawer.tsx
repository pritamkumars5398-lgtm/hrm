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

            <section>
              <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Documents</h3>
              {employee.documents.length === 0 ? (
                <p className="text-[13px] text-muted">No documents uploaded.</p>
              ) : (
                <ul className="overflow-hidden rounded-card border border-hairline bg-surface">
                  {employee.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center gap-3 border-b border-hairline px-3.5 py-3 last:border-0"
                    >
                      <FileText size={15} className="shrink-0 text-muted" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{doc.name}</p>
                        <p className="tnum mt-0.5 text-[11px] text-muted">
                          {doc.category} · {doc.sizeKb} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Download ${doc.name}`}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine"
                      >
                        <Download size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
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
