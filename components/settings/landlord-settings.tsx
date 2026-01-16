/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/settings/landlord-settings.tsx
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, CreditCard } from "lucide-react";
import { updateLandlordSettings } from "@/actions/settings";
import { toast } from "sonner";

const landlordSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  taxId: z.string().optional(),
});

type LandlordFormValues = z.infer<typeof landlordSchema>;

interface LandlordSettingsProps {
  settings: any;
}

export function LandlordSettings({ settings }: LandlordSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LandlordFormValues>({
    resolver: zodResolver(landlordSchema),
    defaultValues: {
      businessName: settings?.businessName || "",
      businessAddress: settings?.businessAddress || "",
      taxId: settings?.taxId || "",
    },
  });

  async function onSubmit(data: LandlordFormValues) {
    setIsLoading(true);

    try {
      const result = await updateLandlordSettings(data);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Your current subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">
                {settings?.subscriptionTier || "BASIC"}
              </p>
            </div>
            <Badge variant={settings?.subscriptionStatus === "ACTIVE" ? "default" : "secondary"}>
              {settings?.subscriptionStatus || "TRIAL"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Property Limit</p>
              <p className="text-sm text-muted-foreground">
                Maximum properties you can manage
              </p>
            </div>
            <p className="font-semibold">{settings?.propertyLimit || 5}</p>
          </div>

          <Button variant="outline" className="w-full">
            Manage Subscription
          </Button>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Update your business details for invoices and tax reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Property Management LLC" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank if you operate as an individual
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Business St, City, State 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID (EIN or SSN)</FormLabel>
                    <FormControl>
                      <Input placeholder="XX-XXXXXXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used for tax reporting and 1099 forms
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}