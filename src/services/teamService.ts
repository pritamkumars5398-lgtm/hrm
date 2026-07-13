import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { mockInvites, type Invite, type InvitableRole, type InviteStatus } from '@/mock/mockInvites'
import { mockUsers } from '@/mock/mockUsers'
import type { User } from './authService'

export type { Invite, InvitableRole, InviteStatus }

/** A member is a user of the org, minus anything secret. */
export type Member = Omit<User, 'password'>

export type InvitePreview = {
  email: string
  role: string
  organizationName: string
  invitedByName: string
}

export type AcceptInvitePayload = {
  token: string
  fullName: string
  phone: string
  jobTitle: string
  password: string
}

export class TeamError extends Error {}

const LATENCY_MS = 600
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Mutable copy so the mock path can add/revoke without touching the seed. */
let mockInviteState: Invite[] = [...mockInvites]
let mockMemberState: Member[] = mockUsers.map(({ password: _password, ...m }) => m)

const mockLink = (id: string) => `${window.location.origin}/accept-invite?token=mock-${id}`

/**
 * Team Members is **access-control**, so it is backed by the real backend
 * (§16, §11.3) — not mock HR data. The mock path exists only so the Vercel demo
 * runs with no backend.
 */
export const teamService = {
  async getMembers(): Promise<Member[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Member[]>('/members')
        return data
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'We could not load your team.'))
      }
    }

    await delay()
    return mockMemberState
  },

  async getInvites(): Promise<Invite[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Invite[]>('/invites')
        return data
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'We could not load your invites.'))
      }
    }

    await delay()
    return mockInviteState
  },

  async invite(payload: { email: string; role: InvitableRole }): Promise<{
    invite: Invite
    inviteLink: string
  }> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<{ invite: Invite; inviteLink: string }>(
          '/invites',
          payload,
        )
        return data
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'We could not send that invite.'))
      }
    }

    await delay()
    const email = payload.email.trim().toLowerCase()

    if (mockMemberState.some((m) => m.email === email)) {
      throw new TeamError('That person already has an account.')
    }
    if (mockInviteState.some((i) => i.email === email && i.status === 'PENDING')) {
      throw new TeamError('There is already a pending invite for that email.')
    }

    const invite: Invite = {
      id: `inv-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: mockMemberState[0]!.organizationId!,
      email,
      role: payload.role,
      status: 'PENDING',
      invitedBy: 'usr-1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    mockInviteState = [invite, ...mockInviteState]
    return { invite, inviteLink: mockLink(invite.id) }
  },

  async resendInvite(id: string): Promise<{ invite: Invite; inviteLink: string }> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<{ invite: Invite; inviteLink: string }>(
          `/invites/${id}/resend`,
        )
        return data
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'We could not resend that invite.'))
      }
    }

    await delay()
    const invite = mockInviteState.find((i) => i.id === id)
    if (!invite) throw new TeamError('Invite not found.')

    const refreshed: Invite = {
      ...invite,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    mockInviteState = mockInviteState.map((i) => (i.id === id ? refreshed : i))
    return { invite: refreshed, inviteLink: mockLink(id) }
  },

  async revokeInvite(id: string): Promise<Invite> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<Invite>(`/invites/${id}/revoke`)
        return data
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'We could not revoke that invite.'))
      }
    }

    await delay()
    const invite = mockInviteState.find((i) => i.id === id)
    if (!invite) throw new TeamError('Invite not found.')

    const revoked: Invite = { ...invite, status: 'REVOKED' }
    mockInviteState = mockInviteState.map((i) => (i.id === id ? revoked : i))
    return revoked
  },

  async removeMember(id: string): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.delete(`/members/${id}`)
        return
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'We could not remove that member.'))
      }
    }

    await delay()
    mockMemberState = mockMemberState.filter((m) => m.id !== id)
  },

  /** Public — the invitee has no session yet. */
  async previewInvite(token: string): Promise<InvitePreview> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<InvitePreview>('/invites/preview', {
          params: { token },
        })
        return data
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'This invite link is not valid.'))
      }
    }

    await delay()
    const id = token.replace(/^mock-/, '')
    const invite = mockInviteState.find((i) => i.id === id && i.status === 'PENDING')
    if (!invite) throw new TeamError('This invite link is not valid.')

    return {
      email: invite.email,
      role: invite.role,
      organizationName: 'Alderway Labs',
      invitedByName: 'Priya Nair',
    }
  },

  async acceptInvite(payload: AcceptInvitePayload): Promise<User> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<User>('/invites/accept', payload)
        return data
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'We could not accept that invite.'))
      }
    }

    await delay()
    const preview = await teamService.previewInvite(payload.token)
    const id = payload.token.replace(/^mock-/, '')

    mockInviteState = mockInviteState.map((i) =>
      i.id === id ? { ...i, status: 'ACCEPTED' as const } : i,
    )

    return {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: mockMemberState[0]!.organizationId!,
      email: preview.email,
      password: '',
      name: payload.fullName,
      jobTitle: payload.jobTitle,
      // Role comes from the invite, never from the invitee.
      role: preview.role as 'HR' | 'MANAGER',
      avatarInitials: payload.fullName
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    }
  },
}
