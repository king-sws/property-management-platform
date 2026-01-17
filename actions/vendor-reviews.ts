/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/vendor-reviews.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";

// -------------------------
// Validation Schemas
// -------------------------
const createReviewSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  ticketId: z.string().optional(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  comment: z.string().min(10, "Comment must be at least 10 characters").optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  punctualityRating: z.number().min(1).max(5).optional(),
  professionalismRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  // REMOVED: isVerified - this is set by server logic, not user input
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(3).optional(),
  comment: z.string().min(10).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  punctualityRating: z.number().min(1).max(5).optional(),
  professionalismRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
});

const vendorResponseSchema = z.object({
  vendorResponse: z.string().min(10, "Response must be at least 10 characters"),
});

// -------------------------
// Types
// -------------------------
type ReviewResult = {
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

function serializeReview(review: any) {
  return {
    ...review,
    createdAt: review.createdAt?.toISOString() || null,
    updatedAt: review.updatedAt?.toISOString() || null,
    respondedAt: review.respondedAt?.toISOString() || null,
    author: review.author ? {
      ...review.author,
      createdAt: review.author.createdAt?.toISOString() || null,
      updatedAt: review.author.updatedAt?.toISOString() || null,
    } : null,
    vendor: review.vendor ? {
      ...review.vendor,
      rating: review.vendor.rating ? Number(review.vendor.rating) : null,
      createdAt: review.vendor.createdAt?.toISOString() || null,
      updatedAt: review.vendor.updatedAt?.toISOString() || null,
    } : null,
  };
}

// -------------------------
// Create Review
// -------------------------
export async function createVendorReview(
  data: z.infer<typeof createReviewSchema>
): Promise<ReviewResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    // Only landlords can create reviews
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can review vendors",
      };
    }
    
    const validated = createReviewSchema.parse(data);
    
    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: validated.vendorId },
      include: { user: true },
    });
    
    if (!vendor || vendor.deletedAt) {
      return {
        success: false,
        error: "Vendor not found",
      };
    }
    
    // Check if user already reviewed this vendor
    const existingReview = await prisma.vendorReview.findFirst({
      where: {
        vendorId: validated.vendorId,
        authorId: currentUser.id,
      },
    });
    
    if (existingReview) {
      return {
        success: false,
        error: "You have already reviewed this vendor. Please edit your existing review instead.",
      };
    }
    
    // Determine if review should be verified
    let isVerified = false;
    
    // Verify ticket if provided
    if (validated.ticketId) {
      const ticket = await prisma.maintenanceTicket.findUnique({
        where: { id: validated.ticketId },
        include: { property: true },
      });
      
      if (!ticket) {
        return {
          success: false,
          error: "Maintenance ticket not found",
        };
      }
      
      // Verify user owns the property
      if (currentUser.landlordProfile?.id !== ticket.property.landlordId) {
        return {
          success: false,
          error: "You can only review vendors for your own properties",
        };
      }
      
      // Verify ticket is completed
      if (ticket.status !== "COMPLETED") {
        return {
          success: false,
          error: "You can only review completed jobs",
        };
      }
      
      // Set as verified if linked to completed ticket
      isVerified = true;
    }
    
    const review = await prisma.$transaction(async (tx) => {
      // Create review
      const newReview = await tx.vendorReview.create({
        data: {
          vendorId: validated.vendorId,
          authorId: currentUser.id,
          rating: validated.rating,
          title: validated.title,
          comment: validated.comment,
          qualityRating: validated.qualityRating,
          punctualityRating: validated.punctualityRating,
          professionalismRating: validated.professionalismRating,
          valueRating: validated.valueRating,
          isVerified: isVerified, // Use the local variable, not validated.isVerified
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              image: true,
            },
          },
          vendor: true,
        },
      });
      
      // ... rest of the transaction code remains the same
      
      // Recalculate vendor average rating
      const allReviews = await tx.vendorReview.findMany({
        where: { vendorId: validated.vendorId },
      });
      
      const avgRating = allReviews.reduce((sum: any, r: { rating: any; }) => sum + r.rating, 0) / allReviews.length;
      
      await tx.vendor.update({
        where: { id: validated.vendorId },
        data: {
          rating: avgRating,
          reviewCount: allReviews.length,
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "TICKET_UPDATED" as ActivityType,
          action: `Reviewed vendor: ${vendor.businessName}`,
          metadata: {
            reviewId: newReview.id,
            vendorId: validated.vendorId,
            rating: validated.rating,
          },
        },
      });
      
      // Notify vendor
      await tx.notification.create({
        data: {
          userId: vendor.userId,
          type: "SYSTEM",
          title: "New Review Received",
          message: `${currentUser.name} left you a ${validated.rating}-star review`,
          actionUrl: `/dashboard/vendor/reviews`,
          metadata: {
            reviewId: newReview.id,
            rating: validated.rating,
          },
        },
      });
      
      return newReview;
    });
    
    const serializedReview = serializeReview(review);
    
    revalidatePath("/dashboard/vendors");
    revalidatePath(`/dashboard/vendors/${validated.vendorId}`);
    revalidatePath("/dashboard/vendor/reviews");
    
    return {
      success: true,
      data: serializedReview,
      message: "Review submitted successfully",
    };
  } catch (error) {
    console.error("Create review error:", error);
    
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
// Get Reviews for Vendor
// -------------------------
export async function getVendorReviews(params: {
  vendorId: string;
  page?: number;
  limit?: number;
}): Promise<ReviewResult> {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    
    const where: Prisma.VendorReviewWhereInput = {
      vendorId: params.vendorId,
    };
    
    const [reviews, total] = await Promise.all([
      prisma.vendorReview.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.vendorReview.count({ where }),
    ]);
    
    const serializedReviews = reviews.map(serializeReview);
    
    return {
      success: true,
      data: {
        reviews: serializedReviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get reviews error:", error);
    return {
      success: false,
      error: "Failed to fetch reviews",
    };
  }
}

// -------------------------
// Update Review
// -------------------------
export async function updateVendorReview(
  reviewId: string,
  data: z.infer<typeof updateReviewSchema>
): Promise<ReviewResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const review = await prisma.vendorReview.findUnique({
      where: { id: reviewId },
      include: { vendor: true },
    });
    
    if (!review) {
      return {
        success: false,
        error: "Review not found",
      };
    }
    
    // Only author can update
    if (review.authorId !== currentUser.id && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "You can only edit your own reviews",
      };
    }
    
    const validated = updateReviewSchema.parse(data);
    
    const updatedReview = await prisma.$transaction(async (tx) => {
      const updated = await tx.vendorReview.update({
        where: { id: reviewId },
        data: {
          ...(validated.rating !== undefined && { rating: validated.rating }),
          ...(validated.title !== undefined && { title: validated.title }),
          ...(validated.comment !== undefined && { comment: validated.comment }),
          ...(validated.qualityRating !== undefined && { qualityRating: validated.qualityRating }),
          ...(validated.punctualityRating !== undefined && { punctualityRating: validated.punctualityRating }),
          ...(validated.professionalismRating !== undefined && { professionalismRating: validated.professionalismRating }),
          ...(validated.valueRating !== undefined && { valueRating: validated.valueRating }),
        },
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
      });
      
      // Recalculate vendor average rating
      const allReviews = await tx.vendorReview.findMany({
        where: { vendorId: review.vendorId },
      });
      
      const avgRating = allReviews.reduce((sum: any, r: { rating: any; }) => sum + r.rating, 0) / allReviews.length;
      
      await tx.vendor.update({
        where: { id: review.vendorId },
        data: {
          rating: avgRating,
        },
      });
      
      return updated;
    });
    
    const serializedReview = serializeReview(updatedReview);
    
    revalidatePath("/dashboard/vendors");
    revalidatePath(`/dashboard/vendors/${review.vendorId}`);
    
    return {
      success: true,
      data: serializedReview,
      message: "Review updated successfully",
    };
  } catch (error) {
    console.error("Update review error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update review. Please try again.",
    };
  }
}

// -------------------------
// Add Vendor Response
// -------------------------
export async function addVendorResponse(
  reviewId: string,
  data: z.infer<typeof vendorResponseSchema>
): Promise<ReviewResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const review = await prisma.vendorReview.findUnique({
      where: { id: reviewId },
      include: { 
        vendor: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!review) {
      return {
        success: false,
        error: "Review not found",
      };
    }
    
    // Only the vendor can respond
    if (review.vendor.userId !== currentUser.id && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "You can only respond to reviews for your business",
      };
    }
    
    const validated = vendorResponseSchema.parse(data);
    
    const updatedReview = await prisma.$transaction(async (tx) => {
      const updated = await tx.vendorReview.update({
        where: { id: reviewId },
        data: {
          vendorResponse: validated.vendorResponse,
          respondedAt: new Date(),
        },
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
      });
      
      // Notify review author
      await tx.notification.create({
        data: {
          userId: review.authorId,
          type: "SYSTEM",
          title: "Vendor Responded to Your Review",
          message: `${review.vendor.businessName} responded to your review`,
          actionUrl: `/dashboard/vendors/${review.vendorId}`,
          metadata: {
            reviewId: reviewId,
          },
        },
      });
      
      return updated;
    });
    
    const serializedReview = serializeReview(updatedReview);
    
    revalidatePath(`/dashboard/vendors/${review.vendorId}`);
    revalidatePath("/dashboard/vendor/reviews");
    
    return {
      success: true,
      data: serializedReview,
      message: "Response added successfully",
    };
  } catch (error) {
    console.error("Add vendor response error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to add response. Please try again.",
    };
  }
}

// -------------------------
// Delete Review
// -------------------------
export async function deleteVendorReview(reviewId: string): Promise<ReviewResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const review = await prisma.vendorReview.findUnique({
      where: { id: reviewId },
    });
    
    if (!review) {
      return {
        success: false,
        error: "Review not found",
      };
    }
    
    // Only author or admin can delete
    if (review.authorId !== currentUser.id && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "You can only delete your own reviews",
      };
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.vendorReview.delete({
        where: { id: reviewId },
      });
      
      // Recalculate vendor average rating
      const allReviews = await tx.vendorReview.findMany({
        where: { vendorId: review.vendorId },
      });
      
      const avgRating = allReviews.length > 0
        ? allReviews.reduce((sum: any, r: { rating: any; }) => sum + r.rating, 0) / allReviews.length
        : null;
      
      await tx.vendor.update({
        where: { id: review.vendorId },
        data: {
          rating: avgRating,
          reviewCount: allReviews.length,
        },
      });
    });
    
    revalidatePath("/dashboard/vendors");
    revalidatePath(`/dashboard/vendors/${review.vendorId}`);
    
    return {
      success: true,
      message: "Review deleted successfully",
    };
  } catch (error) {
    console.error("Delete review error:", error);
    return {
      success: false,
      error: "Failed to delete review. Please try again.",
    };
  }
}

// -------------------------
// Get Review Statistics
// -------------------------
export async function getReviewStatistics(vendorId: string): Promise<ReviewResult> {
  try {
    const reviews = await prisma.vendorReview.findMany({
      where: { vendorId },
    });
    
    if (reviews.length === 0) {
      return {
        success: true,
        data: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          verifiedCount: 0,
          withResponseCount: 0,
        },
      };
    }
    
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    const ratingDistribution = reviews.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const verifiedCount = reviews.filter(r => r.isVerified).length;
    const withResponseCount = reviews.filter(r => r.vendorResponse).length;
    
    // Calculate detailed averages
    const detailedRatings = {
      quality: reviews.filter(r => r.qualityRating).length > 0
        ? reviews.reduce((sum, r) => sum + (r.qualityRating || 0), 0) / reviews.filter(r => r.qualityRating).length
        : null,
      punctuality: reviews.filter(r => r.punctualityRating).length > 0
        ? reviews.reduce((sum, r) => sum + (r.punctualityRating || 0), 0) / reviews.filter(r => r.punctualityRating).length
        : null,
      professionalism: reviews.filter(r => r.professionalismRating).length > 0
        ? reviews.reduce((sum, r) => sum + (r.professionalismRating || 0), 0) / reviews.filter(r => r.professionalismRating).length
        : null,
      value: reviews.filter(r => r.valueRating).length > 0
        ? reviews.reduce((sum, r) => sum + (r.valueRating || 0), 0) / reviews.filter(r => r.valueRating).length
        : null,
    };
    
    return {
      success: true,
      data: {
        totalReviews,
        averageRating: Number(averageRating.toFixed(2)),
        ratingDistribution,
        verifiedCount,
        withResponseCount,
        detailedRatings,
      },
    };
  } catch (error) {
    console.error("Get review statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch review statistics",
    };
  }
}