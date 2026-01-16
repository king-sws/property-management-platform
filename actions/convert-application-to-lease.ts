/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/convert-application-to-lease.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, LeaseStatus, LeaseType } from "@/lib/generated/prisma/enums";

// -------------------------
// Validation Schema
// -------------------------
const convertToLeaseSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  leaseType: z.enum(["FIXED_TERM", "MONTH_TO_MONTH", "YEAR_TO_YEAR"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  rentAmount: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  lateFeeAmount: z.number().optional(),
  lateFeeDays: z.number().int().optional(),
  rentDueDay: z.number().int().min(1).max(31).optional(),
  terms: z.string().optional(),
});

type ConversionResult = {
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
    },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

// -------------------------
// Convert Application to Lease
// -------------------------
export async function convertApplicationToLease(
  data: z.infer<typeof convertToLeaseSchema>
): Promise<ConversionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can convert applications to leases",
      };
    }
    
    const validated = convertToLeaseSchema.parse(data);
    
    // ✅ FIXED: Include landlord.user in the query
    const application = await prisma.rentalApplication.findUnique({
      where: { id: validated.applicationId },
      include: {
        unit: {
          include: {
            property: {
              include: {
                landlord: {
                  include: {
                    user: true, // ✅ This was missing!
                  },
                },
              },
            },
          },
        },
        tenant: {
          include: {
            user: true,
          },
        },
      },
    });
    
    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }
    
    // Verify landlord owns this property
    if (
      currentUser.role === "LANDLORD" &&
      application.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized: You don't own this property",
      };
    }
    
    // Verify application is approved
    if (application.status !== "APPROVED" && application.status !== "CONDITIONALLY_APPROVED") {
      return {
        success: false,
        error: "Only approved applications can be converted to leases",
      };
    }
    
    // Check for existing active leases on this unit
    const existingLease = await prisma.lease.findFirst({
      where: {
        unitId: application.unitId,
        status: {
          in: ["ACTIVE", "PENDING_SIGNATURE"],
        },
      },
    });
    
    if (existingLease) {
      return {
        success: false,
        error: "This unit already has an active lease",
      };
    }
    
    // Prepare lease data with smart defaults from application
    const moveInDate = validated.startDate 
      ? new Date(validated.startDate)
      : new Date(application.desiredMoveInDate);
    
    // Calculate default end date (1 year from move-in)
    const defaultEndDate = new Date(moveInDate);
    defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
    
    const leaseEndDate = validated.endDate 
      ? new Date(validated.endDate)
      : defaultEndDate;
    
    // Determine lease type based on duration or use provided type
    let leaseType: LeaseType = validated.leaseType || "FIXED_TERM";
    if (!validated.leaseType) {
      const monthsDiff = Math.round(
        (leaseEndDate.getTime() - moveInDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      if (monthsDiff >= 11 && monthsDiff <= 13) {
        leaseType = "YEAR_TO_YEAR";
      } else if (monthsDiff <= 1) {
        leaseType = "MONTH_TO_MONTH";
      }
    }
    
    // Use application data or unit defaults
    const rentAmount = validated.rentAmount || Number(application.unit.rentAmount);
    const deposit = validated.deposit || Number(application.unit.deposit);
    
    // Create the lease with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create lease
      const lease = await tx.lease.create({
        data: {
          unitId: application.unitId,
          primaryTenantId: application.tenantId,
          type: leaseType,
          status: "PENDING_SIGNATURE" as LeaseStatus,
          startDate: moveInDate,
          endDate: leaseEndDate,
          rentAmount: rentAmount,
          deposit: deposit,
          lateFeeAmount: validated.lateFeeAmount || 50,
          lateFeeDays: validated.lateFeeDays || 5,
          rentDueDay: validated.rentDueDay || 1,
          terms: validated.terms || generateDefaultTerms(application, rentAmount, deposit),
        },
      });
      
      // Create lease-tenant relationship
      await tx.leaseTenant.create({
        data: {
          leaseId: lease.id,
          tenantId: application.tenantId,
          isPrimaryTenant: true,
        },
      });
      
      // Update application status to indicate conversion
      await tx.rentalApplication.update({
        where: { id: application.id },
        data: {
          notes: `${application.notes || ""}\n\n[CONVERTED TO LEASE] Lease ID: ${lease.id} on ${new Date().toISOString()}`,
        },
      });
      
      // Create notification for tenant
      await tx.notification.create({
        data: {
          userId: application.tenant.userId,
          type: "LEASE_CREATED",
          title: "Lease Agreement Ready",
          message: `Your lease agreement for ${application.unit.property.name} - Unit ${application.unit.unitNumber} is ready for signature!`,
          actionUrl: `/dashboard/lease-signing/${lease.id}`,
          metadata: {
            leaseId: lease.id,
            applicationId: application.id,
          },
        },
      });
      
      // Create notification for landlord
      await tx.notification.create({
        data: {
          userId: currentUser.id,
          type: "LEASE_CREATED",
          title: "Lease Created",
          message: `Lease created for ${application.tenant.user.name} at Unit ${application.unit.unitNumber}`,
          actionUrl: `/dashboard/leases/${lease.id}`,
          metadata: {
            leaseId: lease.id,
            applicationId: application.id,
          },
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "LEASE_CREATED" as ActivityType,
          action: `Converted application to lease for ${application.tenant.user.name}`,
          metadata: {
            leaseId: lease.id,
            applicationId: application.id,
            unitId: application.unitId,
            tenantId: application.tenantId,
          },
        },
      });
      
      return { lease, application };
    });
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${application.id}`);
    revalidatePath("/dashboard/leases");
    revalidatePath(`/dashboard/properties/${application.unit.property.id}`);
    
    return {
      success: true,
      data: {
        leaseId: result.lease.id,
        applicationId: application.id,
      },
      message: "Application successfully converted to lease. Tenant will be notified to sign.",
    };
  } catch (error) {
    console.error("Convert application to lease error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to convert application to lease. Please try again.",
    };
  }
}

// -------------------------
// Generate Default Lease Terms
// -------------------------
function generateDefaultTerms(
  application: any,
  rentAmount: number,
  deposit: number
): string {
  const property = application.unit.property;
  const unit = application.unit;
  
  // ✅ FIXED: Safe access with optional chaining and fallbacks
  const landlordName = property.landlord?.user?.name || "Property Owner";
  const tenantName = application.tenant?.user?.name || "Tenant";
  
  return `
RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on ${new Date().toLocaleDateString()} between:

LANDLORD: ${landlordName}
TENANT: ${tenantName}

PROPERTY: ${property.address}, Unit ${unit.unitNumber}, ${property.city}, ${property.state}

1. RENT PAYMENT
Monthly rent: $${rentAmount.toLocaleString()}
Due on the 1st of each month
Late fee: $50 if payment is more than 5 days late

2. SECURITY DEPOSIT
Amount: $${deposit.toLocaleString()}
Refundable upon lease termination, subject to property condition inspection

3. TENANT RESPONSIBILITIES
- Maintain cleanliness and good condition of the premises
- Pay rent on time each month
- Comply with all property rules and policies
- Report maintenance issues promptly
- Respect neighbors and community standards

4. LANDLORD RESPONSIBILITIES
- Maintain property in habitable condition
- Make necessary repairs in timely manner
- Provide 24-hour notice before entry (except emergencies)
- Return security deposit within required timeframe

5. OCCUPANCY
Number of occupants: ${application.numberOfOccupants}
${application.hasPets ? `Pets: ${application.petDetails || 'Allowed as described'}` : 'Pets: Not permitted'}

6. TERMINATION
Either party may terminate with proper notice as required by law
Tenant responsible for rent until move-out date or new tenant found

By signing below, both parties agree to all terms and conditions of this lease agreement.
  `.trim();
}

// -------------------------
// Check if Application Can Be Converted
// -------------------------
export async function canConvertToLease(applicationId: string): Promise<ConversionResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const application = await prisma.rentalApplication.findUnique({
      where: { id: applicationId },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });
    
    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }
    
    // Check authorization
    if (
      currentUser.role === "LANDLORD" &&
      application.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    // Check if approved
    if (application.status !== "APPROVED" && application.status !== "CONDITIONALLY_APPROVED") {
      return {
        success: false,
        error: "Application must be approved first",
      };
    }
    
    // Check for existing lease
    const existingLease = await prisma.lease.findFirst({
      where: {
        unitId: application.unitId,
        status: {
          in: ["ACTIVE", "PENDING_SIGNATURE"],
        },
      },
    });
    
    if (existingLease) {
      return {
        success: false,
        error: "Unit already has an active lease",
      };
    }
    
    // Check if already converted
    const existingLeaseWithTenant = await prisma.lease.findFirst({
      where: {
        primaryTenantId: application.tenantId,
        unitId: application.unitId,
      },
    });
    
    if (existingLeaseWithTenant) {
      return {
        success: false,
        error: "This application has already been converted to a lease",
        data: {
          leaseId: existingLeaseWithTenant.id,
        },
      };
    }
    
    return {
      success: true,
      message: "Application can be converted to lease",
    };
  } catch (error) {
    console.error("Check conversion eligibility error:", error);
    return {
      success: false,
      error: "Failed to check conversion eligibility",
    };
  }
}