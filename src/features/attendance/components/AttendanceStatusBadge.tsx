import Badge, { type BadgeTone } from '@/shared/components/Badge'
import type { AttendanceStatus } from '@/services/attendanceService'

const TONE: Record<AttendanceStatus, BadgeTone> = {
  PRESENT: 'success',
  LATE: 'warning',
  HALF_DAY: 'accent',
  ABSENT: 'danger',
  LEAVE: 'neutral',
  WEEKEND: 'neutral',
}

const LABEL: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  LATE: 'Late',
  HALF_DAY: 'Half day',
  ABSENT: 'Absent',
  LEAVE: 'On leave',
  WEEKEND: 'Weekend',
}

export default function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return <Badge tone={TONE[status]}>{LABEL[status]}</Badge>
}
