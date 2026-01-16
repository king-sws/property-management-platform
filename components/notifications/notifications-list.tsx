/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/notifications/notifications-list.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  Bell,
  BellOff,
  DollarSign,
  AlertTriangle,
  FileText,
  Wrench,
  CheckCircle,
  CreditCard,
  XCircle,
  MessageSquare,
  Mail,
  Upload,
  FileSignature,
  PenLine,
  Calendar,
  Search,
  RefreshCw,
  Settings,
  TrendingUp,
} from "lucide-react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "@/actions/notifications";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

interface NotificationsListProps {
  initialNotifications: any[];
  initialUnreadCount: number;
}

export function NotificationsList({
  initialNotifications,
  initialUnreadCount,
}: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId, {} as any);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to mark all as read");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        const wasUnread =
          notifications.find((n) => n.id === notificationId)?.isRead === false;
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      const result = await deleteAllReadNotifications();
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to clear notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
      RENT_DUE: { icon: DollarSign, color: "text-blue-600 dark:text-blue-400" },
      RENT_OVERDUE: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400" },
      LEASE_EXPIRING: { icon: FileText, color: "text-orange-600 dark:text-orange-400" },
      MAINTENANCE_REQUEST: { icon: Wrench, color: "text-yellow-600 dark:text-yellow-400" },
      MAINTENANCE_COMPLETED: { icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
      PAYMENT_RECEIVED: { icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
      PAYMENT_FAILED: { icon: XCircle, color: "text-red-600 dark:text-red-400" },
      MESSAGE: { icon: MessageSquare, color: "text-purple-600 dark:text-purple-400" },
      APPLICATION_RECEIVED: { icon: Mail, color: "text-blue-600 dark:text-blue-400" },
      DOCUMENT_UPLOADED: { icon: Upload, color: "text-indigo-600 dark:text-indigo-400" },
      LEASE_CREATED: { icon: FileSignature, color: "text-blue-600 dark:text-blue-400" },
      LEASE_SIGNED: { icon: PenLine, color: "text-green-600 dark:text-green-400" },
      MAINTENANCE_SCHEDULED: { icon: Calendar, color: "text-blue-600 dark:text-blue-400" },
      INSPECTION_SCHEDULED: { icon: Search, color: "text-orange-600 dark:text-orange-400" },
      LEASE_RENEWAL_OFFER: { icon: RefreshCw, color: "text-purple-600 dark:text-purple-400" },
      APPLICATION_APPROVED: { icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
      APPLICATION_DENIED: { icon: XCircle, color: "text-red-600 dark:text-red-400" },
      SYSTEM: { icon: Settings, color: "text-gray-600 dark:text-gray-400" },
    };

    return iconMap[type] || { icon: Bell, color: "text-gray-600 dark:text-gray-400" };
  };

  const getNotificationBgColor = (type: string) => {
    const bgMap: Record<string, string> = {
      RENT_DUE: "bg-blue-100 dark:bg-blue-950",
      RENT_OVERDUE: "bg-red-100 dark:bg-red-950",
      LEASE_EXPIRING: "bg-orange-100 dark:bg-orange-950",
      MAINTENANCE_REQUEST: "bg-yellow-100 dark:bg-yellow-950",
      MAINTENANCE_COMPLETED: "bg-green-100 dark:bg-green-950",
      PAYMENT_RECEIVED: "bg-green-100 dark:bg-green-950",
      PAYMENT_FAILED: "bg-red-100 dark:bg-red-950",
      MESSAGE: "bg-purple-100 dark:bg-purple-950",
      APPLICATION_RECEIVED: "bg-blue-100 dark:bg-blue-950",
      DOCUMENT_UPLOADED: "bg-indigo-100 dark:bg-indigo-950",
      LEASE_CREATED: "bg-blue-100 dark:bg-blue-950",
      LEASE_SIGNED: "bg-green-100 dark:bg-green-950",
      MAINTENANCE_SCHEDULED: "bg-blue-100 dark:bg-blue-950",
      INSPECTION_SCHEDULED: "bg-orange-100 dark:bg-orange-950",
      LEASE_RENEWAL_OFFER: "bg-purple-100 dark:bg-purple-950",
      APPLICATION_APPROVED: "bg-green-100 dark:bg-green-950",
      APPLICATION_DENIED: "bg-red-100 dark:bg-red-950",
      SYSTEM: "bg-gray-100 dark:bg-gray-950",
    };

    return bgMap[type] || "bg-gray-100 dark:bg-gray-950";
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      RENT_DUE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      RENT_OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      LEASE_EXPIRING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      MAINTENANCE_REQUEST: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      MAINTENANCE_COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      PAYMENT_RECEIVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      PAYMENT_FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      MESSAGE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      APPLICATION_RECEIVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      DOCUMENT_UPLOADED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      LEASE_CREATED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      LEASE_SIGNED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      MAINTENANCE_SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      INSPECTION_SCHEDULED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      LEASE_RENEWAL_OFFER: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      APPLICATION_APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      APPLICATION_DENIED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      SYSTEM: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up!"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                Mark all as read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading || notifications.filter((n) => n.isRead).length === 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear read
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2 mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BellOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any notifications yet
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const { icon: Icon, color } = getNotificationIcon(notification.type);
                const bgColor = getNotificationBgColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`relative group rounded-lg border p-4 transition-colors ${
                      !notification.isRead
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card"
                    } ${notification.actionUrl ? "cursor-pointer hover:bg-muted" : ""}`}
                    onClick={() =>
                      notification.actionUrl && handleNotificationClick(notification)
                    }
                  >
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{notification.title}</h3>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getNotificationColor(notification.type)}`}
                            >
                              {notification.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <span>
                              {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        {notification.actionUrl && (
                          <div className="mt-2">
                            <Link
                              href={notification.actionUrl}
                              className="text-sm text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View details →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-2 mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No unread notifications</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const { icon: Icon, color } = getNotificationIcon(notification.type);
                const bgColor = getNotificationBgColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`relative group rounded-lg border p-4 transition-colors bg-primary/5 border-primary/20 ${
                      notification.actionUrl ? "cursor-pointer hover:bg-muted" : ""
                    }`}
                    onClick={() =>
                      notification.actionUrl && handleNotificationClick(notification)
                    }
                  >
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{notification.title}</h3>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getNotificationColor(notification.type)}`}
                            >
                              {notification.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <span>
                              {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark read
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        {notification.actionUrl && (
                          <div className="mt-2">
                            <Link
                              href={notification.actionUrl}
                              className="text-sm text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View details →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}