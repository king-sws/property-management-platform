/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/stripe-payments.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  createPaymentIntent,
  createACHPaymentIntent,
  attachPaymentMethod,
  detachPaymentMethod,
  createRefund,
  createStripeCustomer,
} from "@/services/stripe";
import {
  PaymentStatus,
  PaymentMethod as PrismaPaymentMethod,
  ActivityType,
  UserRole,
} from "@/lib/generated/prisma/enums";

// -------------------------
// Validation Schemas
// -------------------------
const initiatePaymentSchema = z.object({
  paymentId: z.string(),
  paymentMethodId: z.string().optional(),
  savePaymentMethod: z.boolean().default(false),
});

const initiateACHPaymentSchema = z.object({
  paymentId: z.string(),
  accountNumber: z.string(),
  routingNumber: z.string(),
  accountHolderName: z.string(),
});

const refundPaymentSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.enum(["duplicate", "fraudulent", "requested_by_customer"]).optional(),
});

// -------------------------
// Types
// -------------------------
type PaymentResult = {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function ensureStripeCustomer(userId: string, email: string, name: string | null) {
  // Check if user has stripe customer ID
  const tenant = await prisma.tenant.findUnique({
    where: { userId },
  });

  if (!tenant) {
    throw new Error("Tenant profile not found");
  }

  // If no stripe customer, create one
  // Note: You'll need to add stripeCustomerId field to Tenant model
  // For now, we'll create it on the fly in the payment intent

  return tenant;
}

// -------------------------
// Initiate Card Payment (Tenant pays rent)
// -------------------------
export async function initiateCardPayment(
  data: z.infer<typeof initiatePaymentSchema>
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.TENANT) {
      return { success: false, error: "Only tenants can make payments" };
    }

    const validated = initiatePaymentSchema.parse(data);

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: validated.paymentId },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    // Verify ownership
    if (payment.tenant.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if already paid
    if (payment.status === PaymentStatus.COMPLETED) {
      return { success: false, error: "Payment already completed" };
    }

    // Create or get Stripe customer
    let stripeCustomerId: string | undefined;
    
    // You should add stripeCustomerId to the Tenant model
    // For now, we'll pass it in metadata

    // Create payment intent
    const paymentIntentResult = await createPaymentIntent(
      Number(payment.amount),
      "usd",
      {
        paymentId: payment.id,
        tenantId: payment.tenantId,
        leaseId: payment.leaseId || "",
        type: payment.type,
        propertyName: payment.lease?.unit.property.name || "",
      },
      stripeCustomerId
    );

    if (!paymentIntentResult.success || !paymentIntentResult.paymentIntent) {
      return { success: false, error: "Failed to create payment intent" };
    }

    const paymentIntent = paymentIntentResult.paymentIntent;

    // Update payment with Stripe payment intent ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: PaymentStatus.PROCESSING,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.PAYMENT_MADE,
        action: `Initiated payment of $${payment.amount}`,
        metadata: {
          paymentId: payment.id,
          paymentIntentId: paymentIntent.id,
        },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: Number(payment.amount),
      },
      message: "Payment initiated successfully",
    };
  } catch (error) {
    console.error("Initiate card payment error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return { success: false, error: "Failed to initiate payment" };
  }
}

// -------------------------
// Initiate ACH Payment (Bank Transfer)
// -------------------------
export async function initiateACHPayment(
  data: z.infer<typeof initiateACHPaymentSchema>
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.TENANT) {
      return { success: false, error: "Only tenants can make payments" };
    }

    const validated = initiateACHPaymentSchema.parse(data);

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: validated.paymentId },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    // Verify ownership
    if (payment.tenant.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if already paid
    if (payment.status === PaymentStatus.COMPLETED) {
      return { success: false, error: "Payment already completed" };
    }

    // Create Stripe customer if doesn't exist
    const customerResult = await createStripeCustomer(
      payment.tenant.user.email,
      payment.tenant.user.name || "Tenant",
      {
        tenantId: payment.tenantId,
        userId: currentUser.id,
      }
    );

    if (!customerResult.success || !customerResult.customer) {
      return { success: false, error: "Failed to create customer account" };
    }

    // Create ACH payment intent
    const paymentIntentResult = await createACHPaymentIntent(
      Number(payment.amount),
      customerResult.customer.id,
      {
        paymentId: payment.id,
        tenantId: payment.tenantId,
        type: payment.type,
      }
    );

    if (!paymentIntentResult.success || !paymentIntentResult.paymentIntent) {
      return { success: false, error: "Failed to create ACH payment" };
    }

    const paymentIntent = paymentIntentResult.paymentIntent;

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: PaymentStatus.PROCESSING,
        method: PrismaPaymentMethod.STRIPE_ACH,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.PAYMENT_MADE,
        action: `Initiated ACH payment of $${payment.amount}`,
        metadata: {
          paymentId: payment.id,
          paymentIntentId: paymentIntent.id,
        },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: Number(payment.amount),
      },
      message: "ACH payment initiated. Processing takes 3-5 business days.",
    };
  } catch (error) {
    console.error("Initiate ACH payment error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return { success: false, error: "Failed to initiate ACH payment" };
  }
}

// -------------------------
// Get Tenant Payment Methods
// -------------------------
export async function getTenantPaymentMethods(): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.TENANT) {
      return { success: false, error: "Unauthorized" };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { userId: currentUser.id },
    });

    if (!tenant) {
      return { success: false, error: "Tenant profile not found" };
    }

    // You'll need to store stripeCustomerId in Tenant model
    // For now, return empty array
    // When implemented, use:
    // const result = await listPaymentMethods(tenant.stripeCustomerId);

    return {
      success: true,
      data: {
        paymentMethods: [],
      },
    };
  } catch (error) {
    console.error("Get tenant payment methods error:", error);
    return { success: false, error: "Failed to fetch payment methods" };
  }
}

// -------------------------
// Add Payment Method
// -------------------------
export async function addPaymentMethod(paymentMethodId: string): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.TENANT) {
      return { success: false, error: "Unauthorized" };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { userId: currentUser.id },
      include: { user: true },
    });

    if (!tenant) {
      return { success: false, error: "Tenant profile not found" };
    }

    // Create Stripe customer if doesn't exist
    const customerResult = await createStripeCustomer(
      tenant.user.email,
      tenant.user.name || "Tenant",
      {
        tenantId: tenant.id,
        userId: currentUser.id,
      }
    );

    if (!customerResult.success || !customerResult.customer) {
      return { success: false, error: "Failed to create customer account" };
    }

    // Attach payment method
    const attachResult = await attachPaymentMethod(
      paymentMethodId,
      customerResult.customer.id
    );

    if (!attachResult.success) {
      return { success: false, error: "Failed to add payment method" };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.USER_LOGIN,
        action: "Added payment method",
        metadata: {
          paymentMethodId,
        },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      message: "Payment method added successfully",
    };
  } catch (error) {
    console.error("Add payment method error:", error);
    return { success: false, error: "Failed to add payment method" };
  }
}

// -------------------------
// Remove Payment Method
// -------------------------
export async function removePaymentMethod(paymentMethodId: string): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.TENANT) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await detachPaymentMethod(paymentMethodId);

    if (!result.success) {
      return { success: false, error: "Failed to remove payment method" };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.USER_LOGIN,
        action: "Removed payment method",
        metadata: {
          paymentMethodId,
        },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      message: "Payment method removed successfully",
    };
  } catch (error) {
    console.error("Remove payment method error:", error);
    return { success: false, error: "Failed to remove payment method" };
  }
}

// -------------------------
// Refund Payment (Landlord only)
// -------------------------
export async function refundPayment(
  data: z.infer<typeof refundPaymentSchema>
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Only landlords can issue refunds" };
    }

    const validated = refundPaymentSchema.parse(data);

    const payment = await prisma.payment.findUnique({
      where: { id: validated.paymentId },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    // Verify landlord owns this property
    if (payment.lease?.unit.property.landlord.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if payment can be refunded
    if (payment.status !== PaymentStatus.COMPLETED) {
      return { success: false, error: "Only completed payments can be refunded" };
    }

    if (!payment.stripePaymentIntentId) {
      return {
        success: false,
        error: "Cannot refund payment without Stripe payment intent",
      };
    }

    // Create refund
    const refundResult = await createRefund(
      payment.stripePaymentIntentId,
      validated.amount,
      validated.reason
    );

    if (!refundResult.success) {
      return { success: false, error: "Failed to process refund" };
    }

    const refundAmount = validated.amount || Number(payment.amount);

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status:
          refundAmount === Number(payment.amount)
            ? PaymentStatus.REFUNDED
            : PaymentStatus.PARTIALLY_REFUNDED,
        stripeRefundId: refundResult.refund.id,
        refundedAt: new Date(),
      },
    });

    // Notify tenant
    await prisma.notification.create({
      data: {
        userId: payment.tenant.userId,
        type: "PAYMENT_RECEIVED",
        channel: "EMAIL",
        title: "Refund Issued",
        message: `A refund of $${refundAmount.toFixed(2)} has been issued for your payment.`,
        actionUrl: `/dashboard/payments/${payment.id}`,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.PAYMENT_REFUNDED,
        action: `Issued refund of $${refundAmount.toFixed(2)}`,
        metadata: {
          paymentId: payment.id,
          refundId: refundResult.refund.id,
          amount: refundAmount,
        },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      message: `Refund of $${refundAmount.toFixed(2)} processed successfully`,
    };
  } catch (error) {
    console.error("Refund payment error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return { success: false, error: "Failed to process refund" };
  }
}

// -------------------------
// Get Payment Processing Fee
// -------------------------
export async function calculatePaymentFee(amount: number): Promise<PaymentResult> {
  try {
    // Stripe fee: 2.9% + $0.30
    const fee = amount * 0.029 + 0.3;
    const total = amount + fee;

    return {
      success: true,
      data: {
        amount,
        fee: Math.round(fee * 100) / 100,
        total: Math.round(total * 100) / 100,
      },
    };
  } catch (error) {
    console.error("Calculate payment fee error:", error);
    return { success: false, error: "Failed to calculate fee" };
  }
}