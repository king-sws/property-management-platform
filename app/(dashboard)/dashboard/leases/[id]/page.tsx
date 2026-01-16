/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/leases/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLeaseById, getLeaseStatistics } from "@/actions/leases";
import { LeaseDetails } from "@/components/leases/lease-details";

export const metadata = {
  title: "Lease Details | Property Management",
  description: "View and manage lease details",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// ✅ ADD THIS: Serialization function (matches the one in actions/leases.ts)
function serializeLease(lease: any) {
  return {
    ...lease,
    // Lease-level Decimals
    rentAmount: lease.rentAmount ? Number(lease.rentAmount) : null,
    deposit: lease.deposit ? Number(lease.deposit) : null,
    lateFeeAmount: lease.lateFeeAmount ? Number(lease.lateFeeAmount) : null,
    
    // Dates
    startDate: lease.startDate?.toISOString() || null,
    endDate: lease.endDate?.toISOString() || null,
    createdAt: lease.createdAt?.toISOString() || null,
    updatedAt: lease.updatedAt?.toISOString() || null,
    deletedAt: lease.deletedAt?.toISOString() || null,
    landlordSignedAt: lease.landlordSignedAt?.toISOString() || null,
    allTenantsSignedAt: lease.allTenantsSignedAt?.toISOString() || null,
    
    // Unit with nested property
    unit: lease.unit ? {
      ...lease.unit,
      // Unit-level Decimals
      bathrooms: lease.unit.bathrooms ? Number(lease.unit.bathrooms) : null,
      squareFeet: lease.unit.squareFeet ? Number(lease.unit.squareFeet) : null,
      rentAmount: lease.unit.rentAmount ? Number(lease.unit.rentAmount) : null,
      deposit: lease.unit.deposit ? Number(lease.unit.deposit) : null,
      
      createdAt: lease.unit.createdAt?.toISOString() || null,
      updatedAt: lease.unit.updatedAt?.toISOString() || null,
      deletedAt: lease.unit.deletedAt?.toISOString() || null,
      
      // Property with ALL Decimal fields converted
      property: lease.unit.property ? {
        ...lease.unit.property,
        // Property-level Decimals
        purchasePrice: lease.unit.property.purchasePrice ? Number(lease.unit.property.purchasePrice) : null,
        currentValue: lease.unit.property.currentValue ? Number(lease.unit.property.currentValue) : null,
        propertyTax: lease.unit.property.propertyTax ? Number(lease.unit.property.propertyTax) : null,
        insurance: lease.unit.property.insurance ? Number(lease.unit.property.insurance) : null,
        hoaFees: lease.unit.property.hoaFees ? Number(lease.unit.property.hoaFees) : null,
        latitude: lease.unit.property.latitude ? Number(lease.unit.property.latitude) : null,
        longitude: lease.unit.property.longitude ? Number(lease.unit.property.longitude) : null,
        squareFeet: lease.unit.property.squareFeet ? Number(lease.unit.property.squareFeet) : null,
        lotSize: lease.unit.property.lotSize ? Number(lease.unit.property.lotSize) : null,
        
        createdAt: lease.unit.property.createdAt?.toISOString() || null,
        updatedAt: lease.unit.property.updatedAt?.toISOString() || null,
        deletedAt: lease.unit.property.deletedAt?.toISOString() || null,
        
        // Serialize nested landlord
        landlord: lease.unit.property.landlord ? {
          ...lease.unit.property.landlord,
          createdAt: lease.unit.property.landlord.createdAt?.toISOString() || null,
          updatedAt: lease.unit.property.landlord.updatedAt?.toISOString() || null,
          deletedAt: lease.unit.property.landlord.deletedAt?.toISOString() || null,
          user: lease.unit.property.landlord.user ? {
            ...lease.unit.property.landlord.user,
            createdAt: lease.unit.property.landlord.user.createdAt?.toISOString() || null,
            updatedAt: lease.unit.property.landlord.user.updatedAt?.toISOString() || null,
          } : null,
        } : null,
      } : null,
    } : null,
    
    // Tenants array
    tenants: lease.tenants ? lease.tenants.map((lt: any) => ({
      ...lt,
      createdAt: lt.createdAt?.toISOString() || null,
      signedAt: lt.signedAt?.toISOString() || null,
      tenant: lt.tenant ? {
        ...lt.tenant,
        annualIncome: lt.tenant.annualIncome ? Number(lt.tenant.annualIncome) : null,
        dateOfBirth: lt.tenant.dateOfBirth?.toISOString() || null,
        createdAt: lt.tenant.createdAt?.toISOString() || null,
        updatedAt: lt.tenant.updatedAt?.toISOString() || null,
        deletedAt: lt.tenant.deletedAt?.toISOString() || null,
        user: lt.tenant.user ? {
          ...lt.tenant.user,
          createdAt: lt.tenant.user.createdAt?.toISOString() || null,
          updatedAt: lt.tenant.user.updatedAt?.toISOString() || null,
        } : null,
      } : null,
    })) : [],
    
    // Payments array
    payments: lease.payments ? lease.payments.map((payment: any) => ({
      ...payment,
      amount: payment.amount ? Number(payment.amount) : null,
      lateFee: payment.lateFee ? Number(payment.lateFee) : null,
      dueDate: payment.dueDate?.toISOString() || null,
      paidAt: payment.paidAt?.toISOString() || null,
      createdAt: payment.createdAt?.toISOString() || null,
      updatedAt: payment.updatedAt?.toISOString() || null,
    })) : [],
    
    // Violations array
    violations: lease.violations ? lease.violations.map((violation: any) => ({
      ...violation,
      issuedDate: violation.issuedDate?.toISOString() || null,
      resolvedDate: violation.resolvedDate?.toISOString() || null,
      createdAt: violation.createdAt?.toISOString() || null,
      updatedAt: violation.updatedAt?.toISOString() || null,
    })) : [],
    
    // Renewal offers array
    renewalOffers: lease.renewalOffers ? lease.renewalOffers.map((offer: any) => ({
      ...offer,
      newRentAmount: offer.newRentAmount ? Number(offer.newRentAmount) : null,
      newDeposit: offer.newDeposit ? Number(offer.newDeposit) : null,
      offeredAt: offer.offeredAt?.toISOString() || null,
      expiresAt: offer.expiresAt?.toISOString() || null,
      respondedAt: offer.respondedAt?.toISOString() || null,
      createdAt: offer.createdAt?.toISOString() || null,
      updatedAt: offer.updatedAt?.toISOString() || null,
    })) : [],
    
    // Deposit deductions array
    depositDeductions: lease.depositDeductions ? lease.depositDeductions.map((deduction: any) => ({
      ...deduction,
      amount: deduction.amount ? Number(deduction.amount) : null,
      createdAt: deduction.createdAt?.toISOString() || null,
    })) : [],
  };
}

export default async function LeaseDetailsPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  const { id } = await params;
  
  const [leaseResult, statsResult] = await Promise.all([
    getLeaseById(id),
    getLeaseStatistics(id),
  ]);
  
  if (!leaseResult.success || !leaseResult.data) {
    notFound();
  }
  
  // ✅ CRITICAL FIX: Serialize the lease data before passing to client component
  const serializedLease = serializeLease(leaseResult.data);
  
  // Determine if current user is landlord
  const isLandlord = session.user.role === "LANDLORD" || session.user.role === "ADMIN";
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <LeaseDetails
        lease={serializedLease}
        statistics={statsResult.success ? statsResult.data : null}
        isLandlord={isLandlord}
      />
    </div>
  );
}