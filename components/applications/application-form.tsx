/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// components/applications/application-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { createApplication, updateApplication } from "@/actions/applications";
import { toast } from "sonner";

const applicationFormSchema = z.object({
  unitId: z.string().min(1, "Please select a unit"),
  desiredMoveInDate: z.string().min(1, "Move-in date is required"),
  numberOfOccupants: z.string().min(1, "Number of occupants is required"),
  hasPets: z.boolean(), // Remove .default(false) and .optional()
  petDetails: z.string().optional(),
  occupants: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      relationship: z.string().min(1, "Relationship is required"),
      age: z.string().optional(),
    })
  ),
  previousAddress: z.string().optional(),
  previousLandlord: z.string().optional(),
  previousLandlordPhone: z.string().optional(),
  reasonForMoving: z.string().optional(),
  monthlyIncome: z.string().optional(),
  employer: z.string().optional(),
  employmentLength: z.string().optional(),
  references: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      relationship: z.string().min(1, "Relationship is required"),
      phone: z.string().min(1, "Phone is required"),
      email: z.string().email("Invalid email").optional(),
    })
  ),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ApplicationFormProps {
  application?: any;
  units?: any[];
  isEdit?: boolean;
}

export function ApplicationForm({
  application,
  units = [],
  isEdit = false,
}: ApplicationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

const form = useForm<ApplicationFormValues>({
  resolver: zodResolver(applicationFormSchema),
  defaultValues: {
    unitId: application?.unitId || "",
    desiredMoveInDate: application?.desiredMoveInDate
      ? new Date(application.desiredMoveInDate).toISOString().split("T")[0]
      : "",
    numberOfOccupants: application?.numberOfOccupants?.toString() || "1",
    hasPets: application?.hasPets ?? false, // Use ?? instead of ||
    petDetails: application?.petDetails || "",
    occupants: application?.occupants || [],
    previousAddress: application?.previousAddress || "",
    previousLandlord: application?.previousLandlord || "",
    previousLandlordPhone: application?.previousLandlordPhone || "",
    reasonForMoving: application?.reasonForMoving || "",
    monthlyIncome: application?.monthlyIncome?.toString() || "",
    employer: application?.employer || "",
    employmentLength: application?.employmentLength || "",
    references: application?.references || [],
  },
});

  const {
    fields: occupantFields,
    append: appendOccupant,
    remove: removeOccupant,
  } = useFieldArray({
    control: form.control,
    name: "occupants",
  });

  const {
    fields: referenceFields,
    append: appendReference,
    remove: removeReference,
  } = useFieldArray({
    control: form.control,
    name: "references",
  });

  const watchHasPets = form.watch("hasPets");

  async function onSubmit(data: ApplicationFormValues) {
    setIsLoading(true);

    try {
      const formattedData = {
        ...data,
        numberOfOccupants: parseInt(data.numberOfOccupants),
        monthlyIncome: data.monthlyIncome ? parseFloat(data.monthlyIncome) : undefined,
        occupants: data.occupants.map((occ) => ({
          ...occ,
          age: occ.age ? parseInt(occ.age) : undefined,
        })),
      };

      let result;
      if (isEdit && application) {
        result = await updateApplication(application.id, formattedData);
      } else {
        result = await createApplication(formattedData);
      }

      if (result.success) {
        toast.success(result.message || "Application saved successfully");
        router.push("/dashboard/applications");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save application");
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
          {/* Unit Selection */}
          {!isEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Select Unit</CardTitle>
                <CardDescription>
                  Choose the unit you'd like to apply for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Unit *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.property.name} - Unit {unit.unitNumber} (${unit.rentAmount}/mo)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide basic details about your rental needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="desiredMoveInDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Move-In Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfOccupants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Occupants *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hasPets"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Do you have pets?</FormLabel>
                      <FormDescription>
                        Please provide details if you have pets
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {watchHasPets && (
                <FormField
                  control={form.control}
                  name="petDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your pets (type, breed, size, age, etc.)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Additional Occupants */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Occupants</CardTitle>
              <CardDescription>
                List all people who will be living in the unit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {occupantFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Occupant {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOccupant(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`occupants.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`occupants.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spouse, Child" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`occupants.${index}.age`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendOccupant({ name: "", relationship: "", age: "" })
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Occupant
              </Button>
            </CardContent>
          </Card>

          {/* Rental History */}
          <Card>
            <CardHeader>
              <CardTitle>Rental History</CardTitle>
              <CardDescription>
                Provide information about your current or previous residence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="previousAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="previousLandlord"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Landlord</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previousLandlordPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landlord Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reasonForMoving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Moving</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Employment & Income */}
          <Card>
            <CardHeader>
              <CardTitle>Employment & Income</CardTitle>
              <CardDescription>
                Provide your employment and income information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Employer</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employmentLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length of Employment</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income</FormLabel>
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
            </CardContent>
          </Card>

          {/* References */}
          <Card>
            <CardHeader>
              <CardTitle>References</CardTitle>
              <CardDescription>
                Provide at least 2 personal or professional references
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {referenceFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Reference {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReference(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`references.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`references.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Friend, Colleague" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`references.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`references.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendReference({ name: "", relationship: "", phone: "", email: "" })
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reference
              </Button>
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
              {isEdit ? "Update Application" : "Save as Draft"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}