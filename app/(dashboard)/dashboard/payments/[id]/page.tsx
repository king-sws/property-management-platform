/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/payments/[id]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPaymentDetails } from "@/actions/payments";
import { PaymentDetailsClient } from "@/components/payments/payment-details-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Payment Details | Property Management",
  description: "View payment details",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// ✅ Comprehensive serialization for payment details
function serializePaymentDetails(payment: any) {
  return {
    ...payment,
    // Payment level Decimals
    amount: payment.amount ? Number(payment.amount) : null,
    fee: payment.fee ? Number(payment.fee) : null,
    netAmount: payment.netAmount ? Number(payment.netAmount) : null,
    
    // Dates
    createdAt: payment.createdAt || null,
    updatedAt: payment.updatedAt || null,
    paidAt: payment.paidAt || null,
    dueDate: payment.dueDate || null,
    periodStart: payment.periodStart || null,
    periodEnd: payment.periodEnd || null,
    failedAt: payment.failedAt || null,
    refundedAt: payment.refundedAt || null,
    
    // Serialize tenant
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
    
    // Serialize lease
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
      
      // Serialize unit
      unit: payment.lease.unit ? {
        ...payment.lease.unit,
        bathrooms: payment.lease.unit.bathrooms ? Number(payment.lease.unit.bathrooms) : null,
        rentAmount: payment.lease.unit.rentAmount ? Number(payment.lease.unit.rentAmount) : null,
        deposit: payment.lease.unit.deposit ? Number(payment.lease.unit.deposit) : null,
        squareFeet: payment.lease.unit.squareFeet || null,
        createdAt: payment.lease.unit.createdAt || null,
        updatedAt: payment.lease.unit.updatedAt || null,
        deletedAt: payment.lease.unit.deletedAt || null,
        
        // Serialize property
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
    
    // Serialize user (who created the payment)
    user: payment.user ? {
      ...payment.user,
      createdAt: payment.user.createdAt || null,
      updatedAt: payment.user.updatedAt || null,
    } : null,
  };
}

export default async function PaymentDetailsPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <Suspense fallback={<PaymentDetailsSkeleton />}>
        <PaymentDetailsContent paymentId={id} />
      </Suspense>
    </div>
  );
}

async function PaymentDetailsContent({ paymentId }: { paymentId: string }) {
  const result = await getPaymentDetails(paymentId);

  if (!result.success) {
    if (result.error === "Payment not found" || result.error === "Unauthorized") {
      notFound();
    }
    
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          {result.error || "Failed to load payment details"}
        </p>
      </div>
    );
  }

  // ✅ Serialize the payment data
  const serializedPayment = serializePaymentDetails(result.data);

  return <PaymentDetailsClient payment={serializedPayment} />;
}

function PaymentDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}