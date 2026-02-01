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
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const NotificationCard = ({ notification }: { notification: any }) => {
    const { icon: Icon, color } = getNotificationIcon(notification.type);
    const bgColor = getNotificationBgColor(notification.type);

    return (
      <div
        className={`relative group rounded-lg border transition-all ${
          !notification.isRead
            ? "bg-primary/5 border-primary/20"
            : "bg-card"
        } ${notification.actionUrl ? "cursor-pointer hover:bg-accent/50" : ""}`}
        onClick={() =>
          notification.actionUrl && handleNotificationClick(notification)
        }
      >
        {/* Mobile Layout */}
        <div className="block lg:hidden p-3">
          <div className="flex gap-3">
            {/* Icon - Smaller on mobile */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and Badge */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm leading-tight pr-2">
                  {notification.title}
                </h3>
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                )}
              </div>

              {/* Badge - Moved below title on mobile */}
              <Badge
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 h-5 mb-2 ${getNotificationColor(notification.type)}`}
              >
                {notification.type.replace(/_/g, " ")}
              </Badge>

              {/* Message */}
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {notification.message}
              </p>

              {/* Time */}
              <p className="text-[10px] text-muted-foreground mb-2">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                )}
                {notification.actionUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={notification.actionUrl}>
                      View
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 ml-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!notification.isRead && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block p-4">
          <div className="flex gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base">{notification.title}</h3>
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
              <div className="flex items-center justify-between gap-4">
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
                      className="h-8"
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
                    className="text-destructive hover:text-destructive h-8"
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
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Notifications</CardTitle>
            <CardDescription className="text-sm">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Mark all read</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading || notifications.filter((n) => n.isRead).length === 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Clear read</span>
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
              filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
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
              filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}