/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
// components/auth/ForgotPasswordForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ForgotPassword } from '@/actions/action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, ArrowLeft, Check } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('')
    
    startTransition(async () => {
      try {
        const result = await ForgotPassword(data.email)
        
        if (result.success) {
          setIsSuccess(true)
        } else if (result.error) {
          setError(result.error)
        }
      } catch (err) {
        setError('Failed to send reset email. Please try again.')
      }
    })
  }

  const isLoading = isPending || isSubmitting

  if (isSuccess) {
    return (
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-50 dark:bg-green-950/50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/50 dark:border-green-900">
          <Mail className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            <div className="font-medium mb-1 text-sm sm:text-base">Reset link sent</div>
            <div className="text-xs sm:text-sm">
              We've sent a password reset link to <strong className="break-all">{getValues('email')}</strong>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3 sm:space-y-4">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p className="font-medium text-slate-700 dark:text-slate-300"><strong>What happens next?</strong></p>
            <ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the reset link within 1 hour</li>
              <li>Create a new password</li>
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
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        {error && (
          <Alert variant="destructive" className="text-sm dark:bg-red-950/50 dark:border-red-900">
            <AlertDescription className="text-xs sm:text-sm dark:text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
            Email address
          </Label>
          <div className="relative">
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
              disabled={isLoading}
            />
            <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-slate-500" />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            We'll send you a link to reset your password
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-10 sm:h-11 text-sm sm:text-base bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/sign-in"
          className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center gap-1.5 sm:gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}