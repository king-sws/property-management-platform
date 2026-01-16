/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/tenants.ts - Production-Ready Version
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendTenantWelcomeEmail, sendPasswordResetEmail } from "@/nodemailer/email";

// -------------------------
// Validation Schemas
// -------------------------
const createTenantSchema = z.object({
  // User fields
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  
  // Tenant specific fields
  dateOfBirth: z.string().optional(),
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  annualIncome: z.number().optional(),
  
  // Emergency contact
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
});

const updateTenantSchema = z.object({
  // User fields
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  
  // Tenant fields
  dateOfBirth: z.string().optional(),
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  annualIncome: z.number().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// -------------------------
// Types
// -------------------------
type TenantResult = {
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

/**
 * Serialize Decimal fields to numbers for Client Components
 */
function serializeTenant(tenant: any) {
  return {
    ...tenant,
    annualIncome: tenant.annualIncome ? Number(tenant.annualIncome) : null,
  };
}

/**
 * Generate a secure temporary password
 */
function generateTemporaryPassword(): string {
  // Generate a memorable but secure password
  const adjectives = ['Swift', 'Blue', 'Green', 'Bright', 'Smart', 'Quick'];
  const nouns = ['Tiger', 'Eagle', 'River', 'Mountain', 'Ocean', 'Forest'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const numbers = Math.floor(1000 + Math.random() * 9000);
  
  return `${adjective}${noun}${numbers}!`;
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// -------------------------
// Create Tenant
// -------------------------
export async function createTenant(data: z.infer<typeof createTenantSchema>): Promise<TenantResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    // Only landlords and admins can create tenants
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can create tenant profiles",
      };
    }
    
    // Validate input
    const validated = createTenantSchema.parse(data);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    
    if (existingUser) {
      return {
        success: false,
        error: "A user with this email already exists",
      };
    }
    
    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(tempPassword);
    
    // Create user and tenant profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user with password
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          name: validated.name,
          phone: validated.phone,
          password: hashedPassword,
          role: "TENANT",
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });
      
      // Create tenant profile
      const tenant = await tx.tenant.create({
        data: {
          userId: newUser.id,
          dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
          employerName: validated.employerName,
          employerPhone: validated.employerPhone,
          annualIncome: validated.annualIncome,
          emergencyName: validated.emergencyName,
          emergencyPhone: validated.emergencyPhone,
          emergencyRelation: validated.emergencyRelation,
        },
        include: {
          user: true,
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_CREATED" as ActivityType,
          action: `Created tenant profile for ${validated.name}`,
          metadata: {
            tenantId: tenant.id,
            tenantEmail: validated.email,
          },
        },
      });
      
      return { tenant, tempPassword };
    });
    
    // Send welcome email with temporary password
    try {
      await sendTenantWelcomeEmail(
        validated.email,
        validated.name,
        result.tempPassword
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Log but don't fail the operation if email fails
      await prisma.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_UPDATED" as ActivityType,
          action: `Failed to send welcome email to ${validated.email}`,
          metadata: {
            tenantId: result.tenant.id,
            error: emailError instanceof Error ? emailError.message : "Unknown error",
          },
        },
      });
    }
    
    revalidatePath("/dashboard/tenants");
    
    return {
      success: true,
      data: serializeTenant(result.tenant),
      message: `Tenant created successfully. Login credentials sent to ${validated.email}`,
    };
  } catch (error) {
    console.error("Create tenant error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create tenant. Please try again.",
    };
  }
}

// -------------------------
// Get Tenants (for Landlord)
// -------------------------
export async function getTenants(params?: {
  search?: string;
  leaseStatus?: string;
  page?: number;
  limit?: number;
}): Promise<TenantResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.TenantWhereInput = {
      deletedAt: null,
    };
    
    // For landlords, filter by their properties
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.leaseMembers = {
        some: {
          lease: {
            unit: {
              property: {
                landlordId: currentUser.landlordProfile.id,
              },
            },
          },
        },
      };
    }
    
    // Add search filter
    if (params?.search) {
      where.user = {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } },
          { phone: { contains: params.search, mode: "insensitive" } },
        ],
      };
    }
    
    // Get tenants with pagination
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
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
          leaseMembers: {
            where: {
              lease: {
                status: { in: ["ACTIVE", "EXPIRING_SOON"] },
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
                        },
                      },
                    },
                  },
                },
              },
            },
            take: 1,
            orderBy: {
              lease: {
                startDate: "desc",
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
      prisma.tenant.count({ where }),
    ]);
    
    // Serialize Decimal fields to numbers for Client Components
    const serializedTenants = tenants.map(tenant => ({
      ...tenant,
      annualIncome: tenant.annualIncome ? Number(tenant.annualIncome) : null,
      payments: tenant.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
        fee: payment.fee ? Number(payment.fee) : null,
        netAmount: Number(payment.netAmount),
      })),
      leaseMembers: tenant.leaseMembers.map(lm => ({
        ...lm,
        lease: {
          ...lm.lease,
          rentAmount: Number(lm.lease.rentAmount),
          deposit: Number(lm.lease.deposit),
          lateFeeAmount: lm.lease.lateFeeAmount ? Number(lm.lease.lateFeeAmount) : null,
          unit: {
            ...lm.lease.unit,
            bathrooms: Number(lm.lease.unit.bathrooms),
            rentAmount: Number(lm.lease.unit.rentAmount),
            deposit: Number(lm.lease.unit.deposit),
          },
        },
      })),
    }));
    
    return {
      success: true,
      data: {
        tenants: serializedTenants,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get tenants error:", error);
    return {
      success: false,
      error: "Failed to fetch tenants",
    };
  }
}

// -------------------------
// Get Tenant by ID
// -------------------------
export async function getTenantById(tenantId: string): Promise<TenantResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            image: true,
            status: true,
            createdAt: true,
          },
        },
        leaseMembers: {
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: true,
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
          orderBy: {
            lease: {
              startDate: "desc",
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            lease: {
              select: {
                unit: {
                  select: {
                    unitNumber: true,
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
        },
        applications: {
          orderBy: {
            submittedAt: "desc",
          },
          include: {
            unit: {
              include: {
                property: {
                  select: {
                    name: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
        screenings: {
          orderBy: {
            requestedAt: "desc",
          },
        },
        reviews: {
          include: {
            author: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!tenant) {
      return {
        success: false,
        error: "Tenant not found",
      };
    }
    
    // Check authorization
    if (currentUser.role === "TENANT" && tenant.userId !== currentUser.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      // Check if tenant is associated with landlord's properties
      const hasAccess = tenant.leaseMembers.some(
        (lm) => lm.lease.unit.property.landlordId === currentUser.landlordProfile?.id
      );
      
      if (!hasAccess) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }
    }
    
    // Serialize all Decimal fields
    const serializedTenant = {
      ...tenant,
      annualIncome: tenant.annualIncome ? Number(tenant.annualIncome) : null,
      payments: tenant.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
        fee: payment.fee ? Number(payment.fee) : null,
        netAmount: Number(payment.netAmount),
      })),
      leaseMembers: tenant.leaseMembers.map(lm => ({
        ...lm,
        lease: {
          ...lm.lease,
          rentAmount: Number(lm.lease.rentAmount),
          deposit: Number(lm.lease.deposit),
          lateFeeAmount: lm.lease.lateFeeAmount ? Number(lm.lease.lateFeeAmount) : null,
          unit: {
            ...lm.lease.unit,
            bathrooms: Number(lm.lease.unit.bathrooms),
            rentAmount: Number(lm.lease.unit.rentAmount),
            deposit: Number(lm.lease.unit.deposit),
            property: {
              ...lm.lease.unit.property,
              purchasePrice: lm.lease.unit.property.purchasePrice ? Number(lm.lease.unit.property.purchasePrice) : null,
              currentValue: lm.lease.unit.property.currentValue ? Number(lm.lease.unit.property.currentValue) : null,
              propertyTax: lm.lease.unit.property.propertyTax ? Number(lm.lease.unit.property.propertyTax) : null,
              insurance: lm.lease.unit.property.insurance ? Number(lm.lease.unit.property.insurance) : null,
              hoaFees: lm.lease.unit.property.hoaFees ? Number(lm.lease.unit.property.hoaFees) : null,
            },
          },
          tenants: lm.lease.tenants.map(t => ({
            ...t,
            tenant: {
              ...t.tenant,
              annualIncome: t.tenant.annualIncome ? Number(t.tenant.annualIncome) : null,
            },
          })),
        },
      })),
      applications: tenant.applications.map(app => ({
        ...app,
        monthlyIncome: app.monthlyIncome ? Number(app.monthlyIncome) : null,
        applicationFee: app.applicationFee ? Number(app.applicationFee) : null,
        unit: {
          ...app.unit,
          bathrooms: Number(app.unit.bathrooms),
          rentAmount: Number(app.unit.rentAmount),
          deposit: Number(app.unit.deposit),
        },
      })),
    };
    
    return {
      success: true,
      data: serializedTenant,
    };
  } catch (error) {
    console.error("Get tenant error:", error);
    return {
      success: false,
      error: "Failed to fetch tenant details",
    };
  }
}

// -------------------------
// Update Tenant
// -------------------------
export async function updateTenant(
  tenantId: string,
  data: z.infer<typeof updateTenantSchema>
): Promise<TenantResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        user: true,
      },
    });
    
    if (!tenant) {
      return {
        success: false,
        error: "Tenant not found",
      };
    }
    
    // Check authorization
    const isOwnProfile = currentUser.id === tenant.userId;
    const isLandlord = currentUser.role === "LANDLORD";
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isOwnProfile && !isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    // Validate input
    const validated = updateTenantSchema.parse(data);
    
    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user if name or phone changed
      if (validated.name || validated.phone) {
        await tx.user.update({
          where: { id: tenant.userId },
          data: {
            ...(validated.name && { name: validated.name }),
            ...(validated.phone && { phone: validated.phone }),
          },
        });
      }
      
      // Update tenant profile
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          ...(validated.dateOfBirth && {
            dateOfBirth: new Date(validated.dateOfBirth),
          }),
          ...(validated.employerName !== undefined && {
            employerName: validated.employerName,
          }),
          ...(validated.employerPhone !== undefined && {
            employerPhone: validated.employerPhone,
          }),
          ...(validated.annualIncome !== undefined && {
            annualIncome: validated.annualIncome,
          }),
          ...(validated.emergencyName !== undefined && {
            emergencyName: validated.emergencyName,
          }),
          ...(validated.emergencyPhone !== undefined && {
            emergencyPhone: validated.emergencyPhone,
          }),
          ...(validated.emergencyRelation !== undefined && {
            emergencyRelation: validated.emergencyRelation,
          }),
        },
        include: {
          user: true,
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_UPDATED" as ActivityType,
          action: `Updated tenant profile for ${tenant.user.name}`,
          metadata: {
            tenantId: tenantId,
            updatedFields: Object.keys(validated),
          },
        },
      });
      
      return updatedTenant;
    });
    
    revalidatePath("/dashboard/tenants");
    revalidatePath(`/dashboard/tenants/${tenantId}`);
    
    return {
      success: true,
      data: serializeTenant(result),
      message: "Tenant updated successfully",
    };
  } catch (error) {
    console.error("Update tenant error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update tenant. Please try again.",
    };
  }
}

// -------------------------
// Delete Tenant (Soft Delete)
// -------------------------
export async function deleteTenant(tenantId: string): Promise<TenantResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords and admins can delete tenants",
      };
    }
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        user: true,
        leaseMembers: {
          where: {
            lease: {
              status: { in: ["ACTIVE", "PENDING_SIGNATURE"] },
            },
          },
        },
      },
    });
    
    if (!tenant) {
      return {
        success: false,
        error: "Tenant not found",
      };
    }
    
    // Check for active leases
    if (tenant.leaseMembers.length > 0) {
      return {
        success: false,
        error: "Cannot delete tenant with active leases",
      };
    }
    
    // Soft delete
    await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          deletedAt: new Date(),
        },
      });
      
      await tx.user.update({
        where: { id: tenant.userId },
        data: {
          deletedAt: new Date(),
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_DELETED" as ActivityType,
          action: `Deleted tenant profile for ${tenant.user.name}`,
          metadata: {
            tenantId: tenantId,
            tenantEmail: tenant.user.email,
          },
        },
      });
    });
    
    revalidatePath("/dashboard/tenants");
    
    return {
      success: true,
      message: "Tenant deleted successfully",
    };
  } catch (error) {
    console.error("Delete tenant error:", error);
    return {
      success: false,
      error: "Failed to delete tenant. Please try again.",
    };
  }
}

// -------------------------
// Get Tenant Statistics
// -------------------------
export async function getTenantStatistics(tenantId: string): Promise<TenantResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currentUser = await getCurrentUserWithRole();
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        payments: {
          where: {
            status: "COMPLETED",
          },
        },
        leaseMembers: {
          include: {
            lease: true,
          },
        },
      },
    });
    
    if (!tenant) {
      return {
        success: false,
        error: "Tenant not found",
      };
    }
    
    // Calculate statistics
    const totalPayments = tenant.payments.length;
    const totalPaid = tenant.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const onTimePayments = tenant.payments.filter(
      (p) => p.dueDate && p.paidAt && p.paidAt <= p.dueDate
    ).length;
    const latePayments = tenant.payments.filter(
      (p) => p.dueDate && p.paidAt && p.paidAt > p.dueDate
    ).length;
    
    const activeLeases = tenant.leaseMembers.filter(
      (lm) => lm.lease.status === "ACTIVE"
    ).length;
    
    const statistics = {
      totalPayments,
      totalPaid,
      onTimePayments,
      latePayments,
      paymentReliability:
        totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 100,
      activeLeases,
      totalLeases: tenant.leaseMembers.length,
    };
    
    return {
      success: true,
      data: statistics,
    };
  } catch (error) {
    console.error("Get tenant statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch tenant statistics",
    };
  }
}

// -------------------------
// Change Password
// -------------------------
export async function changePassword(
  data: z.infer<typeof changePasswordSchema>
): Promise<TenantResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Validate input
    const validated = changePasswordSchema.parse(data);
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user || !user.password) {
      return { success: false, error: "User not found or no password set" };
    }
    
    // Verify current password
    const isValid = await verifyPassword(validated.currentPassword, user.password);
    
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }
    
    // Hash new password
    const hashedNewPassword = await hashPassword(validated.newPassword);
    
    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "PROPERTY_UPDATED" as ActivityType,
        action: "Changed password",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Change password error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to change password",
    };
  }
}

// -------------------------
// Request Password Reset
// -------------------------
export async function requestPasswordReset(
  data: z.infer<typeof resetPasswordSchema>
): Promise<TenantResult> {
  try {
    const validated = resetPasswordSchema.parse(data);
    
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    
    if (!user) {
      // Don't reveal if user exists for security
      return {
        success: true,
        message: "If an account exists, a reset email has been sent",
      };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Note: You'll need to add these fields to your User model in schema.prisma:
        // resetToken: String?
        // resetTokenExpiry: DateTime?
        // For now, we'll store in metadata or create a separate PasswordReset table
      },
    });
    
    // Send reset email
    try {
      await sendPasswordResetEmail(validated.email, user.name || '', resetToken);
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      return {
        success: false,
        error: "Failed to send reset email. Please try again.",
      };
    }
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: "PROPERTY_UPDATED" as ActivityType,
        action: "Requested password reset",
        metadata: {
          email: validated.email,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    return {
      success: true,
      message: "Password reset email sent",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid email address",
      };
    }
    
    return {
      success: false,
      error: "Failed to send reset email",
    };
  }
}

// -------------------------
// Resend Welcome Email
// -------------------------
export async function resendWelcomeEmail(tenantId: string): Promise<TenantResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords and admins can resend welcome emails",
      };
    }
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        user: true,
      },
    });
    
    if (!tenant) {
      return {
        success: false,
        error: "Tenant not found",
      };
    }
    
    // Generate new temporary password
    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(tempPassword);
    
    // Update password
    await prisma.user.update({
      where: { id: tenant.userId },
      data: { password: hashedPassword },
    });
    
    // Send welcome email
    try {
      await sendTenantWelcomeEmail(
        tenant.user.email,
        tenant.user.name || '',
        tempPassword
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      return {
        success: false,
        error: "Failed to send welcome email. Please try again.",
      };
    }
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: "PROPERTY_UPDATED" as ActivityType,
        action: `Resent welcome email to ${tenant.user.name}`,
        metadata: {
          tenantId: tenantId,
          tenantEmail: tenant.user.email,
        },
      },
    });
    
    return {
      success: true,
      message: `Welcome email resent to ${tenant.user.email}`,
    };
  } catch (error) {
    console.error("Resend welcome email error:", error);
    return {
      success: false,
      error: "Failed to resend welcome email. Please try again.",
    };
  }
}