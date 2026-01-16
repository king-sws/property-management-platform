// components/payments/create-payment-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createPayment, getActiveLeases } from "@/actions/payments";
import { toast } from "sonner";

const formSchema = z.object({
  leaseId: z.string().min(1, "Please select a lease"),
  type: z.enum(["RENT", "DEPOSIT", "LATE_FEE", "UTILITY", "PET_FEE", "PARKING", "OTHER"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
});

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActiveLease {
  id: string;
  unitNumber: string;
  propertyName: string;
  tenantName: string;
  tenantId: string;
  rentAmount: number;
}

export function CreatePaymentDialog({ open, onOpenChange }: CreatePaymentDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [leases, setLeases] = useState<ActiveLease[]>([]);
  const [isLoadingLeases, setIsLoadingLeases] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaseId: "",
      type: "RENT",
      amount: "",
      description: "",
    },
  });

  // Load active leases when dialog opens
  useEffect(() => {
    if (open) {
      loadActiveLeases();
    }
  }, [open]);

  async function loadActiveLeases() {
    setIsLoadingLeases(true);
    try {
      const result = await getActiveLeases();
      if (result.success && result.data) {
        setLeases(result.data);
      } else {
        toast.error(result.error || "Failed to load leases");
        setLeases([]);
      }
    } catch (error) {
      console.error("Error loading leases:", error);
      toast.error("Failed to load leases");
      setLeases([]);
    } finally {
      setIsLoadingLeases(false);
    }
  }

  // Auto-fill amount when lease is selected and type is RENT
  const watchedLeaseId = form.watch("leaseId");
  const watchedType = form.watch("type");

  useEffect(() => {
    if (watchedLeaseId && watchedType === "RENT") {
      const selectedLease = leases.find(l => l.id === watchedLeaseId);
      if (selectedLease && !form.getValues("amount")) {
        form.setValue("amount", selectedLease.rentAmount.toString());
      }
    }
  }, [watchedLeaseId, watchedType, leases, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const result = await createPayment({
        leaseId: values.leaseId,
        type: values.type,
        amount: parseFloat(values.amount),
        description: values.description,
        dueDate: values.dueDate?.toISOString(),
      });

      if (result.success) {
        toast.success(result.message || "Payment charge created successfully");
        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create payment");
      }
    } catch (error) {
      console.error("Payment creation error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-131.25">
        <DialogHeader>
          <DialogTitle>Create Payment Charge</DialogTitle>
          <DialogDescription>
            Create a new payment charge for a tenant
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leaseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lease / Tenant</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoadingLeases}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingLeases ? "Loading leases..." : "Select a lease"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingLeases ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        </SelectItem>
                      ) : leases.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No active leases found
                        </SelectItem>
                      ) : (
                        leases.map((lease) => (
                          <SelectItem key={lease.id} value={lease.id}>
                            {lease.tenantName} - {lease.propertyName} Unit {lease.unitNumber}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the lease to charge
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RENT">Rent</SelectItem>
                        <SelectItem value="DEPOSIT">Deposit</SelectItem>
                        <SelectItem value="LATE_FEE">Late Fee</SelectItem>
                        <SelectItem value="UTILITY">Utility</SelectItem>
                        <SelectItem value="PET_FEE">Pet Fee</SelectItem>
                        <SelectItem value="PARKING">Parking</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When this payment is due
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingLeases}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Charge
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}