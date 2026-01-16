/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// app/(dashboard)/dashboard/maintenance/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { Wrench } from "lucide-react";
import prisma from "@/lib/prisma";

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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            New Maintenance Request
          </h1>
          <p className="text-muted-foreground">
            Submit a maintenance request for your property
          </p>
        </div>
      </div>
      
      {properties.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            You don't have access to any properties at this time.
          </p>
        </div>
      ) : (
        <MaintenanceForm properties={properties} />
      )}
    </div>
  );
}