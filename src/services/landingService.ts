import {
  mockPricingTiers,
  mockTestimonials,
  type PricingTier,
  type Testimonial,
} from '@/mock/mockLanding'

export type { PricingTier, Testimonial }

/**
 * Landing content is static marketing copy, so these return synchronously.
 * Every other module's service returns a Promise and is consumed with loading
 * and error states (§18) — this one is the deliberate exception.
 */
export const landingService = {
  getTestimonials(): Testimonial[] {
    return mockTestimonials
  },

  getPricingTiers(): PricingTier[] {
    return mockPricingTiers
  },
}
