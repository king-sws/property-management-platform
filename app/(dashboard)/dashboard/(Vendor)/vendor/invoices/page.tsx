
// ============================================
// VENDOR INVOICES PAGE
// app/(dashboard)/dashboard/vendor/invoices/page.tsx
// ============================================
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getInvoices, getInvoiceStatistics } from "@/actions/invoices";
import { Card } from "@/components/ui/card";
import { InvoiceHeader } from "@/components/invoices/invoice-header";
import { InvoiceStatCards } from "@/components/invoices/invoice-stat-cards";
import { InvoiceList } from "@/components/invoices/invoice-list";

export const metadata = {
  title: "My Invoices | Vendor Dashboard",
  description: "Manage your invoices and payments",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function VendorInvoicesPage({ searchParams }: PageProps) {
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
      <InvoiceHeader role="vendor" />
      
      <Suspense fallback={<div className="grid gap-4 md:grid-cols-4"><Card className="p-6 h-32 animate-pulse" /></div>}>
        <InvoiceStatsWrapper />
      </Suspense>
      
      <Suspense fallback={<Card className="p-8 animate-pulse h-96" />}>
        <InvoiceListWrapper
          search={params.search || ""}
          status={params.status}
          page={params.page ? parseInt(params.page) : 1}
        />
      </Suspense>
    </div>
  );
}

async function InvoiceStatsWrapper() {
  const result = await getInvoiceStatistics();
  
  if (!result.success) {
    return null;
  }
  
  return <InvoiceStatCards stats={result.data} role="vendor" />;
}

async function InvoiceListWrapper({
  search,
  status,
  page,
}: {
  search: string;
  status?: string;
  page: number;
}) {
  const result = await getInvoices({
    search,
    status,
    page,
    limit: 10,
  });
  
  if (!result.success) {
    return (
      <Card className="p-4">
        <p className="text-sm text-red-600">{result.error}</p>
      </Card>
    );
  }
  
  return <InvoiceList initialData={result.data} role="vendor" />;
}