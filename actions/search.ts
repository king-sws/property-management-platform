/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/search.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export type SearchResult = {
  id: string;
  type: "property" | "tenant" | "unit" | "lease" | "maintenance" | "payment";
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
};

export type SearchResponse = {
  results: SearchResult[];
  query: string;
  count: number;
};

/**
 * Server-side search function
 * Searches across properties, tenants, units, leases, maintenance, and payments
 */
export async function searchDashboard(
  query: string,
  options?: {
    type?: "property" | "tenant" | "unit" | "lease" | "maintenance" | "payment";
    limit?: number;
  }
): Promise<SearchResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { results: [], query, count: 0 };
    }

    if (!query || query.trim().length < 2) {
      return { results: [], query, count: 0 };
    }

    const trimmedQuery = query.trim();
    const results: SearchResult[] = [];

    // Get landlord ID if user is a landlord
    let landlordId: string | null = null;
    if (session.user.role === "LANDLORD") {
      const landlord = await prisma.landlord.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      landlordId = landlord?.id || null;
    }

    if (!landlordId) {
      return { results: [], query, count: 0 };
    }

    const limit = options?.limit || 50;
    const searchType = options?.type;

    // Build search conditions
    const searchConditions = {
      contains: trimmedQuery,
      mode: "insensitive" as const,
    };

    // =====================
    // PROPERTIES
    // =====================
    if (!searchType || searchType === "property") {
      const properties = await prisma.property.findMany({
        where: {
          landlordId,
          deletedAt: null,
          OR: [
            { name: searchConditions },
            { address: searchConditions },
            { city: searchConditions },
            { state: searchConditions },
            { zipCode: { contains: trimmedQuery } },
          ],
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          type: true,
          _count: {
            select: { units: true },
          },
        },
        take: 10,
      });

      results.push(
        ...properties.map((p) => ({
          id: p.id,
          type: "property" as const,
          title: p.name,
          subtitle: `${p.address}, ${p.city}, ${p.state}`,
          description: `${p.type.replace(/_/g, " ")} • ${p._count.units} units`,
          url: `/dashboard/properties/${p.id}`,
          metadata: { type: p.type, unitCount: p._count.units },
        }))
      );
    }

    // =====================
    // UNITS
    // =====================
    if (!searchType || searchType === "unit") {
      const units = await prisma.unit.findMany({
        where: {
          property: { landlordId, deletedAt: null },
          deletedAt: null,
          unitNumber: searchConditions,
        },
        select: {
          id: true,
          unitNumber: true,
          bedrooms: true,
          bathrooms: true,
          rentAmount: true,
          status: true,
          property: {
            select: { id: true, name: true },
          },
        },
        take: 10,
      });

      results.push(
        ...units.map((u) => ({
          id: u.id,
          type: "unit" as const,
          title: `Unit ${u.unitNumber}`,
          subtitle: u.property.name,
          description: `${u.bedrooms} bed, ${u.bathrooms} bath • $${u.rentAmount}/mo • ${u.status}`,
          url: `/dashboard/properties/${u.property.id}?unit=${u.id}`,
          metadata: { status: u.status, rent: Number(u.rentAmount) },
        }))
      );
    }

    // =====================
    // TENANTS
    // =====================
    if (!searchType || searchType === "tenant") {
      const leases = await prisma.lease.findMany({
        where: {
          unit: { property: { landlordId } },
          deletedAt: null,
        },
        select: {
          tenants: { select: { tenantId: true } },
        },
      });

      const tenantIds = [
        ...new Set(leases.flatMap((l) => l.tenants.map((t) => t.tenantId))),
      ];

      if (tenantIds.length > 0) {
        const tenants = await prisma.tenant.findMany({
          where: {
            id: { in: tenantIds },
            deletedAt: null,
            user: {
              OR: [
                { name: searchConditions },
                { email: searchConditions },
                { phone: { contains: trimmedQuery } },
              ],
            },
          },
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
            leaseMembers: {
              where: { lease: { status: "ACTIVE" } },
              select: {
                lease: {
                  select: {
                    unit: {
                      select: {
                        unitNumber: true,
                        property: { select: { name: true } },
                      },
                    },
                  },
                },
              },
              take: 1,
            },
          },
          take: 10,
        });

        results.push(
          ...tenants.map((t) => {
            const lease = t.leaseMembers[0];
            return {
              id: t.id,
              type: "tenant" as const,
              title: t.user.name || "Unnamed Tenant",
              subtitle: t.user.email || "",
              description: lease
                ? `${lease.lease.unit.property.name} - Unit ${lease.lease.unit.unitNumber}`
                : "No active lease",
              url: `/dashboard/tenants/${t.id}`,
              metadata: { email: t.user.email },
            };
          })
        );
      }
    }

    // =====================
    // LEASES
    // =====================
    if (!searchType || searchType === "lease") {
      const leases = await prisma.lease.findMany({
        where: {
          unit: { property: { landlordId } },
          deletedAt: null,
          OR: [
            { unit: { unitNumber: searchConditions } },
            { unit: { property: { name: searchConditions } } },
            {
              tenants: {
                some: {
                  tenant: { user: { name: searchConditions } },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          status: true,
          startDate: true,
          rentAmount: true,
          unit: {
            select: {
              unitNumber: true,
              property: { select: { name: true } },
            },
          },
          tenants: {
            take: 1,
            select: { tenant: { select: { user: { select: { name: true } } } } },
          },
        },
        orderBy: { startDate: "desc" },
        take: 10,
      });

      results.push(
        ...leases.map((l) => ({
          id: l.id,
          type: "lease" as const,
          title: `${l.unit.property.name} - Unit ${l.unit.unitNumber}`,
          subtitle: l.tenants[0]?.tenant.user.name || "No tenant",
          description: `$${l.rentAmount}/mo • ${l.status}`,
          url: `/dashboard/leases/${l.id}`,
          metadata: { status: l.status, rent: Number(l.rentAmount) },
        }))
      );
    }

    // =====================
    // MAINTENANCE
    // =====================
    if (!searchType || searchType === "maintenance") {
      const tickets = await prisma.maintenanceTicket.findMany({
        where: {
          property: { landlordId },
          deletedAt: null,
          OR: [
            { title: searchConditions },
            { description: searchConditions },
            { category: searchConditions },
            { location: searchConditions },
          ],
        },
        select: {
          id: true,
          title: true,
          category: true,
          priority: true,
          status: true,
          location: true,
          property: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      results.push(
        ...tickets.map((t) => ({
          id: t.id,
          type: "maintenance" as const,
          title: t.title,
          subtitle: t.property.name,
          description: `${t.category} • ${t.priority} • ${t.status}${
            t.location ? ` • ${t.location}` : ""
          }`,
          url: `/dashboard/maintenance/${t.id}`,
          metadata: {
            category: t.category,
            priority: t.priority,
            status: t.status,
          },
        }))
      );
    }

    // =====================
    // PAYMENTS
    // =====================
    if (!searchType || searchType === "payment") {
      const amountQuery = parseFloat(trimmedQuery.replace(/[$,]/g, ""));

      const payments = await prisma.payment.findMany({
        where: {
          lease: { unit: { property: { landlordId } } },
          OR: [
            ...(trimmedQuery.match(/^\d+(\.\d{1,2})?$/) && !isNaN(amountQuery)
              ? [{ amount: { gte: amountQuery - 0.01, lte: amountQuery + 0.01 } }]
              : []),
            { description: searchConditions },
            { tenant: { user: { name: searchConditions } } },
          ],
        },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          tenant: { select: { user: { select: { name: true } } } },
          lease: {
            select: {
              unit: {
                select: {
                  unitNumber: true,
                  property: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      results.push(
        ...payments.map((p) => ({
          id: p.id,
          type: "payment" as const,
          title: `$${p.amount} - ${p.type.replace(/_/g, " ")}`,
          subtitle: p.tenant.user.name || "Unknown tenant",
          description: `${p.status} • ${p.lease?.unit.property.name || "N/A"}`,
          url: `/dashboard/payments/${p.id}`,
          metadata: {
            amount: Number(p.amount),
            status: p.status,
            type: p.type,
          },
        }))
      );
    }

    // Sort by relevance
    const sortedResults = results
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === trimmedQuery.toLowerCase();
        const bExact = b.title.toLowerCase() === trimmedQuery.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      })
      .slice(0, limit);

    return {
      results: sortedResults,
      query: trimmedQuery,
      count: sortedResults.length,
    };
  } catch (error) {
    console.error("Search error:", error);
    return { results: [], query, count: 0 };
  }
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(
  query: string
): Promise<string[]> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "LANDLORD") {
      return [];
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!landlord) return [];

    const suggestions: string[] = [];

    // Get property names
    const properties = await prisma.property.findMany({
      where: {
        landlordId: landlord.id,
        deletedAt: null,
        name: { contains: query, mode: "insensitive" },
      },
      select: { name: true },
      take: 5,
    });

    suggestions.push(...properties.map((p) => p.name));

    // Get tenant names
    const leases = await prisma.lease.findMany({
      where: {
        unit: { property: { landlordId: landlord.id } },
        deletedAt: null,
      },
      select: {
        tenants: {
          select: { tenant: { select: { user: { select: { name: true } } } } },
        },
      },
      take: 5,
    });

    const tenantNames = leases
      .flatMap((l) => l.tenants.map((t) => t.tenant.user.name))
      .filter((name): name is string => name !== null)
      .filter((name) => name.toLowerCase().includes(query.toLowerCase()));

    suggestions.push(...tenantNames);

    return [...new Set(suggestions)].slice(0, 10);
  } catch (error) {
    console.error("Get suggestions error:", error);
    return [];
  }
}