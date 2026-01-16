/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/settings.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType } from "@/lib/generated/prisma/enums";
import bcrypt from "bcryptjs";

// -------------------------
// Validation Schemas
// -------------------------
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const updateNotificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  notificationTypes: z.array(z.string()),
});

const updateLandlordSettingsSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  taxId: z.string().optional(),
  autoRentReminders: z.boolean().optional(),
  lateFeeAutoApply: z.boolean().optional(),
  maintenanceAutoAssign: z.boolean().optional(),
});

const updateTenantSettingsSchema = z.object({
  dateOfBirth: z.string().optional(),
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  annualIncome: z.number().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
});

const updateVendorSettingsSchema = z.object({
  businessName: z.string().min(2, "Business name required"),
  category: z.string(),
  services: z.array(z.string()),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  licenseNumber: z.string().optional(),
  isInsured: z.boolean().optional(),
  insuranceExp: z.string().optional(),
});

// -------------------------
// Types
// -------------------------
type SettingsResult = {
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
      vendorProfile: true,
    },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

// -------------------------
// Get User Settings
// -------------------------
export async function getUserSettings(): Promise<SettingsResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    // Get notification preferences
    const notificationSettings = await prisma.systemSetting.findMany({
      where: {
        key: {
          startsWith: `user:${currentUser.id}:notifications:`,
        },
      },
    });
    
    const settings = {
      profile: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        avatar: currentUser.avatar || currentUser.image,
        role: currentUser.role,
        status: currentUser.status,
      },
      notifications: {
        emailNotifications: notificationSettings.find(s => s.key.endsWith(':email'))?.value === 'true',
        smsNotifications: notificationSettings.find(s => s.key.endsWith(':sms'))?.value === 'true' ,
        pushNotifications: notificationSettings.find(s => s.key.endsWith(':push'))?.value === 'true',
        enabledTypes: notificationSettings
          .filter(s => s.key.includes(':type:') && s.value === 'true')
          .map(s => s.key.split(':type:')[1]),
      },
      landlordSettings: currentUser.landlordProfile ? {
        businessName: currentUser.landlordProfile.businessName,
        businessAddress: currentUser.landlordProfile.businessAddress,
        taxId: currentUser.landlordProfile.taxId,
        subscriptionTier: currentUser.landlordProfile.subscriptionTier,
        subscriptionStatus: currentUser.landlordProfile.subscriptionStatus,
        propertyLimit: currentUser.landlordProfile.propertyLimit,
      } : null,
      tenantSettings: currentUser.tenantProfile ? {
        dateOfBirth: currentUser.tenantProfile.dateOfBirth?.toISOString() || null,
        employerName: currentUser.tenantProfile.employerName,
        employerPhone: currentUser.tenantProfile.employerPhone,
        annualIncome: currentUser.tenantProfile.annualIncome ? Number(currentUser.tenantProfile.annualIncome) : null,
        emergencyName: currentUser.tenantProfile.emergencyName,
        emergencyPhone: currentUser.tenantProfile.emergencyPhone,
        emergencyRelation: currentUser.tenantProfile.emergencyRelation,
      } : null,
      vendorSettings: currentUser.vendorProfile ? {
        businessName: currentUser.vendorProfile.businessName,
        category: currentUser.vendorProfile.category,
        services: currentUser.vendorProfile.services,
        address: currentUser.vendorProfile.address,
        city: currentUser.vendorProfile.city,
        state: currentUser.vendorProfile.state,
        zipCode: currentUser.vendorProfile.zipCode,
        licenseNumber: currentUser.vendorProfile.licenseNumber,
        isInsured: currentUser.vendorProfile.isInsured,
        insuranceExp: currentUser.vendorProfile.insuranceExp?.toISOString() || null,
        rating: currentUser.vendorProfile.rating ? Number(currentUser.vendorProfile.rating) : null,
        reviewCount: currentUser.vendorProfile.reviewCount,
      } : null,
    };
    
    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Get user settings error:", error);
    return {
      success: false,
      error: "Failed to fetch settings",
    };
  }
}

// -------------------------
// Update Profile
// -------------------------
export async function updateProfile(
  data: z.infer<typeof updateProfileSchema>
): Promise<SettingsResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    const validated = updateProfileSchema.parse(data);
    
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.phone && { phone: validated.phone }),
        ...(validated.avatar && { avatar: validated.avatar }),
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: "USER_LOGIN" as ActivityType,
        action: "Updated profile information",
      },
    });
    
    revalidatePath("/dashboard/settings");
    
    return {
      success: true,
      data: {
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
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
// Update Password
// -------------------------
export async function updatePassword(
  data: z.infer<typeof updatePasswordSchema>
): Promise<SettingsResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    const validated = updatePasswordSchema.parse(data);
    
    if (!currentUser.password) {
      return {
        success: false,
        error: "Cannot update password for OAuth accounts",
      };
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(validated.currentPassword, currentUser.password);
    if (!isValid) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 12);
    
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: "USER_LOGIN" as ActivityType,
        action: "Password changed successfully",
      },
    });
    
    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Update password error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update password",
    };
  }
}

// -------------------------
// Update Notification Settings
// -------------------------
export async function updateNotificationSettings(
  data: z.infer<typeof updateNotificationSettingsSchema>
): Promise<SettingsResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    const validated = updateNotificationSettingsSchema.parse(data);
    
    // Store notification preferences in SystemSettings
    const settingsToUpsert = [
      {
        key: `user:${currentUser.id}:notifications:email`,
        value: validated.emailNotifications.toString(),
        type: "boolean",
        description: "Email notifications enabled",
      },
      {
        key: `user:${currentUser.id}:notifications:sms`,
        value: validated.smsNotifications.toString(),
        type: "boolean",
        description: "SMS notifications enabled",
      },
      {
        key: `user:${currentUser.id}:notifications:push`,
        value: validated.pushNotifications.toString(),
        type: "boolean",
        description: "Push notifications enabled",
      },
    ];
    
    // Add enabled notification types
    validated.notificationTypes.forEach(type => {
      settingsToUpsert.push({
        key: `user:${currentUser.id}:notifications:type:${type}`,
        value: "true",
        type: "boolean",
        description: `${type} notifications enabled`,
      });
    });
    
    await Promise.all(
      settingsToUpsert.map(setting =>
        prisma.systemSetting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting,
        })
      )
    );
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: "USER_LOGIN" as ActivityType,
        action: "Updated notification settings",
      },
    });
    
    revalidatePath("/dashboard/settings");
    
    return {
      success: true,
      message: "Notification settings updated successfully",
    };
  } catch (error) {
    console.error("Update notification settings error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update notification settings",
    };
  }
}

// -------------------------
// Update Landlord Settings
// -------------------------
export async function updateLandlordSettings(
  data: z.infer<typeof updateLandlordSettingsSchema>
): Promise<SettingsResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (!currentUser.landlordProfile) {
      return {
        success: false,
        error: "Not a landlord account",
      };
    }
    
    const validated = updateLandlordSettingsSchema.parse(data);
    
    await prisma.landlord.update({
      where: { id: currentUser.landlordProfile.id },
      data: {
        ...(validated.businessName !== undefined && { businessName: validated.businessName }),
        ...(validated.businessAddress !== undefined && { businessAddress: validated.businessAddress }),
        ...(validated.taxId !== undefined && { taxId: validated.taxId }),
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: "PROPERTY_UPDATED" as ActivityType,
        action: "Updated landlord settings",
      },
    });
    
    revalidatePath("/dashboard/settings");
    
    return {
      success: true,
      message: "Landlord settings updated successfully",
    };
  } catch (error) {
    console.error("Update landlord settings error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update landlord settings",
    };
  }
}

// -------------------------
// Update Tenant Settings
// -------------------------
export async function updateTenantSettings(
  data: z.infer<typeof updateTenantSettingsSchema>
): Promise<SettingsResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (!currentUser.tenantProfile) {
      return {
        success: false,
        error: "Not a tenant account",
      };
    }
    
    const validated = updateTenantSettingsSchema.parse(data);
    
    await prisma.tenant.update({
      where: { id: currentUser.tenantProfile.id },
      data: {
        ...(validated.dateOfBirth && { dateOfBirth: new Date(validated.dateOfBirth) }),
        ...(validated.employerName !== undefined && { employerName: validated.employerName }),
        ...(validated.employerPhone !== undefined && { employerPhone: validated.employerPhone }),
        ...(validated.annualIncome !== undefined && { annualIncome: validated.annualIncome }),
        ...(validated.emergencyName !== undefined && { emergencyName: validated.emergencyName }),
        ...(validated.emergencyPhone !== undefined && { emergencyPhone: validated.emergencyPhone }),
        ...(validated.emergencyRelation !== undefined && { emergencyRelation: validated.emergencyRelation }),
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: "USER_LOGIN" as ActivityType,
        action: "Updated tenant settings",
      },
    });
    
    revalidatePath("/dashboard/settings");
    
    return {
      success: true,
      message: "Tenant settings updated successfully",
    };
  } catch (error) {
    console.error("Update tenant settings error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update tenant settings",
    };
  }
}

// -------------------------
// Update Vendor Settings
// -------------------------
export async function updateVendorSettings(
  data: z.infer<typeof updateVendorSettingsSchema>
): Promise<SettingsResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (!currentUser.vendorProfile) {
      return {
        success: false,
        error: "Not a vendor account",
      };
    }
    
    const validated = updateVendorSettingsSchema.parse(data);
    
    await prisma.vendor.update({
      where: { id: currentUser.vendorProfile.id },
      data: {
        businessName: validated.businessName,
        category: validated.category as any,
        services: validated.services,
        ...(validated.address !== undefined && { address: validated.address }),
        ...(validated.city !== undefined && { city: validated.city }),
        ...(validated.state !== undefined && { state: validated.state }),
        ...(validated.zipCode !== undefined && { zipCode: validated.zipCode }),
        ...(validated.licenseNumber !== undefined && { licenseNumber: validated.licenseNumber }),
        ...(validated.isInsured !== undefined && { isInsured: validated.isInsured }),
        ...(validated.insuranceExp && { insuranceExp: new Date(validated.insuranceExp) }),
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: "USER_LOGIN" as ActivityType,
        action: "Updated vendor settings",
      },
    });
    
    revalidatePath("/dashboard/settings");
    
    return {
      success: true,
      message: "Vendor settings updated successfully",
    };
  } catch (error) {
    console.error("Update vendor settings error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update vendor settings",
    };
  }
}

// -------------------------
// Delete Account
// -------------------------
export async function deleteAccount(password: string): Promise<SettingsResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    // Verify password for credential accounts
    if (currentUser.password) {
      const isValid = await bcrypt.compare(password, currentUser.password);
      if (!isValid) {
        return {
          success: false,
          error: "Incorrect password",
        };
      }
    }
    
    // Soft delete
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    });
    
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        type: "USER_LOGOUT" as ActivityType,
        action: "Account deleted",
      },
    });
    
    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error) {
    console.error("Delete account error:", error);
    return {
      success: false,
      error: "Failed to delete account",
    };
  }
}