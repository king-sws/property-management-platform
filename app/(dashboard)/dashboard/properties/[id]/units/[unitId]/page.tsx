// app/(dashboard)/dashboard/properties/[id]/units/[unitId]/page.tsx

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  ArrowLeft,
  Bed,
  Bath,
  Home,
  DollarSign,
  FileText,
  Plus,
  User,
} from "lucide-react";
import { MessageTenantButton } from "@/components/messages/quick-message-buttons";
import DeleteUnitButton from "@/components/properties/delete-unit-button";
import EditUnitDialog from "@/components/properties/edit-unit-dialog";
import { AmenitiesPicker } from "@/components/properties/amenities-picker";
import { Button } from "@/components/ui/button";

interface UnitDetailsPageProps {
  params: Promise<{ id: string; unitId: string }>;
}

const statusConfig = {
  VACANT:      { label: "Vacant",      bar: "bg-amber-50 dark:bg-amber-950",   text: "text-amber-700 dark:text-amber-400" },
  OCCUPIED:    { label: "Occupied",    bar: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
  MAINTENANCE: { label: "Maintenance", bar: "bg-red-50 dark:bg-red-950",       text: "text-red-700 dark:text-red-400" },
  UNAVAILABLE: { label: "Unavailable", bar: "bg-gray-100 dark:bg-gray-800",    text: "text-gray-600 dark:text-gray-400" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default async function UnitDetailsPage({ params }: UnitDetailsPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD") redirect("/sign-in");

  const landlord = await prisma.landlord.findUnique({
    where: { userId: session.user.id },
  });
  if (!landlord) redirect("/sign-in");

  const { id: propertyId, unitId } = await params;

  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      propertyId,
      property: { landlordId: landlord.id },
      deletedAt: null,
    },
    include: {
      property: {
        select: { id: true, name: true, address: true, city: true, state: true },
      },
      amenities: { include: { amenity: true } },
      parkingSpaces: true,
      leases: {
        where: { deletedAt: null },
        include: {
          tenants: {
            include: {
              tenant: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, phone: true, avatar: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { startDate: "desc" },
      },
      applications: {
        include: {
          tenant: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!unit) notFound();

  const unitData = {
    ...unit,
    bathrooms: Number(unit.bathrooms),
    rentAmount: Number(unit.rentAmount),
    deposit: Number(unit.deposit),
    leases: unit.leases.map((lease) => ({
      ...lease,
      rentAmount: Number(lease.rentAmount),
      deposit: Number(lease.deposit),
      lateFeeAmount: lease.lateFeeAmount ? Number(lease.lateFeeAmount) : null,
    })),
  };

  const activeLease = unitData.leases.find((l) => l.status === "ACTIVE");
  const s = statusConfig[unit.status as keyof typeof statusConfig];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`/dashboard/properties/${propertyId}/units`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to units
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-medium">Unit {unitData.unitNumber}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.bar} ${s.text}`}>
              {s.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {unitData.property.name} · {unitData.property.address}, {unitData.property.city}, {unitData.property.state}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <EditUnitDialog unit={unitData} propertyId={propertyId} />
          <DeleteUnitButton unitId={unitData.id} unitNumber={unitData.unitNumber} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {[
    {
      icon: Bed,
      label: "Bedrooms",
      value: unitData.bedrooms,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      icon: Bath,
      label: "Bathrooms",
      value: unitData.bathrooms,
      color: "text-sky-500 bg-sky-50 dark:bg-sky-950/30",
    },
    {
      icon: Home,
      label: "Square feet",
      value: unitData.squareFeet
        ? unitData.squareFeet.toLocaleString()
        : "—",
      color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30",
    },
    {
      icon: DollarSign,
      label: "Monthly rent",
      value: `$${unitData.rentAmount.toLocaleString()}`,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    },
  ].map((stat) => (
    <div
      key={stat.label}
      className="bg-card border rounded-xl p-5 flex items-start justify-between hover:shadow-sm transition"
    >
      <div>
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <p className="text-2xl font-semibold mt-1">{stat.value}</p>
      </div>

      <div className={`p-2 rounded-lg ${stat.color}`}>
        <stat.icon className="w-5 h-5" />
      </div>
    </div>
  ))}
</div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="lease">Current lease</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ── Details ── */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Unit info */}
            <div className="bg-background border border-border/50 rounded-xl p-5 space-y-4">
              <p className="font-medium">Unit information</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-0.5">Unit number</p>
                  <p className="font-medium">{unitData.unitNumber}</p>
                </div>
                {unitData.floor && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Floor</p>
                    <p className="font-medium">{unitData.floor}</p>
                  </div>
                )}
              </div>
              {unitData.description && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-0.5">Description</p>
                  <p>{unitData.description}</p>
                </div>
              )}
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.bar} ${s.text}`}>
                  {s.label}
                </span>
              </div>
            </div>

            {/* Financial info */}
            <div className="bg-background border border-border/50 rounded-xl p-5 space-y-3">
              <p className="font-medium">Financial information</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly rent</span>
                  <span className="font-medium">${unitData.rentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Security deposit</span>
                  <span className="font-medium">${unitData.deposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <span className="text-muted-foreground">Total move-in cost</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    ${(unitData.rentAmount + unitData.deposit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities — full width */}
            <div className="md:col-span-2 bg-background border border-border/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium">Amenities</p>
                <span className="text-xs text-muted-foreground">
                  {unitData.amenities.length} selected
                </span>
              </div>
              <AmenitiesPicker
                unitId={unitData.id}
                initialAmenityIds={unitData.amenities.map((ua) => ua.amenityId)}
              />
            </div>

            {/* Parking */}
            {unitData.parkingSpaces.length > 0 && (
              <div className="bg-background border border-border/50 rounded-xl p-5">
                <p className="font-medium mb-3">Parking spaces</p>
                <div className="space-y-2">
                  {unitData.parkingSpaces.map((ps) => (
                    <div
                      key={ps.id}
                      className="flex justify-between items-center text-sm py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="font-medium">Space {ps.spaceNumber}</span>
                      <span className="text-muted-foreground">{ps.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Current Lease ── */}
        <TabsContent value="lease" className="space-y-4">
          {activeLease ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lease details */}
              <div className="bg-background border border-border/50 rounded-xl p-5 space-y-3">
                <p className="font-medium">Lease details</p>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Lease type", value: activeLease.type.replace("_", " ") },
                    { label: "Start date", value: new Date(activeLease.startDate).toLocaleDateString() },
                    ...(activeLease.endDate ? [{ label: "End date", value: new Date(activeLease.endDate).toLocaleDateString() }] : []),
                    { label: "Monthly rent", value: `$${activeLease.rentAmount.toLocaleString()}` },
                    { label: "Rent due day", value: `Day ${activeLease.rentDueDay} of month` },
                    ...(activeLease.lateFeeAmount ? [{ label: "Late fee", value: `$${activeLease.lateFeeAmount} after ${activeLease.lateFeeDays} days` }] : []),
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-border/50">
                  <Link href={`/dashboard/leases/${activeLease.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="w-3.5 h-3.5 mr-2" />
                      View full lease
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Tenants */}
              <div className="bg-background border border-border/50 rounded-xl p-5">
                <p className="font-medium mb-4">Tenants</p>
                <div className="space-y-3">
                  {activeLease.tenants.map((lt) => {
                    const name = lt.tenant.user.name || lt.tenant.user.email || "Tenant";
                    return (
                      <div key={lt.id} className="p-3 bg-muted/40 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            {lt.tenant.user.avatar ? (
                              <img
                                src={lt.tenant.user.avatar}
                                alt={name}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300 shrink-0">
                                {initials(name)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">{name}</p>
                              <p className="text-xs text-muted-foreground">{lt.tenant.user.email}</p>
                              {lt.tenant.user.phone && (
                                <p className="text-xs text-muted-foreground">{lt.tenant.user.phone}</p>
                              )}
                            </div>
                          </div>
                          {lt.isPrimaryTenant && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border/50 text-muted-foreground">
                              Primary
                            </span>
                          )}
                        </div>
                        <MessageTenantButton
                          tenantId={lt.tenantId}
                          tenantName={name}
                          propertyName={unitData.property.name}
                          unitNumber={unitData.unitNumber}
                          variant="outline"
                          size="sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl text-center">
              <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-medium mb-1">No active lease</h3>
              <p className="text-sm text-muted-foreground mb-4">This unit is currently vacant</p>
              {unitData.status === "VACANT" && (
                <Link href={`/dashboard/leases/new?unit=${unitData.id}`}>
                  <Button size="sm">
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Create lease
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── History ── */}
        <TabsContent value="history" className="space-y-4">
          {/* Lease history */}
          <div className="bg-background border border-border/50 rounded-xl p-5">
            <p className="font-medium mb-4">Lease history</p>
            {unitData.leases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No lease history</p>
            ) : (
              <div className="space-y-2">
                {unitData.leases.map((lease) => {
                  const leaseStatus =
                    lease.status === "ACTIVE" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    : lease.status === "EXPIRED" ? "bg-muted text-muted-foreground"
                    : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400";
                  return (
                    <Link key={lease.id} href={`/dashboard/leases/${lease.id}`}>
                      <div className="flex items-start justify-between p-3.5 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${leaseStatus}`}>
                              {lease.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {lease.type.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(lease.startDate).toLocaleDateString()} —{" "}
                            {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : "Ongoing"}
                          </p>
                          {lease.tenants.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {lease.tenants.map((lt) => lt.tenant.user.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium shrink-0 ml-4">
                          ${lease.rentAmount.toLocaleString()}/mo
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Applications */}
          {unitData.applications.length > 0 && (
            <div className="bg-background border border-border/50 rounded-xl p-5">
              <p className="font-medium mb-4">Recent applications</p>
              <div className="space-y-2">
                {unitData.applications.map((app) => {
                  const appStatus =
                    app.status === "APPROVED" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    : app.status === "DENIED" ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
                    : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400";
                  return (
                    <div
                      key={app.id}
                      className="flex items-start justify-between p-3.5 rounded-lg border border-border/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{app.tenant.user.name}</p>
                        <p className="text-xs text-muted-foreground">{app.tenant.user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-4 ${appStatus}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}