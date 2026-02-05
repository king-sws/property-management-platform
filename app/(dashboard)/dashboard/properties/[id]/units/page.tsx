/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// FILE: src/app/(dashboard)/dashboard/properties/[id]/units/page.tsx
// Units List Page for a Property - FIXED: Convert Decimal to number
// ============================================================================

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, ArrowLeft, Home } from "lucide-react";
import UnitCard from "@/components/properties/unit-card";
import AddUnitDialog from "@/components/properties/add-unit-dialog";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Decimal } from "@prisma/client/runtime/client";

interface UnitsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ✅ Helper function to convert Decimal to number
function convertDecimalToNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.toString());
}

// ✅ Helper function to serialize unit data
function serializeUnit(unit: any) {
  return {
    ...unit,
    bathrooms: convertDecimalToNumber(unit.bathrooms),
    rentAmount: convertDecimalToNumber(unit.rentAmount),
    deposit: convertDecimalToNumber(unit.deposit),
    leases: unit.leases?.map((lease: any) => ({
      ...lease,
      rentAmount: convertDecimalToNumber(lease.rentAmount),
      deposit: convertDecimalToNumber(lease.deposit),
      lateFeeAmount: convertDecimalToNumber(lease.lateFeeAmount),
    })) || [],
  };
}

export default async function UnitsPage({
  params,
  searchParams,
}: UnitsPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/sign-in");
  }

  const landlord = await prisma.landlord.findUnique({
    where: { userId: session.user.id },
  });

  if (!landlord) {
    redirect("/sign-in");
  }

  const { id } = await params;

  // Verify property ownership
  const property = await prisma.property.findFirst({
    where: {
      id: id,
      landlordId: landlord.id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
    },
  });

  if (!property) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const statusFilter =
    typeof resolvedSearchParams.status === "string" 
      ? resolvedSearchParams.status 
      : "all";
  const searchQuery = 
    typeof resolvedSearchParams.search === "string" 
      ? resolvedSearchParams.search 
      : "";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/dashboard/properties/${id}`}>
        <Button variant="ghost" size="sm" className='mb-4'>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Property
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-400">Units</h1>
          <p className="text-gray-500 mt-1">
            {property.name} • {property.address}, {property.city}, {property.state}
          </p>
        </div>
        <AddUnitDialog propertyId={property.id} />
      </div>

      {/* Filters */}

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by unit number..."
                className="pl-10"
                defaultValue={searchQuery}
                name="search"
              />
            </div>
            <Select defaultValue={statusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="VACANT">Vacant</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>


      {/* Units List */}
      <Suspense fallback={<UnitsLoading />}>
        <UnitsList
          propertyId={id}
          landlordId={landlord.id}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

async function UnitsList({
  propertyId,
  landlordId,
  statusFilter,
  searchQuery,
}: {
  propertyId: string;
  landlordId: string;
  statusFilter: string;
  searchQuery: string;
}) {
  // Verify property ownership before querying units
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      landlordId: landlordId,
      deletedAt: null,
    },
  });

  if (!property) {
    redirect("/dashboard/properties");
  }

  // Build where clause
  const whereClause: any = {
    propertyId,
    deletedAt: null,
    isActive: true,
  };

  if (statusFilter && statusFilter !== "all") {
    whereClause.status = statusFilter;
  }

  if (searchQuery) {
    whereClause.unitNumber = {
      contains: searchQuery,
      mode: "insensitive",
    };
  }

  const rawUnits = await prisma.unit.findMany({
    where: whereClause,
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: {
          tenants: {
            include: {
              tenant: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        take: 1,
      },
      amenities: {
        include: {
          amenity: true,
        },
      },
      parkingSpaces: true,
    },
    orderBy: { unitNumber: "asc" },
  });

  // ✅ Convert Decimal fields to numbers for client component
  const units = rawUnits.map(serializeUnit);

  // Calculate statistics
  const totalUnits = units.length;
  const vacantUnits = units.filter((u) => u.status === "VACANT").length;
  const occupiedUnits = units.filter((u) => u.status === "OCCUPIED").length;
  const maintenanceUnits = units.filter(
    (u) => u.status === "MAINTENANCE"
  ).length;

  const totalRent = units.reduce(
    (sum, unit) => sum + unit.rentAmount,
    0
  );
  const currentRent = units
    .filter((u) => u.status === "OCCUPIED")
    .reduce((sum, unit) => sum + unit.rentAmount, 0);

  if (units.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Home className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== "all"
              ? "No units found"
              : "No units yet"}
          </h3>
          <p className="text-gray-500 mb-4 text-center max-w-md">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first unit to this property"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <AddUnitDialog propertyId={propertyId} />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 ">
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200">{totalUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Occupied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {occupiedUnits}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalUnits > 0
                ? Math.round((occupiedUnits / totalUnits) * 100)
                : 0}
              % occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Vacant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {vacantUnits}
            </div>
            {maintenanceUnits > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {maintenanceUnits} in maintenance
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-gray-500">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-200">
              ${currentRent.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              of ${totalRent.toLocaleString()} potential
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} propertyId={propertyId} />
        ))}
      </div>
    </div>
  );
}

function UnitsLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Units Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}