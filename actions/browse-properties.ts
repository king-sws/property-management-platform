/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/browse-properties.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { UnitStatus } from "@/lib/generated/prisma/enums";

export type PropertyFilter = {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
};

// Get available properties for browsing (tenant view)
export async function getAvailableProperties(filters?: PropertyFilter) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized", properties: [] };
    }

    const whereClause: any = {
      deletedAt: null,
      isActive: true,
      units: {
        some: {
          deletedAt: null,
          isActive: true,
          status: UnitStatus.VACANT,
        },
      },
    };

    // Apply filters
    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { address: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.city) {
      whereClause.city = { contains: filters.city, mode: "insensitive" };
    }

    if (filters?.propertyType && filters.propertyType !== "all") {
      whereClause.type = filters.propertyType;
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
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
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        },
        units: {
          where: {
            deletedAt: null,
            isActive: true,
            status: UnitStatus.VACANT,
            ...(filters?.bedrooms && { bedrooms: filters.bedrooms }),
            ...(filters?.bathrooms && { bathrooms: { gte: filters.bathrooms } }),
            ...(filters?.minPrice && { rentAmount: { gte: filters.minPrice } }),
            ...(filters?.maxPrice && { rentAmount: { lte: filters.maxPrice } }),
          },
          include: {
            amenities: {
              include: {
                amenity: true,
              },
            },
          },
          orderBy: { rentAmount: "asc" },
        },
        policies: {
          orderBy: { order: "asc" },
        },
        parkingSpaces: {
          where: { isAssigned: false },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out properties with no available units after filtering
    const filteredProperties = properties
      .filter((p) => p.units.length > 0)
      .map((property) => ({
        id: property.id,
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        type: property.type,
        description: property.description,
        yearBuilt: property.yearBuilt,
        images: property.images.map((img) => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
          isPrimary: img.isPrimary,
        })),
        landlord: {
          name: property.landlord.user.name,
          email: property.landlord.user.email,
          phone: property.landlord.user.phone,
        },
        availableUnits: property.units.length,
        minRent: Math.min(...property.units.map((u) => Number(u.rentAmount))),
        maxRent: Math.max(...property.units.map((u) => Number(u.rentAmount))),
        units: property.units.map((unit) => ({
          id: unit.id,
          unitNumber: unit.unitNumber,
          bedrooms: unit.bedrooms,
          bathrooms: Number(unit.bathrooms),
          squareFeet: unit.squareFeet,
          rentAmount: Number(unit.rentAmount),
          deposit: Number(unit.deposit),
          description: unit.description,
          amenities: unit.amenities.map((a) => ({
            id: a.amenity.id,
            name: a.amenity.name,
            icon: a.amenity.icon,
          })),
        })),
        policies: property.policies.map((p) => ({
          name: p.name,
          description: p.description,
        })),
        parkingAvailable: property.parkingSpaces.length > 0,
      }));

    return {
      success: true,
      properties: filteredProperties,
    };
  } catch (error) {
    console.error("Get available properties error:", error);
    return {
      success: false,
      error: "Failed to load properties",
      properties: [],
    };
  }
}

// Get single property details for tenant viewing
export async function getPropertyForTenant(propertyId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        landlord: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        images: {
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        },
        units: {
          where: {
            deletedAt: null,
            isActive: true,
            status: UnitStatus.VACANT,
          },
          include: {
            amenities: {
              include: {
                amenity: true,
              },
            },
          },
          orderBy: { rentAmount: "asc" },
        },
        policies: {
          orderBy: { order: "asc" },
        },
        utilities: true,
        parkingSpaces: {
          where: { isAssigned: false },
        },
      },
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    return {
      success: true,
      property: {
        id: property.id,
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        type: property.type,
        description: property.description,
        yearBuilt: property.yearBuilt,
        squareFeet: property.squareFeet,
        images: property.images.map(img => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
          isPrimary: img.isPrimary,
          order: img.order,
        })),
        landlord: {
          id: property.landlord.user.id,
          name: property.landlord.user.name,
          email: property.landlord.user.email,
          phone: property.landlord.user.phone,
        },
        units: property.units.map((unit) => ({
          id: unit.id,
          unitNumber: unit.unitNumber,
          bedrooms: unit.bedrooms,
          bathrooms: Number(unit.bathrooms),
          squareFeet: unit.squareFeet,
          floor: unit.floor,
          rentAmount: Number(unit.rentAmount),
          deposit: Number(unit.deposit),
          description: unit.description,
          amenities: unit.amenities.map((a) => a.amenity),
        })),
        policies: property.policies,
        utilities: property.utilities.map((u) => ({
          type: u.type,
          provider: u.provider,
          isPaidByLandlord: u.isPaidByLandlord,
        })),
        parkingSpaces: property.parkingSpaces.map((p) => ({
          spaceNumber: p.spaceNumber,
          type: p.type,
          monthlyFee: p.monthlyFee ? Number(p.monthlyFee) : null,
        })),
      },
    };
  } catch (error) {
    console.error("Get property for tenant error:", error);
    return {
      success: false,
      error: "Failed to load property details",
    };
  }
}

// Get filter options (cities, price ranges, etc.)
export async function getFilterOptions() {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get unique cities
    const cities = await prisma.property.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        city: true,
      },
      distinct: ["city"],
    });

    // Get price range from available units
    const priceStats = await prisma.unit.aggregate({
      where: {
        deletedAt: null,
        isActive: true,
        status: UnitStatus.VACANT,
      },
      _min: {
        rentAmount: true,
      },
      _max: {
        rentAmount: true,
      },
    });

    return {
      success: true,
      options: {
        cities: cities.map((c) => c.city).sort(),
        priceRange: {
          min: Number(priceStats._min.rentAmount || 0),
          max: Number(priceStats._max.rentAmount || 5000),
        },
      },
    };
  } catch (error) {
    console.error("Get filter options error:", error);
    return {
      success: false,
      error: "Failed to load filter options",
    };
  }
}