import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, type Role, type User } from '@/services/authService'

/** A single company membership returned by the backend. */
export type Membership = {
  id: string
  userId: string
  organizationId: string
  organizationName?: string
  jobTitle: string
  permissions: string[]
}

/** What the rest of the app is allowed to know about the signed-in person. */
export type SessionUser = {
  id: string
  email: string
  name: string
  avatarInitials: string
  /** Active workspace — set from the first membership or by the workspace switcher. */
  activeOrganizationId: string | null
  /** All companies this person belongs to. */
  memberships: Membership[]
  /** True if the user is logging in with a temporary password and must set a new one. */
  requiresPasswordReset: boolean
  /**
   * Granular permissions for the active workspace. Replaces the old `role` string.
   */
  permissions: string[]
  /**
   * @deprecated Retained temporarily for any leftover mock components.
   */
  role: Role
  /** Job title in the active company. */
  jobTitle: string
  /**
   * Retained for the mock path only. Never populated by the real backend.
   * @deprecated Use activeOrganizationId.
   */
  organizationId: string | null
}

type AuthState = {
  user: SessionUser | null
  isAuthenticated: boolean
  setSession: (user: User) => void
  /** Switches the active workspace (workspace switcher). Re-derives role for the new org. */
  setActiveOrg: (organizationId: string) => void
  /**
   * Called once Company Details creates the org.
   * - Mock path: stores the org ID + OWNER role directly.
   * - Real path: not needed — server returns updated memberships via setSession.
   */
  attachOrganization: (organizationId: string, organizationName: string, jobTitle?: string) => void
  /**
   * Drops a deleted company from local state. If it was the active workspace,
   * switches to whatever membership remains — the backend guarantees at least
   * one always does (§10.2's account-level version: nobody can delete their
   * way down to zero companies).
   */
  removeOrganization: (organizationId: string) => void
  /** Clears the server's httpOnly cookie as well as local state. */
  logout: () => Promise<void>
  clearSession: () => void
}

/**
 * Derives a backwards-compat display Role from granular permissions — this is
 * a label for the UI only; the real access control is the permission list
 * itself (§10). Buckets: Owner (everything) > HR (any employees.* grant) >
 * Manager (holds real authority over others — a .manage/.approve permission,
 * or can invite/manage the team) > Employee (view-only baseline, matching the
 * Employee preset in §10.3 — e.g. attendance.view + leave.view with nothing else).
 */
function deriveRole(permissions: string[]): Role {
  if (permissions.includes('*')) return 'OWNER'
  if (permissions.some((p) => p.startsWith('employees'))) return 'HR'

  const hasManagementPower = permissions.some(
    (p) =>
      p.endsWith('.manage') ||
      p.endsWith('.approve') ||
      p === 'team.invite' ||
      p === 'team.managePermissions',
  )
  return hasManagementPower ? 'MANAGER' : 'EMPLOYEE'
}

/** Maps a raw backend/mock User into SessionUser. */
function toSessionUser(user: User): SessionUser {
  // Real backend path — user has memberships[].
  if (user.memberships && user.memberships.length > 0) {
    const activeMem = user.memberships[0]!
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarInitials: user.avatarInitials,
      activeOrganizationId: activeMem.organizationId,
      organizationId: activeMem.organizationId,
      memberships: user.memberships,
      permissions: activeMem.permissions,
      requiresPasswordReset: user.requiresPasswordReset ?? false,
      role: deriveRole(activeMem.permissions),
      jobTitle: activeMem.jobTitle,
    }
  }

  // Mock path — user has organizationId and role directly.
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarInitials: user.avatarInitials,
    activeOrganizationId: (user as any).organizationId ?? null,
    organizationId: (user as any).organizationId ?? null,
    memberships: [],
    permissions: (user as any).role === 'HR' 
      ? ['employees.*', 'attendance.*', 'leave.*', 'documents.*', 'reports.view', 'team.invite', 'team.view']
      : (user as any).role === 'MANAGER'
      ? ['attendance.view', 'leave.approve', 'performance.view', 'documents.view']
      : ['*'],
    requiresPasswordReset: (user as any).requiresPasswordReset ?? false,
    role: (user as any).role ?? 'OWNER',
    jobTitle: (user as any).jobTitle ?? 'Owner',
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setSession: (user) => {
        // Never let the mock password into the store, let alone into localStorage.
        const { password: _password, ...safe } = user as any
        set({ user: toSessionUser(safe), isAuthenticated: true })
      },

      setActiveOrg: (organizationId) =>
        set((state) => {
          if (!state.user) return state
          const mem = state.user.memberships.find((m) => m.organizationId === organizationId)
          return {
            user: {
              ...state.user,
              activeOrganizationId: organizationId,
              organizationId,
              permissions: mem ? mem.permissions : state.user.permissions,
              role: mem ? deriveRole(mem.permissions) : state.user.role,
              jobTitle: mem ? mem.jobTitle : state.user.jobTitle,
            },
          }
        }),

      attachOrganization: (organizationId, organizationName, jobTitle) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  activeOrganizationId: organizationId,
                  organizationId,
                  permissions: ['*'],
                  role: 'OWNER',
                  jobTitle: jobTitle ?? state.user.jobTitle,
                  // Append the new membership so the workspace switcher reflects it
                  memberships: [
                    ...state.user.memberships,
                    {
                      id: `mem-local-${organizationId}`,
                      userId: state.user.id,
                      organizationId,
                      organizationName: organizationName || 'Unknown Company',
                      jobTitle: jobTitle ?? 'Owner',
                      permissions: ['*'],
                    },
                  ],
                },
              }
            : state,
        ),

      removeOrganization: (organizationId) =>
        set((state) => {
          if (!state.user) return state
          const memberships = state.user.memberships.filter((m) => m.organizationId !== organizationId)

          if (state.user.activeOrganizationId !== organizationId) {
            return { user: { ...state.user, memberships } }
          }

          const next = memberships[0] ?? null
          return {
            user: {
              ...state.user,
              memberships,
              activeOrganizationId: next?.organizationId ?? null,
              organizationId: next?.organizationId ?? null,
              permissions: next?.permissions ?? state.user.permissions,
              role: next ? deriveRole(next.permissions) : state.user.role,
              jobTitle: next?.jobTitle ?? state.user.jobTitle,
            },
          }
        }),

      logout: async () => {
        // Clear all welcome keys from sessionStorage on logout so they trigger on next login
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i)
          if (key && key.startsWith('welcome_shown_')) {
            sessionStorage.removeItem(key)
          }
        }
        // The cookie is httpOnly, so only the server can clear it — dropping local
        // state alone would leave a valid session sitting in the browser.
        await authService.logout()
        set({ user: null, isAuthenticated: false })
      },

      clearSession: () => {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i)
          if (key && key.startsWith('welcome_shown_')) {
            sessionStorage.removeItem(key)
          }
        }
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'keystone.session',
      version: 2,
      // KNOWN TRADEOFF (§11.1): the prototype keeps the session in localStorage so a
      // refresh doesn't sign you out. When the real JWT lands, the token belongs in an
      // httpOnly, secure cookie — not here — and this store keeps only the decoded user.
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      /**
       * Migrate old persisted sessions that are missing fields added in later
       * versions. This prevents crashes when a user reloads after an upgrade.
       */
      migrate: (persisted: any, version: number) => {
        if (version < 2 && persisted?.user) {
          // v1 → v2: add permissions field if missing
          const u = persisted.user
          if (!u.permissions) {
            u.permissions = u.role === 'HR'
              ? ['employees.*', 'attendance.*', 'leave.*', 'documents.*', 'reports.view', 'team.invite', 'team.view']
              : u.role === 'MANAGER'
              ? ['attendance.view', 'leave.approve', 'performance.view', 'documents.view']
              : ['*']
          }
          if (!u.memberships) u.memberships = []
        }
        return persisted
      },
    },
  ),
)
