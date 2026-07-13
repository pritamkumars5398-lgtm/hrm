import { mockEmployees } from './mockEmployees'
import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'LEAVE' | 'WEEKEND'

export type AttendanceRecord = {
  id: string
  organizationId: string
  employeeId: string
  employeeName: string
  avatarInitials: string
  department: string
  managerName: string | null
  /** YYYY-MM-DD */
  date: string
  status: AttendanceStatus
  clockIn: string | null
  clockOut: string | null
  hours: number
}

/**
 * Deterministic pseudo-random, seeded from employee + date.
 *
 * Math.random() would reshuffle the whole month on every re-render, so the
 * calendar would change under the user's cursor. This gives varied-looking but
 * stable data.
 */
function seeded(employeeId: string, date: string): number {
  const key = `${employeeId}:${date}`
  let hash = 2166136261

  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return ((hash >>> 0) % 1000) / 1000
}

function statusFor(employeeId: string, date: string, isWeekend: boolean): AttendanceStatus {
  if (isWeekend) return 'WEEKEND'

  const roll = seeded(employeeId, date)

  // Roughly: 86% present, 6% late, 3% half-day, 3% leave, 2% absent.
  if (roll < 0.86) return 'PRESENT'
  if (roll < 0.92) return 'LATE'
  if (roll < 0.95) return 'HALF_DAY'
  if (roll < 0.98) return 'LEAVE'
  return 'ABSENT'
}

function timesFor(status: AttendanceStatus, roll: number): Pick<AttendanceRecord, 'clockIn' | 'clockOut' | 'hours'> {
  switch (status) {
    case 'PRESENT': {
      const minute = Math.floor(roll * 25) // 08:45–09:09
      const inTime = `0${8 + (minute >= 15 ? 1 : 0)}:${String((45 + minute) % 60).padStart(2, '0')}`
      return { clockIn: inTime, clockOut: '17:32', hours: 8 + Math.round(roll * 10) / 10 }
    }
    case 'LATE':
      return { clockIn: `09:${String(35 + Math.floor(roll * 20)).padStart(2, '0')}`, clockOut: '17:45', hours: 7.6 }
    case 'HALF_DAY':
      return { clockIn: '09:02', clockOut: '13:00', hours: 4 }
    default:
      // Absent, on leave, weekend — nobody clocked in.
      return { clockIn: null, clockOut: null, hours: 0 }
  }
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

const toISO = (d: Date) => d.toISOString().slice(0, 10)

/** Builds every employee's record for every day of the given month. */
export function buildMonth(year: number, month: number): AttendanceRecord[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const records: AttendanceRecord[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const iso = toISO(date)
    const weekend = isWeekend(date)

    for (const employee of mockEmployees) {
      // Someone who has left, or has not started yet, has no attendance to record.
      if (employee.status === 'INACTIVE') continue
      if (employee.joinedAt > iso) continue

      const status = statusFor(employee.id, iso, weekend)
      const roll = seeded(employee.id, iso)

      records.push({
        id: `att-${employee.id}-${iso}`,
        organizationId: MOCK_ORGANIZATION_ID,
        employeeId: employee.id,
        employeeName: employee.name,
        avatarInitials: employee.avatarInitials,
        department: employee.department,
        managerName: employee.managerName,
        date: iso,
        status,
        ...timesFor(status, roll),
      })
    }
  }

  return records
}
