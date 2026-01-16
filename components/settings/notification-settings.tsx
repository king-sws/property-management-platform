/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/settings/notification-settings.tsx
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { updateNotificationSettings } from "@/actions/settings";
import { toast } from "sonner";

interface NotificationSettingsProps {
  notifications: any;
}

const notificationTypes = [
  { id: "RENT_DUE", label: "Rent Due Reminders", description: "Get notified when rent is due" },
  { id: "RENT_OVERDUE", label: "Overdue Rent", description: "Notifications for overdue payments" },
  { id: "LEASE_EXPIRING", label: "Lease Expiring", description: "Alerts before lease expiration" },
  { id: "MAINTENANCE_REQUEST", label: "Maintenance Requests", description: "New maintenance ticket notifications" },
  { id: "MAINTENANCE_COMPLETED", label: "Maintenance Completed", description: "When maintenance work is finished" },
  { id: "PAYMENT_RECEIVED", label: "Payment Received", description: "Confirmation of received payments" },
  { id: "PAYMENT_FAILED", label: "Payment Failed", description: "Failed payment attempts" },
  { id: "MESSAGE", label: "Messages", description: "New message notifications" },
  { id: "APPLICATION_RECEIVED", label: "Applications", description: "New rental applications" },
  { id: "DOCUMENT_UPLOADED", label: "Documents", description: "New document uploads" },
];

export function NotificationSettings({ notifications }: NotificationSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(notifications.emailNotifications);
  const [smsEnabled, setSmsEnabled] = useState(notifications.smsNotifications);
  const [pushEnabled, setPushEnabled] = useState(notifications.pushNotifications);
  const [enabledTypes, setEnabledTypes] = useState<string[]>(notifications.enabledTypes || []);

  const toggleNotificationType = (type: string) => {
    setEnabledTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  async function handleSave() {
    setIsLoading(true);

    try {
      const result = await updateNotificationSettings({
        emailNotifications: emailEnabled,
        smsNotifications: smsEnabled,
        pushNotifications: pushEnabled,
        notificationTypes: enabledTypes,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-4">Notification Channels</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text message alerts
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms"
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive in-app notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="push"
                  checked={pushEnabled}
                  onCheckedChange={setPushEnabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div>
            <h3 className="text-sm font-medium mb-4">Notification Types</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which types of notifications you want to receive
            </p>
            
            <div className="space-y-3">
              {notificationTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={type.id}>{type.label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  <Switch
                    id={type.id}
                    checked={enabledTypes.includes(type.id)}
                    onCheckedChange={() => toggleNotificationType(type.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}