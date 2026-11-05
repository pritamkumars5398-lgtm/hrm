import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  CalendarDays,
  CreditCard,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Briefcase,
  Sparkles,
  ChevronRight,
  User,
  ShieldCheck,
} from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useAttendanceStore } from '@/features/attendance/store/attendanceStore'
import CheckInOutCard from '@/features/attendance/components/CheckInOutCard'
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore'
import { timeAgo } from '@/shared/utils/timeAgo'

export default function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user)!
  const viewer = { permissions: user.permissions, name: user.name }

  const {
    data: attendanceData,
    checkingInOut,
    load: loadAttendance,
    checkIn,
    checkOut,
  } = useAttendanceStore()

  const { notifications, load: loadNotifications, markRead } = useNotificationsStore()

  useEffect(() => {
    void loadAttendance(viewer, { force: true })
    void loadNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstName = user.name.split(' ')[0]

  // Mock pending tasks for employee
  const pendingTasks: Array<{ id: string; title: string; due: string; priority: string; project: string }> = []

  // Leave Balance summary
  const leaveBalances: Array<{ type: string; total: number; used: number; available: number; color: string }> = []

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* 1. Greeting & Welcome Banner */}
      <div className="rounded-xl border border-hairline bg-white p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Employee Workspace
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mt-1.5">
            Good day, <span className="text-emerald-700">{firstName} 👋</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Here is your daily work snapshot, attendance status, pending tasks, and salary details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-surface text-xs font-semibold text-ink hover:bg-wash transition"
          >
            <User size={13} /> View Full Profile
          </Link>
        </div>
      </div>

      {/* 2. Today's Check-in Card (PUNCH IN / PUNCH OUT) */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Clock size={13} className="text-emerald-600" /> Today's Check-in
        </h2>
        {attendanceData && (
          <CheckInOutCard
            status={attendanceData.myTodayStatus}
            loading={checkingInOut}
            name={user.name}
            onCheckIn={() => checkIn(viewer)}
            onCheckOut={() => checkOut(viewer)}
          />
        )}
      </div>

      {/* 3. Top Metrics Row: Attendance Summary, Leave Balance, Salary Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance Summary */}
        <Card className="p-4 flex flex-col justify-between border border-hairline/80 hover:shadow-xs transition">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-600" /> Attendance Summary
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
              This Month
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center my-3">
            <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] text-muted font-bold block uppercase">Present</span>
              <span className="text-lg font-bold text-emerald-800">21</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] text-muted font-bold block uppercase">Late</span>
              <span className="text-lg font-bold text-amber-800">2</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-100">
              <span className="text-[10px] text-muted font-bold block uppercase">Absent</span>
              <span className="text-lg font-bold text-rose-800">0</span>
            </div>
          </div>
          <Link
            to="/dashboard/attendance"
            className="text-[11.5px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-1 border-t border-hairline"
          >
            <span>View Attendance Log</span>
            <ChevronRight size={13} />
          </Link>
        </Card>

        {/* Leave Balance */}
        <Card className="p-4 flex flex-col justify-between border border-hairline/80 hover:shadow-xs transition">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <CalendarDays size={14} className="text-amber-600" /> Leave Balance
            </h3>
            <span className="text-[11px] font-bold text-ink">27 Total Days</span>
          </div>
          <div className="space-y-2 my-2.5">
            {leaveBalances.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-muted font-medium flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${item.color}`} />
                  {item.type}
                </span>
                <span className="font-bold text-ink">{item.available} Available <span className="text-muted font-normal text-[10.5px]">({item.used} used)</span></span>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/leave"
            className="text-[11.5px] font-bold text-amber-700 hover:text-amber-800 flex items-center justify-between pt-1 border-t border-hairline"
          >
            <span>Apply for Leave</span>
            <ChevronRight size={13} />
          </Link>
        </Card>

        {/* Salary Summary */}
        <Card className="p-4 flex flex-col justify-between border border-hairline/80 hover:shadow-xs transition">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <CreditCard size={14} className="text-indigo-600" /> Salary Summary
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
              Processed
            </span>
          </div>
          <div className="my-2.5 space-y-1">
            <p className="text-[11px] text-muted font-medium">Net Monthly Payout (Oct 2026)</p>
            <p className="text-2xl font-black text-ink font-display">₹ 65,400</p>
            <p className="text-[11px] text-muted">Transferred to HDFC Bank A/c ···1234</p>
          </div>
          <Link
            to="/dashboard/payslip"
            className="text-[11.5px] font-bold text-indigo-700 hover:text-indigo-800 flex items-center justify-between pt-1 border-t border-hairline"
          >
            <span>Download Latest Payslip</span>
            <ChevronRight size={13} />
          </Link>
        </Card>
      </div>

      {/* 4. Bottom Row: Pending Tasks & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Tasks */}
        <Card className="p-4 flex flex-col justify-between border border-hairline/80">
          <div className="flex items-center justify-between pb-2.5 border-b border-hairline">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Briefcase size={14} className="text-emerald-600" /> Pending Tasks
            </h3>
            <span className="text-[11px] font-bold text-muted bg-wash px-2 py-0.5 rounded-full">
              {pendingTasks.length} Assigned
            </span>
          </div>

          <div className="divide-y divide-hairline my-1">
            {pendingTasks.map((t) => (
              <div key={t.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-ink text-xs truncate">{t.title}</p>
                  <p className="text-[11px] text-muted font-medium flex items-center gap-2">
                    <span>{t.project}</span>
                    <span>·</span>
                    <span className="text-ink/80">Due {t.due}</span>
                  </p>
                </div>
                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                  t.priority === 'Urgent'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : t.priority === 'High'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-wash text-muted border border-hairline'
                }`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/dashboard/timesheets"
            className="text-[11.5px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-2 border-t border-hairline mt-1"
          >
            <span>Go to My Tasks & Timesheets</span>
            <ChevronRight size={13} />
          </Link>
        </Card>

        {/* Notifications & Announcements */}
        <Card className="p-4 flex flex-col justify-between border border-hairline/80">
          <div className="flex items-center justify-between pb-2.5 border-b border-hairline">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Bell size={14} className="text-emerald-600" /> Notifications & Alerts
            </h3>
            <Link to="/dashboard/notifications" className="text-[11px] font-bold text-emerald-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-hairline my-1">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                onClick={() => { if (!n.read) void markRead(n.id) }}
                className="py-2.5 flex items-start gap-3 cursor-pointer hover:bg-wash/30 rounded-lg px-1 transition"
              >
                <div className={`size-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                  !n.read ? 'bg-emerald-100 text-emerald-800' : 'bg-wash text-muted'
                }`}>
                  <Bell size={12} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs truncate ${!n.read ? 'font-bold text-ink' : 'font-medium text-ink/80'}`}>{n.title}</p>
                    <span className="text-[10px] text-muted shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{n.body}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-muted">
                No new notifications. You're all caught up!
              </div>
            )}
          </div>

          <Link
            to="/dashboard/notifications"
            className="text-[11.5px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-2 border-t border-hairline mt-1"
          >
            <span>Notification Settings & History</span>
            <ChevronRight size={13} />
          </Link>
        </Card>
      </div>
    </div>
  )
}

