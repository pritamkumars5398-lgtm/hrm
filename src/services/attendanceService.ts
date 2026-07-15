import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { hasPermission } from '@/shared/config/navigation'
import {
  buildMonth,
  isWeekend,
  type AttendanceRecord,
  type AttendanceStatus,
} from '@/mock/mockAttendance'

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

export type TodayStatus = {
  checkedIn: boolean
  checkedOut: boolean
  checkInTime: string | null
  checkOutTime: string | null
} | null

export type AttendanceMonth = {
  year: number
  month: number
  /** Whose records these are — 'me' when the caller lacks attendance.manage. */
  scope: 'company' | 'me'
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
  /**
   * Today's personal check-in/out state — only populated when scope === 'me'.
   * Null means no Employee record on file for this user in this org.
   */
  myTodayStatus: TodayStatus
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
  /** The signed-in person's granular permissions for the active company. */
  permissions: string[]
  /** The signed-in person's name — used to filter the mock's 'me' scope. */
  viewerName: string
}

/**
 * Attendance self-service (check in/out, see your own history) is a baseline
 * every member gets — `attendance.manage` only changes whether `getMonth`
 * returns the whole company or just you (decided server-side, never trusted
 * from the client). Real API is authoritative once a backend is configured;
 * the mock path exists for the offline/no-backend demo.
 */
export const attendanceService = {
  async getMonth(query: AttendanceQuery): Promise<AttendanceMonth> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<AttendanceMonth>('/attendance/month', {
          params: { year: query.year, month: query.month, selectedDate: query.selectedDate },
        })
        return data
      } catch (error) {
        throw new AttendanceError(apiErrorMessage(error, 'We could not load attendance for this month.'))
      }
    }

    await delay()

    const { year, month } = query
    const manage = hasPermission(query.permissions, 'attendance.manage')

    let records = buildMonth(year, month)

    if (!manage) {
      records = records.filter((r) => r.employeeName === query.viewerName)
    }

    if (records.length === 0) {
      throw new AttendanceError('There is no attendance to show for this period.')
    }

    const headcount = new Set(records.map((r) => r.employeeId)).size

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

    // For 'me' scope: derive today's personal check-in/out state from the viewer's own record.
    let myTodayStatus: TodayStatus = null
    if (!manage) {
      const myRecord = today.find((r) => r.employeeName === query.viewerName)
      if (myRecord) {
        myTodayStatus = {
          checkedIn: !!myRecord.clockIn,
          checkedOut: !!myRecord.clockOut,
          checkInTime: myRecord.clockIn ?? null,
          checkOutTime: myRecord.clockOut ?? null,
        }
      }
    }

    return {
      year,
      month,
      scope: manage ? 'company' : 'me',
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
      myTodayStatus,
    }
  },

  async checkIn(): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.post('/attendance/check-in')
        return
      } catch (error) {
        throw new AttendanceError(apiErrorMessage(error, 'We could not check you in.'))
      }
    }
    await delay()
    // Mock mode has no persistent per-session state to mutate meaningfully — no-op.
  },

  async checkOut(): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.post('/attendance/check-out')
        return
      } catch (error) {
        throw new AttendanceError(apiErrorMessage(error, 'We could not check you out.'))
      }
    }
    await delay()
  },
}
