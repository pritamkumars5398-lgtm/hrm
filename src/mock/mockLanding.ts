/**
 * Marketing content for the public landing page.
 *
 * Unlike the HR modules, this is static product copy — it will never be served
 * by an API, so it is intentionally read synchronously through
 * `landingService` rather than behind a loading state. It still goes through
 * the service layer so no component imports a mock file directly (§9).
 */

export type Testimonial = {
  id: string
  quote: string
  name: string
  role: string
  company: string
  initials: string
  avatar?: string
}

export type PricingTier = {
  id: string
  name: string
  priceMonthly: number | null
  cadence: string
  blurb: string
  features: string[]
  cta: string
  featured: boolean
}

export const mockTestimonials: Testimonial[] = [
  {
    id: 't-1',
    quote:
      'We closed payroll in ninety minutes last month. It used to take two people the better part of three days, and we still found errors afterwards.',
    name: 'Priya Nair',
    role: 'Head of People',
    company: 'Alderway Labs',
    initials: 'PN',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 't-2',
    quote:
      'The approvals actually reach the right manager now. Leave requests stopped living in inboxes, which sounds small until you have two hundred people.',
    name: 'Samuel Okafor',
    role: 'Operations Director',
    company: 'Bright Harbour',
    initials: 'SO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 't-3',
    quote:
      'Onboarding a new hire was a checklist someone kept in their head. Now it runs itself, and I can see exactly where every joiner is.',
    name: 'Marta Lindqvist',
    role: 'HR Manager',
    company: 'Nordkap Group',
    initials: 'ML',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  },
]

export const mockPricingTiers: PricingTier[] = [
  {
    id: 'p-starter',
    name: 'Starter',
    priceMonthly: 4,
    cadence: 'per employee / month',
    blurb: 'For a growing company putting its first real system in place.',
    features: [
      'Employee directory & records',
      'Attendance and time tracking',
      'Leave requests and approvals',
      'Up to 50 employees',
      'Email support',
    ],
    cta: 'Start free trial',
    featured: false,
  },
  {
    id: 'p-growth',
    name: 'Growth',
    priceMonthly: 7,
    cadence: 'per employee / month',
    blurb: 'Payroll, performance and reporting for a scaling company.',
    features: [
      'Everything in Starter',
      'Payroll runs and payslips',
      'Performance reviews and goals',
      'Document templates and e-sign',
      'Custom roles and permissions',
      'Priority support',
    ],
    cta: 'Start free trial',
    featured: true,
  },
  {
    id: 'p-enterprise',
    name: 'Enterprise',
    priceMonthly: null,
    cadence: 'annual agreement',
    blurb: 'For organisations with compliance and scale requirements.',
    features: [
      'Everything in Growth',
      'SSO and SCIM provisioning',
      'Audit log and data residency',
      'Dedicated success manager',
      'Custom SLA',
    ],
    cta: 'Talk to sales',
    featured: false,
  },
]
