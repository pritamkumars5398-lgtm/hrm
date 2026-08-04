import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  AlertCircle, ArrowLeft, Loader2, Building2, MapPin,
  Briefcase, CheckCircle2, Sparkles,
} from 'lucide-react'
import { OrganizationError, organizationService } from '@/services/organizationService'
import { useAuthStore } from '@/features/auth/store/authStore'
import WizardShell from './components/WizardShell'
import { useOnboardingStore } from './store/onboardingStore'


type CompanyForm = {
  name: string
  address: string
  industry: string
}

/* ─── tiny inline-style helpers ─────────────────────────────────────────── */
const field: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
}

const lbl: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#94a3b8',
}

const inputWrap = (hasError: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: hasError ? '#fff5f5' : '#f8fafc',
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
  borderRadius: '8px',
  padding: '0 10px',
  transition: 'border-color 0.18s, box-shadow 0.18s',
})

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.65rem 0',
  fontSize: '14px',
  color: '#1e293b',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  minWidth: 0,
}

const errMsg: React.CSSProperties = {
  fontSize: '11px',
  color: '#ef4444',
  marginTop: '2px',
}

/* ─── focus / blur helpers for the wrapper div ──────────────────────────── */
function onWrapFocus(el: HTMLElement | null) {
  if (!el) return
  el.style.borderColor = '#0d9488'
  el.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.12)'
}
function onWrapBlur(el: HTMLElement | null, hasError: boolean) {
  if (!el) return
  el.style.borderColor = hasError ? '#fca5a5' : '#e2e8f0'
  el.style.boxShadow = 'none'
}

export default function CompanyDetailsStep({ isAdditional = false }: { isAdditional?: boolean }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const attachOrganization = useAuthStore((s) => s.attachOrganization)
  const personal = useOnboardingStore((s) => s.personal)
  const goTo = useOnboardingStore((s) => s.goTo)

  const [formError, setFormError] = useState<string | null>(null)
  const industries = organizationService.getIndustryOptions()

  useEffect(() => {
    if (!isAdditional && !personal) goTo(1)
  }, [personal, goTo, isAdditional])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyForm>({ mode: 'onTouched', defaultValues: { name: '', address: '', industry: '' } })

  const watchedName = watch('name')
  const watchedAddress = watch('address')
  const watchedIndustry = watch('industry')

  if (!isAdditional && user?.organizationId) return <Navigate to="/dashboard" replace />
  if (!isAdditional && !personal) return <Navigate to="/onboarding" replace />

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    if (!user) return
    try {
      const org = await organizationService.create({
        ...values,
        jobTitle: isAdditional ? 'Owner' : (personal?.jobTitle || 'Owner'),
        ownerId: user.id,
      })
      attachOrganization(org.id, isAdditional ? 'Owner' : (personal?.jobTitle || 'Owner'), org.name)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof OrganizationError
          ? err.message
          : 'Could not create workspace. Please try again.',
      )
    }
  })

  const back = () => { goTo(1); navigate('/onboarding', { replace: true }) }

  /* ───────────────────────── wizard (non-additional) ────────────────────── */
  const inputClass = (hasError: boolean) =>
    [
      'w-full bg-transparent border-0 border-b-2 pb-2.5 pt-1 text-[15px] text-gray-900 placeholder-gray-300 outline-none transition-all',
      hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-teal-500',
    ].join(' ')

  const formContent = (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div role="alert" className="mb-5 flex gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-[12px] text-red-700 leading-relaxed">{formError}</p>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={12} className="text-gray-400 shrink-0" />
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Company name</label>
          </div>
          <input type="text" autoComplete="organization" placeholder="Alderway Labs"
            className={inputClass(!!errors.name)}
            {...register('name', { required: 'Enter your company name.', minLength: { value: 2, message: 'That name looks too short.' } })} />
          {errors.name && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Address</label>
          </div>
          <input type="text" autoComplete="street-address" placeholder="4 Wharf Road, London, E15 2QR"
            className={inputClass(!!errors.address)}
            {...register('address', { required: 'Enter your company address.' })} />
          {errors.address
            ? <p className="mt-1.5 text-[11.5px] text-red-500">{errors.address.message}</p>
            : <p className="mt-1.5 text-[11.5px] text-gray-400">Appears on payslips and offer letters.</p>}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={12} className="text-gray-400 shrink-0" />
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Industry</label>
          </div>
          <select className={inputClass(!!errors.industry)} {...register('industry', { required: 'Choose an industry.' })}>
            <option value="" disabled className="text-gray-400">Select an industry</option>
            {industries.map((ind) => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
          </select>
          {errors.industry && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.industry.message}</p>}
        </div>
      </div>
      <div className="mt-6 flex gap-2.5 rounded-xl bg-gray-50 border border-gray-100 p-3.5">
        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />
        <p className="text-[12px] leading-relaxed text-gray-500">
          You'll join as <span className="font-semibold text-gray-800">{user?.name}</span>,{' '}
          <span className="font-semibold text-gray-800">{isAdditional ? 'Owner' : personal?.jobTitle}</span> — the{' '}
          <span className="font-semibold text-gray-800">Owner</span> of this workspace.
        </p>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
        <button type="button" onClick={back} disabled={isSubmitting}
          className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50">
          <ArrowLeft size={14} />Back
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-[14px] font-bold text-white transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
          {isSubmitting ? (<><Loader2 size={15} className="animate-spin" />Creating…</>) : 'Create workspace'}
        </button>
      </div>
    </form>
  )

  /* ───────────────────────── additional-workspace view ───────────────────── */
  if (isAdditional) {
    const filledCount = [!!watchedName, !!watchedAddress, !!watchedIndustry].filter(Boolean).length

    return (
      /* Outer: fill the content area, center the card */
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 56px - 48px)', /* viewport − topbar − p-6 padding */
        padding: '0',
      }}>
        {/* Two-panel card */}
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: '900px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          background: '#fff',
        }}>

          {/* ── Left panel: branding ── */}
          <div style={{
            width: '320px',
            flexShrink: 0,
            background: 'linear-gradient(160deg, #065f46 0%, #10b981 60%, #34d399 100%)',
            padding: '2.25rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative circle */}
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-30px', left: '-30px',
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }} />

            <div>
              {/* Icon */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
              }}>
                <Building2 size={26} color="#ffffff" />
              </div>

              <h1 style={{
                fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: '0.5rem',
              }}>
                Add Company
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
                Create a new workspace and become its owner instantly.
              </p>

              {/* Progress indicator */}
              <div style={{ marginTop: '1.75rem' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Progress
                </p>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      height: '4px', flex: 1, borderRadius: '99px',
                      background: i < filledCount ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.22)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
                  {filledCount} of 3 fields filled
                </p>
              </div>
            </div>

            {/* Bottom info */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Sparkles size={13} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', margin: 0 }}>{user?.name}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>Will be Owner</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel: form ── */}
          <div style={{ flex: 1, padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            {/* Error banner */}
            {formError && (
              <div role="alert" style={{
                marginBottom: '1rem', display: 'flex', gap: '8px',
                borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca',
                padding: '0.625rem 0.875rem',
              }}>
                <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#ef4444' }} />
                <p style={{ fontSize: '12.5px', color: '#b91c1c', lineHeight: 1.5 }}>{formError}</p>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

                {/* Company Name */}
                <div style={field}>
                  <label style={lbl}><Building2 size={10} />Company Name</label>
                  <div style={inputWrap(!!errors.name)}
                    onFocusCapture={e => onWrapFocus(e.currentTarget)}
                    onBlurCapture={e => onWrapBlur(e.currentTarget, !!errors.name)}>
                    <Building2 size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      autoComplete="organization"
                      placeholder="e.g. Alderway Labs"
                      style={inputStyle}
                      {...register('name', {
                        required: 'Enter your company name.',
                        minLength: { value: 2, message: 'Name is too short.' },
                      })}
                    />
                  </div>
                  {errors.name && <p style={errMsg}>{errors.name.message}</p>}
                </div>

                {/* Address */}
                <div style={field}>
                  <label style={lbl}><MapPin size={10} />Address</label>
                  <div style={inputWrap(!!errors.address)}
                    onFocusCapture={e => onWrapFocus(e.currentTarget)}
                    onBlurCapture={e => onWrapBlur(e.currentTarget, !!errors.address)}>
                    <MapPin size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      autoComplete="street-address"
                      placeholder="4 Wharf Road, London, E15 2QR"
                      style={inputStyle}
                      {...register('address', { required: 'Enter your company address.' })}
                    />
                  </div>
                  {errors.address
                    ? <p style={errMsg}>{errors.address.message}</p>
                    : <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Appears on payslips and offer letters.</p>}
                </div>

                {/* Industry */}
                <div style={field}>
                  <label style={lbl}><Briefcase size={10} />Industry</label>
                  <div style={{ ...inputWrap(!!errors.industry), position: 'relative' }}
                    onFocusCapture={e => onWrapFocus(e.currentTarget)}
                    onBlurCapture={e => onWrapBlur(e.currentTarget, !!errors.industry)}>
                    <Briefcase size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <select
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: '1.5rem' }}
                      {...register('industry', { required: 'Choose an industry.' })}
                    >
                      <option value="" disabled>Select an industry</option>
                      {industries.map((ind) => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
                    </select>
                    {/* chevron */}
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {errors.industry && <p style={errMsg}>{errors.industry.message}</p>}
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #f1f5f9', margin: '1.25rem 0' }} />

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '13.5px', fontWeight: 700, color: '#64748b',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    opacity: isSubmitting ? 0.5 : 1, transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1e293b')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                  <ArrowLeft size={13} />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    borderRadius: '10px', padding: '0.6rem 1.5rem',
                    fontSize: '14px', fontWeight: 700, color: '#fff',
                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #15803d 100%)',
                    border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: 'none', transition: 'opacity 0.15s, transform 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {isSubmitting
                    ? (<><Loader2 size={14} className="animate-spin" />Creating…</>)
                    : 'Create workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  /* ───────────────────────── onboarding wizard ───────────────────────────── */
  return (
    <WizardShell
      current={2}
      title="Now, your company"
      subtitle="This creates your workspace. You'll be its owner, and you can invite your HR team and managers straight after."
    >
      {formContent}
    </WizardShell>
  )
}
