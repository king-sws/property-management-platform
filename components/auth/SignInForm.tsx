/* eslint-disable react/no-unescaped-entities */
// components/auth/SignInForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { SignInWithCredentials } from '@/actions/action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { OAuthProviders } from './OAuthProviders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    setError('')

    startTransition(async () => {
      const result = await SignInWithCredentials(data.email, data.password)
      
      if (result.success) {
        toast.success('Signed in successfully!')
        router.push('/dashboard')
        router.refresh()
      } else if (result.error) {
        setError(result.error)
      }
    })
  }

  const isLoading = isPending || isSubmitting

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* OAuth Providers */}
      <OAuthProviders />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-[#181a1b] px-2 text-slate-500 dark:text-slate-400">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        {error && (
          <Alert variant="destructive" className="text-sm">
            <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
            Email address
          </Label>
          <div className="relative">
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="you@company.com"
              className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
              disabled={isLoading}
            />
            <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-slate-500" />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[11px] sm:text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
              disabled={isLoading}
            />
            <Lock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-slate-500" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 sm:h-11 text-sm sm:text-base bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      {/* Sign up link */}
      <div className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        Don't have an account?{' '}
        <Link
          href="/sign-up"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign up for free
        </Link>
      </div>
    </div>
  )
}