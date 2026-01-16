// app/auth/forgot-password/page.tsx
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Property Management Platform',
  description: 'Reset your property management account password',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="No worries, we'll send you reset instructions to your email"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}