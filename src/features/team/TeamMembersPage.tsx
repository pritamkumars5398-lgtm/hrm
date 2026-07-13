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
} from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'
import { useAuthStore } from '@/features/auth/store/authStore'
import { TeamError, teamService, type InvitableRole, type Member } from '@/services/teamService'
import { useTeamStore } from './store/teamStore'

type InviteForm = { email: string; role: InvitableRole | '' }

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Owner',
  HR: 'HR',
  MANAGER: 'Manager',
}

function RoleBadge({ role }: { role: string }) {
  const tone =
    role === 'OWNER'
      ? 'bg-pine-tint text-pine-deep'
      : role === 'HR'
        ? 'bg-[#F6EEDC] text-[#7A5712]'
        : 'bg-wash text-muted'

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {ROLE_LABEL[role] ?? role}
    </span>
  )
}

/** Shown after an invite is created — there is no SMTP, so the link is copied by hand (§11.3). */
function InviteLinkPanel({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 rounded-ctl border border-pine/30 bg-pine-tint/40 p-3.5">
      <p className="text-[12px] font-medium text-pine-deep">Invite created</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        No email is sent in this phase — copy the link and send it to them yourself.
      </p>

      <div className="mt-2.5 flex items-center gap-2">
        <code className="flex-1 truncate rounded-ctl border border-hairline bg-surface px-2.5 py-1.5 text-[12px] text-muted">
          {link}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface px-2.5 text-[12px] font-medium transition-colors hover:border-pine hover:text-pine"
        >
          {copied ? <Check size={13} className="text-pine" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-hairline px-4 py-3.5 last:border-0">
      <div className="size-8 shrink-0 animate-pulse rounded-full bg-wash" />
      <div className="flex-1">
        <div className="h-3.5 w-40 animate-pulse rounded bg-wash" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-wash" />
      </div>
    </div>
  )
}

export default function TeamMembersPage() {
  const currentUser = useAuthStore((s) => s.user)!
  const { status, members, invites, error, load, upsertInvite, dropMember } = useTeamStore()

  const [inviteLink, setInviteLink] = useState<string | null>(null)
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

    try {
      const { invite, inviteLink: link } = await teamService.invite({
        email: values.email,
        role: values.role as InvitableRole,
      })

      upsertInvite(invite)
      setInviteLink(link)
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
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
          Team Members
        </h1>
        <p className="mt-1.5 text-[14px] text-muted">
          Everyone with access to your workspace, and the invites you have outstanding.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="mt-6 flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3"
        >
          <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
          <p className="text-[13px] leading-relaxed text-clay">{formError}</p>
        </div>
      )}

      {/* Invite — Owner and HR only (§10) */}
      {canManage && (
        <section className="mt-6 rounded-card border border-hairline bg-surface p-5">
          <h2 className="text-[14px] font-semibold">Invite someone</h2>
          <p className="mt-1 text-[13px] text-muted">
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
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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

          {inviteLink && <InviteLinkPanel link={inviteLink} />}
        </section>
      )}

      {/* Pending invites */}
      {canManage && (
        <section className="mt-6 overflow-hidden rounded-card border border-hairline bg-surface">
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold">
              Pending invites{' '}
              {status === 'ready' && (
                <span className="tnum ml-1 font-normal text-muted">{pendingInvites.length}</span>
              )}
            </h2>
          </div>

          {status === 'loading' && <RowSkeleton />}

          {status === 'ready' &&
            (pendingInvites.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[14px] font-medium">No invites outstanding</p>
                <p className="mt-1 text-[13px] text-muted">
                  Anyone you invite will show up here until they accept.
                </p>
              </div>
            ) : (
              <ul>
                {pendingInvites.map((invite) => {
                  const busy = busyId === invite.id
                  const expiresIn = Math.max(
                    0,
                    Math.ceil(
                      (new Date(invite.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
                    ),
                  )

                  return (
                    <li
                      key={invite.id}
                      className="flex flex-wrap items-center gap-3 border-b border-hairline px-4 py-3.5 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium">{invite.email}</p>
                        <p className="tnum mt-0.5 text-[12px] text-muted">
                          Expires in {expiresIn} {expiresIn === 1 ? 'day' : 'days'}
                        </p>
                      </div>

                      <RoleBadge role={invite.role} />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void onResend(invite.id)}
                          disabled={busy}
                          className="inline-flex h-8 items-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface px-2.5 text-[12px] font-medium transition-colors hover:border-pine hover:text-pine disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <RotateCw size={13} />
                          )}
                          Resend
                        </button>

                        <button
                          type="button"
                          onClick={() => void onRevoke(invite.id)}
                          disabled={busy}
                          aria-label={`Revoke invite for ${invite.email}`}
                          className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-clay hover:text-clay disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ))}
        </section>
      )}

      {/* Members */}
      <section className="mt-6 overflow-hidden rounded-card border border-hairline bg-surface">
        <div className="border-b border-hairline px-4 py-3">
          <h2 className="text-[13px] font-semibold">
            Members{' '}
            {status === 'ready' && (
              <span className="tnum ml-1 font-normal text-muted">{members.length}</span>
            )}
          </h2>
        </div>

        {status === 'error' && (
          <div className="px-4 py-10 text-center">
            <p className="text-[14px] font-medium text-clay">{error}</p>
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
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        )}

        {status === 'ready' && (
          <ul>
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 border-b border-hairline px-4 py-3.5 last:border-0"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-wash text-[11px] font-semibold text-muted">
                  {member.avatarInitials}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">
                    {member.name}
                    {member.id === currentUser.id && (
                      <span className="ml-1.5 text-[12px] font-normal text-muted">(you)</span>
                    )}
                  </p>
                  <p className="truncate text-[12px] text-muted">{member.email}</p>
                </div>

                <RoleBadge role={member.role} />

                {canRemove && member.role !== 'OWNER' && member.id !== currentUser.id && (
                  <button
                    type="button"
                    onClick={() => setPendingRemoval(member)}
                    aria-label={`Remove ${member.name}`}
                    className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-clay hover:text-clay"
                  >
                    <UserMinus size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

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
    </div>
  )
}
