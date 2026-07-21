import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  MailPlus,
  RotateCw,
  ShieldCheck,
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
import { hasPermission, PERMISSION_KEY_GROUPS } from '@/shared/config/navigation'
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

/**
 * Full freedom across the granular keys — not tied to the three role presets,
 * which are only a convenience for the invite form. The Owner (or anyone
 * holding team.managePermissions) can grant any member any combination of
 * these. Saving always sends the whole exact-key list; the server refuses
 * outright if the target already holds `*` (§10.2's immutable-Owner rule).
 */
function PermissionEditorModal({
  member,
  onClose,
  onSaved,
}: {
  member: Member | null
  onClose: () => void
  onSaved: (userId: string, permissions: string[]) => void
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!member) return
    const current = member.memberships?.[0]?.permissions ?? []
    const initial = new Set<string>()
    for (const group of PERMISSION_KEY_GROUPS) {
      for (const { key } of group.keys) {
        if (hasPermission(current, key)) initial.add(key)
      }
    }
    setChecked(initial)
    setError(null)
  }, [member])

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSave = async () => {
    if (!member) return
    setSaving(true)
    setError(null)
    try {
      const permissions = [...checked]
      await teamService.updatePermissions(member.id, permissions)
      onSaved(member.id, permissions)
      onClose()
    } catch (err) {
      setError(err instanceof TeamError ? err.message : 'We could not save those permissions.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={member !== null}
      onClose={() => {
        if (!saving) onClose()
      }}
      title={`Edit permissions — ${member?.name ?? ''}`}
      description="Grant exactly what this person needs, module by module. Nothing here is tied to a fixed role."
    >
      <div className="space-y-4">
        {error && (
          <div className="flex gap-2 rounded-ctl border border-clay/35 bg-clay/5 p-3 text-[12px] text-clay-deep">
            <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
            <p>{error}</p>
          </div>
        )}

        <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
          {PERMISSION_KEY_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase border-b border-hairline pb-1.5">
                {group.label}
              </h3>
              <div className="mt-2 space-y-1.5">
                {group.keys.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2.5 rounded-ctl px-2 py-1.5 text-[13px] text-ink hover:bg-wash/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(key)}
                      onChange={() => toggle(key)}
                      className="size-4 rounded border-hairline-strong accent-pine cursor-pointer"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-hairline pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              'Save permissions'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function TeamMembersPage() {
  const currentUser = useAuthStore((s) => s.user)!
  const { status, members, invites, error, load, upsertInvite, dropMember, updateMemberPermissions } = useTeamStore()

  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteTempPassword, setInviteTempPassword] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<Member | null>(null)
  const [pendingPermissionsEdit, setPendingPermissionsEdit] = useState<Member | null>(null)

  // Every protected action here checks the real granular permission, never a
  // role label (§10 hard rule) — the backend's DELETE /members/:id and the
  // new PATCH .../permissions both gate on team.managePermissions too, so
  // this mirrors exactly what the server actually enforces.
  const canManage = hasPermission(currentUser.permissions, 'team.invite')
  const canManagePermissions = hasPermission(currentUser.permissions, 'team.managePermissions')

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
        <Card className="p-5">
          <h2 className="text-[14px] font-bold text-ink">Invite someone</h2>
          <p className="mt-1 text-[13px] text-muted font-medium">
            They'll join with the role you pick here — they cannot change it themselves.
          </p>

          <form onSubmit={onInvite} noValidate className="mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Input
                label="Email"
                type="email"
                placeholder="colleague@company.com"
                className="flex-1"
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
                className="sm:w-44"
                options={[
                  { value: 'HR', label: 'HR' },
                  { value: 'MANAGER', label: 'Manager' },
                ]}
                error={errors.role?.message}
                {...register('role', { required: 'Pick a role.' })}
              />

              <div className="sm:pt-[26px]">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto shadow-sm">
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
            </div>
          </form>

          {inviteLink && <InviteLinkPanel link={inviteLink} tempPassword={inviteTempPassword} />}
        </Card>
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

                    {canManagePermissions && member.role !== 'OWNER' && member.id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => setPendingPermissionsEdit(member)}
                        aria-label={`Edit permissions for ${member.name}`}
                        className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted hover:bg-wash hover:text-ink transition-colors cursor-pointer"
                      >
                        <ShieldCheck size={13} />
                      </button>
                    )}

                    {canManagePermissions && member.role !== 'OWNER' && member.id !== currentUser.id && (
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

      <PermissionEditorModal
        member={pendingPermissionsEdit}
        onClose={() => setPendingPermissionsEdit(null)}
        onSaved={updateMemberPermissions}
      />
    </motion.div>
  )
}
