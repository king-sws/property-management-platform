/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/profile/subscription-tab.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Check, 
  Loader2, 
  ArrowRight, 
  Zap,
  Calendar,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { getCurrentSubscription, getBillingPortalUrl } from "@/actions/subscriptions";
import { toast } from "sonner";
import Link from "next/link";

interface SubscriptionTabProps {
  userRole: string;
}

export function SubscriptionTab({ userRole }: SubscriptionTabProps) {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const result = await getCurrentSubscription();
      if (result.success) {
        setSubscription(result.data);
      } else {
        toast.error(result.error || "Failed to load subscription");
      }
    } catch (error) {
      console.error("Load subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoadingPortal(true);
    try {
      const result = await getBillingPortalUrl();
      
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error || "Failed to open billing portal");
      }
    } catch (error) {
      console.error("Billing portal error:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  if (userRole !== "LANDLORD") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Subscription management is only available for landlords
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription?.hasSubscription) {
    return (
      <div className="space-y-6">
        {/* Start Trial CTA */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Start Your Free Trial</CardTitle>
            </div>
            <CardDescription>
              Try any plan free for 14 days. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard/settings/subscription">
                Choose Your Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pricing Preview */}
        <div className="grid gap-4 md:grid-cols-3">
          {subscription?.availablePlans && Object.entries(subscription.availablePlans).map(([key, plan]: [string, any]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plan.features.slice(0, 3).map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const sub = subscription.subscription;
  const isTrialing = sub.status === "trialing";
  const isCanceling = sub.cancelAtPeriodEnd;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            <Badge 
              variant={
                sub.status === "active" ? "default" :
                isTrialing ? "secondary" :
                "destructive"
              }
              className="text-sm"
            >
              {sub.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan</span>
              <span className="text-lg font-bold">{sub.tier} Plan</span>
            </div>

            {isTrialing && sub.trialEnd && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Trial ends on
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  {new Date(sub.trialEnd).toLocaleDateString()}
                </span>
              </div>
            )}

            {isCanceling && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Cancels on
                  </span>
                </div>
                <span className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}

            {!isTrialing && !isCanceling && sub.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Next billing date</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Property Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Property Usage</span>
              <span className="text-muted-foreground">
                {sub.propertyCount} of {sub.propertyLimit}
              </span>
            </div>
            <Progress value={sub.propertyUsage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {sub.propertyLimit - sub.propertyCount} properties remaining
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleManageBilling}
              disabled={isLoadingPortal}
              className="flex-1"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
            <Button 
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/dashboard/settings/subscription">
                Change Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Billing Portal Info */}
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              The billing portal allows you to update payment methods, view invoices, and manage your subscription.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            What's included in your {sub.tier} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {subscription.availablePlans?.[sub.tier]?.features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-950 p-1">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {sub.tier !== "PREMIUM" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Need More Properties?</CardTitle>
            <CardDescription>
              Upgrade to unlock more properties and advanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" size="lg" className="w-full">
              <Link href="/dashboard/settings/subscription">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}