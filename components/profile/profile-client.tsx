/* eslint-disable @typescript-eslint/no-explicit-any */
// components/profile/profile-client.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileOverview } from "./profile-overview";
import { ProfileEditor } from "./profile-editor";
import { ActivityLog } from "./activity-log";
import { RoleStats } from "./role-stats";
import { SubscriptionTab } from "./subscription-tab";

interface ProfileClientProps {
  profile: any;
}

export function ProfileClient({ profile }: ProfileClientProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        {profile.roleStats && (
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        )}
        {profile.user.role === "LANDLORD" && (
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <ProfileOverview profile={profile} />
      </TabsContent>

      <TabsContent value="edit" className="space-y-6">
        <ProfileEditor profile={profile.user} />
      </TabsContent>

      <TabsContent value="activity" className="space-y-6">
        <ActivityLog initialActivities={profile.recentActivity} />
      </TabsContent>

      {profile.roleStats && (
        <TabsContent value="stats" className="space-y-6">
          <RoleStats 
            role={profile.user.role} 
            stats={profile.roleStats}
          />
        </TabsContent>
      )}

      {profile.user.role === "LANDLORD" && (
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionTab userRole={profile.user.role} />
        </TabsContent>
      )}
    </Tabs>
  );
}