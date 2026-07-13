import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  AlertCircle,
  Bell,
  Building2,
  Check,
  Loader2,
  Palette,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Badge from '@/shared/components/Badge'
import { useAuthStore } from '@/features/auth/store/authStore'
import {
  OrganizationError,
  organizationService,
  type Organization,
} from '@/services/organizationService'
import { AuthError, authService } from '@/services/authService'
import RolesPermissions from './components/RolesPermissions'

type Tab = 'company' | 'roles' | 'notifications' | 'appearance' | 'security'

const TABS: Array<{ key: Tab; label: string; icon: typeof Building2 }> = [
  { key: 'company', label: 'Company profile', icon: Building2 },
  { key: 'roles', label: 'Roles & Permissions', icon: Users },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'security', label: 'Security', icon: Shield },
]

type CompanyForm = { name: string; address: string; industry: string }
type PasswordForm = { currentPassword: string; newPassword: string }

function Saved() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-pine">
      <Check size={14} />
      Saved
    </span>
  )
}

function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3">
      <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
      <p className="text-[13px] leading-relaxed text-clay">{message}</p>
    </div>
  )
}

/* ---------------------------------------------------------------- company */

function CompanyProfile() {
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const industries = organizationService.getIndustryOptions()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanyForm>()

  useEffect(() => {
    let cancelled = false

    void organizationService
      .getMine()
      .then((result) => {
        if (cancelled || !result) return
        setOrg(result)
        reset({ name: result.name, address: result.address, industry: result.industry })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reset])

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setSaved(false)

    try {
      const updated = await organizationService.update(values)
      setOrg(updated)
      reset(values)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(
        err instanceof OrganizationError ? err.message : 'We could not save your changes.',
      )
    }
  })

  if (loading) {
    return (
      <Card className="p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-wash" />
        <div className="mt-5 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-ctl bg-wash" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-[15px] font-semibold">Company profile</h2>
      <p className="mt-1 text-[13px] text-muted">
        These details appear on payslips, offer letters and invites.
      </p>

      <Card className="mt-5 p-5">
        <form onSubmit={onSubmit} noValidate>
          {error && (
            <div className="mb-5">
              <ErrorNote message={error} />
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Company name"
              error={errors.name?.message}
              {...register('name', { required: 'Enter your company name.' })}
            />
            <Input
              label="Address"
              error={errors.address?.message}
              {...register('address', { required: 'Enter your company address.' })}
            />
            <Select
              label="Industry"
              options={industries}
              defaultValue={org?.industry}
              error={errors.industry?.message}
              {...register('industry', { required: 'Choose an industry.' })}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-hairline pt-5">
            {saved && <Saved />}
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------- notifications */

const NOTIFICATION_SETTINGS = [
  { id: 'leave', label: 'Leave requests', hint: 'When someone on your team requests time off.' },
  { id: 'payroll', label: 'Payroll runs', hint: 'When a payroll run is ready to review.' },
  { id: 'joiners', label: 'New joiners', hint: 'When someone accepts an invite and joins.' },
  { id: 'reviews', label: 'Performance reviews', hint: 'When a review cycle opens or closes.' },
  { id: 'weekly', label: 'Weekly digest', hint: 'A Monday summary of the week ahead.' },
]

function Notifications() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    leave: true,
    payroll: true,
    joiners: true,
    reviews: false,
    weekly: false,
  })

  return (
    <div>
      <h2 className="text-[15px] font-semibold">Notifications</h2>
      <p className="mt-1 text-[13px] text-muted">
        Choose what Keystone emails you about. No mail is actually sent in this phase.
      </p>

      <Card flush className="mt-5">
        <ul>
          {NOTIFICATION_SETTINGS.map((setting) => {
            const on = enabled[setting.id] ?? false

            return (
              <li
                key={setting.id}
                className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium">{setting.label}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">{setting.hint}</p>
                </div>

                {/* Pill-shaped by design — a toggle is a real convention (§7.2). */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={setting.label}
                  onClick={() => setEnabled((prev) => ({ ...prev, [setting.id]: !on }))}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    on ? 'bg-pine' : 'bg-hairline-strong'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] ${
                      on ? 'left-[1.125rem]' : 'left-0.5'
                    }`}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------- appearance */

function Appearance() {
  return (
    <div>
      <h2 className="text-[15px] font-semibold">Appearance</h2>
      <p className="mt-1 text-[13px] text-muted">How Keystone looks on this device.</p>

      <Card className="mt-5 p-5">
        <div className="flex items-start gap-3">
          <Palette size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
          <div>
            <p className="text-[13.5px] font-medium">Light theme</p>
            <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed text-muted">
              Keystone currently ships one carefully-tuned light theme. A dark theme is
              deliberately not half-built here: every colour token would need a dark counterpart,
              and a rushed one looks worse than none. It is a small, self-contained piece of work
              when you want it.
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-hairline pt-4">
          <p className="text-[13px] font-medium">Reduced motion</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            Animations already follow your system setting
            (<code className="text-ink">prefers-reduced-motion</code>). Turn it on in your OS and
            Keystone stops animating — no toggle needed here.
          </p>
        </div>
      </Card>
    </div>
  )
}

/* --------------------------------------------------------------- security */

function Security() {
  const user = useAuthStore((s) => s.user)!
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ defaultValues: { currentPassword: '', newPassword: '' } })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setSaved(false)

    try {
      await authService.changePassword(values)
      reset()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'We could not change your password.')
    }
  })

  return (
    <div>
      <h2 className="text-[15px] font-semibold">Security</h2>
      <p className="mt-1 text-[13px] text-muted">Your password and session.</p>

      <Card className="mt-5 p-5">
        <form onSubmit={onSubmit} noValidate>
          <p className="text-[13.5px] font-medium">Change password</p>
          <p className="mt-1 text-[12.5px] text-muted">
            We ask for your current password even though you're signed in — it stops anyone at an
            unlocked laptop taking the account over.
          </p>

          {error && (
            <div className="mt-4">
              <ErrorNote message={error} />
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Current password"
              revealable
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword', { required: 'Enter your current password.' })}
            />
            <Input
              label="New password"
              revealable
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'Choose a new password.',
                minLength: { value: 8, message: 'Use at least 8 characters.' },
              })}
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            {saved && <Saved />}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Updating…
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-pine" aria-hidden="true" />
          <div>
            <p className="text-[13.5px] font-medium">Your session</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Signed in as <span className="font-medium text-ink">{user.email}</span> with the{' '}
              <span className="font-medium text-ink">{user.role.toLowerCase()}</span> role. Your
              session is held in an httpOnly cookie, so no script on the page can read it.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------- page */

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('company')

  return (
    <div>
      <div>
        <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
          Settings
        </h1>
        <p className="mt-1.5 text-[14px] text-muted">
          Your company, who can see what, and how Keystone behaves.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        {/* Section nav */}
        <nav aria-label="Settings sections" className="lg:col-span-1">
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {TABS.map((t) => {
              const active = tab === t.key
              const Icon = t.icon

              return (
                <li key={t.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setTab(t.key)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-ctl px-3 py-2 text-[13.5px] whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-pine-tint font-medium text-pine-deep'
                        : 'text-muted hover:bg-wash hover:text-ink'
                    }`}
                  >
                    <Icon size={15} className={active ? 'text-pine' : 'text-muted'} />
                    {t.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 hidden lg:block">
            <Badge tone="accent">Owner only</Badge>
          </div>
        </nav>

        <div className="lg:col-span-3">
          {tab === 'company' && <CompanyProfile />}
          {tab === 'roles' && <RolesPermissions />}
          {tab === 'notifications' && <Notifications />}
          {tab === 'appearance' && <Appearance />}
          {tab === 'security' && <Security />}
        </div>
      </div>
    </div>
  )
}
