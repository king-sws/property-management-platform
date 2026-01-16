/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Check, 
  Loader2, 
  Zap,
  CreditCard,
  AlertCircle,
  Building2,
  Info
} from "lucide-react";
import {
  getCurrentSubscription,
  startFreeTrial,
  changeSubscriptionTier,
  cancelCurrentSubscription,
  reactivateCurrentSubscription,
  getBillingPortalUrl,
} from "@/actions/subscriptions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLAN_DETAILS = {
  BASIC: {
    name: "Basic",
    price: 29,
    propertyLimit: 5,
    features: [
      "Up to 5 properties",
      "Unlimited tenants",
      "Online rent collection",
      "Maintenance tracking",
      "Basic reporting",
      "Email support",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 49,
    propertyLimit: 10,
    features: [
      "Everything in Basic",
      "Up to 10 properties",
      "Automated rent reminders",
      "Advanced reporting",
      "Document storage (5GB)",
      "Lease templates",
      "Priority support",
    ],
    popular: true,
  },
  PREMIUM: {
    name: "Premium",
    price: 79,
    propertyLimit: 20,
    features: [
      "Everything in Professional",
      "Up to 20 properties",
      "Multi-property analytics",
      "Custom lease templates",
      "Document storage (20GB)",
      "API access",
      "Dedicated support",
      "White-label reports",
    ],
  },
};

function PricingCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export function SubscriptionManagement() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const result = await getCurrentSubscription();
      if (result.success) {
        setSubscription(result.data);
      }
    } catch (error) {
      console.error("Load subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrial = async (tier: string) => {
    setActionLoading(tier);
    try {
      const result = await startFreeTrial({ tier } as any);
      if (result.success) {
        toast.success(result.message || "Trial started successfully!");
        router.refresh();
        loadSubscription();
      } else {
        toast.error(result.error || "Failed to start trial");
      }
    } catch (error) {
      console.error("Start trial error:", error);
      toast.error("Failed to start trial");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePlan = async (tier: string) => {
    setActionLoading(tier);
    try {
      const result = await changeSubscriptionTier({ tier } as any);
      if (result.success) {
        toast.success(result.message || "Plan changed successfully!");
        router.refresh();
        loadSubscription();
      } else {
        toast.error(result.error || "Failed to change plan");
      }
    } catch (error) {
      console.error("Change plan error:", error);
      toast.error("Failed to change plan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading("cancel");
    try {
      const result = await cancelCurrentSubscription(false);
      if (result.success) {
        toast.success(result.message || "Subscription canceled");
        router.refresh();
        loadSubscription();
      } else {
        toast.error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading("reactivate");
    try {
      const result = await reactivateCurrentSubscription();
      if (result.success) {
        toast.success(result.message || "Subscription reactivated");
        router.refresh();
        loadSubscription();
      } else {
        toast.error(result.error || "Failed to reactivate subscription");
      }
    } catch (error) {
      console.error("Reactivate subscription error:", error);
      toast.error("Failed to reactivate subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBillingPortal = async () => {
    setActionLoading("billing");
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
      setActionLoading(null);
    }
  };

  const hasSubscription = subscription?.hasSubscription;
  const currentTier = subscription?.subscription?.tier;
  const currentStatus = subscription?.subscription?.status;
  const isCanceling = subscription?.subscription?.cancelAtPeriodEnd;

  if (isLoading) {
    return (
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <PricingCardSkeleton />
            <PricingCardSkeleton />
            <PricingCardSkeleton />
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <Tabs defaultValue="plans" className="space-y-6">
      <TabsList>
        <TabsTrigger value="plans">Plans</TabsTrigger>
        {hasSubscription && <TabsTrigger value="current">Current Plan</TabsTrigger>}
      </TabsList>

      <TabsContent value="plans" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {Object.entries(PLAN_DETAILS).map(([key, plan]) => {
            const isCurrentPlan = currentTier === key;
            const isPlanPopular = (plan as any).popular;

            return (
              <Card 
                key={key}
                className={isPlanPopular ? "border-primary relative" : "relative"}
              >
                {isPlanPopular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="px-3">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="space-y-4 pt-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      {isCurrentPlan && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {key === "BASIC" ? "Essential features" : key === "PROFESSIONAL" ? "Advanced capabilities" : "Complete solution"}
                    </CardDescription>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground">billed monthly</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Separator />
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled variant="outline" size="lg" className="w-full">
                      Current Plan
                    </Button>
                  ) : hasSubscription ? (
                    <Button
                      onClick={() => handleChangePlan(key)}
                      disabled={actionLoading === key}
                      variant={isPlanPopular ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                    >
                      {actionLoading === key ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Switch to ${plan.name}`
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStartTrial(key)}
                      disabled={actionLoading === key}
                      variant={isPlanPopular ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                    >
                      {actionLoading === key ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        `Get ${plan.name} plan`
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">14-day free trial</p>
                  <p className="text-xs text-muted-foreground">No credit card required</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                  <Info className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Change anytime</p>
                  <p className="text-xs text-muted-foreground">Flexible plan switching</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Cancel anytime</p>
                  <p className="text-xs text-muted-foreground">No commitments</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {hasSubscription && (
        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Active Subscription</CardTitle>
                  <CardDescription>
                    {PLAN_DETAILS[currentTier as keyof typeof PLAN_DETAILS]?.name} plan
                  </CardDescription>
                </div>
                <Badge variant={currentStatus === "active" ? "default" : currentStatus === "trialing" ? "secondary" : "outline"}>
                  {currentStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Properties</span>
                  </div>
                  <span className="font-medium">
                    {subscription.subscription.propertyCount} of {subscription.subscription.propertyLimit}
                  </span>
                </div>
                <Progress value={subscription.subscription.propertyUsage} className="h-2" />
              </div>

              {currentStatus === "trialing" && subscription.subscription.trialEnd && (
                <>
                  <Separator />
                  <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
                    <Zap className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Trial ends {new Date(subscription.subscription.trialEnd).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Add payment method to continue
                      </p>
                    </div>
                  </div>
                </>
              )}

              {isCanceling && (
                <>
                  <Separator />
                  <div className="flex gap-3 rounded-lg border p-4">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Subscription ending</p>
                      <p className="text-xs text-muted-foreground">
                        {currentStatus === "trialing" && subscription.subscription.trialEnd
                          ? `Trial access until ${new Date(subscription.subscription.trialEnd).toLocaleDateString()}`
                          : subscription.subscription.currentPeriodEnd
                          ? `Access until ${new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}`
                          : "Access ending soon"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                onClick={handleBillingPortal}
                disabled={actionLoading === "billing"}
                variant="outline"
                className="flex-1"
              >
                {actionLoading === "billing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                  </>
                )}
              </Button>

              {isCanceling ? (
                <Button
                  onClick={handleReactivateSubscription}
                  disabled={actionLoading === "reactivate"}
                  className="flex-1"
                >
                  {actionLoading === "reactivate" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Reactivate Plan"
                  )}
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      Cancel Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You'll retain access until the end of your billing period. No refunds for partial months.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {actionLoading === "cancel" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Confirm cancellation"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}