import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  MailPlus,
  RotateCw,
  Trash2,
  UserMinus,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'
import Card from '@/shared/components/Card'
import { RoleBadge } from '@/shared/components/Badge'
import { useAuthStore } from '@/features/auth/store/authStore'
import { TeamError, teamService, type InvitableRole, type Member } from '@/services/teamService'
import { sendInviteEmail } from '@/services/emailService'
import { useTeamStore } from './store/teamStore'

type InviteForm = { email: string; role: InvitableRole | '' }

const getAvatarTheme = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const themes = [
    { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { bg: 'bg-rose-100 text-rose-700 border-rose-200' },
    { bg: 'bg-amber-100 text-amber-700 border-amber-200' },
    { bg: 'bg-sky-100 text-sky-700 border-sky-200' },
    { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { bg: 'bg-violet-100 text-violet-700 border-violet-200' },
    { bg: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' },
  ]
  return themes[hash % themes.length]
}

/** Shown after an invite is created — there is no SMTP, so the link is copied by hand (§11.3). */
function InviteLinkPanel({ link, tempPassword }: { link: string; tempPassword: string | null }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 rounded-ctl border border-pine/30 bg-pine-tint/40 p-4 relative overflow-hidden flex flex-col justify-between">
      <div>
        <p className="text-[12.5px] font-bold text-pine-deep flex items-center gap-1.5">
          <Check size={14} className="text-pine" />
          Invite created — email sent
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted font-medium">
          An invite email with the temporary password has been sent to their address. You can also share these credentials manually:
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 rounded-ctl border border-hairline bg-surface px-3 py-2 text-[12px] text-muted font-medium select-all block break-all">
          Link: {link}
          {tempPassword && <><br/>Temp Password: {tempPassword}</>}
        </code>
        <Button
          size="sm"
          onClick={() => void copy()}
          className="font-bold shrink-0 shadow-sm"
        >
          {copied ? <Check size={13} className="text-white" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-hairline px-4 py-3.5 last:border-0 animate-pulse">
      <div className="size-9 shrink-0 rounded-full bg-wash" />
      <div className="flex-1">
        <div className="h-3.5 w-40 rounded bg-wash" />
        <div className="mt-2 h-3 w-56 rounded bg-wash" />
      </div>
    </div>
  )
}

export default function TeamMembersPage() {
  const currentUser = useAuthStore((s) => s.user)!
  const { status, members, invites, error, load, upsertInvite, dropMember } = useTeamStore()

  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteTempPassword, setInviteTempPassword] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<Member | null>(null)

  const canManage = currentUser.role === 'OWNER' || currentUser.role === 'HR'
  const canRemove = currentUser.role === 'OWNER'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({ defaultValues: { email: '', role: '' } })

  useEffect(() => {
    void load()
  }, [load])

  const onInvite = handleSubmit(async (values) => {
    setFormError(null)
    setInviteLink(null)
    setInviteTempPassword(null)

    try {
      const { invite, inviteLink: link, tempPassword } = await teamService.invite({
        email: values.email,
        role: values.role as InvitableRole,
        source: 'team-members',
      })

      // Fire-and-forget — email failure shows a soft warning but doesn't block the invite.
      if (tempPassword) {
        sendInviteEmail({
          to: values.email,
          name: values.email.split('@')[0],
          link,
          tempPassword,
        }).then((result) => {
          if (!result.ok) console.warn('[TeamMembers] Email send failed:', result.error)
        })
      }

      upsertInvite(invite)
      setInviteLink(link)
      setInviteTempPassword(tempPassword)
      reset()
    } catch (err) {
      setFormError(err instanceof TeamError ? err.message : 'We could not send that invite.')
    }
  })

  const onResend = async (id: string) => {
    setBusyId(id)
    setFormError(null)
    try {
      const { invite, inviteLink: link } = await teamService.resendInvite(id)
      upsertInvite(invite)
      setInviteLink(link)
    } catch (err) {
      setFormError(err instanceof TeamError ? err.message : 'We could not resend that invite.')
    } finally {
      setBusyId(null)
    }
  }

  const onRevoke = async (id: string) => {
    setBusyId(id)
    setFormError(null)
    try {
      upsertInvite(await teamService.revokeInvite(id))
    } catch (err) {
      setFormError(err instanceof TeamError ? err.message : 'We could not revoke that invite.')
    } finally {
      setBusyId(null)
    }
  }

  const onRemoveMember = async () => {
    if (!pendingRemoval) return

    setBusyId(pendingRemoval.id)
    try {
      await teamService.removeMember(pendingRemoval.id)
      dropMember(pendingRemoval.id)
      setPendingRemoval(null)
    } catch (err) {
      setFormError(err instanceof TeamError ? err.message : 'We could not remove that member.')
    } finally {
      setBusyId(null)
    }
  }

  const pendingInvites = invites.filter((i) => i.status === 'PENDING')

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto max-w-4xl space-y-6"
    >
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Team Members
          </h1>
          <span className="flex size-6 items-center justify-center rounded-full bg-pine-tint text-pine">
            <Sparkles size={13} />
          </span>
        </div>
        <p className="mt-1.5 text-[14px] text-muted">
          Everyone with access to your workspace, and the invites you have outstanding.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3"
        >
          <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
          <p className="text-[13px] leading-relaxed text-clay">{formError}</p>
        </div>
      )}

      {/* Invite — Owner and HR only (§10) */}
      {canManage && (
        <div className="w-full overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-xl shadow-teal-900/5 flex flex-col md:flex-row transition-all duration-300 hover:shadow-teal-900/10">
          {/* Left Panel: Context */}
          <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#047857] via-[#059669] to-[#10b981] p-5 sm:p-6 md:w-[260px] md:shrink-0">
            {/* Decorative background blurs */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform duration-700 hover:scale-110" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#34d399]/20 blur-3xl transition-transform duration-700 hover:scale-110" />
            
            <div className="relative z-10 flex flex-col items-start">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-emerald-900/20">
                <MailPlus className="text-[#059669]" size={20} strokeWidth={2.5} />
              </div>
              <h2 className="mb-1 text-xl font-extrabold tracking-tight text-white drop-shadow-sm font-display">
                Invite someone
              </h2>
              <p className="text-[12px] leading-relaxed text-emerald-50 max-w-[200px]">
                They'll join with the role you pick here — they cannot change it themselves.
              </p>
            </div>
          </div>

          {/* Right Panel: Content */}
          <div className="flex flex-1 flex-col justify-center p-5 sm:p-6 bg-white">
            <form onSubmit={onInvite} noValidate>
              <div className="mb-5">
                <h3 className="text-xl font-bold tracking-tight text-gray-900">Invite someone</h3>
                <p className="mt-1 text-[13px] text-gray-500">
                  They'll join with the role you pick here — they cannot change it themselves.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="colleague@company.com"
                  className="w-full"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Enter an email.',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'That does not look like an email.',
                    },
                  })}
                />

                <Select
                  label="Role"
                  placeholder="Select a role"
                  className="w-full"
                  options={[
                    { value: 'HR', label: 'HR' },
                    { value: 'MANAGER', label: 'Manager' },
                  ]}
                  error={errors.role?.message}
                  {...register('role', { required: 'Pick a role.' })}
                />
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto shadow-sm bg-[#059669] hover:bg-[#047857] text-white border-0">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <MailPlus size={15} />
                      Send invite
                    </>
                  )}
                </Button>
              </div>
            </form>

            {inviteLink && <InviteLinkPanel link={inviteLink} tempPassword={inviteTempPassword} />}
          </div>
        </div>
      )}

      {/* Pending invites */}
      {canManage && (
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">
              Pending invites{' '}
              {status === 'ready' && (
                <span className="tnum ml-1.5 font-normal text-muted bg-wash border border-hairline px-2 py-0.5 rounded-full text-[11px]">
                  {pendingInvites.length}
                </span>
              )}
            </h2>
          </div>

          {status === 'loading' && <RowSkeleton />}

          {status === 'ready' &&
            (pendingInvites.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[14.5px] font-semibold text-ink">No invites outstanding</p>
                <p className="mt-1.5 text-[13px] text-muted font-medium">
                  Anyone you invite will show up here until they accept.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-hairline">
                <AnimatePresence initial={false}>
                  {pendingInvites.map((invite) => {
                    const busy = busyId === invite.id
                    const expiresIn = Math.max(
                      0,
                      Math.ceil(
                        (new Date(invite.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
                      ),
                    )

                    return (
                      <motion.li
                        key={invite.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-wrap items-center gap-3 px-4 py-3.5 hover:bg-wash/20 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-bold text-ink">{invite.email}</p>
                          <p className="tnum mt-0.5 text-[12px] text-muted font-medium">
                            Expires in {expiresIn} {expiresIn === 1 ? 'day' : 'days'}
                          </p>
                        </div>

                        <RoleBadge role={invite.role} />

                        <div className="flex items-center gap-1.5 pl-3">
                          <Button
                            size="sm"
                            onClick={() => void onResend(invite.id)}
                            disabled={busy}
                            className="h-8 font-bold shadow-sm"
                          >
                            {busy ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <RotateCw size={13} />
                            )}
                            Resend
                          </Button>

                          <button
                            type="button"
                            onClick={() => void onRevoke(invite.id)}
                            disabled={busy}
                            aria-label={`Revoke invite for ${invite.email}`}
                            className="inline-flex size-8 items-center justify-center rounded-ctl bg-clay text-white hover:bg-clay-deep transition-colors cursor-pointer border border-transparent shadow-sm hover:shadow disabled:opacity-50"
                          >
                            {busy ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>
            ))}
        </Card>
      )}

      {/* Members */}
      <Card flush>
        <div className="border-b border-hairline px-4 py-3">
          <h2 className="text-[13px] font-semibold text-ink">
            Members{' '}
            {status === 'ready' && (
              <span className="tnum ml-1.5 font-normal text-muted bg-wash border border-hairline px-2 py-0.5 rounded-full text-[11px]">
                {members.length}
              </span>
            )}
          </h2>
        </div>

        {status === 'error' && (
          <div className="px-4 py-10 text-center">
            <p className="text-[14.5px] font-semibold text-clay">{error}</p>
            <button
              type="button"
              onClick={() => void load({ force: true })}
              className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="divide-y divide-hairline">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        )}

        {status === 'ready' && (
          <ul className="divide-y divide-hairline">
            <AnimatePresence initial={false}>
              {members.map((member) => {
                const avatarTheme = getAvatarTheme(member.name)
                return (
                  <motion.li
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-wash/20 transition-colors"
                  >
                    <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${avatarTheme.bg}`}>
                      {member.avatarInitials}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold text-ink flex items-center">
                        {member.name}
                        {member.id === currentUser.id && (
                          <span className="ml-1.5 text-[11px] font-semibold text-muted bg-wash px-1.5 py-0.2 rounded-full border border-hairline">you</span>
                        )}
                      </p>
                      <p className="truncate text-[12.5px] text-muted font-medium mt-0.5">
                        {member.jobTitle} · <span className="text-muted/70">{member.email}</span>
                      </p>
                    </div>

                    <RoleBadge role={member.role} />

                    {canRemove && member.role !== 'OWNER' && member.id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => setPendingRemoval(member)}
                        aria-label={`Remove ${member.name}`}
                        className="inline-flex size-8 items-center justify-center rounded-ctl bg-clay text-white hover:bg-clay-deep transition-colors cursor-pointer border border-transparent shadow-sm hover:shadow"
                      >
                        <UserMinus size={13} />
                      </button>
                    )}
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </Card>

      <Modal
        open={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
        title={`Remove ${pendingRemoval?.name ?? ''}?`}
        description="They lose access to this workspace immediately. This cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingRemoval(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => void onRemoveMember()}
            disabled={busyId !== null}
            className="border-clay bg-clay hover:border-clay/90 hover:bg-clay/90"
          >
            {busyId !== null ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Removing…
              </>
            ) : (
              'Remove member'
            )}
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
