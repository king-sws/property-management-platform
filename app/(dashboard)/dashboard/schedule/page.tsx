// app/(dashboard)/dashboard/schedule/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAppointments } from "@/actions/schedules";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { AppointmentList } from "@/components/schedule/appointment-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Schedule | Property Management",
  description: "Manage maintenance appointments",
};

interface SchedulePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-in");
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const search   = typeof params.search   === "string" ? params.search   : undefined;
  const status   = typeof params.status   === "string" ? params.status   : undefined;
  const vendorId = typeof params.vendorId === "string" ? params.vendorId : undefined;
  const startDate = typeof params.startDate === "string" ? params.startDate : undefined;
  const endDate   = typeof params.endDate   === "string" ? params.endDate   : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">

        {/* Header */}
        <div>
          <Typography variant="h2" className="mb-1">
            Schedule
          </Typography>
          <Typography variant="muted">
            Manage maintenance appointments
          </Typography>
        </div>

        {/* List */}
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
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
  search, status, vendorId, startDate, endDate, page,
}: {
  search?: string;
  status?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
}) {
  const result = await getAppointments({
    search, status, vendorId, startDate, endDate,
    page, limit: 20,
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