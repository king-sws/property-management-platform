/* eslint-disable @typescript-eslint/no-explicit-any */

// components/lease/lease-details.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Users,
  Car,
  Sofa,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

interface LeaseDetailsProps {
  lease: any;
}

export function LeaseDetails({ lease }: LeaseDetailsProps) {
  const { lease: leaseData } = lease;
  const unit = leaseData.unit;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Lease Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Lease Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Lease Type</div>
              <div className="font-medium">
                {leaseData.type.replace("_", " ")}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Rent Due</div>
              <div className="font-medium">
                {leaseData.rentDueDay}
                {leaseData.rentDueDay === 1 ? "st" : leaseData.rentDueDay === 2 ? "nd" : leaseData.rentDueDay === 3 ? "rd" : "th"} of each month
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Rent</span>
              <span className="font-semibold">${leaseData.rentAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Deposit</span>
              <span className="font-semibold">${leaseData.deposit.toLocaleString()}</span>
            </div>
            {leaseData.lateFeeAmount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Late Fee</span>
                <span className="font-semibold">
                  ${leaseData.lateFeeAmount} (after {leaseData.lateFeeDays} days)
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Start Date</div>
              <div className="font-medium">
                {format(new Date(leaseData.startDate), "MMM d, yyyy")}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">End Date</div>
              <div className="font-medium">
                {leaseData.endDate
                  ? format(new Date(leaseData.endDate), "MMM d, yyyy")
                  : "Month-to-Month"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Co-Tenants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Co-Tenants ({leaseData.tenants.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {leaseData.tenants.map((leaseTenant: any) => (
            <div
              key={leaseTenant.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={leaseTenant.tenant.user.avatar || leaseTenant.tenant.user.image}
                  />
                  <AvatarFallback>
                    {leaseTenant.tenant.user.name?.[0] || "T"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {leaseTenant.tenant.user.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {leaseTenant.tenant.user.email}
                  </div>
                </div>
              </div>
              {leaseTenant.isPrimaryTenant && (
                <Badge variant="outline">Primary</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Unit Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sofa className="h-5 w-5 mr-2" />
            Amenities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {unit.amenities.map((unitAmenity: any) => (
              <div
                key={unitAmenity.id}
                className="flex items-center gap-2 text-sm"
              >
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>{unitAmenity.amenity.name}</span>
              </div>
            ))}
            {unit.amenities.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2">
                No amenities listed
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parking */}
      {unit.parkingSpaces && unit.parkingSpaces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Parking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unit.parkingSpaces.map((space: any) => (
              <div
                key={space.id}
                className="flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">Space {space.spaceNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {space.type}
                  </div>
                </div>
                {space.monthlyFee && (
                  <div className="text-sm font-medium">
                    ${space.monthlyFee}/mo
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Violations */}
      {lease.hasUnresolvedViolations && (
        <Card className="md:col-span-2 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Unresolved Violations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaseData.violations.map((violation: any) => (
              <div
                key={violation.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{violation.type}</div>
                    <div className="text-sm text-muted-foreground">
                      Issued {format(new Date(violation.issuedDate), "MMM d, yyyy")}
                    </div>
                  </div>
                  <Badge variant="destructive">{violation.severity}</Badge>
                </div>
                <p className="text-sm">{violation.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}