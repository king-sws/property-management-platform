/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// FILE: components/lease/lease-history.tsx
// FIXED - Properly handles serialized date strings from server
// ============================================================================
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import Image from "next/image";

interface LeaseHistoryProps {
  leases: any[];
}

export function LeaseHistory({ leases }: LeaseHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "EXPIRING_SOON":
        return "destructive";
      case "EXPIRED":
        return "secondary";
      case "TERMINATED":
        return "outline";
      default:
        return "secondary";
    }
  };

  // ✅ FIXED: Helper to safely parse dates (handles both Date objects and ISO strings)
  const safeFormatDate = (date: string | Date, formatStr: string) => {
    try {
      // If it's already a Date object, use it directly
      if (date instanceof Date) {
        return format(date, formatStr);
      }
      // If it's a string, parse it as ISO
      if (typeof date === "string") {
        return format(parseISO(date), formatStr);
      }
      return "N/A";
    } catch (error) {
      console.error("Date formatting error:", error, date);
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-4">
      {leases.map((leaseTenant) => {
        const lease = leaseTenant.lease;
        const property = lease.unit.property;
        const unit = lease.unit;
        const primaryImage = property.images?.[0]?.url || "/placeholder-property.jpg";

        return (
          <Card key={lease.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={primaryImage}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{property.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          {property.address}, {property.city}
                        </span>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(lease.status)}>
                      {lease.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Unit</div>
                      <div className="font-medium flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {unit.unitNumber}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground">Rent</div>
                      <div className="font-medium">
                        ${typeof lease.rentAmount === "number" 
                          ? lease.rentAmount.toLocaleString() 
                          : lease.rentAmount}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground">Start Date</div>
                      <div className="font-medium flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {safeFormatDate(lease.startDate, "MMM yyyy")}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground">End Date</div>
                      <div className="font-medium">
                        {lease.endDate
                          ? safeFormatDate(lease.endDate, "MMM yyyy")
                          : "Ongoing"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}