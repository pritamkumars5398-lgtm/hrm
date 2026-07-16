import { apiClient, apiErrorMessage } from './apiClient'

export class PayCycleError extends Error {}

export type PayCycleType = 'FIXED' | 'RANGE'

export type PayCycle = {
  /** Null means nobody has set this up yet. */
  type: PayCycleType | null
  fixedDay: number | null
  rangeStart: number | null
  rangeEnd: number | null
}

export type PayCyclePayload = {
  type: PayCycleType
  fixedDay?: number
  rangeStart?: number
  rangeEnd?: number
}

export const payCycleService = {
  async get(): Promise<PayCycle> {
    try {
      const { data } = await apiClient.get<PayCycle>('/payroll/pay-cycle')
      return data
    } catch (error) {
      throw new PayCycleError(apiErrorMessage(error, 'We could not load the pay cycle.'))
    }
  },

  async update(payload: PayCyclePayload): Promise<PayCycle> {
    try {
      const { data } = await apiClient.patch<PayCycle>('/payroll/pay-cycle', payload)
      return data
    } catch (error) {
      throw new PayCycleError(apiErrorMessage(error, 'We could not save the pay cycle.'))
    }
  },
}
