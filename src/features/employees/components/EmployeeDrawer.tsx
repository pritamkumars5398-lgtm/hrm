import { useEffect, useState } from 'react'
import { Briefcase, Building2, Download, FileText, Mail, MapPin, Phone, User } from 'lucide-react'
import Drawer from '@/shared/components/Drawer'
import { employeeService, type Employee } from '@/services/employeeService'
import EmployeeStatusBadge from './EmployeeStatusBadge'
import { EMPLOYMENT_TYPE_LABEL } from '../labels'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
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
}: {
  employeeId: string | null
  onClose: () => void
}) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!employeeId) return

    let cancelled = false
    setEmployee(null)
    setError(null)

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

  return (
    <Drawer
      open={employeeId !== null}
      onClose={onClose}
      title={employee?.name ?? 'Employee'}
      subtitle={employee?.designation}
    >
      {error ? (
        <p className="text-[14px] text-clay">{error}</p>
      ) : !employee ? (
        <DrawerSkeleton />
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

          <section>
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={Mail} label="Email" value={employee.email} />
              <Field icon={Phone} label="Phone" value={employee.phone} />
              <Field icon={Building2} label="Department" value={employee.department} />
              <Field
                icon={Briefcase}
                label="Employment"
                value={EMPLOYMENT_TYPE_LABEL[employee.employmentType]}
              />
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
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Documents
            </h3>
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
          </section>
        </div>
      )}
    </Drawer>
  )
}
