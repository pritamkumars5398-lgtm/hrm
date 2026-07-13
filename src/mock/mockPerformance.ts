import { mockEmployees } from './mockEmployees'
import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type Goal = {
  id: string
  title: string
  progress: number
  dueOn: string
}

export type Review = {
  id: string
  cycle: string
  rating: number
  reviewer: string
  summary: string
  reviewedOn: string
}

export type PerformanceRecord = {
  id: string
  organizationId: string
  employeeId: string
  employeeName: string
  avatarInitials: string
  department: string
  designation: string
  managerName: string | null
  /** 1–5. Null when the current cycle has not been reviewed yet. */
  rating: number | null
  previousRating: number | null
  goals: Goal[]
  reviews: Review[]
}

export const CURRENT_CYCLE = 'Q3 2026'

/** Deterministic — a rating that changes on every render is not a rating. */
function seeded(key: string, mod: number): number {
  let hash = 2166136261
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % mod
}

const GOAL_TEMPLATES = [
  'Ship the Q3 roadmap commitments',
  'Reduce cycle time by 20%',
  'Mentor one junior team member',
  'Complete the security training',
  'Improve customer satisfaction score',
  'Document the on-call runbook',
]

export const mockPerformance: PerformanceRecord[] = mockEmployees
  .filter((e) => e.status !== 'INACTIVE')
  .map((employee) => {
    const roll = seeded(employee.id, 100)

    // ~15% of people have not been reviewed in the current cycle yet — a module
    // where everyone is neatly reviewed hides the "not started" state entirely.
    const reviewed = roll >= 15
    const rating = reviewed ? 3 + (seeded(`${employee.id}:rating`, 3) - 1) : null
    const clamped = rating === null ? null : Math.min(5, Math.max(1, rating + 1))

    const goalCount = 2 + seeded(`${employee.id}:goals`, 2)

    return {
      id: `perf-${employee.id}`,
      organizationId: MOCK_ORGANIZATION_ID,
      employeeId: employee.id,
      employeeName: employee.name,
      avatarInitials: employee.avatarInitials,
      department: employee.department,
      designation: employee.designation,
      managerName: employee.managerName,
      rating: clamped,
      previousRating: reviewed ? Math.min(5, Math.max(1, (clamped ?? 3) - 1 + seeded(`${employee.id}:prev`, 2))) : null,
      goals: Array.from({ length: goalCount }, (_, i) => ({
        id: `${employee.id}-goal-${i}`,
        title: GOAL_TEMPLATES[seeded(`${employee.id}:g${i}`, GOAL_TEMPLATES.length)]!,
        progress: seeded(`${employee.id}:p${i}`, 101),
        dueOn: '2026-09-30',
      })),
      reviews: reviewed
        ? [
            {
              id: `${employee.id}-rev-1`,
              cycle: 'Q2 2026',
              rating: Math.min(5, Math.max(1, (clamped ?? 3) - 1)),
              reviewer: employee.managerName ?? 'Priya Nair',
              summary: 'Consistent delivery and strong collaboration across the team.',
              reviewedOn: '2026-04-12',
            },
            {
              id: `${employee.id}-rev-2`,
              cycle: 'Q1 2026',
              rating: Math.min(5, Math.max(1, (clamped ?? 3) - 1)),
              reviewer: employee.managerName ?? 'Priya Nair',
              summary: 'Met expectations. Growth area identified around ownership.',
              reviewedOn: '2026-01-18',
            },
          ]
        : [],
    }
  })
