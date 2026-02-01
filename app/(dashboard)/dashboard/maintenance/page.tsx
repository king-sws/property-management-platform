// app/(dashboard)/dashboard/maintenance/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMaintenanceTickets } from "@/actions/maintenance";
import { MaintenanceList } from "@/components/maintenance/maintenance-list";
import { MaintenanceHeader } from "@/components/maintenance/maintenance-header";
import { MaintenanceSkeleton } from "@/components/maintenance/maintenance-skeleton";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "Maintenance | Property Management",
  description: "Manage maintenance requests and tickets",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    propertyId?: string;
    page?: string;
  }>;
}

export default async function MaintenancePage({ searchParams }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  const params = await searchParams;
  
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || "";
  const status = params.status;
  const priority = params.priority;
  const category = params.category;
  const propertyId = params.propertyId;
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <MaintenanceHeader />
        
        <Suspense fallback={<MaintenanceSkeleton />}>
          <MaintenanceListWrapper
            search={search}
            status={status}
            priority={priority}
            category={category}
            propertyId={propertyId}
            page={page}
          />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function MaintenanceListWrapper({
  search,
  status,
  priority,
  category,
  propertyId,
  page,
}: {
  search: string;
  status?: string;
  priority?: string;
  category?: string;
  propertyId?: string;
  page: number;
}) {
  const result = await getMaintenanceTickets({
    search,
    status,
    priority,
    category,
    propertyId,
    page,
    limit: 10,
  });
  
  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <Typography variant="muted" className="text-sm text-red-800">
          {result.error}
        </Typography>
      </div>
    );
  }
  
  return <MaintenanceList initialData={result.data} />;
}