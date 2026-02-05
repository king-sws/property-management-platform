/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/payments/pay/[id]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPaymentDetails } from "@/actions/payments";
import { PaymentCheckoutClient } from "@/components/payments/payment-checkout-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "Pay Rent | Property Management",
  description: "Complete your rent payment",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Serialization helper
function serializePaymentForCheckout(payment: any) {
  return {
    ...payment,
    amount: payment.amount ? Number(payment.amount) : null,
    fee: payment.fee ? Number(payment.fee) : null,
    netAmount: payment.netAmount ? Number(payment.netAmount) : null,
    createdAt: payment.createdAt || null,
    updatedAt: payment.updatedAt || null,
    paidAt: payment.paidAt || null,
    dueDate: payment.dueDate || null,
    periodStart: payment.periodStart || null,
    periodEnd: payment.periodEnd || null,
    
    lease: payment.lease ? {
      ...payment.lease,
      rentAmount: payment.lease.rentAmount ? Number(payment.lease.rentAmount) : null,
      deposit: payment.lease.deposit ? Number(payment.lease.deposit) : null,
      startDate: payment.lease.startDate || null,
      endDate: payment.lease.endDate || null,
      
      unit: payment.lease.unit ? {
        ...payment.lease.unit,
        rentAmount: payment.lease.unit.rentAmount ? Number(payment.lease.unit.rentAmount) : null,
        
        property: payment.lease.unit.property ? {
          ...payment.lease.unit.property,
          landlord: payment.lease.unit.property.landlord ? {
            ...payment.lease.unit.property.landlord,
            user: payment.lease.unit.property.landlord.user || null,
          } : null,
        } : null,
      } : null,
    } : null,
  };
}

export default async function PaymentPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "TENANT") {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <Container padding="lg" size="md">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-2">
            Complete Payment
          </Typography>
          <Typography variant="muted">
            Choose your payment method and complete your payment
          </Typography>
        </div>

        <Suspense fallback={<PaymentCheckoutSkeleton />}>
          <PaymentCheckoutContent paymentId={id} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function PaymentCheckoutContent({ paymentId }: { paymentId: string }) {
  const result = await getPaymentDetails(paymentId);

  if (!result.success) {
    if (result.error === "Payment not found" || result.error === "Unauthorized") {
      notFound();
    }
    
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
        <p className="text-sm text-red-800 dark:text-red-300">
          {result.error || "Failed to load payment details"}
        </p>
      </div>
    );
  }

  const serializedPayment = serializePaymentForCheckout(result.data);

  return <PaymentCheckoutClient payment={serializedPayment} />;
}

function PaymentCheckoutSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48" />
      <Skeleton className="h-96" />
    </div>
  );
}