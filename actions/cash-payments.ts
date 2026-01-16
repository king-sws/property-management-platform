/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/cash-payments.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  PaymentStatus,
  PaymentMethod,
  ActivityType,
  UserRole,
} from "@/lib/generated/prisma/enums";

// -------------------------
// Validation Schemas
// -------------------------
const processCashPaymentSchema = z.object({
  paymentId: z.string(),
  receiptNumber: z.string().optional(),
  paidDate: z.string().optional(), // ISO date string
  notes: z.string().optional(),
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

// -------------------------
// Process Cash Payment (Tenant confirms they paid cash)
// -------------------------
export async function tenantConfirmCashPayment(
  data: z.infer<typeof processCashPaymentSchema>
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.TENANT) {
      return { success: false, error: "Only tenants can confirm payments" };
    }

    const validated = processCashPaymentSchema.parse(data);

    // Get payment details
const payment = await prisma.payment.findUnique({
  where: { id: validated.paymentId },
  include: {
    tenant: {
      include: { user: true },
    },
    lease: {
      include: {
        unit: {
          include: {
            property: {
              include: {
                landlord: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    },
  },
});

if (!payment) {
  throw new Error("Payment not found");
}

if (!payment.lease) {
  throw new Error("Payment has no lease");
}


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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const paidDate = validated.paidDate ? new Date(validated.paidDate) : new Date();

    // Update payment to PROCESSING (waiting for landlord confirmation)
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PROCESSING,
        method: PaymentMethod.CASH,
        receiptUrl: validated.receiptNumber,
        notes: validated.notes,
        updatedAt: new Date(),
      },
    });

    // Notify landlord
    await prisma.notification.create({
      data: {
        userId: payment.lease.unit.property.landlord.userId,
        type: "PAYMENT_RECEIVED",
        channel: "IN_APP",
        title: "Cash Payment Confirmation Required",
        message: `${payment.tenant.user.name} has marked a cash payment of $${Number(payment.amount).toFixed(2)} as paid. Please confirm receipt.`,
        actionUrl: `/dashboard/payments/${payment.id}`,
        metadata: {
          paymentId: payment.id,
          amount: Number(payment.amount),
          tenantName: payment.tenant.user.name,
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.PAYMENT_MADE,
        action: `Confirmed cash payment of $${Number(payment.amount).toFixed(2)}`,
        metadata: {
          paymentId: payment.id,
          receiptNumber: validated.receiptNumber,
        },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      data: {
        paymentId: payment.id,
        amount: Number(payment.amount),
        status: "PROCESSING",
      },
      message: "Payment confirmation sent to landlord",
    };
  } catch (error) {
    console.error("Tenant confirm cash payment error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return { success: false, error: "Failed to confirm payment" };
  }
}

// -------------------------
// Landlord Confirms Cash Payment
// -------------------------
export async function landlordConfirmCashPayment(
  data: z.infer<typeof processCashPaymentSchema>
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Only landlords can confirm cash payments" };
    }

    const validated = processCashPaymentSchema.parse(data);

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

    // Check if already completed
    if (payment.status === PaymentStatus.COMPLETED) {
      return { success: false, error: "Payment already confirmed" };
    }

    const paidDate = validated.paidDate ? new Date(validated.paidDate) : new Date();

    // Update payment to COMPLETED
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        method: PaymentMethod.CASH,
        paidAt: paidDate,
        receiptUrl: validated.receiptNumber,
        notes: validated.notes,
        updatedAt: new Date(),
      },
    });

    // Notify tenant
    await prisma.notification.create({
      data: {
        userId: payment.tenant.userId,
        type: "PAYMENT_RECEIVED",
        channel: "IN_APP",
        title: "Payment Confirmed",
        message: `Your cash payment of $${Number(payment.amount).toFixed(2)} has been confirmed by your landlord.`,
        actionUrl: `/dashboard/payments/${payment.id}`,
        metadata: {
          paymentId: payment.id,
          amount: Number(payment.amount),
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.PAYMENT_MADE,
        action: `Confirmed cash payment receipt of $${Number(payment.amount).toFixed(2)}`,
        metadata: {
          paymentId: payment.id,
          tenantId: payment.tenantId,
          receiptNumber: validated.receiptNumber,
        },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      data: {
        paymentId: payment.id,
        amount: Number(payment.amount),
        status: "COMPLETED",
      },
      message: "Cash payment confirmed successfully",
    };
  } catch (error) {
    console.error("Landlord confirm cash payment error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return { success: false, error: "Failed to confirm payment" };
  }
}

// -------------------------
// Reject Cash Payment (Landlord)
// -------------------------
export async function landlordRejectCashPayment(
  paymentId: string,
  reason: string
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Only landlords can reject payments" };
    }

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
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

    // Update payment back to PENDING
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PENDING,
        notes: `Rejected: ${reason}`,
        updatedAt: new Date(),
      },
    });

    // Notify tenant
    await prisma.notification.create({
      data: {
        userId: payment.tenant.userId,
        type: "PAYMENT_FAILED",
        channel: "IN_APP",
        title: "Payment Not Confirmed",
        message: `Your cash payment of $${Number(payment.amount).toFixed(2)} was not confirmed. Reason: ${reason}`,
        actionUrl: `/dashboard/payments/${payment.id}`,
        metadata: {
          paymentId: payment.id,
          amount: Number(payment.amount),
          reason,
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.PAYMENT_FAILED,
        action: `Rejected cash payment of $${Number(payment.amount).toFixed(2)}`,
        metadata: {
          paymentId: payment.id,
          reason,
        },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      message: "Payment rejection recorded",
    };
  } catch (error) {
    console.error("Reject cash payment error:", error);
    return { success: false, error: "Failed to reject payment" };
  }
}