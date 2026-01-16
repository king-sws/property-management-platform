/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// 1. CREATE: lib/actions/tenant-dashboard.ts
// ============================================================================

"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@/lib/generated/prisma/enums";

type DashboardResult = {
  success: boolean;
  data?: any;
  error?: string;
};

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// -------------------------
// Get Tenant Dashboard Stats
// -------------------------
export async function getTenantDashboardStats(): Promise<DashboardResult> {
  try {
    const currentUser = await getCurrentUser();
    
    if (currentUser.role !== UserRole.TENANT) {
      return { success: false, error: "Unauthorized" };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { userId: currentUser.id },
      include: {
        leaseMembers: {
          where: {
            lease: {
              status: "ACTIVE",
              deletedAt: null,
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
          take: 1,
        },
      },
    });

    if (!tenant) {
      return { success: false, error: "Tenant profile not found" };
    }

    const activeLease = tenant.leaseMembers[0]?.lease;

    // Get payment stats
    const [completedPayments, pendingPayments, nextPayment] = await Promise.all([
      prisma.payment.count({
        where: {
          tenantId: tenant.id,
          status: "COMPLETED",
        },
      }),
      prisma.payment.aggregate({
        where: {
          tenantId: tenant.id,
          status: "PENDING",
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.payment.findFirst({
        where: {
          tenantId: tenant.id,
          status: "PENDING",
          dueDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      }),
    ]);

    // Get maintenance tickets
    const [openTickets, allTickets] = await Promise.all([
      prisma.maintenanceTicket.count({
        where: {
          createdById: currentUser.id,
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
          deletedAt: null,
        },
      }),
      prisma.maintenanceTicket.count({
        where: {
          createdById: currentUser.id,
          deletedAt: null,
        },
      }),
    ]);

    // Calculate next payment due date
    const today = new Date();
    let nextPaymentDue = null;
    if (activeLease) {
      const rentDueDay = activeLease.rentDueDay;
      nextPaymentDue = new Date(today.getFullYear(), today.getMonth(), rentDueDay);
      
      // If due date has passed this month, move to next month
      if (nextPaymentDue < today) {
        nextPaymentDue = new Date(today.getFullYear(), today.getMonth() + 1, rentDueDay);
      }
    }

    return {
      success: true,
      data: {
        lease: activeLease ? {
          id: activeLease.id,
          status: activeLease.status,
          rentAmount: Number(activeLease.rentAmount),
          deposit: Number(activeLease.deposit),
          startDate: activeLease.startDate.toISOString(),
          endDate: activeLease.endDate?.toISOString() || null,
          rentDueDay: activeLease.rentDueDay,
          unit: {
            id: activeLease.unit.id,
            unitNumber: activeLease.unit.unitNumber,
            bedrooms: activeLease.unit.bedrooms,
            bathrooms: Number(activeLease.unit.bathrooms),
          },
          property: {
            id: activeLease.unit.property.id,
            name: activeLease.unit.property.name,
            address: activeLease.unit.property.address,
            city: activeLease.unit.property.city,
            state: activeLease.unit.property.state,
          },
        } : null,
        payments: {
          completed: completedPayments,
          pending: pendingPayments._count,
          pendingAmount: Number(pendingPayments._sum.amount || 0),
          nextPayment: nextPayment ? {
            id: nextPayment.id,
            amount: Number(nextPayment.amount),
            dueDate: nextPayment.dueDate?.toISOString() || null,
            type: nextPayment.type,
          } : null,
          nextPaymentDue: nextPaymentDue?.toISOString() || null,
        },
        maintenance: {
          open: openTickets,
          total: allTickets,
          completed: allTickets - openTickets,
        },
      },
    };
  } catch (error) {
    console.error("Get tenant dashboard stats error:", error);
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}

// -------------------------
// Get Active Lease Details
// -------------------------
export async function getActiveLease(): Promise<DashboardResult> {
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

    const leaseMember = await prisma.leaseTenant.findFirst({
      where: {
        tenantId: tenant.id,
        lease: {
          status: "ACTIVE",
          deletedAt: null,
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: {
                      include: {
                        user: {
                          select: {
                            name: true,
                            email: true,
                            phone: true,
                          },
                        },
                      },
                    },
                  },
                },
                amenities: {
                  include: {
                    amenity: true,
                  },
                },
              },
            },
            tenants: {
              include: {
                tenant: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!leaseMember) {
      return { success: true, data: null };
    }

    const lease = leaseMember.lease;

    return {
      success: true,
      data: {
        id: lease.id,
        status: lease.status,
        type: lease.type,
        startDate: lease.startDate.toISOString(),
        endDate: lease.endDate?.toISOString() || null,
        rentAmount: Number(lease.rentAmount),
        deposit: Number(lease.deposit),
        rentDueDay: lease.rentDueDay,
        lateFeeAmount: lease.lateFeeAmount ? Number(lease.lateFeeAmount) : null,
        lateFeeDays: lease.lateFeeDays,
        documentUrl: lease.documentUrl,
        landlordSignedAt: lease.landlordSignedAt?.toISOString() || null,
        allTenantsSignedAt: lease.allTenantsSignedAt?.toISOString() || null,
        isPrimaryTenant: leaseMember.isPrimaryTenant,
        signedAt: leaseMember.signedAt?.toISOString() || null,
        unit: {
          id: lease.unit.id,
          unitNumber: lease.unit.unitNumber,
          bedrooms: lease.unit.bedrooms,
          bathrooms: Number(lease.unit.bathrooms),
          squareFeet: lease.unit.squareFeet || null,
          amenities: lease.unit.amenities.map(a => ({
            id: a.amenity.id,
            name: a.amenity.name,
            category: a.amenity.category,
            icon: a.amenity.icon,
          })),
        },
        property: {
          id: lease.unit.property.id,
          name: lease.unit.property.name,
          type: lease.unit.property.type,
          address: lease.unit.property.address,
          city: lease.unit.property.city,
          state: lease.unit.property.state,
          zipCode: lease.unit.property.zipCode,
        },
        landlord: {
          name: lease.unit.property.landlord.user.name,
          email: lease.unit.property.landlord.user.email,
          phone: lease.unit.property.landlord.user.phone,
          businessName: lease.unit.property.landlord.businessName,
        },
        coTenants: lease.tenants
          .filter(t => t.tenantId !== tenant.id)
          .map(t => ({
            id: t.tenant.id,
            name: t.tenant.user.name,
            email: t.tenant.user.email,
            isPrimaryTenant: t.isPrimaryTenant,
            signedAt: t.signedAt?.toISOString() || null,
          })),
      },
    };
  } catch (error) {
    console.error("Get active lease error:", error);
    return { success: false, error: "Failed to fetch lease details" };
  }
}

// -------------------------
// Get Recent Tenant Payments
// -------------------------
export async function getTenantRecentPayments(limit: number = 5): Promise<DashboardResult> {
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

    const payments = await prisma.payment.findMany({
      where: {
        tenantId: tenant.id,
      },
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
      orderBy: [
        { status: "asc" }, // Show pending first
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return {
      success: true,
      data: payments.map(p => ({
        id: p.id,
        type: p.type,
        status: p.status,
        method: p.method,
        amount: Number(p.amount),
        fee: p.fee ? Number(p.fee) : null,
        netAmount: Number(p.netAmount),
        description: p.description,
        dueDate: p.dueDate?.toISOString() || null,
        paidAt: p.paidAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
        property: p.lease?.unit.property,
        unit: p.lease?.unit ? {
          id: p.lease.unit.id,
          unitNumber: p.lease.unit.unitNumber,
        } : null,
      })),
    };
  } catch (error) {
    console.error("Get tenant recent payments error:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}

// -------------------------
// Get Tenant Maintenance Requests
// -------------------------
export async function getTenantMaintenanceRequests(limit: number = 5): Promise<DashboardResult> {
  try {
    const currentUser = await getCurrentUser();
    
    if (currentUser.role !== UserRole.TENANT) {
      return { success: false, error: "Unauthorized" };
    }

    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        createdById: currentUser.id,
        deletedAt: null,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
        images: {
          take: 1,
        },
      },
      orderBy: [
        { status: "asc" }, // Show open/in-progress first
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return {
      success: true,
      data: tickets.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        location: t.location,
        estimatedCost: t.estimatedCost ? Number(t.estimatedCost) : null,
        actualCost: t.actualCost ? Number(t.actualCost) : null,
        scheduledDate: t.scheduledDate?.toISOString() || null,
        completedDate: t.completedDate?.toISOString() || null,
        createdAt: t.createdAt.toISOString(),
        property: t.property,
        assignedTo: t.assignedTo,
        vendor: t.vendor,
        hasImages: t.images.length > 0,
      })),
    };
  } catch (error) {
    console.error("Get tenant maintenance requests error:", error);
    return { success: false, error: "Failed to fetch maintenance requests" };
  }
}

// -------------------------
// Get Payment Summary (for charts/visualizations)
// -------------------------
export async function getTenantPaymentSummary(): Promise<DashboardResult> {
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

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get all payments this year
    const payments = await prisma.payment.findMany({
      where: {
        tenantId: tenant.id,
        status: "COMPLETED",
        paidAt: {
          gte: startOfYear,
          lte: today,
        },
      },
      select: {
        amount: true,
        type: true,
        paidAt: true,
      },
      orderBy: {
        paidAt: "asc",
      },
    });

    // Group by month
    const monthlyData: { [key: string]: { rent: number; other: number; total: number } } = {};
    
    // Initialize months
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = { rent: 0, other: 0, total: 0 };
    }

    // Aggregate payments
    payments.forEach(payment => {
      if (payment.paidAt) {
        const monthKey = payment.paidAt.toLocaleDateString('en-US', { month: 'short' });
        const amount = Number(payment.amount);
        
        if (monthlyData[monthKey]) {
          if (payment.type === "RENT") {
            monthlyData[monthKey].rent += amount;
          } else {
            monthlyData[monthKey].other += amount;
          }
          monthlyData[monthKey].total += amount;
        }
      }
    });

    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      rent: Math.round(data.rent),
      other: Math.round(data.other),
      total: Math.round(data.total),
    }));

    // Get totals
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const rentPaid = payments
      .filter(p => p.type === "RENT")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const otherPaid = totalPaid - rentPaid;

    return {
      success: true,
      data: {
        chartData,
        summary: {
          totalPaid: Math.round(totalPaid),
          rentPaid: Math.round(rentPaid),
          otherPaid: Math.round(otherPaid),
          paymentsCount: payments.length,
        },
      },
    };
  } catch (error) {
    console.error("Get tenant payment summary error:", error);
    return { success: false, error: "Failed to fetch payment summary" };
  }
}

// -------------------------
// Get Upcoming Lease Actions (renewals, inspections, etc.)
// -------------------------
export async function getUpcomingLeaseActions(): Promise<DashboardResult> {
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

    const leaseMember = await prisma.leaseTenant.findFirst({
      where: {
        tenantId: tenant.id,
        lease: {
          status: "ACTIVE",
          deletedAt: null,
        },
      },
      include: {
        lease: {
          include: {
            renewalOffers: {
              where: {
                status: {
                  in: ["SENT", "COUNTERED"],
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    const actions = [];

    if (leaseMember) {
      const lease = leaseMember.lease;
      const today = new Date();

      // Check if lease is expiring soon (within 90 days)
      if (lease.endDate) {
        const daysUntilExpiry = Math.ceil(
          (lease.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
          actions.push({
            type: "LEASE_EXPIRING",
            title: "Lease Expiring Soon",
            description: `Your lease expires in ${daysUntilExpiry} days`,
            dueDate: lease.endDate.toISOString(),
            priority: daysUntilExpiry <= 30 ? "HIGH" : "MEDIUM",
            actionUrl: "/dashboard/my-lease",
          });
        }
      }

      // Check for pending renewal offers
      if (lease.renewalOffers.length > 0) {
        const offer = lease.renewalOffers[0];
        actions.push({
          type: "RENEWAL_OFFER",
          title: "Lease Renewal Offer",
          description: `New offer: $${Number(offer.proposedRentAmount).toLocaleString()}/month`,
          dueDate: offer.expiresAt.toISOString(),
          priority: "HIGH",
          actionUrl: `/dashboard/leases/${lease.id}/renewal`,
          metadata: {
            offerId: offer.id,
            status: offer.status,
          },
        });
      }

      // Check if tenant needs to sign lease
      if (!leaseMember.signedAt && lease.status === "PENDING_SIGNATURE") {
        actions.push({
          type: "SIGNATURE_REQUIRED",
          title: "Lease Signature Required",
          description: "Your lease is ready for signature",
          dueDate: null,
          priority: "HIGH",
          actionUrl: `/dashboard/leases/${lease.id}/sign`,
        });
      }
    }

    return {
      success: true,
      data: actions,
    };
  } catch (error) {
    console.error("Get upcoming lease actions error:", error);
    return { success: false, error: "Failed to fetch lease actions" };
  }
}