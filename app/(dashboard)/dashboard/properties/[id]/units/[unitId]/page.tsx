// ============================================================================
// FILE: src/app/(dashboard)/dashboard/properties/[id]/units/[unitId]/page.tsx
// Unit Details Page - FIXED
// ============================================================================

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Bed,
  Bath,
  DollarSign,
  Home,
  Calendar,
  User,
  FileText,
  Plus,
} from "lucide-react";
import { MessageTenantButton } from "@/components/messages/quick-message-buttons";
import DeleteUnitButton from "@/components/properties/delete-unit-button";
import EditUnitDialog from "@/components/properties/edit-unit-dialog";

interface UnitDetailsPageProps {
  params: Promise<{ id: string; unitId: string }>;
}

const statusConfig = {
  VACANT: { label: "Vacant", color: "bg-yellow-100 text-yellow-800" },
  OCCUPIED: { label: "Occupied", color: "bg-green-100 text-green-800" },
  MAINTENANCE: { label: "Maintenance", color: "bg-orange-100 text-orange-800" },
  UNAVAILABLE: { label: "Unavailable", color: "bg-gray-100 text-gray-800" },
};

export default async function UnitDetailsPage({ params }: UnitDetailsPageProps) {
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

  const { id: propertyId, unitId } = await params;

  // Fetch unit with all related data
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      propertyId: propertyId,
      property: {
        landlordId: landlord.id,
      },
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
        },
      },
      amenities: {
        include: {
          amenity: true,
        },
      },
      parkingSpaces: true,
      leases: {
        where: { deletedAt: null },
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
                      phone: true,
                    },
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
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!unit) {
    notFound();
  }

  // Convert Decimals to numbers
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
  const status = statusConfig[unit.status as keyof typeof statusConfig];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/dashboard/properties/${propertyId}/units`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Units
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
              Unit {unitData.unitNumber}
            </h1>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
          <p className="text-gray-500 mt-1">
            {unitData.property.name} • {unitData.property.address}
          </p>
        </div>
        <div className="flex gap-2">
          <EditUnitDialog unit={unitData} propertyId={propertyId} />
          <DeleteUnitButton unitId={unitData.id} unitNumber={unitData.unitNumber} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bed className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-200">
                  {unitData.bedrooms}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bath className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-200">
                  {unitData.bathrooms}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Square Feet</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-200">
                  {unitData.squareFeet ? unitData.squareFeet.toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-200">
                  ${unitData.rentAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="lease">Current Lease</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unit Information */}
            <Card>
              <CardHeader>
                <CardTitle>Unit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Unit Number</p>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {unitData.unitNumber}
                    </p>
                  </div>
                  {unitData.floor && (
                    <div>
                      <p className="text-sm text-gray-500">Floor</p>
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {unitData.floor}
                      </p>
                    </div>
                  )}
                </div>

                {unitData.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {unitData.description}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Monthly Rent</span>
                  <span className="font-bold text-gray-900 dark:text-gray-200">
                    ${unitData.rentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Security Deposit</span>
                  <span className="font-bold text-gray-900 dark:text-gray-200">
                    ${unitData.deposit.toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Move-in Cost</span>
                    <span className="font-bold text-green-600">
                      ${(unitData.rentAmount + unitData.deposit).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {unitData.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {unitData.amenities.map((ua) => (
                      <Badge key={ua.id} variant="outline">
                        {ua.amenity.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parking Spaces */}
            {unitData.parkingSpaces.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Parking Spaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unitData.parkingSpaces.map((ps) => (
                      <div
                        key={ps.id}
                        className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <span className="font-medium">Space {ps.spaceNumber}</span>
                        <span className="text-sm text-gray-500">{ps.type}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Current Lease Tab */}
        <TabsContent value="lease" className="space-y-4">
          {activeLease ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lease Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lease Type</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {activeLease.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Start Date</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {new Date(activeLease.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  {activeLease.endDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">End Date</span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">
                        {new Date(activeLease.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Rent</span>
                    <span className="font-bold text-gray-900 dark:text-gray-200">
                      ${activeLease.rentAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rent Due Day</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      Day {activeLease.rentDueDay} of month
                    </span>
                  </div>
                  {activeLease.lateFeeAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Late Fee</span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">
                        ${activeLease.lateFeeAmount} after {activeLease.lateFeeDays} days
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <Link href={`/dashboard/leases/${activeLease.id}`}>
                      <Button variant="outline" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        View Full Lease
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tenants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeLease.tenants.map((lt) => (
                      <div
                        key={lt.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-200">
                                {lt.tenant.user.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {lt.tenant.user.email}
                              </p>
                              {lt.tenant.user.phone && (
                                <p className="text-sm text-gray-500">
                                  {lt.tenant.user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          {lt.isPrimaryTenant && (
                            <Badge variant="outline" className="text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <MessageTenantButton
                          tenantId={lt.tenantId}
                          tenantName={lt.tenant.user.name || "Tenant"}
                          propertyName={unitData.property.name}
                          unitNumber={unitData.unitNumber}
                          variant="outline"
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  No Active Lease
                </h3>
                <p className="text-gray-500 mb-4">
                  This unit is currently vacant
                </p>
                {unitData.status === "VACANT" && (
                  <Link href={`/dashboard/leases/new?unit=${unitData.id}`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Lease
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lease History</CardTitle>
            </CardHeader>
            <CardContent>
              {unitData.leases.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No lease history</p>
              ) : (
                <div className="space-y-3">
                  {unitData.leases.map((lease) => (
                    <Link key={lease.id} href={`/dashboard/leases/${lease.id}`}>
                      <div className="p-4 bg-gray-50 dark:bg-[#181a1b] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className={
                                  lease.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : lease.status === "EXPIRED"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {lease.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {lease.type.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(lease.startDate).toLocaleDateString()} -{" "}
                              {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : "Ongoing"}
                            </p>
                            {lease.tenants.length > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                {lease.tenants
                                  .map((lt) => lt.tenant.user.name)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-gray-900 dark:text-gray-200">
                            ${lease.rentAmount.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {unitData.applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unitData.applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-200">
                            {app.tenant.user.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.tenant.user.email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            app.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : app.status === "DENIED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {app.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}