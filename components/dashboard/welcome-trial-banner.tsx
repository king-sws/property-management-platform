/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/welcome-trial-banner.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight, CreditCard, Home, FileText } from "lucide-react";
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
    <Card className="relative overflow-hidden border-primary/50 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
      <CardContent className="p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3 shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                🎉 Welcome to Your {sub.tier} Free Trial!
              </h3>
              <p className="text-muted-foreground">
                Your {trialDaysLeft}-day free trial has started. You have full access to all premium features. 
                Get started by adding your first property!
              </p>
            </div>

            {/* Quick Actions */}
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

            {/* Trial Info */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Trial ends {new Date(sub.trialEnd).toLocaleDateString()}
              </div>
              <Link href="/dashboard/settings/subscription">
                <Button variant="link" size="sm" className="h-auto p-0">
                  View Plans
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}