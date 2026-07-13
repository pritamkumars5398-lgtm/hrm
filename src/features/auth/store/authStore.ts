import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, User } from '@/services/authService'

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

      clearSession: () => set({ user: null, isAuthenticated: false }),
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
