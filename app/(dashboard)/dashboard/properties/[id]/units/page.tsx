/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/properties/[id]/units/page.tsx

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Search, ArrowLeft, Home, Plus } from "lucide-react";
import AddUnitDialog from "@/components/properties/add-unit-dialog";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Decimal } from "@prisma/client/runtime/client";
import { MessageTenantButton } from "@/components/messages/quick-message-buttons";

interface UnitsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function convertDecimalToNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return parseFloat(value.toString());
}

function serializeUnit(unit: any) {
  return {
    ...unit,
    bathrooms: convertDecimalToNumber(unit.bathrooms),
    rentAmount: convertDecimalToNumber(unit.rentAmount),
    deposit: convertDecimalToNumber(unit.deposit),
    leases:
      unit.leases?.map((lease: any) => ({
        ...lease,
        rentAmount: convertDecimalToNumber(lease.rentAmount),
        deposit: convertDecimalToNumber(lease.deposit),
        lateFeeAmount: convertDecimalToNumber(lease.lateFeeAmount),
      })) || [],
  };
}

const statusConfig: Record<string, { label: string; bar: string; text: string }> = {
  OCCUPIED:    { label: "Occupied",    bar: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
  VACANT:      { label: "Vacant",      bar: "bg-amber-50 dark:bg-amber-950",    text: "text-amber-700 dark:text-amber-400" },
  MAINTENANCE: { label: "Maintenance", bar: "bg-red-50 dark:bg-red-950",        text: "text-red-700 dark:text-red-400" },
  UNAVAILABLE: { label: "Unavailable", bar: "bg-gray-100 dark:bg-gray-800",     text: "text-gray-600 dark:text-gray-400" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default async function UnitsPage({ params, searchParams }: UnitsPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD") redirect("/sign-in");

  const landlord = await prisma.landlord.findUnique({
    where: { userId: session.user.id },
  });
  if (!landlord) redirect("/sign-in");

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, landlordId: landlord.id, deletedAt: null },
    select: { id: true, name: true, address: true, city: true, state: true },
  });
  if (!property) notFound();

  const resolvedSearchParams = await searchParams;
  const statusFilter =
    typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "all";
  const searchQuery =
    typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : "";

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`/dashboard/properties/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to property
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Units</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {property.name} · {property.address}, {property.city}, {property.state}
          </p>
        </div>
        <AddUnitDialog propertyId={property.id} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by unit number..."
            className="pl-9 h-9 text-sm"
            defaultValue={searchQuery}
            name="search"
          />
        </div>
        <Select defaultValue={statusFilter}>
          <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="VACANT">Vacant</SelectItem>
            <SelectItem value="OCCUPIED">Occupied</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
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
  const property = await prisma.property.findFirst({
    where: { id: propertyId, landlordId, deletedAt: null },
  });
  if (!property) redirect("/dashboard/properties");

  const whereClause: any = { propertyId, deletedAt: null, isActive: true };
  if (statusFilter !== "all") whereClause.status = statusFilter;
  if (searchQuery) whereClause.unitNumber = { contains: searchQuery, mode: "insensitive" };

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
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                },
              },
            },
          },
        },
        take: 1,
      },
      amenities: { include: { amenity: true } },
      parkingSpaces: true,
    },
    orderBy: { unitNumber: "asc" },
  });

  const units = rawUnits.map(serializeUnit);

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === "OCCUPIED").length;
  const vacantUnits = units.filter((u) => u.status === "VACANT").length;
  const maintenanceUnits = units.filter((u) => u.status === "MAINTENANCE").length;
  const totalRent = units.reduce((sum, u) => sum + u.rentAmount, 0);
  const currentRent = units.filter((u) => u.status === "OCCUPIED").reduce((sum, u) => sum + u.rentAmount, 0);

  if (units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl text-center">
        <Home className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <h3 className="font-medium mb-1">
          {searchQuery || statusFilter !== "all" ? "No units found" : "No units yet"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          {searchQuery || statusFilter !== "all"
            ? "Try adjusting your search or filters"
            : "Add your first unit to start managing this property"}
        </p>
        {!searchQuery && statusFilter === "all" && (
          <AddUnitDialog propertyId={propertyId} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total units", value: totalUnits, sub: null, color: "text-foreground" },
          {
            label: "Occupied",
            value: occupiedUnits,
            sub: `${totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0}% occupancy`,
            color: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Vacant",
            value: vacantUnits,
            sub: maintenanceUnits > 0 ? `${maintenanceUnits} in maintenance` : null,
            color: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Monthly revenue",
            value: `$${currentRent.toLocaleString()}`,
            sub: `of $${totalRent.toLocaleString()} potential`,
            color: "text-foreground",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-muted/50 rounded-lg px-4 py-3"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
            {stat.sub && <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Units grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {units.map((unit: any) => {
          const activeLease = unit.leases[0];
          const tenants = activeLease?.tenants || [];
          const s = statusConfig[unit.status] ?? statusConfig.UNAVAILABLE;

          return (
            <div
              key={unit.id}
              className="bg-background border border-border/50 rounded-xl overflow-hidden hover:border-border hover:shadow-sm transition-all"
            >
              {/* Status bar */}
              <div className={`px-3.5 py-1.5 flex items-center justify-between ${s.bar}`}>
                <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                <span className={`text-xs ${s.text} opacity-75`}>Unit {unit.unitNumber}</span>
              </div>

              <div className="p-4 space-y-3">
                {/* Title + rent */}
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">Unit {unit.unitNumber}</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    ${unit.rentAmount.toLocaleString()}
                    <span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </span>
                </div>

                {/* Specs */}
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{unit.bedrooms} bed</span>
                  <span>{unit.bathrooms} bath</span>
                  {unit.squareFeet && <span>{unit.squareFeet.toLocaleString()} sqft</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/properties/${propertyId}/units/${unit.id}`}
                    className="flex-1 text-center py-1.5 text-xs border border-border/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/properties/${propertyId}/units/${unit.id}`}
                    className="flex-1 text-center py-1.5 text-xs border border-border/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/leases/new?unit=${unit.id}`}
                    className="flex-1 text-center py-1.5 text-xs border border-border/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    Lease
                  </Link>
                </div>

                {/* Tenants */}
                <div className="border-t border-border/50 pt-3">
                  {tenants.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground mb-1.5">Current tenants</p>
                      {tenants.map((lt: any) => {
                        const name = lt.tenant.user.name || lt.tenant.user.email || "Tenant";
                        return (
                          <div key={lt.tenantId} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {lt.tenant.user.avatar ? (
                                <img
                                  src={lt.tenant.user.avatar}
                                  alt={name}
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300 shrink-0">
                                  {initials(name)}
                                </div>
                              )}
                              <span className="text-xs truncate">{name}</span>
                            </div>
                            <MessageTenantButton
                              tenantId={lt.tenantId}
                              tenantName={name}
                              propertyName={property.name}
                              unitNumber={unit.unitNumber}
                              variant="ghost"
                              size="sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No active tenants</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UnitsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-muted/50 rounded-lg px-4 py-3 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
            <Skeleton className="h-7 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}