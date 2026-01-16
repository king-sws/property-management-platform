// app/(dashboard)/dashboard/vendor/schedule/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAppointments } from "@/actions/schedules";
import { Card } from "@/components/ui/card";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { AppointmentList } from "@/components/schedule/appointment-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "My Schedule | Vendor Dashboard",
  description: "View your scheduled appointments",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}

export default async function VendorSchedulePage({ searchParams }: PageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "VENDOR") {
    redirect("/dashboard");
  }
  
  const params = await searchParams;
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <ScheduleHeader role="vendor" />
      
      <Suspense fallback={<AppointmentListSkeleton />}>
        <AppointmentListWrapper
          search={params.search || ""}
          status={params.status}
          startDate={params.startDate}
          endDate={params.endDate}
          page={params.page ? parseInt(params.page) : 1}
        />
      </Suspense>
    </div>
  );
}

async function AppointmentListWrapper({
  search,
  status,
  startDate,
  endDate,
  page,
}: {
  search: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page: number;
}) {
  const result = await getAppointments({
    search,
    status,
    startDate,
    endDate,
    page,
    limit: 20,
  });
  
  if (!result.success) {
    return (
      <Card className="p-4">
        <p className="text-sm text-red-600">{result.error}</p>
      </Card>
    );
  }
  
  return <AppointmentList initialData={result.data} role="vendor" />;
}

function AppointmentListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
      ))}
    </div>
  );
}