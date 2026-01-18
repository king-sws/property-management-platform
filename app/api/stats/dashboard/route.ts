// ============================================================================
// app/api/stats/dashboard/route.ts
// Consolidated stats endpoint with caching and optimized queries
// ============================================================================
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/generated/prisma/enums";

// Cache duration: 30 seconds
const CACHE_DURATION = 30;

interface DashboardStats {
  messages?: number;
  applications?: number;
  maintenance?: number;
  payments?: number;
  tenants?: number;
  myJobs?: number;
  pendingInvoices?: number;
}

// ✅ Only runtime is allowed in route.ts (optional)
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Single query to get user with all profiles
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        landlordProfile: { select: { id: true } },
        tenantProfile: { select: { id: true } },
        vendorProfile: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stats: DashboardStats = {};

    // Execute all queries in parallel based on role
    if (user.role === UserRole.LANDLORD && user.landlordProfile) {
      const landlordId = user.landlordProfile.id;

      const [
        unreadMessages,
        pendingApplications,
        openMaintenance,
        pendingPayments,
        uniqueTenants,
      ] = await Promise.all([
        // Unread messages - uses existing index on [userId, isRead]
        prisma.message.count({
          where: {
            users: { some: { id: session.user.id } },
            NOT: {
              readBy: { has: session.user.id }
            },
          },
        }),

        // Pending applications - uses index on [landlordId, status]
        prisma.rentalApplication.count({
          where: {
            landlordId,
            status: { in: ["SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"] },
          },
        }),

        // Open maintenance tickets - uses index on [propertyId, status]
        prisma.maintenanceTicket.count({
          where: {
            property: { landlordId },
            status: {
              in: ["OPEN", "IN_PROGRESS", "WAITING_VENDOR", "WAITING_PARTS", "SCHEDULED"],
            },
          },
        }),

        // Pending/overdue payments - uses composite index
        prisma.payment.count({
          where: {
            lease: {
              unit: {
                property: { landlordId },
              },
            },
            status: { in: ["PENDING", "PROCESSING"] },
            dueDate: { lte: new Date() },
          },
        }),

        // Active tenants - count distinct tenant IDs
        prisma.leaseTenant.groupBy({
          by: ["tenantId"],
          where: {
            lease: {
              unit: {
                property: { landlordId },
              },
              status: { in: ["ACTIVE", "EXPIRING_SOON"] },
            },
          },
          _count: true,
        }),
      ]);

      stats.messages = unreadMessages;
      stats.applications = pendingApplications;
      stats.maintenance = openMaintenance;
      stats.payments = pendingPayments;
      stats.tenants = uniqueTenants.length;
    } 
    
    else if (user.role === UserRole.TENANT && user.tenantProfile) {
      const tenantId = user.tenantProfile.id;

      const [unreadMessages, openMaintenance, pendingApplications] =
        await Promise.all([
          // Unread messages
          prisma.message.count({
            where: {
              users: { some: { id: session.user.id } },
              NOT: {
                readBy: { has: session.user.id }
              },
            },
          }),

          // Maintenance tickets created by tenant
          prisma.maintenanceTicket.count({
            where: {
              createdById: session.user.id,
              status: {
                in: ["OPEN", "IN_PROGRESS", "WAITING_VENDOR", "WAITING_PARTS", "SCHEDULED"],
              },
            },
          }),

          // Tenant's pending applications
          prisma.rentalApplication.count({
            where: {
              tenantId,
              status: {
                in: ["SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"],
              },
            },
          }),
        ]);

      stats.messages = unreadMessages;
      stats.maintenance = openMaintenance;
      stats.applications = pendingApplications;
    } 
    
    else if (user.role === UserRole.VENDOR && user.vendorProfile) {
      const vendorId = user.vendorProfile.id;

      const [unreadMessages, activeJobs, pendingInvoices] = await Promise.all([
        // Unread messages
        prisma.message.count({
          where: {
            users: { some: { id: session.user.id } },
            NOT: {
              readBy: { has: session.user.id }
            },
          },
        }),

        // Active maintenance jobs
        prisma.maintenanceTicket.count({
          where: {
            vendorId,
            status: { in: ["IN_PROGRESS", "SCHEDULED", "WAITING_PARTS"] },
          },
        }),

        // Pending vendor invoices
        prisma.vendorInvoice.count({
          where: {
            vendorId,
            status: { in: ["PENDING", "APPROVED"] },
          },
        }),
      ]);

      stats.messages = unreadMessages;
      stats.myJobs = activeJobs;
      stats.pendingInvoices = pendingInvoices;
    }

    // Return with cache headers for CDN/browser caching
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}