/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// FILE: src/lib/actions/units.ts
// Unit Management Server Actions
// ============================================================================

"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { UnitStatus } from "@/lib/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/client";

// Validation Schema
const unitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  bedrooms: z.number().int().min(0, "Must be 0 or more"),
  bathrooms: z.number().min(0, "Must be 0 or more"),
  squareFeet: z.number().int().positive().optional(),
  floor: z.number().int().optional(),
  rentAmount: z.number().positive("Rent amount must be positive"),
  deposit: z.number().positive("Deposit must be positive"),
  description: z.string().optional(),
});

type UnitInput = z.infer<typeof unitSchema>;

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// -------------------------
// Add Unit to Property
// -------------------------
export async function addUnit(
  propertyId: string,
  input: UnitInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validated = unitSchema.parse(input);

    // Get landlord
    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        landlordId: landlord.id,
        deletedAt: null,
      },
      include: {
        units: {
          where: { deletedAt: null },
        },
      },
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    // Check for duplicate unit number
    const existingUnit = property.units.find(
      (u) => u.unitNumber === validated.unitNumber
    );

    if (existingUnit) {
      return {
        success: false,
        error: `Unit ${validated.unitNumber} already exists in this property`,
      };
    }

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        propertyId,
        unitNumber: validated.unitNumber,
        bedrooms: validated.bedrooms,
        bathrooms: new Decimal(validated.bathrooms),
        squareFeet: validated.squareFeet,
        floor: validated.floor,
        rentAmount: new Decimal(validated.rentAmount),
        deposit: new Decimal(validated.deposit),
        description: validated.description,
        status: UnitStatus.VACANT,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "PROPERTY_UPDATED",
        action: `Added unit ${unit.unitNumber} to property ${property.name}`,
        entityType: "Unit",
        entityId: unit.id,
      },
    });

    revalidatePath(`/dashboard/properties/${propertyId}`);

    return {
      success: true,
      data: { id: unit.id },
    };
  } catch (error) {
    console.error("Add unit error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to add unit. Please try again.",
    };
  }
}

// -------------------------
// Update Unit
// -------------------------
export async function updateUnit(
  unitId: string,
  input: Partial<UnitInput>
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
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: {
          landlordId: landlord.id,
        },
        deletedAt: null,
      },
      include: {
        property: true,
      },
    });

    if (!unit) {
      return { success: false, error: "Unit not found" };
    }

    // Prepare update data
    const updateData: any = {};

    if (input.unitNumber !== undefined) updateData.unitNumber = input.unitNumber;
    if (input.bedrooms !== undefined) updateData.bedrooms = input.bedrooms;
    if (input.bathrooms !== undefined) updateData.bathrooms = new Decimal(input.bathrooms);
    if (input.squareFeet !== undefined) updateData.squareFeet = input.squareFeet;
    if (input.floor !== undefined) updateData.floor = input.floor;
    if (input.rentAmount !== undefined) updateData.rentAmount = new Decimal(input.rentAmount);
    if (input.deposit !== undefined) updateData.deposit = new Decimal(input.deposit);
    if (input.description !== undefined) updateData.description = input.description;

    // Update unit
    await prisma.unit.update({
      where: { id: unitId },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "PROPERTY_UPDATED",
        action: `Updated unit ${unit.unitNumber} in property ${unit.property.name}`,
        entityType: "Unit",
        entityId: unit.id,
      },
    });

    revalidatePath(`/dashboard/properties/${unit.propertyId}`);

    return { success: true };
  } catch (error) {
    console.error("Update unit error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error: "Failed to update unit. Please try again.",
    };
  }
}

// -------------------------
// Delete Unit (Soft Delete)
// -------------------------
export async function deleteUnit(unitId: string): Promise<ActionResult> {
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
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: {
          landlordId: landlord.id,
        },
        deletedAt: null,
      },
      include: {
        property: true,
        leases: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!unit) {
      return { success: false, error: "Unit not found" };
    }

    // Check for active leases
    if (unit.leases.length > 0) {
      return {
        success: false,
        error: "Cannot delete unit with active leases. Please terminate the lease first.",
      };
    }

    // Soft delete
    await prisma.unit.update({
      where: { id: unitId },
      data: { deletedAt: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "PROPERTY_UPDATED",
        action: `Deleted unit ${unit.unitNumber} from property ${unit.property.name}`,
        entityType: "Unit",
        entityId: unit.id,
      },
    });

    revalidatePath(`/dashboard/properties/${unit.propertyId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete unit error:", error);
    return {
      success: false,
      error: "Failed to delete unit. Please try again.",
    };
  }
}

// -------------------------
// Update Unit Status
// -------------------------
export async function updateUnitStatus(
  unitId: string,
  status: UnitStatus
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
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: {
          landlordId: landlord.id,
        },
        deletedAt: null,
      },
      include: {
        property: true,
      },
    });

    if (!unit) {
      return { success: false, error: "Unit not found" };
    }

    // Update status
    await prisma.unit.update({
      where: { id: unitId },
      data: { status },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "PROPERTY_UPDATED",
        action: `Changed unit ${unit.unitNumber} status to ${status}`,
        entityType: "Unit",
        entityId: unit.id,
      },
    });

    revalidatePath(`/dashboard/properties/${unit.propertyId}`);

    return { success: true };
  } catch (error) {
    console.error("Update unit status error:", error);
    return {
      success: false,
      error: "Failed to update unit status.",
    };
  }
}

// -------------------------
// Get Unit Details
// -------------------------
export async function getUnitDetails(unitId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return null;
    }

    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        deletedAt: null,
      },
      include: {
        property: {
          include: {
            landlord: {
              include: {
                user: true,
              },
            },
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        leases: {
          where: { deletedAt: null },
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
          orderBy: { startDate: "desc" },
        },
        applications: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    // Authorization check
    if (session.user.role === "LANDLORD") {
      const landlord = await prisma.landlord.findUnique({
        where: { userId: session.user.id },
      });

      if (unit?.property.landlordId !== landlord?.id) {
        return null;
      }
    }

    return unit;
  } catch (error) {
    console.error("Get unit details error:", error);
    return null;
  }
}