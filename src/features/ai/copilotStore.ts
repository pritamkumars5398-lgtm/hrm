import { create } from 'zustand'

type CopilotDrawerState = {
  isOpen: boolean
  openCopilot: () => void
  closeCopilot: () => void
  toggleCopilot: () => void
}

export const useCopilotDrawer = create<CopilotDrawerState>((set) => ({
  isOpen: false,
  openCopilot: () => set({ isOpen: true }),
  closeCopilot: () => set({ isOpen: false }),
  toggleCopilot: () => set((state) => ({ isOpen: !state.isOpen })),
}))

