import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { mockInvites, type Invite, type InvitableRole, type InviteStatus } from '@/mock/mockInvites'
import { mockUsers } from '@/mock/mockUsers'
import { deriveRole } from '@/features/auth/store/authStore'
import type { User } from './authService'

export type { Invite, InvitableRole, InviteStatus }

/**
 * Maps the UI's human-readable role presets to the granular permission arrays
 * the backend expects. Keeps the form simple while the API stays flexible.
 */
export const ROLE_PERMISSIONS: Record<InvitableRole | 'EMPLOYEE', string[]> = {
  HR: ['employees.*', 'attendance.*', 'leave.*', 'documents.*', 'reports.view', 'team.invite', 'team.view'],
  MANAGER: ['attendance.view', 'leave.approve', 'performance.view', 'documents.view'],
  EMPLOYEE: ['attendance.view', 'leave.view', 'performance.view', 'documents.view'],
}

/** A member is a user of the org, minus anything secret. */
export type Member = Omit<User, 'password'>

export type FinancialDetails = {
  accName: string
  accNumber: string
  bankName: string
  ifscCode: string
}

export type EducationDetail = {
  degree: string
  institution: string
  year: string
}

export type FamilyDetail = {
  name: string
  relationship: string
  contactNumber?: string
}

/** Everything the Add Employee form can send. Basic identity fields are required
 *  by the form; the rest are optional so the lighter Team invite path still works. */
export type InvitePayload = {
  email: string
  role: InvitableRole | 'EMPLOYEE'
  /** Which screen triggered it — only 'employee-management' creates an Employee HR record. */
  source?: 'employee-management' | 'team-members'
  firstName?: string
  lastName?: string
  jobTitle?: string
  department?: string
  startDate?: string
  employmentType?: string
  workLocation?: string
  employeeId?: string
  contactNumber?: string
  homeAddress?: string
  /** Cloudinary secure_url returned by `teamService.uploadPhoto()`. */
  photoUrl?: string
  financialDetails?: FinancialDetails
  educationDetails?: EducationDetail[]
  familyDetails?: FamilyDetail[]
}

export class TeamError extends Error {}

const LATENCY_MS = 600
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Mutable copy so the mock path can add/revoke without touching the seed. */
let mockInviteState: Invite[] = [...mockInvites]
let mockMemberState: Member[] = mockUsers.map(({ password: _password, ...m }) => m)

// Temp-password is the credential now (not a token link) — point at the login screen.
const mockLink = (_id: string) => `${window.location.origin}/login`

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
        // The real backend has no `role` field at all (§10 — permissions are
        // the source of truth, roles are a display label only) — derive it
        // here so RoleBadge has something to render, instead of it silently
        // coming back undefined.
        return data.map((m) => ({ ...m, role: deriveRole(m.memberships?.[0]?.permissions ?? []) }))
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

  async invite(payload: InvitePayload): Promise<{
    invite: Invite
    inviteLink: string
    tempPassword: string | null
  }> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<{ invite: Invite; inviteLink: string; tempPassword: string | null }>(
          '/invites',
          // Backend expects permissions[], not role — map the preset here.
          {
            email: payload.email,
            permissions: ROLE_PERMISSIONS[payload.role],
            source: payload.source ?? 'team-members',
            firstName: payload.firstName,
            lastName: payload.lastName,
            jobTitle: payload.jobTitle,
            department: payload.department,
            startDate: payload.startDate,
            employmentType: payload.employmentType,
            workLocation: payload.workLocation,
            employeeId: payload.employeeId,
            contactNumber: payload.contactNumber,
            homeAddress: payload.homeAddress,
            photoUrl: payload.photoUrl,
            financialDetails: payload.financialDetails,
            educationDetails: payload.educationDetails,
            familyDetails: payload.familyDetails,
          },
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
      role: payload.role as InvitableRole,
      status: 'PENDING',
      invitedBy: 'usr-1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    mockInviteState = [invite, ...mockInviteState]
    return { invite, inviteLink: mockLink(invite.id), tempPassword: 'demo-temp-password' }
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

  /**
   * Uploads a picked employee photo and returns its stored URL. Real backend:
   * proxied through our server to Cloudinary (never a direct browser→Cloudinary
   * upload — see hrm-backend/.env.example). No backend: resolves to a local
   * object URL so the picker still previews correctly in the mock/demo build.
   */
  async uploadPhoto(file: File): Promise<string> {
    if (hasBackend) {
      try {
        const form = new FormData()
        form.append('file', file)
        const { data } = await apiClient.post<{ url: string }>('/invites/photo', form, {
          headers: { 'Content-Type': undefined },
        })
        return data.url
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'Could not upload that photo.'))
      }
    }

    await delay()
    return URL.createObjectURL(file)
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

  /**
   * The Permission Editor's save action — sets a member's ENTIRE granular
   * permission list (a revision, not a merge). The server independently
   * refuses to touch anyone already holding `*` (§10.2) and refuses editing
   * your own permissions — this isn't just a UI nicety, it's re-checked there.
   */
  async updatePermissions(userId: string, permissions: string[]): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.patch(`/members/${userId}/permissions`, { permissions })
        return
      } catch (error) {
        throw new TeamError(apiErrorMessage(error, 'We could not save those permissions.'))
      }
    }

    await delay()
    mockMemberState = mockMemberState.map((m) =>
      m.id === userId && m.memberships?.[0]
        ? { ...m, memberships: [{ ...m.memberships[0], permissions }] }
        : m,
    )
  },
}
