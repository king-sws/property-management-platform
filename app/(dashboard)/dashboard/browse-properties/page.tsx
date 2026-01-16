// app/(dashboard)/dashboard/browse-properties/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Container, Stack } from "@/components/ui/container";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyBrowseClient from "@/components/properties/property-browse-client";

export default async function BrowsePropertiesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "TENANT") {
    redirect("/sign-in");
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Typography variant="h2">Find Your Next Home</Typography>
          <Typography variant="muted">
            Browse available properties and units in your area
          </Typography>
        </div>

        {/* Main Content */}
        <Suspense fallback={<BrowsePropertiesLoading />}>
          <PropertyBrowseClient />
        </Suspense>
      </Stack>
    </Container>
  );
}

function BrowsePropertiesLoading() {
  return (
    <div className="space-y-6">
      {/* Filters skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}