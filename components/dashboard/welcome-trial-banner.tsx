/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/welcome-trial-banner.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight, CreditCard, Home, FileText, Calendar, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";
import { getCurrentSubscription } from "@/actions/subscriptions";

export function WelcomeTrialBanner() {
  const [subscription, setSubscription] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was already dismissed
    const dismissed = localStorage.getItem("welcomeBannerDismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const result = await getCurrentSubscription();
      if (result.success && result.data?.subscription) {
        const sub = result.data.subscription;
        
        // Only show banner if:
        // 1. User is in trial
        // 2. Has more than 7 days left (not ending soon)
        // 3. Created account recently (within last 3 days)
        const trialDaysLeft = sub.trialEnd 
          ? Math.ceil((new Date(sub.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0;
        
        const shouldShow = sub.isTrialing && trialDaysLeft > 7;
        
        setSubscription(result.data);
        setIsVisible(shouldShow);
      }
    } catch (error) {
      console.error("Load subscription error:", error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("welcomeBannerDismissed", "true");
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible || isDismissed || !subscription?.subscription) {
    return null;
  }

  const sub = subscription.subscription;
  const trialDaysLeft = sub.trialEnd 
    ? Math.ceil((new Date(sub.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card className="relative border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/20 to-blue-50/20 dark:from-emerald-950/10 dark:to-blue-950/10">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Welcome to Your {sub.tier} Free Trial!
        </CardTitle>
        <CardDescription>
          Your trial gives you full access to all premium features
        </CardDescription>
        
        {/* Trial Stats - Similar to PaymentChart summary */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="space-y-1 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Trial Days Left</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-simibold text-emerald-600 dark:text-emerald-400">
                {trialDaysLeft}
              </p>
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          
          <div className="space-y-1 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Current Plan</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-simibold text-blue-600 dark:text-blue-400">
                {sub.tier}
              </p>
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="space-y-1 p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
            <p className="text-xs text-violet-700 dark:text-violet-400 font-medium">Status</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-simibold text-violet-600 dark:text-violet-400">
                Active
              </p>
              <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features Grid */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">What&rsquo;s included in your trial:</p>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm">Unlimited property listings and management</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm">Advanced analytics and reporting tools</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded">
                <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm">Priority customer support and assistance</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Get started:</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/dashboard/properties/new">
              <Button variant="outline" size="sm" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
            <Link href="/dashboard/settings/subscription">
              <Button variant="outline" size="sm" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </Link>
            <Link href="/dashboard/help">
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                View Guide
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Info Bar - Similar to PaymentChart bottom stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded">
              <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trial Ends</p>
              <p className="text-sm font-semibold">
                {new Date(sub.trialEnd).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded">
              <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <Link href="/dashboard/settings/subscription" className="hover:underline">
                <p className="text-xs text-muted-foreground">Next Step</p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  View Plans
                </p>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}