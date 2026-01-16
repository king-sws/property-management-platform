/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/admin/users.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AccountStatus, UserRole } from "@/lib/generated/prisma/enums";
import bcrypt from "bcryptjs";
import { sendUserWelcomeEmail } from "./send-user-email";

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// -------------------------
// Get User Details
// -------------------------
export async function getUserDetails(userId: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        landlordProfile: {
          include: {
            properties: {
              where: { deletedAt: null },
              include: {
                units: {
                  where: { deletedAt: null },
                },
              },
            },
            _count: {
              select: {
                properties: true,
                expenses: true,
              },
            },
          },
        },
        tenantProfile: {
          include: {
            leaseMembers: {
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
            },
            payments: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            _count: {
              select: {
                payments: true,
                applications: true,
              },
            },
          },
        },
        vendorProfile: {
          include: {
            tickets: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            reviews: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            _count: {
              select: {
                tickets: true,
                reviews: true,
              },
            },
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            activityLogs: true,
            notifications: true,
            sentMessages: true,
            receivedMessages: true,
            documents: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Get user details error:", error);
    return null;
  }
}

// -------------------------
// Update User Status
// -------------------------
const updateStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.nativeEnum(AccountStatus),
  reason: z.string().optional(),
});

export async function updateUserStatus(
  userId: string,
  status: AccountStatus,
  reason?: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateStatusSchema.parse({ userId, status, reason });

    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
    });

    if (!user || user.deletedAt) {
      return { success: false, error: "User not found" };
    }

    // Prevent admin from suspending themselves
    if (user.id === session.user.id && status === "SUSPENDED") {
      return { success: false, error: "You cannot suspend your own account" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: validated.userId },
        data: { status },
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id!,
          type: "USER_LOGIN",
          action: `Changed user status to ${status}`,
          entityType: "User",
          entityId: validated.userId,
          metadata: {
            previousStatus: user.status,
            newStatus: status,
            reason: validated.reason,
            targetUser: user.email,
          },
        },
      });

      // Send notification to affected user
      await tx.notification.create({
        data: {
          userId: validated.userId,
          type: "SYSTEM",
          channel: "IN_APP",
          title: `Account Status Changed`,
          message: `Your account status has been changed to ${status}.${
            validated.reason ? ` Reason: ${validated.reason}` : ""
          }`,
        },
      });
    });

    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Update user status error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to update user status",
    };
  }
}

// -------------------------
// Update User Role
// -------------------------
const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(UserRole),
});

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateRoleSchema.parse({ userId, role });

    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
      include: {
        landlordProfile: true,
        tenantProfile: true,
        vendorProfile: true,
      },
    });

    if (!user || user.deletedAt) {
      return { success: false, error: "User not found" };
    }

    // Prevent admin from changing their own role
    if (user.id === session.user.id) {
      return { success: false, error: "You cannot change your own role" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: validated.userId },
        data: { role },
      });

      // Create appropriate profile if it doesn't exist
      if (role === "LANDLORD" && !user.landlordProfile) {
        await tx.landlord.create({
          data: {
            userId: validated.userId,
            subscriptionTier: "BASIC",
            subscriptionStatus: "INACTIVE",
            propertyLimit: 5,
          },
        });
      } else if (role === "TENANT" && !user.tenantProfile) {
        await tx.tenant.create({
          data: {
            userId: validated.userId,
          },
        });
      } else if (role === "VENDOR" && !user.vendorProfile) {
        await tx.vendor.create({
          data: {
            userId: validated.userId,
            businessName: user.name || "Vendor Business",
            category: "OTHER",
            services: [],
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: session.user.id!,
          type: "USER_LOGIN",
          action: `Changed user role to ${role}`,
          entityType: "User",
          entityId: validated.userId,
          metadata: {
            previousRole: user.role,
            newRole: role,
            targetUser: user.email,
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: validated.userId,
          type: "SYSTEM",
          channel: "IN_APP",
          title: `Account Role Changed`,
          message: `Your account role has been changed to ${role}.`,
        },
      });
    });

    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Update user role error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to update user role",
    };
  }
}

// -------------------------
// Delete User (Soft Delete)
// -------------------------
export async function deleteUser(
  userId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      return { success: false, error: "User not found" };
    }

    // Prevent admin from deleting themselves
    if (user.id === session.user.id) {
      return { success: false, error: "You cannot delete your own account" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id!,
          type: "USER_LOGIN",
          action: `Deleted user account`,
          entityType: "User",
          entityId: userId,
          metadata: {
            targetUser: user.email,
            reason,
          },
        },
      });
    });

    revalidatePath("/dashboard/users");

    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}

// -------------------------
// Get User Statistics
// -------------------------
export async function getUserStatistics(userId: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const user = await getUserDetails(userId);
    if (!user) return null;

    const stats: any = {
      totalActivity: user._count.activityLogs,
      totalNotifications: user._count.notifications,
      totalMessages: user._count.sentMessages + user._count.receivedMessages,
      totalDocuments: user._count.documents,
    };

    if (user.role === "LANDLORD" && user.landlordProfile) {
      const totalRevenue = await prisma.payment.aggregate({
        where: {
          lease: {
            unit: {
              property: {
                landlordId: user.landlordProfile.id,
              },
            },
          },
          status: "COMPLETED",
        },
        _sum: { netAmount: true },
      });

      stats.landlord = {
        totalProperties: user.landlordProfile._count.properties,
        totalExpenses: user.landlordProfile._count.expenses,
        totalRevenue: Number(totalRevenue._sum.netAmount || 0),
        subscriptionTier: user.landlordProfile.subscriptionTier,
        subscriptionStatus: user.landlordProfile.subscriptionStatus,
      };
    } else if (user.role === "TENANT" && user.tenantProfile) {
      const totalPaid = await prisma.payment.aggregate({
        where: {
          tenantId: user.tenantProfile.id,
          status: "COMPLETED",
        },
        _sum: { amount: true },
      });

      stats.tenant = {
        totalPayments: user.tenantProfile._count.payments,
        totalPaid: Number(totalPaid._sum.amount || 0),
        activeLeases: user.tenantProfile.leaseMembers.filter(
          (lm) => lm.lease.status === "ACTIVE"
        ).length,
      };
    } else if (user.role === "VENDOR" && user.vendorProfile) {
      stats.vendor = {
        totalTickets: user.vendorProfile._count.tickets,
        totalReviews: user.vendorProfile._count.reviews,
        rating: user.vendorProfile.rating
          ? Number(user.vendorProfile.rating)
          : null,
        reviewCount: user.vendorProfile.reviewCount,
      };
    }

    return stats;
  } catch (error) {
    console.error("Get user statistics error:", error);
    return null;
  }
}

// -------------------------
// Create User (Admin) - UPDATED WITH EMAIL
// -------------------------
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
});

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}): Promise<ActionResult<{ userId: string }>> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createUserSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          password: hashedPassword,
          role: validated.role,
          phone: validated.phone,
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });

      // Create appropriate profile
      if (validated.role === "LANDLORD") {
        await tx.landlord.create({
          data: {
            userId: user.id,
            subscriptionTier: "BASIC",
            subscriptionStatus: "INACTIVE",
            propertyLimit: 5,
          },
        });
      } else if (validated.role === "TENANT") {
        await tx.tenant.create({
          data: { userId: user.id },
        });
      } else if (validated.role === "VENDOR") {
        await tx.vendor.create({
          data: {
            userId: user.id,
            businessName: validated.name,
            category: "OTHER",
            services: [],
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: session.user.id!,
          type: "USER_LOGIN",
          action: `Created new ${validated.role} user`,
          entityType: "User",
          entityId: user.id,
          metadata: {
            targetUser: user.email,
          },
        },
      });

      return user;
    });

    // Send welcome email with credentials (async, don't wait)
    sendUserWelcomeEmail(
      validated.email,
      validated.name,
      validated.password, // Send the plain password in email
      validated.role
    ).catch((error) => {
      console.error("Failed to send welcome email:", error);
      // Don't fail the user creation if email fails
    });

    revalidatePath("/dashboard/users");

    return { success: true, data: { userId: newUser.id } };
  } catch (error) {
    console.error("Create user error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to create user",
    };
  }
}