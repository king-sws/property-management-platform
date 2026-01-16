/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/profile.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, UserRole } from "@/lib/generated/prisma/enums";

// -------------------------
// Validation Schemas
// -------------------------
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

const updateAvatarSchema = z.object({
  avatar: z.string().url("Invalid avatar URL"),
});

// -------------------------
// Types
// -------------------------
type ProfileResult = {
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
      vendorProfile: true,
    },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

// -------------------------
// Get User Profile
// -------------------------
export async function getUserProfile(): Promise<ProfileResult> {
  try {
    const currentUser = await getCurrentUser();
    
    // Get activity statistics
    const activityCount = await prisma.activityLog.count({
      where: { userId: currentUser.id },
    });
    
    const recentActivity = await prisma.activityLog.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        action: true,
        createdAt: true,
      },
    });
    
    // Role-specific statistics
    let roleStats = null;
    
    if (currentUser.role === UserRole.LANDLORD && currentUser.landlordProfile) {
      const [propertyCount, leaseCount, maintenanceCount] = await Promise.all([
        prisma.property.count({
          where: { landlordId: currentUser.landlordProfile.id, isActive: true },
        }),
        prisma.lease.count({
          where: {
            unit: {
              property: {
                landlordId: currentUser.landlordProfile.id,
              },
            },
            status: "ACTIVE",
          },
        }),
        prisma.maintenanceTicket.count({
          where: {
            property: {
              landlordId: currentUser.landlordProfile.id,
            },
            status: "OPEN",
          },
        }),
      ]);
      
      roleStats = {
        properties: propertyCount,
        activeLeases: leaseCount,
        openTickets: maintenanceCount,
        subscriptionTier: currentUser.landlordProfile.subscriptionTier,
        subscriptionStatus: currentUser.landlordProfile.subscriptionStatus,
      };
    } else if (currentUser.role === UserRole.TENANT && currentUser.tenantProfile) {
      const [activeLease, paymentCount, ticketCount] = await Promise.all([
        prisma.lease.findFirst({
          where: {
            tenants: {
              some: {
                tenantId: currentUser.tenantProfile.id,
              },
            },
            status: "ACTIVE",
          },
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        }),
        prisma.payment.count({
          where: {
            tenantId: currentUser.tenantProfile.id,
            status: "COMPLETED",
          },
        }),
        prisma.maintenanceTicket.count({
          where: {
            createdById: currentUser.id,
          },
        }),
      ]);
      
      roleStats = {
        currentProperty: activeLease ? {
          name: activeLease.unit.property.name,
          unit: activeLease.unit.unitNumber,
          rentAmount: Number(activeLease.rentAmount),
          leaseEndDate: activeLease.endDate?.toISOString() || null,
        } : null,
        totalPayments: paymentCount,
        maintenanceRequests: ticketCount,
      };
    } else if (currentUser.role === UserRole.VENDOR && currentUser.vendorProfile) {
      const [assignedTickets, completedTickets, totalReviews] = await Promise.all([
        prisma.maintenanceTicket.count({
          where: {
            vendorId: currentUser.vendorProfile.id,
            status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] },
          },
        }),
        prisma.maintenanceTicket.count({
          where: {
            vendorId: currentUser.vendorProfile.id,
            status: "COMPLETED",
          },
        }),
        prisma.vendorReview.count({
          where: {
            vendorId: currentUser.vendorProfile.id,
          },
        }),
      ]);
      
      roleStats = {
        assignedTickets,
        completedTickets,
        rating: currentUser.vendorProfile.rating ? Number(currentUser.vendorProfile.rating) : null,
        totalReviews,
      };
    }
    
    const profile = {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        avatar: currentUser.avatar || currentUser.image,
        role: currentUser.role,
        status: currentUser.status,
        emailVerified: currentUser.emailVerified?.toISOString() || null,
        createdAt: currentUser.createdAt.toISOString(),
      },
      statistics: {
        activityCount,
        memberSince: currentUser.createdAt.toISOString(),
        lastActivity: recentActivity[0]?.createdAt.toISOString() || null,
      },
      roleStats,
      recentActivity: recentActivity.map(a => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    };
    
    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return {
      success: false,
      error: "Failed to fetch profile",
    };
  }
}

// -------------------------
// Update Profile Basic Info
// -------------------------
export async function updateProfileInfo(
  data: z.infer<typeof updateProfileSchema>
): Promise<ProfileResult> {
  try {
    const currentUser = await getCurrentUser();
    const validated = updateProfileSchema.parse(data);
    
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validated.name,
        phone: validated.phone || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.USER_LOGIN,
        action: "Updated profile information",
      },
    });
    
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/settings");
    
    return {
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

// -------------------------
// Update Avatar
// -------------------------
export async function updateAvatar(avatarUrl: string): Promise<ProfileResult> {
  try {
    const currentUser = await getCurrentUser();
    const validated = updateAvatarSchema.parse({ avatar: avatarUrl });
    
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        avatar: validated.avatar,
      },
      select: {
        id: true,
        avatar: true,
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.USER_LOGIN,
        action: "Updated profile avatar",
      },
    });
    
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/settings");
    
    return {
      success: true,
      data: { avatar: updatedUser.avatar },
      message: "Avatar updated successfully",
    };
  } catch (error) {
    console.error("Update avatar error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid avatar URL",
      };
    }
    
    return {
      success: false,
      error: "Failed to update avatar",
    };
  }
}

// -------------------------
// Remove Avatar
// -------------------------
export async function removeAvatar(): Promise<ProfileResult> {
  try {
    const currentUser = await getCurrentUser();
    
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        avatar: null,
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: ActivityType.USER_LOGIN,
        action: "Removed profile avatar",
      },
    });
    
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/settings");
    
    return {
      success: true,
      message: "Avatar removed successfully",
    };
  } catch (error) {
    console.error("Remove avatar error:", error);
    return {
      success: false,
      error: "Failed to remove avatar",
    };
  }
}

// -------------------------
// Get Activity Log
// -------------------------
export async function getActivityLog(
  limit: number = 50,
  offset: number = 0
): Promise<ProfileResult> {
  try {
    const currentUser = await getCurrentUser();
    
    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { userId: currentUser.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          action: true,
          ipAddress: true,
          createdAt: true,
          metadata: true,
        },
      }),
      prisma.activityLog.count({
        where: { userId: currentUser.id },
      }),
    ]);
    
    return {
      success: true,
      data: {
        activities: activities.map(a => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        })),
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("Get activity log error:", error);
    return {
      success: false,
      error: "Failed to fetch activity log",
    };
  }
}

// -------------------------
// Get Profile Completion
// -------------------------
export async function getProfileCompletion(): Promise<ProfileResult> {
  try {
    const currentUser = await getCurrentUser();
    
    const fields = {
      name: !!currentUser.name,
      phone: !!currentUser.phone,
      avatar: !!(currentUser.avatar || currentUser.image),
      emailVerified: !!currentUser.emailVerified,
    };
    
    // Add role-specific fields
    if (currentUser.role === UserRole.LANDLORD && currentUser.landlordProfile) {
      Object.assign(fields, {
        businessName: !!currentUser.landlordProfile.businessName,
        businessAddress: !!currentUser.landlordProfile.businessAddress,
      });
    } else if (currentUser.role === UserRole.TENANT && currentUser.tenantProfile) {
      Object.assign(fields, {
        dateOfBirth: !!currentUser.tenantProfile.dateOfBirth,
        employerName: !!currentUser.tenantProfile.employerName,
        emergencyContact: !!currentUser.tenantProfile.emergencyName,
      });
    } else if (currentUser.role === UserRole.VENDOR && currentUser.vendorProfile) {
      Object.assign(fields, {
        businessName: !!currentUser.vendorProfile.businessName,
        licenseNumber: !!currentUser.vendorProfile.licenseNumber,
        services: currentUser.vendorProfile.services.length > 0,
      });
    }
    
    const totalFields = Object.keys(fields).length;
    const completedFields = Object.values(fields).filter(Boolean).length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    
    return {
      success: true,
      data: {
        percentage,
        completedFields,
        totalFields,
        fields,
      },
    };
  } catch (error) {
    console.error("Get profile completion error:", error);
    return {
      success: false,
      error: "Failed to calculate profile completion",
    };
  }
}