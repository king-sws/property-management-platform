/* eslint-disable react-hooks/incompatible-library */
// components/auth/SignUpForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { SignUpWithCredentials } from '@/actions/action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, User, Mail, Lock, Check, X, Building2, Home, Wrench } from 'lucide-react'
import { OAuthProviders } from './OAuthProviders'
import { toast } from 'sonner'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain uppercase, lowercase, and number'),
  role: z.enum(['LANDLORD', 'TENANT', 'VENDOR']),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
})

type SignUpFormData = z.infer<typeof signUpSchema>

const PasswordStrength = ({ password }: { password: string }) => {
  const requirements = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'One uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', test: /[a-z]/.test(password) },
    { label: 'One number', test: /\d/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center space-x-2 text-xs">
          {req.test ? (
            <Check className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <X className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
          )}
          <span className={req.test ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  )
}

const roleOptions = [
  {
    value: 'TENANT',
    label: 'Tenant',
    description: 'Looking for a place to rent',
    icon: Home,
  },
  {
    value: 'LANDLORD',
    label: 'Landlord',
    description: 'Property owner or manager',
    icon: Building2,
  },
  {
    value: 'VENDOR',
    label: 'Vendor',
    description: 'Maintenance or service provider',
    icon: Wrench,
  },
] as const

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'TENANT',
    },
  })

  const password = watch('password', '')
  const selectedRole = watch('role')

  const onSubmit = async (data: SignUpFormData) => {
    setError('')
    setSuccess('')
    
    startTransition(async () => {
      const result = await SignUpWithCredentials(
        data.name,
        data.email,
        data.password,
        data.role
      )
      
      if (result.success) {
        setSuccess('Account created successfully!')
        toast.success('Account created successfully!')
        window.location.href = '/dashboard'
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
            Or create account with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        {error && (
          <Alert variant="destructive" className="text-sm dark:bg-red-950/50 dark:border-red-900">
            <AlertDescription className="dark:text-red-300 text-xs sm:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="text-sm border-green-200 bg-green-50 dark:bg-green-950/50 dark:border-green-900">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-700 dark:text-green-300 text-xs sm:text-sm">{success}</AlertDescription>
          </Alert>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
            I am a
          </Label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {roleOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedRole === option.value
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('role', option.value)}
                  disabled={isLoading}
                  className={`
                    relative flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50' 
                      : 'border-slate-200 hover:border-slate-300 bg-white dark:border-slate-700 dark:hover:border-slate-600 dark:bg-[#181a1b]'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {option.label}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center mt-0.5 sm:mt-1 hidden sm:block">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>
          <input type="hidden" {...register('role')} />
          {errors.role && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.role.message}</p>
          )}
        </div>

        {/* Name Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
            Full name
          </Label>
          <div className="relative">
            <Input
              {...register('name')}
              id="name"
              type="text"
              placeholder="John Doe"
              className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
              disabled={isLoading}
            />
            <User className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-slate-500" />
          </div>
          {errors.name && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

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
          <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
          </Label>
          <div className="relative">
            <Input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
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
          <PasswordStrength password={password} />
          {errors.password && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-2">
          <input
            {...register('terms')}
            id="terms"
            type="checkbox"
            className="mt-0.5 sm:mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-[#181a1b] rounded flex-shrink-0"
            disabled={isLoading}
          />
          <Label htmlFor="terms" className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.terms && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.terms.message}</p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 sm:h-11 text-sm sm:text-base bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      {/* Sign in link */}
      <div className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}