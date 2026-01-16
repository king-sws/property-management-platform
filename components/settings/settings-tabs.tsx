/* eslint-disable @typescript-eslint/no-explicit-any */
// components/settings/settings-tabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "./profile-settings";
import { SecuritySettings } from "./security-settings";
import { NotificationSettings } from "./notification-settings";
import { RoleSettings } from "./role-settings";
import { User, Shield, Bell, Briefcase } from "lucide-react";

interface SettingsTabsProps {
  settings: any;
  userRole: string | undefined;
}

export function SettingsTabs({ settings, userRole }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="role" className="gap-2">
          <Briefcase className="h-4 w-4" />
          {userRole === "LANDLORD" ? "Business" : userRole === "TENANT" ? "Personal" : "Business"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings profile={settings.profile} />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettings notifications={settings.notifications} />
      </TabsContent>

      <TabsContent value="role">
        <RoleSettings
          userRole={userRole}
          landlordSettings={settings.landlordSettings}
          tenantSettings={settings.tenantSettings}
          vendorSettings={settings.vendorSettings}
        />
      </TabsContent>
    </Tabs>
  );
}