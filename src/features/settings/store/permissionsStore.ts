import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ALWAYS_GRANTED,
  DEFAULT_ROLE_MODULES,
  type ModuleKey,
  type RoleMatrix,
} from '@/shared/config/navigation'
import type { Role } from '@/services/authService'

type PermissionsState = {
  matrix: RoleMatrix
  /** Grant or revoke one module for one role. */
  toggle: (role: Role, moduleKey: ModuleKey) => void
  reset: () => void
  isDefault: () => boolean
}

const clone = (matrix: RoleMatrix): RoleMatrix => ({
  OWNER: [...matrix.OWNER],
  HR: [...matrix.HR],
  MANAGER: [...matrix.MANAGER],
})

const sameSet = (a: ModuleKey[], b: ModuleKey[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join()

/**
 * The live role → module matrix. Settings edits this; the sidebar and the route
 * guard both read it, so a change here takes effect everywhere at once.
 *
 * Persisted so a demo survives a refresh. In Phase 2 this moves to the backend —
 * a permission matrix the client can edit in localStorage is a demo affordance,
 * not access control, and the note in Settings says so.
 */
export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      matrix: clone(DEFAULT_ROLE_MODULES),

      toggle: (role, moduleKey) => {
        // The Owner is deliberately not editable: revoking their own Settings
        // access would lock them out of the only screen that could restore it.
        if (role === 'OWNER') return
        if (ALWAYS_GRANTED.includes(moduleKey)) return

        set((state) => {
          const current = state.matrix[role]
          const next = current.includes(moduleKey)
            ? current.filter((k) => k !== moduleKey)
            : [...current, moduleKey]

          return { matrix: { ...state.matrix, [role]: next } }
        })
      },

      reset: () => set({ matrix: clone(DEFAULT_ROLE_MODULES) }),

      isDefault: () => {
        const { matrix } = get()
        return (Object.keys(DEFAULT_ROLE_MODULES) as Role[]).every((role) =>
          sameSet(matrix[role], DEFAULT_ROLE_MODULES[role]),
        )
      },
    }),
    { name: 'keystone.permissions' },
  ),
)

/** Read the live matrix. Prefer this over importing DEFAULT_ROLE_MODULES. */
export const useRoleMatrix = () => usePermissionsStore((s) => s.matrix)
