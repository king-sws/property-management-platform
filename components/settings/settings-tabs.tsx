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
      <TabsList className="w-full h-auto p-1 bg-transparent gap-2 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-start">
        <TabsTrigger 
          value="profile" 
          className="flex-1 min-w-[140px] sm:min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-all gap-2"
        >
          <User className="h-4 w-4" />
          <span className="hidden xs:inline">Profile</span>
          <span className="xs:hidden">Profile</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="security" 
          className="flex-1 min-w-[140px] sm:min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-all gap-2"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden xs:inline">Security</span>
          <span className="xs:hidden">Security</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="notifications" 
          className="flex-1 min-w-[140px] sm:min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-all gap-2"
        >
          <Bell className="h-4 w-4" />
          <span className="hidden xs:inline">Notifications</span>
          <span className="xs:hidden">Notifs</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="role" 
          className="flex-1 min-w-[140px] sm:min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-all gap-2"
        >
          <Briefcase className="h-4 w-4" />
          <span className="hidden xs:inline">
            {userRole === "LANDLORD" ? "Business" : userRole === "TENANT" ? "Personal" : "Business"}
          </span>
          <span className="xs:hidden">
            {userRole === "LANDLORD" ? "Business" : userRole === "TENANT" ? "Personal" : "Business"}
          </span>
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