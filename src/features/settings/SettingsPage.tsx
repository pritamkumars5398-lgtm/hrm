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
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

const TABS: Array<{ key: Tab; label: string; icon: typeof Building2; color: string }> = [
  { key: 'company', label: 'Company profile', icon: Building2, color: 'text-indigo-500' },
  { key: 'roles', label: 'Roles & Permissions', icon: Users, color: 'text-violet-500' },
  { key: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-500' },
  { key: 'appearance', label: 'Appearance', icon: Palette, color: 'text-emerald-600' },
  { key: 'security', label: 'Security', icon: Shield, color: 'text-rose-500' },
]

type CompanyForm = { name: string; address: string; industry: string; leaveNotificationEmail: string }
type PasswordForm = { currentPassword: string; newPassword: string }

function Saved() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/40 shadow-sm">
      <Check size={14} />
      Saved successfully
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
        reset({
          name: result.name,
          address: result.address,
          industry: result.industry,
          leaveNotificationEmail: result.leaveNotificationEmail ?? '',
        })
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
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">Company profile</h2>
        <p className="mt-1 text-[13px] text-muted font-medium">
          These details appear on payslips, offer letters and invites.
        </p>
      </div>

      <Card className="p-5">
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

          <div className="mt-6 border-t border-hairline pt-5">
            <h3 className="text-[13.5px] font-semibold text-ink">Leave notifications</h3>
            <p className="mt-1 text-[12.5px] text-muted">
              When someone applies for leave, an email goes to this address. Leave it blank to turn
              notifications off.
            </p>
            <Input
              label="Notification email"
              type="email"
              className="mt-3"
              placeholder="hr@yourcompany.com"
              error={errors.leaveNotificationEmail?.message}
              {...register('leaveNotificationEmail', {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' },
              })}
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
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
        <p className="mt-1 text-[13px] text-muted font-medium">
          Choose what Keystone emails you about. No mail is actually sent in this phase.
        </p>
      </div>

      <Card flush className="overflow-hidden">
        <ul className="divide-y divide-hairline">
          {NOTIFICATION_SETTINGS.map((setting) => {
            const on = enabled[setting.id] ?? false

            return (
              <li
                key={setting.id}
                className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-wash/20 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-ink">{setting.label}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted font-medium">{setting.hint}</p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={setting.label}
                  onClick={() => setEnabled((prev) => ({ ...prev, [setting.id]: !on }))}
                  className={`relative h-5.5 w-10 shrink-0 rounded-full transition-all duration-200 cursor-pointer focus:outline-none ${
                    on ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.15)]' : 'bg-hairline-strong'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-4.5 rounded-full bg-white transition-[left] duration-200 shadow-sm ${
                      on ? 'left-[1.25rem]' : 'left-0.5'
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
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">Appearance</h2>
        <p className="mt-1 text-[13px] text-muted font-medium">Configure how Keystone looks on this device.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Active Light Theme Preview */}
        <Card className="p-4 border border-pine flex flex-col justify-between h-48 relative overflow-hidden bg-surface shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-ink flex items-center gap-1.5">
                <Palette size={14} className="text-pine" />
                Keystone Light
              </span>
              <span className="text-[10px] text-pine font-bold bg-pine-tint px-2 py-0.2 rounded-full border border-pine/10">Active</span>
            </div>
            <p className="text-[11.5px] text-muted leading-relaxed max-w-[200px] font-medium">
              Alderway's premium brand theme featuring clean borders and emerald pine accents.
            </p>
          </div>
          
          {/* Visual Color Palette Preview Dots */}
          <div className="flex items-center gap-4 border-t border-hairline pt-3.5">
            <div className="flex flex-col gap-1 items-center">
              <span className="size-4.5 rounded-full bg-pine border border-pine/15" />
              <span className="text-[8px] font-bold text-muted uppercase tracking-wider">Pine</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <span className="size-4.5 rounded-full bg-wash border border-hairline-strong" />
              <span className="text-[8px] font-bold text-muted uppercase tracking-wider">Wash</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <span className="size-4.5 rounded-full bg-clay border border-clay/15" />
              <span className="text-[8px] font-bold text-muted uppercase tracking-wider">Clay</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <span className="size-4.5 rounded-full bg-ink border border-ink/15" />
              <span className="text-[8px] font-bold text-muted uppercase tracking-wider">Ink</span>
            </div>
          </div>
        </Card>

        {/* Locked Dark Theme Preview */}
        <Card className="p-4 border border-hairline flex flex-col justify-between h-48 relative overflow-hidden bg-wash/30 opacity-75">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-muted flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-muted" />
                Keystone Dark
              </span>
              <span className="text-[10px] text-muted font-bold bg-wash border border-hairline-strong px-2 py-0.2 rounded-full">Locked</span>
            </div>
            <p className="text-[11.5px] text-muted leading-relaxed max-w-[200px] font-medium">
              Deep charcoal hues designed to reduce eye strain in low-light environments.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-hairline/60 pt-3.5">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Coming in Phase 2</span>
            <div className="flex gap-1.5">
              <span className="size-4 rounded-full bg-slate-800 border border-slate-700" />
              <span className="size-4 rounded-full bg-slate-900 border border-slate-800" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-[13px] font-bold text-ink">Reduced motion</h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted font-medium">
          Animations already follow your system setting
          (<code className="text-ink bg-wash px-1 py-0.2 rounded border border-hairline">prefers-reduced-motion</code>). Turn it on in your OS and
          Keystone stops animating — no toggle needed here.
        </p>
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
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">Security</h2>
        <p className="mt-1 text-[13px] text-muted font-medium">Your password and session.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={onSubmit} noValidate>
          <p className="text-[13.5px] font-bold text-ink">Change password</p>
          <p className="mt-1 text-[12.5px] text-muted font-medium">
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

          <div className="mt-5 flex items-center justify-end gap-3 border-t border-hairline pt-4">
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

      <Card className="p-5 border border-hairline bg-surface hover:shadow-sm transition-all duration-300">
        <div className="flex items-start gap-3">
          <span className="inline-flex p-2 bg-pine-tint text-pine rounded-ctl border border-pine/10 shrink-0">
            <ShieldCheck size={16} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-[13.5px] font-bold text-ink">Active Session Status</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted font-medium">
              Signed in as <span className="font-bold text-ink">{user.email}</span> with active{' '}
              <span className="font-bold text-pine uppercase bg-pine-tint px-1.5 py-0.2 rounded text-[10px] tracking-wider">{user.role}</span> privileges.
            </p>
            <p className="mt-2 text-[11px] text-muted font-medium leading-relaxed">
              Your session is secured using standard HttpOnly flags, protecting cookies against client-side script access.
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Settings
          </h1>
          <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
            <Sparkles size={13} />
          </span>
        </div>
        <p className="mt-1.5 text-[14px] text-muted">
          Your company, who can see what, and how Keystone behaves.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Section nav */}
        <nav aria-label="Settings sections" className="lg:col-span-1">
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:space-y-1">
            {TABS.map((t) => {
              const active = tab === t.key
              const Icon = t.icon
              const activeColor = t.color

              return (
                <li key={t.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setTab(t.key)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-ctl px-3.5 py-2.5 text-[13.5px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-[3px] border-emerald-500 pl-3 rounded-l-none'
                        : 'text-muted hover:bg-wash hover:text-ink border-l-[3px] border-transparent pl-3'
                    }`}
                  >
                    <Icon size={15} className={active ? activeColor : 'text-muted'} />
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
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'company' && <CompanyProfile />}
              {tab === 'roles' && <RolesPermissions />}
              {tab === 'notifications' && <Notifications />}
              {tab === 'appearance' && <Appearance />}
              {tab === 'security' && <Security />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
