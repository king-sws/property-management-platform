// app/(dashboard)/dashboard/(admin)/system/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSystemStats,
  getSystemSettings,
  getRecentActivity,
  getDatabaseStats,
} from "@/actions/admin/system";
import { SystemStatsCards } from "@/components/admin/system/system-stats-cards";
import { SystemSettings } from "@/components/admin/system/system-settings";
import { RecentActivityLog } from "@/components/admin/system/recent-activity";
import { DatabaseStats } from "@/components/admin/system/database-stats";
import { SystemActions } from "@/components/admin/system/system-actions";

export default async function SystemPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              System Management
            </Typography>
            <Typography variant="muted">
              Monitor system health, configure settings, and manage platform operations
            </Typography>
          </div>
        </div>

        {/* System Stats */}
        <Suspense fallback={<StatsLoading />}>
          <SystemStatsSection />
        </Suspense>

        {/* System Actions */}
        <SystemActions />

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Database Stats */}
          <Suspense fallback={<CardLoading />}>
            <DatabaseStatsSection />
          </Suspense>

          {/* System Settings */}
          <Suspense fallback={<CardLoading />}>
            <SystemSettingsSection />
          </Suspense>
        </div>

        {/* Recent Activity */}
        <Suspense fallback={<CardLoading />}>
          <RecentActivitySection />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function SystemStatsSection() {
  const data = await getSystemStats();
  return <SystemStatsCards data={data} />;
}

async function DatabaseStatsSection() {
  const data = await getDatabaseStats();
  return <DatabaseStats data={data} />;
}

async function SystemSettingsSection() {
  const data = await getSystemSettings();
  return <SystemSettings data={data} />;
}

async function RecentActivitySection() {
  const data = await getRecentActivity();
  return <RecentActivityLog data={data} />;
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}

function CardLoading() {
  return <Skeleton className="h-96 w-full rounded-lg" />;
}