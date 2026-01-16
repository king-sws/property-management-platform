/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/applications.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, ApplicationStatus } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";

// -------------------------
// Validation Schemas
// -------------------------
const createApplicationSchema = z.object({
  unitId: z.string().min(1, "Unit is required"),
  desiredMoveInDate: z.string().min(1, "Move-in date is required"),
  numberOfOccupants: z.number().int().min(1, "At least one occupant is required"),
  hasPets: z.boolean().optional().default(false),
  petDetails: z.string().optional().nullable(),
  occupants: z.array(z.object({
    name: z.string().min(1),
    relationship: z.string().min(1),
    age: z.number().optional().nullable(),
  })).optional().default([]),
  previousAddress: z.string().optional().nullable(),
  previousLandlord: z.string().optional().nullable(),
  previousLandlordPhone: z.string().optional().nullable(),
  reasonForMoving: z.string().optional().nullable(),
  monthlyIncome: z.number().optional().nullable(),
  employer: z.string().optional().nullable(),
  employmentLength: z.string().optional().nullable(),
  references: z.array(z.object({
    name: z.string().min(1),
    relationship: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().nullable(),
  })).optional().default([]),
});

const updateApplicationSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "SCREENING_IN_PROGRESS",
    "APPROVED",
    "CONDITIONALLY_APPROVED",
    "DENIED",
    "WITHDRAWN",
    "EXPIRED",
  ]).optional(),
  desiredMoveInDate: z.string().optional(),
  numberOfOccupants: z.number().int().min(1).optional(),
  hasPets: z.boolean().optional(),
  petDetails: z.string().optional().nullable(),
  occupants: z.any().optional(),
  previousAddress: z.string().optional().nullable(),
  previousLandlord: z.string().optional().nullable(),
  previousLandlordPhone: z.string().optional().nullable(),
  reasonForMoving: z.string().optional().nullable(),
  monthlyIncome: z.number().optional().nullable(),
  employer: z.string().optional().nullable(),
  employmentLength: z.string().optional().nullable(),
  references: z.any().optional(),
  notes: z.string().optional().nullable(),
});

const reviewApplicationSchema = z.object({
  status: z.enum(["APPROVED", "CONDITIONALLY_APPROVED", "DENIED"]),
  denialReason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// -------------------------
// Types
// -------------------------
type ApplicationResult = {
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

function serializeApplication(application: any) {
  return {
    ...application,
    monthlyIncome: application.monthlyIncome ? Number(application.monthlyIncome) : null,
    applicationFee: application.applicationFee ? Number(application.applicationFee) : null,
    desiredMoveInDate: application.desiredMoveInDate?.toISOString() || null,
    submittedAt: application.submittedAt?.toISOString() || null,
    expiresAt: application.expiresAt?.toISOString() || null,
    approvedAt: application.approvedAt?.toISOString() || null,
    deniedAt: application.deniedAt?.toISOString() || null,
    createdAt: application.createdAt?.toISOString() || null,
    updatedAt: application.updatedAt?.toISOString() || null,
    unit: application.unit ? {
      ...application.unit,
      bathrooms: application.unit.bathrooms ? Number(application.unit.bathrooms) : null,
      rentAmount: application.unit.rentAmount ? Number(application.unit.rentAmount) : null,
      deposit: application.unit.deposit ? Number(application.unit.deposit) : null,
      squareFeet: application.unit.squareFeet ? Number(application.unit.squareFeet) : null,
      createdAt: application.unit.createdAt?.toISOString() || null,
      updatedAt: application.unit.updatedAt?.toISOString() || null,
      deletedAt: application.unit.deletedAt?.toISOString() || null,
      property: application.unit.property ? {
        ...application.unit.property,
        latitude: application.unit.property.latitude ? Number(application.unit.property.latitude) : null,
        longitude: application.unit.property.longitude ? Number(application.unit.property.longitude) : null,
        purchasePrice: application.unit.property.purchasePrice ? Number(application.unit.property.purchasePrice) : null,
        currentValue: application.unit.property.currentValue ? Number(application.unit.property.currentValue) : null,
        propertyTax: application.unit.property.propertyTax ? Number(application.unit.property.propertyTax) : null,
        insurance: application.unit.property.insurance ? Number(application.unit.property.insurance) : null,
        hoaFees: application.unit.property.hoaFees ? Number(application.unit.property.hoaFees) : null,
        squareFeet: application.unit.property.squareFeet ? Number(application.unit.property.squareFeet) : null,
        lotSize: application.unit.property.lotSize ? Number(application.unit.property.lotSize) : null,
        createdAt: application.unit.property.createdAt?.toISOString() || null,
        updatedAt: application.unit.property.updatedAt?.toISOString() || null,
        deletedAt: application.unit.property.deletedAt?.toISOString() || null,
        // ✅ ADD THIS - Serialize property images
        images: application.unit.property.images?.map((img: any) => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
          isPrimary: img.isPrimary,
          order: img.order,
          storageProvider: img.storageProvider,
          storageKey: img.storageKey,
          createdAt: img.createdAt?.toISOString() || null,
        })) || [],
      } : null,
    } : null,
    tenant: application.tenant ? {
      ...application.tenant,
      annualIncome: application.tenant.annualIncome ? Number(application.tenant.annualIncome) : null,
      dateOfBirth: application.tenant.dateOfBirth?.toISOString() || null,
      createdAt: application.tenant.createdAt?.toISOString() || null,
      updatedAt: application.tenant.updatedAt?.toISOString() || null,
      deletedAt: application.tenant.deletedAt?.toISOString() || null,
      user: application.tenant.user ? {
        ...application.tenant.user,
        createdAt: application.tenant.user.createdAt?.toISOString() || null,
        updatedAt: application.tenant.user.updatedAt?.toISOString() || null,
      } : null,
    } : null,
    screening: application.screening ? {
      ...application.screening,
      requestedAt: application.screening.requestedAt?.toISOString() || null,
      completedAt: application.screening.completedAt?.toISOString() || null,
      createdAt: application.screening.createdAt?.toISOString() || null,
    } : null,
  };
}

// -------------------------
// Create Application
// -------------------------
export async function createApplication(
  data: z.infer<typeof createApplicationSchema>
): Promise<ApplicationResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "TENANT") {
      return {
        success: false,
        error: "Only tenants can create applications",
      };
    }
    
    if (!currentUser.tenantProfile) {
      return {
        success: false,
        error: "Tenant profile not found",
      };
    }
    
    const validated = createApplicationSchema.parse(data);
    
    // Verify unit exists and is available
    const unit = await prisma.unit.findUnique({
      where: { id: validated.unitId },
      include: {
        property: {
          include: {
            landlord: true,
          },
        },
      },
    });
    
    if (!unit || unit.deletedAt || !unit.isActive) {
      return {
        success: false,
        error: "Unit not found or unavailable",
      };
    }
    
    if (unit.status !== "VACANT") {
      return {
        success: false,
        error: "This unit is not available for applications",
      };
    }
    
    // Check for existing pending application
    const existingApplication = await prisma.rentalApplication.findFirst({
      where: {
        unitId: validated.unitId,
        tenantId: currentUser.tenantProfile.id,
        status: {
          in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"],
        },
      },
    });
    
    if (existingApplication) {
      return {
        success: false,
        error: "You already have a pending application for this unit",
      };
    }
    
    // Create application
    const application = await prisma.$transaction(async (tx) => {
      const newApplication = await tx.rentalApplication.create({
        data: {
          unitId: validated.unitId,
          tenantId: currentUser.tenantProfile!.id,
          landlordId: unit.property.landlordId,
          status: "DRAFT" as ApplicationStatus,
          desiredMoveInDate: new Date(validated.desiredMoveInDate),
          numberOfOccupants: validated.numberOfOccupants,
          hasPets: validated.hasPets,
          petDetails: validated.petDetails || null,
          occupants: validated.occupants || [],
          previousAddress: validated.previousAddress || null,
          previousLandlord: validated.previousLandlord || null,
          previousLandlordPhone: validated.previousLandlordPhone || null,
          reasonForMoving: validated.reasonForMoving || null,
          monthlyIncome: validated.monthlyIncome || null,
          employer: validated.employer || null,
          employmentLength: validated.employmentLength || null,
          references: validated.references || [],
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "APPLICATION_SUBMITTED" as ActivityType,
          action: `Started application for unit ${unit.unitNumber}`,
          metadata: {
            applicationId: newApplication.id,
            unitId: validated.unitId,
          },
        },
      });
      
      return newApplication;
    });
    
    const serializedApplication = serializeApplication(application);
    
    revalidatePath("/dashboard/applications");
    
    return {
      success: true,
      data: serializedApplication,
      message: "Application created successfully",
    };
  } catch (error) {
    console.error("Create application error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create application. Please try again.",
    };
  }
}

// -------------------------
// Get Applications
// -------------------------
export async function getApplications(params?: {
  search?: string;
  status?: string;
  propertyId?: string;
  unitId?: string;
  page?: number;
  limit?: number;
}): Promise<ApplicationResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    
    const where: Prisma.RentalApplicationWhereInput = {};
    
    // Filter by user role
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.landlordId = currentUser.landlordProfile.id;
    } else if (currentUser.role === "TENANT" && currentUser.tenantProfile) {
      where.tenantId = currentUser.tenantProfile.id;
    }
    
    // Filter by property
    if (params?.propertyId) {
      where.unit = {
        propertyId: params.propertyId,
      };
    }
    
    // Filter by unit
    if (params?.unitId) {
      where.unitId = params.unitId;
    }
    
    // Filter by status
    if (params?.status && params.status !== "ALL") {
      where.status = params.status as ApplicationStatus;
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
          tenant: {
            user: {
              name: {
                contains: params.search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }
    
    const [applications, total] = await Promise.all([
      prisma.rentalApplication.findMany({
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
                  // ✅ ADD THIS - Include property images
                  images: {
                    orderBy: [
                      { isPrimary: "desc" },
                      { order: "asc" }
                    ],
                  },
                },
              },
            },
          },
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
          screening: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.rentalApplication.count({ where }),
    ]);
    
    const serializedApplications = applications.map(serializeApplication);
    
    return {
      success: true,
      data: {
        applications: serializedApplications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get applications error:", error);
    return {
      success: false,
      error: "Failed to fetch applications",
    };
  }
}

// -------------------------
// Get Application by ID
// -------------------------
export async function getApplicationById(applicationId: string): Promise<ApplicationResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const application = await prisma.rentalApplication.findUnique({
      where: { id: applicationId },
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
                // ✅ ADD THIS - Include property images
                images: {
                  orderBy: [
                    { isPrimary: "desc" },
                    { order: "asc" }
                  ],
                },
              },
            },
          },
        },
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
        screening: true,
      },
    });
    
    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }
    
    // Check authorization
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      application.landlordId === currentUser.landlordProfile?.id;
    
    const isTenant =
      currentUser.role === "TENANT" &&
      application.tenantId === currentUser.tenantProfile?.id;
    
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isLandlord && !isTenant && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const serializedApplication = serializeApplication(application);
    
    return {
      success: true,
      data: serializedApplication,
    };
  } catch (error) {
    console.error("Get application error:", error);
    return {
      success: false,
      error: "Failed to fetch application details",
    };
  }
}

// -------------------------
// Update Application
// -------------------------
export async function updateApplication(
  applicationId: string,
  data: z.infer<typeof updateApplicationSchema>
): Promise<ApplicationResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const application = await prisma.rentalApplication.findUnique({
      where: { id: applicationId },
    });
    
    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }
    
    // Only tenant can update their own draft applications
    if (
      currentUser.role !== "TENANT" ||
      application.tenantId !== currentUser.tenantProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    if (application.status !== "DRAFT") {
      return {
        success: false,
        error: "Cannot edit submitted applications",
      };
    }
    
    const validated = updateApplicationSchema.parse(data);
    
    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.rentalApplication.update({
        where: { id: applicationId },
        data: {
          ...(validated.desiredMoveInDate && {
            desiredMoveInDate: new Date(validated.desiredMoveInDate),
          }),
          ...(validated.numberOfOccupants !== undefined && {
            numberOfOccupants: validated.numberOfOccupants,
          }),
          ...(validated.hasPets !== undefined && { hasPets: validated.hasPets }),
          ...(validated.petDetails !== undefined && { petDetails: validated.petDetails }),
          ...(validated.occupants !== undefined && { occupants: validated.occupants }),
          ...(validated.previousAddress !== undefined && {
            previousAddress: validated.previousAddress,
          }),
          ...(validated.previousLandlord !== undefined && {
            previousLandlord: validated.previousLandlord,
          }),
          ...(validated.previousLandlordPhone !== undefined && {
            previousLandlordPhone: validated.previousLandlordPhone,
          }),
          ...(validated.reasonForMoving !== undefined && {
            reasonForMoving: validated.reasonForMoving,
          }),
          ...(validated.monthlyIncome !== undefined && {
            monthlyIncome: validated.monthlyIncome,
          }),
          ...(validated.employer !== undefined && { employer: validated.employer }),
          ...(validated.employmentLength !== undefined && {
            employmentLength: validated.employmentLength,
          }),
          ...(validated.references !== undefined && { references: validated.references }),
          ...(validated.notes !== undefined && { notes: validated.notes }),
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "APPLICATION_SUBMITTED" as ActivityType,
          action: "Updated application",
          metadata: {
            applicationId: applicationId,
          },
        },
      });
      
      return updated;
    });
    
    const serializedApplication = serializeApplication(updatedApplication);
    
    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${applicationId}`);
    
    return {
      success: true,
      data: serializedApplication,
      message: "Application updated successfully",
    };
  } catch (error) {
    console.error("Update application error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update application. Please try again.",
    };
  }
}

// -------------------------
// Submit Application
// -------------------------
export async function submitApplication(applicationId: string): Promise<ApplicationResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const application = await prisma.rentalApplication.findUnique({
      where: { id: applicationId },
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
    });
    
    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }
    
    if (
      currentUser.role !== "TENANT" ||
      application.tenantId !== currentUser.tenantProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    if (application.status !== "DRAFT") {
      return {
        success: false,
        error: "Application has already been submitted",
      };
    }
    
    const submittedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.rentalApplication.update({
        where: { id: applicationId },
        data: {
          status: "SUBMITTED" as ApplicationStatus,
          submittedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
      
      // Create notification for landlord
      await tx.notification.create({
        data: {
          userId: application.unit.property.landlord.userId,
          type: "APPLICATION_RECEIVED",
          title: "New Rental Application",
          message: `You have received a new application for ${application.unit.property.name} - Unit ${application.unit.unitNumber}`,
          actionUrl: `/dashboard/applications/${applicationId}`,
          metadata: {
            applicationId: applicationId,
          },
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "APPLICATION_SUBMITTED" as ActivityType,
          action: `Submitted application for unit ${application.unit.unitNumber}`,
          metadata: {
            applicationId: applicationId,
            unitId: application.unitId,
          },
        },
      });
      
      return updated;
    });
    
    const serializedApplication = serializeApplication(submittedApplication);
    
    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${applicationId}`);
    
    return {
      success: true,
      data: serializedApplication,
      message: "Application submitted successfully",
    };
  } catch (error) {
    console.error("Submit application error:", error);
    return {
      success: false,
      error: "Failed to submit application. Please try again.",
    };
  }
}

// -------------------------
// Review Application (Landlord)
// -------------------------
export async function reviewApplication(
  applicationId: string,
  data: z.infer<typeof reviewApplicationSchema>
): Promise<ApplicationResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can review applications",
      };
    }
    
    const application = await prisma.rentalApplication.findUnique({
      where: { id: applicationId },
      include: {
        unit: {
          include: {
            property: true,
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
    
    if (
      currentUser.role === "LANDLORD" &&
      application.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const validated = reviewApplicationSchema.parse(data);
    
    const reviewedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.rentalApplication.update({
        where: { id: applicationId },
        data: {
          status: validated.status as ApplicationStatus,
          approvedAt: validated.status === "APPROVED" || validated.status === "CONDITIONALLY_APPROVED" ? new Date() : null,
          deniedAt: validated.status === "DENIED" ? new Date() : null,
          denialReason: validated.denialReason || null,
          notes: validated.notes || null,
        },
      });
      
      // Create notification for tenant
// Define the valid notification types for this context
type ApplicationNotificationType = 
  | "APPLICATION_APPROVED" 
  | "APPLICATION_DENIED";

let notificationMessage = "";
let notificationType: ApplicationNotificationType | null = null;

switch (validated.status) {
  case "APPROVED":
    notificationMessage = "Your rental application has been approved!";
    notificationType = "APPLICATION_APPROVED";
    break;
  case "CONDITIONALLY_APPROVED":
    notificationMessage = "Your rental application has been conditionally approved. Please check the details.";
    notificationType = "APPLICATION_APPROVED";
    break;
  case "DENIED":
    notificationMessage = "Your rental application has been denied.";
    notificationType = "APPLICATION_DENIED";
    break;
}

// Only create notification if type is set
if (notificationType) {
  await tx.notification.create({
    data: {
      userId: application.tenant.userId,
      type: notificationType, // TypeScript knows this is valid now
      title: "Application Status Update",
      message: notificationMessage,
      actionUrl: `/dashboard/applications/${applicationId}`,
      metadata: {
        applicationId: applicationId,
        status: validated.status,
      },
    },
  });
}
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "APPLICATION_SUBMITTED" as ActivityType,
          action: `${validated.status} application for ${application.tenant.user.name}`,
          metadata: {
            applicationId: applicationId,
            status: validated.status,
          },
        },
      });
      
      return updated;
    });
    
    const serializedApplication = serializeApplication(reviewedApplication);
    
    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${applicationId}`);
    
    return {
      success: true,
      data: serializedApplication,
      message: `Application ${validated.status.toLowerCase().replace('_', ' ')} successfully`,
    };
  } catch (error) {
    console.error("Review application error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to review application. Please try again.",
    };
  }
}

// -------------------------
// Withdraw Application
// -------------------------
export async function withdrawApplication(applicationId: string): Promise<ApplicationResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const application = await prisma.rentalApplication.findUnique({
      where: { id: applicationId },
    });
    
    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }
    
    if (
      currentUser.role !== "TENANT" ||
      application.tenantId !== currentUser.tenantProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    if (["APPROVED", "DENIED", "WITHDRAWN"].includes(application.status)) {
      return {
        success: false,
        error: "Cannot withdraw this application",
      };
    }
    
    const withdrawnApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.rentalApplication.update({
        where: { id: applicationId },
        data: {
          status: "WITHDRAWN" as ApplicationStatus,
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "APPLICATION_SUBMITTED" as ActivityType,
          action: "Withdrew application",
          metadata: {
            applicationId: applicationId,
          },
        },
      });
      
      return updated;
    });
    
    const serializedApplication = serializeApplication(withdrawnApplication);
    
    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${applicationId}`);
    
    return {
      success: true,
      data: serializedApplication,
      message: "Application withdrawn successfully",
    };
  } catch (error) {
    console.error("Withdraw application error:", error);
    return {
      success: false,
      error: "Failed to withdraw application. Please try again.",
    };
  }
}

// -------------------------
// Get Application Statistics
// -------------------------
export async function getApplicationStatistics(): Promise<ApplicationResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const where: Prisma.RentalApplicationWhereInput = {};
    
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.landlordId = currentUser.landlordProfile.id;
    } else if (currentUser.role === "TENANT" && currentUser.tenantProfile) {
      where.tenantId = currentUser.tenantProfile.id;
    }
    
    const [total, pending, approved, denied] = await Promise.all([
      prisma.rentalApplication.count({ where }),
      prisma.rentalApplication.count({
        where: {
          ...where,
          status: {
            in: ["SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"],
          },
        },
      }),
      prisma.rentalApplication.count({
        where: { ...where, status: "APPROVED" },
      }),
      prisma.rentalApplication.count({
        where: { ...where, status: "DENIED" },
      }),
    ]);
    
    return {
      success: true,
      data: {
        total,
        pending,
        approved,
        denied,
        approvalRate: total > 0 ? (approved / total) * 100 : 0,
      },
    };
  } catch (error) {
    console.error("Get application statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}