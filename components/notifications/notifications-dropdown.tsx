/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// components/notifications/notification-dropdown.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Loader2, 
  ExternalLink,
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
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotifications,
} from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

interface NotificationDropdownProps {
  initialCount?: number;
}

export function NotificationDropdown({ initialCount = 0 }: NotificationDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (open && !hasLoaded) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await getNotifications({ limit: 10 });
      if (result.success && result.data) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
        setHasLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await markNotificationAsRead(notificationId, {} as React.MouseEvent);
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
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        const wasUnread = notifications.find((n) => n.id === notificationId)?.isRead === false;
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success("Notification deleted");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id, {} as React.MouseEvent);
    }

    if (notification.actionUrl) {
      setOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
      RENT_DUE: { icon: DollarSign, color: "text-blue-600" },
      RENT_OVERDUE: { icon: AlertTriangle, color: "text-red-600" },
      LEASE_EXPIRING: { icon: FileText, color: "text-orange-600" },
      MAINTENANCE_REQUEST: { icon: Wrench, color: "text-yellow-600" },
      MAINTENANCE_COMPLETED: { icon: CheckCircle, color: "text-green-600" },
      PAYMENT_RECEIVED: { icon: TrendingUp, color: "text-green-600" },
      PAYMENT_FAILED: { icon: XCircle, color: "text-red-600" },
      MESSAGE: { icon: MessageSquare, color: "text-purple-600" },
      APPLICATION_RECEIVED: { icon: Mail, color: "text-blue-600" },
      DOCUMENT_UPLOADED: { icon: Upload, color: "text-indigo-600" },
      LEASE_CREATED: { icon: FileSignature, color: "text-blue-600" },
      LEASE_SIGNED: { icon: PenLine, color: "text-green-600" },
      MAINTENANCE_SCHEDULED: { icon: Calendar, color: "text-blue-600" },
      INSPECTION_SCHEDULED: { icon: Search, color: "text-orange-600" },
      LEASE_RENEWAL_OFFER: { icon: RefreshCw, color: "text-purple-600" },
      APPLICATION_APPROVED: { icon: CheckCircle, color: "text-green-600" },
      APPLICATION_DENIED: { icon: XCircle, color: "text-red-600" },
      SYSTEM: { icon: Settings, color: "text-gray-600" },
    };

    return iconMap[type] || { icon: Bell, color: "text-gray-600" };
  };

  const getNotificationBgColor = (type: string) => {
    const bgMap: Record<string, string> = {
      RENT_DUE: "bg-blue-100",
      RENT_OVERDUE: "bg-red-100",
      LEASE_EXPIRING: "bg-orange-100",
      MAINTENANCE_REQUEST: "bg-yellow-100",
      MAINTENANCE_COMPLETED: "bg-green-100",
      PAYMENT_RECEIVED: "bg-green-100",
      PAYMENT_FAILED: "bg-red-100",
      MESSAGE: "bg-purple-100",
      APPLICATION_RECEIVED: "bg-blue-100",
      DOCUMENT_UPLOADED: "bg-indigo-100",
      LEASE_CREATED: "bg-blue-100",
      LEASE_SIGNED: "bg-green-100",
      MAINTENANCE_SCHEDULED: "bg-blue-100",
      INSPECTION_SCHEDULED: "bg-orange-100",
      LEASE_RENEWAL_OFFER: "bg-purple-100",
      APPLICATION_APPROVED: "bg-green-100",
      APPLICATION_DENIED: "bg-red-100",
      SYSTEM: "bg-gray-100",
    };

    return bgMap[type] || "bg-gray-100";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full p-0 px-1 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="w-[calc(100vw-2rem)] sm:w-96 max-w-md p-0 data-[side=bottom]:sm:translate-x-0 data-[side=bottom]:translate-x-[calc(50vw-50%-1.25rem)]"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b px-3 sm:px-4 py-2 sm:py-3">
          <DropdownMenuLabel className="p-0 text-sm sm:text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 sm:h-8 text-xs px-2 sm:px-3"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              <span className="hidden xs:inline">Mark all read</span>
              <span className="xs:hidden">Read all</span>
            </Button>
          )}
        </div>

        <ScrollArea className="h-[60vh] sm:h-96 max-h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const { icon: Icon, color } = getNotificationIcon(notification.type);
                const bgColor = getNotificationBgColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`group relative cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-muted/50 ${
                      !notification.isRead ? "bg-primary/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-2 sm:gap-3">
                      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-xs sm:text-sm font-semibold leading-tight">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-0.5 sm:mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs text-destructive hover:text-destructive"
                              onClick={(e) => handleDelete(notification.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-center text-xs sm:text-sm" size="sm">
              View all notifications
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}