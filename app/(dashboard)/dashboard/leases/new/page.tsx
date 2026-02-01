// app/(dashboard)/dashboard/(landlord)/leases/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LeaseForm } from "@/components/leases/lease-form";
import prisma from "@/lib/prisma";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

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
  
  // Get landlord profile
  const landlord = await prisma.landlord.findUnique({
    where: { userId: session.user.id },
  });

  if (!landlord) {
    redirect("/sign-in");
  }
  
  // Get landlord's properties with units
  const properties = await prisma.property.findMany({
    where: {
      landlordId: landlord.id,
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
        orderBy: {
          unitNumber: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
  
  // ✅ FIX: Get ONLY tenants who have a relationship with THIS landlord
  // Using the correct relation name from schema: leaseMembers (not leases)
  const tenantsWithHistory = await prisma.tenant.findMany({
    where: {
      deletedAt: null,
      user: {
        status: "ACTIVE",
      },
      OR: [
        // Tenants who have or had leases in landlord's properties
        // ✅ Use leaseMembers instead of leases
        {
          leaseMembers: {
            some: {
              lease: {
                unit: {
                  property: {
                    landlordId: landlord.id,
                  },
                },
              },
            },
          },
        },
        // Tenants who have applications for landlord's properties
        {
          applications: {
            some: {
              unit: {
                property: {
                  landlordId: landlord.id,
                },
              },
              status: {
                in: ["APPROVED", "UNDER_REVIEW"],
              },
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          image: true,
        },
      },
      // ✅ Check if tenant currently has an active lease using leaseMembers
      leaseMembers: {
        where: {
          lease: {
            status: "ACTIVE",
          },
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // ✅ Filter out tenants who already have active leases
  const availableTenants = tenantsWithHistory.filter(
    (tenant) => tenant.leaseMembers.length === 0
  );
  
  // Serialize properties to convert Decimal to number
  const serializedProperties = properties.map((property) => ({
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
      bathrooms: unit.bathrooms ? Number(unit.bathrooms) : null,
      rentAmount: unit.rentAmount ? Number(unit.rentAmount) : null,
      deposit: unit.deposit ? Number(unit.deposit) : null,
      squareFeet: unit.squareFeet ? Number(unit.squareFeet) : null,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
      deletedAt: unit.deletedAt?.toISOString() || null,
    })),
  }));
  
  const serializedTenants = availableTenants.map((tenant) => ({
    ...tenant,
    annualIncome: tenant.annualIncome ? Number(tenant.annualIncome) : null,
    dateOfBirth: tenant.dateOfBirth?.toISOString() || null,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
    deletedAt: tenant.deletedAt?.toISOString() || null,
    // Remove leaseMembers from serialized data (don't need to send to client)
    leaseMembers: undefined,
    user: tenant.user,
  }));
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Create New Lease
          </Typography>
          <Typography variant="muted">
            Set up a new rental agreement for your property
          </Typography>
        </div>
        
        {serializedProperties.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <Typography variant="muted" className="text-sm text-yellow-800">
              You need to create a property and add units before creating a lease.
            </Typography>
          </div>
        ) : serializedTenants.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <Typography className="text-sm font-semibold text-yellow-800 mb-2">
              No Available Tenants
            </Typography>
            <Typography variant="muted" className="text-sm text-yellow-700 mb-3">
              You don&#39;t have any tenants available for a new lease. Tenants become available when they:
            </Typography>
            <ul className="text-sm text-yellow-700 space-y-1 ml-4">
              <li>• Apply for one of your properties</li>
              <li>• Complete a previous lease with you</li>
              <li>• Are manually added to your system</li>
            </ul>
          </div>
        ) : (
          <LeaseForm properties={serializedProperties} tenants={serializedTenants} />
        )}
      </Stack>
    </Container>
  );
}