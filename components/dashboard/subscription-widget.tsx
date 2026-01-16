/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/subscription-widget.tsx - FIXED
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Zap, 
  AlertTriangle,
  Loader2,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { getCurrentSubscription } from "@/actions/subscriptions";
import Link from "next/link";

function calculateDaysRemaining(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date.getTime() > 946684800000; // After Jan 1, 2000
}

export function SubscriptionWidget() {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription?.hasSubscription) {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle>Subscription Setup Issue</CardTitle>
          </div>
          <CardDescription>
            There was an issue setting up your subscription. Please contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/settings/subscription">
              View Subscription Settings
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sub = subscription.subscription;
  
  const isTrialing = sub.isTrialing === true;
  const isCanceling = sub.cancelAtPeriodEnd;
  const nearingLimit = sub.propertyUsage > 80;
  
  // ✅ FIX: Validate dates before using them
  const hasValidTrialEnd = isValidDate(sub.trialEnd);
  const hasValidPeriodEnd = isValidDate(sub.currentPeriodEnd);
  
  // Determine which date to display
  const displayDate = isTrialing && hasValidTrialEnd
    ? sub.trialEnd
    : hasValidPeriodEnd
    ? sub.currentPeriodEnd
    : null;
  
  const trialDaysRemaining = isTrialing && hasValidTrialEnd
    ? calculateDaysRemaining(sub.trialEnd)
    : 0;

  const isTrialEndingSoon = isTrialing && trialDaysRemaining <= 3 && trialDaysRemaining > 0;

  // Get display status
  const getStatusBadge = () => {
    if (isTrialing) {
      return {
        variant: "secondary" as const,
        text: `Trial (${trialDaysRemaining}d left)`,
        icon: Clock
      };
    }
    if (isCanceling) {
      return {
        variant: "destructive" as const,
        text: "Canceling",
        icon: AlertTriangle
      };
    }
    return {
      variant: "default" as const,
      text: sub.status === 'active' ? "Active" : sub.status,
      icon: CheckCircle2
    };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <Card className={
      isTrialEndingSoon ? "border-orange-500" : 
      nearingLimit ? "border-yellow-500" : 
      ""
    }>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">
              {sub.tier} Plan
            </CardTitle>
          </div>
          <Badge variant={statusBadge.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusBadge.text}
          </Badge>
        </div>
        <CardDescription>
          {isTrialing && hasValidTrialEnd && (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Trial ends {new Date(sub.trialEnd).toLocaleDateString()}
              </span>
            </div>
          )}
          {!isTrialing && !isCanceling && displayDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Renews {new Date(displayDate).toLocaleDateString()}</span>
            </div>
          )}
          {isCanceling && displayDate && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Ends {new Date(displayDate).toLocaleDateString()}</span>
            </div>
          )}
          {isCanceling && !displayDate && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Subscription ending</span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trial Ending Warning */}
        {isTrialEndingSoon && hasValidTrialEnd && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
            <div className="text-xs text-orange-800 dark:text-orange-200">
              <p className="font-medium">Trial ending in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}!</p>
              <p className="mt-1">
                Add a payment method now to continue with your {sub.tier} subscription after the trial.
              </p>
            </div>
          </div>
        )}

        {/* Trial Active Info */}
        {isTrialing && !isTrialEndingSoon && hasValidTrialEnd && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium">Free trial active - {trialDaysRemaining} days remaining</p>
              <p className="mt-1">
                You have full access to all {sub.tier} features. Add a payment method to continue after {new Date(sub.trialEnd).toLocaleDateString()}.
              </p>
            </div>
          </div>
        )}

        {/* Active Subscription Confirmation */}
        {!isTrialing && !isCanceling && sub.status === 'active' && hasValidPeriodEnd && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div className="text-xs text-green-800 dark:text-green-200">
              <p className="font-medium">Your subscription is active</p>
              <p className="mt-1">
                Next billing date: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Property Usage Warning */}
        {nearingLimit && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Approaching property limit</p>
              <p className="mt-1">Consider upgrading to add more properties.</p>
            </div>
          </div>
        )}

        {/* Cancellation Warning - FIXED */}
        {isCanceling && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <div className="text-xs text-red-800 dark:text-red-200">
              <p className="font-medium">Subscription ending</p>
              <p className="mt-1">
                {isTrialing && hasValidTrialEnd
                  ? `Your trial access ends on ${new Date(sub.trialEnd).toLocaleDateString()}.`
                  : displayDate
                  ? `Your subscription ends on ${new Date(displayDate).toLocaleDateString()}.`
                  : "Your subscription is ending soon."}
                {" "}Reactivate to keep access.
              </p>
            </div>
          </div>
        )}

        {/* Property Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Property Usage</span>
            <span className="text-muted-foreground">
              {sub.propertyCount} / {sub.propertyLimit}
            </span>
          </div>
          <Progress 
            value={sub.propertyUsage} 
            className={`h-2 ${nearingLimit ? "bg-yellow-100" : ""}`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/dashboard/settings/subscription">
              Manage Plan
            </Link>
          </Button>
          {(nearingLimit || isTrialing) && (
            <Button asChild size="sm" className="flex-1">
              <Link href="/dashboard/settings/subscription">
                <Zap className="mr-2 h-4 w-4" />
                {isTrialing ? "Add Payment" : "Upgrade"}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}