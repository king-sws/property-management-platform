/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/enums";

type ReportResult = {
  success: boolean;
  data?: any;
  error?: string;
};

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

export async function generateFinancialReport(
  startDate: Date,
  endDate: Date,
  propertyId?: string
): Promise<ReportResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    // Build property filter
    const propertyFilter = propertyId ? { propertyId } : {};

    // Get income data
    const payments = await prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        paidAt: { gte: startDate, lte: endDate },
        lease: {
          unit: {
            property: {
              landlordId: landlord.id,
              ...propertyFilter,
            },
          },
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    // Get expense data
    const expenses = await prisma.expense.findMany({
      where: {
        landlordId: landlord.id,
        date: { gte: startDate, lte: endDate },
        ...propertyFilter,
      },
      include: {
        property: true,
      },
    });

    // Calculate totals by type
    const incomeByType = payments.reduce((acc, payment) => {
      const type = payment.type;
      acc[type] = (acc[type] || 0) + Number(payment.netAmount);
      return acc;
    }, {} as Record<string, number>);

    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const totalIncome = payments.reduce((sum, p) => sum + Number(p.netAmount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netIncome = totalIncome - totalExpenses;

// Calculate by property if no specific property selected
let byProperty: Array<{
  propertyId: string;
  propertyName: string;
  income: number;
  expenses: number;
  netIncome: number;
}> = [];

if (!propertyId) {
  const properties = await prisma.property.findMany({
    where: { landlordId: landlord.id, isActive: true },
  });

  byProperty = await Promise.all(
    properties.map(async (property) => {
      const propPayments = payments.filter(
        (p) => p.lease?.unit?.propertyId === property.id
      );
      const propExpenses = expenses.filter((e) => e.propertyId === property.id);

      const income = propPayments.reduce((sum, p) => sum + Number(p.netAmount), 0);
      const expense = propExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        propertyId: property.id,
        propertyName: property.name,
        income,
        expenses: expense,
        netIncome: income - expense,
      };
    })
  );
}

    return {
      success: true,
      data: {
        period: { startDate, endDate },
        summary: {
          totalIncome,
          totalExpenses,
          netIncome,
          profitMargin: totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0,
        },
        incomeByType,
        expensesByCategory,
        byProperty,
        payments,
        expenses,
      },
    };
  } catch (error) {
    console.error("Generate financial report error:", error);
    return { success: false, error: "Failed to generate financial report" };
  }
}

// ============================================================================
// OCCUPANCY REPORT
// ============================================================================

export async function generateOccupancyReport(
  date: Date = new Date()
): Promise<ReportResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    const properties = await prisma.property.findMany({
      where: { landlordId: landlord.id, isActive: true },
      include: {
        units: {
          include: {
            leases: {
              where: {
                startDate: { lte: date },
                OR: [
                  { endDate: { gte: date } },
                  { endDate: null },
                ],
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });

    const reportData = properties.map((property) => {
      const totalUnits = property.units.length;
      const occupiedUnits = property.units.filter((unit) => unit.leases.length > 0).length;
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      const potentialRent = property.units.reduce(
        (sum, unit) => sum + Number(unit.rentAmount),
        0
      );
      const actualRent = property.units
        .filter((unit) => unit.leases.length > 0)
        .reduce((sum, unit) => sum + Number(unit.rentAmount), 0);

      return {
        propertyId: property.id,
        propertyName: property.name,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        potentialRent,
        actualRent,
        lostRent: potentialRent - actualRent,
        units: property.units.map((unit) => ({
          unitNumber: unit.unitNumber,
          status: unit.status,
          isOccupied: unit.leases.length > 0,
          rentAmount: Number(unit.rentAmount),
          currentLease: unit.leases[0] || null,
        })),
      };
    });

    const summary = {
      totalProperties: properties.length,
      totalUnits: reportData.reduce((sum, p) => sum + p.totalUnits, 0),
      occupiedUnits: reportData.reduce((sum, p) => sum + p.occupiedUnits, 0),
      vacantUnits: reportData.reduce((sum, p) => sum + p.vacantUnits, 0),
      averageOccupancyRate:
        reportData.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length || 0,
      totalPotentialRent: reportData.reduce((sum, p) => sum + p.potentialRent, 0),
      totalActualRent: reportData.reduce((sum, p) => sum + p.actualRent, 0),
      totalLostRent: reportData.reduce((sum, p) => sum + p.lostRent, 0),
    };

    return {
      success: true,
      data: {
        date,
        summary,
        properties: reportData,
      },
    };
  } catch (error) {
    console.error("Generate occupancy report error:", error);
    return { success: false, error: "Failed to generate occupancy report" };
  }
}

// ============================================================================
// MAINTENANCE REPORT
// ============================================================================

export async function generateMaintenanceReport(
  startDate: Date,
  endDate: Date,
  propertyId?: string
): Promise<ReportResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    const propertyFilter = propertyId ? { propertyId } : {};

    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        property: {
          landlordId: landlord.id,
          ...propertyFilter,
        },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        property: true,
        vendor: true,
      },
    });

    // Analyze by status
    const byStatus = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Analyze by priority
    const byPriority = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Analyze by category
    const byCategory = tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate costs
    const totalEstimatedCost = tickets.reduce(
      (sum, t) => sum + Number(t.estimatedCost || 0),
      0
    );
    const totalActualCost = tickets.reduce(
      (sum, t) => sum + Number(t.actualCost || 0),
      0
    );

    // Calculate average resolution time for completed tickets
    const completedTickets = tickets.filter((t) => t.completedDate);
    const avgResolutionTime =
      completedTickets.length > 0
        ? completedTickets.reduce((sum, t) => {
            const days =
              (t.completedDate!.getTime() - t.createdAt.getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / completedTickets.length
        : 0;

// By property breakdown
let byProperty: Array<{
  propertyId: string;
  propertyName: string;
  ticketCount: number;
  totalCost: number;
}> = [];

if (!propertyId) {
  const propertyIds = [...new Set(tickets.map((t) => t.propertyId))];
  byProperty = propertyIds.map((propId) => {
    const propTickets = tickets.filter((t) => t.propertyId === propId);
    const property = propTickets[0]?.property;

    return {
      propertyId: propId,
      propertyName: property?.name || "Unknown",
      ticketCount: propTickets.length,
      totalCost: propTickets.reduce((sum, t) => sum + Number(t.actualCost || 0), 0),
    };
  });
}

    return {
      success: true,
      data: {
        period: { startDate, endDate },
        summary: {
          totalTickets: tickets.length,
          completedTickets: completedTickets.length,
          openTickets: tickets.filter((t) => t.status === "OPEN").length,
          avgResolutionTime,
          totalEstimatedCost,
          totalActualCost,
        },
        byStatus,
        byPriority,
        byCategory,
        byProperty,
        tickets,
      },
    };
  } catch (error) {
    console.error("Generate maintenance report error:", error);
    return { success: false, error: "Failed to generate maintenance report" };
  }
}

// ============================================================================
// RENT ROLL REPORT
// ============================================================================

export async function generateRentRollReport(
  date: Date = new Date()
): Promise<ReportResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    const leases = await prisma.lease.findMany({
      where: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
        startDate: { lte: date },
        OR: [
          { endDate: { gte: date } },
          { endDate: null },
        ],
        status: "ACTIVE",
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
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
    });

    const rentRoll = leases.map((lease) => {
      const primaryTenant = lease.tenants.find((t) => t.isPrimaryTenant)?.tenant;

      return {
        propertyName: lease.unit.property.name,
        unitNumber: lease.unit.unitNumber,
        tenantName: primaryTenant?.user.name || "N/A",
        tenantEmail: primaryTenant?.user.email || "N/A",
        leaseStartDate: lease.startDate,
        leaseEndDate: lease.endDate,
        monthlyRent: Number(lease.rentAmount),
        deposit: Number(lease.deposit),
        status: lease.status,
      };
    });

    const totalMonthlyRent = rentRoll.reduce((sum, r) => sum + r.monthlyRent, 0);
    const totalDeposits = rentRoll.reduce((sum, r) => sum + r.deposit, 0);

    return {
      success: true,
      data: {
        date,
        summary: {
          totalLeases: rentRoll.length,
          totalMonthlyRent,
          totalDeposits,
        },
        rentRoll,
      },
    };
  } catch (error) {
    console.error("Generate rent roll report error:", error);
    return { success: false, error: "Failed to generate rent roll report" };
  }
}

// ============================================================================
// PAYMENT HISTORY REPORT
// ============================================================================

export async function generatePaymentHistoryReport(
  startDate: Date,
  endDate: Date,
  propertyId?: string
): Promise<ReportResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    const propertyFilter = propertyId ? { propertyId } : {};

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        lease: {
          unit: {
            property: {
              landlordId: landlord.id,
              ...propertyFilter,
            },
          },
        },
      },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const byStatus = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMethod = payments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalFees = payments.reduce((sum, p) => sum + Number(p.fee || 0), 0);
    const netAmount = payments.reduce((sum, p) => sum + Number(p.netAmount), 0);

    const completedPayments = payments.filter((p) => p.status === "COMPLETED");
    const failedPayments = payments.filter((p) => p.status === "FAILED");

    return {
      success: true,
      data: {
        period: { startDate, endDate },
        summary: {
          totalPayments: payments.length,
          completedPayments: completedPayments.length,
          failedPayments: failedPayments.length,
          totalAmount,
          totalFees,
          netAmount,
          avgPaymentAmount: payments.length > 0 ? totalAmount / payments.length : 0,
        },
        byStatus,
        byMethod,
        payments: payments.map((p) => ({
          id: p.id,
          date: p.createdAt,
          tenantName: p.tenant.user.name,
          propertyName: p.lease?.unit.property.name || "N/A",
          unitNumber: p.lease?.unit.unitNumber || "N/A",
          type: p.type,
          amount: Number(p.amount),
          status: p.status,
          method: p.method,
          paidAt: p.paidAt,
        })),
      },
    };
  } catch (error) {
    console.error("Generate payment history report error:", error);
    return { success: false, error: "Failed to generate payment history report" };
  }
}

// ============================================================================
// SAVE REPORT TO DATABASE
// ============================================================================

export async function saveFinancialReport(
  reportType: string,
  startDate: Date,
  endDate: Date,
  reportData: any
): Promise<ReportResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    const report = await prisma.financialReport.create({
      data: {
        landlordId: landlord.id,
        reportType,
        startDate,
        endDate,
        totalIncome: reportData.summary.totalIncome,
        totalExpenses: reportData.summary.totalExpenses,
        netIncome: reportData.summary.netIncome,
        reportData,
      },
    });

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error("Save financial report error:", error);
    return { success: false, error: "Failed to save report" };
  }
}

// ============================================================================
// GET SAVED REPORTS
// ============================================================================

export async function getSavedReports(): Promise<ReportResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.LANDLORD) {
      return { success: false, error: "Unauthorized" };
    }

    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return { success: false, error: "Landlord profile not found" };
    }

    const reports = await prisma.financialReport.findMany({
      where: { landlordId: landlord.id },
      orderBy: { generatedAt: "desc" },
      take: 20,
    });

    return {
      success: true,
      data: reports,
    };
  } catch (error) {
    console.error("Get saved reports error:", error);
    return { success: false, error: "Failed to fetch reports" };
  }
}