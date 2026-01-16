/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/admin/system.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// -------------------------
// Get System Stats
// -------------------------
export async function getSystemStats() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const [
      totalUsers,
      activeUsers,
      totalProperties,
      activeLeases,
      openTickets,
      pendingApplications,
      totalPayments,
      failedPayments,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.property.count({ where: { deletedAt: null } }),
      prisma.lease.count({ where: { status: "ACTIVE" } }),
      prisma.maintenanceTicket.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] }, deletedAt: null },
      }),
      prisma.rentalApplication.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      }),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
    ]);

    // Calculate uptime (mock for now - you can implement real uptime tracking)
    const uptime = "99.9%";
    const lastRestart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    return {
      totalUsers,
      activeUsers,
      totalProperties,
      activeLeases,
      openTickets,
      pendingApplications,
      totalPayments,
      failedPayments,
      uptime,
      lastRestart,
    };
  } catch (error) {
    console.error("Get system stats error:", error);
    return null;
  }
}

// -------------------------
// Get Database Stats
// -------------------------
export async function getDatabaseStats() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    // Get counts for all major tables
    const [
      users,
      properties,
      units,
      leases,
      payments,
      tickets,
      documents,
      notifications,
      activityLogs,
      messages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.unit.count(),
      prisma.lease.count(),
      prisma.payment.count(),
      prisma.maintenanceTicket.count(),
      prisma.document.count(),
      prisma.notification.count(),
      prisma.activityLog.count(),
      prisma.message.count(),
    ]);

    const totalRecords =
      users +
      properties +
      units +
      leases +
      payments +
      tickets +
      documents +
      notifications +
      activityLogs +
      messages;

    return {
      totalRecords,
      tables: {
        users,
        properties,
        units,
        leases,
        payments,
        tickets,
        documents,
        notifications,
        activityLogs,
        messages,
      },
    };
  } catch (error) {
    console.error("Get database stats error:", error);
    return null;
  }
}

// -------------------------
// Get System Settings
// -------------------------
export async function getSystemSettings() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    return settings;
  } catch (error) {
    console.error("Get system settings error:", error);
    return null;
  }
}

// -------------------------
// Update System Setting
// -------------------------
export async function updateSystemSetting(
  key: string,
  value: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        type: "string",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id!,
        type: "PROPERTY_UPDATED",
        action: `Updated system setting: ${key}`,
        metadata: { key, value },
      },
    });

    revalidatePath("/dashboard/system");

    return { success: true };
  } catch (error) {
    console.error("Update system setting error:", error);
    return { success: false, error: "Failed to update setting" };
  }
}

// -------------------------
// Get Recent Activity
// -------------------------
export async function getRecentActivity() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return null;
    }

    const activities = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return activities;
  } catch (error) {
    console.error("Get recent activity error:", error);
    return null;
  }
}

// -------------------------
// Clear Old Activity Logs
// -------------------------
export async function clearOldActivityLogs(days: number = 90): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id!,
        type: "PROPERTY_DELETED",
        action: `Cleared activity logs older than ${days} days`,
        metadata: { deletedCount: result.count },
      },
    });

    revalidatePath("/dashboard/system");

    return {
      success: true,
      data: { deletedCount: result.count },
    };
  } catch (error) {
    console.error("Clear old activity logs error:", error);
    return { success: false, error: "Failed to clear logs" };
  }
}

// -------------------------
// Clear Old Notifications
// -------------------------
export async function clearOldNotifications(days: number = 30): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id!,
        type: "PROPERTY_DELETED",
        action: `Cleared read notifications older than ${days} days`,
        metadata: { deletedCount: result.count },
      },
    });

    revalidatePath("/dashboard/system");

    return {
      success: true,
      data: { deletedCount: result.count },
    };
  } catch (error) {
    console.error("Clear old notifications error:", error);
    return { success: false, error: "Failed to clear notifications" };
  }
}

// -------------------------
// Backup Database (Mock - implement with your backup solution)
// -------------------------
export async function backupDatabase(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // In a real implementation, trigger your backup service here
    // For now, just log the action
    await prisma.activityLog.create({
      data: {
        userId: session.user.id!,
        type: "PROPERTY_CREATED",
        action: "Initiated database backup",
        metadata: { timestamp: new Date().toISOString() },
      },
    });

    return {
      success: true,
      data: { message: "Backup initiated successfully" },
    };
  } catch (error) {
    console.error("Backup database error:", error);
    return { success: false, error: "Failed to initiate backup" };
  }
}

// -------------------------
// Send Test Notification
// -------------------------
export async function sendTestNotification(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.create({
      data: {
        userId: session.user.id!,
        type: "SYSTEM",
        channel: "IN_APP",
        title: "Test Notification",
        message: "This is a test notification from the system.",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Send test notification error:", error);
    return { success: false, error: "Failed to send notification" };
  }
}