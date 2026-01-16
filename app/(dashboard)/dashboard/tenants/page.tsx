// app/(dashboard)/dashboard/(landlord)/tenants/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTenants } from "@/actions/tenants";
import { TenantsList } from "@/components/tenants/tenants-list";
import { TenantsCardView } from "@/components/tenants/tenants-card-view";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { ViewToggle } from "@/components/tenants/view-toggle";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Tenants | Property Management",
  description: "Manage your tenants",
};

interface TenantsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TenantsPage({
  searchParams,
}: TenantsPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/sign-in");
  }

  // Await searchParams
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const view = typeof params.view === "string" ? params.view : "card";

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Tenants
            </Typography>
            <Typography variant="muted">
              Manage tenant information, leases, and payments
            </Typography>
          </div>
          
          {/* View Toggle */}
          <ViewToggle currentView={view} />
        </div>

        {/* Tenants List/Cards */}
        <Suspense fallback={<TenantsLoading view={view} />}>
          <TenantsListWrapper 
            search={search} 
            status={status} 
            page={page}
            view={view}
          />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function TenantsListWrapper({
  search,
  status,
  page,
  view,
}: {
  search: string;
  status: string;
  page: number;
  view: string;
}) {
  const result = await getTenants({
    search,
    leaseStatus: status !== "all" ? status : undefined,
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

  return view === "card" ? (
    <TenantsCardView initialData={result.data} />
  ) : (
    <TenantsList initialData={result.data} />
  );
}

function TenantsLoading({ view }: { view: string }) {
  if (view === "card") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-80 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}