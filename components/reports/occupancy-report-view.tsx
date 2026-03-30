/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/occupancy-report-view.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Users, DollarSign, AlertCircle } from "lucide-react";

interface OccupancyReportViewProps {
  data: any;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export function OccupancyReportView({ data }: OccupancyReportViewProps) {
  const { summary, properties } = data;

  if (!summary || !properties) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        No occupancy data available
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalUnits}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across {summary.totalProperties} properties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{summary.occupiedUnits}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((summary.occupiedUnits / summary.totalUnits) * 100).toFixed(1)}% occupancy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{summary.vacantUnits}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(summary.totalLostRent)} lost/mo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalActualRent)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatCurrency(summary.totalPotentialRent)} potential
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Property breakdown ── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Occupancy by Property</CardTitle>
          <CardDescription>Detailed breakdown for each property</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr] gap-3 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Property</span>
              <span className="text-center">Total</span>
              <span className="text-center">Occupied</span>
              <span className="text-center">Vacant</span>
              <span className="text-center">Rate</span>
              <span className="text-right">Actual Rent</span>
              <span className="text-right">Lost Rent</span>
            </div>
            {properties.map((property: any) => (
              <div
                key={property.propertyId}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr] gap-3 px-6 py-4 border-b last:border-0 items-center"
              >
                <p className="text-sm font-medium">{property.propertyName}</p>
                <p className="text-sm text-center">{property.totalUnits}</p>
                <div className="flex justify-center">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                    {property.occupiedUnits}
                  </Badge>
                </div>
                <div className="flex justify-center">
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
                    {property.vacantUnits}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${property.occupancyRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-10 shrink-0">
                    {property.occupancyRate.toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-right text-green-600 font-medium">
                  {formatCurrency(property.actualRent)}
                </p>
                <p className="text-sm text-right text-destructive font-medium">
                  {formatCurrency(property.lostRent)}
                </p>
              </div>
            ))}
          </div>
          <div className="md:hidden divide-y">
            {properties.map((property: any) => (
              <div key={property.propertyId} className="px-6 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{property.propertyName}</p>
                  <span className="text-xs font-medium">{property.occupancyRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${property.occupancyRate}%` }} />
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="text-green-600 font-medium">{property.occupiedUnits} occupied</span>
                  <span className="text-orange-600 font-medium">{property.vacantUnits} vacant</span>
                  <span className="ml-auto">{formatCurrency(property.actualRent)}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Unit details per property ── */}
      {properties.map((property: any) => (
        <Card key={`units-${property.propertyId}`}>
          <CardHeader className="border-b">
            <CardTitle>{property.propertyName} — Units</CardTitle>
            <CardDescription>Status of individual units</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden md:block">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Unit</span>
                <span>Status</span>
                <span>Occupied</span>
                <span className="text-right">Rent</span>
                <span>Lease End</span>
              </div>
              {property.units.map((unit: any) => (
                <div
                  key={unit.unitNumber}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b last:border-0 items-center"
                >
                  <p className="text-sm font-medium">{unit.unitNumber}</p>
                  <Badge className={
                    unit.status === "VACANT"   ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300" :
                    unit.status === "OCCUPIED" ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" :
                    "bg-gray-100 text-gray-800"
                  }>
                    {unit.status}
                  </Badge>
                  <Badge variant={unit.isOccupied ? "default" : "outline"}>
                    {unit.isOccupied ? "Occupied" : "Vacant"}
                  </Badge>
                  <p className="text-sm font-medium text-right">{formatCurrency(unit.rentAmount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {unit.currentLease?.endDate
                      ? new Date(unit.currentLease.endDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
            <div className="md:hidden divide-y">
              {property.units.map((unit: any) => (
                <div key={unit.unitNumber} className="px-6 py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Unit {unit.unitNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {unit.currentLease?.endDate ? `Ends ${new Date(unit.currentLease.endDate).toLocaleDateString()}` : "No end date"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={unit.isOccupied ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                      {unit.isOccupied ? "Occupied" : "Vacant"}
                    </Badge>
                    <p className="text-sm font-medium">{formatCurrency(unit.rentAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}