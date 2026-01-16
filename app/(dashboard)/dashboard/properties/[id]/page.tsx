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
import { Edit, Home, DollarSign, Calendar, Plus } from "lucide-react";
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
          },
        },
      })),
    })),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">{property.name}</h1>
          <p className="text-gray-500 mt-1">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/properties/${property.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <DeletePropertyButton propertyId={property.id} propertyName={property.name} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-200 mt-1">{totalUnits}</p>
              </div>
              <Home className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Occupancy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-200 mt-1">{occupancyRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {occupiedUnits} occupied, {vacantUnits} vacant
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">{occupancyRate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-200 mt-1">
                  ${currentRent.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of ${totalRent.toLocaleString()} potential
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-200 mt-1">
                  {property.type.replace("_", " ")}
                </p>
                {property.yearBuilt && (
                  <p className="text-xs text-gray-500 mt-1">Built {property.yearBuilt}</p>
                )}
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
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

          {unitsForClient.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  No units yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Add your first unit to start managing this property
                </p>
                <AddUnitDialog propertyId={property.id} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitsForClient.map((unit) => {
                // Get active lease and tenant info
                const activeLease = unit.leases[0];
                const tenants = activeLease?.tenants || [];

                return (
                  <Card key={unit.id}>
                    <CardContent className="p-6">
                      <UnitCard unit={unit} propertyId={property.id} />
                      
                      {/* MESSAGE TENANTS SECTION */}
                      {tenants.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Tenants:
                          </p>
                          <div className="space-y-2">
                            {tenants.map((lt) => (
                              <div
                                key={lt.tenantId}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {lt.tenant.user.name || lt.tenant.user.email}
                                </span>
                                <MessageTenantButton
                                  tenantId={lt.tenantId}
                                  tenantName={lt.tenant.user.name || "Tenant"}
                                  propertyName={property.name}
                                  unitNumber={unit.unitNumber}
                                  variant="ghost"
                                  size="sm"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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