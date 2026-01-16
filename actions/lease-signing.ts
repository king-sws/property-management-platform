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
    signature: string; // Base64 signature image or text
    ipAddress?: string;
    userAgent?: string;
    agreedToTerms: boolean;
  }
): Promise<SigningResult> {
  try {
    const user = await getCurrentUser();

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
                    user: true,
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

    // Verify lease is in correct status
    if (lease.status !== "PENDING_SIGNATURE" && lease.status !== "DRAFT") {
      return {
        success: false,
        error: "This lease is not available for signing",
      };
    }

    const isLandlord =
      user.role === "LANDLORD" &&
      lease.unit.property.landlordId === user.landlordProfile?.id;

    const tenantRecord = lease.tenants.find((lt) => lt.tenant.userId === user.id);
    const isTenant = user.role === "TENANT" && !!tenantRecord;

    if (!isLandlord && !isTenant) {
      return {
        success: false,
        error: "Unauthorized to sign this lease",
      };
    }

    // Check if already signed
    if (isLandlord && lease.landlordSignedAt) {
      return {
        success: false,
        error: "You have already signed this lease",
      };
    }

    if (isTenant && tenantRecord?.signedAt) {
      return {
        success: false,
        error: "You have already signed this lease",
      };
    }

    // Process signature
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // Update signature based on role
      if (isLandlord) {
        await tx.lease.update({
          where: { id: leaseId },
          data: {
            landlordSignedAt: now,
            status: "PENDING_SIGNATURE" as LeaseStatus,
          },
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            userId: user.id,
            type: "LEASE_CREATED" as ActivityType,
            action: `Signed lease agreement for Unit ${lease.unit.unitNumber}`,
            metadata: {
              leaseId,
              role: "LANDLORD",
              ipAddress: signatureData.ipAddress,
            },
          },
        });

        // Notify tenants
        for (const leaseTenant of lease.tenants) {
          await tx.notification.create({
            data: {
              userId: leaseTenant.tenant.userId,
              type: "LEASE_CREATED",
              title: "Landlord Signed Lease",
              message: `${user.name} has signed the lease agreement. Your signature is now required.`,
              actionUrl: `/dashboard/lease-signing/${leaseId}`,
              metadata: { leaseId },
            },
          });
        }
      } else if (isTenant && tenantRecord) {
        // Update tenant signature
        await tx.leaseTenant.update({
          where: { id: tenantRecord.id },
          data: {
            signedAt: now,
          },
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            userId: user.id,
            type: "LEASE_CREATED" as ActivityType,
            action: `Signed lease agreement for Unit ${lease.unit.unitNumber}`,
            metadata: {
              leaseId,
              role: "TENANT",
              ipAddress: signatureData.ipAddress,
            },
          },
        });

        // Notify landlord
        await tx.notification.create({
          data: {
            userId: lease.unit.property.landlord.userId,
            type: "LEASE_CREATED",
            title: "Tenant Signed Lease",
            message: `${user.name} has signed the lease agreement for Unit ${lease.unit.unitNumber}.`,
            actionUrl: `/dashboard/leases/${leaseId}`,
            metadata: { leaseId },
          },
        });
      }

      // Check if all signatures are complete
      const updatedLease = await tx.lease.findUnique({
        where: { id: leaseId },
        include: {
          tenants: true,
        },
      });

      if (updatedLease) {
        const allTenantsSigned = updatedLease.tenants.every((lt: { signedAt: any; }) => lt.signedAt);
        const landlordSigned = !!updatedLease.landlordSignedAt;

        // If all parties have signed, activate the lease
        if (allTenantsSigned && landlordSigned) {
          await tx.lease.update({
            where: { id: leaseId },
            data: {
              status: "ACTIVE" as LeaseStatus,
              allTenantsSignedAt: now,
            },
          });

          // ✅ Mark unit as OCCUPIED
          await tx.unit.update({
            where: { id: lease.unitId },
            data: {
              status: "OCCUPIED",
            },
          });

          // Notify all parties that lease is now active
          const notificationPromises = [
            // Notify landlord
            tx.notification.create({
              data: {
                userId: lease.unit.property.landlord.userId,
                type: "LEASE_CREATED",
                title: "Lease Agreement Active",
                message: `All parties have signed. The lease for Unit ${lease.unit.unitNumber} is now active.`,
                actionUrl: `/dashboard/leases/${leaseId}`,
                metadata: { leaseId },
              },
            }),
            // Notify all tenants
            ...lease.tenants.map((leaseTenant) =>
              tx.notification.create({
                data: {
                  userId: leaseTenant.tenant.userId,
                  type: "LEASE_CREATED",
                  title: "Lease Agreement Active",
                  message: `All parties have signed. Your lease is now active!`,
                  actionUrl: `/dashboard/my-lease`,
                  metadata: { leaseId },
                },
              })
            ),
          ];

          await Promise.all(notificationPromises);

          // Log activation
          await tx.activityLog.create({
            data: {
              userId: user.id,
              type: "LEASE_CREATED" as ActivityType,
              action: `Lease activated for Unit ${lease.unit.unitNumber} - all signatures collected`,
              metadata: {
                leaseId,
                activatedBy: user.id,
              },
            },
          });
        }
      }

      return updatedLease;
    });

    revalidatePath(`/dashboard/lease-signing/${leaseId}`);
    revalidatePath(`/dashboard/leases/${leaseId}`);
    revalidatePath("/dashboard/leases");
    revalidatePath("/dashboard/my-lease");

    // Check if lease is now fully signed
    const allSigned = result?.tenants.every((lt: { signedAt: any; }) => lt.signedAt) && result?.landlordSignedAt;

    return {
      success: true,
      data: serializeForClient(result),
      message: allSigned
        ? "Lease signed successfully! The lease is now active."
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