/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// app/(dashboard)/dashboard/maintenance/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import prisma from "@/lib/prisma";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "New Maintenance Request | Property Management",
};

export default async function NewMaintenancePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  // Get user's accessible properties
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
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
            },
          },
        },
      },
      tenantProfile: {
        include: {
          leaseMembers: {
            where: {
              lease: {
                status: "ACTIVE",
                deletedAt: null,
              },
            },
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: {
                        select: {
                          id: true,
                          name: true,
                          address: true,
                          city: true,
                          state: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  
  let properties: any[] = [];
  
  if (user?.landlordProfile) {
    properties = user.landlordProfile.properties;
  } else if (user?.tenantProfile) {
    // Get unique properties from tenant's active leases
    const uniqueProperties = new Map();
    user.tenantProfile.leaseMembers.forEach((lm) => {
      const property = lm.lease.unit.property;
      if (!uniqueProperties.has(property.id)) {
        uniqueProperties.set(property.id, property);
      }
    });
    properties = Array.from(uniqueProperties.values());
  }
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            New Maintenance Request
          </Typography>
          <Typography variant="muted">
            Submit a maintenance request for your property
          </Typography>
        </div>
        
        {properties.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <Typography variant="muted" className="text-sm text-yellow-800">
              You don't have access to any properties at this time.
            </Typography>
          </div>
        ) : (
          <MaintenanceForm properties={properties} />
        )}
      </Stack>
    </Container>
  );
}