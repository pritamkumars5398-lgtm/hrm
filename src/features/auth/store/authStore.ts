import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, type Role, type User } from '@/services/authService'

/** What the rest of the app is allowed to know about the signed-in person. */
export type SessionUser = {
  id: string
  organizationId: string | null
  email: string
  name: string
  jobTitle: string
  role: Role
  avatarInitials: string
}

type AuthState = {
  user: SessionUser | null
  isAuthenticated: boolean
  setSession: (user: User) => void
  /** Called once Company Details creates the org and makes this user its Owner (§11.2). */
  attachOrganization: (organizationId: string, jobTitle?: string) => void
  /** Clears the server's httpOnly cookie as well as local state. */
  logout: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setSession: (user) => {
        // Never let the mock password into the store, let alone into localStorage.
        const { password: _password, ...safe } = user
        set({ user: safe, isAuthenticated: true })
      },

      attachOrganization: (organizationId, jobTitle) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  organizationId,
                  role: 'OWNER',
                  jobTitle: jobTitle ?? state.user.jobTitle,
                },
              }
            : state,
        ),

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
      // KNOWN TRADEOFF (§11.1): the prototype keeps the session in localStorage so a
      // refresh doesn't sign you out. When the real JWT lands, the token belongs in an
      // httpOnly, secure cookie — not here — and this store keeps only the decoded user.
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
)
