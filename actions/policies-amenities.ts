// lib/actions/policies-amenities.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─────────────────────────────────────────────
// POLICIES (property level)
// ─────────────────────────────────────────────

export async function upsertPropertyPolicies(
  propertyId: string,
  policies: { id?: string; name: string; description: string; order: number }[]
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });
    if (!landlord) return { success: false, error: "Landlord not found" };

    // Verify ownership
    const property = await prisma.property.findFirst({
      where: { id: propertyId, landlordId: landlord.id, deletedAt: null },
    });
    if (!property) return { success: false, error: "Property not found" };

    // Delete all existing policies and recreate
    // (simpler than diffing — policies are cheap to recreate)
    await prisma.$transaction([
      prisma.propertyPolicy.deleteMany({ where: { propertyId } }),
      prisma.propertyPolicy.createMany({
        data: policies.map((p) => ({
          propertyId,
          name: p.name,
          description: p.description,
          order: p.order,
        })),
      }),
    ]);

    revalidatePath(`/dashboard/properties/${propertyId}`);
    revalidatePath(`/dashboard/properties/${propertyId}/edit`);

    return { success: true };
  } catch (error) {
    console.error("Upsert policies error:", error);
    return { success: false, error: "Failed to save policies" };
  }
}

// ─────────────────────────────────────────────
// AMENITIES (unit level)
// ─────────────────────────────────────────────

// Get all global amenities (for the picker)
export async function getAllAmenities(): Promise<ActionResult<{ id: string; name: string; category: string | null; icon: string | null }[]>> {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return { success: true, data: amenities };
  } catch (error) {
    console.error("Get amenities error:", error);
    return { success: false, error: "Failed to fetch amenities" };
  }
}

// Create a new global amenity (landlord can add custom ones)
export async function createAmenity(
  name: string,
  category?: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Check for duplicate
    const existing = await prisma.amenity.findUnique({ where: { name } });
    if (existing) return { success: true, data: existing }; // return existing if already exists

    const amenity = await prisma.amenity.create({
      data: { name, category: category || "Other" },
    });

    return { success: true, data: amenity };
  } catch (error) {
    console.error("Create amenity error:", error);
    return { success: false, error: "Failed to create amenity" };
  }
}

// Set amenities for a unit (replaces all existing)
export async function setUnitAmenities(
  unitId: string,
  amenityIds: string[]
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });
    if (!landlord) return { success: false, error: "Landlord not found" };

    // Verify unit ownership
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: { landlordId: landlord.id },
        deletedAt: null,
      },
      include: { property: true },
    });
    if (!unit) return { success: false, error: "Unit not found" };

    // Replace all amenities
    await prisma.$transaction([
      prisma.unitAmenity.deleteMany({ where: { unitId } }),
      prisma.unitAmenity.createMany({
        data: amenityIds.map((amenityId) => ({ unitId, amenityId })),
        skipDuplicates: true,
      }),
    ]);

    revalidatePath(`/dashboard/properties/${unit.propertyId}`);
    revalidatePath(`/dashboard/properties/${unit.propertyId}/units/${unitId}`);

    return { success: true };
  } catch (error) {
    console.error("Set unit amenities error:", error);
    return { success: false, error: "Failed to save amenities" };
  }
}