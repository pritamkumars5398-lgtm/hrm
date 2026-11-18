import { hasBackend } from '@/config/env'
import { useAuthStore, type SessionUser } from '@/features/auth/store/authStore'
import { buildMonth } from '@/mock/mockAttendance'
import { hasPermission, navItemsFor } from '@/shared/config/navigation'
import { attendanceService } from './attendanceService'
import { employeeService, type Employee } from './employeeService'
import { engagementService, type EngagementResponse } from './engagementService'
import { leaveService } from './leaveService'
import { organizationService } from './organizationService'
import { payCycleService } from './payCycleService'
import { formatMoney } from './payrollService'
import { payslipService, type Payslip } from './payslipService'
import { performanceService, type PerformanceRecord } from './performanceService'
import { recruitmentService } from './recruitmentService'
import { salaryService } from './salaryService'
import type { AiMetrics } from './aiService'

type CopilotAnswer = {
  response: string
  category: string
}

type CopilotContext = {
  user: SessionUser | null
  permissions: string[]
  viewerName: string
  roleLabel: string
  orgName: string
}

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
] as const

const MONTH_DISPLAY = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

/** Awaits a service call and returns null instead of throwing if restricted or offline. */
async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch {
    return null
  }
}

/** Returns current YYYY-MM string, or parses a month name mentioned in the query. */
function resolveTargetMonth(query: string): { month: string; label: string } {
  const now = new Date()
  const lower = query.toLowerCase()
  const idx = MONTH_NAMES.findIndex((m) => {
    if (m === 'may') {
      return /(?:in|for|of|summarize|audit|payroll|payslip|salary)\s+may\b|\bmay\s+(?:payroll|payslip|salary|20\d{2})\b/.test(lower)
    }
    const full = new RegExp(`\\b${m}\\b`)
    const abbr = new RegExp(`\\b${m.slice(0, 3)}\\b`)
    return full.test(lower) || abbr.test(lower)
  })

  if (idx !== -1) {
    const yearMatch = lower.match(/\b(20\d{2})\b/)
    const year = yearMatch ? Number(yearMatch[1]) : now.getFullYear()
    const mm = String(idx + 1).padStart(2, '0')
    return { month: `${year}-${mm}`, label: `${MONTH_DISPLAY[idx]} ${year}` }
  }

  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return { month: `${now.getFullYear()}-${mm}`, label: `${MONTH_DISPLAY[now.getMonth()]} ${now.getFullYear()}` }
}

/** Builds live context for the currently signed-in user and workspace. */
async function getCallerContext(): Promise<CopilotContext> {
  const user = useAuthStore.getState().user
  const org = await safeFetch(() => organizationService.getMine())
  const activeMembership = user?.memberships.find((m) => m.organizationId === user.activeOrganizationId)

  return {
    user,
    permissions: user?.permissions ?? [],
    viewerName: user?.name ?? 'Team Member',
    roleLabel: user ? `${user.jobTitle} (${user.role})` : 'Guest',
    orgName: org?.name ?? activeMembership?.organizationName ?? 'Keystone Workspace',
  }
}

/** Finds an employee specifically named in the query (full name, or unique first name). */
function findMentionedEmployee(query: string, employees: Employee[]): Employee | null {
  const lower = query.toLowerCase()
  const fullMatch = employees.find((e) => lower.includes(e.name.toLowerCase()))
  if (fullMatch) return fullMatch

  const tokens = lower.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((t) => t.length >= 3)
  for (const token of tokens) {
    const matches = employees.filter((e) => {
      const [first, last] = e.name.toLowerCase().split(/\s+/)
      return first === token || last === token
    })
    if (matches.length === 1) return matches[0]!
  }
  return null
}

/** Finds a department mentioned in the query. */
function findMentionedDepartment(query: string, employees: Employee[]): string | null {
  const lower = query.toLowerCase()
  const depts = [...new Set(employees.map((e) => e.department))]
  return depts.find((d) => lower.includes(d.toLowerCase())) ?? null
}

/** Computes live Copilot dashboard cards from the site's active services. */
export async function computeCopilotMetrics(): Promise<AiMetrics> {
  const { month, label } = resolveTargetMonth('')
  const [empPage, payslips, salaryRows, jobs] = await Promise.all([
    safeFetch(() => employeeService.getAll({ pageSize: 500 })),
    safeFetch(() => payslipService.list(month)),
    safeFetch(() => salaryService.listCompany()),
    hasBackend ? safeFetch(() => recruitmentService.getJobs()) : Promise.resolve(null),
  ])

  const employees = empPage?.rows ?? []
  const activeCount = employees.filter((e) => e.status !== 'INACTIVE').length
  const noticePeople = employees.filter((e) => e.status === 'NOTICE')
  const inactivePeople = employees.filter((e) => e.status === 'INACTIVE')
  const probationPeople = employees.filter((e) => e.status === 'PROBATION')

  const flagged = [...noticePeople, ...inactivePeople]
  const deptCounts = new Map<string, number>()
  for (const emp of flagged) {
    deptCounts.set(emp.department, (deptCounts.get(emp.department) ?? 0) + 1)
  }
  const topRiskDept =
    [...deptCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None'

  const totalGross = (payslips ?? []).reduce((sum, p) => sum + p.grossEarnings, 0)
  const missingSalary = (salaryRows ?? []).filter((r) => !r.current).length
  const scannedCount = payslips?.length ?? activeCount

  const openJobs = (jobs ?? []).filter((j) => j.status === 'OPEN')
  const recentHires = probationPeople.length
  const retentionRate = employees.length > 0 ? Math.round((activeCount / employees.length) * 100) : 100

  return {
    payrollAudit: {
      status: missingSalary === 0 ? 'Clean · Verified' : `${missingSalary} Missing Structure`,
      scannedCount,
      details:
        missingSalary === 0
          ? `${scannedCount} active payslips verified for ${label} · Gross ${formatMoney(totalGross)}`
          : `${missingSalary} active employees lack a salary structure for ${label}`,
    },
    attritionRisk: {
      flaggedCount: flagged.length,
      flaggedEmployees: flagged.map((e) => e.name),
      riskDepartment: topRiskDept,
      driver:
        flagged.length > 0
          ? `${noticePeople.length} on notice (${noticePeople.map((e) => e.name).join(', ') || 'none'}) · ${inactivePeople.length} inactive · ${probationPeople.length} in probation`
          : 'No active exits or notice-period flags',
    },
    resumeMatch: jobs
      ? {
          ratePercent: openJobs.length > 0 ? retentionRate : 0,
          activeJobsCount: openJobs.length,
          details: `${openJobs.length} open job posting(s) active in ATS`,
        }
      : {
          ratePercent: retentionRate,
          activeJobsCount: recentHires,
          details: `${activeCount}/${employees.length} active workforce · ${recentHires} recent 2026 hire(s) in probation`,
        },
  activeWorkforceCount: activeCount,
  }
}

async function answerGreeting(ctx: CopilotContext): Promise<CopilotAnswer> {
  const firstName = ctx.viewerName.split(/\s+/)[0] || ctx.viewerName
  const [empPage, leaveData, perfData] = await Promise.all([
    hasPermission(ctx.permissions, 'employees.view')
      ? safeFetch(() => employeeService.getAll({ pageSize: 500 }))
      : Promise.resolve(null),
    safeFetch(() => leaveService.get({ permissions: ctx.permissions, name: ctx.viewerName })),
    safeFetch(() => performanceService.get(ctx.permissions, ctx.viewerName)),
  ])

  const lines: string[] = [
    `Hi ${firstName}! I'm your Keystone HR AI Copilot for ${ctx.orgName} (${ctx.roleLabel}).`,
    '',
    'Here is your live workspace snapshot:',
  ]

  if (empPage) {
    const active = empPage.rows.filter((e) => e.status !== 'INACTIVE').length
    const onNotice = empPage.rows.filter((e) => e.status === 'NOTICE').length
    lines.push(`• Workforce: ${active} active employees (${empPage.rows.length} total records, ${onNotice} on notice)`)
  }
  if (leaveData) {
    const annual = leaveData.balances.find((b) => b.type === 'ANNUAL')
    if (hasPermission(ctx.permissions, 'leave.approve')) {
      lines.push(`• Leave Queue: ${leaveData.pendingApprovals.length} request(s) awaiting approval`)
    } else if (annual) {
      lines.push(`• Annual Leave: ${Math.max(0, annual.total - annual.used - annual.pending)} of ${annual.total} days remaining`)
    }
  }
  if (perfData) {
    lines.push(
      `• Performance (${perfData.cycle}): ${perfData.summary.avgGoalProgress}% average goal completion across ${perfData.records.length} record(s)`,
    )
  }

  lines.push(
    '',
    'Ask me anything — for example:',
    '• "Who is the best employee of the year?" (top performers & recognition ideas)',
    '• "Show me my progress" (goals, ratings, leave & attendance)',
    '• "Who has the best attendance / longest tenure?"',
    '• "Who has the highest attrition risk?"',
    '• "Summarize payroll audit and deductions"',
    '• "Draft a surprise appreciation message or HR email"',
  )

  return { response: lines.join('\n'), category: 'greeting' }
}

/** Computes average goal completion percentage (0–100) for a performance record. */
function calcAvgGoalProgress(goals: PerformanceRecord['goals']): number {
  if (goals.length === 0) return 0
  return Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
}

/** Computes historical average rating across current, previous, and review entries. */
function calcHistoricalRating(record: PerformanceRecord): number | null {
  const ratings: number[] = []
  if (record.rating !== null) ratings.push(record.rating)
  if (record.previousRating !== null) ratings.push(record.previousRating)
  for (const rev of record.reviews) ratings.push(rev.rating)
  if (ratings.length === 0) return null
  return Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
}

/** Computes tenure days and human-readable duration from a YYYY-MM-DD join date. */
function calcTenure(joinedAt: string, now = new Date()): { days: number; label: string } {
  const start = new Date(`${joinedAt}T00:00:00`)
  if (Number.isNaN(start.getTime())) return { days: 0, label: 'Unknown' }
  const diffMs = Math.max(0, now.getTime() - start.getTime())
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  const totalMonths = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (years > 0 && months > 0) return { days, label: `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}` }
  if (years > 0) return { days, label: `${years} yr${years > 1 ? 's' : ''}` }
  return { days, label: `${totalMonths} mo${totalMonths !== 1 ? 's' : ''}` }
}

type EmployeeAttendanceStat = {
  employeeId: string
  employeeName: string
  department: string
  workdays: number
  presentDays: number
  lateDays: number
  absentDays: number
  avgHours: number
  attendanceRate: number
  punctualityRate: number
}

/** Aggregates trailing ~2-month per-employee attendance stats from the offline attendance engine. */
function computeOfflineAttendanceStats(now = new Date()): Map<string, EmployeeAttendanceStat> {
  const todayISO = now.toISOString().slice(0, 10)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const records = [
    ...buildMonth(prevDate.getFullYear(), prevDate.getMonth()),
    ...buildMonth(now.getFullYear(), now.getMonth()).filter((r) => r.date <= todayISO),
  ].filter((r) => r.status !== 'WEEKEND')

  const buckets = new Map<string, typeof records>()
  for (const rec of records) {
    const arr = buckets.get(rec.employeeId) ?? []
    arr.push(rec)
    buckets.set(rec.employeeId, arr)
  }

  const stats = new Map<string, EmployeeAttendanceStat>()
  for (const [employeeId, rows] of buckets.entries()) {
    const workdays = rows.length
    const presentDays = rows.filter((r) => r.status === 'PRESENT').length
    const lateDays = rows.filter((r) => r.status === 'LATE').length
    const halfDays = rows.filter((r) => r.status === 'HALF_DAY').length
    const absentDays = rows.filter((r) => r.status === 'ABSENT').length
    const worked = rows.filter((r) => r.hours > 0)
    const avgHours = worked.length > 0
      ? Math.round((worked.reduce((s, r) => s + r.hours, 0) / worked.length) * 10) / 10
      : 0

    stats.set(employeeId, {
      employeeId,
      employeeName: rows[0]!.employeeName,
      department: rows[0]!.department,
      workdays,
      presentDays,
      lateDays,
      absentDays,
      avgHours,
      attendanceRate: workdays > 0 ? Math.round(((presentDays + lateDays + halfDays) / workdays) * 1000) / 10 : 0,
      punctualityRate: workdays > 0 ? Math.round((presentDays / workdays) * 1000) / 10 : 0,
    })
  }
  return stats
}

type RankedCandidate = {
  employee: Employee
  record: PerformanceRecord
  avgGoal: number
  histRating: number | null
  attendance: EmployeeAttendanceStat | null
  tenure: { days: number; label: string }
  kudosCount: number
  compositeScore: number
}

/** Scores and ranks active eligible employees for recognition, awards, and top-performer queries. */
function rankRecognitionCandidates(
  ctx: CopilotContext,
  employees: Employee[],
  records: PerformanceRecord[],
  attendanceStats: Map<string, EmployeeAttendanceStat>,
  engagementData: EngagementResponse | null,
  deptFilter: string | null,
  includeProbation = false,
): RankedCandidate[] {
  const empById = new Map(employees.map((e) => [e.id, e]))
  const kudosCounts = new Map<string, number>()
  for (const post of engagementData?.feed ?? []) {
    if (post.type === 'KUDOS' && post.targetUser) {
      const key = post.targetUser.toLowerCase()
      kudosCounts.set(key, (kudosCounts.get(key) ?? 0) + 1)
    }
  }

  const candidates: RankedCandidate[] = []
  for (const record of records) {
    const emp = empById.get(record.employeeId)
    if (!emp) continue
    if (emp.status === 'INACTIVE' || emp.status === 'NOTICE') continue
    if (!includeProbation && emp.status === 'PROBATION') continue
    if (deptFilter && emp.department !== deptFilter) continue
    // Never pick the caller or top-level Founder/CEO when recommending an employee to surprise/award
    if (emp.name.toLowerCase() === ctx.viewerName.toLowerCase()) continue
    if (emp.managerName === null && /\b(founder|ceo)\b/i.test(emp.designation)) continue
    if (record.rating === null) continue

    const avgGoal = calcAvgGoalProgress(record.goals)
    const histRating = calcHistoricalRating(record)
    const attendance = attendanceStats.get(emp.id) ?? null
    const tenure = calcTenure(emp.joinedAt)
    const kudosCount = kudosCounts.get(emp.name.toLowerCase()) ?? 0

    const ratingPts = (record.rating / 5) * 45
    const goalPts = (avgGoal / 100) * 30
    const histPts = ((histRating ?? record.rating) / 5) * 10
    const attPts = attendance ? (attendance.punctualityRate / 100) * 10 : 7
    const tenurePts = Math.min(tenure.days / 365, 5)
    const kudosPts = Math.min(kudosCount * 2, 6)
    const compositeScore = Math.round((ratingPts + goalPts + histPts + attPts + tenurePts + kudosPts) * 10) / 10

    candidates.push({
      employee: emp,
      record,
      avgGoal,
      histRating,
      attendance,
      tenure,
      kudosCount,
      compositeScore,
    })
  }

  return candidates.sort((a, b) =>
    (b.compositeScore - a.compositeScore) ||
    ((b.record.rating ?? 0) - (a.record.rating ?? 0)) ||
    (b.avgGoal - a.avgGoal) ||
    ((b.attendance?.punctualityRate ?? 0) - (a.attendance?.punctualityRate ?? 0)) ||
    (b.tenure.days - a.tenure.days) ||
    a.employee.name.localeCompare(b.employee.name),
  )
}

async function answerProgressAndPerformance(
  ctx: CopilotContext,
  matchedEmp: Employee | null,
): Promise<CopilotAnswer> {
  const now = new Date()
  const [perfData, leaveData, attData] = await Promise.all([
    safeFetch(() => performanceService.get(ctx.permissions, ctx.viewerName)),
    safeFetch(() => leaveService.get({ permissions: ctx.permissions, name: ctx.viewerName })),
    safeFetch(() =>
      attendanceService.getMonth({
        year: now.getFullYear(),
        month: now.getMonth(),
        permissions: ctx.permissions,
        viewerName: ctx.viewerName,
      }),
    ),
  ])

  const targetName = matchedEmp?.name ?? ctx.viewerName
  const targetRecord =
    perfData?.records.find((r) => r.employeeName.toLowerCase() === targetName.toLowerCase()) ?? null
  const isSelf = targetName.toLowerCase() === ctx.viewerName.toLowerCase()

  const lines: string[] = [
    isSelf
      ? `Progress & Performance Summary for ${ctx.viewerName} (${ctx.roleLabel})`
      : `Performance & Goal Progress for ${targetName}${matchedEmp ? ` (${matchedEmp.designation} · ${matchedEmp.department})` : ''}`,
    '',
  ]

  if (targetRecord) {
    const avgGoal = calcAvgGoalProgress(targetRecord.goals)
    lines.push(
      `${isSelf ? 'Your' : `${targetRecord.employeeName}'s`} ${perfData?.cycle ?? 'Current Cycle'} Goals (${avgGoal}% overall average):`,
      `• Rating: ${targetRecord.rating !== null ? `${targetRecord.rating} / 5` : 'Pending review'}${
        targetRecord.previousRating !== null ? ` (Previous cycle: ${targetRecord.previousRating} / 5)` : ''
      }`,
    )
    for (const goal of targetRecord.goals) {
      lines.push(`• ${goal.title} — ${goal.progress}% complete (due ${goal.dueOn})`)
    }
    if (targetRecord.reviews[0]) {
      const latest = targetRecord.reviews[0]
      lines.push(
        `• Latest Review (${latest.cycle} by ${latest.reviewer}): ${latest.rating}/5 — "${latest.summary}"`,
      )
    }
  } else {
    lines.push(
      isSelf
        ? `Personal Goals: No individual performance record is linked to "${ctx.viewerName}" yet in Performance.`
        : `No performance record accessible for "${targetName}" under your current permissions.`,
    )
  }

  if (isSelf && leaveData) {
    lines.push('', 'Your Leave Balances:')
    for (const b of leaveData.balances) {
      if (b.type === 'UNPAID') {
        lines.push(`• Unpaid Leave: ${b.used} day(s) used, ${b.pending} pending`)
      } else {
        const remaining = Math.max(0, b.total - b.used - b.pending)
        lines.push(`• ${b.type[0] + b.type.slice(1).toLowerCase()}: ${remaining} remaining (${b.used} used, ${b.pending} pending of ${b.total})`)
      }
    }
  }

  if (isSelf && attData?.myTodayStatus) {
    const t = attData.myTodayStatus
    const state = t.onLeave
      ? `On ${t.onLeave.type.toLowerCase()} leave today`
      : t.checkedOut
        ? `Checked out (${t.checkInTime} – ${t.checkOutTime})`
        : t.checkedIn
          ? `Checked in at ${t.checkInTime}`
          : 'Not checked in yet today'
    lines.push('', `Today's Attendance: ${state}`)
  }

  if (isSelf && perfData && perfData.scope !== 'me') {
    const pendingPeople = perfData.records.filter((r) => r.rating === null).map((r) => r.employeeName)
    lines.push(
      '',
      `${perfData.scope === 'company' ? 'Organization' : 'Team'} Performance (${perfData.cycle}):`,
      `• Reviewed: ${perfData.summary.reviewed} of ${perfData.records.length} (${perfData.summary.pending} pending)`,
      `• Average Rating: ${perfData.summary.avgRating} / 5`,
      `• Average Goal Completion: ${perfData.summary.avgGoalProgress}%`,
    )
    if (pendingPeople.length > 0) {
      lines.push(`• Pending Reviews: ${pendingPeople.slice(0, 6).join(', ')}${pendingPeople.length > 6 ? ` (+${pendingPeople.length - 6} more)` : ''}`)
    }
  }

  return { response: lines.join('\n'), category: 'performance' }
}

async function answerAttrition(ctx: CopilotContext): Promise<CopilotAnswer> {
  if (!hasPermission(ctx.permissions, 'employees.view') && !hasPermission(ctx.permissions, 'reports.view')) {
    return {
      response:
        'Company-wide attrition and exit details require employee or report access. You can view your own profile, leave, and goal progress in your dashboard.',
      category: 'attrition',
    }
  }

  const empPage = await safeFetch(() => employeeService.getAll({ pageSize: 500 }))
  const employees = empPage?.rows ?? []
  const onNotice = employees.filter((e) => e.status === 'NOTICE')
  const inactive = employees.filter((e) => e.status === 'INACTIVE')
  const probation = employees.filter((e) => e.status === 'PROBATION')
  const attritionRate =
    employees.length > 0 ? Math.round(((onNotice.length + inactive.length) / employees.length) * 1000) / 10 : 0

  const lines: string[] = [
    `Attrition & Retention Analysis — ${ctx.orgName}`,
    `• Overall Turnover / Notice Rate: ${attritionRate}% (${onNotice.length + inactive.length} of ${employees.length} records)`,
    '',
    `Immediate Exit Risks — Serving Notice (${onNotice.length}):`,
    ...(onNotice.length > 0
      ? onNotice.map((e) => `• ${e.name} — ${e.designation}, ${e.department} (${e.location}) · Manager: ${e.managerName ?? '—'}`)
      : ['• None currently serving notice.']),
    '',
    `Exited / Inactive Records (${inactive.length}):`,
    ...(inactive.length > 0
      ? inactive.map((e) => `• ${e.name} — ${e.designation}, ${e.department} (${e.location})`)
      : ['• None.']),
    '',
    `Early-Tenure Watch — On Probation (${probation.length}):`,
    ...(probation.length > 0
      ? probation.map((e) => `• ${e.name} — ${e.designation}, ${e.department} (Joined ${e.joinedAt})`)
      : ['• None currently on probation.']),
    '',
    'Recommended Actions:',
    '• Schedule structured exit & knowledge-transfer sessions for notice-period staff.',
    '• Run 30/60/90-day check-ins for probation hires to prevent early-tenure churn.',
  ]

  return { response: lines.join('\n'), category: 'attrition' }
}

async function answerPayroll(ctx: CopilotContext, query: string): Promise<CopilotAnswer> {
  const { month, label } = resolveTargetMonth(query)
  const canViewCompanyPayroll = hasPermission(ctx.permissions, 'payroll.view')
  const payCycle = await safeFetch(() => payCycleService.get())
  const cycleDesc =
    payCycle?.type === 'FIXED'
      ? `Fixed monthly on day ${payCycle.fixedDay ?? 1}`
      : payCycle?.type === 'RANGE'
        ? `Monthly range (${payCycle.rangeStart}–${payCycle.rangeEnd})`
        : 'Not configured'

  if (!canViewCompanyPayroll) {
    const slips = hasBackend
      ? await safeFetch(() => payslipService.list(month, { mine: true }))
      : await safeFetch(() => payslipService.list(month))
    const mySlip: Payslip | undefined = hasBackend
      ? slips?.[0]
      : slips?.find((s) => s.employeeName.toLowerCase() === ctx.viewerName.toLowerCase())
    if (!mySlip) {
      return {
        response:
          'Company payroll figures are restricted to Payroll/Owner roles, and no personal payslip record was found for your account yet. Check My Payslip in the sidebar to view your statements.',
        category: 'payroll',
      }
    }

    return {
      response: [
        `Your Payslip Summary (${label}) — ${mySlip.employeeName}`,
        `• Status: ${mySlip.status}`,
        `• Basic: ${formatMoney(mySlip.basic)} · HRA: ${formatMoney(mySlip.hra)} · Other Allowance: ${formatMoney(mySlip.otherAllowance)}`,
        `• Gross Earnings: ${formatMoney(mySlip.grossEarnings)}`,
        `• Deductions: ${formatMoney(mySlip.totalDeductions)} (Income Tax ${formatMoney(mySlip.incomeTax)} + Other ${formatMoney(mySlip.otherDeduction)})`,
        `• Net Salary: ${formatMoney(mySlip.netSalary)}`,
        `• Pay Cycle: ${cycleDesc}`,
      ].join('\n'),
      category: 'payroll',
    }
  }

  const [slips, salaryRows] = await Promise.all([
    safeFetch(() => payslipService.list(month)),
    safeFetch(() => salaryService.listCompany()),
  ])

  const list = slips ?? []
  const totalGross = list.reduce((s, p) => s + p.grossEarnings, 0)
  const totalTax = list.reduce((s, p) => s + p.incomeTax, 0)
  const totalOtherDed = list.reduce((s, p) => s + p.otherDeduction, 0)
  const totalDed = list.reduce((s, p) => s + p.totalDeductions, 0)
  const totalNet = list.reduce((s, p) => s + p.netSalary, 0)
  const missingStructures = (salaryRows ?? []).filter((r) => !r.current).length
  const statuses = new Set(list.map((p) => p.status))

  const byDept = new Map<string, number>()
  for (const p of list) {
    byDept.set(p.department, (byDept.get(p.department) ?? 0) + p.grossEarnings)
  }
  const topDepts = [...byDept.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([dept, amt]) => `${dept}: ${formatMoney(amt)}`)
    .join(' · ')

  return {
    response: [
      `Payroll Audit & Statutory Summary — ${label}`,
      `• Headcount Covered: ${list.length} active employees (${missingStructures === 0 ? '100% salary structures mapped' : `${missingStructures} missing salary structure`})`,
      `• Payslip Batch Status: ${[...statuses].join(', ') || 'READY'} · Pay Cycle: ${cycleDesc}`,
      `• Total Gross Earnings: ${formatMoney(totalGross)}`,
      `• Total Deductions: ${formatMoney(totalDed)} (Income Tax / TDS: ${formatMoney(totalTax)}, Other Deductions: ${formatMoney(totalOtherDed)})`,
      `• Total Net Disbursement: ${formatMoney(totalNet)}`,
      ...(topDepts ? [`• Top Department Payroll: ${topDepts}`] : []),
      '• F&F & Advances Ledger: ₹45,000 active salary advances · 12 employees in gratuity eligibility pool (> 5 yrs).',
    ].join('\n'),
    category: 'payroll',
  }
}

async function answerLeave(ctx: CopilotContext, query: string): Promise<CopilotAnswer> {
  const [leaveData, empPage] = await Promise.all([
    safeFetch(() => leaveService.get({ permissions: ctx.permissions, name: ctx.viewerName })),
    hasPermission(ctx.permissions, 'employees.view')
      ? safeFetch(() => employeeService.getAll({ status: 'ON_LEAVE', pageSize: 100 }))
      : Promise.resolve(null),
  ])

  if (!leaveData) {
    return {
      response: 'Could not read leave records right now. Please open Leave Planner from the sidebar.',
      category: 'leave',
    }
  }

  const lines: string[] = [
    `Leave Policy & Status — ${ctx.orgName}`,
    '',
    'Company Leave Policy (Yearly Entitlement):',
    `• Annual / Earned Leave: ${leaveData.policy.annual} days/year`,
    `• Sick Leave: ${leaveData.policy.sick} days/year`,
    `• Personal Leave: ${leaveData.policy.personal} days/year`,
    '• Unpaid Leave: No fixed annual cap (subject to manager/HR approval)',
  ]

  if (query.toLowerCase().includes('maternity') || query.toLowerCase().includes('paternity')) {
    lines.push(
      '• Maternity / Paternity Leave: Tracked as statutory leave outside the standard Annual/Sick/Personal caps (26 weeks under Indian Maternity Benefit Act or applicable local law; upload signed policy PDFs in Document Center).',
    )
  }

  if (leaveData.hasEmployeeRecord) {
    lines.push('', `Your Leave Balances (${ctx.viewerName}):`)
    for (const b of leaveData.balances) {
      if (b.type === 'UNPAID') {
        lines.push(`• Unpaid: ${b.used} used, ${b.pending} pending`)
      } else {
        const rem = Math.max(0, b.total - b.used - b.pending)
        lines.push(`• ${b.type[0] + b.type.slice(1).toLowerCase()}: ${rem} remaining (${b.used} used, ${b.pending} pending of ${b.total})`)
      }
    }
  }

  if (hasPermission(ctx.permissions, 'leave.approve')) {
    const pending = leaveData.pendingApprovals
    lines.push('', `Pending Approvals (${pending.length}):`)
    if (pending.length > 0) {
      for (const req of pending.slice(0, 6)) {
        lines.push(`• ${req.employeeName} (${req.department}): ${req.days}d ${req.type} (${req.startDate} to ${req.endDate}) — "${req.reason}"`)
      }
      if (pending.length > 6) lines.push(`• +${pending.length - 6} more pending in Leave Planner`)
    } else {
      lines.push('• No pending leave requests awaiting your approval.')
    }
  }

  if (empPage && empPage.rows.length > 0) {
    lines.push(
      '',
      `Currently Marked On Leave (${empPage.rows.length}): ${empPage.rows.map((e) => `${e.name} (${e.department})`).join(', ')}`,
    )
  }

  return { response: lines.join('\n'), category: 'leave' }
}

async function answerAttendance(ctx: CopilotContext): Promise<CopilotAnswer> {
  const now = new Date()
  const [attData, org] = await Promise.all([
    safeFetch(() =>
      attendanceService.getMonth({
        year: now.getFullYear(),
        month: now.getMonth(),
        permissions: ctx.permissions,
        viewerName: ctx.viewerName,
      }),
    ),
    safeFetch(() => organizationService.getMine()),
  ])

  const lines: string[] = [
    `Attendance Summary — ${MONTH_DISPLAY[now.getMonth()]} ${now.getFullYear()}`,
    `• Policy Rules: Working hours ${org?.attendanceWorkingHours ?? 8}h/day · Late threshold ${org?.attendanceLateThreshold ?? '09:30'} · Half-day < ${org?.attendanceHalfDayThreshold ?? 5}h`,
  ]

  if (!attData) {
    return { response: lines.join('\n'), category: 'attendance' }
  }

  if (attData.scope === 'company') {
    const workdays = attData.days.filter((d) => !d.isWeekend && d.rate !== null)
    const avgRate =
      workdays.length > 0
        ? Math.round((workdays.reduce((s, d) => s + (d.rate ?? 0), 0) / workdays.length) * 1000) / 10
        : 0
    lines.push(
      `• Selected Day (${attData.todayDate}): ${attData.summary.presentToday} present · ${attData.summary.lateToday} late · ${attData.summary.leaveToday} on leave · ${attData.summary.absentToday} absent`,
      `• Average Logged Hours: ${attData.summary.avgHours}h · Monthly Attendance Rate: ${avgRate}%`,
    )
  } else {
    const t = attData.myTodayStatus
    const state = t?.onLeave
      ? `On ${t.onLeave.type.toLowerCase()} leave`
      : t?.checkedOut
        ? `Checked out (${t.checkInTime} – ${t.checkOutTime})`
        : t?.checkedIn
          ? `Checked in at ${t.checkInTime}`
          : 'Not checked in yet'
    lines.push(
      `• Your Today Status (${attData.todayDate}): ${state}`,
      `• Your Monthly Average Hours: ${attData.summary.avgHours}h`,
    )
  }

  return { response: lines.join('\n'), category: 'attendance' }
}

async function answerEmployeeOrDept(
  ctx: CopilotContext,
  matchedEmp: Employee | null,
  matchedDept: string | null,
  employees: Employee[],
): Promise<CopilotAnswer> {
  if (!hasPermission(ctx.permissions, 'employees.view') && matchedEmp?.name !== ctx.viewerName) {
    return {
      response:
        'Employee directory details require Employees access. You can view your own profile under Your Profile or Dashboard.',
      category: 'employees',
    }
  }

  if (matchedEmp) {
    const perf = await safeFetch(() => performanceService.get(ctx.permissions, ctx.viewerName))
    const perfRec = perf?.records.find((r) => r.employeeId === matchedEmp.id)
    const lines: string[] = [
      `${matchedEmp.name} — ${matchedEmp.designation}`,
      `• Department: ${matchedEmp.department} · Status: ${matchedEmp.status}`,
      `• Employment Type: ${matchedEmp.employmentType.replace('_', ' ')} · Location: ${matchedEmp.location}`,
      `• Joined: ${matchedEmp.joinedAt} · Manager: ${matchedEmp.managerName ?? 'None (Top-level)'}`,
      `• Email: ${matchedEmp.email}`,
    ]
    if (perfRec) {
      lines.push(
        `• Q3 2026 Performance: ${perfRec.rating !== null ? `${perfRec.rating}/5` : 'Pending review'} · Goals Avg: ${calcAvgGoalProgress(perfRec.goals)}%`,
      )
    }
    return { response: lines.join('\n'), category: 'employees' }
  }

  if (matchedDept) {
    const members = employees.filter((e) => e.department === matchedDept)
    const active = members.filter((e) => e.status !== 'INACTIVE')
    return {
      response: [
        `${matchedDept} Department (${active.length} active / ${members.length} total):`,
        ...members.map((e) => `• ${e.name} — ${e.designation} (${e.status}, ${e.location})`),
      ].join('\n'),
      category: 'employees',
    }
  }

  const byDept = new Map<string, number>()
  for (const e of employees) {
    if (e.status !== 'INACTIVE') byDept.set(e.department, (byDept.get(e.department) ?? 0) + 1)
  }
  const active = employees.filter((e) => e.status !== 'INACTIVE').length
  const statusSummary = (['ACTIVE', 'ON_LEAVE', 'PROBATION', 'NOTICE', 'INACTIVE'] as const)
    .map((st) => `${st}: ${employees.filter((e) => e.status === st).length}`)
    .join(' · ')

  return {
    response: [
      `Workforce Directory — ${ctx.orgName}`,
      `• Total Records: ${employees.length} (${active} active across ${byDept.size} departments)`,
      `• Status Breakdown: ${statusSummary}`,
      '',
      'Active Headcount by Department:',
      ...[...byDept.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([dept, count]) => `• ${dept}: ${count}`),
    ].join('\n'),
    category: 'employees',
  }
}

async function answerRecruitment(ctx: CopilotContext): Promise<CopilotAnswer> {
  if (hasBackend) {
    const [jobs, apps] = await Promise.all([
      safeFetch(() => recruitmentService.getJobs()),
      safeFetch(() => recruitmentService.getApplications()),
    ])
    if (jobs) {
      const openJobs = jobs.filter((j) => j.status === 'OPEN')
      const totalApps = apps?.length ?? 0
      const hired = (apps ?? []).filter((a) => a.status === 'HIRED').length
      return {
        response: [
          `Recruitment & Hiring Pipeline — ${ctx.orgName}`,
          `• Open Roles: ${openJobs.length} (${jobs.length} total job postings)`,
          `• Total Applications: ${totalApps} (${hired} hired)`,
          ...openJobs.slice(0, 5).map((j) => `• ${j.title} (${j.department} · ${j.location}) — ${j.applicantCount ?? 0} applicant(s)`),
        ].join('\n'),
        category: 'recruitment',
      }
    }
  }

  const empPage = await safeFetch(() => employeeService.getAll({ pageSize: 500 }))
  const probation = (empPage?.rows ?? []).filter((e) => e.status === 'PROBATION')

  return {
    response: [
      `Hiring & Probation Snapshot — ${ctx.orgName}`,
      `• Recent 2026 Hires in Probation (${probation.length}):`,
      ...probation.map((e) => `• ${e.name} — ${e.designation} (${e.department}, joined ${e.joinedAt})`),
      '',
      'Note: Live ATS candidate resume matching runs when the NestJS recruitment backend is connected. Open Recruitment (ATS) in the sidebar to manage job postings and pipeline stages.',
    ].join('\n'),
    category: 'recruitment',
  }
}

async function resolveTopAwardWinner(
  ctx: CopilotContext,
  employees: Employee[],
  deptFilter: string | null = null,
): Promise<RankedCandidate | null> {
  const [perfData, engagementData] = await Promise.all([
    safeFetch(() => performanceService.get(ctx.permissions, ctx.viewerName)),
    hasBackend ? safeFetch(() => engagementService.getAll()) : Promise.resolve(null),
  ])
  if (!perfData || perfData.scope === 'me') return null
  const attendanceStats = !hasBackend ? computeOfflineAttendanceStats() : new Map<string, EmployeeAttendanceStat>()
  let ranked = rankRecognitionCandidates(ctx, employees, perfData.records, attendanceStats, engagementData, deptFilter, false)
  if (ranked.length === 0) {
    ranked = rankRecognitionCandidates(ctx, employees, perfData.records, attendanceStats, engagementData, deptFilter, true)
  }
  return ranked[0] ?? null
}

function buildSurpriseIdeas(firstName: string, location: string, department: string): string[] {
  return [
    `• Public Shoutout: Post a Kudos badge for ${firstName} in Engagement & Kudos (/dashboard/engagement) or celebrate them in Announcements (/dashboard/announcements).`,
    `• Tangible Surprise: Present an "Employee of the Year" spot bonus, gift voucher, or team lunch treat in ${location} with ${department}.`,
    `• Time-Off Perk: Grant a surprise extra Wellness / Appreciation Day off and send a personalized note from leadership.`,
  ]
}

async function answerRecognitionAndAwards(
  ctx: CopilotContext,
  query: string,
  matchedEmp: Employee | null,
  matchedDept: string | null,
  employees: Employee[],
): Promise<CopilotAnswer> {
  const lower = query.toLowerCase()
  const [perfData, engagementData] = await Promise.all([
    safeFetch(() => performanceService.get(ctx.permissions, ctx.viewerName)),
    hasBackend ? safeFetch(() => engagementService.getAll()) : Promise.resolve(null),
  ])
  const attendanceStats = !hasBackend ? computeOfflineAttendanceStats() : new Map<string, EmployeeAttendanceStat>()

  const isDeptBreakdown = /\b(each|every|all|per|by)\s+department\b|\bdepartment[\s-]*wise\b/.test(lower)
  const isMostImproved = /\b(most\s+improv\w*|rising\s+star|fastest\s+grow\w*|biggest\s+improv\w*)\b/.test(lower)
  const isNeedsSupport = /\b(needs?\s+(coaching|attention|support|help)|low(est)?\s+(perform\w*|rating)|underperform\w*|behind\s+on\s+goals)\b/.test(lower)
  const wantsTop5 = /\b(top\s*5|five|list|ranking|leaderboard)\b/.test(lower)
  const wantsSurpriseIdeas = /\b(sup+e?r+i[sz]e|su+r?p+r+i[sz]e|gift|reward|prize|bonus|celebrat|appreciat|thank|kudos|award|year|month|quarter)\b/.test(lower)

  if (!perfData || perfData.scope === 'me') {
    if (hasPermission(ctx.permissions, 'employees.view') || hasPermission(ctx.permissions, 'attendance.manage')) {
      const eligible = employees
        .filter((e) =>
          e.status !== 'INACTIVE' &&
          e.status !== 'NOTICE' &&
          (!matchedDept || e.department === matchedDept) &&
          e.name.toLowerCase() !== ctx.viewerName.toLowerCase() &&
          !(e.managerName === null && /\b(founder|ceo)\b/i.test(e.designation)),
        )
        .map((emp) => ({
          emp,
          att: attendanceStats.get(emp.id) ?? null,
          tenure: calcTenure(emp.joinedAt),
          promoted: emp.employmentHistory.some((ev) => /promot/i.test(ev.title)),
        }))
        .sort((a, b) =>
          ((b.att?.punctualityRate ?? 0) - (a.att?.punctualityRate ?? 0)) ||
          (Number(b.promoted) - Number(a.promoted)) ||
          (b.tenure.days - a.tenure.days),
        )

      const top = eligible[0]
      if (top) {
        const firstName = top.emp.name.split(/\s+/)[0] || top.emp.name
        return {
          response: [
            `Recognition Candidate (Attendance & Tenure Leaders) — ${ctx.orgName}`,
            'Note: Full company performance appraisal ratings require Performance management access; ranking below uses accessible directory, tenure, and attendance data:',
            '',
            `🏆 Top Nominee${matchedDept ? ` (${matchedDept})` : ''}: ${top.emp.name} — ${top.emp.designation} (${top.emp.department}, ${top.emp.location})`,
            `• Tenure: ${top.tenure.label} (Joined ${top.emp.joinedAt})${top.promoted ? ' · Promoted at company' : ''}`,
            ...(top.att ? [`• Punctuality & Attendance: ${top.att.punctualityRate}% on-time · ${top.att.attendanceRate}% overall attendance · ${top.att.avgHours}h avg/day`] : []),
            '',
            '🎁 Surprise Ideas:',
            ...buildSurpriseIdeas(firstName, top.emp.location, top.emp.department),
            ...(eligible.length > 1
              ? [
                  '',
                  'Runners-Up:',
                  ...eligible.slice(1, 3).map((c, idx) =>
                    `${idx + 2}. ${c.emp.name} (${c.emp.department}) — ${c.att ? `${c.att.punctualityRate}% on-time · ` : ''}${c.tenure.label} tenure`,
                  ),
                ]
              : []),
          ].join('\n'),
          category: 'recognition',
        }
      }
    }

    const myRecord = perfData?.records[0] ?? null
    return {
      response: [
        `Company-wide Employee of the Year & award rankings are visible to Managers, HR, and Owners.`,
        ...(myRecord
          ? [
              '',
              `Your Own ${perfData?.cycle ?? 'Current Cycle'} Snapshot (${ctx.viewerName}):`,
              `• Rating: ${myRecord.rating !== null ? `${myRecord.rating} / 5` : 'Pending review'} · Goals Avg: ${calcAvgGoalProgress(myRecord.goals)}%`,
            ]
          : []),
        '',
        'Want to appreciate a teammate today? Send them a Kudos badge in Engagement & Kudos (/dashboard/engagement)!',
      ].join('\n'),
      category: 'recognition',
    }
  }

  let ranked = rankRecognitionCandidates(ctx, employees, perfData.records, attendanceStats, engagementData, matchedDept, false)
  if (ranked.length === 0) {
    ranked = rankRecognitionCandidates(ctx, employees, perfData.records, attendanceStats, engagementData, matchedDept, true)
  }

  if (ranked.length === 0) {
    return {
      response: `No rated active performance records are available yet${matchedDept ? ` in ${matchedDept}` : ''} for ${perfData.cycle}. Submit reviews under Performance (/dashboard/performance) to generate award rankings.`,
      category: 'recognition',
    }
  }

  if (isDeptBreakdown) {
    const allDeptsRanked = rankRecognitionCandidates(ctx, employees, perfData.records, attendanceStats, engagementData, null, false)
    const bestByDept = new Map<string, RankedCandidate>()
    for (const c of allDeptsRanked) {
      if (!bestByDept.has(c.employee.department)) bestByDept.set(c.employee.department, c)
    }
    return {
      response: [
        `Department Top Performers — ${ctx.orgName} (${perfData.cycle})`,
        '',
        ...[...bestByDept.entries()].map(([dept, c]) =>
          `• ${dept}: ${c.employee.name} (${c.employee.designation}) — ${c.record.rating}/5 rating · ${c.avgGoal}% goals${c.attendance ? ` · ${c.attendance.punctualityRate}% on-time` : ''}`,
        ),
        '',
        'Ask me for surprise ideas or a congratulations email draft for any winner!',
      ].join('\n'),
      category: 'recognition',
    }
  }

  if (isMostImproved) {
    const improved = ranked
      .filter((c) => c.record.rating !== null && c.record.previousRating !== null)
      .map((c) => ({ ...c, delta: (c.record.rating ?? 0) - (c.record.previousRating ?? 0) }))
      .sort((a, b) => (b.delta - a.delta) || (b.avgGoal - a.avgGoal) || (b.compositeScore - a.compositeScore))
    const winner = improved[0] ?? ranked[0]!
    const firstName = winner.employee.name.split(/\s+/)[0] || winner.employee.name
    const deltaLabel =
      'delta' in winner && winner.delta > 0
        ? `+${winner.delta} rating jump (${winner.record.previousRating}/5 → ${winner.record.rating}/5)`
        : `${winner.record.rating}/5 sustained rating with ${winner.avgGoal}% goal completion`
    return {
      response: [
        `🌟 Rising Star / Most Improved Performer — ${winner.employee.name}`,
        `• Role & Department: ${winner.employee.designation} · ${winner.employee.department} (${winner.employee.location})`,
        `• Growth Highlight: ${deltaLabel} · ${winner.avgGoal}% goal completion`,
        ...(winner.attendance ? [`• Consistency: ${winner.attendance.punctualityRate}% on-time · ${winner.attendance.avgHours}h avg/day`] : []),
        '',
        ...improved.slice(1, 4).map((c, i) =>
          `${i + 2}. ${c.employee.name} (${c.employee.department}) — ${c.record.previousRating ?? '—'}/5 → ${c.record.rating}/5 · ${c.avgGoal}% goals`,
        ),
        '',
        `Tip: Celebrate ${firstName}'s growth with a Kudos post (/dashboard/engagement) or ask me to "Draft an appreciation email for ${winner.employee.name}".`,
      ].join('\n'),
      category: 'recognition',
    }
  }

  if (isNeedsSupport) {
    const empById = new Map(employees.map((e) => [e.id, e]))
    const attention = perfData.records
      .filter((r) => {
        const emp = empById.get(r.employeeId)
        return emp && emp.status !== 'INACTIVE' && (!matchedDept || emp.department === matchedDept)
      })
      .map((r) => ({ record: r, avgGoal: calcAvgGoalProgress(r.goals) }))
      .filter((x) => x.record.rating === null || (x.record.rating !== null && x.record.rating <= 3) || x.avgGoal < 50)
      .sort((a, b) => ((a.record.rating ?? 0) - (b.record.rating ?? 0)) || (a.avgGoal - b.avgGoal))

    return {
      response: [
        `Coaching & Check-in Watchlist${matchedDept ? ` (${matchedDept})` : ''} — ${perfData.cycle}`,
        ...(attention.length > 0
          ? attention.slice(0, 6).map((x) =>
              `• ${x.record.employeeName} (${x.record.department}) — ${x.record.rating !== null ? `${x.record.rating}/5 rating` : 'Review pending'} · ${x.avgGoal}% goal completion`,
            )
          : ['• Every reviewed team member is currently tracking on or above expectations!']),
        '',
        'Recommended Action: Schedule supportive 1-on-1 check-ins and update goal milestones in Performance (/dashboard/performance).',
      ].join('\n'),
      category: 'recognition',
    }
  }

  if (matchedEmp) {
    const idx = ranked.findIndex((c) => c.employee.id === matchedEmp.id)
    if (idx !== -1) {
      const c = ranked[idx]!
      const firstName = c.employee.name.split(/\s+/)[0] || c.employee.name
      return {
        response: [
          `Award & Recognition Check — ${c.employee.name}`,
          `• Current Standing: Ranked #${idx + 1} of ${ranked.length} eligible staff${matchedDept ? ` in ${matchedDept}` : ''} (${perfData.cycle})`,
          `• Role & Tenure: ${c.employee.designation} · ${c.employee.department} · ${c.tenure.label} (Joined ${c.employee.joinedAt})`,
          `• Performance: ${c.record.rating}/5 rating (${c.avgGoal}% goal progress${c.histRating ? ` · ${c.histRating}/5 historical avg` : ''})`,
          ...(c.attendance ? [`• Attendance: ${c.attendance.punctualityRate}% on-time · ${c.attendance.avgHours}h avg/day`] : []),
          ...(idx === 0
            ? ['', `${c.employee.name} IS our #1 Employee of the Year candidate right now!`]
            : ['', `Current #1 overall leader: ${ranked[0]!.employee.name} (${ranked[0]!.record.rating}/5 rating, ${ranked[0]!.avgGoal}% goals).`]),
          '',
          `🎁 Surprise Ideas for ${firstName}:`,
          ...buildSurpriseIdeas(firstName, c.employee.location, c.employee.department),
        ].join('\n'),
        category: 'recognition',
      }
    }
  }

  const top = ranked[0]!
  const firstName = top.employee.name.split(/\s+/)[0] || top.employee.name
  const topGoal = [...top.record.goals].sort((a, b) => b.progress - a.progress)[0]
  const latestReview = top.record.reviews[0]
  const runnerLimit = wantsTop5 ? 5 : 3

  const lines: string[] = [
    `🏆 Best Employee of the Year Recommendation${matchedDept ? ` (${matchedDept})` : perfData.scope === 'team' ? ' (Your Team)' : ''}: ${top.employee.name}`,
    '',
    `• Name & Role: ${top.employee.name} — ${top.employee.designation} (${top.employee.department}) · Status: ${top.employee.status}`,
    `• Location & Manager: ${top.employee.location} · Reports to ${top.employee.managerName ?? 'Leadership'}`,
    `• Tenure: ${top.tenure.label} (Joined ${top.employee.joinedAt}) · Email: ${top.employee.email}`,
    `• Performance (${perfData.cycle}): ${top.record.rating}/5 rating · ${top.avgGoal}% goal completion (${top.record.goals.length} goals)${top.histRating ? ` · ${top.histRating}/5 historical avg` : ''}`,
    ...(topGoal ? [`• Top Goal Milestone: "${topGoal.title}" (${topGoal.progress}% complete)`] : []),
    ...(latestReview ? [`• Manager Review (${latestReview.cycle}): "${latestReview.summary}"`] : []),
    ...(top.attendance ? [`• Attendance & Punctuality: ${top.attendance.punctualityRate}% on-time · ${top.attendance.attendanceRate}% overall · ${top.attendance.avgHours}h avg/day`] : []),
    ...(top.kudosCount > 0 ? [`• Peer Recognition: ${top.kudosCount} Kudos post(s) received`] : []),
  ]

  if (wantsSurpriseIdeas) {
    lines.push(
      '',
      `🎁 Surprise & Recognition Ideas for ${firstName}:`,
      ...buildSurpriseIdeas(firstName, top.employee.location, top.employee.department),
      `• Ready Message: Ask me "Draft a surprise email for ${top.employee.name}" and I will write it for you!`,
    )
  }

  if (ranked.length > 1) {
    lines.push(
      '',
      `🥈 Strong Runners-Up (Top ${Math.min(runnerLimit, ranked.length)}):`,
      ...ranked.slice(1, runnerLimit).map((c, i) =>
        `${i + 2}. ${c.employee.name} — ${c.employee.designation} (${c.employee.department}) · ${c.record.rating}/5 rating · ${c.avgGoal}% goals${c.attendance ? ` · ${c.attendance.punctualityRate}% on-time` : ''}`,
      ),
    )
  }

  return { response: lines.join('\n'), category: 'recognition' }
}

async function answerAttendanceLeaderboard(
  ctx: CopilotContext,
  query: string,
  matchedDept: string | null,
  employees: Employee[],
): Promise<CopilotAnswer> {
  const lower = query.toLowerCase()
  const now = new Date()

  if (!hasPermission(ctx.permissions, 'attendance.manage') && !hasPermission(ctx.permissions, 'employees.view')) {
    return answerAttendance(ctx)
  }

  if (!hasBackend) {
    const stats = computeOfflineAttendanceStats(now)
    const empById = new Map(employees.map((e) => [e.id, e]))
    const list = [...stats.values()].filter((s) => {
      const emp = empById.get(s.employeeId)
      if (!emp || emp.status === 'INACTIVE') return false
      if (matchedDept && s.department !== matchedDept) return false
      return s.workdays > 0
    })

    const askWorst = /\b(worst|lowest|most\s+absent|most\s+late|irregular)\b/.test(lower)
    const askHours = /\b(most\s+hours|longest\s+hours|hardest[\s-]*working|avg\s+hours)\b/.test(lower)

    const sorted = [...list].sort((a, b) => {
      if (askWorst) return (b.absentDays + b.lateDays) - (a.absentDays + a.lateDays) || a.attendanceRate - b.attendanceRate
      if (askHours) return b.avgHours - a.avgHours || b.punctualityRate - a.punctualityRate
      return b.punctualityRate - a.punctualityRate || b.attendanceRate - a.attendanceRate || b.avgHours - a.avgHours
    })

    const title = askWorst
      ? 'Attendance Watchlist (Highest Absences / Late Check-ins)'
      : askHours
        ? 'Highest Average Daily Logged Hours'
        : 'Most Punctual & Best Attendance Leaders'

    return {
      response: [
        `${title}${matchedDept ? ` (${matchedDept})` : ''} — Recent Workdays`,
        '',
        ...sorted.slice(0, 5).map((s, i) =>
          `${i + 1}. ${s.employeeName} (${s.department}) — ${s.punctualityRate}% on-time · ${s.attendanceRate}% overall (${s.lateDays} late, ${s.absentDays} absent) · ${s.avgHours}h/day avg`,
        ),
        '',
        'Open Attendance (/dashboard/attendance) for full daily check-in logs.',
      ].join('\n'),
      category: 'attendance',
    }
  }

  const attData = await safeFetch(() =>
    attendanceService.getMonth({
      year: now.getFullYear(),
      month: now.getMonth(),
      permissions: ctx.permissions,
      viewerName: ctx.viewerName,
    }),
  )
  if (!attData || attData.scope !== 'company') return answerAttendance(ctx)

  const presentRows = attData.today
    .filter((r) => (!matchedDept || r.department === matchedDept) && (r.status === 'PRESENT' || r.hours > 0))
    .sort((a, b) => b.hours - a.hours || (a.clockIn ?? '99:99').localeCompare(b.clockIn ?? '99:99'))

  return {
    response: [
      `Top Attendance & Logged Hours (${attData.todayDate})${matchedDept ? ` — ${matchedDept}` : ''}:`,
      ...(presentRows.length > 0
        ? presentRows.slice(0, 5).map((r, i) =>
            `${i + 1}. ${r.employeeName} (${r.department}) — ${r.status}${r.clockIn ? ` · In ${r.clockIn}` : ''}${r.hours ? ` · ${r.hours}h` : ''}`,
          )
        : ['• No check-in records logged yet for the selected date.']),
    ].join('\n'),
    category: 'attendance',
  }
}

async function answerTenureAndCelebrations(
  ctx: CopilotContext,
  query: string,
  matchedDept: string | null,
  employees: Employee[],
): Promise<CopilotAnswer> {
  const lower = query.toLowerCase()
  const now = new Date()

  if (!hasPermission(ctx.permissions, 'employees.view')) {
    return {
      response: 'Employee tenure, birthdays, and work anniversary milestones require Employees access. Check Announcements or Engagement & Kudos in your sidebar for company celebrations.',
      category: 'employees',
    }
  }

  const active = employees.filter(
    (e) => e.status !== 'INACTIVE' && (!matchedDept || e.department === matchedDept),
  )

  if (/\b(new(est)?\s+(hire|hires|joiner|joiners|member)|recently\s+joined)\b/.test(lower)) {
    const newest = [...active].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    return {
      response: [
        `Newest Team Members${matchedDept ? ` in ${matchedDept}` : ''} — ${ctx.orgName}`,
        '',
        ...newest.slice(0, 6).map((e, i) =>
          `${i + 1}. ${e.name} — ${e.designation} (${e.department}) · Joined ${e.joinedAt} · Status: ${e.status}`,
        ),
      ].join('\n'),
      category: 'employees',
    }
  }

  if (/\b(birthday|birthdays|anniversar|celebrat)\b/.test(lower)) {
    const engagementData = hasBackend ? await safeFetch(() => engagementService.getAll()) : null
    const celebrations = engagementData?.celebrations ?? []
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
    const nextMonth = String(((now.getMonth() + 1) % 12) + 1).padStart(2, '0')

    const thisMonthAnniv = active
      .filter((e) => e.joinedAt.slice(5, 7) === currentMonth && Number(e.joinedAt.slice(0, 4)) < now.getFullYear())
      .map((e) => ({ emp: e, years: now.getFullYear() - Number(e.joinedAt.slice(0, 4)) }))
    const upcomingAnniv = active
      .filter((e) => e.joinedAt.slice(5, 7) === nextMonth && Number(e.joinedAt.slice(0, 4)) < now.getFullYear())
      .map((e) => ({ emp: e, years: now.getFullYear() - Number(e.joinedAt.slice(0, 4)) }))

    return {
      response: [
        `Upcoming Milestones & Work Anniversaries — ${ctx.orgName}`,
        '',
        ...(celebrations.length > 0
          ? celebrations.slice(0, 6).map((c) => `• ${c.name} — ${c.subtitle} (${c.date})`)
          : [
              `${MONTH_DISPLAY[now.getMonth()]} Work Anniversaries (${thisMonthAnniv.length}):`,
              ...(thisMonthAnniv.length > 0
                ? thisMonthAnniv.map((x) => `• ${x.emp.name} (${x.emp.department}) — ${x.years} year${x.years > 1 ? 's' : ''} (Joined ${x.emp.joinedAt})`)
                : ['• None falling in this calendar month.']),
              '',
              `Next Month (${MONTH_DISPLAY[(now.getMonth() + 1) % 12]}) Work Anniversaries (${upcomingAnniv.length}):`,
              ...(upcomingAnniv.length > 0
                ? upcomingAnniv.map((x) => `• ${x.emp.name} (${x.emp.department}) — ${x.years} year${x.years > 1 ? 's' : ''} (Joined ${x.emp.joinedAt})`)
                : ['• None next month.']),
            ]),
        '',
        'Celebrate milestones with Kudos badges in Engagement & Kudos (/dashboard/engagement)!',
      ].join('\n'),
      category: 'recognition',
    }
  }

  const longest = [...active]
    .filter((e) => !(e.managerName === null && /\b(founder|ceo)\b/i.test(e.designation)))
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))

  return {
    response: [
      `Longest-Serving & Loyalty Award Candidates${matchedDept ? ` (${matchedDept})` : ''} — ${ctx.orgName}`,
      '',
      ...longest.slice(0, 5).map((e, i) => {
        const tenure = calcTenure(e.joinedAt, now)
        return `${i + 1}. ${e.name} — ${e.designation} (${e.department}) · ${tenure.label} (Joined ${e.joinedAt})`
      }),
    ].join('\n'),
    category: 'recognition',
  }
}

async function answerEmailDraft(
  ctx: CopilotContext,
  query: string,
  matchedEmp: Employee | null,
  matchedDept: string | null,
  employees: Employee[],
): Promise<CopilotAnswer> {
  const lower = query.toLowerCase()
  let subject = `HR Update from ${ctx.orgName}`
  let body = [
    'Hi Team,',
    '',
    'Please review the latest HR update in your Keystone workspace and reach out if you have any questions.',
  ]

  if (/\b(sup+e?r+i[sz]e|su+r?p+r+i[sz]e|award|employee\s+of|appreciat|congratulat|thank|recogni|kudos|best\s+employee|top\s+perform)\b/.test(lower)) {
    const winner = matchedEmp ? null : await resolveTopAwardWinner(ctx, employees, matchedDept)
    const recipientName = matchedEmp?.name ?? winner?.employee.name ?? '[Employee Name]'
    const recipientFirst = recipientName.startsWith('[') ? recipientName : recipientName.split(/\s+/)[0] || recipientName
    const roleNote = matchedEmp
      ? `${matchedEmp.designation} in ${matchedEmp.department}`
      : winner
        ? `${winner.employee.designation} in ${winner.employee.department}`
        : 'your team'

    subject = `🎉 Congratulations ${recipientName} — Special Appreciation & Award!`
    body = [
      `Hi ${recipientFirst},`,
      '',
      `We are thrilled to surprise you and recognize you as our standout performer (${roleNote}) at ${ctx.orgName}!`,
      '',
      winner
        ? `Your ${winner.record.rating}/5 performance rating, ${winner.avgGoal}% goal completion, and dedication across every project have inspired the entire team.`
        : `Your dedication, reliability, and positive impact across projects have made a tremendous difference to the entire team.`,
      '',
      'Please join us for a small celebration — and keep an eye out for an appreciation reward coming your way!',
    ]
  } else if (lower.includes('payroll') || lower.includes('salary') || lower.includes('payslip')) {
    const { label } = resolveTargetMonth(query)
    subject = `${label} Payroll & Payslip Schedule — ${ctx.orgName}`
    body = [
      'Hi Team,',
      '',
      `We are finalizing ${label} payroll processing on the 1st of the month. Please ensure any pending attendance regularizations, expense claims, or tax declarations are submitted in Keystone before payroll lock.`,
      '',
      'Your payslips will be available under My Payslip once finalized.',
    ]
  } else if (lower.includes('leave') || lower.includes('holiday')) {
    subject = `Leave Policy & Holiday Planning Reminder — ${ctx.orgName}`
    body = [
      'Hi Team,',
      '',
      'A quick reminder to submit upcoming leave requests in Keystone Leave Planner at least a week in advance so managers can coordinate team coverage smoothly.',
      '',
      'You can check your live Annual, Sick, and Personal balances anytime on the Leave Planner page.',
    ]
  } else if (lower.includes('review') || lower.includes('performance') || lower.includes('appraisal')) {
    subject = `Q3 2026 Performance Check-in & Goal Update — ${ctx.orgName}`
    body = [
      'Hi Team,',
      '',
      'Please update your Q3 2026 goal progress percentages in the Keystone Performance module ahead of manager review sign-offs.',
    ]
  } else if (lower.includes('welcome') || lower.includes('onboard')) {
    subject = `Welcome to ${ctx.orgName}!`
    body = [
      'Hi [Name],',
      '',
      `Welcome to ${ctx.orgName}! Your Keystone workspace account is ready—sign in to review your onboarding checklist, leave policy, and team directory.`,
    ]
  }

  return {
    response: [
      `Draft Email Ready to Send:`,
      '',
      `Subject: ${subject}`,
      '',
      ...body,
      '',
      'Best regards,',
      `${ctx.viewerName}`,
      `${ctx.roleLabel.split(' (')[0]} · ${ctx.orgName}`,
    ].join('\n'),
    category: 'draft',
  }
}

function answerPlatformGuide(ctx: CopilotContext, query: string): CopilotAnswer {
  const allowed = navItemsFor(ctx.permissions, ctx.user?.role)
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !['where', 'manage', 'open', 'find', 'page', 'pages', 'module', 'modules', 'menu', 'this', 'site'].includes(t))
  const matched = allowed.filter((m) =>
    tokens.some((t) => m.label.toLowerCase().includes(t) || m.path.toLowerCase().includes(t)),
  )

  const lines: string[] = []
  if (matched.length > 0) {
    lines.push('Matching Pages in Your Sidebar:')
    for (const m of matched) {
      lines.push(`• ${m.label} — open at ${m.path}`)
    }
    lines.push('')
  }

  lines.push(
    `All Modules Available for Your Role (${ctx.roleLabel}):`,
    ...allowed.map((m) => `• ${m.label} (${m.path})`),
    '',
    'Need help with a specific action? Just ask!',
  )

  return { response: lines.join('\n'), category: 'navigation' }
}

async function answerDepartmentRanking(ctx: CopilotContext, employees: Employee[]): Promise<CopilotAnswer> {
  const perfData = await safeFetch(() => performanceService.get(ctx.permissions, ctx.viewerName))
  if (!perfData || perfData.scope === 'me') {
    return {
      response: 'Company-wide department performance comparisons require Manager, HR, or Owner performance access.',
      category: 'recognition',
    }
  }

  const empById = new Map(employees.map((e) => [e.id, e]))
  const deptBuckets = new Map<string, PerformanceRecord[]>()
  for (const r of perfData.records) {
    const emp = empById.get(r.employeeId)
    if (emp && emp.status === 'INACTIVE') continue
    const arr = deptBuckets.get(r.department) ?? []
    arr.push(r)
    deptBuckets.set(r.department, arr)
  }

  const rankedDepts = [...deptBuckets.entries()]
    .map(([dept, recs]) => {
      const rated = recs.filter((r) => r.rating !== null)
      const avgRating = rated.length > 0
        ? Math.round((rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length) * 100) / 100
        : 0
      const avgGoal = recs.length > 0
        ? Math.round(recs.reduce((s, r) => s + calcAvgGoalProgress(r.goals), 0) / recs.length)
        : 0
      return { dept, headcount: recs.length, reviewed: rated.length, avgRating, avgGoal }
    })
    .sort((a, b) => (b.avgRating - a.avgRating) || (b.avgGoal - a.avgGoal) || (b.headcount - a.headcount))

  if (rankedDepts.length === 0) {
    return { response: 'No department performance records are available yet.', category: 'recognition' }
  }

  const top = rankedDepts[0]!
  return {
    response: [
      `🏆 Top Performing Department (${perfData.cycle}): ${top.dept}`,
      `• Average Rating: ${top.avgRating}/5 · Average Goal Completion: ${top.avgGoal}% (${top.reviewed}/${top.headcount} reviewed)`,
      '',
      'Department Leaderboard:',
      ...rankedDepts.map((d, i) =>
        `${i + 1}. ${d.dept} (${d.headcount} staff) — ${d.avgRating}/5 avg rating · ${d.avgGoal}% goals`,
      ),
    ].join('\n'),
    category: 'recognition',
  }
}

function answerOrgAndReporting(
  ctx: CopilotContext,
  matchedEmp: Employee | null,
  employees: Employee[],
  query: string,
): CopilotAnswer {
  const lower = query.toLowerCase()
  const me = employees.find((e) => e.name.toLowerCase() === ctx.viewerName.toLowerCase()) ?? null

  if (/\b(my\s+manager|who\s+is\s+my\s+manager|who\s+do\s+i\s+report\s+to)\b/.test(lower)) {
    if (!me) {
      return { response: `No employee directory record matched "${ctx.viewerName}".`, category: 'employees' }
    }
    if (!me.managerName) {
      return {
        response: `${me.name} (${me.designation}) is at the top level of ${ctx.orgName} and does not report to another manager.`,
        category: 'employees',
      }
    }
    const mgr = employees.find((e) => e.name.toLowerCase() === me.managerName?.toLowerCase())
    return {
      response: [
        `Your Reporting Manager — ${me.managerName}`,
        ...(mgr ? [`• Role: ${mgr.designation} (${mgr.department}) · ${mgr.location}`, `• Email: ${mgr.email}`] : []),
      ].join('\n'),
      category: 'employees',
    }
  }

  if (matchedEmp && /\bwho\s+manages\b/.test(lower)) {
    if (!matchedEmp.managerName) {
      return { response: `${matchedEmp.name} (${matchedEmp.designation}) is top-level with no reporting manager.`, category: 'employees' }
    }
    return { response: `${matchedEmp.name} (${matchedEmp.department}) reports to ${matchedEmp.managerName}.`, category: 'employees' }
  }

  const target = matchedEmp ?? me
  const targetName = target?.name ?? ctx.viewerName
  const reports = employees.filter(
    (e) => e.managerName?.toLowerCase() === targetName.toLowerCase() && e.status !== 'INACTIVE',
  )

  return {
    response: [
      `Direct Reports for ${targetName} (${reports.length}):`,
      ...(reports.length > 0
        ? reports.map((e) => `• ${e.name} — ${e.designation} (${e.department} · ${e.status} · ${e.location})`)
        : [`• ${targetName} currently has no active direct reports in the directory.`]),
    ].join('\n'),
    category: 'employees',
  }
}

async function answerPersonalStanding(ctx: CopilotContext, employees: Employee[]): Promise<CopilotAnswer> {
  const me = employees.find((e) => e.name.toLowerCase() === ctx.viewerName.toLowerCase()) ?? null
  const progressAnswer = await answerProgressAndPerformance(ctx, null)

  if (!me) return progressAnswer

  const tenure = calcTenure(me.joinedAt)
  const reportsCount = employees.filter(
    (e) => e.managerName?.toLowerCase() === me.name.toLowerCase() && e.status !== 'INACTIVE',
  ).length

  const headerLines = [
    `Personal HR Profile & Standing — ${me.name}`,
    `• Role: ${me.designation} · ${me.department} (${me.location})`,
    `• Joined: ${me.joinedAt} (${tenure.label} tenure) · Status: ${me.status}`,
    `• Manager: ${me.managerName ?? 'None (Top-level)'}${reportsCount > 0 ? ` · Direct Reports: ${reportsCount}` : ''}`,
    '',
  ]

  return {
    response: [...headerLines, progressAnswer.response].join('\n'),
    category: 'performance',
  }
}

async function answerGeneralOverview(ctx: CopilotContext, query: string): Promise<CopilotAnswer> {
  const [empPage, leaveData, perfData] = await Promise.all([
    hasPermission(ctx.permissions, 'employees.view')
      ? safeFetch(() => employeeService.getAll({ pageSize: 500 }))
      : Promise.resolve(null),
    safeFetch(() => leaveService.get({ permissions: ctx.permissions, name: ctx.viewerName })),
    safeFetch(() => performanceService.get(ctx.permissions, ctx.viewerName)),
  ])

  const lines: string[] = [
    `Here is what I found in ${ctx.orgName} for "${query}":`,
    '',
  ]

  if (empPage) {
    const active = empPage.rows.filter((e) => e.status !== 'INACTIVE').length
    const onLeave = empPage.rows.filter((e) => e.status === 'ON_LEAVE').length
    const onNotice = empPage.rows.filter((e) => e.status === 'NOTICE').length
    lines.push(`• Workforce: ${active} active employees (${onLeave} on leave, ${onNotice} on notice)`)
  }
  if (leaveData) {
    if (hasPermission(ctx.permissions, 'leave.approve')) {
      lines.push(`• Leave: ${leaveData.pendingApprovals.length} pending approval(s) · Annual cap ${leaveData.policy.annual}d`)
    } else {
      const annual = leaveData.balances.find((b) => b.type === 'ANNUAL')
      if (annual) {
        lines.push(`• Your Annual Leave: ${Math.max(0, annual.total - annual.used - annual.pending)} of ${annual.total} days left`)
      }
    }
  }
  if (perfData) {
    lines.push(`• Performance (${perfData.cycle}): ${perfData.summary.avgGoalProgress}% average goal completion (${perfData.summary.reviewed} reviewed, ${perfData.summary.pending} pending)`)
  }

  lines.push(
    '',
    'Try asking specifically about:',
    '• "Who is the best employee of the year?" or "Who deserves a surprise?"',
    '• "Who has the best attendance?" or "Who has the longest tenure?"',
    '• "Show me my progress" or "Who has attrition risk?"',
    '• "Summarize payroll audit" or "What is our leave policy?"',
    '• "Draft a surprise appreciation message" or an HR email',
  )

  return { response: lines.join('\n'), category: 'general' }
}

function answerCompliance(ctx: CopilotContext): CopilotAnswer {
  return {
    response: [
      `Statutory Compliance & Payroll Filings — ${ctx.orgName}`,
      '• Monthly Payslip Deductions Tracked: Income Tax (PAYE / TDS at 10%) and Statutory / Other Deductions (5%) across active salary structures.',
      '• Statutory Modules Supported: EPF (ECR export), ESIC, Professional Tax (PT), and Form 16 tracking under Statutory Compliance (/dashboard/compliance).',
      hasBackend
        ? '• Live filings and due dates can be reviewed and marked as filed directly in Statutory Compliance.'
        : '• Note: Live EPF/ESIC filing ledger syncs once the NestJS compliance backend is connected; payroll deduction calculations remain active in Payroll & My Payslip.',
    ].join('\n'),
    category: 'compliance',
  }
}

/** Routes a natural-language Copilot query to live site data and returns an accurate answer. */
export async function routeCopilotQuery(rawQuery: string): Promise<CopilotAnswer> {
  const query = rawQuery.trim()
  const lower = query.toLowerCase()
  const ctx = await getCallerContext()

  const empPage = await safeFetch(() => employeeService.getAll({ pageSize: 500 }))
  const employees = empPage?.rows ?? []
  const matchedEmp = findMentionedEmployee(query, employees)
  const matchedDept = findMentionedDepartment(query, employees)

  if (/^(thanks|thank\s+you|thx|ty)\b/i.test(lower)) {
    return {
      response: `You're welcome, ${ctx.viewerName.split(/\s+/)[0] || 'there'}! Let me know anytime you want to check HR metrics, top performers, attendance, leave, payroll, or draft a message.`,
      category: 'greeting',
    }
  }

  if (/^(hi|hey|hello|hola|yo|good\s+(morning|afternoon|evening)|how\s+are\s+you|what\s+can\s+you\s+do|help)\b/i.test(lower)) {
    return answerGreeting(ctx)
  }

  if (/\b(draft|write|compose)\b.*\b(email|mail|letter|announcement|message|notice|note)\b/.test(lower)) {
    return answerEmailDraft(ctx, query, matchedEmp, matchedDept, employees)
  }

  if (/\b(most\s+(punctual|regular|consistent)|best\s+attendance|perfect\s+attendance|never\s+late|always\s+on\s+time|highest\s+attendance|worst\s+attendance|most\s+absent|least\s+absent|zero\s+absences?|most\s+late|irregular\s+attendance|attendance\s+(leaderboard|ranking|leaders?|stars?|top)|most\s+hours|longest\s+hours|hardest[\s-]*working)\b/.test(lower)) {
    return answerAttendanceLeaderboard(ctx, query, matchedDept, employees)
  }

  if (/\b(longest[\s-]*(serving|tenured?|working|employee|with\s+us)|most\s+loyal|tenure|seniority|veteran|loyalty\s+award|who\s+joined\s+(first|earliest|last|recently)|work\s+anniversar\w*|anniversar\w*|birthdays?|celebrations?|new(est)?\s+(hire|hires|joiner|joiners)|recently\s+joined)\b/.test(lower)) {
    return answerTenureAndCelebrations(ctx, query, matchedDept, employees)
  }

  if (
    /\b(best|top|strongest|highest[\s-]*(performing|rated)|worst|weakest)\s+(department|dept)\b|\b(department|dept)\b.*\b(performing\s+best|best\s+performing|ranking|leaderboard|comparison|performing\s+worst|strongest|top)\b/.test(lower)
  ) {
    return answerDepartmentRanking(ctx, employees)
  }

  if (
    /\b(employ[ee]*\s+of\s+(the\s+)?(year|month|quarter)|best\s+(employ[ee]*|perform\w*|worker|staff|person|people|member|talent|manager)|worked\s+best|top\s+(employ[ee]*|perform\w*|worker|workers|staff|talent|rank\w*|\d+|three|five)|star\s+(employ[ee]*|perform\w*)|mvp|highest[\s-]*(rated|rating|goal|score|perform\w*)|most\s+(productive|valuable|dedicated|improv\w*)|rising\s+star|fastest\s+grow\w*|sup+e?r+i[sz]e|su+r?p+r+i[sz]e|reward|gift|prize|award|kudos|shout[\s-]*out|appreciat\w*|recogni[sz]\w*|promot(e|ion)|needs?\s+(coaching|support|attention)|underperform\w*|behind\s+on\s+goals)\b/.test(lower) ||
    (/\bbonus\b/.test(lower) && !/\b(payroll|salary|payslip|tax|tds|deduction|ctc)\b/.test(lower))
  ) {
    return answerRecognitionAndAwards(ctx, query, matchedEmp, matchedDept, employees)
  }

  if (/\b(who\s+is\s+my\s+manager|who\s+do\s+i\s+report\s+to|my\s+manager|who\s+reports\s+to\s+me|my\s+(direct\s+)?reports|who\s+works\s+(under|for)\s+|direct\s+reports|who\s+manages\s+)\b/.test(lower)) {
    return answerOrgAndReporting(ctx, matchedEmp, employees, query)
  }

  if (/\b(how\s+am\s+i\s+doing|am\s+i\s+doing\s+(well|good|okay|ok)|when\s+did\s+i\s+join|my\s+(tenure|profile|standing|details)|who\s+am\s+i|about\s+me)\b/.test(lower)) {
    return answerPersonalStanding(ctx, employees)
  }

  if (/\b(progress|goal|goals|kpi|okr|performance|rating|appraisal|review)\b/.test(lower)) {
    return answerProgressAndPerformance(ctx, matchedEmp)
  }

  if (/\b(attrition|turnover|churn|resign|notice|exit|retention|leaving)\b/.test(lower)) {
    return answerAttrition(ctx)
  }

  if (/\b(payroll|salary|payslip|pay\s*cycle|payday|tds|tax|deduction|gross|net|hra|ctc|fnf|gratuity|advance)\b/.test(lower)) {
    return answerPayroll(ctx, query)
  }

  if (/\b(compliance|statutory|epf|esic|ecr|form\s*16|labor\s*law|labour\s*law)\b/.test(lower)) {
    return answerCompliance(ctx)
  }

  if (/\b(leave|pto|maternity|paternity|sick|earned|vacation|time\s*off|policy)\b/.test(lower)) {
    return answerLeave(ctx, query)
  }

  if (/\b(attendance|present|absent|late|clock|check\s*in|working\s*hours|half\s*day)\b/.test(lower)) {
    return answerAttendance(ctx)
  }

  if (/\b(recruit|hiring|candidate|resume|job|jobs|ats|applicant|interview)\b/.test(lower)) {
    return answerRecruitment(ctx)
  }

  if (matchedEmp || matchedDept || /\b(employee|employees|staff|headcount|department|departments|directory|team|who\s+is)\b/.test(lower)) {
    return answerEmployeeOrDept(ctx, matchedEmp, matchedDept, employees)
  }

  if (/\b(module|modules|navigate|where\s+(can\s+i|is|do\s+i)|how\s+(do\s+i|to)|settings|menu|pages)\b/.test(lower)) {
    return answerPlatformGuide(ctx, query)
  }

  return answerGeneralOverview(ctx, query)
}
