/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/admin/analytics.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Helper to get date range
function getDateRange(range: string) {
  const now = new Date();
  const startDate = new Date();

  switch (range) {
    case "7days":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return { startDate, endDate: now };
}

// -------------------------
// Overview Analytics
// -------------------------
export async function getAnalyticsOverview(range: string = "30days") {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const { startDate } = getDateRange(range);

    // Total Users
    const totalUsers = await prisma.user.count({
      where: { deletedAt: null },
    });

    const newUsers = await prisma.user.count({
      where: {
        deletedAt: null,
        createdAt: { gte: startDate },
      },
    });

    // Total Properties
    const totalProperties = await prisma.property.count({
      where: { deletedAt: null },
    });

    const newProperties = await prisma.property.count({
      where: {
        deletedAt: null,
        createdAt: { gte: startDate },
      },
    });

    // Total Revenue
    const revenueData = await prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        paidAt: { gte: startDate },
      },
      _sum: { netAmount: true },
    });

    const totalRevenue = Number(revenueData._sum.netAmount || 0);

    // Previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const previousRevenue = await prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        paidAt: { gte: previousStartDate, lt: startDate },
      },
      _sum: { netAmount: true },
    });

    const prevRevenue = Number(previousRevenue._sum.netAmount || 0);
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Active Leases
    const activeLeases = await prisma.lease.count({
      where: { status: "ACTIVE" },
    });

    const newLeases = await prisma.lease.count({
      where: {
        status: "ACTIVE",
        createdAt: { gte: startDate },
      },
    });

    // Open Tickets
    const openTickets = await prisma.maintenanceTicket.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        deletedAt: null,
      },
    });

    const ticketsCreated = await prisma.maintenanceTicket.count({
      where: {
        deletedAt: null,
        createdAt: { gte: startDate },
      },
    });

    return {
      totalUsers,
      newUsers,
      totalProperties,
      newProperties,
      totalRevenue,
      revenueChange,
      activeLeases,
      newLeases,
      openTickets,
      ticketsCreated,
    };
  } catch (error) {
    console.error("Get analytics overview error:", error);
    return null;
  }
}

// -------------------------
// User Growth Data
// -------------------------
export async function getUserGrowthData(range: string = "30days") {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const { startDate, endDate } = getDateRange(range);

    // Get users grouped by date and role
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const groupedData: Record<string, any> = {};

    users.forEach((user) => {
      const dateKey = user.createdAt.toISOString().split("T")[0];
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          LANDLORD: 0,
          TENANT: 0,
          VENDOR: 0,
          ADMIN: 0,
          total: 0,
        };
      }
      groupedData[dateKey][user.role]++;
      groupedData[dateKey].total++;
    });

    const chartData = Object.values(groupedData);

    // Get total by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      where: { deletedAt: null },
      _count: true,
    });

    return {
      chartData,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
    };
  } catch (error) {
    console.error("Get user growth data error:", error);
    return null;
  }
}

// -------------------------
// Revenue Data
// -------------------------
export async function getRevenueData(range: string = "30days") {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const { startDate, endDate } = getDateRange(range);

    const payments = await prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        paidAt: { gte: startDate, lte: endDate },
      },
      select: {
        paidAt: true,
        netAmount: true,
        type: true,
      },
      orderBy: { paidAt: "asc" },
    });

    // Group by date
    const groupedData: Record<string, any> = {};

    payments.forEach((payment) => {
      const dateKey = payment.paidAt!.toISOString().split("T")[0];
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          rent: 0,
          fees: 0,
          other: 0,
          total: 0,
        };
      }

      const amount = Number(payment.netAmount);
      if (payment.type === "RENT") {
        groupedData[dateKey].rent += amount;
      } else if (["LATE_FEE", "PET_FEE", "PARKING"].includes(payment.type)) {
        groupedData[dateKey].fees += amount;
      } else {
        groupedData[dateKey].other += amount;
      }
      groupedData[dateKey].total += amount;
    });

    const chartData = Object.values(groupedData);

    // Get revenue by type
    const revenueByType = await prisma.payment.groupBy({
      by: ["type"],
      where: {
        status: "COMPLETED",
        paidAt: { gte: startDate, lte: endDate },
      },
      _sum: { netAmount: true },
    });

    return {
      chartData,
      revenueByType: revenueByType.map((item) => ({
        type: item.type,
        amount: Number(item._sum.netAmount || 0),
      })),
    };
  } catch (error) {
    console.error("Get revenue data error:", error);
    return null;
  }
}

// -------------------------
// Property Data
// -------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getPropertyData(range: string = "30days") {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    // Properties by type
    const propertiesByType = await prisma.property.groupBy({
      by: ["type"],
      where: { deletedAt: null },
      _count: true,
    });

    // Occupancy data
    const units = await prisma.unit.findMany({
      where: { deletedAt: null },
      select: { status: true },
    });

    const occupancyData = {
      OCCUPIED: units.filter((u) => u.status === "OCCUPIED").length,
      VACANT: units.filter((u) => u.status === "VACANT").length,
      MAINTENANCE: units.filter((u) => u.status === "MAINTENANCE").length,
      UNAVAILABLE: units.filter((u) => u.status === "UNAVAILABLE").length,
    };

    const totalUnits = units.length;
    const occupancyRate = totalUnits > 0 ? (occupancyData.OCCUPIED / totalUnits) * 100 : 0;

    // Properties by state
    const propertiesByState = await prisma.property.groupBy({
      by: ["state"],
      where: { deletedAt: null },
      _count: true,
      orderBy: { _count: { state: "desc" } },
      take: 10,
    });

    return {
      propertiesByType: propertiesByType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
      occupancyData,
      occupancyRate,
      totalUnits,
      propertiesByState: propertiesByState.map((item) => ({
        state: item.state,
        count: item._count,
      })),
    };
  } catch (error) {
    console.error("Get property data error:", error);
    return null;
  }
}

// -------------------------
// Maintenance Data
// -------------------------
export async function getMaintenanceData(range: string = "30days") {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const { startDate } = getDateRange(range);

    // Tickets by status
    const ticketsByStatus = await prisma.maintenanceTicket.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    });

    // Tickets by priority
    const ticketsByPriority = await prisma.maintenanceTicket.groupBy({
      by: ["priority"],
      where: { deletedAt: null },
      _count: true,
    });

    // Average resolution time
    const completedTickets = await prisma.maintenanceTicket.findMany({
      where: {
        status: "COMPLETED",
        completedDate: { gte: startDate },
        deletedAt: null,
      },
      select: {
        createdAt: true,
        completedDate: true,
      },
    });

    const avgResolutionTime =
      completedTickets.length > 0
        ? completedTickets.reduce((acc, ticket) => {
            const diff = ticket.completedDate!.getTime() - ticket.createdAt.getTime();
            return acc + diff / (1000 * 60 * 60 * 24); // Convert to days
          }, 0) / completedTickets.length
        : 0;

    // Tickets by category
    const ticketsByCategory = await prisma.maintenanceTicket.groupBy({
      by: ["category"],
      where: { deletedAt: null },
      _count: true,
      orderBy: { _count: { category: "desc" } },
      take: 5,
    });

    return {
      ticketsByStatus: ticketsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      ticketsByPriority: ticketsByPriority.map((item) => ({
        priority: item.priority,
        count: item._count,
      })),
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      completedCount: completedTickets.length,
      ticketsByCategory: ticketsByCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
    };
  } catch (error) {
    console.error("Get maintenance data error:", error);
    return null;
  }
}

// -------------------------
// Top Performers
// -------------------------
export async function getTopPerformers(range: string = "30days") {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const { startDate } = getDateRange(range);

    // Top landlords by revenue
    const topLandlords = await prisma.landlord.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
            image: true,
          },
        },
        properties: {
          where: { deletedAt: null },
          include: {
            units: {
              include: {
                leases: {
                  where: { status: "ACTIVE" },
                  include: {
                    payments: {
                      where: {
                        status: "COMPLETED",
                        paidAt: { gte: startDate },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { properties: true },
        },
      },
      take: 10,
    });

    const landlordsWithRevenue = topLandlords
      .map((landlord) => {
        const revenue = landlord.properties.reduce((acc, property) => {
          return (
            acc +
            property.units.reduce((unitAcc, unit) => {
              return (
                unitAcc +
                unit.leases.reduce((leaseAcc, lease) => {
                  return (
                    leaseAcc +
                    lease.payments.reduce((paymentAcc, payment) => {
                      return paymentAcc + Number(payment.netAmount);
                    }, 0)
                  );
                }, 0)
              );
            }, 0)
          );
        }, 0);

        return {
          id: landlord.id,
          name: landlord.user.name || "Unknown",
          email: landlord.user.email,
          avatar: landlord.user.avatar || landlord.user.image,
          properties: landlord._count.properties,
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top vendors - get all vendors with their ticket counts and sort properly
    const allVendors = await prisma.vendor.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
            image: true,
          },
        },
        tickets: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
            completedDate: true,
          },
        },
      },
    });

    const vendorsData = allVendors
      .map((vendor) => {
        // Count all completed tickets
        const totalCompleted = vendor.tickets.filter(t => t.status === "COMPLETED").length;
        
        // Count completed tickets in date range
        const completedInRange = vendor.tickets.filter(
          t => t.status === "COMPLETED" && t.completedDate && t.completedDate >= startDate
        ).length;

        return {
          id: vendor.id,
          name: vendor.user.name || vendor.businessName,
          email: vendor.user.email,
          avatar: vendor.user.avatar || vendor.user.image,
          rating: vendor.rating ? Number(vendor.rating) : 0,
          completedTickets: totalCompleted,
          completedInRange: completedInRange,
          category: vendor.category,
          reviewCount: vendor.reviewCount,
        };
      })
      // Sort by: 1) Completed tickets in range, 2) Rating, 3) Total completed tickets
      .sort((a, b) => {
        if (b.completedInRange !== a.completedInRange) {
          return b.completedInRange - a.completedInRange;
        }
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.completedTickets - a.completedTickets;
      })
      .slice(0, 5);

    return {
      topLandlords: landlordsWithRevenue,
      topVendors: vendorsData,
    };
  } catch (error) {
    console.error("Get top performers error:", error);
    return null;
  }
}