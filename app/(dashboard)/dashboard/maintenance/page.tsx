// app/(dashboard)/dashboard/maintenance/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMaintenanceTickets } from "@/actions/maintenance";
import { MaintenanceList } from "@/components/maintenance/maintenance-list";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";

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

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Maintenance
            </Typography>
            <Typography variant="muted">
              Manage maintenance requests and tickets
            </Typography>
          </div>
          <Button asChild>
            <Link href="/dashboard/maintenance/new">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Link>
          </Button>
        </div>

        {/* List */}
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
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
        <p className="text-sm text-red-800">{result.error}</p>
      </div>
    );
  }

  return <MaintenanceList initialData={result.data} />;
}