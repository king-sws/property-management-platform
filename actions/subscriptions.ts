/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/subscriptions.ts - FIXED VERSION
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  createStripeCustomer,
  createSubscription,
  createSetupIntent,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscription,
  createBillingPortalSession,
  SUBSCRIPTION_PLANS,
} from "@/services/stripe";
import {
  SubscriptionTier,
  SubscriptionStatus,
  ActivityType,
  UserRole,
} from "@/lib/generated/prisma/enums";
import type Stripe from "stripe";

// -------------------------
// Validation Schemas
// -------------------------
const startTrialSchema = z.object({
  tier: z.enum(["BASIC", "PROFESSIONAL", "PREMIUM"]),
});

const upgradeSubscriptionSchema = z.object({
  tier: z.enum(["BASIC", "PROFESSIONAL", "PREMIUM"]),
});

// -------------------------
// Types
// -------------------------
type SubscriptionResult = {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
};

// -------------------------
// Helper Functions
// -------------------------
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

function getTierPropertyLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case SubscriptionTier.BASIC:
      return 5;
    case SubscriptionTier.PROFESSIONAL:
      return 10;
    case SubscriptionTier.PREMIUM:
      return 20;
    case SubscriptionTier.ENTERPRISE:
      return 999;
    default:
      return 5;
  }
}

/**
 * ✅ FIXED: Proper trial detection
 * A subscription is in trial ONLY if:
 * 1. Stripe status is "trialing"
 * 2. Trial end date exists and is in the future
 * 3. No successful payment has been made (amount_paid = 0 or status != paid)
 */
function isActuallyInTrial(subscription: Stripe.Subscription): boolean {
  // Must have trialing status
  if (subscription.status !== "trialing") {
    return false;
  }
  
  // Must have valid future trial end date
  const now = Math.floor(Date.now() / 1000);
  const trialEnd = subscription.trial_end || 0;
  
  if (trialEnd <= now) {
    return false;
  }
  
  // Check if any payment has been made
  const latestInvoice = subscription.latest_invoice;
  
  if (!latestInvoice) {
    return true; // No invoice = still in trial
  }
  
  // If latest_invoice is expanded (object)
  if (typeof latestInvoice === 'object') {
    // ✅ FIX: Use 'status' instead of 'paid'
    const isPaidInvoice = latestInvoice.status === 'paid' && 
                          (latestInvoice.amount_paid || 0) > 0;
    
    if (isPaidInvoice) {
      return false; // Payment made = trial converted
    }
    
    // If invoice is $0 (common for trial start), still in trial
    if ((latestInvoice.amount_paid || 0) === 0 || 
        (latestInvoice.total || 0) === 0) {
      return true;
    }
  }
  
  return true;
}

/**
 * ✅ FIXED: Map Stripe status to our status with proper trial handling
 */
function mapStripeStatusToOurs(
  subscription: Stripe.Subscription
): SubscriptionStatus {
  // Check trial first
  if (isActuallyInTrial(subscription)) {
    return SubscriptionStatus.TRIAL;
  }
  
  // Map other statuses
  switch (subscription.status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    case "incomplete":
      return SubscriptionStatus.INACTIVE;
    case "incomplete_expired":
      return SubscriptionStatus.CANCELED;
    case "paused":
      return SubscriptionStatus.PAUSED;
    case "unpaid":
      return SubscriptionStatus.PAST_DUE;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}

/**
 * ✅ FIXED: Safe date conversion with null handling
 */
function safeUnixToDate(unixTimestamp: number | null | undefined): Date | null {
  if (!unixTimestamp || unixTimestamp === 0) {
    return null;
  }
  
  // Validate timestamp is reasonable (after year 2000)
  const year2000 = 946684800; // Jan 1, 2000 in Unix time
  if (unixTimestamp < year2000) {
    console.warn(`Invalid timestamp detected: ${unixTimestamp}`);
    return null;
  }
  
  return new Date(unixTimestamp * 1000);
}

// -------------------------
// Start Free Trial (14 days)
// -------------------------
export async function startFreeTrial(
  data: z.infer<typeof startTrialSchema>
): Promise<SubscriptionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Only landlords can start trials" };
    }

    const validated = startTrialSchema.parse(data);

    const landlord = await prisma.landlord.findUnique({
      where: { userId: currentUser.id },
      include: { user: true },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    // Check if already has an active subscription
    if (
      landlord.stripeSubscriptionId &&
      (landlord.subscriptionStatus === SubscriptionStatus.ACTIVE ||
       landlord.subscriptionStatus === SubscriptionStatus.TRIAL)
    ) {
      return {
        success: false,
        error: "You already have an active subscription",
      };
    }

    // Check if trial was already used
    if (landlord.trialUsed) {
      return {
        success: false,
        error: "Free trial has already been used for this account",
      };
    }

    let stripeCustomerId = landlord.stripeCustomerId;
    let subscriptionResult;

    try {
      // Create Stripe customer if doesn't exist
      if (!stripeCustomerId) {
        console.log("Creating Stripe customer for landlord:", landlord.id);
        
        const customerResult = await createStripeCustomer(
          landlord.user.email,
          landlord.user.name || "Landlord",
          {
            landlordId: landlord.id,
            userId: currentUser.id,
          }
        );

        if (!customerResult.success || !customerResult.customer) {
          console.error("Failed to create Stripe customer:", customerResult);
          return {
            success: false,
            error: "Failed to create customer account. Please try again.",
          };
        }

        stripeCustomerId = customerResult.customer.id;
        
        // Save customer ID immediately
        await prisma.landlord.update({
          where: { id: landlord.id },
          data: { stripeCustomerId },
        });
        
        console.log("Stripe customer created:", stripeCustomerId);
      }

      // Get price ID for selected tier
      const priceId =
        SUBSCRIPTION_PLANS[validated.tier as keyof typeof SUBSCRIPTION_PLANS]
          .priceId;

      console.log("Creating subscription with:", {
        customerId: stripeCustomerId,
        priceId,
        tier: validated.tier,
      });

      // Create subscription with 14-day trial
      subscriptionResult = await createSubscription(
        stripeCustomerId,
        priceId,
        14
      );

      if (!subscriptionResult.success || !subscriptionResult.subscription) {
        console.error("Failed to create subscription:", subscriptionResult);
        return { 
          success: false, 
          error: "Failed to create subscription. Please try again or contact support." 
        };
      }

      console.log("Subscription created successfully:", subscriptionResult.subscription.id);

    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      return {
        success: false,
        error: "Failed to connect to payment provider. Please try again.",
      };
    }

    const subscription = subscriptionResult.subscription;

    // ✅ FIXED: Use safe date conversion
    const trialEndsAt = safeUnixToDate(subscription.trial_end);
    const currentPeriodEnd = safeUnixToDate(subscription.current_period_end);

    // ✅ FIXED: Validate dates before saving
    if (!trialEndsAt) {
      console.error("Trial end date is invalid");
      return {
        success: false,
        error: "Failed to set up trial period. Please contact support.",
      };
    }

    // Update landlord in database
    try {
      await prisma.landlord.update({
        where: { id: landlord.id },
        data: {
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          subscriptionTier: validated.tier as SubscriptionTier,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          propertyLimit: getTierPropertyLimit(validated.tier as SubscriptionTier),
          trialEndsAt,
          trialUsed: true,
          currentPeriodEnd: currentPeriodEnd || trialEndsAt,
        },
      });

      console.log("Database updated successfully");

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: currentUser.id,
          type: ActivityType.USER_LOGIN,
          action: `Started ${validated.tier} plan trial`,
          metadata: {
            subscriptionId: subscription.id,
            tier: validated.tier,
            trialEndsAt: trialEndsAt.toISOString(),
          },
        },
      });

      // Create setup intent for adding payment method
      const setupIntentResult = await createSetupIntent(stripeCustomerId);

      revalidatePath("/dashboard/settings/subscription");
      revalidatePath("/dashboard");

      return {
        success: true,
        data: {
          subscriptionId: subscription.id,
          tier: validated.tier,
          trialEndsAt: trialEndsAt.toISOString(),
          setupIntent: setupIntentResult.setupIntent,
        },
        message: "🎉 Trial started! You have 14 days free. Add payment method to continue after trial.",
      };

    } catch (dbError) {
      console.error("Database update error:", dbError);
      
      // Try to cancel the Stripe subscription since DB update failed
      try {
        await cancelSubscription(subscription.id, true);
      } catch (cancelError) {
        console.error("Failed to cancel subscription after DB error:", cancelError);
      }
      
      return {
        success: false,
        error: "Failed to save subscription. Please contact support.",
      };
    }

  } catch (error) {
    console.error("Start trial error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return { success: false, error: "Failed to start trial. Please try again." };
  }
}

// -------------------------
// Get Current Subscription
// -------------------------
export async function getCurrentSubscription(): Promise<any> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: currentUser.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    if (!landlord.stripeSubscriptionId) {
      return {
        success: true,
        data: {
          hasSubscription: false,
          canStartTrial: !landlord.trialUsed,
          availablePlans: SUBSCRIPTION_PLANS,
        },
      };
    }

    // Get subscription from Stripe
    const subscriptionResult = await getSubscription(
      landlord.stripeSubscriptionId
    );

    if (!subscriptionResult.success || !subscriptionResult.subscription) {
      console.error("Failed to fetch subscription from Stripe");
      
      // Return database data as fallback
      return {
        success: true,
        data: {
          hasSubscription: true,
          subscription: {
            id: landlord.stripeSubscriptionId,
            status: landlord.subscriptionStatus,
            tier: landlord.subscriptionTier,
            currentPeriodEnd: landlord.currentPeriodEnd?.toISOString() || null,
            trialEnd: landlord.trialEndsAt?.toISOString() || null,
            isTrialing: landlord.subscriptionStatus === SubscriptionStatus.TRIAL,
            propertyLimit: landlord.propertyLimit,
            propertyCount: 0,
            propertyUsage: 0,
            needsSync: true,
          },
          availablePlans: SUBSCRIPTION_PLANS,
        },
      };
    }

    const subscription = subscriptionResult.subscription;

    // ✅ FIXED: Use safe date conversion
    const currentPeriodEnd = safeUnixToDate(subscription.current_period_end);
    const trialEnd = safeUnixToDate(subscription.trial_end);

    // ✅ FIXED: Use correct trial detection
    const isTrialing = isActuallyInTrial(subscription);
    const correctStatus = mapStripeStatusToOurs(subscription);

    // Sync database if needed
    const needsSync = 
      landlord.subscriptionStatus !== correctStatus ||
      (isTrialing && !landlord.trialEndsAt) ||
      (!currentPeriodEnd && landlord.currentPeriodEnd) ||
      (currentPeriodEnd && landlord.currentPeriodEnd && 
       Math.abs(currentPeriodEnd.getTime() - landlord.currentPeriodEnd.getTime()) > 60000);

    if (needsSync) {
      await prisma.landlord.update({
        where: { id: landlord.id },
        data: {
          subscriptionStatus: correctStatus,
          trialEndsAt: isTrialing ? trialEnd : null,
          currentPeriodEnd: currentPeriodEnd,
        },
      });
    }

    // Count properties
    const propertyCount = await prisma.property.count({
      where: {
        landlordId: landlord.id,
        deletedAt: null,
      },
    });

    return {
      success: true,
      data: {
        hasSubscription: true,
        subscription: {
          id: subscription.id,
          status: correctStatus.toLowerCase(),
          stripeStatus: subscription.status,
          tier: landlord.subscriptionTier,
          currentPeriodEnd: currentPeriodEnd?.toISOString() || null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: isTrialing && trialEnd ? trialEnd.toISOString() : null,
          isTrialing: isTrialing,
          propertyLimit: landlord.propertyLimit,
          propertyCount,
          propertyUsage: (propertyCount / landlord.propertyLimit) * 100,
        },
        availablePlans: SUBSCRIPTION_PLANS,
      },
    };
  } catch (error) {
    console.error("Get current subscription error:", error);
    return { success: false, error: "Failed to fetch subscription" };
  }
}

// -------------------------
// Change Subscription Tier
// -------------------------
export async function changeSubscriptionTier(
  data: z.infer<typeof upgradeSubscriptionSchema>
): Promise<SubscriptionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = upgradeSubscriptionSchema.parse(data);

    const landlord = await prisma.landlord.findUnique({
      where: { userId: currentUser.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    if (!landlord.stripeSubscriptionId) {
      return {
        success: false,
        error: "No active subscription found. Start a trial first.",
      };
    }

    // Check if downgrading would exceed property limit
    if (validated.tier !== landlord.subscriptionTier) {
      const newLimit = getTierPropertyLimit(validated.tier as SubscriptionTier);
      const propertyCount = await prisma.property.count({
        where: {
          landlordId: landlord.id,
          deletedAt: null,
        },
      });

      if (propertyCount > newLimit) {
        return {
          success: false,
          error: `Cannot downgrade. You have ${propertyCount} properties but ${validated.tier} plan only allows ${newLimit}.`,
        };
      }
    }

    // Get new price ID
    const newPriceId =
      SUBSCRIPTION_PLANS[validated.tier as keyof typeof SUBSCRIPTION_PLANS]
        .priceId;

    // Get current subscription status
    const currentSubResult = await getSubscription(landlord.stripeSubscriptionId);
    if (!currentSubResult.success || !currentSubResult.subscription) {
      return { success: false, error: "Failed to retrieve current subscription" };
    }

    const currentSub = currentSubResult.subscription;
    const wasInTrial = isActuallyInTrial(currentSub);

    // Update subscription in Stripe
    const updateResult = await updateSubscription(
      landlord.stripeSubscriptionId,
      newPriceId
    );

    if (!updateResult.success || !updateResult.subscription) {
      return { success: false, error: "Failed to update subscription" };
    }

    const updatedSub = updateResult.subscription;

    // ✅ FIXED: Check trial status after update
    const isStillInTrial = isActuallyInTrial(updatedSub);
    const newStatus = mapStripeStatusToOurs(updatedSub);

    // ✅ FIXED: Use safe date conversion
    const currentPeriodEnd = safeUnixToDate(updatedSub.current_period_end);
    const trialEnd = safeUnixToDate(updatedSub.trial_end);

    // Update landlord in database
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionTier: validated.tier as SubscriptionTier,
        propertyLimit: getTierPropertyLimit(validated.tier as SubscriptionTier),
        subscriptionStatus: newStatus,
        trialEndsAt: isStillInTrial ? trialEnd : null,
        currentPeriodEnd: currentPeriodEnd,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.USER_LOGIN,
        action: wasInTrial && !isStillInTrial
          ? `Upgraded from ${landlord.subscriptionTier} to ${validated.tier} (converted from trial)`
          : `Changed subscription from ${landlord.subscriptionTier} to ${validated.tier}`,
        metadata: {
          oldTier: landlord.subscriptionTier,
          newTier: validated.tier,
          wasInTrial,
          isStillInTrial,
        },
      },
    });

    revalidatePath("/dashboard/settings/subscription");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: wasInTrial && !isStillInTrial
        ? `Successfully upgraded to ${validated.tier} plan! Your trial has been converted to a paid subscription.`
        : `Successfully changed to ${validated.tier} plan`,
    };
  } catch (error) {
    console.error("Change subscription tier error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return { success: false, error: "Failed to change subscription" };
  }
}

// -------------------------
// Cancel Subscription
// -------------------------
export async function cancelCurrentSubscription(
  immediately: boolean = false
): Promise<SubscriptionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: currentUser.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    if (!landlord.stripeSubscriptionId) {
      return { success: false, error: "No active subscription found" };
    }

    // Cancel subscription in Stripe
    const cancelResult = await cancelSubscription(
      landlord.stripeSubscriptionId,
      immediately
    );

    if (!cancelResult.success) {
      return { success: false, error: "Failed to cancel subscription" };
    }

    // Update landlord status
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: immediately
          ? SubscriptionStatus.CANCELED
          : landlord.subscriptionStatus, // Keep current status until period end
        trialEndsAt: immediately ? null : landlord.trialEndsAt,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.USER_LOGIN,
        action: immediately
          ? "Canceled subscription immediately"
          : "Scheduled subscription cancellation",
      },
    });

    revalidatePath("/dashboard/settings/subscription");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: immediately
        ? "Subscription canceled immediately"
        : "Subscription will cancel at the end of the billing period",
    };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}

// -------------------------
// Reactivate Subscription
// -------------------------
export async function reactivateCurrentSubscription(): Promise<SubscriptionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: currentUser.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    if (!landlord.stripeSubscriptionId) {
      return { success: false, error: "No subscription found" };
    }

    // Reactivate in Stripe
    const reactivateResult = await reactivateSubscription(
      landlord.stripeSubscriptionId
    );

    if (!reactivateResult.success) {
      return { success: false, error: "Failed to reactivate subscription" };
    }

    // Get updated subscription to determine correct status
    const subResult = await getSubscription(landlord.stripeSubscriptionId);
    const newStatus = subResult.success && subResult.subscription
      ? mapStripeStatusToOurs(subResult.subscription)
      : SubscriptionStatus.ACTIVE;

    // Update landlord status
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: newStatus,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.USER_LOGIN,
        action: "Reactivated subscription",
      },
    });

    revalidatePath("/dashboard/settings/subscription");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Subscription reactivated successfully",
    };
  } catch (error) {
    console.error("Reactivate subscription error:", error);
    return { success: false, error: "Failed to reactivate subscription" };
  }
}

// -------------------------
// Get Billing Portal URL
// -------------------------
export async function getBillingPortalUrl(): Promise<SubscriptionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: currentUser.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    if (!landlord.stripeCustomerId) {
      return { success: false, error: "No billing account found" };
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/subscription`;

    const result = await createBillingPortalSession(
      landlord.stripeCustomerId,
      returnUrl
    );

    if (!result.success) {
      return { success: false, error: "Failed to create billing portal" };
    }

    return {
      success: true,
      data: { url: result.url },
    };
  } catch (error) {
    console.error("Get billing portal URL error:", error);
    return { success: false, error: "Failed to get billing portal" };
  }
}

// -------------------------
// Check if can add property
// -------------------------
export async function canAddProperty(): Promise<SubscriptionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: currentUser.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    const propertyCount = await prisma.property.count({
      where: {
        landlordId: landlord.id,
        deletedAt: null,
      },
    });

    const canAdd = propertyCount < landlord.propertyLimit;

    return {
      success: true,
      data: {
        canAdd,
        currentCount: propertyCount,
        limit: landlord.propertyLimit,
        tier: landlord.subscriptionTier,
      },
    };
  } catch (error) {
    console.error("Can add property error:", error);
    return { success: false, error: "Failed to check property limit" };
  }
}

// -------------------------
// Sync Subscription Status
// -------------------------
export async function syncSubscriptionStatus(): Promise<any> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: currentUser.id },
    });

    if (!landlord?.stripeSubscriptionId) {
      return { success: false, error: "No subscription found" };
    }

    // Get latest from Stripe
    const subscriptionResult = await getSubscription(
      landlord.stripeSubscriptionId
    );

    if (!subscriptionResult.success || !subscriptionResult.subscription) {
      return { success: false, error: "Failed to fetch subscription" };
    }

    const subscription = subscriptionResult.subscription;
    
    // ✅ FIXED: Use correct detection functions
    const isTrialing = isActuallyInTrial(subscription);
    const correctStatus = mapStripeStatusToOurs(subscription);
    
    // ✅ FIXED: Use safe date conversion
    const currentPeriodEnd = safeUnixToDate(subscription.current_period_end);
    const trialEnd = safeUnixToDate(subscription.trial_end);

    // Update if status is different
    if (landlord.subscriptionStatus !== correctStatus) {
      await prisma.landlord.update({
        where: { id: landlord.id },
        data: {
          subscriptionStatus: correctStatus,
          trialEndsAt: isTrialing ? trialEnd : null,
          currentPeriodEnd: currentPeriodEnd,
        },
      });

      revalidatePath("/dashboard/settings/subscription");
      revalidatePath("/dashboard");

      return {
        success: true,
        message: "Subscription status synced successfully",
        data: {
          oldStatus: landlord.subscriptionStatus,
          newStatus: correctStatus,
        },
      };
    }

    return {
      success: true,
      message: "Subscription status is already up to date",
    };
  } catch (error) {
    console.error("Sync subscription status error:", error);
    return { success: false, error: "Failed to sync subscription status" };
  }
}