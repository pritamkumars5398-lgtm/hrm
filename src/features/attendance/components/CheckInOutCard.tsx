import { useState } from 'react'
import { CheckCircle2, Clock, LogIn, LogOut, Palmtree } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import type { AttendanceMonth } from '@/services/attendanceService'
import type { LeaveType } from '@/services/leaveService'

type Props = {
  status: AttendanceMonth['myTodayStatus']
  loading: boolean
  /** First name, for the leave-day greeting. */
  name: string
  onCheckIn: () => Promise<{ ok: boolean; error?: string }>
  onCheckOut: () => Promise<{ ok: boolean; error?: string }>
}

const LEAVE_MESSAGE: Record<LeaveType, (name: string) => string> = {
  SICK: (name) => `Rest well, ${name}. Today is your leave.`,
  ANNUAL: (name) => `Today is your leave — have a nice day, ${name}.`,
  PERSONAL: (name) => `It's your leave today. Have a nice day, ${name}.`,
  UNPAID: (name) => `It's your leave today. Have a nice day, ${name}.`,
}

export default function CheckInOutCard({ status, loading, name, onCheckIn, onCheckOut }: Props) {
  const [error, setError] = useState<string | null>(null)

  if (!status) {
    return (
      <Card className="p-5">
        <p className="text-[13.5px] leading-relaxed text-muted">
          There's no employee record on file for you in this company, so there's nothing to check in
          against. Ask your Owner or HR to add one.
        </p>
      </Card>
    )
  }

  // On approved leave — no check-in/out needed, just a friendly note.
  if (status.onLeave) {
    const firstName = name.split(' ')[0] || name
    return (
      <Card className="p-5">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-pine-tint text-pine-deep">
            <Palmtree size={20} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">{LEAVE_MESSAGE[status.onLeave.type](firstName)}</p>
            <p className="mt-0.5 text-[12.5px] text-muted">No need to check in today.</p>
          </div>
        </div>
      </Card>
    )
  }

  const act = async (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null)
    const result = await action()
    if (!result.ok) setError(result.error ?? 'Something went wrong.')
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full ${
              status.checkedOut ? 'bg-pine-tint text-pine-deep' : status.checkedIn ? 'bg-amber-50 text-amber-600' : 'bg-wash text-muted'
            }`}
          >
            {status.checkedOut ? <CheckCircle2 size={20} /> : <Clock size={20} />}
          </span>
          <div>
            {status.checkedOut ? (
              <>
                <p className="text-[14px] font-semibold text-ink">You're done for today</p>
                <p className="tnum mt-0.5 text-[12.5px] text-muted">
                  {status.checkInTime} – {status.checkOutTime}
                </p>
              </>
            ) : status.checkedIn ? (
              <>
                <p className="text-[14px] font-semibold text-ink">Checked in</p>
                <p className="tnum mt-0.5 text-[12.5px] text-muted">at {status.checkInTime}</p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-semibold text-ink">You haven't checked in today</p>
                <p className="mt-0.5 text-[12.5px] text-muted">Check in when you start work.</p>
              </>
            )}
          </div>
        </div>

        {!status.checkedOut && (
          <Button
            onClick={() => void act(status.checkedIn ? onCheckOut : onCheckIn)}
            disabled={loading}
          >
            {status.checkedIn ? <LogOut size={15} /> : <LogIn size={15} />}
            {status.checkedIn ? 'Check Out' : 'Check In'}
          </Button>
        )}
      </div>

      {error && <p className="mt-3 text-[12.5px] text-clay">{error}</p>}
    </Card>
  )
}
