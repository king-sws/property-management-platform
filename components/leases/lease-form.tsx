/* eslint-disable @typescript-eslint/no-explicit-any */
// components/leases/lease-form.tsx
"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { createLease, updateLease } from "@/actions/leases";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const leaseFormSchema = z.object({
  unitId: z.string().min(1, "Please select a unit"),
  tenantIds: z.array(z.string()).min(1, "At least one tenant is required"),
  type: z.enum(["FIXED_TERM", "MONTH_TO_MONTH", "YEAR_TO_YEAR"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  rentAmount: z.string().min(1, "Rent amount is required"),
  deposit: z.string().min(1, "Deposit is required"),
  lateFeeAmount: z.string().optional(),
  lateFeeDays: z.string().optional(),
  rentDueDay: z.string().min(1, "Rent due day is required"),
  terms: z.string().optional(),
});

type LeaseFormValues = z.infer<typeof leaseFormSchema>;

interface LeaseFormProps {
  lease?: any;
  properties?: any[];
  tenants?: any[];
  isEdit?: boolean;
}

export function LeaseForm({
  lease,
  properties = [],
  tenants = [],
  isEdit = false,
}: LeaseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseFormSchema),
    defaultValues: {
      unitId: lease?.unitId || "",
      tenantIds: lease?.tenants?.map((t: any) => t.tenantId) || [],
      type: lease?.type || "FIXED_TERM",
      startDate: lease?.startDate
        ? new Date(lease.startDate).toISOString().split("T")[0]
        : "",
      endDate: lease?.endDate
        ? new Date(lease.endDate).toISOString().split("T")[0]
        : "",
      rentAmount: lease?.rentAmount?.toString() || "",
      deposit: lease?.deposit?.toString() || "",
      lateFeeAmount: lease?.lateFeeAmount?.toString() || "",
      lateFeeDays: lease?.lateFeeDays?.toString() || "5",
      rentDueDay: lease?.rentDueDay?.toString() || "1",
      terms: lease?.terms || "",
    },
  });

  // Load units when property is selected
  useEffect(() => {
    if (selectedProperty) {
      const property = properties.find((p) => p.id === selectedProperty);
      if (property) {
        setAvailableUnits(property.units || []);
      }
    }
  }, [selectedProperty, properties]);

  // Set initial property if editing
  useEffect(() => {
    if (lease?.unit?.property?.id) {
      setSelectedProperty(lease.unit.property.id);
    }
  }, [lease]);

  async function onSubmit(data: LeaseFormValues) {
    setIsLoading(true);

    try {
      const formattedData = {
        ...data,
        rentAmount: parseFloat(data.rentAmount),
        deposit: parseFloat(data.deposit),
        lateFeeAmount: data.lateFeeAmount ? parseFloat(data.lateFeeAmount) : undefined,
        lateFeeDays: data.lateFeeDays ? parseInt(data.lateFeeDays) : undefined,
        rentDueDay: parseInt(data.rentDueDay),
      };

      let result;
      if (isEdit && lease) {
        // For updates, we only send changed fields
        const updateData: any = {};
        if (data.rentAmount) updateData.rentAmount = parseFloat(data.rentAmount);
        if (data.deposit) updateData.deposit = parseFloat(data.deposit);
        if (data.lateFeeAmount) updateData.lateFeeAmount = parseFloat(data.lateFeeAmount);
        if (data.lateFeeDays) updateData.lateFeeDays = parseInt(data.lateFeeDays);
        if (data.rentDueDay) updateData.rentDueDay = parseInt(data.rentDueDay);
        if (data.terms !== undefined) updateData.terms = data.terms;

        result = await updateLease(lease.id, updateData);
      } else {
        result = await createLease(formattedData);
      }

      if (result.success) {
        toast.success(result.message || "Lease saved successfully");
        router.push("/dashboard/leases");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save lease");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const watchType = form.watch("type");

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
          {/* Property & Unit Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Property & Unit</CardTitle>
              <CardDescription>
                Select the property and unit for this lease
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEdit && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Property
                    </label>
                    <Select
                      value={selectedProperty}
                      onValueChange={setSelectedProperty}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name} - {property.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="unitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedProperty}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                Unit {unit.unitNumber} - {unit.bedrooms} bed,{" "}
                                {unit.bathrooms} bath
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {isEdit && (
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">
                    {lease?.unit?.property?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Unit {lease?.unit?.unitNumber}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Property and unit cannot be changed after lease creation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tenant Selection */}
          {!isEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Tenants</CardTitle>
                <CardDescription>
                  Select one or more tenants for this lease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="tenantIds"
                  render={() => (
                    <FormItem>
                      <div className="space-y-2">
                        {tenants.map((tenant) => (
                          <FormField
                            key={tenant.id}
                            control={form.control}
                            name="tenantIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tenant.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tenant.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              tenant.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== tenant.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="font-medium">
                                      {tenant.user.name}
                                    </FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                      {tenant.user.email}
                                    </p>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Lease Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Lease Terms</CardTitle>
              <CardDescription>Define the lease agreement terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lease type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FIXED_TERM">Fixed Term</SelectItem>
                          <SelectItem value="MONTH_TO_MONTH">
                            Month-to-Month
                          </SelectItem>
                          <SelectItem value="YEAR_TO_YEAR">
                            Year-to-Year
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(watchType === "FIXED_TERM" || watchType === "YEAR_TO_YEAR") && (
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="rentDueDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Due Day *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Day of month (1-31)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Terms</CardTitle>
              <CardDescription>Set rent and deposit amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="lateFeeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Late Fee Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="50.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional late payment fee</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lateFeeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Late Fee Grace Period</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="5"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Days after due date</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Terms</CardTitle>
              <CardDescription>
                Add any special terms or conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional terms, rules, or conditions..."
                        rows={6}
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
              {isEdit ? "Update Lease" : "Create Lease"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}