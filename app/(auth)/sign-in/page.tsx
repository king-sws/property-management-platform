// app/auth/sign-in/page.tsx
import { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignInForm } from '@/components/auth/SignInForm'

export const metadata: Metadata = {
  title: 'Sign In | Property Management Platform',
  description: 'Sign in to your property management account',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function SignInPage() {

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your properties, leases, and payments securely."
    >
      <SignInForm />
    </AuthLayout>
  )
}
