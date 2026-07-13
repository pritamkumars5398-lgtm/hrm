import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PersonalDetails = {
  fullName: string
  phone: string
  jobTitle: string
}

export type OnboardingStep = 1 | 2

type OnboardingState = {
  step: OnboardingStep
  personal: PersonalDetails | null
  setPersonal: (details: PersonalDetails) => void
  goTo: (step: OnboardingStep) => void
  reset: () => void
}

/**
 * Survives a refresh mid-wizard so a half-finished signup isn't lost. Cleared
 * once the org is created (§11.2) — the Company Details step will call reset().
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      personal: null,

      setPersonal: (personal) => set({ personal }),
      goTo: (step) => set({ step }),
      reset: () => set({ step: 1, personal: null }),
    }),
    { name: 'keystone.onboarding' },
  ),
)
