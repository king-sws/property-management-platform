/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/notifications.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NotificationType, NotificationChannel } from "@/lib/generated/prisma/enums";

// -------------------------
// Validation Schemas
// -------------------------
const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  actionUrl: z.string().optional(),
  metadata: z.any().optional(),
  channel: z.string().optional().default("IN_APP"),
});

// -------------------------
// Types
// -------------------------
type NotificationResult = {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
};

// -------------------------
// Helper Functions
// -------------------------
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

function serializeNotification(notification: any) {
  return {
    ...notification,
    createdAt: notification.createdAt?.toISOString() || null,
    readAt: notification.readAt?.toISOString() || null,
  };
}

// -------------------------
// Get Notifications
// -------------------------
export async function getNotifications(params?: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationResult> {
  try {
    const currentUser = await getCurrentUser();
    
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;
    
    const where: any = {
      userId: currentUser.id,
    };
    
    if (params?.unreadOnly) {
      where.isRead = false;
    }
    
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: currentUser.id,
          isRead: false,
        },
      }),
    ]);
    
    const serializedNotifications = notifications.map(serializeNotification);
    
    return {
      success: true,
      data: {
        notifications: serializedNotifications,
        pagination: {
          total,
          limit,
          offset,
          hasMore: total > offset + limit,
        },
        unreadCount,
      },
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return {
      success: false,
      error: "Failed to fetch notifications",
    };
  }
}

// -------------------------
// Get Unread Count
// -------------------------
export async function getUnreadNotificationCount(): Promise<NotificationResult> {
  try {
    const currentUser = await getCurrentUser();
    
    const count = await prisma.notification.count({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
    });
    
    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    console.error("Get unread count error:", error);
    return {
      success: false,
      error: "Failed to fetch unread count",
    };
  }
}

// -------------------------
// Mark Notification as Read
// -------------------------
export async function markNotificationAsRead(notificationId: string, p0: unknown): Promise<NotificationResult> {
  try {
    const currentUser = await getCurrentUser();
    
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    
    if (!notification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }
    
    if (notification.userId !== currentUser.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    revalidatePath("/dashboard");
    
    return {
      success: true,
      data: serializeNotification(updated),
      message: "Notification marked as read",
    };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return {
      success: false,
      error: "Failed to mark notification as read",
    };
  }
}

// -------------------------
// Mark All as Read
// -------------------------
export async function markAllNotificationsAsRead(): Promise<NotificationResult> {
  try {
    const currentUser = await getCurrentUser();
    
    await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    revalidatePath("/dashboard");
    
    return {
      success: true,
      message: "All notifications marked as read",
    };
  } catch (error) {
    console.error("Mark all as read error:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

// -------------------------
// Delete Notification
// -------------------------
export async function deleteNotification(notificationId: string): Promise<NotificationResult> {
  try {
    const currentUser = await getCurrentUser();
    
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    
    if (!notification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }
    
    if (notification.userId !== currentUser.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    await prisma.notification.delete({
      where: { id: notificationId },
    });
    
    revalidatePath("/dashboard");
    
    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error("Delete notification error:", error);
    return {
      success: false,
      error: "Failed to delete notification",
    };
  }
}

// -------------------------
// Delete All Read Notifications
// -------------------------
export async function deleteAllReadNotifications(): Promise<NotificationResult> {
  try {
    const currentUser = await getCurrentUser();
    
    await prisma.notification.deleteMany({
      where: {
        userId: currentUser.id,
        isRead: true,
      },
    });
    
    revalidatePath("/dashboard");
    
    return {
      success: true,
      message: "All read notifications deleted",
    };
  } catch (error) {
    console.error("Delete all read notifications error:", error);
    return {
      success: false,
      error: "Failed to delete notifications",
    };
  }
}

// -------------------------
// Create Notification (Internal Use)
// -------------------------
export async function createNotification(
  data: z.infer<typeof createNotificationSchema>
): Promise<NotificationResult> {
  try {
    const validated = createNotificationSchema.parse(data);
    
    const notification = await prisma.notification.create({
      data: {
        userId: validated.userId,
        type: validated.type as NotificationType,
        channel: (validated.channel as NotificationChannel) || "IN_APP",
        title: validated.title,
        message: validated.message,
        actionUrl: validated.actionUrl,
        metadata: validated.metadata,
      },
    });
    
    return {
      success: true,
      data: serializeNotification(notification),
    };
  } catch (error) {
    console.error("Create notification error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create notification",
    };
  }
}

// -------------------------
// Send Notification (with Email/SMS support)
// -------------------------
export async function sendNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
  sendEmail?: boolean;
  sendSMS?: boolean;
}): Promise<NotificationResult> {
  try {
    // Get user preferences
    const userSettings = await prisma.systemSetting.findMany({
      where: {
        key: {
          startsWith: `user:${params.userId}:notifications:`,
        },
      },
    });
    
    const emailEnabled = userSettings.find(s => s.key.endsWith(':email'))?.value === 'true';
    const smsEnabled = userSettings.find(s => s.key.endsWith(':sms'))?.value === 'true';
    const pushEnabled = userSettings.find(s => s.key.endsWith(':push'))?.value === 'true';
    
    // Check if this notification type is enabled
    const typeEnabled = userSettings.find(
      s => s.key === `user:${params.userId}:notifications:type:${params.type}`
    )?.value === 'true';
    
    if (!typeEnabled && userSettings.length > 0) {
      // Type is disabled, don't send
      return {
        success: true,
        message: "Notification type disabled by user",
      };
    }
    
    // Create in-app notification
    if (pushEnabled || userSettings.length === 0) {
      await createNotification({
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        metadata: params.metadata,
        channel: "IN_APP",
      });
    }
    
    // Send email if enabled and requested
    if (emailEnabled && params.sendEmail) {
      // TODO: Implement email sending
      // await sendEmail({
      //   to: user.email,
      //   subject: params.title,
      //   body: params.message,
      // });
    }
    
    // Send SMS if enabled and requested
    if (smsEnabled && params.sendSMS) {
      // TODO: Implement SMS sending
      // await sendSMS({
      //   to: user.phone,
      //   message: params.message,
      // });
    }
    
    return {
      success: true,
      message: "Notification sent",
    };
  } catch (error) {
    console.error("Send notification error:", error);
    return {
      success: false,
      error: "Failed to send notification",
    };
  }
}

// -------------------------
// Get Notification Settings
// -------------------------
export async function getNotificationSettings(): Promise<NotificationResult> {
  try {
    const currentUser = await getCurrentUser();
    
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          startsWith: `user:${currentUser.id}:notifications:`,
        },
      },
    });
    
    return {
      success: true,
      data: {
        emailEnabled: settings.find(s => s.key.endsWith(':email'))?.value === 'true' ,
        smsEnabled: settings.find(s => s.key.endsWith(':sms'))?.value === 'true',
        pushEnabled: settings.find(s => s.key.endsWith(':push'))?.value === 'true',
        enabledTypes: settings
          .filter(s => s.key.includes(':type:') && s.value === 'true')
          .map(s => s.key.split(':type:')[1]),
      },
    };
  } catch (error) {
    console.error("Get notification settings error:", error);
    return {
      success: false,
      error: "Failed to fetch notification settings",
    };
  }
}