// app/(dashboard)/dashboard/vendors/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getVendors } from "@/actions/vendors";
import { VendorList } from "@/components/vendors/vendor-list";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Vendors | Property Management",
  description: "Manage vendors and service providers",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    isActive?: string;
    page?: string;
  }>;
}

export default async function VendorsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || "";
  const category = params.category;
  const isActive =
    params.isActive === "true" ? true
    : params.isActive === "false" ? false
    : undefined;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Vendors
            </Typography>
            <Typography variant="muted">
              Manage your service providers and vendors
            </Typography>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/vendors/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Link>
          </Button>
        </div>

        <Suspense fallback={
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        }>
          <VendorListWrapper
            search={search}
            category={category}
            isActive={isActive}
            page={page}
          />
        </Suspense>

      </Stack>
    </Container>
  );
}

async function VendorListWrapper({
  search,
  category,
  isActive,
  page,
}: {
  search: string;
  category?: string;
  isActive?: boolean;
  page: number;
}) {
  const result = await getVendors({
    search,
    category,
    isActive,
    page,
    limit: 12,
  });

  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{result.error}</p>
      </div>
    );
  }

  return <VendorList initialData={result.data} />;
}