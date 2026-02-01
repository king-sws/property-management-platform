/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/auth/CompleteProfileForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Building2, Home, Wrench, Plus, X } from 'lucide-react'
import { completeProfile } from '@/actions/action'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const profileSchema = z.object({
  role: z.enum(['LANDLORD', 'TENANT', 'VENDOR']),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
  // Vendor-specific fields
  businessName: z.string().optional(),
  category: z.string().optional(),
  services: z.array(z.string()).optional(),
  licenseNumber: z.string().optional(),
  isInsured: z.boolean(),
}).superRefine((data, ctx) => {
  // Only validate vendor fields if role is VENDOR
  if (data.role === 'VENDOR') {
    // Validate business name
    if (!data.businessName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business name is required for vendors",
        path: ["businessName"],
      });
    }
    
    // Validate category
    if (!data.category?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a category",
        path: ["category"],
      });
    }
    
    // Validate services
    if (!data.services || data.services.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please add at least one service",
        path: ["services"],
      });
    }
  }
});

type ProfileFormData = z.infer<typeof profileSchema>

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

const VENDOR_CATEGORIES = [
  { value: 'PLUMBER', label: 'Plumber' },
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'LANDSCAPING', label: 'Landscaping' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'PEST_CONTROL', label: 'Pest Control' },
  { value: 'GENERAL_CONTRACTOR', label: 'General Contractor' },
  { value: 'HANDYMAN', label: 'Handyman' },
  { value: 'APPLIANCE_REPAIR', label: 'Appliance Repair' },
  { value: 'LOCKSMITH', label: 'Locksmith' },
  { value: 'PAINTER', label: 'Painter' },
  { value: 'ROOFER', label: 'Roofer' },
  { value: 'OTHER', label: 'Other' },
]

export function CompleteProfileForm({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentService, setCurrentService] = useState('')

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: 'TENANT',
      services: [],
      isInsured: false,
      phone: '',
      businessName: '',
      category: '',
      licenseNumber: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedRole = watch('role')
  const services = watch('services') || []

  const addService = () => {
    if (currentService.trim() && !services.includes(currentService.trim())) {
      setValue('services', [...services, currentService.trim()], {
        shouldValidate: true,
      })
      setCurrentService('')
    }
  }

  const removeService = (service: string) => {
    setValue('services', services.filter(s => s !== service), {
      shouldValidate: true,
    })
  }

  const onSubmit = async (data: ProfileFormData) => {
    console.log('Form data:', data)
    
    setLoading(true)
    try {
      const result = await completeProfile(data)
      
      if (result.success) {
        toast.success(result.message || 'Profile completed successfully!')
        window.location.href = '/dashboard'
      } else {
        toast.error(result.error || 'Failed to complete profile')
        setLoading(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="bg-white dark:bg-[#181a1b] rounded-lg shadow-lg dark:shadow-gray-900 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 border dark:border-slate-700 w-full max-w-2xl mx-auto"
    >
      {/* Role Selection */}
      <div className="space-y-2 sm:space-y-3">
        <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
          I am a *
        </Label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
          {roleOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedRole === option.value
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('role', option.value)}
                disabled={loading}
                className={`
                  flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#181a1b]'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mb-1 sm:mb-2 ${
                  isSelected 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-400 dark:text-slate-500'
                }`} />
                <span className={`text-xs sm:text-sm font-medium ${
                  isSelected 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {option.label}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center mt-0.5 sm:mt-1 hidden sm:block">
                  {option.description}
                </span>
              </button>
            )
          })}
        </div>
        {errors.role && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Common Fields */}
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
            Phone Number
          </Label>
          <Input
            {...register('phone')}
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            className="h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {errors.phone && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Vendor-Specific Fields */}
      {selectedRole === 'VENDOR' && (
        <div className="space-y-3 sm:space-y-4 border-t dark:border-slate-700 pt-4 sm:pt-6">
          <h3 className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100">
            Business Information
          </h3>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="businessName" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              Business Name *
            </Label>
            <Input
              {...register('businessName')}
              id="businessName"
              placeholder="ABC Plumbing Services"
              className="h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
            />
            {errors.businessName && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="category" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              Category *
            </Label>

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger 
                    id="category" 
                    className="h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent className="dark:bg-[#181a1b] dark:border-slate-700">
                    {VENDOR_CATEGORIES.map((cat) => (
                      <SelectItem 
                        key={cat.value} 
                        value={cat.value}
                        className="text-sm sm:text-base dark:text-slate-100 dark:focus:bg-slate-800"
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.category && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              Services Offered *
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a service..."
                value={currentService}
                onChange={(e) => setCurrentService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addService()
                  }
                }}
                className="h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <Button 
                type="button" 
                onClick={addService} 
                variant="outline"
                className="h-10 sm:h-11 px-3 sm:px-4 dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                {services.map((service) => (
                  <Badge 
                    key={service} 
                    variant="secondary" 
                    className="gap-1 text-xs sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                  >
                    {service}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => removeService(service)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {errors.services && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.services.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="licenseNumber" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                License Number
              </Label>
              <Input
                {...register('licenseNumber')}
                id="licenseNumber"
                placeholder="LIC-123456"
                className="h-10 sm:h-11 text-sm sm:text-base dark:bg-[#181a1b] dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            <div className="flex items-center pt-0 sm:pt-6">
              <input
                {...register('isInsured')}
                id="isInsured"
                type="checkbox"
                className="h-4 w-4 text-blue-600 dark:text-blue-500 rounded border-slate-300 dark:border-slate-600 dark:bg-[#181a1b] focus:ring-blue-500 dark:focus:ring-blue-600 flex-shrink-0"
              />
              <Label 
                htmlFor="isInsured" 
                className="ml-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                I am insured
              </Label>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-10 sm:h-11 text-sm sm:text-base bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
        disabled={loading}
      >
        {loading ? 'Completing...' : 'Complete Profile'}
      </Button>
    </form>
  )
}