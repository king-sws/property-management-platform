// ============================================================================
// FILE: src/app/(dashboard)/dashboard/properties/[id]/page.tsx
// Property Details Page - FIXED: Await params and Convert Decimals
// ============================================================================

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Edit, Home, Users, DollarSign, Building2, Calendar, Plus, Square, Bath, Bed, ArrowLeft } from "lucide-react";
import UnitCard from "@/components/properties/unit-card";
import AddUnitDialog from "@/components/properties/add-unit-dialog";
import DeletePropertyButton from "@/components/properties/delete-property-button";
import { MessageTenantButton } from "@/components/messages/quick-message-buttons";
import { MessageVendorButton } from "@/components/messages/quick-message-buttons";

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>; // ✅ FIXED: params is a Promise
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const landlord = await prisma.landlord.findUnique({
    where: { userId: session.user.id },
  });

  if (!landlord) {
    redirect("/sign-in");
  }

  // ✅ FIXED: Await params before accessing properties
  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: {
      id: id,
      landlordId: landlord.id,
      deletedAt: null,
    },
    include: {
      units: {
        where: { deletedAt: null },
        include: {
          leases: {
            where: {
              status: "ACTIVE",
            },
            include: {
              tenants: {
                include: {
                  tenant: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                          avatar: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { unitNumber: "asc" },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
      },
      expenses: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 5,
      },
      maintenanceTickets: {
        where: {
          deletedAt: null,
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
              tenantProfile: {
                select: {
                  id: true,
                },
              },
            },
          },
          vendor: {
            select: {
              id: true,
              businessName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!property) {
    notFound();
  }

  const totalUnits = property.units.length;
  const occupiedUnits = property.units.filter((u) => u.status === "OCCUPIED").length;
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // Calculate total monthly rent
  const totalRent = property.units.reduce(
    (sum, unit) => sum + Number(unit.rentAmount),
    0
  );
  const currentRent = property.units
    .filter((u) => u.status === "OCCUPIED")
    .reduce((sum, unit) => sum + Number(unit.rentAmount), 0);

  // ✅ Convert units data to plain objects with numbers instead of Decimals
  const unitsForClient = property.units.map((unit) => ({
    id: unit.id,
    unitNumber: unit.unitNumber,
    bedrooms: unit.bedrooms,
    bathrooms: Number(unit.bathrooms), // Convert Decimal to number
    squareFeet: unit.squareFeet,
    rentAmount: Number(unit.rentAmount), // Convert Decimal to number
    deposit: Number(unit.deposit), // Convert Decimal to number
    status: unit.status,
    leases: unit.leases.map((lease) => ({
      id: lease.id,
      tenants: lease.tenants.map((lt) => ({
        tenantId: lt.tenantId,
        tenant: {
          user: {
            id: lt.tenant.user.id,
            name: lt.tenant.user.name,
            email: lt.tenant.user.email,
            avatar: lt.tenant.user.avatar,
          },
        },
      })),
    })),
  }));

  return (
    <div className="space-y-6">

<Link
        href={`/dashboard/properties`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Properties
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
  <div>
    <div className="flex items-center gap-3 mb-1">
      <h1 className="text-2xl font-medium">
        {property.name}
      </h1>

      {/* Status Badge */}
      {/* {property.status && (
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {property.status}
        </span>
      )} */}
    </div>

    <p className="text-sm text-muted-foreground">
      {property.address} · {property.city}, {property.state} {property.zipCode}
    </p>
  </div>

  <div className="flex gap-2 shrink-0">
    <Link href={`/dashboard/properties/${property.id}/edit`}>
      <Button variant="outline">
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    </Link>

    <DeletePropertyButton
      propertyId={property.id}
      propertyName={property.name}
    />
  </div>
</div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {[
    {
      icon: Home,
      label: "Total Units",
      value: totalUnits,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: Users,
      label: "Occupancy",
      value: `${occupancyRate}%`,
      sub: `${occupiedUnits} occupied`,
      color: "text-green-500 bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: DollarSign,
      label: "Monthly Rent",
      value: `$${currentRent.toLocaleString()}`,
      sub: `of $${totalRent.toLocaleString()}`,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      icon: Building2,
      label: "Property Type",
      value: property.type.replace("_", " "),
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
    },
  ].map((stat) => (
    <div
      key={stat.label}
      className="bg-card border rounded-xl p-5 flex items-start justify-between hover:shadow-sm transition"
    >
      <div>
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <p className="text-2xl font-semibold mt-1">{stat.value}</p>

        {stat.sub && (
          <p className="text-xs text-muted-foreground mt-1">
            {stat.sub}
          </p>
        )}
      </div>

      <div className={`p-2 rounded-lg ${stat.color}`}>
        <stat.icon className="w-5 h-5" />
      </div>
    </div>
  ))}
</div>

      {/* Tabs */}
      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
              Units ({totalUnits})
            </h2>
            <AddUnitDialog propertyId={property.id} />
          </div>

{/* Empty state */}
{unitsForClient.length === 0 ? (
  <Card>
    <CardContent className="p-12 text-center">
      <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No units yet</h3>
      <p className="text-muted-foreground mb-4">
        Add your first unit to start managing this property
      </p>
      <AddUnitDialog propertyId={property.id} />
    </CardContent>
  </Card>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {unitsForClient.map((unit) => {
      const activeLease = unit.leases[0];
      const tenants = activeLease?.tenants || [];

      // Status config
      const statusConfig: Record<string, { label: string; className: string }> = {
        OCCUPIED:    { label: "Occupied",    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
        VACANT:      { label: "Vacant",      className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
        MAINTENANCE: { label: "Maintenance", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
        UNAVAILABLE: { label: "Unavailable", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
      };
      const status = statusConfig[unit.status] ?? statusConfig.UNAVAILABLE;

      // Initials helper
      const initials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

      return (
        <div
          key={unit.id}
          className="bg-background border border-border/50 rounded-xl overflow-hidden hover:border-border hover:shadow-sm transition-all"
        >
          {/* Status bar */}
          <div className={`px-4 py-1.5 flex items-center justify-between text-xs font-medium ${status.className}`}>
            <span>{status.label}</span>
            <span className="opacity-75">Unit {unit.unitNumber}</span>
          </div>

          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-medium">Unit {unit.unitNumber}</span>
              <span className="text-base font-medium text-emerald-600 dark:text-emerald-400">
                ${unit.rentAmount.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </span>
            </div>

            {/* Unit specs */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5" />
                {unit.bedrooms} bed
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5" />
                {unit.bathrooms} bath
              </span>
              {unit.squareFeet && (
                <span className="flex items-center gap-1.5">
                  <Square className="w-3.5 h-3.5" />
                  {unit.squareFeet.toLocaleString()} sqft
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/dashboard/properties/${property.id}/units/${unit.id}`}
                className="flex-1 text-center py-1.5 text-sm border border-border/50 rounded-lg hover:bg-muted transition-colors"
              >
                View unit
              </Link>
              <Link
                href={`/dashboard/properties/${property.id}/units/${unit.id}`}
                className="flex-1 text-center py-1.5 text-sm border border-border/50 rounded-lg hover:bg-muted transition-colors"
              >
                Edit
              </Link>
            </div>

            {/* Tenants section */}
            <div className="border-t border-border/50 pt-3">
              {tenants.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Current tenants
                  </p>
                  {tenants.map((lt) => {
                    const name = lt.tenant.user.name || lt.tenant.user.email || "Tenant";
                    return (
                      <div key={lt.tenantId} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Avatar */}
                          {lt.tenant.user.avatar ? (
                            <img
                            src={lt.tenant.user.avatar}
                              alt={name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300 shrink-0">
                              {initials(name)}
                            </div>
                          )}
                          <span className="text-sm truncate">{name}</span>
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
)}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{property.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">Property Details</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Type:</dt>
                      <dd className="text-gray-900 dark:text-gray-200 font-medium">
                        {property.type.replace("_", " ")}
                      </dd>
                    </div>
                    {property.yearBuilt && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Year Built:</dt>
                        <dd className="text-gray-900 dark:text-gray-200 font-medium">{property.yearBuilt}</dd>
                      </div>
                    )}
                    {property.squareFeet && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Square Feet:</dt>
                        <dd className="text-gray-900 dark:text-gray-200 font-medium">
                          {property.squareFeet.toLocaleString()} sq ft
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">Financial</h3>
                  <dl className="space-y-2">
                    {property.purchasePrice && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Purchase Price:</dt>
                        <dd className="text-gray-900 dark:text-gray-200 font-medium">
                          ${Number(property.purchasePrice).toLocaleString()}
                        </dd>
                      </div>
                    )}
                    {property.propertyTax && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Annual Property Tax:</dt>
                        <dd className="text-gray-900 dark:text-gray-200 font-medium">
                          ${Number(property.propertyTax).toLocaleString()}
                        </dd>
                      </div>
                    )}
                    {property.insurance && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Annual Insurance:</dt>
                        <dd className="text-gray-900 dark:text-gray-200 font-medium">
                          ${Number(property.insurance).toLocaleString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Open Maintenance Tickets</CardTitle>
              <Link href={`/dashboard/maintenance/new?property=${property.id}`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {property.maintenanceTickets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No open maintenance tickets
                </p>
              ) : (
                <div className="space-y-3">
                  {property.maintenanceTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 bg-gray-50 dark:bg-[#181a1b] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Link
                          href={`/dashboard/maintenance/${ticket.id}`}
                          className="flex-1"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-200">{ticket.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{ticket.location}</p>
                            
                            {ticket.createdBy && (
                              <p className="text-xs text-gray-400 mt-1">
                                Created by: {ticket.createdBy.name}
                              </p>
                            )}
                          </div>
                        </Link>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            ticket.priority === "URGENT"
                              ? "bg-red-100 text-red-800"
                              : ticket.priority === "HIGH"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        {ticket.createdBy?.role === "TENANT" && ticket.createdBy.tenantProfile && (
                          <MessageTenantButton
                            tenantId={ticket.createdBy.tenantProfile.id}
                            tenantName={ticket.createdBy.name || "Tenant"}
                            propertyName={property.name}
                            variant="outline"
                            size="sm"
                          />
                        )}

                        {ticket.vendor && (
                          <MessageVendorButton
                            vendorId={ticket.vendorId!}
                            vendorName={ticket.vendor.businessName}
                            ticketId={ticket.id}
                            ticketTitle={ticket.title}
                            variant="outline"
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Expenses</CardTitle>
              <Link href={`/dashboard/expenses/new?property=${property.id}`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {property.expenses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No expenses recorded</p>
              ) : (
                <div className="space-y-3">
                  {property.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#181a1b] rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {expense.category.replace("_", " ")} •{" "}
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-200">
                        ${Number(expense.amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}