/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/vendors.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, VendorCategory } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import { sendVendorInviteEmail } from "@/nodemailer/email";

// -------------------------
// Validation Schemas
// -------------------------
const createVendorSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  businessName: z.string().min(2, "Business name is required"),
  category: z.enum([
    "PLUMBER",
    "ELECTRICIAN",
    "HVAC",
    "LANDSCAPING",
    "CLEANING",
    "PEST_CONTROL",
    "GENERAL_CONTRACTOR",
    "HANDYMAN",
    "APPLIANCE_REPAIR",
    "LOCKSMITH",
    "PAINTER",
    "ROOFER",
    "OTHER",
  ]),
  services: z.array(z.string()).min(1, "At least one service is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  licenseNumber: z.string().optional(),
  isInsured: z.boolean().default(false),
  insuranceExp: z.string().optional(),
});

const updateVendorSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  businessName: z.string().min(2).optional(),
  category: z.enum([
    "PLUMBER",
    "ELECTRICIAN",
    "HVAC",
    "LANDSCAPING",
    "CLEANING",
    "PEST_CONTROL",
    "GENERAL_CONTRACTOR",
    "HANDYMAN",
    "APPLIANCE_REPAIR",
    "LOCKSMITH",
    "PAINTER",
    "ROOFER",
    "OTHER",
  ]).optional(),
  services: z.array(z.string()).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  licenseNumber: z.string().optional(),
  isInsured: z.boolean().optional(),
  insuranceExp: z.string().optional(),
  availability: z.any().optional(),
  isActive: z.boolean().optional(),
});

const vendorReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  punctualityRating: z.number().min(1).max(5).optional(),
  professionalismRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
});

// -------------------------
// Types
// -------------------------
type VendorResult = {
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

function serializeVendor(vendor: any) {
  return {
    ...vendor,
    rating: vendor.rating ? Number(vendor.rating) : null,
    insuranceExp: vendor.insuranceExp?.toISOString() || null,
    createdAt: vendor.createdAt?.toISOString() || null,
    updatedAt: vendor.updatedAt?.toISOString() || null,
    deletedAt: vendor.deletedAt?.toISOString() || null,
    user: vendor.user ? {
      ...vendor.user,
      createdAt: vendor.user.createdAt?.toISOString() || null,
      updatedAt: vendor.user.updatedAt?.toISOString() || null,
    } : null,
  };
}

function generateTemporaryPassword(): string {
  const adjectives = ['Swift', 'Blue', 'Green', 'Bright', 'Smart', 'Quick'];
  const nouns = ['Tiger', 'Eagle', 'River', 'Mountain', 'Ocean', 'Forest'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `${adjective}${noun}${numbers}!`;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// -------------------------
// Create Vendor
// -------------------------
export async function createVendor(data: z.infer<typeof createVendorSchema>): Promise<VendorResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords and admins can create vendors",
      };
    }
    
    const validated = createVendorSchema.parse(data);
    
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
    
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          name: validated.name,
          phone: validated.phone,
          password: hashedPassword,
          role: "VENDOR",
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });
      
      // Create vendor profile
      const vendor = await tx.vendor.create({
        data: {
          userId: newUser.id,
          businessName: validated.businessName,
          category: validated.category as VendorCategory,
          services: validated.services,
          address: validated.address,
          city: validated.city,
          state: validated.state,
          zipCode: validated.zipCode,
          licenseNumber: validated.licenseNumber,
          isInsured: validated.isInsured,
          insuranceExp: validated.insuranceExp ? new Date(validated.insuranceExp) : null,
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
          action: `Created vendor profile for ${validated.businessName}`,
          metadata: {
            vendorId: vendor.id,
            vendorEmail: validated.email,
          },
        },
      });
      
      return { vendor, tempPassword };
    });
    
    // Send invite email
    try {
      await sendVendorInviteEmail(
        validated.email,
        validated.name,
        validated.businessName,
        result.tempPassword
      );
    } catch (emailError) {
      console.error("Failed to send invite email:", emailError);
    }
    
    revalidatePath("/dashboard/vendors");
    
    return {
      success: true,
      data: serializeVendor(result.vendor),
      message: `Vendor created successfully. Login credentials sent to ${validated.email}`,
    };
  } catch (error) {
    console.error("Create vendor error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create vendor. Please try again.",
    };
  }
}

// -------------------------
// Get Vendors
// -------------------------
export async function getVendors(params?: {
  search?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<VendorResult> {
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
    
    const where: Prisma.VendorWhereInput = {
      deletedAt: null,
    };
    
    if (params?.category) {
      where.category = params.category as VendorCategory;
    }
    
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    
    if (params?.search) {
      where.OR = [
        { businessName: { contains: params.search, mode: "insensitive" } },
        { user: { name: { contains: params.search, mode: "insensitive" } } },
        { user: { email: { contains: params.search, mode: "insensitive" } } },
      ];
    }
    
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
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
              status: true,
            },
          },
          tickets: {
            where: {
              status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] },
            },
            take: 5,
            orderBy: { createdAt: "desc" },
          },
          reviews: {
            take: 3,
            orderBy: { createdAt: "desc" },
            include: {
              author: {
                select: { name: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { rating: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.vendor.count({ where }),
    ]);
    
    const serializedVendors = vendors.map(serializeVendor);
    
    return {
      success: true,
      data: {
        vendors: serializedVendors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get vendors error:", error);
    return {
      success: false,
      error: "Failed to fetch vendors",
    };
  }
}

// -------------------------
// Get Vendor by ID
// -------------------------
export async function getVendorById(vendorId: string): Promise<VendorResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
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
          },
        },
        tickets: {
          where: { deletedAt: null },
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
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          include: {
            ticket: {
              select: {
                id: true,
                title: true,
                property: {
                  select: {
                    name: true,
                    address: true,
                  },
                },
              },
            },
          },
          orderBy: { scheduledStart: "desc" },
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    
    if (!vendor || vendor.deletedAt) {
      return {
        success: false,
        error: "Vendor not found",
      };
    }
    
    // Check authorization
    const isOwnProfile = currentUser.id === vendor.userId;
    const isLandlord = currentUser.role === "LANDLORD";
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isOwnProfile && !isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    return {
      success: true,
      data: serializeVendor(vendor),
    };
  } catch (error) {
    console.error("Get vendor error:", error);
    return {
      success: false,
      error: "Failed to fetch vendor details",
    };
  }
}

// -------------------------
// Update Vendor
// -------------------------
export async function updateVendor(
  vendorId: string,
  data: z.infer<typeof updateVendorSchema>
): Promise<VendorResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: true },
    });
    
    if (!vendor || vendor.deletedAt) {
      return {
        success: false,
        error: "Vendor not found",
      };
    }
    
    const isOwnProfile = currentUser.id === vendor.userId;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isOwnProfile && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const validated = updateVendorSchema.parse(data);
    
    const result = await prisma.$transaction(async (tx) => {
      // Update user if name or phone changed
      if (validated.name || validated.phone) {
        await tx.user.update({
          where: { id: vendor.userId },
          data: {
            ...(validated.name && { name: validated.name }),
            ...(validated.phone && { phone: validated.phone }),
          },
        });
      }
      
      // Update vendor profile
      const updatedVendor = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          ...(validated.businessName && { businessName: validated.businessName }),
          ...(validated.category && { category: validated.category as VendorCategory }),
          ...(validated.services && { services: validated.services }),
          ...(validated.address !== undefined && { address: validated.address }),
          ...(validated.city !== undefined && { city: validated.city }),
          ...(validated.state !== undefined && { state: validated.state }),
          ...(validated.zipCode !== undefined && { zipCode: validated.zipCode }),
          ...(validated.licenseNumber !== undefined && { licenseNumber: validated.licenseNumber }),
          ...(validated.isInsured !== undefined && { isInsured: validated.isInsured }),
          ...(validated.insuranceExp && { insuranceExp: new Date(validated.insuranceExp) }),
          ...(validated.availability !== undefined && { availability: validated.availability }),
          ...(validated.isActive !== undefined && { isActive: validated.isActive }),
        },
        include: { user: true },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_UPDATED" as ActivityType,
          action: `Updated vendor profile for ${vendor.businessName}`,
          metadata: {
            vendorId: vendorId,
            updatedFields: Object.keys(validated),
          },
        },
      });
      
      return updatedVendor;
    });
    
    revalidatePath("/dashboard/vendors");
    revalidatePath(`/dashboard/vendors/${vendorId}`);
    
    return {
      success: true,
      data: serializeVendor(result),
      message: "Vendor updated successfully",
    };
  } catch (error) {
    console.error("Update vendor error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update vendor. Please try again.",
    };
  }
}

// -------------------------
// Delete Vendor
// -------------------------
export async function deleteVendor(vendorId: string): Promise<VendorResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords and admins can delete vendors",
      };
    }
    
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: true,
        tickets: {
          where: {
            status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] },
          },
        },
      },
    });
    
    if (!vendor || vendor.deletedAt) {
      return {
        success: false,
        error: "Vendor not found",
      };
    }
    
    if (vendor.tickets.length > 0) {
      return {
        success: false,
        error: "Cannot delete vendor with active maintenance tickets",
      };
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.vendor.update({
        where: { id: vendorId },
        data: { deletedAt: new Date() },
      });
      
      await tx.user.update({
        where: { id: vendor.userId },
        data: { deletedAt: new Date() },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "PROPERTY_DELETED" as ActivityType,
          action: `Deleted vendor profile for ${vendor.businessName}`,
          metadata: { vendorId: vendorId },
        },
      });
    });
    
    revalidatePath("/dashboard/vendors");
    
    return {
      success: true,
      message: "Vendor deleted successfully",
    };
  } catch (error) {
    console.error("Delete vendor error:", error);
    return {
      success: false,
      error: "Failed to delete vendor. Please try again.",
    };
  }
}

// -------------------------
// Add Vendor Review
// -------------------------
export async function addVendorReview(
  vendorId: string,
  data: z.infer<typeof vendorReviewSchema>
): Promise<VendorResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can review vendors",
      };
    }
    
    const validated = vendorReviewSchema.parse(data);
    
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.vendorReview.create({
        data: {
          vendorId: vendorId,
          authorId: currentUser.id,
          ...validated,
        },
      });
      
      // Update vendor average rating
      const reviews = await tx.vendorReview.findMany({
        where: { vendorId: vendorId },
      });
      
      const avgRating = reviews.reduce((sum: any, r: { rating: any; }) => sum + r.rating, 0) / reviews.length;
      
      await tx.vendor.update({
        where: { id: vendorId },
        data: {
          rating: avgRating,
          reviewCount: reviews.length,
        },
      });
      
      return newReview;
    });
    
    revalidatePath(`/dashboard/vendors/${vendorId}`);
    
    return {
      success: true,
      data: review,
      message: "Review submitted successfully",
    };
  } catch (error) {
    console.error("Add review error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to submit review. Please try again.",
    };
  }
}

// -------------------------
// Get Vendor Statistics
// -------------------------
export async function getVendorStatistics(vendorId: string): Promise<VendorResult> {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        tickets: true,
        appointments: true,
        reviews: true,
      },
    });
    
    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found",
      };
    }
    
    const totalJobs = vendor.tickets.length;
    const completedJobs = vendor.tickets.filter(t => t.status === "COMPLETED").length;
    const activeJobs = vendor.tickets.filter(t => 
      ["OPEN", "IN_PROGRESS", "SCHEDULED"].includes(t.status)
    ).length;
    
    const statistics = {
      totalJobs,
      completedJobs,
      activeJobs,
      completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      averageRating: vendor.rating ? Number(vendor.rating) : null,
      totalReviews: vendor.reviewCount,
      upcomingAppointments: vendor.appointments.filter(a => 
        new Date(a.scheduledStart) > new Date() && a.status === "SCHEDULED"
      ).length,
    };
    
    return {
      success: true,
      data: statistics,
    };
  } catch (error) {
    console.error("Get vendor statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch vendor statistics",
    };
  }
}