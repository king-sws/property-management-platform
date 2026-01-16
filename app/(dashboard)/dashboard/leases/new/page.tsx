// app/(dashboard)/dashboard/(landlord)/leases/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LeaseForm } from "@/components/leases/lease-form";
import { FileText } from "lucide-react";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Create Lease | Property Management",
};

export default async function NewLeasePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  // Get landlord's properties with units
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      landlordProfile: {
        include: {
          properties: {
            where: {
              isActive: true,
              deletedAt: null,
            },
            include: {
              units: {
                where: {
                  isActive: true,
                  deletedAt: null,
                  status: "VACANT", // Only show vacant units
                },
              },
            },
          },
        },
      },
    },
  });
  
  // Get all active tenants
  const tenants = await prisma.tenant.findMany({
    where: {
      deletedAt: null,
      user: {
        status: "ACTIVE",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  
  // Serialize properties to convert Decimal to number
  const properties = (user?.landlordProfile?.properties || []).map((property) => ({
    ...property,
    purchasePrice: property.purchasePrice ? Number(property.purchasePrice) : null,
    currentValue: property.currentValue ? Number(property.currentValue) : null,
    propertyTax: property.propertyTax ? Number(property.propertyTax) : null,
    insurance: property.insurance ? Number(property.insurance) : null,
    hoaFees: property.hoaFees ? Number(property.hoaFees) : null,
    latitude: property.latitude ? Number(property.latitude) : null,
    longitude: property.longitude ? Number(property.longitude) : null,
    squareFeet: property.squareFeet ? Number(property.squareFeet) : null,
    lotSize: property.lotSize ? Number(property.lotSize) : null,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    deletedAt: property.deletedAt?.toISOString() || null,
    units: property.units.map((unit) => ({
      ...unit,
      rentAmount: unit.rentAmount ? Number(unit.rentAmount) : null,
      deposit: unit.deposit ? Number(unit.deposit) : null,
      squareFeet: unit.squareFeet ? Number(unit.squareFeet) : null,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
      deletedAt: unit.deletedAt?.toISOString() || null,
    })),
  }));
  
  const serializedTenants = tenants.map((tenant) => ({
  ...tenant,
  annualIncome: tenant.annualIncome ? Number(tenant.annualIncome) : null,
  dateOfBirth: tenant.dateOfBirth?.toISOString() || null,
  createdAt: tenant.createdAt.toISOString(),
  updatedAt: tenant.updatedAt.toISOString(),
  deletedAt: tenant.deletedAt?.toISOString() || null,
}));
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Lease</h1>
          <p className="text-muted-foreground">
            Set up a new rental agreement for your property
          </p>
        </div>
      </div>
      
      {properties.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            You need to create a property and add units before creating a lease.
          </p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            You need to create at least one tenant profile before creating a lease.
          </p>
        </div>
      ) : (
        <LeaseForm properties={properties} tenants={serializedTenants} />
      )}
    </div>
  );
}