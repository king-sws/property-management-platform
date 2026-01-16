/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/(landlord)/leases/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getLeaseById } from "@/actions/leases";
import { auth } from "@/auth";
import { LeaseForm } from "@/components/leases/lease-form";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Edit Lease | Property Management",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Comprehensive serializer for lease data
function serializeLeaseData(lease: any) {
  if (!lease) return null;

  return {
    ...lease,
    // Lease decimal fields
    rentAmount: lease.rentAmount ? Number(lease.rentAmount) : null,
    deposit: lease.deposit ? Number(lease.deposit) : null,
    lateFeeAmount: lease.lateFeeAmount ? Number(lease.lateFeeAmount) : null,
    
    // Lease date fields
    startDate: lease.startDate?.toISOString() || null,
    endDate: lease.endDate?.toISOString() || null,
    createdAt: lease.createdAt?.toISOString() || null,
    updatedAt: lease.updatedAt?.toISOString() || null,
    deletedAt: lease.deletedAt?.toISOString() || null,
    landlordSignedAt: lease.landlordSignedAt?.toISOString() || null,
    allTenantsSignedAt: lease.allTenantsSignedAt?.toISOString() || null,
    
    // Unit data
    unit: lease.unit ? {
      ...lease.unit,
      bathrooms: lease.unit.bathrooms ? Number(lease.unit.bathrooms) : null,
      squareFeet: lease.unit.squareFeet ? Number(lease.unit.squareFeet) : null,
      rentAmount: lease.unit.rentAmount ? Number(lease.unit.rentAmount) : null,
      deposit: lease.unit.deposit ? Number(lease.unit.deposit) : null,
      createdAt: lease.unit.createdAt?.toISOString() || null,
      updatedAt: lease.unit.updatedAt?.toISOString() || null,
      deletedAt: lease.unit.deletedAt?.toISOString() || null,
      
      // Property data
      property: lease.unit.property ? {
        ...lease.unit.property,
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
        
        // Landlord data (if present)
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
    
    // Tenants data
    tenants: lease.tenants ? lease.tenants.map((lt: any) => ({
      ...lt,
      createdAt: lt.createdAt?.toISOString() || null,
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
    
    // Payments data
    payments: lease.payments ? lease.payments.map((payment: any) => ({
      ...payment,
      amount: payment.amount ? Number(payment.amount) : null,
      lateFee: payment.lateFee ? Number(payment.lateFee) : null,
      dueDate: payment.dueDate?.toISOString() || null,
      paidAt: payment.paidAt?.toISOString() || null,
      createdAt: payment.createdAt?.toISOString() || null,
      updatedAt: payment.updatedAt?.toISOString() || null,
    })) : [],
    
    // Violations data
    violations: lease.violations ? lease.violations.map((violation: any) => ({
      ...violation,
      fineAmount: violation.fineAmount ? Number(violation.fineAmount) : null,
      issuedDate: violation.issuedDate?.toISOString() || null,
      resolvedDate: violation.resolvedDate?.toISOString() || null,
      createdAt: violation.createdAt?.toISOString() || null,
      updatedAt: violation.updatedAt?.toISOString() || null,
    })) : [],
    
    // Renewal offers data
    renewalOffers: lease.renewalOffers ? lease.renewalOffers.map((offer: any) => ({
      ...offer,
      proposedRent: offer.proposedRent ? Number(offer.proposedRent) : null,
      proposedDeposit: offer.proposedDeposit ? Number(offer.proposedDeposit) : null,
      proposedStartDate: offer.proposedStartDate?.toISOString() || null,
      proposedEndDate: offer.proposedEndDate?.toISOString() || null,
      expiresAt: offer.expiresAt?.toISOString() || null,
      respondedAt: offer.respondedAt?.toISOString() || null,
      createdAt: offer.createdAt?.toISOString() || null,
      updatedAt: offer.updatedAt?.toISOString() || null,
    })) : [],
    
    // Deposit deductions data
    depositDeductions: lease.depositDeductions ? lease.depositDeductions.map((deduction: any) => ({
      ...deduction,
      amount: deduction.amount ? Number(deduction.amount) : null,
      createdAt: deduction.createdAt?.toISOString() || null,
      updatedAt: deduction.updatedAt?.toISOString() || null,
    })) : [],
  };
}

export default async function EditLeasePage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  // Await params (Next.js 15+ requirement)
  const { id } = await params;
  
  const result = await getLeaseById(id);
  
  if (!result.success) {
    notFound();
  }
  
  // Serialize the lease data before passing to client component
  const serializedLease = serializeLeaseData(result.data);
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Lease</h1>
          <p className="text-muted-foreground">
            Update lease terms and conditions
          </p>
        </div>
      </div>
      
      <LeaseForm lease={serializedLease} isEdit />
    </div>
  );
}