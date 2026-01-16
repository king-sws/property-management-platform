// hooks/use-notifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotifications, getUnreadNotificationCount } from "@/actions/notifications";

export function useNotifications(autoRefresh = false, refreshInterval = 30000) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (params?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [notifResult, countResult] = await Promise.all([
        getNotifications(params),
        getUnreadNotificationCount(),
      ]);

      if (notifResult.success && notifResult.data) {
        setNotifications(notifResult.data.notifications);
      } else {
        setError(notifResult.error || "Failed to fetch notifications");
      }

      if (countResult.success && countResult.data) {
        setUnreadCount(countResult.data.count);
      }
    } catch (err) {
      setError("An error occurred while fetching notifications");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await getUnreadNotificationCount();
      if (result.success && result.data) {
        setUnreadCount(result.data.count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // Auto-refresh unread count
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    setNotifications,
    setUnreadCount,
  };
}