import {
  buildMonth,
  isWeekend,
  type AttendanceRecord,
  type AttendanceStatus,
} from '@/mock/mockAttendance'
import type { Role } from './authService'

export type { AttendanceRecord, AttendanceStatus }

export type DaySummary = {
  /** YYYY-MM-DD */
  date: string
  isWeekend: boolean
  present: number
  late: number
  halfDay: number
  absent: number
  leave: number
  /** Share of expected attendees who showed up at all, 0–1. Null on weekends. */
  rate: number | null
}

export type AttendanceMonth = {
  year: number
  month: number
  /** Whose records these are — a Manager only ever sees their own team (§10). */
  scope: 'company' | 'team'
  headcount: number
  summary: {
    presentToday: number
    absentToday: number
    lateToday: number
    avgHours: number
  }
  days: DaySummary[]
  /** Individual records for the selected day. */
  today: AttendanceRecord[]
  todayDate: string
}

export class AttendanceError extends Error {}

const LATENCY_MS = 550
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

const toISO = (d: Date) => d.toISOString().slice(0, 10)

export type AttendanceQuery = {
  year: number
  month: number
  /** Defaults to today, or the last day of the month if it is in the past. */
  selectedDate?: string
  role: Role
  /** The signed-in person's name — used to scope a Manager to their reports. */
  viewerName: string
}

export const attendanceService = {
  /**
   * Mock-only (§11.4) — no API, no DB model. The shape returned here is what the
   * real endpoint will return, so the page does not change in Phase 2.
   */
  async getMonth(query: AttendanceQuery): Promise<AttendanceMonth> {
    await delay()

    const { year, month, role, viewerName } = query

    let records = buildMonth(year, month)

    // A Manager may only see attendance for the people who report to them. This is
    // filtered here, not in the component — once this is a real API, other people's
    // records must not cross the wire at all.
    const scope: AttendanceMonth['scope'] = role === 'MANAGER' ? 'team' : 'company'
    if (scope === 'team') {
      records = records.filter((r) => r.managerName === viewerName)
    }

    if (records.length === 0) {
      throw new AttendanceError('There is no attendance to show for this period.')
    }

    const headcount = new Set(records.map((r) => r.employeeId)).size

    // Group by day.
    const byDate = new Map<string, AttendanceRecord[]>()
    for (const record of records) {
      const bucket = byDate.get(record.date) ?? []
      bucket.push(record)
      byDate.set(record.date, bucket)
    }

    const days: DaySummary[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rows]) => {
        const weekend = isWeekend(new Date(`${date}T00:00:00`))

        const present = rows.filter((r) => r.status === 'PRESENT').length
        const late = rows.filter((r) => r.status === 'LATE').length
        const halfDay = rows.filter((r) => r.status === 'HALF_DAY').length
        const absent = rows.filter((r) => r.status === 'ABSENT').length
        const leave = rows.filter((r) => r.status === 'LEAVE').length

        const expected = rows.length
        const attended = present + late + halfDay

        return {
          date,
          isWeekend: weekend,
          present,
          late,
          halfDay,
          absent,
          leave,
          rate: weekend || expected === 0 ? null : attended / expected,
        }
      })

    // Default the selected day to today when we are looking at the current month,
    // and to the last working day otherwise — an empty "today" panel is useless.
    const workingDays = days.filter((d) => !d.isWeekend)
    const todayISO = toISO(new Date())
    const fallback = workingDays.at(-1)?.date ?? days[0]!.date
    const selectedDate =
      query.selectedDate ?? (days.some((d) => d.date === todayISO) ? todayISO : fallback)

    const today = (byDate.get(selectedDate) ?? []).sort((a, b) =>
      a.employeeName.localeCompare(b.employeeName),
    )

    const workedToday = today.filter((r) => r.hours > 0)
    const avgHours =
      workedToday.length === 0
        ? 0
        : Math.round(
            (workedToday.reduce((sum, r) => sum + r.hours, 0) / workedToday.length) * 10,
          ) / 10

    return {
      year,
      month,
      scope,
      headcount,
      summary: {
        presentToday: today.filter((r) => r.status === 'PRESENT').length,
        lateToday: today.filter((r) => r.status === 'LATE').length,
        absentToday: today.filter((r) => r.status === 'ABSENT').length,
        avgHours,
      },
      days,
      today,
      todayDate: selectedDate,
    }
  },
}
