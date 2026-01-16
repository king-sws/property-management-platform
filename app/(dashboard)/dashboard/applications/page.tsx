// app/(dashboard)/dashboard/applications/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApplications } from "@/actions/applications";
import { ApplicationsList } from "@/components/applications/applications-list";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationsHeader } from "@/components/applications/applications-header";

export const metadata = {
  title: "Applications | Property Management",
  description: "Manage rental applications",
};

interface ApplicationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const session = await auth();

    if (!session?.user) {
    redirect("/sign-in");
  }

  // FIXED: Await searchParams
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const propertyId = typeof params.propertyId === "string" ? params.propertyId : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <ApplicationsHeader />


        {/* Applications List */}
        <Suspense fallback={<ApplicationsLoading />}>
          <ApplicationsListWrapper
            search={search}
            status={status}
            propertyId={propertyId}
            page={page}
          />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function ApplicationsListWrapper({
  search,
  status,
  propertyId,
  page,
}: {
  search: string;
  status: string;
  propertyId?: string;
  page: number;
}) {
  const result = await getApplications({
    search,
    status: status !== "all" ? status : undefined,
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

  return <ApplicationsList initialData={result.data} />;
}

function ApplicationsLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}