import { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Briefcase,
  Check,
  Copy,
  DollarSign,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import Card from '@/shared/components/Card'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'
import { teamService, TeamError } from '@/services/teamService'
import { sendInviteEmail } from '@/services/emailService'
import { employeeService } from '@/services/employeeService'

type EducationRow = { degree: string; institution: string; year: string }
type FamilyRow = { name: string; relationship: string; contactNumber: string }

type AddEmployeeForm = {
  firstName: string
  lastName: string
  employeeId: string
  email: string
  contactNumber: string
  homeAddress: string
  role: 'HR' | 'MANAGER' | 'EMPLOYEE'
  jobTitle: string
  department: string
  startDate: string
  employmentType: string
  workLocation: string
  education: EducationRow[]
  family: FamilyRow[]
  bankName: string
  accName: string
  accNumber: string
  ifscCode: string
}

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'work', label: 'Work Info', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'financial', label: 'Financial', icon: DollarSign },
] as const

function SectionShell({
  id,
  title,
  description,
  refFn,
  children,
}: {
  id: string
  title: string
  description: string
  refFn: (el: HTMLElement | null) => void
  children: React.ReactNode
}) {
  return (
    <section id={id} ref={refFn} className="scroll-mt-24">
      <Card className="p-6">
        <div className="mb-5">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        </div>
        {children}
      </Card>
    </section>
  )
}

function InviteResultPanel({
  link,
  tempPassword,
  onDone,
}: {
  link: string
  tempPassword: string | null
  onDone: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = tempPassword ? `Link: ${link}\nTemp Password: ${tempPassword}` : link
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mx-auto mt-10 max-w-xl p-6">
      <span className="flex size-11 items-center justify-center rounded-full bg-pine-tint">
        <Check size={20} className="text-pine" />
      </span>
      <h2 className="mt-4 font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">
        Employee added
      </h2>
      <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
        Their account was created and an invite email was sent. You can also share the credentials
        below manually.
      </p>

      <div className="mt-4 rounded-ctl border border-hairline bg-wash/50 p-3.5">
        <code className="block text-[12px] leading-relaxed break-all text-muted">
          Link: {link}
          {tempPassword && (
            <>
              <br />
              Temp Password: <span className="font-semibold text-ink">{tempPassword}</span>
            </>
          )}
        </code>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-10 items-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface px-3.5 text-[13px] font-medium transition-colors hover:border-pine hover:text-pine"
        >
          {copied ? <Check size={14} className="text-pine" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy details'}
        </button>
        <Button onClick={onDone}>Back to directory</Button>
      </div>
    </Card>
  )
}

export default function AddEmployeePage() {
  const navigate = useNavigate()
  const [inviteResult, setInviteResult] = useState<{ link: string; tempPassword: string | null } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('basic')

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddEmployeeForm>({
    defaultValues: {
      firstName: '',
      lastName: '',
      employeeId: '',
      email: '',
      contactNumber: '',
      homeAddress: '',
      role: 'EMPLOYEE',
      jobTitle: '',
      department: '',
      startDate: new Date().toISOString().split('T')[0],
      employmentType: 'Full-time',
      workLocation: 'Office',
      education: [],
      family: [],
      bankName: '',
      accName: '',
      accNumber: '',
      ifscCode: '',
    },
  })

  const education = useFieldArray({ control, name: 'education' })
  const family = useFieldArray({ control, name: 'family' })
  const departments = employeeService.getDepartmentOptions()

  // Highlight the section currently in view — mirrors the screenshot's left rail.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    )

    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    // Financial block is all-or-nothing — a partial bank record is worse than none.
    const financialFilled = [values.bankName, values.accName, values.accNumber, values.ifscCode].filter(Boolean)
    if (financialFilled.length > 0 && financialFilled.length < 4) {
      setFormError('Complete all four financial fields, or leave them all blank.')
      scrollTo('financial')
      return
    }

    try {
      const result = await teamService.invite({
        email: values.email,
        role: values.role,
        firstName: values.firstName,
        lastName: values.lastName,
        employeeId: values.employeeId,
        contactNumber: values.contactNumber || undefined,
        homeAddress: values.homeAddress || undefined,
        jobTitle: values.jobTitle,
        department: values.department,
        startDate: values.startDate,
        employmentType: values.employmentType,
        workLocation: values.workLocation,
        educationDetails: values.education.length ? values.education : undefined,
        familyDetails: values.family.length
          ? values.family.map((f) => ({
              name: f.name,
              relationship: f.relationship,
              contactNumber: f.contactNumber || undefined,
            }))
          : undefined,
        financialDetails:
          financialFilled.length === 4
            ? {
                bankName: values.bankName,
                accName: values.accName,
                accNumber: values.accNumber,
                ifscCode: values.ifscCode,
              }
            : undefined,
      })

      // Fire-and-forget: a transient SMTP hiccup shouldn't block the success screen.
      if (result.tempPassword) {
        sendInviteEmail({
          to: values.email,
          name: `${values.firstName} ${values.lastName}`.trim(),
          link: result.inviteLink,
          tempPassword: result.tempPassword,
        }).then((r) => {
          if (!r.ok) console.warn('[AddEmployee] Email send failed:', r.error)
        })
      }

      setInviteResult({ link: result.inviteLink, tempPassword: result.tempPassword })
    } catch (err) {
      if (err instanceof TeamError && /email/i.test(err.message)) {
        setError('email', { message: err.message })
        scrollTo('basic')
      }
      setFormError(err instanceof TeamError ? err.message : 'Could not add employee.')
    }
  })

  if (inviteResult) {
    return (
      <InviteResultPanel
        link={inviteResult.link}
        tempPassword={inviteResult.tempPassword}
        onDone={() => navigate('/dashboard/employees')}
      />
    )
  }

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/employees')}
            className="mb-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-pine"
          >
            <ArrowLeft size={14} />
            Back to Employees
          </button>
          <h1 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Add Employee
          </h1>
          <p className="mt-1 text-[13.5px] text-muted">
            Create the employee record and send them an invite to join this company.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Section rail */}
        <nav
          aria-label="Form sections"
          className="lg:sticky lg:top-6 lg:w-56 lg:shrink-0"
        >
          <Card flush className="p-1.5">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {SECTIONS.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id
                return (
                  <li key={id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollTo(id)}
                      aria-current={active ? 'true' : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-ctl px-3 py-2 text-[13.5px] font-medium transition-colors ${
                        active ? 'bg-pine-tint text-pine-deep' : 'text-muted hover:bg-wash hover:text-ink'
                      }`}
                    >
                      <Icon size={16} className={active ? 'text-pine' : 'text-muted'} />
                      {label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        </nav>

        {/* Form body */}
        <div className="min-w-0 flex-1 space-y-6">
          {formError && (
            <div className="rounded-ctl border border-clay/30 bg-clay/5 p-3.5 text-[13px] text-clay">
              {formError}
            </div>
          )}

          <SectionShell
            id="basic"
            refFn={setRef('basic')}
            title="Basic Info"
            description="Personal and contact details for this employee."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
              <Input label="Employee ID" placeholder="EMP-1008" error={errors.employeeId?.message} {...register('employeeId', { required: 'Required' })} />
              <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' } })} />
              <Input label="Phone" type="tel" error={errors.contactNumber?.message} {...register('contactNumber')} />
              <Input label="Home Address" {...register('homeAddress')} />
            </div>
          </SectionShell>

          <SectionShell
            id="work"
            refFn={setRef('work')}
            title="Work Info"
            description="Role, department and access level within this company."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Job Title" error={errors.jobTitle?.message} {...register('jobTitle', { required: 'Required' })} />
              <Select label="Department" options={departments} {...register('department')} />
              <Select
                label="Access Level (Role Preset)"
                hint="Pre-fills their permissions; editable later in Team Members."
                options={[{ value: 'HR', label: 'HR' }, { value: 'MANAGER', label: 'Manager' }, { value: 'EMPLOYEE', label: 'Employee' }]}
                {...register('role')}
              />
              <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate', { required: 'Required' })} />
              <Select label="Employment Type" options={[{ value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' }, { value: 'Contract', label: 'Contract' }, { value: 'Intern', label: 'Intern' }]} {...register('employmentType')} />
              <Select label="Work Location" options={[{ value: 'Office', label: 'Office' }, { value: 'Remote', label: 'Remote' }, { value: 'Hybrid', label: 'Hybrid' }]} {...register('workLocation')} />
            </div>
          </SectionShell>

          <SectionShell
            id="education"
            refFn={setRef('education')}
            title="Education"
            description="Add each qualification the employee holds."
          >
            {education.fields.length === 0 && (
              <p className="mb-4 text-[13px] text-muted">No qualifications added yet.</p>
            )}
            <div className="space-y-4">
              {education.fields.map((field, i) => (
                <div key={field.id} className="rounded-ctl border border-hairline bg-wash/30 p-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input label="Degree" error={errors.education?.[i]?.degree?.message} {...register(`education.${i}.degree`, { required: 'Required' })} />
                    <Input label="Institution" error={errors.education?.[i]?.institution?.message} {...register(`education.${i}.institution`, { required: 'Required' })} />
                    <Input label="Year" placeholder="2021" error={errors.education?.[i]?.year?.message} {...register(`education.${i}.year`, { required: 'Required' })} />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => education.remove(i)}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-clay transition-colors hover:text-clay/80"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => education.append({ degree: '', institution: '', year: '' })}
              className="mt-4 inline-flex items-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface px-3 py-2 text-[13px] font-medium transition-colors hover:border-pine hover:text-pine"
            >
              <Plus size={15} />
              Add qualification
            </button>
          </SectionShell>

          <SectionShell
            id="family"
            refFn={setRef('family')}
            title="Family"
            description="Next of kin and family members."
          >
            {family.fields.length === 0 && (
              <p className="mb-4 text-[13px] text-muted">No family members added yet.</p>
            )}
            <div className="space-y-4">
              {family.fields.map((field, i) => (
                <div key={field.id} className="rounded-ctl border border-hairline bg-wash/30 p-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input label="Name" error={errors.family?.[i]?.name?.message} {...register(`family.${i}.name`, { required: 'Required' })} />
                    <Input label="Relationship" error={errors.family?.[i]?.relationship?.message} {...register(`family.${i}.relationship`, { required: 'Required' })} />
                    <Input label="Contact Number" type="tel" {...register(`family.${i}.contactNumber`)} />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => family.remove(i)}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-clay transition-colors hover:text-clay/80"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => family.append({ name: '', relationship: '', contactNumber: '' })}
              className="mt-4 inline-flex items-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface px-3 py-2 text-[13px] font-medium transition-colors hover:border-pine hover:text-pine"
            >
              <Plus size={15} />
              Add family member
            </button>
          </SectionShell>

          <SectionShell
            id="financial"
            refFn={setRef('financial')}
            title="Financial"
            description="Bank account for payroll. Optional — fill all fields or leave blank."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Bank Name" {...register('bankName')} />
              <Input label="Account Name" {...register('accName')} />
              <Input label="Account Number" {...register('accNumber')} />
              <Input label="IFSC Code" {...register('ifscCode')} />
            </div>
          </SectionShell>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-hairline pt-5">
            <Button type="button" variant="secondary" onClick={() => navigate('/dashboard/employees')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving…
                </>
              ) : (
                'Add Employee'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
