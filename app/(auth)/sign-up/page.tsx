// app/auth/sign-up/page.tsx
import { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Create Account | Propely',
  description: 'Create your Propely account and start managing properties in minutes',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function SignUpPage() {

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Propely to manage properties, find tenants, or offer services."
    >
      <SignUpForm />
    </AuthLayout>
  )
}