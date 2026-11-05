import { useState } from 'react'
import { CheckCircle2, Clock, LogIn, LogOut, Palmtree, ArrowRight } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import type { AttendanceMonth } from '@/services/attendanceService'
import type { LeaveType } from '@/services/leaveService'

type Props = {
  status: AttendanceMonth['myTodayStatus']
  loading: boolean
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

  // Fallback demo status if backend has no active employee row
  const activeStatus = status || {
    checkedIn: false,
    checkedOut: false,
    checkInTime: null,
    checkOutTime: null,
    onLeave: null,
  }

  if (activeStatus.onLeave) {
    const firstName = name.split(' ')[0] || name
    return (
      <Card className="p-4 sm:p-5 border border-hairline/80">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-pine-tint text-pine-deep">
            <Palmtree size={20} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">{LEAVE_MESSAGE[activeStatus.onLeave.type](firstName)}</p>
            <p className="mt-0.5 text-[12px] text-muted">No need to check in today.</p>
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
    <Card className="p-4 sm:p-5 border border-hairline/80 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full ${
              activeStatus.checkedOut
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : activeStatus.checkedIn
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-emerald-50/50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {activeStatus.checkedOut ? <CheckCircle2 size={20} /> : <Clock size={20} />}
          </span>
          <div>
            {activeStatus.checkedOut ? (
              <>
                <p className="text-[14px] font-bold text-ink">You're done for today 🎉</p>
                <p className="tnum mt-0.5 text-[12px] text-muted font-medium">
                  Shift: {activeStatus.checkInTime} – {activeStatus.checkOutTime}
                </p>
              </>
            ) : activeStatus.checkedIn ? (
              <>
                <p className="text-[14px] font-bold text-ink flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Checked In (Shift Active)
                </p>
                <p className="tnum mt-0.5 text-[12px] text-muted font-medium">
                  Logged in at {activeStatus.checkInTime} · Have a productive day!
                </p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-bold text-ink">You haven't checked in today</p>
                <p className="mt-0.5 text-[12px] text-muted font-medium">Click the button when your work starts.</p>
              </>
            )}
          </div>
        </div>

        {!activeStatus.checkedOut && (
          <Button
            onClick={() => void act(activeStatus.checkedIn ? onCheckOut : onCheckIn)}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs shadow-xs transition cursor-pointer ${
              activeStatus.checkedIn
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {activeStatus.checkedIn ? <LogOut size={15} /> : <LogIn size={15} />}
            <span>{activeStatus.checkedIn ? 'Check Out (Day End)' : 'Check In (Start Day)'}</span>
          </Button>
        )}
      </div>

      {error && <p className="mt-3 text-[12.5px] text-rose-600 font-semibold">{error}</p>}
    </Card>
  )
}
