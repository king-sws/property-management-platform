/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchResult = {
  id: string;
  type: "property" | "tenant" | "unit" | "lease" | "maintenance" | "payment";
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();
    const type = searchParams.get("type"); // Optional filter by type

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        query: query || "",
      });
    }

    const results: SearchResult[] = [];

    // Get user's landlord profile if applicable
    let landlordId: string | null = null;
    if (session.user.role === "LANDLORD") {
      const landlord = await prisma.landlord.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      landlordId = landlord?.id || null;
    }

    // Search query conditions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchTerm = `%${query}%`;

    // =====================
    // PROPERTIES SEARCH
    // =====================
    if ((!type || type === "property") && landlordId) {
      const properties = await prisma.property.findMany({
        where: {
          landlordId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { state: { contains: query, mode: "insensitive" } },
            { zipCode: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          type: true,
          units: {
            select: { id: true },
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
          description: `${p.type.replace(/_/g, " ")} • ${p.units.length} units`,
          url: `/dashboard/properties/${p.id}`,
          metadata: {
            type: p.type,
            unitCount: p.units.length,
          },
        }))
      );
    }

    // =====================
    // UNITS SEARCH
    // =====================
    if ((!type || type === "unit") && landlordId) {
      const units = await prisma.unit.findMany({
        where: {
          property: {
            landlordId,
            deletedAt: null,
          },
          deletedAt: null,
          OR: [
            { unitNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          unitNumber: true,
          bedrooms: true,
          bathrooms: true,
          rentAmount: true,
          status: true,
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
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
          metadata: {
            propertyName: u.property.name,
            status: u.status,
            rent: u.rentAmount,
          },
        }))
      );
    }

    // =====================
    // TENANTS SEARCH
    // =====================
    if ((!type || type === "tenant") && landlordId) {
      // Get tenant IDs from landlord's leases
      const leases = await prisma.lease.findMany({
        where: {
          unit: {
            property: {
              landlordId,
            },
          },
          deletedAt: null,
        },
        select: {
          tenants: {
            select: {
              tenantId: true,
            },
          },
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
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } },
              ],
            },
          },
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            leaseMembers: {
              where: {
                lease: {
                  status: "ACTIVE",
                },
              },
              select: {
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
              take: 1,
            },
          },
          take: 10,
        });

        results.push(
          ...tenants.map((t) => {
            const activeLease = t.leaseMembers[0];
            return {
              id: t.id,
              type: "tenant" as const,
              title: t.user.name || "Unnamed Tenant",
              subtitle: t.user.email || "",
              description: activeLease
                ? `${activeLease.lease.unit.property.name} - Unit ${activeLease.lease.unit.unitNumber}`
                : "No active lease",
              url: `/dashboard/tenants/${t.id}`,
              metadata: {
                email: t.user.email,
                phone: t.user.phone,
              },
            };
          })
        );
      }
    }

    // =====================
    // LEASES SEARCH
    // =====================
    if ((!type || type === "lease") && landlordId) {
      const leases = await prisma.lease.findMany({
        where: {
          unit: {
            property: {
              landlordId,
            },
          },
          deletedAt: null,
          OR: [
            {
              unit: {
                unitNumber: { contains: query, mode: "insensitive" },
              },
            },
            {
              unit: {
                property: {
                  name: { contains: query, mode: "insensitive" },
                },
              },
            },
            {
              tenants: {
                some: {
                  tenant: {
                    user: {
                      name: { contains: query, mode: "insensitive" },
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          rentAmount: true,
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
          tenants: {
            take: 1,
            select: {
              tenant: {
                select: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
        take: 10,
      });

      results.push(
        ...leases.map((l) => ({
          id: l.id,
          type: "lease" as const,
          title: `${l.unit.property.name} - Unit ${l.unit.unitNumber}`,
          subtitle: l.tenants[0]?.tenant.user.name || "No tenant",
          description: `$${l.rentAmount}/mo • ${l.status} • ${new Date(l.startDate).toLocaleDateString()}`,
          url: `/dashboard/leases/${l.id}`,
          metadata: {
            status: l.status,
            rent: l.rentAmount,
          },
        }))
      );
    }

    // =====================
    // MAINTENANCE SEARCH
    // =====================
    if ((!type || type === "maintenance") && landlordId) {
      const tickets = await prisma.maintenanceTicket.findMany({
        where: {
          property: {
            landlordId,
          },
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: true,
          priority: true,
          status: true,
          location: true,
          property: {
            select: {
              name: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      results.push(
        ...tickets.map((t) => ({
          id: t.id,
          type: "maintenance" as const,
          title: t.title,
          subtitle: t.property.name,
          description: `${t.category} • ${t.priority} • ${t.status}${t.location ? ` • ${t.location}` : ""}`,
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
    // PAYMENTS SEARCH (by amount or description)
    // =====================
    if ((!type || type === "payment") && landlordId) {
      // Try to parse query as amount
      const amountQuery = parseFloat(query.replace(/[$,]/g, ""));
      
      const payments = await prisma.payment.findMany({
        where: {
          lease: {
            unit: {
              property: {
                landlordId,
              },
            },
          },
          OR: [
            ...(query.match(/^\d+(\.\d{1,2})?$/) && !isNaN(amountQuery)
              ? [
                  {
                    amount: {
                      gte: amountQuery - 0.01,
                      lte: amountQuery + 0.01,
                    },
                  },
                ]
              : []),
            { description: { contains: query, mode: "insensitive" } },
            {
              tenant: {
                user: {
                  name: { contains: query, mode: "insensitive" },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          paidAt: true,
          dueDate: true,
          tenant: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
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
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      results.push(
        ...payments.map((p) => ({
          id: p.id,
          type: "payment" as const,
          title: `$${p.amount} - ${p.type.replace(/_/g, " ")}`,
          subtitle: p.tenant.user.name || "Unknown tenant",
          description: `${p.status} • ${p.lease?.unit.property.name || "N/A"} - Unit ${p.lease?.unit.unitNumber || "N/A"}`,
          url: `/dashboard/payments/${p.id}`,
          metadata: {
            amount: p.amount,
            status: p.status,
            type: p.type,
          },
        }))
      );
    }

    // Sort results by relevance (exact matches first, then partial)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({
      results: sortedResults.slice(0, 50), // Limit to 50 total results
      query,
      count: sortedResults.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}