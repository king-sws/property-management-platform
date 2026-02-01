// ============================================================================
// FILE: src/components/properties/property-form.tsx
// Property Form Component with Image Upload - IMPROVED VERSION WITH FIXED SPACING
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Info } from "lucide-react";
import { createProperty, updateProperty } from "@/actions/properties";
import { toast } from "sonner";
import Link from "next/link";
import PropertyImageUploader from "@/components/properties/property-image-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";

const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  type: z.enum([
    "SINGLE_FAMILY",
    "MULTI_FAMILY",
    "APARTMENT",
    "CONDO",
    "TOWNHOUSE",
    "COMMERCIAL",
    "OTHER",
  ]),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required").max(2, "Use 2-letter state code"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  country: z.string().min(1, "Country is required"),
  description: z.string().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  squareFeet: z.number().int().positive().optional(),
  lotSize: z.number().positive().optional(),
  purchasePrice: z.number().positive().optional(),
  currentValue: z.number().positive().optional(),
  propertyTax: z.number().positive().optional(),
  insurance: z.number().positive().optional(),
  hoaFees: z.number().positive().optional(),
});

type FormValues = z.infer<typeof propertySchema>;

interface PropertyImage {
  id: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  order: number;
}

interface PropertyFormProps {
  propertyId?: string;
  initialData?: Partial<FormValues>;
  images?: PropertyImage[];
}

export default function PropertyForm({
  propertyId,
  initialData,
  images = [],
}: PropertyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageSection, setShowImageSection] = useState(false);
  const [newPropertyId, setNewPropertyId] = useState<string | null>(null);
  const router = useRouter();
  const isEditing = !!propertyId;

  const form = useForm<FormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      type: initialData?.type ?? "SINGLE_FAMILY",
      address: initialData?.address ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      zipCode: initialData?.zipCode ?? "",
      country: initialData?.country ?? "US",
      description: initialData?.description ?? "",
      yearBuilt: initialData?.yearBuilt,
      squareFeet: initialData?.squareFeet,
      lotSize: initialData?.lotSize,
      purchasePrice: initialData?.purchasePrice,
      currentValue: initialData?.currentValue,
      propertyTax: initialData?.propertyTax,
      insurance: initialData?.insurance,
      hoaFees: initialData?.hoaFees,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      let result;

      if (isEditing && propertyId) {
        result = await updateProperty(propertyId, data);
        toast.success("Property updated successfully");
        router.push("/dashboard/properties");
        router.refresh();
      } else {
        // Creating new property
        result = await createProperty(data);
        
        if (result.success && result.data?.id) {
          toast.success("Property created successfully");
          
          // Store the new property ID and show image upload section
          setNewPropertyId(result.data.id);
          setShowImageSection(true);
          setIsSubmitting(false);
          
          // Scroll to top to show the alert
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else {
          toast.error(result.error || "Failed to create property");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we just created a property and are showing images
  if (showImageSection && newPropertyId) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/properties" >
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </Link>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your property has been created! You can now add images, or skip this step and add them later.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Add Property Images (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PropertyImageUploader
              propertyId={newPropertyId}
              images={[]}
            />
            
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/properties")}
              >
                Skip & Finish
              </Button>
              <Button
                onClick={() => router.push("/dashboard/properties")}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/properties">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
      </Link>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sunset Apartments" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SINGLE_FAMILY">Single Family</SelectItem>
                        <SelectItem value="MULTI_FAMILY">Multi Family</SelectItem>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                        <SelectItem value="CONDO">Condo</SelectItem>
                        <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the property..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CA"
                          maxLength={2}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormDescription>2-letter state code</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="US" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2020"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="squareFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Feet</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Size (acres)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.25"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="500000"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="550000"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="propertyTax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Property Tax</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="6000"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Insurance</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1200"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hoaFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly HOA Fees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="200"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images Section - Only shown when editing */}
          {isEditing && propertyId && (
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyImageUploader
                  propertyId={propertyId}
                  images={images}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/properties")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update Property" : "Create Property"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}