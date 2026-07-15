import { Route, Routes } from 'react-router-dom'
import LandingPage from '@/features/landing/LandingPage'
import LoginPage from '@/features/auth/LoginPage'
import SignupPage from '@/features/auth/SignupPage'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/features/auth/ResetPasswordPage'
import RequireAuth from '@/features/auth/components/RequireAuth'
import RequireModule from '@/features/auth/components/RequireModule'
import PersonalDetailsStep from '@/features/onboarding/PersonalDetailsStep'
import CompanyDetailsStep from '@/features/onboarding/CompanyDetailsStep'
import DashboardLayout from '@/shared/layouts/DashboardLayout'
import DashboardHome from '@/features/dashboard/DashboardHome'
import TeamMembersPage from '@/features/team/TeamMembersPage'
import EmployeesPage from '@/features/employees/EmployeesPage'
import AddEmployeePage from '@/features/employees/components/AddEmployeePage'
import AttendancePage from '@/features/attendance/AttendancePage'
import LeavePage from '@/features/leave/LeavePage'
import PayrollPage from '@/features/payroll/PayrollPage'
import PerformancePage from '@/features/performance/PerformancePage'
import DocumentsPage from '@/features/documents/DocumentsPage'
import ReportsPage from '@/features/reports/ReportsPage'
import SettingsPage from '@/features/settings/SettingsPage'
import ComingSoon from '@/shared/components/ComingSoon'
import { registerWorkspaceGetter } from '@/services/apiClient'
import { useAuthStore } from '@/features/auth/store/authStore'

// Wire up the active workspace so every API request includes X-Workspace-Id.
// This runs once at module-load time before any request is made.
registerWorkspaceGetter(() => useAuthStore.getState().user?.activeOrganizationId)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />


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
          path="add-company"
          element={
            <RequireAuth>
              <CompanyDetailsStep isAdditional />
            </RequireAuth>
          }
        />

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
          path="employees/new"
          element={
            <RequireModule module="employees">
              <AddEmployeePage />
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

        <Route
          path="leave"
          element={
            <RequireModule module="leave">
              <LeavePage />
            </RequireModule>
          }
        />

        <Route
          path="payroll"
          element={
            <RequireModule module="payroll">
              <PayrollPage />
            </RequireModule>
          }
        />

        <Route
          path="performance"
          element={
            <RequireModule module="performance">
              <PerformancePage />
            </RequireModule>
          }
        />

        <Route
          path="documents"
          element={
            <RequireModule module="documents">
              <DocumentsPage />
            </RequireModule>
          }
        />

        <Route
          path="reports"
          element={
            <RequireModule module="reports">
              <ReportsPage />
            </RequireModule>
          }
        />

        <Route
          path="settings"
          element={
            <RequireModule module="settings">
              <SettingsPage />
            </RequireModule>
          }
        />
      </Route>

      <Route
        path="/reset-password"
        element={
          <RequireAuth>
            <ResetPasswordPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<ComingSoon title="Page not found" />} />
    </Routes>
  )
}
