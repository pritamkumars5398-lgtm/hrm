import { Route, Routes } from 'react-router-dom'
import LandingPage from '@/features/landing/LandingPage'
import LoginPage from '@/features/auth/LoginPage'
import SignupPage from '@/features/auth/SignupPage'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import AcceptInvitePage from '@/features/auth/AcceptInvitePage'
import RequireAuth from '@/features/auth/components/RequireAuth'
import RequireModule from '@/features/auth/components/RequireModule'
import PersonalDetailsStep from '@/features/onboarding/PersonalDetailsStep'
import CompanyDetailsStep from '@/features/onboarding/CompanyDetailsStep'
import DashboardLayout from '@/shared/layouts/DashboardLayout'
import DashboardHome from '@/features/dashboard/DashboardHome'
import TeamMembersPage from '@/features/team/TeamMembersPage'
import EmployeesPage from '@/features/employees/EmployeesPage'
import AttendancePage from '@/features/attendance/AttendancePage'
import ModulePlaceholder from '@/shared/components/ModulePlaceholder'
import ComingSoon from '@/shared/components/ComingSoon'
import type { ModuleKey } from '@/shared/config/navigation'

/** Modules whose screens are not built yet — each is guarded by role all the same. */
const PENDING_MODULES: Array<{ path: string; module: ModuleKey; title: string }> = [
  { path: 'leave', module: 'leave', title: 'Leave Management' },
  { path: 'payroll', module: 'payroll', title: 'Payroll' },
  { path: 'performance', module: 'performance', title: 'Performance' },
  { path: 'documents', module: 'documents', title: 'Documents' },
  { path: 'reports', module: 'reports', title: 'Reports' },
  { path: 'settings', module: 'settings', title: 'Settings' },
]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />

      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <PersonalDetailsStep />
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding/company"
        element={
          <RequireAuth>
            <CompanyDetailsStep />
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardHome />} />

        <Route
          path="team"
          element={
            <RequireModule module="team">
              <TeamMembersPage />
            </RequireModule>
          }
        />

        <Route
          path="employees"
          element={
            <RequireModule module="employees">
              <EmployeesPage />
            </RequireModule>
          }
        />

        <Route
          path="attendance"
          element={
            <RequireModule module="attendance">
              <AttendancePage />
            </RequireModule>
          }
        />

        {PENDING_MODULES.map(({ path, module, title }) => (
          <Route
            key={path}
            path={path}
            element={
              <RequireModule module={module}>
                <ModulePlaceholder title={title} />
              </RequireModule>
            }
          />
        ))}
      </Route>

      <Route path="/reset-password" element={<ComingSoon title="Set a new password" />} />
      <Route path="*" element={<ComingSoon title="Page not found" />} />
    </Routes>
  )
}
