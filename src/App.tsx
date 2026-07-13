import { Route, Routes } from 'react-router-dom'
import LandingPage from '@/features/landing/LandingPage'
import LoginPage from '@/features/auth/LoginPage'
import SignupPage from '@/features/auth/SignupPage'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import ComingSoon from '@/shared/components/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Placeholders — replaced as each item is built (§4) */}
      <Route path="/reset-password" element={<ComingSoon title="Set a new password" />} />
      <Route path="/onboarding" element={<ComingSoon title="Set up your company" />} />
      <Route path="/dashboard" element={<ComingSoon title="Dashboard" />} />
      <Route path="*" element={<ComingSoon title="Page not found" />} />
    </Routes>
  )
}
