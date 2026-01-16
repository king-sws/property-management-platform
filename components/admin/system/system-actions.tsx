/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/system/system-actions.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Trash2,
  Bell,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import {
  clearOldActivityLogs,
  clearOldNotifications,
  backupDatabase,
  sendTestNotification,
} from "@/actions/admin/system";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function SystemActions() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (
    actionFn: () => Promise<any>,
    actionName: string,
    successMessage: string
  ) => {
    setLoading(actionName);
    try {
      const result = await actionFn();
      if (result.success) {
        toast("Success");
      } else {
        toast("Action failed");
      }
    } catch (error) {
      toast("An unexpected error occurred");
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      id: "backup",
      title: "Backup Database",
      description: "Create a full database backup",
      icon: Database,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      action: () =>
        handleAction(backupDatabase, "backup", "Database backup initiated"),
      dangerous: false,
    },
    {
      id: "test-notification",
      title: "Test Notification",
      description: "Send a test notification to yourself",
      icon: Bell,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      action: () =>
        handleAction(
          sendTestNotification,
          "test-notification",
          "Test notification sent"
        ),
      dangerous: false,
    },
    {
      id: "clear-logs",
      title: "Clear Old Logs",
      description: "Remove activity logs older than 90 days",
      icon: Trash2,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      action: () =>
        handleAction(
          () => clearOldActivityLogs(90),
          "clear-logs",
          "Old activity logs cleared"
        ),
      dangerous: true,
    },
    {
      id: "clear-notifications",
      title: "Clear Notifications",
      description: "Remove read notifications older than 30 days",
      icon: Trash2,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      action: () =>
        handleAction(
          () => clearOldNotifications(30),
          "clear-notifications",
          "Old notifications cleared"
        ),
      dangerous: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          System Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((item) => (
            <div key={item.id}>
              {item.dangerous ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-auto flex flex-col items-start p-4 gap-3"
                      disabled={loading !== null}
                    >
                      <div className={`${item.bgColor} ${item.color} rounded-full p-2`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {item.title}
                          <AlertTriangle className="h-3 w-3 text-orange-600" />
                        </div>
                        <div className="text-xs text-muted-foreground text-wrap mt-1">
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {item.description}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={item.action}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-auto flex flex-col items-start p-4 gap-3"
                  onClick={item.action}
                  disabled={loading === item.id}
                >
                  <div className={`${item.bgColor} ${item.color} rounded-full p-2`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground text-wrap mt-1">
                      {item.description}
                    </div>
                  </div>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}