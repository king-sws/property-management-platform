/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/leases.ts - PRODUCTION READY WITH UNIT STATUS MANAGEMENT
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, LeaseStatus, LeaseType } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";

// -------------------------
// Validation Schemas
// -------------------------
const createLeaseSchema = z.object({
  unitId: z.string().min(1, "Unit is required"),
  tenantIds: z.array(z.string()).min(1, "At least one tenant is required"),
  type: z.enum(["FIXED_TERM", "MONTH_TO_MONTH", "YEAR_TO_YEAR"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  rentAmount: z.number().positive("Rent amount must be positive"),
  deposit: z.number().positive("Deposit must be positive"),
  lateFeeAmount: z.number().optional(),
  lateFeeDays: z.number().int().optional(),
  rentDueDay: z.number().int().min(1).max(31),
  terms: z.string().optional(),
});

const updateLeaseSchema = z.object({
  status: z.enum([
    "DRAFT",
    "PENDING_SIGNATURE",
    "ACTIVE",
    "EXPIRING_SOON",
    "EXPIRED",
    "TERMINATED",
    "RENEWED",
  ]).optional(),
  rentAmount: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  lateFeeAmount: z.number().optional(),
  lateFeeDays: z.number().int().optional(),
  rentDueDay: z.number().int().min(1).max(31).optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

const terminateLeaseSchema = z.object({
  terminationDate: z.string().min(1, "Termination date is required"),
  reason: z.string().min(10, "Please provide a reason for termination"),
});

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
async function getCurrentUserWithRole() {
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

function serializeLease(lease: any) {
  return {
    ...lease,
    // ✅ Lease-level Decimals
    rentAmount: lease.rentAmount ? Number(lease.rentAmount) : null,
    deposit: lease.deposit ? Number(lease.deposit) : null,
    lateFeeAmount: lease.lateFeeAmount ? Number(lease.lateFeeAmount) : null,
    
    // Dates
    startDate: lease.startDate?.toISOString() || null,
    endDate: lease.endDate?.toISOString() || null,
    createdAt: lease.createdAt?.toISOString() || null,
    updatedAt: lease.updatedAt?.toISOString() || null,
    deletedAt: lease.deletedAt?.toISOString() || null,
    landlordSignedAt: lease.landlordSignedAt?.toISOString() || null,
    allTenantsSignedAt: lease.allTenantsSignedAt?.toISOString() || null,
    
    // ✅ Unit with nested property
    unit: lease.unit ? {
      ...lease.unit,
      // Unit-level Decimals
      bathrooms: lease.unit.bathrooms ? Number(lease.unit.bathrooms) : null,
      squareFeet: lease.unit.squareFeet ? Number(lease.unit.squareFeet) : null,
      rentAmount: lease.unit.rentAmount ? Number(lease.unit.rentAmount) : null,
      deposit: lease.unit.deposit ? Number(lease.unit.deposit) : null,
      
      createdAt: lease.unit.createdAt?.toISOString() || null,
      updatedAt: lease.unit.updatedAt?.toISOString() || null,
      deletedAt: lease.unit.deletedAt?.toISOString() || null,
      
      // ✅ Property with ALL Decimal fields converted
      property: lease.unit.property ? {
        ...lease.unit.property,
        // Property-level Decimals - THIS WAS MISSING!
        purchasePrice: lease.unit.property.purchasePrice ? Number(lease.unit.property.purchasePrice) : null,
        currentValue: lease.unit.property.currentValue ? Number(lease.unit.property.currentValue) : null,
        propertyTax: lease.unit.property.propertyTax ? Number(lease.unit.property.propertyTax) : null,
        insurance: lease.unit.property.insurance ? Number(lease.unit.property.insurance) : null,
        hoaFees: lease.unit.property.hoaFees ? Number(lease.unit.property.hoaFees) : null,
        latitude: lease.unit.property.latitude ? Number(lease.unit.property.latitude) : null,
        longitude: lease.unit.property.longitude ? Number(lease.unit.property.longitude) : null,
        squareFeet: lease.unit.property.squareFeet ? Number(lease.unit.property.squareFeet) : null,
        lotSize: lease.unit.property.lotSize ? Number(lease.unit.property.lotSize) : null,
        
        createdAt: lease.unit.property.createdAt?.toISOString() || null,
        updatedAt: lease.unit.property.updatedAt?.toISOString() || null,
        deletedAt: lease.unit.property.deletedAt?.toISOString() || null,
        
        // ✅ Serialize nested landlord
        landlord: lease.unit.property.landlord ? {
          ...lease.unit.property.landlord,
          createdAt: lease.unit.property.landlord.createdAt?.toISOString() || null,
          updatedAt: lease.unit.property.landlord.updatedAt?.toISOString() || null,
          deletedAt: lease.unit.property.landlord.deletedAt?.toISOString() || null,
          user: lease.unit.property.landlord.user ? {
            ...lease.unit.property.landlord.user,
            createdAt: lease.unit.property.landlord.user.createdAt?.toISOString() || null,
            updatedAt: lease.unit.property.landlord.user.updatedAt?.toISOString() || null,
          } : null,
        } : null,
      } : null,
    } : null,
    
    // ✅ Tenants array
    tenants: lease.tenants ? lease.tenants.map((lt: any) => ({
      ...lt,
      createdAt: lt.createdAt?.toISOString() || null,
      signedAt: lt.signedAt?.toISOString() || null,
      tenant: lt.tenant ? {
        ...lt.tenant,
        annualIncome: lt.tenant.annualIncome ? Number(lt.tenant.annualIncome) : null,
        dateOfBirth: lt.tenant.dateOfBirth?.toISOString() || null,
        createdAt: lt.tenant.createdAt?.toISOString() || null,
        updatedAt: lt.tenant.updatedAt?.toISOString() || null,
        deletedAt: lt.tenant.deletedAt?.toISOString() || null,
        user: lt.tenant.user ? {
          ...lt.tenant.user,
          createdAt: lt.tenant.user.createdAt?.toISOString() || null,
          updatedAt: lt.tenant.user.updatedAt?.toISOString() || null,
        } : null,
      } : null,
    })) : [],
    
    // ✅ Payments array
    payments: lease.payments ? lease.payments.map((payment: any) => ({
      ...payment,
      amount: payment.amount ? Number(payment.amount) : null,
      lateFee: payment.lateFee ? Number(payment.lateFee) : null,
      dueDate: payment.dueDate?.toISOString() || null,
      paidAt: payment.paidAt?.toISOString() || null,
      createdAt: payment.createdAt?.toISOString() || null,
      updatedAt: payment.updatedAt?.toISOString() || null,
    })) : [],
    
    // ✅ Violations array
    violations: lease.violations ? lease.violations.map((violation: any) => ({
      ...violation,
      issuedDate: violation.issuedDate?.toISOString() || null,
      resolvedDate: violation.resolvedDate?.toISOString() || null,
      createdAt: violation.createdAt?.toISOString() || null,
      updatedAt: violation.updatedAt?.toISOString() || null,
    })) : [],
    
    // ✅ Renewal offers array
    renewalOffers: lease.renewalOffers ? lease.renewalOffers.map((offer: any) => ({
      ...offer,
      newRentAmount: offer.newRentAmount ? Number(offer.newRentAmount) : null,
      newDeposit: offer.newDeposit ? Number(offer.newDeposit) : null,
      offeredAt: offer.offeredAt?.toISOString() || null,
      expiresAt: offer.expiresAt?.toISOString() || null,
      respondedAt: offer.respondedAt?.toISOString() || null,
      createdAt: offer.createdAt?.toISOString() || null,
      updatedAt: offer.updatedAt?.toISOString() || null,
    })) : [],
    
    // ✅ Deposit deductions array
    depositDeductions: lease.depositDeductions ? lease.depositDeductions.map((deduction: any) => ({
      ...deduction,
      amount: deduction.amount ? Number(deduction.amount) : null,
      createdAt: deduction.createdAt?.toISOString() || null,
    })) : [],
  };
}

// -------------------------
// Create Lease
// -------------------------
export async function createLease(data: z.infer<typeof createLeaseSchema>): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can create leases",
      };
    }
    
    const validated = createLeaseSchema.parse(data);
    
    // Verify unit exists and belongs to landlord
    const unit = await prisma.unit.findUnique({
      where: { id: validated.unitId },
      include: {
        property: true,
      },
    });
    
    if (!unit) {
      return {
        success: false,
        error: "Unit not found",
      };
    }
    
    if (
      currentUser.role === "LANDLORD" &&
      unit.property.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "You don't have permission to create a lease for this unit",
      };
    }
    
    // Check for overlapping leases
    const overlappingLeases = await prisma.lease.findMany({
      where: {
        unitId: validated.unitId,
        status: {
          in: ["ACTIVE", "PENDING_SIGNATURE"],
        },
        OR: [
          {
            startDate: {
              lte: new Date(validated.startDate),
            },
            endDate: validated.endDate
              ? {
                  gte: new Date(validated.startDate),
                }
              : undefined,
          },
          validated.endDate
            ? {
                startDate: {
                  lte: new Date(validated.endDate),
                },
                endDate: {
                  gte: new Date(validated.endDate),
                },
              }
            : {},
        ],
      },
    });
    
    if (overlappingLeases.length > 0) {
      return {
        success: false,
        error: "This unit already has an active lease for the specified dates",
      };
    }
    
    // Verify all tenants exist
    const tenants = await prisma.tenant.findMany({
      where: {
        id: {
          in: validated.tenantIds,
        },
        deletedAt: null,
      },
    });
    
    if (tenants.length !== validated.tenantIds.length) {
      return {
        success: false,
        error: "One or more tenants not found",
      };
    }
    
    // Create lease
    const lease = await prisma.$transaction(async (tx) => {
      const newLease = await tx.lease.create({
        data: {
          unitId: validated.unitId,
          primaryTenantId: validated.tenantIds[0],
          type: validated.type as LeaseType,
          status: "DRAFT" as LeaseStatus,
          startDate: new Date(validated.startDate),
          endDate: validated.endDate ? new Date(validated.endDate) : null,
          rentAmount: validated.rentAmount,
          deposit: validated.deposit,
          lateFeeAmount: validated.lateFeeAmount,
          lateFeeDays: validated.lateFeeDays || 5,
          rentDueDay: validated.rentDueDay,
          terms: validated.terms,
        },
      });
      
      // Create lease tenant relationships
      await Promise.all(
        validated.tenantIds.map((tenantId, index) =>
          tx.leaseTenant.create({
            data: {
              leaseId: newLease.id,
              tenantId: tenantId,
              isPrimaryTenant: index === 0,
            },
          })
        )
      );
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "LEASE_CREATED" as ActivityType,
          action: `Created new lease for unit ${unit.unitNumber}`,
          metadata: {
            leaseId: newLease.id,
            unitId: validated.unitId,
            tenantIds: validated.tenantIds,
          },
        },
      });
      
      return newLease;
    });
    
    revalidatePath("/dashboard/leases");
    revalidatePath(`/dashboard/properties/${unit.property.id}`);
    
    return {
      success: true,
      data: lease,
      message: "Lease created successfully. Activate it to mark the unit as occupied.",
    };
  } catch (error) {
    console.error("Create lease error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create lease. Please try again.",
    };
  }
}

// -------------------------
// Get Leases
// -------------------------
export async function getLeases(params?: {
  search?: string;
  status?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
}): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    
    const where: Prisma.LeaseWhereInput = {
      deletedAt: null,
    };
    
    // ✅ FIXED: Single, clean filter logic
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      const unitFilter: Prisma.UnitWhereInput = {
        property: {
          landlordId: currentUser.landlordProfile.id,
        },
      };
      
      // Add property filter if specified
      if (params?.propertyId) {
        unitFilter.propertyId = params.propertyId;
      }
      
      where.unit = unitFilter;
    }
    
    // Filter by tenant
    if (currentUser.role === "TENANT" && currentUser.tenantProfile) {
      where.tenants = {
        some: {
          tenantId: currentUser.tenantProfile.id,
        },
      };
    }
    
    // Filter by status
    if (params?.status && params.status !== "ALL") {
      where.status = params.status as LeaseStatus;
    }
    
    // Search filter
    if (params?.search) {
      where.OR = [
        {
          unit: {
            unitNumber: {
              contains: params.search,
              mode: "insensitive",
            },
          },
        },
        {
          unit: {
            property: {
              name: {
                contains: params.search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          tenants: {
            some: {
              tenant: {
                user: {
                  name: {
                    contains: params.search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
      ];
    }
    
    const [leases, total] = await Promise.all([
      prisma.lease.findMany({
        where,
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
            where: {
              status: "COMPLETED",
            },
            orderBy: {
              paidAt: "desc",
            },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.lease.count({ where }),
    ]);

    const serializedLeases = leases.map(serializeLease);
    
    return {
      success: true,
      data: {
        leases: serializedLeases,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get leases error:", error);
    return {
      success: false,
      error: "Failed to fetch leases",
    };
  }
}

// -------------------------
// Get Lease by ID
// -------------------------
export async function getLeaseById(leaseId: string): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
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
                        name: true,
                        email: true,
                        phone: true,
                      },
                    },
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
            createdAt: "desc",
          },
          take: 10,
        },
        violations: {
          orderBy: {
            issuedDate: "desc",
          },
        },
        renewalOffers: {
          orderBy: {
            createdAt: "desc",
          },
        },
        depositDeductions: true,
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
      currentUser.role === "LANDLORD" &&
      lease.unit.property.landlordId === currentUser.landlordProfile?.id;
    
    const isTenant =
      currentUser.role === "TENANT" &&
      lease.tenants.some((lt) => lt.tenant.userId === currentUser.id);
    
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isLandlord && !isTenant && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    return {
      success: true,
      data: lease,
    };
  } catch (error) {
    console.error("Get lease error:", error);
    return {
      success: false,
      error: "Failed to fetch lease details",
    };
  }
}

// -------------------------
// Update Lease - WITH UNIT STATUS MANAGEMENT
// -------------------------
export async function updateLease(
  leaseId: string,
  data: z.infer<typeof updateLeaseSchema>
): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can update leases",
      };
    }
    
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: {
          include: {
            property: true,
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
    
    if (
      currentUser.role === "LANDLORD" &&
      lease.unit.property.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const validated = updateLeaseSchema.parse(data);
    
    // ✅ CRITICAL: Track if status is changing
    const oldStatus = lease.status;
    const newStatus = validated.status;
    
    const updatedLease = await prisma.$transaction(async (tx) => {
      const updated = await tx.lease.update({
        where: { id: leaseId },
        data: {
          ...(validated.status && { status: validated.status as LeaseStatus }),
          ...(validated.rentAmount !== undefined && { rentAmount: validated.rentAmount }),
          ...(validated.deposit !== undefined && { deposit: validated.deposit }),
          ...(validated.lateFeeAmount !== undefined && { lateFeeAmount: validated.lateFeeAmount }),
          ...(validated.lateFeeDays !== undefined && { lateFeeDays: validated.lateFeeDays }),
          ...(validated.rentDueDay !== undefined && { rentDueDay: validated.rentDueDay }),
          ...(validated.terms !== undefined && { terms: validated.terms }),
          ...(validated.notes !== undefined && { notes: validated.notes }),
        },
      });
      
      // ✅ NEW: Update unit status based on lease status changes
      if (newStatus && newStatus !== oldStatus) {
        // When lease becomes ACTIVE → unit becomes OCCUPIED
        if (newStatus === "ACTIVE") {
          await tx.unit.update({
            where: { id: lease.unitId },
            data: { status: "OCCUPIED" },
          });
          
          console.log(`✅ Unit ${lease.unit.unitNumber} marked as OCCUPIED (lease activated)`);
        }
        
        // When lease becomes TERMINATED or EXPIRED → unit becomes VACANT
        if (newStatus === "TERMINATED" || newStatus === "EXPIRED") {
          await tx.unit.update({
            where: { id: lease.unitId },
            data: { status: "VACANT" },
          });
          
          console.log(`✅ Unit ${lease.unit.unitNumber} marked as VACANT (lease ${newStatus.toLowerCase()})`);
        }
      }
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_UPDATED" as ActivityType,
          action: `Updated lease for unit ${lease.unit.unitNumber}`,
          metadata: {
            leaseId: leaseId,
            updatedFields: Object.keys(validated),
            statusChange: newStatus !== oldStatus ? `${oldStatus} → ${newStatus}` : null,
          },
        },
      });
      
      return updated;
    });
    
    revalidatePath("/dashboard/leases");
    revalidatePath(`/dashboard/leases/${leaseId}`);
    revalidatePath(`/dashboard/properties/${lease.unit.property.id}`);
    
    return {
      success: true,
      data: updatedLease,
      message: "Lease updated successfully",
    };
  } catch (error) {
    console.error("Update lease error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update lease. Please try again.",
    };
  }
}

// -------------------------
// Terminate Lease
// -------------------------
export async function terminateLease(
  leaseId: string,
  data: z.infer<typeof terminateLeaseSchema>
): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can terminate leases",
      };
    }
    
    const validated = terminateLeaseSchema.parse(data);
    
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: {
          include: {
            property: true,
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
    
    if (
      currentUser.role === "LANDLORD" &&
      lease.unit.property.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const terminatedLease = await prisma.$transaction(async (tx) => {
      const updated = await tx.lease.update({
        where: { id: leaseId },
        data: {
          status: "TERMINATED" as LeaseStatus,
          endDate: new Date(validated.terminationDate),
          notes: validated.reason,
        },
      });
      
      // ✅ Update unit status to VACANT
      await tx.unit.update({
        where: { id: lease.unitId },
        data: {
          status: "VACANT",
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "LEASE_TERMINATED" as ActivityType,
          action: `Terminated lease for unit ${lease.unit.unitNumber}`,
          metadata: {
            leaseId: leaseId,
            terminationDate: validated.terminationDate,
            reason: validated.reason,
          },
        },
      });
      
      return updated;
    });
    
    revalidatePath("/dashboard/leases");
    revalidatePath(`/dashboard/leases/${leaseId}`);
    revalidatePath(`/dashboard/properties/${lease.unit.property.id}`);
    
    return {
      success: true,
      data: terminatedLease,
      message: "Lease terminated successfully. Unit marked as vacant.",
    };
  } catch (error) {
    console.error("Terminate lease error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to terminate lease. Please try again.",
    };
  }
}

// -------------------------
// Delete Lease
// -------------------------
export async function deleteLease(leaseId: string): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can delete leases",
      };
    }
    
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        payments: {
          where: {
            status: {
              in: ["COMPLETED", "PENDING"],
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
    
    if (
      currentUser.role === "LANDLORD" &&
      lease.unit.property.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    // Only allow deletion of draft leases with no payments
    if (lease.status !== "DRAFT") {
      return {
        success: false,
        error: "Only draft leases can be deleted. Consider terminating this lease instead.",
      };
    }
    
    if (lease.payments.length > 0) {
      return {
        success: false,
        error: "Cannot delete lease with associated payments",
      };
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.lease.update({
        where: { id: leaseId },
        data: {
          deletedAt: new Date(),
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_DELETED" as ActivityType,
          action: `Deleted draft lease for unit ${lease.unit.unitNumber}`,
          metadata: {
            leaseId: leaseId,
          },
        },
      });
    });
    
    revalidatePath("/dashboard/leases");
    revalidatePath(`/dashboard/properties/${lease.unit.property.id}`);
    
    return {
      success: true,
      message: "Lease deleted successfully",
    };
  } catch (error) {
    console.error("Delete lease error:", error);
    return {
      success: false,
      error: "Failed to delete lease. Please try again.",
    };
  }
}

// -------------------------
// Get Lease Statistics
// -------------------------
export async function getLeaseStatistics(leaseId: string): Promise<LeaseResult> {
  try {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        payments: {
          where: {
            status: "COMPLETED",
          },
        },
        violations: true,
      },
    });
    
    if (!lease) {
      return {
        success: false,
        error: "Lease not found",
      };
    }
    
    const totalPayments = lease.payments.length;
    const totalPaid = lease.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const onTimePayments = lease.payments.filter(
      (p) => p.dueDate && p.paidAt && p.paidAt <= p.dueDate
    ).length;
    const latePayments = lease.payments.filter(
      (p) => p.dueDate && p.paidAt && p.paidAt > p.dueDate
    ).length;
    
    const totalViolations = lease.violations.length;
    const resolvedViolations = lease.violations.filter((v) => v.isResolved).length;
    
    // Calculate days remaining
    const today = new Date();
    const daysRemaining = lease.endDate
      ? Math.ceil((new Date(lease.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    const statistics = {
      totalPayments,
      totalPaid,
      onTimePayments,
      latePayments,
      paymentReliability:
        totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 100,
      totalViolations,
      resolvedViolations,
      activeViolations: totalViolations - resolvedViolations,
      daysRemaining,
      expectedMonthlyRent: Number(lease.rentAmount),
    };
    
    return {
      success: true,
      data: statistics,
    };
  } catch (error) {
    console.error("Get lease statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch lease statistics",
    };
  }
}

// -------------------------
// Sync Lease and Unit Statuses (Maintenance Function)
// -------------------------
export async function syncLeaseAndUnitStatuses(): Promise<LeaseResult> {
  try {
    const results = await prisma.$transaction(async (tx) => {
      // Find all active leases
      const activeLeases = await tx.lease.findMany({
        where: {
          status: "ACTIVE",
        },
        include: {
          unit: true,
        },
      });
      
      // Mark their units as OCCUPIED
      const occupiedUnits = await Promise.all(
        activeLeases
          .filter((lease: { unit: { status: string; }; }) => lease.unit.status !== "OCCUPIED")
          .map((lease: { unitId: any; }) =>
            tx.unit.update({
              where: { id: lease.unitId },
              data: { status: "OCCUPIED" },
            })
          )
      );
      
      // Find all terminated/expired leases
      const inactiveLeases = await tx.lease.findMany({
        where: {
          status: {
            in: ["TERMINATED", "EXPIRED"],
          },
        },
        include: {
          unit: true,
        },
      });
      
      // Mark their units as VACANT (if no other active lease exists)
      const vacantUnitsPromises = inactiveLeases
        .filter(async (lease: { unitId: any; id: any; unit: { status: string; }; }) => {
          // Check if unit has any other active leases
          const otherActive = await tx.lease.findFirst({
            where: {
              unitId: lease.unitId,
              status: "ACTIVE",
              id: { not: lease.id },
            },
          });
          return !otherActive && lease.unit.status !== "VACANT";
        })
        .map((lease: { unitId: any; }) =>
          tx.unit.update({
            where: { id: lease.unitId },
            data: { status: "VACANT" },
          })
        );
        
      const vacantUnits = await Promise.all(vacantUnitsPromises);
      
      return {
        occupiedCount: occupiedUnits.length,
        vacantCount: vacantUnits.length,
      };
    });
    
    return {
      success: true,
      data: results,
      message: `Synced ${results.occupiedCount} occupied and ${results.vacantCount} vacant units`,
    };
  } catch (error) {
    console.error("Sync statuses error:", error);
    return {
      success: false,
      error: "Failed to sync statuses",
    };
  }
}

// -------------------------
// Get Expiring Leases (within next 60-90 days)
// -------------------------
export async function getExpiringLeases(daysAhead: number = 90): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (!currentUser.landlordProfile) {
      return {
        success: false,
        error: "Landlord profile not found",
      };
    }

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const expiringLeases = await prisma.lease.findMany({
      where: {
        unit: {
          property: {
            landlordId: currentUser.landlordProfile.id,
          },
        },
        status: {
          in: ["ACTIVE", "EXPIRING_SOON"],
        },
        endDate: {
          gte: today,
          lte: futureDate,
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
                address: true,
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
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        endDate: "asc",
      },
    });

    const serializedLeases = expiringLeases.map(serializeLease);

    return {
      success: true,
      data: {
        leases: serializedLeases,
        count: expiringLeases.length,
      },
    };
  } catch (error) {
    console.error("Get expiring leases error:", error);
    return {
      success: false,
      error: "Failed to fetch expiring leases",
    };
  }
}

// -------------------------
// Get Vacant Units
// -------------------------
export async function getVacantUnits(): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (!currentUser.landlordProfile) {
      return {
        success: false,
        error: "Landlord profile not found",
      };
    }

    const vacantUnits = await prisma.unit.findMany({
      where: {
        property: {
          landlordId: currentUser.landlordProfile.id,
          deletedAt: null,
        },
        status: "VACANT",
        isActive: true,
        deletedAt: null,
      },
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
        applications: {
          where: {
            status: "UNDER_REVIEW",
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: {
        units: vacantUnits.map(unit => ({
          ...unit,
          rentAmount: Number(unit.rentAmount),
          deposit: Number(unit.deposit),
          squareFeet: Number(unit.squareFeet),
          bathrooms: Number(unit.bathrooms),
        })),
        count: vacantUnits.length,
      },
    };
  } catch (error) {
    console.error("Get vacant units error:", error);
    return {
      success: false,
      error: "Failed to fetch vacant units",
    };
  }
}

// -------------------------
// Get Tenant Retention Rate
// -------------------------
export async function getTenantRetentionRate(): Promise<LeaseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (!currentUser.landlordProfile) {
      return {
        success: false,
        error: "Landlord profile not found",
      };
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [expiredLeases, renewedLeases] = await Promise.all([
      // Leases that expired in the last year
      prisma.lease.count({
        where: {
          unit: {
            property: {
              landlordId: currentUser.landlordProfile.id,
            },
          },
          status: {
            in: ["EXPIRED", "TERMINATED"],
          },
          endDate: {
            gte: oneYearAgo,
          },
        },
      }),
      // Leases that were renewed
      prisma.lease.count({
        where: {
          unit: {
            property: {
              landlordId: currentUser.landlordProfile.id,
            },
          },
          status: "RENEWED",
          updatedAt: {
            gte: oneYearAgo,
          },
        },
      }),
    ]);

    const retentionRate = expiredLeases > 0 
      ? (renewedLeases / expiredLeases) * 100 
      : 0;

    return {
      success: true,
      data: {
        retentionRate: Math.round(retentionRate * 10) / 10,
        renewedLeases,
        expiredLeases,
        lostTenants: expiredLeases - renewedLeases,
      },
    };
  } catch (error) {
    console.error("Get tenant retention rate error:", error);
    return {
      success: false,
      error: "Failed to fetch retention rate",
    };
  }
}