/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// FILE: lib/actions/my-lease.ts
// FIXED - Properly serializes Decimal and Date fields for client components
// ============================================================================
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// -------------------------
// Types
// -------------------------
type LeaseResult = {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
};

// -------------------------
// Helper Functions
// -------------------------
async function getCurrentTenant() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenantProfile: true,
    },
  });

  if (!user || user.role !== "TENANT" || !user.tenantProfile) {
    throw new Error("Tenant profile not found");
  }

  return user;
}

// ✅ FIXED: Better serialization that handles Decimal and Date objects
function serializeForClient(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  // Handle objects with toJSON (like Decimal)
  if (typeof obj === 'object' && 'toJSON' in obj && typeof obj.toJSON === 'function') {
    return Number(obj);
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeForClient);
  }
  
  // Handle plain objects
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeForClient(obj[key]);
      }
    }
    return serialized;
  }
  
  return obj;
}

// -------------------------
// Get Current Lease
// -------------------------
export async function getCurrentLease(): Promise<LeaseResult> {
  try {
    const user = await getCurrentTenant();

    const activeLease = await prisma.leaseTenant.findFirst({
      where: {
        tenantId: user.tenantProfile!.id,
        lease: {
          status: {
            in: ["ACTIVE", "EXPIRING_SOON"],
          },
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
                amenities: {
                  include: {
                    amenity: true,
                  },
                },
                parkingSpaces: {
                  where: { isAssigned: true },
                },
              },
            },
            tenants: {
              include: {
                tenant: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            },
            payments: {
              orderBy: {
                dueDate: "desc",
              },
              take: 5,
            },
            violations: {
              where: {
                isResolved: false,
              },
            },
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
      orderBy: {
        lease: {
          startDate: "desc",
        },
      },
    });

    if (!activeLease) {
      return {
        success: true,
        data: null,
        message: "No active lease found",
      };
    }

    // Calculate lease progress
    const now = new Date();
    const startDate = new Date(activeLease.lease.startDate);
    const endDate = activeLease.lease.endDate ? new Date(activeLease.lease.endDate) : null;
    
    let progress = 0;
    let daysRemaining = 0;
    
    if (endDate) {
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
      daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Calculate next rent due date
    const rentDueDay = activeLease.lease.rentDueDay;
    const today = new Date();
    const nextRentDue = new Date(today.getFullYear(), today.getMonth(), rentDueDay);
    
    if (nextRentDue < today) {
      nextRentDue.setMonth(nextRentDue.getMonth() + 1);
    }

    const enrichedData = {
      ...activeLease,
      leaseProgress: {
        percentage: Math.round(progress),
        daysRemaining,
        isExpiringSoon: daysRemaining <= 60 && daysRemaining > 0,
      },
      nextRentDue: nextRentDue.toISOString(),
      hasUnresolvedViolations: activeLease.lease.violations.length > 0,
      hasPendingRenewalOffer: activeLease.lease.renewalOffers.length > 0,
    };

    // ✅ FIXED: Serialize all data before returning
    return {
      success: true,
      data: serializeForClient(enrichedData),
    };
  } catch (error) {
    console.error("Get current lease error:", error);
    return {
      success: false,
      error: "Failed to fetch lease information",
    };
  }
}

// -------------------------
// Get Lease History
// -------------------------
export async function getLeaseHistory(): Promise<LeaseResult> {
  try {
    const user = await getCurrentTenant();

    const leaseHistory = await prisma.leaseTenant.findMany({
      where: {
        tenantId: user.tenantProfile!.id,
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
                    city: true,
                    state: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        lease: {
          startDate: "desc",
        },
      },
    });

    // ✅ FIXED: Serialize all data before returning
    return {
      success: true,
      data: serializeForClient(leaseHistory),
    };
  } catch (error) {
    console.error("Get lease history error:", error);
    return {
      success: false,
      error: "Failed to fetch lease history",
    };
  }
}

// -------------------------
// Get Lease Documents
// -------------------------
export async function getLeaseDocuments(leaseId: string): Promise<LeaseResult> {
  try {
    const user = await getCurrentTenant();

    // Verify tenant has access to this lease
    const leaseTenant = await prisma.leaseTenant.findFirst({
      where: {
        leaseId,
        tenantId: user.tenantProfile!.id,
      },
    });

    if (!leaseTenant) {
      return {
        success: false,
        error: "Unauthorized access to lease documents",
      };
    }

    // Get lease with documents
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: {
          include: {
            property: {
              include: {
                documents: {
                  where: {
                    type: {
                      in: ["LEASE", "AMENDMENT", "NOTICE"],
                    },
                  },
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lease) {
      return {
        success: false,
        error: "Lease not found",
      };
    }

    const documents = [
      // Main lease document
      ...(lease.documentUrl ? [{
        id: `lease-${lease.id}`,
        name: "Lease Agreement",
        type: "LEASE",
        fileUrl: lease.documentUrl,
        createdAt: lease.createdAt.toISOString(),
      }] : []),
      // Property documents - serialize them
      ...lease.unit.property.documents.map(doc => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
    ];

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("Get lease documents error:", error);
    return {
      success: false,
      error: "Failed to fetch lease documents",
    };
  }
}

// -------------------------
// Request Lease Renewal
// -------------------------
export async function requestLeaseRenewal(leaseId: string, message?: string): Promise<LeaseResult> {
  try {
    const user = await getCurrentTenant();

    // Verify tenant has access to this lease
    const leaseTenant = await prisma.leaseTenant.findFirst({
      where: {
        leaseId,
        tenantId: user.tenantProfile!.id,
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
                        user: true,
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

    if (!leaseTenant) {
      return {
        success: false,
        error: "Lease not found",
      };
    }

    // Check if lease is eligible for renewal (within 90 days of expiration)
    const lease = leaseTenant.lease;
    if (!lease.endDate) {
      return {
        success: false,
        error: "This lease has no end date",
      };
    }

    const daysUntilEnd = Math.floor(
      (new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilEnd > 90) {
      return {
        success: false,
        error: "Renewal requests can only be made within 90 days of lease expiration",
      };
    }

    if (daysUntilEnd < 0) {
      return {
        success: false,
        error: "This lease has already expired",
      };
    }

    // Create notification for landlord
    await prisma.notification.create({
      data: {
        userId: lease.unit.property.landlord.userId,
        type: "LEASE_RENEWAL_OFFER",
        title: "Lease Renewal Request",
        message: `${user.name} has requested to renew their lease at ${lease.unit.property.name} - Unit ${lease.unit.unitNumber}`,
        actionUrl: `/dashboard/leases/${leaseId}`,
        metadata: {
          leaseId,
          tenantId: user.tenantProfile!.id,
          message,
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: "LEASE_CREATED",
        action: "Requested lease renewal",
        metadata: {
          leaseId,
          message,
        },
      },
    });

    revalidatePath("/dashboard/my-lease");

    return {
      success: true,
      message: "Renewal request sent to landlord",
    };
  } catch (error) {
    console.error("Request lease renewal error:", error);
    return {
      success: false,
      error: "Failed to send renewal request",
    };
  }
}

// -------------------------
// Respond to Renewal Offer
// -------------------------
export async function respondToRenewalOffer(
  offerId: string,
  action: "ACCEPTED" | "REJECTED" | "COUNTERED",
  counterOffer?: {
    rentAmount?: number;
    endDate?: string;
    message?: string;
  }
): Promise<LeaseResult> {
  try {
    const user = await getCurrentTenant();

    const offer = await prisma.leaseRenewalOffer.findUnique({
      where: { id: offerId },
      include: {
        lease: {
          include: {
            tenants: {
              where: {
                tenantId: user.tenantProfile!.id,
              },
            },
            unit: {
              include: {
                property: {
                  include: {
                    landlord: {
                      include: {
                        user: true,
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

    if (!offer) {
      return {
        success: false,
        error: "Renewal offer not found",
      };
    }

    // Verify tenant has access
    if (offer.lease.tenants.length === 0) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if offer is still valid
    if (offer.status !== "SENT" && offer.status !== "COUNTERED") {
      return {
        success: false,
        error: "This offer has already been responded to",
      };
    }

    if (new Date() > offer.expiresAt) {
      return {
        success: false,
        error: "This offer has expired",
      };
    }

    // Update offer
    const updatedOffer = await prisma.$transaction(async (tx) => {
      const updated = await tx.leaseRenewalOffer.update({
        where: { id: offerId },
        data: {
          status: action,
          respondedAt: new Date(),
          ...(action === "COUNTERED" && counterOffer && {
            counterOffer,
          }),
        },
      });

      // Create notification for landlord
      await tx.notification.create({
        data: {
          userId: offer.lease.unit.property.landlord.userId,
          type: "LEASE_RENEWAL_OFFER",
          title: `Renewal Offer ${action}`,
          message: `${user.name} has ${action.toLowerCase()} your renewal offer for ${offer.lease.unit.property.name} - Unit ${offer.lease.unit.unitNumber}`,
          actionUrl: `/dashboard/leases/${offer.leaseId}`,
          metadata: {
            offerId,
            action,
            counterOffer,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard/my-lease");

    // ✅ FIXED: Serialize before returning
    return {
      success: true,
      data: serializeForClient(updatedOffer),
      message: `Renewal offer ${action.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("Respond to renewal offer error:", error);
    return {
      success: false,
      error: "Failed to respond to renewal offer",
    };
  }
}

// -------------------------
// Report Lease Violation
// -------------------------
export async function reportLeaseViolation(
  type: string,
  description: string
): Promise<LeaseResult> {
  try {
    const user = await getCurrentTenant();

    // Get active lease
    const activeLease = await prisma.leaseTenant.findFirst({
      where: {
        tenantId: user.tenantProfile!.id,
        lease: {
          status: "ACTIVE",
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
                        user: true,
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

    if (!activeLease) {
      return {
        success: false,
        error: "No active lease found",
      };
    }

    // This would typically be used to report issues to the landlord
    // Create notification for landlord
    await prisma.notification.create({
      data: {
        userId: activeLease.lease.unit.property.landlord.userId,
        type: "MAINTENANCE_REQUEST",
        title: "Lease Issue Reported",
        message: `${user.name} reported: ${type}`,
        actionUrl: `/dashboard/leases/${activeLease.leaseId}`,
        metadata: {
          leaseId: activeLease.leaseId,
          type,
          description,
        },
      },
    });

    return {
      success: true,
      message: "Issue reported to landlord",
    };
  } catch (error) {
    console.error("Report violation error:", error);
    return {
      success: false,
      error: "Failed to report issue",
    };
  }
}