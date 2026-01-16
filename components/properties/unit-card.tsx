// ============================================================================
// FILE: src/components/properties/unit-card.tsx
// Unit Card Component - FIXED: Accept numbers instead of Decimals
// ============================================================================

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Bath, DollarSign, User } from "lucide-react";
import Link from "next/link";

interface UnitCardProps {
  unit: {
    id: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number; // Changed from Decimal to number
    squareFeet?: number | null;
    rentAmount: number; // Changed from Decimal to number
    deposit: number; // Changed from Decimal to number
    status: string;
    leases?: Array<{
      id: string;
      tenants: Array<{
        tenant: {
          user: {
            name: string | null;
          };
        };
      }>;
    }>;
  };
  propertyId: string;
}

const statusConfig = {
  VACANT: { label: "Vacant", color: "bg-yellow-100 text-yellow-800" },
  OCCUPIED: { label: "Occupied", color: "bg-green-100 text-green-800" },
  MAINTENANCE: { label: "Maintenance", color: "bg-orange-100 text-orange-800" },
  UNAVAILABLE: { label: "Unavailable", color: "bg-gray-100 text-gray-800" },
};

export default function UnitCard({ unit, propertyId }: UnitCardProps) {
  const status = statusConfig[unit.status as keyof typeof statusConfig];
  const activeLease = unit.leases?.[0];
  const tenant = activeLease?.tenants[0]?.tenant.user.name;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-50">
              Unit {unit.unitNumber}
            </h3>
            {tenant && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <User className="w-3 h-3" />
                <span>{tenant}</span>
              </div>
            )}
          </div>
          <Badge className={status.color}>{status.label}</Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Bed className="w-4 h-4" />
              <span>{unit.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Bath className="w-4 h-4" />
              <span>{unit.bathrooms} bath</span>
            </div>
            {unit.squareFeet && (
              <span className="text-gray-600">{unit.squareFeet} sq ft</span>
            )}
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Monthly Rent:</span>
              <span className="font-bold text-gray-900 dark:text-cyan-100">
                ${unit.rentAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Deposit: ${unit.deposit.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/properties/${propertyId}/units/${unit.id}`}
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          {unit.status === "VACANT" && (
            <Link
              href={`/dashboard/leases/new?unit=${unit.id}`}
              className="flex-1"
            >
              <Button size="sm" className="w-full">
                Create Lease
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}