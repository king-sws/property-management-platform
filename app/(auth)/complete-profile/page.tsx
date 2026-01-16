// app/auth/complete-profile/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { CompleteProfileForm } from '@/components/auth/CompleteProfileForm'

export const metadata: Metadata = {
  title: 'Complete Your Profile | PropertyHub',
  description: 'Complete your profile to get started with PropertyHub',
  robots: { index: false, follow: false },
}

export default async function CompleteProfilePage() {
  const session = await auth()
  
  if (!session?.user?.needsProfileSetup) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <svg
              className="w-8 h-8 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-2xl font-normal text-gray-900 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="text-[14px] text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Just a few more details to personalize your experience
          </p>
        </div>

        {/* Form Card */}
        <CompleteProfileForm user={session.user} />

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@propertyhub.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            support@propertyhub.com
          </a>
        </p>
      </div>
    </div>
  )
}