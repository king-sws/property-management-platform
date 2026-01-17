/* eslint-disable @typescript-eslint/no-explicit-any */
// components/expenses/expense-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createExpense, updateExpense } from "@/actions/expenses";
import { toast } from "sonner";

const expenseFormSchema = z.object({
  propertyId: z.string().optional(),
  category: z.enum([
    "MORTGAGE",
    "PROPERTY_TAX",
    "INSURANCE",
    "HOA_FEES",
    "UTILITIES",
    "MAINTENANCE",
    "REPAIRS",
    "LANDSCAPING",
    "CLEANING",
    "PROPERTY_MANAGEMENT",
    "LEGAL",
    "ACCOUNTING",
    "MARKETING",
    "SUPPLIES",
    "CAPITAL_IMPROVEMENT",
    "OTHER",
  ]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  vendor: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  paidDate: z.string().optional(),
  isTaxDeductible: z.boolean(), // Remove .default(true)
  taxCategory: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  expense?: any;
  properties?: any[];
  isEdit?: boolean;
}

const expenseCategories = [
  { value: "MORTGAGE", label: "Mortgage Payment" },
  { value: "PROPERTY_TAX", label: "Property Tax" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "HOA_FEES", label: "HOA Fees" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "REPAIRS", label: "Repairs" },
  { value: "LANDSCAPING", label: "Landscaping" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "PROPERTY_MANAGEMENT", label: "Property Management" },
  { value: "LEGAL", label: "Legal Fees" },
  { value: "ACCOUNTING", label: "Accounting" },
  { value: "MARKETING", label: "Marketing/Advertising" },
  { value: "SUPPLIES", label: "Supplies" },
  { value: "CAPITAL_IMPROVEMENT", label: "Capital Improvement" },
  { value: "OTHER", label: "Other" },
];

export function ExpenseForm({
  expense,
  properties = [],
  isEdit = false,
}: ExpenseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

const form = useForm<ExpenseFormValues>({
  resolver: zodResolver(expenseFormSchema),
  defaultValues: {
    propertyId: expense?.propertyId || "",
    category: expense?.category || "",
    amount: expense?.amount?.toString() || "",
    description: expense?.description || "",
    vendor: expense?.vendor || "",
    date: expense?.date
      ? new Date(expense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    paidDate: expense?.paidDate
      ? new Date(expense.paidDate).toISOString().split("T")[0]
      : "",
    isTaxDeductible: expense?.isTaxDeductible ?? true, // Keep this as is
    taxCategory: expense?.taxCategory || "",
    notes: expense?.notes || "",
  },
});

  async function onSubmit(data: ExpenseFormValues) {
    setIsLoading(true);

    try {
      const formattedData = {
        propertyId: data.propertyId || undefined,
        category: data.category as any, // TypeScript will validate this through zod
        amount: parseFloat(data.amount),
        description: data.description,
        vendor: data.vendor,
        date: data.date,
        paidDate: data.paidDate,
        isTaxDeductible: data.isTaxDeductible,
        taxCategory: data.taxCategory,
        notes: data.notes,
      };

      let result;
      if (isEdit && expense) {
        result = await updateExpense(expense.id, formattedData);
      } else {
        result = await createExpense(formattedData);
      }

      if (result.success) {
        toast.success(result.message || "Expense saved successfully");
        router.push("/dashboard/expenses");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save expense");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>
                Enter the details of your expense
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the expense" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor/Payee</FormLabel>
                      <FormControl>
                        <Input placeholder="Who was paid?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {properties.length > 0 && (
                  <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None (General Expense)</SelectItem>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Link expense to a specific property
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>When was this expense incurred?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paidDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>When was this expense paid?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>
                Track tax-deductible expenses for reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isTaxDeductible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Tax Deductible</FormLabel>
                      <FormDescription>
                        Mark this expense as tax deductible
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Schedule E - Line 5"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Specify the tax form category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Add any additional details or context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Expense" : "Add Expense"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}