// app/(dashboard)/dashboard/applications/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApplicationForm } from "@/components/applications/application-form";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "New Application | Property Management",
  description: "Submit a new rental application",
};

async function getAvailableUnits() {
  try {
    const units = await prisma.unit.findMany({
      where: {
        status: "VACANT",
        isActive: true,
        deletedAt: null,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            landlordId: true,
          },
        },
      },
      orderBy: [
        { property: { name: "asc" } },
        { unitNumber: "asc" },
      ],
    });

    // Serialize the data
    return units.map((unit) => ({
      ...unit,
      bathrooms: unit.bathrooms ? Number(unit.bathrooms) : null,
      rentAmount: unit.rentAmount ? Number(unit.rentAmount) : null,
      deposit: unit.deposit ? Number(unit.deposit) : null,
      squareFeet: unit.squareFeet ? Number(unit.squareFeet) : null,
      createdAt: unit.createdAt?.toISOString() || null,
      updatedAt: unit.updatedAt?.toISOString() || null,
      deletedAt: unit.deletedAt?.toISOString() || null,
    }));
  } catch (error) {
    console.error("Error fetching available units:", error);
    return [];
  }
}

export default async function NewApplicationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Only tenants can create applications
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenantProfile: true,
    },
  });

  if (!user || user.role !== "TENANT") {
    redirect("/dashboard");
  }

  if (!user.tenantProfile) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Tenant Profile Required
          </h3>
          <p className="text-sm text-yellow-800">
            You need to complete your tenant profile before submitting an application.
            Please contact support or complete your profile setup.
          </p>
        </div>
      </div>
    );
  }

  const availableUnits = await getAvailableUnits();

  if (availableUnits.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Application</h1>
            <p className="text-muted-foreground">
              Submit a rental application for an available unit
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            No Available Units
          </h3>
          <p className="text-sm text-blue-800">
            There are currently no vacant units available for applications.
            Please check back later or contact the property management office.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Application</h1>
          <p className="text-muted-foreground">
            Submit a rental application for an available unit
          </p>
        </div>
      </div>

      <ApplicationForm units={availableUnits} isEdit={false} />
    </div>
  );
}