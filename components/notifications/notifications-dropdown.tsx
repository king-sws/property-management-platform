/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// components/notifications/notification-dropdown.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
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
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
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
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | "RENT_DUE"
  | "RENT_OVERDUE"
  | "LEASE_EXPIRING"
  | "MAINTENANCE_REQUEST"
  | "MAINTENANCE_COMPLETED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "MESSAGE"
  | "APPLICATION_RECEIVED"
  | "DOCUMENT_UPLOADED"
  | "LEASE_CREATED"
  | "LEASE_SIGNED"
  | "MAINTENANCE_SCHEDULED"
  | "INSPECTION_SCHEDULED"
  | "LEASE_RENEWAL_OFFER"
  | "APPLICATION_APPROVED"
  | "APPLICATION_DENIED"
  | "SYSTEM";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  actionUrl?: string | null;
}

interface NotificationDropdownProps {
  initialCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STALE_MS         = 60_000;
const POLL_INTERVAL_MS = 30_000;
const MAX_RETRIES      = 3;
const RETRY_BASE_MS    = 1_000;

const ICON_MAP: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  RENT_DUE:              { icon: DollarSign,    color: "text-blue-600",   bg: "bg-blue-100"   },
  RENT_OVERDUE:          { icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-100"    },
  LEASE_EXPIRING:        { icon: FileText,      color: "text-orange-600", bg: "bg-orange-100" },
  MAINTENANCE_REQUEST:   { icon: Wrench,        color: "text-yellow-600", bg: "bg-yellow-100" },
  MAINTENANCE_COMPLETED: { icon: CheckCircle,   color: "text-green-600",  bg: "bg-green-100"  },
  PAYMENT_RECEIVED:      { icon: TrendingUp,    color: "text-green-600",  bg: "bg-green-100"  },
  PAYMENT_FAILED:        { icon: XCircle,       color: "text-red-600",    bg: "bg-red-100"    },
  MESSAGE:               { icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100" },
  APPLICATION_RECEIVED:  { icon: Mail,          color: "text-blue-600",   bg: "bg-blue-100"   },
  DOCUMENT_UPLOADED:     { icon: Upload,        color: "text-indigo-600", bg: "bg-indigo-100" },
  LEASE_CREATED:         { icon: FileSignature, color: "text-blue-600",   bg: "bg-blue-100"   },
  LEASE_SIGNED:          { icon: PenLine,       color: "text-green-600",  bg: "bg-green-100"  },
  MAINTENANCE_SCHEDULED: { icon: Calendar,      color: "text-blue-600",   bg: "bg-blue-100"   },
  INSPECTION_SCHEDULED:  { icon: Search,        color: "text-orange-600", bg: "bg-orange-100" },
  LEASE_RENEWAL_OFFER:   { icon: RefreshCw,     color: "text-purple-600", bg: "bg-purple-100" },
  APPLICATION_APPROVED:  { icon: CheckCircle,   color: "text-green-600",  bg: "bg-green-100"  },
  APPLICATION_DENIED:    { icon: XCircle,       color: "text-red-600",    bg: "bg-red-100"    },
  SYSTEM:                { icon: Settings,      color: "text-gray-600",   bg: "bg-gray-100"   },
};

function getIconMeta(type: string) {
  return ICON_MAP[type as NotificationType] ?? { icon: Bell, color: "text-gray-600", bg: "bg-gray-100" };
}

function backoffDelay(attempt: number) {
  return RETRY_BASE_MS * Math.pow(2, attempt);
}

// ─── Badge label: show exact count up to 9, then "9+" ────────────────────────
function badgeLabel(count: number): string {
  return count > 9 ? "9+" : String(count);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-2.5 w-full rounded bg-muted" />
            <div className="h-2 w-1/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onRead,
  onDelete,
  onClick,
}: {
  notification: Notification;
  onRead: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClick: (n: Notification) => void;
}) {
  const { icon: Icon, color, bg } = getIconMeta(notification.type);

  return (
    <div
      className={cn(
        "group relative cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5"
      )}
      onClick={() => onClick(notification)}
    >
      <div className="flex gap-2 sm:gap-3">
        <div className={cn("flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full", bg)}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", color)} />
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
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Mark as read"
                  className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                  onClick={(e) => onRead(notification.id, e)}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                title="Delete"
                className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs text-destructive hover:text-destructive"
                onClick={(e) => onDelete(notification.id, e)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationDropdown({ initialCount = 0 }: NotificationDropdownProps) {
  const router = useRouter();

  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(initialCount);
  const [isLoading, setIsLoading]         = useState(false);
  const [isOnline, setIsOnline]           = useState(true);
  const [loadError, setLoadError]         = useState(false);

  const lastFetchedRef = useRef<number>(0);
  const pollTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Online / offline ───────────────────────────────────────────────────────
  useEffect(() => {
    const onOnline  = () => { setIsOnline(true); if (open) loadNotifications(true); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [open]);

  // ── Fetch with TTL guard + exponential-backoff retry ──────────────────────
  const loadNotifications = useCallback(async (force = false) => {
    if (!force && Date.now() - lastFetchedRef.current < STALE_MS) return;
    if (!isOnline) return;

    setIsLoading(true);
    setLoadError(false);

    let attempt = 0;
    while (attempt <= MAX_RETRIES) {
      try {
        const result = await getNotifications({ limit: 20 });
        if (result.success && result.data) {
          setNotifications(result.data.notifications as Notification[]);
          setUnreadCount(result.data.unreadCount);
          lastFetchedRef.current = Date.now();
        }
        break;
      } catch {
        attempt++;
        if (attempt > MAX_RETRIES) { setLoadError(true); break; }
        await new Promise((r) => setTimeout(r, backoffDelay(attempt)));
      }
    }

    setIsLoading(false);
  }, [isOnline]);

  // ── Open/close: initial load + 30 s polling ────────────────────────────────
  useEffect(() => {
    if (open) {
      loadNotifications();
      pollTimerRef.current = setInterval(() => loadNotifications(true), POLL_INTERVAL_MS);
    } else {
      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    }
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, [open, loadNotifications]);

  // ── Mark as read — optimistic ──────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setNotifications((prev) =>
      prev.map((n) => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const result = await markNotificationAsRead(notificationId, undefined);
      if (!result.success) throw new Error(result.error);
      router.refresh();
    } catch {
      setNotifications((prev) =>
        prev.map((n) => n.id === notificationId ? { ...n, isRead: false, readAt: null } : n)
      );
      setUnreadCount((prev) => prev + 1);
      toast.error("Failed to mark as read");
    }
  }, [router]);

  // ── Mark all as read — optimistic ─────────────────────────────────────────
  const handleMarkAllAsRead = useCallback(async () => {
    const snapshot  = notifications;
    const prevCount = unreadCount;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      const result = await markAllNotificationsAsRead();
      if (!result.success) throw new Error(result.error);
      toast.success("All notifications marked as read");
      router.refresh();
    } catch {
      setNotifications(snapshot);
      setUnreadCount(prevCount);
      toast.error("Failed to mark all as read");
    }
  }, [notifications, unreadCount, router]);

  // ── Delete — optimistic ───────────────────────────────────────────────────
  const handleDelete = useCallback(async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const deleted   = notifications.find((n) => n.id === notificationId);
    const wasUnread = deleted?.isRead === false;

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const result = await deleteNotification(notificationId);
      if (!result.success) throw new Error(result.error);
      toast.success("Notification deleted");
      router.refresh();
    } catch {
      if (deleted) {
        setNotifications((prev) => {
          const idx  = prev.findIndex((n) => new Date(n.createdAt) < new Date(deleted.createdAt));
          const copy = [...prev];
          copy.splice(idx === -1 ? prev.length : idx, 0, deleted);
          return copy;
        });
        if (wasUnread) setUnreadCount((prev) => prev + 1);
      }
      toast.error("Failed to delete notification");
    }
  }, [notifications, router]);

  // ── Row click ──────────────────────────────────────────────────────────────
  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => n.id === notification.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await markNotificationAsRead(notification.id, undefined);
        router.refresh();
      } catch {
        // Silent — navigation takes priority
      }
    }

    if (notification.actionUrl) {
      setOpen(false);
      router.push(notification.actionUrl);
    }
  }, [router]);

  // ─── Render ───────────────────────────────────────────────────────────────

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
              {badgeLabel(unreadCount)}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-2rem)] sm:w-96 max-w-md p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2">
            <DropdownMenuLabel className="p-0 text-sm sm:text-base font-semibold">
              Notifications
            </DropdownMenuLabel>
            {!isOnline && (
              <WifiOff className="h-3.5 w-3.5 text-destructive" />
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              title="Refresh"
              disabled={isLoading || !isOnline}
              onClick={() => loadNotifications(true)}
              className="h-7 sm:h-8 px-2"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </Button>

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
        </div>

        {/* Body */}
        <ScrollArea className="h-[60vh] sm:h-96 max-h-[500px]">
          {isLoading && notifications.length === 0 ? (
            <NotificationSkeleton />
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4 gap-3">
              <WifiOff className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                Failed to load notifications
              </p>
              <Button variant="outline" size="sm" onClick={() => loadNotifications(true)}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-center text-xs sm:text-sm"
              size="sm"
            >
              View all notifications
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}