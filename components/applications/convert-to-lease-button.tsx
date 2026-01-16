/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/applications/convert-to-lease-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { convertApplicationToLease, canConvertToLease } from "@/actions/convert-application-to-lease";
import { toast } from "sonner";
import { format } from "date-fns";

const conversionFormSchema = z.object({
  leaseType: z.enum(["FIXED_TERM", "MONTH_TO_MONTH", "YEAR_TO_YEAR"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  rentAmount: z.string().min(1, "Rent amount is required"),
  deposit: z.string().min(1, "Deposit is required"),
  lateFeeAmount: z.string().optional(),
  lateFeeDays: z.string().optional(),
  rentDueDay: z.string().min(1, "Rent due day is required"),
  terms: z.string().optional(),
});

interface ConvertToLeaseButtonProps {
  application: any;
  className?: string;
}

export function ConvertToLeaseButton({ application, className }: ConvertToLeaseButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canConvert, setCanConvert] = useState<boolean | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Calculate default dates
  const defaultStartDate = new Date(application.desiredMoveInDate);
  const defaultEndDate = new Date(defaultStartDate);
  defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);

  const form = useForm<z.infer<typeof conversionFormSchema>>({
    resolver: zodResolver(conversionFormSchema),
    defaultValues: {
      leaseType: "FIXED_TERM",
      startDate: format(defaultStartDate, "yyyy-MM-dd"),
      endDate: format(defaultEndDate, "yyyy-MM-dd"),
      rentAmount: application.unit?.rentAmount?.toString() || "",
      deposit: application.unit?.deposit?.toString() || "",
      lateFeeAmount: "50",
      lateFeeDays: "5",
      rentDueDay: "1",
      terms: "",
    },
  });

  const watchLeaseType = form.watch("leaseType");

  const checkEligibility = async () => {
    setIsLoading(true);
    const result = await canConvertToLease(application.id);
    
    if (result.success) {
      setCanConvert(true);
      setConversionError(null);
      setIsOpen(true);
    } else {
      setCanConvert(false);
      setConversionError(result.error || "Cannot convert this application");
      
      if (result.data?.leaseId) {
        toast.error(result.error || "Already converted", {
          action: {
            label: "View Lease",
            onClick: () => router.push(`/dashboard/leases/${result.data.leaseId}`),
          },
        });
      } else {
        toast.error(result.error);
      }
    }
    setIsLoading(false);
  };

  const onSubmit = async (data: z.infer<typeof conversionFormSchema>) => {
    setIsLoading(true);

    try {
      const result = await convertApplicationToLease({
        applicationId: application.id,
        leaseType: data.leaseType,
        startDate: data.startDate,
        endDate: data.leaseType === "MONTH_TO_MONTH" ? undefined : data.endDate,
        rentAmount: parseFloat(data.rentAmount),
        deposit: parseFloat(data.deposit),
        lateFeeAmount: data.lateFeeAmount ? parseFloat(data.lateFeeAmount) : undefined,
        lateFeeDays: data.lateFeeDays ? parseInt(data.lateFeeDays) : undefined,
        rentDueDay: parseInt(data.rentDueDay),
        terms: data.terms,
      });

      if (result.success) {
        toast.success(result.message || "Lease created successfully", {
          action: {
            label: "View Lease",
            onClick: () => router.push(`/dashboard/leases/${result.data.leaseId}`),
          },
        });
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create lease");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for approved applications
  if (application.status !== "APPROVED" && application.status !== "CONDITIONALLY_APPROVED") {
    return null;
  }

  return (
    <>
      <Button
        onClick={checkEligibility}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        Convert to Lease
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Convert Application to Lease</DialogTitle>
            <DialogDescription>
              Create a lease agreement for {application.tenant?.user?.name || "the tenant"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Application Summary */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenant:</span>
                      <span className="font-medium">{application.tenant?.user?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit:</span>
                      <span className="font-medium">
                        {application.unit?.property?.name} - Unit {application.unit?.unitNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested Move-In:</span>
                      <span className="font-medium">
                        {format(new Date(application.desiredMoveInDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {application.monthlyIncome && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Income:</span>
                        <span className="font-medium">
                          ${Number(application.monthlyIncome).toLocaleString()}
                          <Badge variant="outline" className="ml-2">
                            {(Number(application.monthlyIncome) / Number(application.unit?.rentAmount)).toFixed(1)}x rent
                          </Badge>
                        </span>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Lease Type */}
              <FormField
                control={form.control}
                name="leaseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXED_TERM">Fixed Term</SelectItem>
                        <SelectItem value="MONTH_TO_MONTH">Month to Month</SelectItem>
                        <SelectItem value="YEAR_TO_YEAR">Year to Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchLeaseType !== "MONTH_TO_MONTH" && (
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Typically 1 year from start date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Financial Terms */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1500.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1500.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Terms */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rentDueDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Due Day *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}{day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lateFeeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Late Fee ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lateFeeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grace Days</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Custom Terms */}
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Terms (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any special terms or conditions..."
                        className="min-h-25"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Default lease terms will be generated if left empty
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  The lease will be created with "Pending Signature" status. The tenant will
                  be notified to sign the lease agreement.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Lease
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}