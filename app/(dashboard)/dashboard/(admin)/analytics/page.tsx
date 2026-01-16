// app/(dashboard)/dashboard/(admin)/analytics/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAnalyticsOverview,
  getUserGrowthData,
  getRevenueData,
  getPropertyData,
  getMaintenanceData,
  getTopPerformers,
} from "@/actions/admin/analytics";
import { AnalyticsOverview } from "@/components/admin/analytics/analytics-overview";
import { UserGrowthChart } from "@/components/admin/analytics/user-growth-chart";
import { RevenueChart } from "@/components/admin/analytics/revenue-chart";
import { PropertyDistribution } from "@/components/admin/analytics/property-distribution";
import { MaintenanceMetrics } from "@/components/admin/analytics/maintenance-metrics";
import { TopPerformersSection } from "@/components/admin/analytics/top-performers";
import { DateRangeSelector } from "@/components/admin/analytics/date-range-selector";

interface AnalyticsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const range = typeof params.range === "string" ? params.range : "30days";

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Analytics Dashboard
            </Typography>
            <Typography variant="muted">
              Track platform performance and key metrics
            </Typography>
          </div>
          <DateRangeSelector currentRange={range} />
        </div>

        {/* Overview Cards */}
        <Suspense fallback={<OverviewLoading />}>
          <AnalyticsOverviewSection range={range} />
        </Suspense>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Growth */}
          <Suspense fallback={<ChartLoading />}>
            <UserGrowthSection range={range} />
          </Suspense>

          {/* Revenue */}
          <Suspense fallback={<ChartLoading />}>
            <RevenueSection range={range} />
          </Suspense>

          {/* Property Distribution */}
          <Suspense fallback={<ChartLoading />}>
            <PropertySection range={range} />
          </Suspense>

          {/* Maintenance Metrics */}
          <Suspense fallback={<ChartLoading />}>
            <MaintenanceSection range={range} />
          </Suspense>
        </div>

        {/* Top Performers */}
        <Suspense fallback={<TopPerformersLoading />}>
          <TopPerformersTableSection range={range} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function AnalyticsOverviewSection({ range }: { range: string }) {
  const data = await getAnalyticsOverview(range);
  return <AnalyticsOverview data={data} />;
}

async function UserGrowthSection({ range }: { range: string }) {
  const data = await getUserGrowthData(range);
  return <UserGrowthChart data={data} />;
}

async function RevenueSection({ range }: { range: string }) {
  const data = await getRevenueData(range);
  return <RevenueChart data={data} />;
}

async function PropertySection({ range }: { range: string }) {
  const data = await getPropertyData(range);
  return <PropertyDistribution data={data} />;
}

async function MaintenanceSection({ range }: { range: string }) {
  const data = await getMaintenanceData(range);
  return <MaintenanceMetrics data={data} />;
}

async function TopPerformersTableSection({ range }: { range: string }) {
  const data = await getTopPerformers(range);
  return <TopPerformersSection data={data} />;
}

function OverviewLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}

function ChartLoading() {
  return <Skeleton className="h-96 w-full rounded-lg" />;
}

function TopPerformersLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}