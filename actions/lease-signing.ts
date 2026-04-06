/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/lease-signing.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActivityType, LeaseStatus } from "@/lib/generated/prisma/enums";

// -------------------------
// Types
// -------------------------
type SigningResult = {
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      landlordProfile: true,
      tenantProfile: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

function serializeForClient(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'object' && 'toJSON' in obj && typeof obj.toJSON === 'function') {
    return Number(obj);
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeForClient);
  }
  
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
// Get Lease for Signing
// -------------------------
export async function getLeaseForSigning(leaseId: string): Promise<SigningResult> {
  try {
    const user = await getCurrentUser();

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: {
          include: {
            property: {
              include: {
                landlord: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                      },
                    },
                  },
                },
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
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
      },
    });

    if (!lease) {
      return {
        success: false,
        error: "Lease not found",
      };
    }

    // Check authorization
    const isLandlord =
      user.role === "LANDLORD" &&
      lease.unit.property.landlordId === user.landlordProfile?.id;

    const isTenant =
      user.role === "TENANT" &&
      lease.tenants.some((lt) => lt.tenant.userId === user.id);

    const isAdmin = user.role === "ADMIN";

    if (!isLandlord && !isTenant && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized to view this lease",
      };
    }

    // ✅ Allow viewing if ACTIVE (for the success screen after signing)
    // Only block if it's EXPIRED, TERMINATED, etc.
    const allowedStatuses = ["PENDING_SIGNATURE", "DRAFT", "ACTIVE"];
    if (!allowedStatuses.includes(lease.status)) {
      return {
        success: false,
        error: "This lease is not available for viewing",
      };
    }

    // Determine signing status for current user
    let userSigningStatus = {
      canSign: false,
      hasSigned: false,
      signedAt: null as string | null,
      role: user.role,
    };

    if (isLandlord) {
      userSigningStatus = {
        canSign: !lease.landlordSignedAt && lease.status !== "ACTIVE",
        hasSigned: !!lease.landlordSignedAt,
        signedAt: lease.landlordSignedAt?.toISOString() || null,
        role: "LANDLORD",
      };
    } else if (isTenant) {
      const tenantRecord = lease.tenants.find((lt) => lt.tenant.userId === user.id);
      userSigningStatus = {
        canSign: !tenantRecord?.signedAt && lease.status !== "ACTIVE",
        hasSigned: !!tenantRecord?.signedAt,
        signedAt: tenantRecord?.signedAt?.toISOString() || null,
        role: "TENANT",
      };
    }

    // Calculate overall signing progress
    const totalSignaturesNeeded = lease.tenants.length + 1; // tenants + landlord
    const landlordSigned = lease.landlordSignedAt ? 1 : 0;
    const tenantsSigned = lease.tenants.filter((lt) => lt.signedAt).length;
    const totalSigned = landlordSigned + tenantsSigned;
    const isFullySigned = totalSigned === totalSignaturesNeeded;

    const enrichedData = {
      ...lease,
      signingProgress: {
        totalNeeded: totalSignaturesNeeded,
        totalSigned,
        percentage: Math.round((totalSigned / totalSignaturesNeeded) * 100),
        isFullySigned,
        landlordSigned: !!lease.landlordSignedAt,
        tenantsSignedCount: tenantsSigned,
      },
      userSigningStatus,
    };

    return {
      success: true,
      data: serializeForClient(enrichedData),
    };
  } catch (error) {
    console.error("Get lease for signing error:", error);
    return {
      success: false,
      error: "Failed to fetch lease details",
    };
  }
}

// -------------------------
// Sign Lease (Landlord or Tenant)
// -------------------------
export async function signLease(
  leaseId: string,
  signatureData: {
    signature: string;
    ipAddress?: string;
    userAgent?: string;
    agreedToTerms: boolean;
  }
): Promise<SigningResult> {
  try {
    const user = await getCurrentUser();
    // ✅ user.id = session.user.id (from getCurrentUser which calls prisma.user.findUnique)

    if (!signatureData.agreedToTerms) {
      return {
        success: false,
        error: "You must agree to the terms to sign the lease",
      };
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: {
          include: {
            property: {
              include: {
                landlord: {
                  include: {
                    user: true, // ✅ needed for landlord.userId in notifications
                  },
                },
              },
            },
          },
        },
        tenants: {
          include: {
            tenant: {
              include: {
                user: true, // ✅ needed for tenant.userId in payments + notifications
              },
            },
          },
        },
      },
    });

    if (!lease) {
      return { success: false, error: "Lease not found" };
    }

    if (lease.status !== "PENDING_SIGNATURE" && lease.status !== "DRAFT") {
      return { success: false, error: "This lease is not available for signing" };
    }

    const isLandlord =
      user.role === "LANDLORD" &&
      lease.unit.property.landlordId === user.landlordProfile?.id;

    const tenantRecord = lease.tenants.find((lt) => lt.tenant.userId === user.id);
    const isTenant = user.role === "TENANT" && !!tenantRecord;

    if (!isLandlord && !isTenant) {
      return { success: false, error: "Unauthorized to sign this lease" };
    }

    if (isLandlord && lease.landlordSignedAt) {
      return { success: false, error: "You have already signed this lease" };
    }

    if (isTenant && tenantRecord?.signedAt) {
      return { success: false, error: "You have already signed this lease" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // -------------------------------------------------------
      // LANDLORD SIGNS
      // -------------------------------------------------------
      if (isLandlord) {
        await tx.lease.update({
          where: { id: leaseId },
          data: {
            landlordSignedAt: now,
            status: "PENDING_SIGNATURE" as LeaseStatus,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: user.id, // ✅ user.id from session
            type: "LEASE_CREATED" as ActivityType,
            action: `Signed lease agreement for Unit ${lease.unit.unitNumber}`,
            metadata: { leaseId, role: "LANDLORD", ipAddress: signatureData.ipAddress },
          },
        });

        // Notify each tenant that landlord signed and their signature is needed
        for (const leaseTenant of lease.tenants) {
          await tx.notification.create({
            data: {
              userId: leaseTenant.tenant.userId, // ✅ tenant.user.id from included relation
              type: "LEASE_CREATED",
              title: "Landlord Signed Lease",
              message: `${user.name} has signed the lease. Your signature is now required.`,
              actionUrl: `/dashboard/lease-signing/${leaseId}`,
              metadata: { leaseId },
            },
          });
        }
      }

      // -------------------------------------------------------
      // TENANT SIGNS
      // -------------------------------------------------------
      else if (isTenant && tenantRecord) {
        await tx.leaseTenant.update({
          where: { id: tenantRecord.id },
          data: { signedAt: now },
        });

        await tx.activityLog.create({
          data: {
            userId: user.id, // ✅ user.id from session
            type: "LEASE_CREATED" as ActivityType,
            action: `Signed lease agreement for Unit ${lease.unit.unitNumber}`,
            metadata: { leaseId, role: "TENANT", ipAddress: signatureData.ipAddress },
          },
        });

        await tx.notification.create({
          data: {
            userId: lease.unit.property.landlord.userId, // ✅ landlord.user.id from included relation
            type: "LEASE_CREATED",
            title: "Tenant Signed Lease",
            message: `${user.name} has signed the lease for Unit ${lease.unit.unitNumber}.`,
            actionUrl: `/dashboard/leases/${leaseId}`,
            metadata: { leaseId },
          },
        });
      }

      // -------------------------------------------------------
      // RE-FETCH to check if ALL parties have now signed
      // Must include tenant.user here because we need tenant.userId for payments below
      // -------------------------------------------------------
      const updatedLease = await tx.lease.findUnique({
        where: { id: leaseId },
        include: {
          tenants: {
            include: {
              tenant: {
                include: {
                  user: true, // ✅ needed for userId on payment create
                },
              },
            },
          },
        },
      });

      if (!updatedLease) return null;

      const allTenantsSigned = updatedLease.tenants.every((lt: { signedAt: any; }) => lt.signedAt);
      const landlordSigned = !!updatedLease.landlordSignedAt;

// -------------------------------------------------------
// ALL SIGNED → ACTIVATE LEASE
// -------------------------------------------------------
if (allTenantsSigned && landlordSigned) {
  // Idempotency check: skip if already active
  if (updatedLease.status === "ACTIVE") {
    // Already activated, just return
    return updatedLease;
  }

  // 1. Activate lease
  await tx.lease.update({
    where: { id: leaseId },
    data: {
      status: "ACTIVE" as LeaseStatus,
      allTenantsSignedAt: now,
    },
  });

  // 2. Mark unit as OCCUPIED
  await tx.unit.update({
    where: { id: lease.unitId },
    data: { status: "OCCUPIED" },
  });

  // 3. Pre-generate ALL monthly rent payments for the lease term
  const leaseStart = new Date(lease.startDate);
  const leaseEnd = lease.endDate ? new Date(lease.endDate) : null;
  const rentDueDay = lease.rentDueDay;

  // Build list of all due dates from startDate → endDate
  const dueDates: Date[] = [];

  // First due date: find the first rentDueDay on or after startDate
  let current = new Date(leaseStart.getFullYear(), leaseStart.getMonth(), rentDueDay);
  if (current < leaseStart) {
    // e.g. lease starts on the 15th, rentDueDay is 1 → push to next month
    current.setMonth(current.getMonth() + 1);
  }

  // If no end date (month-to-month), generate 12 months ahead
  const limit = leaseEnd ?? new Date(now.getFullYear(), now.getMonth() + 12, rentDueDay);

  while (current <= limit) {
    dueDates.push(new Date(current));
    current = new Date(current.getFullYear(), current.getMonth() + 1, rentDueDay);
  }

  // Create a payment record for EACH due date × EACH tenant
  for (const dueDate of dueDates) {
    for (const leaseTenant of updatedLease.tenants) {
      await tx.payment.create({
        data: {
          leaseId: lease.id,
          tenantId: leaseTenant.tenantId,
          userId: leaseTenant.tenant.userId,
          type: "RENT",
          status: "PENDING",
          method: "STRIPE_CARD",
          amount: lease.rentAmount,
          fee: 0,
          netAmount: lease.rentAmount,
          description: `Rent for ${dueDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}`,
          dueDate,
          // Covers the calendar month
          periodStart: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
          periodEnd: new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0),
        },
      });
    }
  }

  // 4. Create a RecurringPayment record for tracking/Stripe scheduling later
  await tx.recurringPayment.create({
    data: {
      leaseId: lease.id,
      isActive: true,
      paymentType: "RENT",
      amount: lease.rentAmount,
      frequency: "MONTHLY",
      dayOfMonth: rentDueDay,
      startDate: leaseStart,
      endDate: leaseEnd,
      nextPaymentDate: dueDates[0] ?? now, // first upcoming due date
      lastPaymentDate: null,
    },
  });

  // 5. Notify landlord that lease is active
  await tx.notification.create({
    data: {
      userId: lease.unit.property.landlord.userId,
      type: "LEASE_CREATED",
      title: "Lease Agreement Active",
      message: `All parties signed. Lease for Unit ${lease.unit.unitNumber} is now active. ${dueDates.length} rent payment${dueDates.length !== 1 ? "s" : ""} scheduled.`,
      actionUrl: `/dashboard/leases/${leaseId}`,
      metadata: { leaseId },
    },
  });

  // 6. Notify each tenant — lease active + all payments visible
  for (const leaseTenant of lease.tenants) {
    await tx.notification.create({
      data: {
        userId: leaseTenant.tenant.userId,
        type: "LEASE_CREATED",
        title: "Lease is Now Active 🎉",
        message: `All parties have signed. Your lease is active and ${dueDates.length} rent payment${dueDates.length !== 1 ? "s" : ""} have been scheduled.`,
        actionUrl: `/dashboard/my-lease`,
        metadata: { leaseId },
      },
    });
  }

  // 7. Log activation
  await tx.activityLog.create({
    data: {
      userId: user.id,
      type: "LEASE_CREATED" as ActivityType,
      action: `Lease activated for Unit ${lease.unit.unitNumber} — ${dueDates.length} payments pre-generated`,
      metadata: { leaseId, activatedBy: user.id, paymentsGenerated: dueDates.length },
    },
  });
}

      return updatedLease;
    });

    revalidatePath(`/dashboard/lease-signing/${leaseId}`);
    revalidatePath(`/dashboard/leases/${leaseId}`);
    revalidatePath("/dashboard/leases");
    revalidatePath("/dashboard/my-lease");
    revalidatePath("/dashboard/payments"); // ✅ so tenant sees new payment immediately

    const allSigned =
      result?.tenants.every((lt: { signedAt: any; }) => lt.signedAt) && result?.landlordSignedAt;

    return {
      success: true,
      data: serializeForClient(result),
      message: allSigned
        ? "Lease signed! The lease is now active and your first rent payment has been created."
        : "Lease signed successfully. Waiting for other signatures.",
    };
  } catch (error) {
    console.error("Sign lease error:", error);
    return {
      success: false,
      error: "Failed to sign lease. Please try again.",
    };
  }
}

// -------------------------
// Get Pending Signatures (for dashboard)
// -------------------------
export async function getPendingSignatures(): Promise<SigningResult> {
  try {
    const user = await getCurrentUser();

    let pendingLeases: any[] = [];

    if (user.role === "LANDLORD" && user.landlordProfile) {
      // Get leases where landlord needs to sign
      pendingLeases = await prisma.lease.findMany({
        where: {
          unit: {
            property: {
              landlordId: user.landlordProfile.id,
            },
          },
          status: {
            in: ["PENDING_SIGNATURE", "DRAFT"],
          },
          landlordSignedAt: null,
        },
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
          createdAt: "desc",
        },
      });
    } else if (user.role === "TENANT" && user.tenantProfile) {
      // Get leases where tenant needs to sign
      const leaseTenants = await prisma.leaseTenant.findMany({
        where: {
          tenantId: user.tenantProfile.id,
          signedAt: null,
          lease: {
            status: {
              in: ["PENDING_SIGNATURE", "DRAFT"],
            },
          },
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
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      pendingLeases = leaseTenants.map((lt) => lt.lease);
    }

    return {
      success: true,
      data: serializeForClient(pendingLeases),
    };
  } catch (error) {
    console.error("Get pending signatures error:", error);
    return {
      success: false,
      error: "Failed to fetch pending signatures",
    };
  }
}

// -------------------------
// Resend Signing Invitation
// -------------------------
export async function resendSigningInvitation(leaseId: string): Promise<SigningResult> {
  try {
    const user = await getCurrentUser();

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
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
            tenant: {
              include: {
                user: true,
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

    // Only landlord can resend invitations
    if (
      user.role !== "LANDLORD" ||
      lease.unit.property.landlordId !== user.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Send notifications to unsigned parties
    const notifications: any[] = [];

    // Notify landlord if not signed
    if (!lease.landlordSignedAt) {
      notifications.push(
        prisma.notification.create({
          data: {
            userId: user.id,
            type: "LEASE_CREATED",
            title: "Lease Signature Reminder",
            message: `Reminder: Please sign the lease agreement for Unit ${lease.unit.unitNumber}`,
            actionUrl: `/dashboard/lease-signing/${leaseId}`,
            metadata: { leaseId },
          },
        })
      );
    }

    // Notify unsigned tenants
    for (const leaseTenant of lease.tenants) {
      if (!leaseTenant.signedAt) {
        notifications.push(
          prisma.notification.create({
            data: {
              userId: leaseTenant.tenant.userId,
              type: "LEASE_CREATED",
              title: "Lease Signature Reminder",
              message: `Reminder: Please sign your lease agreement for ${lease.unit.property.name} - Unit ${lease.unit.unitNumber}`,
              actionUrl: `/dashboard/lease-signing/${leaseId}`,
              metadata: { leaseId },
            },
          })
        );
      }
    }

    await Promise.all(notifications);

    return {
      success: true,
      message: "Signing reminders sent successfully",
    };
  } catch (error) {
    console.error("Resend signing invitation error:", error);
    return {
      success: false,
      error: "Failed to send reminders",
    };
  }
}