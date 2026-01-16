/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// FILE 5: components/lease/lease-preview-card.tsx
// ============================================================================
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Home,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Car,
  Sofa,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface LeasePreviewCardProps {
  lease: any;
}

export function LeasePreviewCard({ lease }: LeasePreviewCardProps) {
  const property = lease.unit.property;
  const unit = lease.unit;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: { variant: "secondary", label: "Draft" },
      PENDING_SIGNATURE: { variant: "outline", label: "Pending Signature" },
      ACTIVE: { variant: "default", label: "Active" },
      EXPIRING_SOON: { variant: "destructive", label: "Expiring Soon" },
      EXPIRED: { variant: "secondary", label: "Expired" },
      TERMINATED: { variant: "outline", label: "Terminated" },
    };

    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const allTenantsSigned = lease.tenants.every((t: any) => t.signedAt);
  const signedTenantsCount = lease.tenants.filter((t: any) => t.signedAt).length;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lease Status</p>
              <div className="flex items-center gap-2">
                {getStatusBadge(lease.status)}
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">Signing Progress</p>
              <div className="flex items-center gap-2">
                {lease.landlordSignedAt ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Landlord Signed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Landlord Pending</span>
                  </div>
                )}
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">
                  {signedTenantsCount}/{lease.tenants.length} Tenants
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Home className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="tenants">
            <Users className="h-4 w-4 mr-2" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="property">
            <Building2 className="h-4 w-4 mr-2" />
            Property
          </TabsTrigger>
          <TabsTrigger value="terms">
            <FileText className="h-4 w-4 mr-2" />
            Terms
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Property Image */}
            <Card>
              <CardContent className="p-0">
                {property.images[0] ? (
                  <div className="relative h-64 rounded-t-lg overflow-hidden">
                    <Image
                      src={property.images[0].url}
                      alt={property.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-muted rounded-t-lg flex items-center justify-center">
                    <Home className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg">{property.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {property.address}, {property.city}, {property.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    <span>Unit {unit.unitNumber}</span>
                    <span>•</span>
                    <span>{unit.bedrooms} bed</span>
                    <span>•</span>
                    <span>{unit.bathrooms} bath</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Information */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lease Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Start Date</span>
                    <div className="flex items-center gap-1 font-medium">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(lease.startDate), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">End Date</span>
                    <div className="flex items-center gap-1 font-medium">
                      <Calendar className="h-4 w-4" />
                      {lease.endDate
                        ? format(new Date(lease.endDate), "MMM d, yyyy")
                        : "Month-to-Month"}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lease Type</span>
                    <Badge variant="outline">{lease.type.replace("_", " ")}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Rent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold flex items-center justify-center">
                        <DollarSign className="h-8 w-8" />
                        {lease.rentAmount.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Due on the {lease.rentDueDay}
                        {lease.rentDueDay === 1
                          ? "st"
                          : lease.rentDueDay === 2
                          ? "nd"
                          : lease.rentDueDay === 3
                          ? "rd"
                          : "th"}{" "}
                        of each month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rent & Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="text-xl font-bold">
                    ${lease.rentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Security Deposit</span>
                  <span className="font-semibold">${lease.deposit.toLocaleString()}</span>
                </div>
                {lease.lateFeeAmount && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Late Fee</span>
                        <span className="font-semibold">
                          ${lease.lateFeeAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Charged after {lease.lateFeeDays} days past due date
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Frequency</span>
                  <span className="font-medium">{lease.paymentFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Due Day</span>
                  <span className="font-medium">
                    Day {lease.rentDueDay} of each month
                  </span>
                </div>
                <Separator />
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    First payment due: {format(new Date(lease.startDate), "MMMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Lease Holders ({lease.tenants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lease.tenants.map((leaseTenant: any) => (
                  <div
                    key={leaseTenant.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            leaseTenant.tenant.user.avatar ||
                            leaseTenant.tenant.user.image
                          }
                        />
                        <AvatarFallback>
                          {leaseTenant.tenant.user.name?.[0] || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {leaseTenant.tenant.user.name}
                          </p>
                          {leaseTenant.isPrimaryTenant && (
                            <Badge variant="outline">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {leaseTenant.tenant.user.email}
                        </p>
                        {leaseTenant.tenant.user.phone && (
                          <p className="text-sm text-muted-foreground">
                            {leaseTenant.tenant.user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {leaseTenant.signedAt ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">Signed</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(leaseTenant.signedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="secondary">Pending Signature</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Landlord</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {property.landlord.user.name?.[0] || "L"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{property.landlord.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.landlord.user.email}
                    </p>
                    {property.landlord.user.phone && (
                      <p className="text-sm text-muted-foreground">
                        {property.landlord.user.phone}
                      </p>
                    )}
                  </div>
                </div>
                {lease.landlordSignedAt ? (
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Signed</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(lease.landlordSignedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                ) : (
                  <Badge variant="secondary">Pending Signature</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Tab */}
        <TabsContent value="property" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Unit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="text-2xl font-bold">{unit.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="text-2xl font-bold">{unit.bathrooms}</p>
                </div>
                {unit.squareFeet && (
                  <div>
                    <p className="text-sm text-muted-foreground">Square Feet</p>
                    <p className="text-2xl font-bold">{unit.squareFeet}</p>
                  </div>
                )}
                {unit.floor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Floor</p>
                    <p className="text-2xl font-bold">{unit.floor}</p>
                  </div>
                )}
              </div>

              {unit.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{unit.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {unit.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sofa className="h-5 w-5 mr-2" />
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {unit.amenities.map((ua: any) => (
                    <div key={ua.id} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{ua.amenity.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {unit.parkingSpaces && unit.parkingSpaces.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Parking Spaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unit.parkingSpaces.map((space: any) => (
                    <div
                      key={space.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Space {space.spaceNumber}</p>
                        <p className="text-sm text-muted-foreground">{space.type}</p>
                      </div>
                      {space.monthlyFee && (
                        <p className="font-semibold">${space.monthlyFee}/mo</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {property.policies && property.policies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.policies.map((policy: any) => (
                    <div key={policy.id} className="space-y-1">
                      <p className="font-medium">{policy.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {policy.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lease Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              {lease.terms ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: lease.terms }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Standard lease terms apply. Please contact the landlord for specific
                  terms and conditions.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}