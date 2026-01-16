
// app/auth/sign-up/page.tsx
import { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Create Account | Property Management Platform',
  description: 'Create your property management account and get started in minutes',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function SignUpPage() {

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join our property management platform. Manage properties, find tenants, or offer services."
    >
      <SignUpForm />
    </AuthLayout>
  )
}
