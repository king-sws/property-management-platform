// app/(dashboard)/dashboard/vendors/page.tsx
// NOTE: This is PLURAL "vendors" - for landlords to manage vendors
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getVendors } from "@/actions/vendors";
import { VendorList } from "@/components/vendors/vendor-list";
import { VendorHeader } from "@/components/vendors/vendor-header";
import { VendorSkeleton } from "@/components/vendors/vendor-skeleton";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
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
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  // Only landlords and admins can access vendor management
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  const params = await searchParams;
  
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || "";
  const category = params.category;
  const isActive = params.isActive === "true" ? true : params.isActive === "false" ? false : undefined;
  
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
          <VendorHeader>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </VendorHeader>
        </div>
        
        <Suspense fallback={<VendorSkeleton />}>
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