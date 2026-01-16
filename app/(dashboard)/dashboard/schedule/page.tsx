// app/(dashboard)/dashboard/schedule/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAppointments } from "@/actions/schedules";
import { Container, Stack } from "@/components/ui/container";
import { AppointmentList } from "@/components/schedule/appointment-list";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Schedule | Property Management",
  description: "Manage maintenance appointments",
};

interface SchedulePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SchedulePage({
  searchParams,
}: SchedulePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // FIXED: Await searchParams
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const vendorId = typeof params.vendorId === "string" ? params.vendorId : undefined;
  const startDate = typeof params.startDate === "string" ? params.startDate : undefined;
  const endDate = typeof params.endDate === "string" ? params.endDate : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <ScheduleHeader role="landlord" />

        {/* Appointments List */}
        <Suspense fallback={<ScheduleLoading />}>
          <AppointmentListWrapper
            search={search}
            status={status}
            vendorId={vendorId}
            startDate={startDate}
            endDate={endDate}
            page={page}
          />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function AppointmentListWrapper({
  search,
  status,
  vendorId,
  startDate,
  endDate,
  page,
}: {
  search?: string;
  status?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
}) {
  const result = await getAppointments({
    search,
    status,
    vendorId,
    startDate,
    endDate,
    page,
    limit: 20,
  });

  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          {result.error || "Failed to load appointments"}
        </p>
      </div>
    );
  }

  return <AppointmentList initialData={result.data} role="landlord" />;
}

function ScheduleLoading() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-45" />
        </div>
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}