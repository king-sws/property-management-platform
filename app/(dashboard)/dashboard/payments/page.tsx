/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/payments/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPayments, getPaymentStatistics } from "@/actions/payments";
import { LandlordPaymentsClient } from "@/components/payments/landlord-payments-client";
import { TenantPaymentsClient } from "@/components/payments/tenant-payments-client";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Payments | Property Management",
  description: "Manage rental payments and charges",
};

// ✅ Serialization helper for payments
function serializePayment(payment: any) {
  return {
    ...payment,
    // Convert all Decimal fields to numbers
    amount: payment.amount ? Number(payment.amount) : null,
    fee: payment.fee ? Number(payment.fee) : null,
    netAmount: payment.netAmount ? Number(payment.netAmount) : null,
    
    // Convert dates to ISO strings
    createdAt: payment.createdAt || null,
    updatedAt: payment.updatedAt || null,
    paidAt: payment.paidAt || null,
    dueDate: payment.dueDate || null,
    periodStart: payment.periodStart || null,
    periodEnd: payment.periodEnd || null,
    failedAt: payment.failedAt || null,
    refundedAt: payment.refundedAt || null,
    
    // Serialize nested lease if present
    lease: payment.lease ? {
      ...payment.lease,
      rentAmount: payment.lease.rentAmount ? Number(payment.lease.rentAmount) : null,
      deposit: payment.lease.deposit ? Number(payment.lease.deposit) : null,
      lateFeeAmount: payment.lease.lateFeeAmount ? Number(payment.lease.lateFeeAmount) : null,
      startDate: payment.lease.startDate || null,
      endDate: payment.lease.endDate || null,
      createdAt: payment.lease.createdAt || null,
      updatedAt: payment.lease.updatedAt || null,
      deletedAt: payment.lease.deletedAt || null,
      landlordSignedAt: payment.lease.landlordSignedAt || null,
      allTenantsSignedAt: payment.lease.allTenantsSignedAt || null,
      
      // Serialize nested unit
      unit: payment.lease.unit ? {
        ...payment.lease.unit,
        bathrooms: payment.lease.unit.bathrooms ? Number(payment.lease.unit.bathrooms) : null,
        rentAmount: payment.lease.unit.rentAmount ? Number(payment.lease.unit.rentAmount) : null,
        deposit: payment.lease.unit.deposit ? Number(payment.lease.unit.deposit) : null,
        squareFeet: payment.lease.unit.squareFeet || null,
        createdAt: payment.lease.unit.createdAt || null,
        updatedAt: payment.lease.unit.updatedAt || null,
        deletedAt: payment.lease.unit.deletedAt || null,
        
        // Serialize nested property
        property: payment.lease.unit.property ? {
          ...payment.lease.unit.property,
          purchasePrice: payment.lease.unit.property.purchasePrice ? Number(payment.lease.unit.property.purchasePrice) : null,
          currentValue: payment.lease.unit.property.currentValue ? Number(payment.lease.unit.property.currentValue) : null,
          propertyTax: payment.lease.unit.property.propertyTax ? Number(payment.lease.unit.property.propertyTax) : null,
          insurance: payment.lease.unit.property.insurance ? Number(payment.lease.unit.property.insurance) : null,
          hoaFees: payment.lease.unit.property.hoaFees ? Number(payment.lease.unit.property.hoaFees) : null,
          latitude: payment.lease.unit.property.latitude ? Number(payment.lease.unit.property.latitude) : null,
          longitude: payment.lease.unit.property.longitude ? Number(payment.lease.unit.property.longitude) : null,
          lotSize: payment.lease.unit.property.lotSize || null,
          squareFeet: payment.lease.unit.property.squareFeet || null,
          createdAt: payment.lease.unit.property.createdAt || null,
          updatedAt: payment.lease.unit.property.updatedAt || null,
          deletedAt: payment.lease.unit.property.deletedAt || null,
        } : null,
      } : null,
    } : null,
    
    // Serialize nested tenant
    tenant: payment.tenant ? {
      ...payment.tenant,
      annualIncome: payment.tenant.annualIncome ? Number(payment.tenant.annualIncome) : null,
      dateOfBirth: payment.tenant.dateOfBirth || null,
      createdAt: payment.tenant.createdAt || null,
      updatedAt: payment.tenant.updatedAt || null,
      deletedAt: payment.tenant.deletedAt || null,
      
      user: payment.tenant.user ? {
        ...payment.tenant.user,
        createdAt: payment.tenant.user.createdAt || null,
        updatedAt: payment.tenant.user.updatedAt || null,
      } : null,
    } : null,
  };
}

export default async function PaymentsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Payments
            </Typography>
            <Typography variant="muted">
              {session.user.role === "LANDLORD" 
                ? "Manage rental payments and charges"
                : "View and manage your rent payments"
              }
            </Typography>
          </div>
        </div>

        {/* Payments Content */}
        <Suspense fallback={<PaymentsLoading />}>
          <PaymentsContent role={session.user.role} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function PaymentsContent({ role }: { role: string | undefined }) {
  const [paymentsResult, statsResult] = await Promise.all([
    getPayments(),
    getPaymentStatistics(),
  ]);

  if (!paymentsResult.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          {paymentsResult.error || "Failed to load payments"}
        </p>
      </div>
    );
  }

  // ✅ Serialize all payments before passing to client component
  const serializedPayments = (paymentsResult.data?.payments || []).map(serializePayment);

  // ✅ Render appropriate component based on role
  if (role === "TENANT") {
    return (
      <TenantPaymentsClient
        initialPayments={serializedPayments}
        statistics={statsResult.data}
      />
    );
  }

  return (
    <LandlordPaymentsClient
      initialPayments={serializedPayments}
      statistics={statsResult.data}
    />
  );
}

function PaymentsLoading() {
  return (
    <div className="space-y-6">
      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      {/* Actions Card Skeleton */}
      <Skeleton className="h-24" />

      {/* Table Skeleton */}
      <Skeleton className="h-96" />
    </div>
  );
}