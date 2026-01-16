/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/webhooks/stripe/route.ts - FIXED VERSION
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { constructWebhookEvent } from "@/services/stripe";
import {
  SubscriptionStatus,
  PaymentStatus,
  ActivityType,
} from "@/lib/generated/prisma/enums";

/**
 * ✅ FIXED: Safe date conversion that never returns 1970
 */
function safeUnixToDate(unixTimestamp: number | null | undefined): Date | null {
  if (!unixTimestamp || unixTimestamp === 0) {
    return null;
  }
  
  // Validate timestamp is reasonable (after year 2000)
  const year2000 = 946684800;
  if (unixTimestamp < year2000) {
    console.warn(`Invalid timestamp detected: ${unixTimestamp}, returning null`);
    return null;
  }
  
  return new Date(unixTimestamp * 1000);
}

/**
 * ✅ FIXED: Proper trial detection
 */
function isActuallyInTrial(subscription: Stripe.Subscription): boolean {
  if (subscription.status !== "trialing") {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const trialEnd = subscription.trial_end || 0;
  
  if (trialEnd <= now) {
    return false;
  }
  
  const latestInvoice = subscription.latest_invoice;
  
  if (!latestInvoice) {
    return true;
  }
  
  if (typeof latestInvoice === 'object') {
    const isPaidInvoice = latestInvoice.status === 'paid' && 
                          (latestInvoice.amount_paid || 0) > 0;
    
    if (isPaidInvoice) {
      return false;
    }
    
    if ((latestInvoice.amount_paid || 0) === 0 || 
        (latestInvoice.total || 0) === 0) {
      return true;
    }
  }
  
  return true;
}

/**
 * ✅ FIXED: Map Stripe status to our status
 */
function mapStripeStatusToOurs(subscription: Stripe.Subscription): SubscriptionStatus {
  if (isActuallyInTrial(subscription)) {
    return SubscriptionStatus.TRIAL;
  }
  
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

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const result = await constructWebhookEvent(body, signature, webhookSecret);

    if (!result.success || !result.event) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = result.event;

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "invoice.upcoming":
        await handleInvoiceUpcoming(event.data.object as Stripe.Invoice);
        break;

      case "payment_method.attached":
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================================================
// SUBSCRIPTION EVENT HANDLERS
// ============================================================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    const landlord = await prisma.landlord.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!landlord) {
      console.error("Landlord not found for customer:", customerId);
      return;
    }

    // ✅ FIXED: Use safe date conversion
    const currentPeriodEnd = safeUnixToDate(subscription.current_period_end);
    const trialEnd = safeUnixToDate(subscription.trial_end);
    
    const isTrialing = isActuallyInTrial(subscription);
    const status = mapStripeStatusToOurs(subscription);

    // ✅ FIXED: Only update if we have valid dates
    const updateData: any = {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: status,
    };

    if (currentPeriodEnd) {
      updateData.currentPeriodEnd = currentPeriodEnd;
    }

    if (isTrialing && trialEnd) {
      updateData.trialEndsAt = trialEnd;
    }

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: updateData,
    });

    console.log("Subscription created:", subscription.id, {
      status,
      isTrialing,
      currentPeriodEnd: currentPeriodEnd?.toISOString() || "not set",
      trialEnd: trialEnd?.toISOString() || "not set",
    });
  } catch (error) {
    console.error("Handle subscription created error:", error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    const landlord = await prisma.landlord.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!landlord) {
      console.error("Landlord not found for customer:", customerId);
      return;
    }

    // ✅ FIXED: Use helper functions
    const isTrialing = isActuallyInTrial(subscription);
    const status = mapStripeStatusToOurs(subscription);
    
    // ✅ FIXED: Use safe date conversion
    const currentPeriodEnd = safeUnixToDate(subscription.current_period_end);
    const trialEnd = safeUnixToDate(subscription.trial_end);
    
    // Check if trial was converted
    const wasInTrial = landlord.subscriptionStatus === SubscriptionStatus.TRIAL;
    const isTrialConversion = wasInTrial && !isTrialing && status === SubscriptionStatus.ACTIVE;

    // ✅ FIXED: Build update data carefully
    const updateData: any = {
      subscriptionStatus: status,
    };

    // Only update dates if they're valid
    if (currentPeriodEnd) {
      updateData.currentPeriodEnd = currentPeriodEnd;
    }

    // Clear trial end if no longer in trial, set if in trial
    if (isTrialing && trialEnd) {
      updateData.trialEndsAt = trialEnd;
    } else if (!isTrialing) {
      updateData.trialEndsAt = null;
    }

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: updateData,
    });

    // If converting from trial to paid, send notification
    if (isTrialConversion) {
      await prisma.notification.create({
        data: {
          userId: landlord.userId,
          type: "SYSTEM",
          channel: "EMAIL",
          title: "Welcome to your paid subscription!",
          message: `Your trial has been successfully converted to a ${landlord.subscriptionTier} subscription. Thank you for choosing our platform!`,
          actionUrl: "/dashboard/settings/subscription",
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: landlord.userId,
          type: ActivityType.USER_LOGIN,
          action: "Trial converted to paid subscription",
          metadata: {
            subscriptionId: subscription.id,
            tier: landlord.subscriptionTier,
            convertedAt: new Date().toISOString(),
          },
        },
      });

      console.log("✅ Trial converted to paid subscription:", subscription.id);
    } else {
      await prisma.activityLog.create({
        data: {
          userId: landlord.userId,
          type: ActivityType.USER_LOGIN,
          action: "Subscription updated",
          metadata: {
            subscriptionId: subscription.id,
            oldStatus: landlord.subscriptionStatus,
            newStatus: status,
            isInTrial: isTrialing,
          },
        },
      });

      console.log("Subscription updated:", subscription.id, { 
        status,
        isTrialing,
        wasInTrial,
      });
    }
  } catch (error) {
    console.error("Handle subscription updated error:", error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    const landlord = await prisma.landlord.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!landlord) {
      console.error("Landlord not found for customer:", customerId);
      return;
    }

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELED,
        trialEndsAt: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: landlord.userId,
        type: ActivityType.USER_LOGIN,
        action: "Subscription canceled",
        metadata: {
          subscriptionId: subscription.id,
        },
      },
    });

    console.log("Subscription deleted:", subscription.id);
  } catch (error) {
    console.error("Handle subscription deleted error:", error);
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    const landlord = await prisma.landlord.findUnique({
      where: { stripeCustomerId: customerId },
      include: { user: true },
    });

    if (!landlord) {
      console.error("Landlord not found for customer:", customerId);
      return;
    }

    // ✅ FIXED: Use safe date conversion
    const trialEnd = safeUnixToDate(subscription.trial_end);
    
    if (!trialEnd) {
      console.error("Invalid trial end date for subscription:", subscription.id);
      return;
    }

    const now = new Date();
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    await prisma.notification.create({
      data: {
        userId: landlord.userId,
        type: "SYSTEM",
        channel: "EMAIL",
        title: `Trial ending in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
        message: `Your 14-day trial ends on ${trialEnd.toLocaleDateString()}. Add a payment method to continue your ${landlord.subscriptionTier} subscription without interruption.`,
        actionUrl: "/dashboard/settings/subscription",
      },
    });

    console.log("Trial ending notification sent:", subscription.id, { daysRemaining });
  } catch (error) {
    console.error("Handle trial will end error:", error);
  }
}

// ============================================================================
// PAYMENT EVENT HANDLERS
// ============================================================================

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentId = paymentIntent.metadata?.paymentId;

    if (!paymentId) {
      console.log("No payment ID in metadata");
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: { include: { user: true } },
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: { include: { user: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      console.error("Payment not found:", paymentId);
      return;
    }

    const amount = paymentIntent.amount / 100;
    const fee = (amount * 0.029) + 0.30;
    const netAmount = amount - fee;

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge as string,
        fee,
        netAmount,
        paidAt: new Date(),
      },
    });

    await Promise.all([
      prisma.notification.create({
        data: {
          userId: payment.tenant.userId,
          type: "PAYMENT_RECEIVED",
          channel: "EMAIL",
          title: "Payment Successful",
          message: `Your payment of $${amount.toFixed(2)} has been received.`,
          actionUrl: `/dashboard/payments/${paymentId}`,
        },
      }),
      payment.lease?.unit.property.landlord.user &&
        prisma.notification.create({
          data: {
            userId: payment.lease.unit.property.landlord.userId,
            type: "PAYMENT_RECEIVED",
            channel: "IN_APP",
            title: "Payment Received",
            message: `${payment.tenant.user.name} paid $${amount.toFixed(2)} for ${payment.type}`,
            actionUrl: `/dashboard/payments/${paymentId}`,
          },
        }),
    ]);

    await prisma.activityLog.create({
      data: {
        userId: payment.tenant.userId,
        type: ActivityType.PAYMENT_MADE,
        action: `Payment of $${amount.toFixed(2)} completed`,
        metadata: { paymentId: payment.id, amount },
      },
    });

    console.log("Payment succeeded:", paymentId);
  } catch (error) {
    console.error("Handle payment intent succeeded error:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentId = paymentIntent.metadata?.paymentId;

    if (!paymentId) {
      console.log("No payment ID in metadata");
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { tenant: { include: { user: true } } },
    });

    if (!payment) {
      console.error("Payment not found:", paymentId);
      return;
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: payment.tenant.userId,
        type: "PAYMENT_FAILED",
        channel: "EMAIL",
        title: "Payment Failed",
        message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} has failed. Please update your payment method.`,
        actionUrl: `/dashboard/payments/${paymentId}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: payment.tenant.userId,
        type: ActivityType.PAYMENT_FAILED,
        action: `Payment failed`,
        metadata: {
          paymentId: payment.id,
          reason: paymentIntent.last_payment_error?.message,
        },
      },
    });

    console.log("Payment failed:", paymentId);
  } catch (error) {
    console.error("Handle payment intent failed error:", error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string;

    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      console.error("Payment not found for charge:", charge.id);
      return;
    }

    const refundAmount = charge.amount_refunded / 100;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: charge.amount_refunded === charge.amount
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED,
        stripeRefundId: charge.refunds?.data[0]?.id,
        refundedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT_RECEIVED",
        channel: "EMAIL",
        title: "Refund Processed",
        message: `A refund of $${refundAmount.toFixed(2)} has been processed.`,
        actionUrl: `/dashboard/payments/${payment.id}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: payment.userId,
        type: ActivityType.PAYMENT_REFUNDED,
        action: `Refund of $${refundAmount.toFixed(2)} processed`,
        metadata: { paymentId: payment.id, refundAmount },
      },
    });

    console.log("Charge refunded:", charge.id);
  } catch (error) {
    console.error("Handle charge refunded error:", error);
  }
}

// ============================================================================
// INVOICE EVENT HANDLERS
// ============================================================================

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    const landlord = await prisma.landlord.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!landlord) {
      console.error("Landlord not found for customer:", customerId);
      return;
    }

    const wasInTrial = landlord.subscriptionStatus === SubscriptionStatus.TRIAL;
    const isFirstPayment = invoice.billing_reason === 'subscription_cycle' || 
                          invoice.billing_reason === 'subscription_create';

    if (wasInTrial && isFirstPayment && (invoice.amount_paid || 0) > 0) {
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
          channel: "EMAIL",
          title: "First payment received - Welcome!",
          message: `Your first payment of $${((invoice.amount_paid || 0) / 100).toFixed(2)} has been processed. Your ${landlord.subscriptionTier} subscription is now fully active!`,
          actionUrl: "/dashboard/settings/subscription",
        },
      });

      console.log("✅ Trial conversion payment received:", invoice.id);
    }

    await prisma.activityLog.create({
      data: {
        userId: landlord.userId,
        type: ActivityType.PAYMENT_MADE,
        action: `Subscription payment of $${((invoice.amount_paid || 0) / 100).toFixed(2)} processed`,
        metadata: {
          invoiceId: invoice.id,
          amount: (invoice.amount_paid || 0) / 100,
          wasTrialConversion: wasInTrial && isFirstPayment,
        },
      },
    });

    console.log("Invoice paid:", invoice.id);
  } catch (error) {
    console.error("Handle invoice paid error:", error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    const landlord = await prisma.landlord.findUnique({
      where: { stripeCustomerId: customerId },
      include: { user: true },
    });

    if (!landlord) {
      console.error("Landlord not found for customer:", customerId);
      return;
    }

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
        channel: "EMAIL",
        title: "Subscription Payment Failed",
        message: "Your subscription payment has failed. Please update your payment method to continue using the service.",
        actionUrl: "/dashboard/settings/subscription",
      },
    });

    console.log("Invoice payment failed:", invoice.id);
  } catch (error) {
    console.error("Handle invoice payment failed error:", error);
  }
}

async function handleInvoiceUpcoming(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;

    const landlord = await prisma.landlord.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!landlord) {
      console.error("Landlord not found for customer:", customerId);
      return;
    }

    // ✅ FIXED: Use safe date conversion
    const periodEnd = safeUnixToDate(invoice.period_end);

    await prisma.notification.create({
      data: {
        userId: landlord.userId,
        type: "SYSTEM",
        channel: "EMAIL",
        title: "Upcoming Subscription Renewal",
        message: `Your subscription will renew on ${periodEnd?.toLocaleDateString() || 'soon'} for $${((invoice.amount_due || 0) / 100).toFixed(2)}.`,
        actionUrl: "/dashboard/settings/subscription",
      },
    });

    console.log("Invoice upcoming notification sent:", invoice.id);
  } catch (error) {
    console.error("Handle invoice upcoming error:", error);
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    const customerId = paymentMethod.customer as string;

    if (!customerId) {
      return;
    }

    const landlord = await prisma.landlord.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (landlord) {
      await prisma.activityLog.create({
        data: {
          userId: landlord.userId,
          type: ActivityType.USER_LOGIN,
          action: "Payment method added",
          metadata: {
            paymentMethodId: paymentMethod.id,
            type: paymentMethod.type,
          },
        },
      });
    }

    console.log("Payment method attached:", paymentMethod.id);
  } catch (error) {
    console.error("Handle payment method attached error:", error);
  }
}