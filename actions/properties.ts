/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/properties.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PropertyType } from "@/lib/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation Schema
const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  type: z.nativeEnum(PropertyType),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required").max(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  country: z.string().default("US"),
  description: z.string().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  squareFeet: z.number().int().positive().optional(),
  lotSize: z.number().positive().optional(),
  purchasePrice: z.number().positive().optional(),
  currentValue: z.number().positive().optional(),
  propertyTax: z.number().positive().optional(),
  insurance: z.number().positive().optional(),
  hoaFees: z.number().positive().optional(),
});

type PropertyInput = z.infer<typeof propertySchema>;

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// -------------------------
// Create Property
// -------------------------
export async function createProperty(
  input: PropertyInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validated = propertySchema.parse(input);

    // Get landlord
    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
      include: {
        properties: {
          where: { deletedAt: null, isActive: true },
        },
      },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    // Check property limit
    if (landlord.properties.length >= landlord.propertyLimit) {
      return {
        success: false,
        error: `You have reached your property limit (${landlord.propertyLimit}). Please upgrade your subscription.`,
      };
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        landlordId: landlord.id,
        ...validated,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "PROPERTY_CREATED",
        action: `Created property: ${property.name}`,
        entityType: "Property",
        entityId: property.id,
      },
    });

    revalidatePath("/dashboard/properties");

    return {
      success: true,
      data: { id: property.id },
    };
  } catch (error) {
    console.error("Create property error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to create property. Please try again.",
    };
  }
}

// -------------------------
// Update Property
// -------------------------
export async function updateProperty(
  id: string,
  input: Partial<PropertyInput>
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return { success: false, error: "Unauthorized" };
    }

    // Get landlord
    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    // Verify ownership
    const property = await prisma.property.findFirst({
      where: {
        id,
        landlordId: landlord.id,
        deletedAt: null,
      },
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    // Update property
    await prisma.property.update({
      where: { id },
      data: input,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "PROPERTY_UPDATED",
        action: `Updated property: ${property.name}`,
        entityType: "Property",
        entityId: property.id,
      },
    });

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Update property error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to update property. Please try again.",
    };
  }
}

// -------------------------
// Delete Property (Soft Delete)
// -------------------------
export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return { success: false, error: "Unauthorized" };
    }

    // Get landlord
    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    // Verify ownership
    const property = await prisma.property.findFirst({
      where: {
        id,
        landlordId: landlord.id,
        deletedAt: null,
      },
      include: {
        units: {
          include: {
            leases: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    // Check for active leases
    const hasActiveLeases = property.units.some(
      (unit) => unit.leases.length > 0
    );

    if (hasActiveLeases) {
      return {
        success: false,
        error: "Cannot delete property with active leases. Please terminate all leases first.",
      };
    }

    // Soft delete
    await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "PROPERTY_DELETED",
        action: `Deleted property: ${property.name}`,
        entityType: "Property",
        entityId: property.id,
      },
    });

    revalidatePath("/dashboard/properties");

    return { success: true };
  } catch (error) {
    console.error("Delete property error:", error);
    return {
      success: false,
      error: "Failed to delete property. Please try again.",
    };
  }
}

// -------------------------
// Toggle Property Active Status
// -------------------------
export async function togglePropertyStatus(
  id: string
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    const property = await prisma.property.findFirst({
      where: {
        id,
        landlordId: landlord.id,
        deletedAt: null,
      },
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    await prisma.property.update({
      where: { id },
      data: { isActive: !property.isActive },
    });

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Toggle property status error:", error);
    return {
      success: false,
      error: "Failed to update property status.",
    };
  }
}

// -------------------------
// Get Property Details
// -------------------------
export async function getPropertyDetails(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return null;
    }

    const property = await prisma.property.findFirst({
      where: {
        id,
        deletedAt: null,
      },
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
        images: {
          orderBy: { order: "asc" },
        },
        units: {
          where: { deletedAt: null },
          include: {
            amenities: {
              include: {
                amenity: true,
              },
            },
            leases: {
              where: { status: "ACTIVE" },
              include: {
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
            },
          },
          orderBy: { unitNumber: "asc" },
        },
        maintenanceTickets: {
          where: {
            status: { in: ["OPEN", "IN_PROGRESS"] },
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
        },
        documents: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
          take: 10,
        },
        policies: {
          orderBy: { order: "asc" },
        },
        utilities: true,
        parkingSpaces: true,
      },
    });

    // Authorization check
    if (session.user.role === "LANDLORD") {
      const landlord = await prisma.landlord.findUnique({
        where: { userId: session.user.id },
      });

      if (property?.landlordId !== landlord?.id) {
        return null;
      }
    }

    return property;
  } catch (error) {
    console.error("Get property details error:", error);
    return null;
  }
}

// -------------------------
// Get Property Statistics
// -------------------------
export async function getPropertyStatistics(id: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return null;
    }

    const property = await getPropertyDetails(id);
    if (!property) return null;

    const totalUnits = property.units.length;
    const occupiedUnits = property.units.filter(
      (u) => u.status === "OCCUPIED"
    ).length;
    const vacantUnits = totalUnits - occupiedUnits;

    const monthlyRevenue = property.units.reduce((acc, unit) => {
      const activeLease = unit.leases.find((l) => l.status === "ACTIVE");
      return acc + (activeLease ? Number(activeLease.rentAmount) : 0);
    }, 0);

    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        propertyId: id,
        date: { gte: startOfMonth },
        deletedAt: null,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
      monthlyRevenue,
      monthlyExpenses: Number(monthlyExpenses._sum.amount || 0),
      netIncome: monthlyRevenue - Number(monthlyExpenses._sum.amount || 0),
      openTickets: property.maintenanceTickets.length,
    };
  } catch (error) {
    console.error("Get property statistics error:", error);
    return null;
  }
}
// -------------------------

// -------------------------
// Get User Properties
// -------------------------
export async function getUserProperties() {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized", properties: [] };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found", properties: [] };
    }

    const properties = await prisma.property.findMany({
      where: {
        landlordId: landlord.id,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, properties };
  } catch (error) {
    console.error("Get user properties error:", error);
    return {
      success: false,
      error: "Failed to load properties",
      properties: [],
    };
  }
}



