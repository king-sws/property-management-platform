/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/(landlord)/leases/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLeases } from "@/actions/leases";
import { LeasesList } from "@/components/leases/leases-list";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export const metadata = {
  title: "Leases | Property Management",
  description: "Manage your rental leases",
};

interface LeasesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Utility function to serialize lease data
function serializeLease(lease: any) {
  return {
    ...lease,
    rentAmount: lease.rentAmount ? Number(lease.rentAmount) : null,
    deposit: lease.deposit ? Number(lease.deposit) : null,
    lateFeeAmount: lease.lateFeeAmount ? Number(lease.lateFeeAmount) : null,
    startDate: lease.startDate ? new Date(lease.startDate).toISOString() : null,
    endDate: lease.endDate ? new Date(lease.endDate).toISOString() : null,
    createdAt: lease.createdAt ? new Date(lease.createdAt).toISOString() : null,
    updatedAt: lease.updatedAt ? new Date(lease.updatedAt).toISOString() : null,
    deletedAt: lease.deletedAt ? new Date(lease.deletedAt).toISOString() : null,
    landlordSignedAt: lease.landlordSignedAt ? new Date(lease.landlordSignedAt).toISOString() : null,
    allTenantsSignedAt: lease.allTenantsSignedAt ? new Date(lease.allTenantsSignedAt).toISOString() : null,
    unit: lease.unit ? {
      ...lease.unit,
      bathrooms: lease.unit.bathrooms ? Number(lease.unit.bathrooms) : null,
      squareFeet: lease.unit.squareFeet ? Number(lease.unit.squareFeet) : null,
      rentAmount: lease.unit.rentAmount ? Number(lease.unit.rentAmount) : null,
      deposit: lease.unit.deposit ? Number(lease.unit.deposit) : null,
      createdAt: lease.unit.createdAt ? new Date(lease.unit.createdAt).toISOString() : null,
      updatedAt: lease.unit.updatedAt ? new Date(lease.unit.updatedAt).toISOString() : null,
      deletedAt: lease.unit.deletedAt ? new Date(lease.unit.deletedAt).toISOString() : null,
      property: lease.unit.property ? {
        ...lease.unit.property,
        createdAt: lease.unit.property.createdAt ? new Date(lease.unit.property.createdAt).toISOString() : null,
        updatedAt: lease.unit.property.updatedAt ? new Date(lease.unit.property.updatedAt).toISOString() : null,
      } : null,
    } : null,
    tenants: lease.tenants ? lease.tenants.map((lt: any) => ({
      ...lt,
      createdAt: lt.createdAt ? new Date(lt.createdAt).toISOString() : null,
      tenant: lt.tenant ? {
        ...lt.tenant,
        annualIncome: lt.tenant.annualIncome ? Number(lt.tenant.annualIncome) : null,
        dateOfBirth: lt.tenant.dateOfBirth ? new Date(lt.tenant.dateOfBirth).toISOString() : null,
        createdAt: lt.tenant.createdAt ? new Date(lt.tenant.createdAt).toISOString() : null,
        updatedAt: lt.tenant.updatedAt ? new Date(lt.tenant.updatedAt).toISOString() : null,
        deletedAt: lt.tenant.deletedAt ? new Date(lt.tenant.deletedAt).toISOString() : null,
        user: lt.tenant.user ? {
          ...lt.tenant.user,
          createdAt: lt.tenant.user.createdAt ? new Date(lt.tenant.user.createdAt).toISOString() : null,
          updatedAt: lt.tenant.user.updatedAt ? new Date(lt.tenant.user.updatedAt).toISOString() : null,
        } : null,
      } : null,
    })) : [],
    payments: lease.payments ? lease.payments.map((payment: any) => ({
      ...payment,
      amount: payment.amount ? Number(payment.amount) : null,
      lateFee: payment.lateFee ? Number(payment.lateFee) : null,
      dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString() : null,
      paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString() : null,
      createdAt: payment.createdAt ? new Date(payment.createdAt).toISOString() : null,
      updatedAt: payment.updatedAt ? new Date(payment.updatedAt).toISOString() : null,
    })) : [],
  };
}

export default async function LeasesPage({
  searchParams,
}: LeasesPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Leases
            </Typography>
            <Typography variant="muted">
              Manage your rental leases and agreements
            </Typography>
          </div>
        </div>


        {/* Leases List */}
        <Suspense fallback={<LeasesLoading />}>
          <LeasesListWrapper 
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

async function LeasesListWrapper({
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
  const result = await getLeases({
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

  // Serialize the data before passing to client component
  const serializedData = {
    ...result.data,
    leases: result.data.leases.map(serializeLease),
  };

  return <LeasesList initialData={serializedData} />;
}

function LeasesLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}