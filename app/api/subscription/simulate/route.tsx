/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/subscription/simulate/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/services/stripe";
import { SubscriptionStatus, UserRole } from "@/lib/generated/prisma/enums";

/**
 * SUBSCRIPTION SIMULATOR API
 * Handles all test actions for subscription scenarios
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== UserRole.LANDLORD) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return NextResponse.json(
        { success: false, error: "Landlord profile not found" },
        { status: 404 }
      );
    }

    if (!landlord.stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: "No subscription found" },
        { status: 404 }
      );
    }

    // Route to appropriate handler
    switch (action) {
      case 'end-trial-no-payment':
        return await handleEndTrialNoPayment(landlord);
      
      case 'end-trial-with-payment':
        return await handleEndTrialWithPayment(landlord);
      
      case 'end-trial-payment-failed':
        return await handleEndTrialPaymentFailed(landlord);
      
      case 'simulate-payment-success':
        return await handleSimulatePaymentSuccess(landlord);
      
      case 'simulate-payment-failed':
        return await handleSimulatePaymentFailed(landlord);
      
      case 'simulate-past-due':
        return await handleSimulatePastDue(landlord);
      
      case 'webhook-subscription-updated':
        return await handleWebhookSubscriptionUpdated(landlord);
      
      case 'webhook-trial-will-end':
        return await handleWebhookTrialWillEnd(landlord);
      
      case 'force-sync':
        return await handleForceSync(landlord);
      
      case 'set-active':
        return await handleSetActive(landlord);
      
      case 'set-canceled':
        return await handleSetCanceled(landlord);
      
      case 'reset-to-trial':
        return await handleResetToTrial(landlord);
      
      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Simulator API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// TRIAL ENDING SCENARIOS
// ============================================================================

async function handleEndTrialNoPayment(landlord: any) {
  try {
    // End trial in Stripe without payment method
    await stripe.subscriptions.update(landlord.stripeSubscriptionId, {
      trial_end: 'now', // End trial immediately
    });

    // Wait a moment for Stripe to process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get updated subscription
    const subscription = await stripe.subscriptions.retrieve(
      landlord.stripeSubscriptionId
    );

    // Update database
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
        trialEndsAt: null,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: landlord.userId,
        type: "PAYMENT_FAILED",
        channel: "IN_APP",
        title: "Trial Ended - Payment Required",
        message: "Your trial has ended. Please add a payment method to continue using the service.",
        actionUrl: "/dashboard/settings/subscription",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trial ended without payment. Subscription is now PAST_DUE.",
      data: {
        newStatus: SubscriptionStatus.PAST_DUE,
        stripeStatus: subscription.status,
      },
    });
  } catch (error: any) {
    console.error("End trial no payment error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to end trial",
    });
  }
}

async function handleEndTrialWithPayment(landlord: any) {
  try {
    // First, attach a test payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Test token
      },
    });

    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: landlord.stripeCustomerId,
    });

    // Set as default
    await stripe.customers.update(landlord.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // End trial - Stripe will charge automatically
    await stripe.subscriptions.update(landlord.stripeSubscriptionId, {
      trial_end: 'now',
    });

    // Wait for Stripe to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get updated subscription
    const subscription = await stripe.subscriptions.retrieve(
      landlord.stripeSubscriptionId
    );

    // Update database
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        trialEndsAt: null,
      },
    });

    // Create success notification
    await prisma.notification.create({
      data: {
        userId: landlord.userId,
        type: "PAYMENT_RECEIVED",
        channel: "IN_APP",
        title: "Welcome to Your Paid Subscription!",
        message: `Your trial has been successfully converted to a ${landlord.subscriptionTier} subscription.`,
        actionUrl: "/dashboard/settings/subscription",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trial ended with successful payment. Subscription is now ACTIVE.",
      data: {
        newStatus: SubscriptionStatus.ACTIVE,
        stripeStatus: subscription.status,
        paymentMethodAdded: true,
      },
    });
  } catch (error: any) {
    console.error("End trial with payment error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to process payment",
    });
  }
}

async function handleEndTrialPaymentFailed(landlord: any) {
  try {
    // Attach a test card that will be declined
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_chargeDeclined', // Test token for declined payment
      },
    });

    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: landlord.stripeCustomerId,
    });

    await stripe.customers.update(landlord.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // End trial - payment will fail
    await stripe.subscriptions.update(landlord.stripeSubscriptionId, {
      trial_end: 'now',
    });

    // Wait for Stripe to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get updated subscription (should be past_due)
    const subscription = await stripe.subscriptions.retrieve(
      landlord.stripeSubscriptionId
    );

    // Update database
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
        trialEndsAt: null,
      },
    });

    // Create failure notification
    await prisma.notification.create({
      data: {
        userId: landlord.userId,
        type: "PAYMENT_FAILED",
        channel: "IN_APP",
        title: "Payment Failed",
        message: "Your trial has ended but the payment failed. Please update your payment method.",
        actionUrl: "/dashboard/settings/subscription",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trial ended but payment failed. Subscription is PAST_DUE.",
      data: {
        newStatus: SubscriptionStatus.PAST_DUE,
        stripeStatus: subscription.status,
        paymentFailed: true,
      },
    });
  } catch (error: any) {
    console.error("End trial payment failed error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to simulate payment failure",
    });
  }
}

// ============================================================================
// PAYMENT SIMULATIONS
// ============================================================================

async function handleSimulatePaymentSuccess(landlord: any) {
  try {
    // Update to active
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        trialEndsAt: null,
      },
    });

    await prisma.notification.create({
      data: {
        userId: landlord.userId,
        type: "PAYMENT_RECEIVED",
        channel: "IN_APP",
        title: "Payment Successful",
        message: "Your payment has been received. Your subscription is active.",
        actionUrl: "/dashboard/settings/subscription",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment success simulated. Status set to ACTIVE.",
      data: { newStatus: SubscriptionStatus.ACTIVE },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to simulate payment success",
    });
  }
}

async function handleSimulatePaymentFailed(landlord: any) {
  try {
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
      },
    });

    await prisma.notification.create({
      data: {
        userId: landlord.userId,
        type: "PAYMENT_FAILED",
        channel: "IN_APP",
        title: "Payment Failed",
        message: "Your payment has failed. Please update your payment method.",
        actionUrl: "/dashboard/settings/subscription",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment failure simulated. Status set to PAST_DUE.",
      data: { newStatus: SubscriptionStatus.PAST_DUE },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to simulate payment failure",
    });
  }
}

async function handleSimulatePastDue(landlord: any) {
  try {
    await stripe.subscriptions.update(landlord.stripeSubscriptionId, {
      pause_collection: { behavior: 'mark_uncollectible' },
    });

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription set to PAST_DUE in both Stripe and database.",
      data: { newStatus: SubscriptionStatus.PAST_DUE },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to set past due status",
    });
  }
}

// ============================================================================
// WEBHOOK TESTING
// ============================================================================

async function handleWebhookSubscriptionUpdated(landlord: any) {
  try {
    const subscription = await stripe.subscriptions.retrieve(
      landlord.stripeSubscriptionId
    );

    // Manually trigger the webhook logic
    const now = Math.floor(Date.now() / 1000);
    const trialEnd = subscription.trial_end || 0;
    const isInActiveTrial = subscription.status === "trialing" && trialEnd > now;

    const status = isInActiveTrial 
      ? SubscriptionStatus.TRIAL 
      : SubscriptionStatus.ACTIVE;

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: { subscriptionStatus: status },
    });

    return NextResponse.json({
      success: true,
      message: "subscription.updated webhook logic executed",
      data: { newStatus: status, stripeStatus: subscription.status },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to trigger webhook",
    });
  }
}

async function handleWebhookTrialWillEnd(landlord: any) {
  try {
    const subscription = await stripe.subscriptions.retrieve(
      landlord.stripeSubscriptionId
    );

    if (subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end * 1000);
      const daysRemaining = Math.ceil(
        (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      await prisma.notification.create({
        data: {
          userId: landlord.userId,
          type: "SYSTEM",
          channel: "IN_APP",
          title: `Trial ending in ${daysRemaining} days`,
          message: `Your trial ends on ${trialEnd.toLocaleDateString()}. Add a payment method to continue.`,
          actionUrl: "/dashboard/settings/subscription",
        },
      });

      return NextResponse.json({
        success: true,
        message: "trial_will_end notification sent",
        data: { daysRemaining },
      });
    }

    return NextResponse.json({
      success: false,
      error: "Not in trial period",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to send notification",
    });
  }
}

async function handleForceSync(landlord: any) {
  try {
    const subscription = await stripe.subscriptions.retrieve(
      landlord.stripeSubscriptionId,
      { expand: ['latest_invoice', 'default_payment_method'] }
    );

    const now = Math.floor(Date.now() / 1000);
    const trialEnd = subscription.trial_end || 0;
    const isInActiveTrial = subscription.status === "trialing" && trialEnd > now;

    let status: SubscriptionStatus;
    if (isInActiveTrial) {
      status = SubscriptionStatus.TRIAL;
    } else {
      switch (subscription.status) {
        case "active": status = SubscriptionStatus.ACTIVE; break;
        case "past_due": status = SubscriptionStatus.PAST_DUE; break;
        case "canceled": status = SubscriptionStatus.CANCELED; break;
        default: status = SubscriptionStatus.ACTIVE;
      }
    }

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: status,
        trialEndsAt: isInActiveTrial && trialEnd 
          ? new Date(trialEnd * 1000) 
          : null,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Synced from Stripe successfully",
      data: { 
        newStatus: status, 
        stripeStatus: subscription.status,
        isInActiveTrial,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to sync from Stripe",
    });
  }
}

// ============================================================================
// STATUS CHANGES
// ============================================================================

async function handleSetActive(landlord: any) {
  try {
    await stripe.subscriptions.update(landlord.stripeSubscriptionId, {
      trial_end: 'now',
    });

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        trialEndsAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription set to ACTIVE",
      data: { newStatus: SubscriptionStatus.ACTIVE },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to set active",
    });
  }
}

async function handleSetCanceled(landlord: any) {
  try {
    await stripe.subscriptions.update(landlord.stripeSubscriptionId, {
      cancel_at_period_end: false,
      cancel_at: Math.floor(Date.now() / 1000),
    });

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELED,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription CANCELED",
      data: { newStatus: SubscriptionStatus.CANCELED },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to cancel",
    });
  }
}

async function handleResetToTrial(landlord: any) {
  try {
    // This is for testing only - extends trial by 14 days
    const newTrialEnd = Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60);
    
    await stripe.subscriptions.update(landlord.stripeSubscriptionId, {
      trial_end: newTrialEnd,
    });

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: new Date(newTrialEnd * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reset to TRIAL with 14 more days",
      data: { 
        newStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: new Date(newTrialEnd * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to reset to trial",
    });
  }
}

// ============================================================================
// GET CURRENT SUBSCRIPTION (for the UI)
// ============================================================================
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord || !landlord.stripeSubscriptionId) {
      return NextResponse.json({
        success: true,
        data: { 
          hasSubscription: false,
          needsSetup: !!landlord?.stripeCustomerId, // Has customer but no subscription
          canStartTrial: !landlord?.trialUsed
        },
      });
    }


    const subscription = await stripe.subscriptions.retrieve(
      landlord.stripeSubscriptionId
    );

    const propertyCount = await prisma.property.count({
      where: { landlordId: landlord.id, deletedAt: null },
    });

    const now = Math.floor(Date.now() / 1000);
    const trialEnd = subscription.trial_end || 0;
    const isTrialing = subscription.status === "trialing" && trialEnd > now;

    return NextResponse.json({
      success: true,
      data: {
        hasSubscription: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          tier: landlord.subscriptionTier,
          isTrialing,
          trialEnd: trialEnd > 0 ? new Date(trialEnd * 1000).toISOString() : null,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          propertyCount,
          propertyLimit: landlord.propertyLimit,
        },
      },
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}