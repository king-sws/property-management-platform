// app/(dashboard)/dashboard/invoices/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getInvoices, getInvoiceStatistics } from "@/actions/invoices";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { InvoiceStatCards } from "@/components/invoices/invoice-stat-cards";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Invoices | Property Management",
  description: "Review and approve vendor invoices",
};

interface InvoicesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-in");
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const search   = typeof params.search   === "string" ? params.search   : "";
  const status   = typeof params.status   === "string" ? params.status   : "all";
  const vendorId = typeof params.vendorId === "string" ? params.vendorId : undefined;
  const page     = typeof params.page     === "string" ? parseInt(params.page) : 1;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">

        {/* Header */}
        <div>
          <Typography variant="h2" className="mb-1">Invoices</Typography>
          <Typography variant="muted">Review and approve vendor invoices</Typography>
        </div>

        {/* Stats */}
        <Suspense fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        }>
          <InvoiceStatsWrapper />
        </Suspense>

        {/* List */}
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
          <InvoiceListWrapper search={search} status={status} vendorId={vendorId} page={page} />
        </Suspense>

      </Stack>
    </Container>
  );
}

async function InvoiceStatsWrapper() {
  const result = await getInvoiceStatistics();
  if (!result.success) return null;
  return <InvoiceStatCards stats={result.data} role="landlord" />;
}

async function InvoiceListWrapper({
  search, status, vendorId, page,
}: {
  search: string; status: string; vendorId?: string; page: number;
}) {
  const result = await getInvoices({
    search,
    status: status !== "all" ? status : undefined,
    vendorId,
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

  return <InvoiceList initialData={result.data} role="landlord" />;
}