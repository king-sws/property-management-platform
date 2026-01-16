// app/(dashboard)/dashboard/layout.tsx
import { auth } from "@/auth";
import { DashboardClientWrapper } from "@/components/dashboard/dashboard-client-wrapper";
import { UserRole } from "@/lib/generated/prisma/enums";
import { getUnreadNotificationCount } from "@/actions/notifications";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

// ============================================================================
// TYPES
// ============================================================================
interface SidebarStats {
  applications?: number;
  maintenance?: number;
  messages?: number;
  payments?: number;
  tenants?: number;
  myJobs?: number;
  pendingInvoices?: number;
}

// ============================================================================
// CACHED STATS FETCHER - Server-side only
// ============================================================================
const getCachedDashboardStats = unstable_cache(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (userId: string, role: UserRole): Promise<SidebarStats> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          landlordProfile: { select: { id: true } },
          tenantProfile: { select: { id: true } },
          vendorProfile: { select: { id: true } },
        },
      });

      if (!user) return {};

      const stats: SidebarStats = {};

      // ========================================================================
      // LANDLORD STATS
      // ========================================================================
      if (user.role === UserRole.LANDLORD && user.landlordProfile) {
        const landlordId = user.landlordProfile.id;

        const [
          unreadMessages,
          pendingApplications,
          openMaintenance,
          pendingPayments,
          uniqueTenants,
        ] = await Promise.all([
          // Unread messages
          prisma.message.count({
            where: {
              users: { some: { id: userId } },
              NOT: {
                readBy: { has: userId }
              }
            },
          }),

          // Pending applications
          prisma.rentalApplication.count({
            where: {
              landlordId,
              status: { in: ["SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"] },
            },
          }),

          // Open maintenance tickets
          prisma.maintenanceTicket.count({
            where: {
              property: { landlordId },
              status: {
                in: ["OPEN", "IN_PROGRESS", "WAITING_VENDOR", "WAITING_PARTS", "SCHEDULED"],
              },
            },
          }),

          // Pending/overdue payments
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

          // Active tenants (count distinct)
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

      // ========================================================================
      // TENANT STATS
      // ========================================================================
      else if (user.role === UserRole.TENANT && user.tenantProfile) {
        const tenantId = user.tenantProfile.id;

        const [unreadMessages, openMaintenance, pendingApplications] =
          await Promise.all([
            // Unread messages
            prisma.message.count({
              where: {
                users: { some: { id: userId } },
                NOT: {
                  readBy: { has: userId }
                },
              },
            }),

            // Maintenance tickets created by tenant
            prisma.maintenanceTicket.count({
              where: {
                createdById: userId,
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

      // ========================================================================
      // VENDOR STATS
      // ========================================================================
      else if (user.role === UserRole.VENDOR && user.vendorProfile) {
        const vendorId = user.vendorProfile.id;

        const [unreadMessages, activeJobs, pendingInvoices] = await Promise.all([
          // Unread messages
          prisma.message.count({
            where: {
              users: { some: { id: userId } },
              NOT: {
                readBy: { has: userId }
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

      return stats;
    } catch (error) {
      console.error("Error fetching cached stats:", error);
      return {};
    }
  },
  ["dashboard-stats"], // Cache key
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ["stats"], // Can invalidate with revalidateTag('stats')
  }
);

// ============================================================================
// LAYOUT COMPONENT
// ============================================================================
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">Please sign in to continue</p>
          <a href="/sign-in" className="text-primary hover:underline">
            Go to sign in
          </a>
        </div>
      </div>
    );
  }

  const role = session.user.role as UserRole;

  // Fetch both notification count and stats in parallel for better performance
  const [notificationResult, initialStats] = await Promise.all([
    getUnreadNotificationCount().catch((error) => {
      console.error("Failed to fetch unread count:", error);
      return { success: false, data: null };
    }),
    getCachedDashboardStats(session.user.id, role),
  ]);

  const unreadCount =
    notificationResult.success && notificationResult.data
      ? notificationResult.data.count
      : 0;

  return (
    <DashboardClientWrapper
      user={session.user}
      role={role}
      initialStats={initialStats}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardClientWrapper>
  );
}