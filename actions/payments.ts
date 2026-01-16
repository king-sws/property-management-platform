/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/payments.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { 
  PaymentType, 
  PaymentStatus, 
  PaymentMethod,
  ActivityType,
  UserRole 
} from "@/lib/generated/prisma/enums";

// -------------------------
// Validation Schemas
// -------------------------
const createPaymentSchema = z.object({
  leaseId: z.string().optional(),
  type: z.enum(["RENT", "DEPOSIT", "LATE_FEE", "UTILITY", "PET_FEE", "PARKING", "APPLICATION_FEE", "OTHER"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

const processPaymentSchema = z.object({
  paymentId: z.string(),
  paymentMethodId: z.string(),
});

const recordManualPaymentSchema = z.object({
  leaseId: z.string(),
  tenantId: z.string(),
  type: z.enum(["RENT", "DEPOSIT", "LATE_FEE", "UTILITY", "PET_FEE", "PARKING", "OTHER"]),
  method: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "OTHER"]),
  amount: z.number().positive(),
  description: z.string().optional(),
  paidDate: z.string(),
  receiptNumber: z.string().optional(),
});

const setupRecurringPaymentSchema = z.object({
  leaseId: z.string(),
  paymentType: z.enum(["RENT", "UTILITY", "PET_FEE", "PARKING"]),
  amount: z.number().positive(),
  frequency: z.enum(["MONTHLY", "WEEKLY", "BIWEEKLY"]),
  dayOfMonth: z.number().min(1).max(31).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  paymentMethodId: z.string(),
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
// Get Active Leases (for payment creation dropdown)
// -------------------------
export async function getActiveLeases(): Promise<PaymentResult> {
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

    const leases = await prisma.lease.findMany({
      where: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
        status: {
          in: ["ACTIVE", "EXPIRING_SOON"],
        },
        deletedAt: null,
      },
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tenants: {
          where: {
            isPrimaryTenant: true,
          },
          include: {
            tenant: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    const formattedLeases = leases.map(lease => ({
      id: lease.id,
      unitNumber: lease.unit.unitNumber,
      propertyName: lease.unit.property.name,
      tenantName: lease.tenants[0]?.tenant.user.name || "Unknown",
      tenantId: lease.tenants[0]?.tenantId,
      rentAmount: Number(lease.rentAmount),
    }));

    return {
      success: true,
      data: formattedLeases,
    };
  } catch (error) {
    console.error("Get active leases error:", error);
    return { success: false, error: "Failed to fetch leases" };
  }
}

// -------------------------
// Get Payments (for both Landlord and Tenant)
// -------------------------
export async function getPayments(
  status?: PaymentStatus,
  leaseId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();
    
    // ✅ Handle both LANDLORD and TENANT roles
    if (currentUser.role === UserRole.LANDLORD) {
      const landlord = await prisma.landlord.findUnique({
        where: { userId: currentUser.id },
      });

      if (!landlord) {
        return { success: false, error: "Landlord profile not found" };
      }

      const whereClause: any = {
        lease: {
          unit: {
            property: {
              landlordId: landlord.id,
            },
          },
        },
      };

      if (status) {
        whereClause.status = status;
      }

      if (leaseId) {
        whereClause.leaseId = leaseId;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: whereClause,
          include: {
            tenant: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            lease: {
              include: {
                unit: {
                  include: {
                    property: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.payment.count({ where: whereClause }),
      ]);

      return {
        success: true,
        data: {
          payments: payments.map(p => ({
            ...p,
            amount: Number(p.amount),
            fee: p.fee ? Number(p.fee) : null,
            netAmount: Number(p.netAmount),
            createdAt: p.createdAt.toISOString(),
            paidAt: p.paidAt?.toISOString() || null,
            dueDate: p.dueDate?.toISOString() || null,
          })),
          total,
          hasMore: offset + limit < total,
        },
      };
    } else if (currentUser.role === UserRole.TENANT) {
      // ✅ Handle tenant access
      return getTenantPayments(limit, offset);
    } else {
      return { success: false, error: "Unauthorized - Invalid role" };
    }
  } catch (error) {
    console.error("Get payments error:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}

// -------------------------
// Get Tenant Payments
// -------------------------
export async function getTenantPayments(
  limit: number = 50,
  offset: number = 0
): Promise<PaymentResult> {
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

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { tenantId: tenant.id },
        include: {
          lease: {
            include: {
              unit: {
                include: {
                  property: {
                    select: {
                      id: true,
                      name: true,
                      address: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where: { tenantId: tenant.id } }),
    ]);

    return {
      success: true,
      data: {
        payments: payments.map(p => ({
          ...p,
          amount: Number(p.amount),
          fee: p.fee ? Number(p.fee) : null,
          netAmount: Number(p.netAmount),
          createdAt: p.createdAt.toISOString(),
          paidAt: p.paidAt?.toISOString() || null,
          dueDate: p.dueDate?.toISOString() || null,
        })),
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("Get tenant payments error:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}

// -------------------------
// Get Payment Details
// -------------------------
export async function getPaymentDetails(paymentId: string): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

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
                property: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    // Check authorization
    const isOwner = payment.userId === currentUser.id;
    const isTenant = payment.tenant.userId === currentUser.id;
    const isLandlord = currentUser.role === UserRole.LANDLORD;

    if (!isOwner && !isTenant && !isLandlord) {
      return { success: false, error: "Unauthorized" };
    }

    return {
      success: true,
      data: {
        ...payment,
        amount: Number(payment.amount),
        fee: payment.fee ? Number(payment.fee) : null,
        netAmount: Number(payment.netAmount),
        createdAt: payment.createdAt.toISOString(),
        paidAt: payment.paidAt?.toISOString() || null,
        dueDate: payment.dueDate?.toISOString() || null,
        periodStart: payment.periodStart?.toISOString() || null,
        periodEnd: payment.periodEnd?.toISOString() || null,
      },
    };
  } catch (error) {
    console.error("Get payment details error:", error);
    return { success: false, error: "Failed to fetch payment details" };
  }
}

// -------------------------
// Create Payment (Landlord creates charge)
// -------------------------
export async function createPayment(
  data: z.infer<typeof createPaymentSchema>
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();
    
    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    // ✅ FIX: Ensure userId is defined
    if (!currentUser.id) {
      return { success: false, error: "User ID not found" };
    }

    const validated = createPaymentSchema.parse(data);

    if (!validated.leaseId) {
      return { success: false, error: "Lease ID is required" };
    }

    const lease = await prisma.lease.findUnique({
      where: { id: validated.leaseId },
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
        tenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!lease) {
      return { success: false, error: "Lease not found" };
    }

    if (lease.unit.property.landlord.userId !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    const primaryTenant = lease.tenants.find(t => t.isPrimaryTenant);
    if (!primaryTenant) {
      return { success: false, error: "No primary tenant found" };
    }

    const payment = await prisma.payment.create({
      data: {
        leaseId: validated.leaseId,
        tenantId: primaryTenant.tenantId,
        userId: currentUser.id, // ✅ Now guaranteed to be string
        type: validated.type as PaymentType,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.STRIPE_CARD,
        amount: validated.amount,
        fee: 0,
        netAmount: validated.amount,
        description: validated.description,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.PAYMENT_MADE,
        action: `Created ${validated.type} payment charge for $${validated.amount}`,
        metadata: { paymentId: payment.id },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      data: {
        ...payment,
        amount: Number(payment.amount),
      },
      message: "Payment created successfully",
    };
  } catch (error) {
    console.error("Create payment error:", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" };
    }

    return { success: false, error: "Failed to create payment" };
  }
}

// -------------------------
// Record Manual Payment (Cash, Check, etc.)
// -------------------------
export async function recordManualPayment(
  data: z.infer<typeof recordManualPaymentSchema>
): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();
    
    if (currentUser.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    // ✅ FIX: Ensure userId is defined
    if (!currentUser.id) {
      return { success: false, error: "User ID not found" };
    }

    const validated = recordManualPaymentSchema.parse(data);

    const payment = await prisma.payment.create({
      data: {
        leaseId: validated.leaseId,
        tenantId: validated.tenantId,
        userId: currentUser.id, // ✅ Now guaranteed to be string
        type: validated.type as PaymentType,
        status: PaymentStatus.COMPLETED,
        method: validated.method as PaymentMethod,
        amount: validated.amount,
        fee: 0,
        netAmount: validated.amount,
        description: validated.description,
        paidAt: new Date(validated.paidDate),
        receiptUrl: validated.receiptNumber,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.PAYMENT_MADE,
        action: `Recorded manual ${validated.method} payment for $${validated.amount}`,
        metadata: { paymentId: payment.id },
      },
    });

    revalidatePath("/dashboard/payments");

    return {
      success: true,
      data: {
        ...payment,
        amount: Number(payment.amount),
      },
      message: "Manual payment recorded successfully",
    };
  } catch (error) {
    console.error("Record manual payment error:", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" };
    }

    return { success: false, error: "Failed to record payment" };
  }
}

// -------------------------
// Get Upcoming Payments (for Tenant)
// -------------------------
export async function getUpcomingPayments(): Promise<PaymentResult> {
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

    const upcoming = await prisma.payment.findMany({
      where: {
        tenantId: tenant.id,
        status: PaymentStatus.PENDING,
        dueDate: {
          gte: new Date(),
        },
      },
      include: {
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
      orderBy: { dueDate: "asc" },
      take: 10,
    });

    return {
      success: true,
      data: upcoming.map(p => ({
        ...p,
        amount: Number(p.amount),
        dueDate: p.dueDate?.toISOString() || null,
      })),
    };
  } catch (error) {
    console.error("Get upcoming payments error:", error);
    return { success: false, error: "Failed to fetch upcoming payments" };
  }
}

// -------------------------
// Get Payment Statistics
// -------------------------
export async function getPaymentStatistics(): Promise<PaymentResult> {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser.role === UserRole.LANDLORD) {
      const landlord = await prisma.landlord.findUnique({
        where: { userId: currentUser.id },
      });

      if (!landlord) {
        return { success: false, error: "Landlord profile not found" };
      }

      const [totalCollected, pendingAmount, overdueCount, thisMonthCollected] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            lease: {
              unit: {
                property: {
                  landlordId: landlord.id,
                },
              },
            },
            status: PaymentStatus.COMPLETED,
          },
          _sum: { netAmount: true },
        }),
        prisma.payment.aggregate({
          where: {
            lease: {
              unit: {
                property: {
                  landlordId: landlord.id,
                },
              },
            },
            status: PaymentStatus.PENDING,
          },
          _sum: { amount: true },
        }),
        prisma.payment.count({
          where: {
            lease: {
              unit: {
                property: {
                  landlordId: landlord.id,
                },
              },
            },
            status: PaymentStatus.PENDING,
            dueDate: {
              lt: new Date(),
            },
          },
        }),
        prisma.payment.aggregate({
          where: {
            lease: {
              unit: {
                property: {
                  landlordId: landlord.id,
                },
              },
            },
            status: PaymentStatus.COMPLETED,
            paidAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { netAmount: true },
        }),
      ]);

      return {
        success: true,
        data: {
          totalCollected: Number(totalCollected._sum.netAmount || 0),
          pendingAmount: Number(pendingAmount._sum.amount || 0),
          overdueCount,
          thisMonthCollected: Number(thisMonthCollected._sum.netAmount || 0),
        },
      };
    } else if (currentUser.role === UserRole.TENANT) {
      const tenant = await prisma.tenant.findUnique({
        where: { userId: currentUser.id },
      });

      if (!tenant) {
        return { success: false, error: "Tenant profile not found" };
      }

      const [totalPaid, pendingAmount, nextPayment] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            tenantId: tenant.id,
            status: PaymentStatus.COMPLETED,
          },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            tenantId: tenant.id,
            status: PaymentStatus.PENDING,
          },
          _sum: { amount: true },
        }),
        prisma.payment.findFirst({
          where: {
            tenantId: tenant.id,
            status: PaymentStatus.PENDING,
            dueDate: {
              gte: new Date(),
            },
          },
          orderBy: { dueDate: "asc" },
        }),
      ]);

      return {
        success: true,
        data: {
          totalPaid: Number(totalPaid._sum.amount || 0),
          pendingAmount: Number(pendingAmount._sum.amount || 0),
          nextPayment: nextPayment ? {
            amount: Number(nextPayment.amount),
            dueDate: nextPayment.dueDate?.toISOString() || null,
            type: nextPayment.type,
          } : null,
        },
      };
    }

    return { success: false, error: "Invalid role" };
  } catch (error) {
    console.error("Get payment statistics error:", error);
    return { success: false, error: "Failed to fetch payment statistics" };
  }
}

// -------------------------
// Get Outstanding/Overdue Payments
// -------------------------
export async function getOutstandingPayments(): Promise<PaymentResult> {
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

    const today = new Date();
    
    const [overdue, pendingThisMonth] = await Promise.all([
      prisma.payment.findMany({
        where: {
          lease: {
            unit: {
              property: {
                landlordId: landlord.id,
              },
            },
          },
          status: PaymentStatus.PENDING,
          dueDate: {
            lt: today,
          },
        },
        include: {
          tenant: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          lease: {
            include: {
              unit: {
                include: {
                  property: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.payment.findMany({
        where: {
          lease: {
            unit: {
              property: {
                landlordId: landlord.id,
              },
            },
          },
          status: PaymentStatus.PENDING,
          dueDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lte: new Date(today.getFullYear(), today.getMonth() + 1, 0),
          },
        },
        include: {
          tenant: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          lease: {
            include: {
              unit: {
                include: {
                  property: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    const overdueTotal = overdue.reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingTotal = pendingThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      success: true,
      data: {
        overdue: overdue.map(p => ({
          ...p,
          amount: Number(p.amount),
          dueDate: p.dueDate?.toISOString() || null,
        })),
        pendingThisMonth: pendingThisMonth.map(p => ({
          ...p,
          amount: Number(p.amount),
          dueDate: p.dueDate?.toISOString() || null,
        })),
        overdueCount: overdue.length,
        overdueTotal,
        pendingTotal,
      },
    };
  } catch (error) {
    console.error("Get outstanding payments error:", error);
    return { success: false, error: "Failed to fetch outstanding payments" };
  }
}

// -------------------------
// Get Revenue Comparison (Current Year vs Last Year)
// -------------------------
export async function getRevenueComparison(): Promise<PaymentResult> {
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

    const today = new Date();
    const currentYear = today.getFullYear();
    const lastYear = currentYear - 1;

    const [currentYearRevenue, lastYearRevenue, currentMonthRevenue, lastMonthRevenue] = await Promise.all([
      // Current year total
      prisma.payment.aggregate({
        where: {
          lease: {
            unit: {
              property: {
                landlordId: landlord.id,
              },
            },
          },
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31, 23, 59, 59),
          },
        },
        _sum: { netAmount: true },
      }),
      // Last year total
      prisma.payment.aggregate({
        where: {
          lease: {
            unit: {
              property: {
                landlordId: landlord.id,
              },
            },
          },
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: new Date(lastYear, 0, 1),
            lte: new Date(lastYear, 11, 31, 23, 59, 59),
          },
        },
        _sum: { netAmount: true },
      }),
      // Current month
      prisma.payment.aggregate({
        where: {
          lease: {
            unit: {
              property: {
                landlordId: landlord.id,
              },
            },
          },
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: new Date(currentYear, today.getMonth(), 1),
            lte: new Date(currentYear, today.getMonth() + 1, 0, 23, 59, 59),
          },
        },
        _sum: { netAmount: true },
      }),
      // Same month last year
      prisma.payment.aggregate({
        where: {
          lease: {
            unit: {
              property: {
                landlordId: landlord.id,
              },
            },
          },
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: new Date(lastYear, today.getMonth(), 1),
            lte: new Date(lastYear, today.getMonth() + 1, 0, 23, 59, 59),
          },
        },
        _sum: { netAmount: true },
      }),
    ]);

    const currentYearTotal = Number(currentYearRevenue._sum.netAmount || 0);
    const lastYearTotal = Number(lastYearRevenue._sum.netAmount || 0);
    const currentMonthTotal = Number(currentMonthRevenue._sum.netAmount || 0);
    const lastMonthTotal = Number(lastMonthRevenue._sum.netAmount || 0);

    const yearOverYearChange = lastYearTotal > 0 
      ? ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100 
      : 0;

    const monthOverMonthChange = lastMonthTotal > 0
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    return {
      success: true,
      data: {
        currentYear: {
          year: currentYear,
          total: currentYearTotal,
        },
        lastYear: {
          year: lastYear,
          total: lastYearTotal,
        },
        currentMonth: {
          month: today.getMonth() + 1,
          total: currentMonthTotal,
        },
        lastMonth: {
          month: today.getMonth() + 1,
          total: lastMonthTotal,
        },
        yearOverYearChange,
        monthOverMonthChange,
      },
    };
  } catch (error) {
    console.error("Get revenue comparison error:", error);
    return { success: false, error: "Failed to fetch revenue comparison" };
  }
}

// -------------------------
// Get Collection Rate (% of rent collected on time)
// -------------------------
export async function getCollectionRate(months: number = 12): Promise<PaymentResult> {
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

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: landlord.id,
            },
          },
        },
        type: PaymentType.RENT,
        status: PaymentStatus.COMPLETED,
        paidAt: {
          gte: startDate,
        },
      },
      select: {
        dueDate: true,
        paidAt: true,
        amount: true,
      },
    });

    const totalPayments = payments.length;
    const onTimePayments = payments.filter(
      p => p.dueDate && p.paidAt && p.paidAt <= p.dueDate
    ).length;

    const collectionRate = totalPayments > 0 
      ? (onTimePayments / totalPayments) * 100 
      : 100;

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      success: true,
      data: {
        collectionRate: Math.round(collectionRate * 10) / 10, // Round to 1 decimal
        totalPayments,
        onTimePayments,
        latePayments: totalPayments - onTimePayments,
        totalCollected,
        period: `Last ${months} months`,
      },
    };
  } catch (error) {
    console.error("Get collection rate error:", error);
    return { success: false, error: "Failed to fetch collection rate" };
  }
}

export async function getMonthlyRevenueExpenses(months: number = 6): Promise<PaymentResult> {
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

    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Get all payments for the period
    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: landlord.id,
            },
          },
        },
        status: PaymentStatus.COMPLETED,
        paidAt: {
          gte: startDate,
          lte: today,
        },
      },
      select: {
        paidAt: true,
        netAmount: true,
      },
    });

    // Get all expenses for the period
    const expenses = await prisma.expense.findMany({
      where: {
        landlordId: landlord.id,
        paidDate: {
          gte: startDate,
          lte: today,
        },
        deletedAt: null,
      },
      select: {
        paidDate: true,
        amount: true,
      },
    });

    // Group by month
    const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {};

    // Initialize all months
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData[monthKey] = { revenue: 0, expenses: 0 };
    }

    // Aggregate payments (revenue)
    payments.forEach(payment => {
      if (payment.paidAt) {
        const monthKey = payment.paidAt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += Number(payment.netAmount);
        }
      }
    });

    // Aggregate expenses
    expenses.forEach(expense => {
      if (expense.paidDate) {
        const monthKey = expense.paidDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].expenses += Number(expense.amount);
        }
      }
    });

    // Convert to array format for chart
    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      expenses: Math.round(data.expenses),
      profit: Math.round(data.revenue - data.expenses),
    }));

    return {
      success: true,
      data: chartData,
    };
  } catch (error) {
    console.error("Get monthly revenue expenses error:", error);
    return { success: false, error: "Failed to fetch monthly data" };
  }
}
