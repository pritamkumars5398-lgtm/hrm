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
import ProfilePage from '@/features/employees/ProfilePage'
import FormerEmployeesPage from '@/features/employees/FormerEmployeesPage'
import AttendancePage from '@/features/attendance/AttendancePage'
import LeavePage from '@/features/leave/LeavePage'
import PayrollPage from '@/features/payroll/PayrollPage'
import PayslipPage from '@/features/payroll/PayslipPage'
import MyPayslipPage from '@/features/payroll/MyPayslipPage'
import PerformancePage from '@/features/performance/PerformancePage'
import DocumentsPage from '@/features/documents/DocumentsPage'
import ReportsPage from '@/features/reports/ReportsPage'
import SettingsPage from '@/features/settings/SettingsPage'
import RecruitmentPage from '@/features/recruitment/RecruitmentPage'
import TimesheetsPage from '@/features/timesheets/TimesheetsPage'
import AssetsPage from '@/features/assets/AssetsPage'
import ExpensesPage from '@/features/expenses/ExpensesPage'
import HelpdeskPage from '@/features/helpdesk/HelpdeskPage'
import LMSPage from '@/features/lms/LMSPage'
import EngagementPage from '@/features/engagement/EngagementPage'
import CommunicationPage from '@/features/communication/CommunicationPage'
import WorkflowsPage from '@/features/workflows/WorkflowsPage'
import CompliancePage from '@/features/compliance/CompliancePage'
import AICopilotPage from '@/features/ai/AICopilotPage'
import SuperAdminPage from '@/features/superadmin/SuperAdminPage'
import OnboardingTrackerPage from '@/features/onboarding/OnboardingTrackerPage'
import FormsListPage from '@/features/forms/FormsListPage'
import FormBuilder from '@/features/forms/FormBuilder'
import MyFormsPage from '@/features/forms/MyFormsPage'
import FillFormPage from '@/features/forms/FillFormPage'
import ComingSoon from '@/shared/components/ComingSoon'
import { useEffect } from 'react'
import { registerWorkspaceGetter } from '@/services/apiClient'
import { useAuthStore } from '@/features/auth/store/authStore'
import { authService } from '@/services/authService'

// Wire up the active workspace so every API request includes X-Workspace-Id.
// This runs once at module-load time before any request is made.
registerWorkspaceGetter(() => useAuthStore.getState().user?.activeOrganizationId)

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)

  useEffect(() => {
    if (isAuthenticated) {
      authService.me()
        .then((user) => {
          if (user) {
            setSession(user)
          } else {
            clearSession()
          }
        })
        .catch(() => {
          clearSession()
        })
    }
  }, [isAuthenticated, setSession, clearSession])

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
        
        <Route path="profile" element={<ProfilePage />} />
        <Route path="former-employees" element={<FormerEmployeesPage />} />
        
        <Route path="add-company" element={<CompanyDetailsStep isAdditional />} />
        <Route path="team" element={<TeamMembersPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/new" element={<AddEmployeePage />} />
        
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="payroll/payslip/:employeeId" element={<PayslipPage />} />
        <Route path="payslip" element={<MyPayslipPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Enterprise Modules */}
        <Route path="recruitment" element={<RecruitmentPage />} />
        <Route path="onboarding-tracker" element={<OnboardingTrackerPage />} />
        <Route path="timesheets" element={<TimesheetsPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="travel" element={<ExpensesPage />} />
        <Route path="helpdesk" element={<HelpdeskPage />} />
        <Route path="lms" element={<LMSPage />} />
        <Route path="engagement" element={<EngagementPage />} />
        <Route path="communication" element={<CommunicationPage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="ai-copilot" element={<AICopilotPage />} />
        <Route path="superadmin" element={<SuperAdminPage />} />
        <Route path="billing" element={<SuperAdminPage />} />

        {/* Custom Forms */}
        <Route path="forms" element={<FormsListPage />} />
        <Route path="forms/builder" element={<FormBuilder />} />
        <Route path="my-forms" element={<MyFormsPage />} />
        <Route path="forms/fill/:formId" element={<FillFormPage />} />
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
