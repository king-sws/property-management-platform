/* eslint-disable @typescript-eslint/no-explicit-any */
// components/lease/lease-overview.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { requestLeaseRenewal } from "@/actions/my-lease";
import { useState } from "react";
import { toast } from "sonner";

interface LeaseOverviewProps {
  lease: any;
}

export function LeaseOverview({ lease }: LeaseOverviewProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const property = lease.lease.unit.property;
  const unit = lease.lease.unit;
  const primaryImage = property.images[0]?.url || "/placeholder-property.jpg";

  const handleRequestRenewal = async () => {
    setIsRequesting(true);
    const result = await requestLeaseRenewal(lease.lease.id);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
    setIsRequesting(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Property Image */}
          <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
            <Image
              src={primaryImage}
              alt={property.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Lease Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold">{property.name}</h2>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {property.address}, {property.city}, {property.state}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    lease.lease.status === "ACTIVE"
                      ? "default"
                      : lease.lease.status === "EXPIRING_SOON"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {lease.lease.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Unit {unit.unitNumber}</span>
                <span>•</span>
                <span>{unit.bedrooms} bed</span>
                <span>•</span>
                <span>{unit.bathrooms} bath</span>
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Monthly Rent</div>
                <div className="text-2xl font-bold flex items-center">
                  <DollarSign className="h-5 w-5" />
                  {lease.lease.rentAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Lease Start</div>
                <div className="text-lg font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(lease.lease.startDate), "MMM d, yyyy")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Lease End</div>
                <div className="text-lg font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {lease.lease.endDate
                    ? format(new Date(lease.lease.endDate), "MMM d, yyyy")
                    : "Month-to-Month"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Co-tenants</div>
                <div className="text-lg font-semibold flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {lease.lease.tenants.length}
                </div>
              </div>
            </div>

            {/* Lease Progress */}
            {lease.lease.endDate && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lease Progress</span>
                  <span className="font-medium">
                    {lease.leaseProgress.daysRemaining} days remaining
                  </span>
                </div>
                <Progress value={lease.leaseProgress.percentage} className="h-2" />
              </div>
            )}

            {/* Alerts & Actions */}
            <div className="flex flex-wrap gap-3">
              {lease.leaseProgress.isExpiringSoon && (
                <Button
                  onClick={handleRequestRenewal}
                  disabled={isRequesting}
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Request Renewal
                </Button>
              )}
              
              {lease.hasUnresolvedViolations && (
                <div className="flex items-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>You have unresolved violations</span>
                </div>
              )}
              
              {lease.hasPendingRenewalOffer && (
                <div className="flex items-center text-sm text-blue-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>You have a pending renewal offer</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
