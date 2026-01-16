// app/(dashboard)/dashboard/invoices/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getInvoices, getInvoiceStatistics } from "@/actions/invoices";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceStatCards } from "@/components/invoices/invoice-stat-cards";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Invoices | Property Management",
  description: "Review and approve vendor invoices",
};

interface InvoicesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InvoicesPage({
  searchParams,
}: InvoicesPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // FIXED: Await searchParams
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const vendorId = typeof params.vendorId === "string" ? params.vendorId : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Invoices
            </Typography>
            <Typography variant="muted">
              Review and approve vendor invoices
            </Typography>
          </div>
        </div>

        {/* Statistics */}
        <Suspense fallback={<StatsLoading />}>
          <InvoiceStatsWrapper />
        </Suspense>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-10"
              defaultValue={search}
            />
          </div>
          <Select defaultValue={status}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoice List */}
        <Suspense fallback={<InvoicesLoading />}>
          <InvoiceListWrapper
            search={search}
            status={status}
            vendorId={vendorId}
            page={page}
          />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function InvoiceStatsWrapper() {
  const result = await getInvoiceStatistics();

  if (!result.success) {
    return null;
  }

  return <InvoiceStatCards stats={result.data} role="landlord" />;
}

async function InvoiceListWrapper({
  search,
  status,
  vendorId,
  page,
}: {
  search: string;
  status: string;
  vendorId?: string;
  page: number;
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

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function InvoicesLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}