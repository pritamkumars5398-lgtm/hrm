import { create } from 'zustand'
import { teamService, type Invite, type Member } from '@/services/teamService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type TeamState = {
  status: Status
  members: Member[]
  invites: Invite[]
  error: string | null
  load: (options?: { force?: boolean }) => Promise<void>
  /** Applied after a mutation so the list reflects it without a full refetch. */
  upsertInvite: (invite: Invite) => void
  dropMember: (id: string) => void
}

export const useTeamStore = create<TeamState>()((set, get) => ({
  status: 'idle',
  members: [],
  invites: [],
  error: null,

  load: async (options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: 'loading', error: null })

    try {
      const [members, invites] = await Promise.all([
        teamService.getMembers(),
        teamService.getInvites(),
      ])
      set({ status: 'ready', members, invites })
    } catch {
      set({ status: 'error', error: 'We could not load your team.' })
    }
  },

  upsertInvite: (invite) =>
    set((state) => {
      const exists = state.invites.some((i) => i.id === invite.id)
      return {
        invites: exists
          ? state.invites.map((i) => (i.id === invite.id ? invite : i))
          : [invite, ...state.invites],
      }
    }),

  dropMember: (id) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
}))
