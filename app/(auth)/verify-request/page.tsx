// app/auth/verify-request/page.tsx (Bonus: Email verification page)
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'

export const metadata: Metadata = {
  title: 'Check Your Email | Acme',
  description: 'Please check your email for a verification link',
  robots: {
    index: false,
    follow: false,
  },
}

export default function VerifyRequestPage() {
  return (
    <AuthLayout
      title="Check your email"
      subtitle="We've sent you a secure sign-in link"
    >
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-900">
          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <div className="font-medium mb-1 text-sm sm:text-base">Email sent successfully</div>
            <div className="text-xs sm:text-sm">
              Click the link in your email to sign in. The link will expire in 24 hours.
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3 sm:space-y-4">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              <strong>Didn&#39;t receive the email?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs">
              <li>Check your spam or junk folder</li>
              <li>Make sure the email address is correct</li>
              <li>Try signing in again to resend</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            asChild 
            className="w-full h-10 sm:h-11 text-sm sm:text-base dark:border-slate-700 dark:bg-[#181a1b] dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <Link href="/sign-in">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Back to Sign In
            </Link>
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Need help?{' '}
            <Link
              href="/support"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}