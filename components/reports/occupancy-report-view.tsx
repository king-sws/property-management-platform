/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/occupancy-report-view.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, DollarSign, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface OccupancyReportViewProps {
  data: any;
}

export function OccupancyReportView({ data }: OccupancyReportViewProps) {
  const { summary, properties } = data;

  // Guard against undefined data
  if (!summary || !properties) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No occupancy data available
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {summary.totalProperties} properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.occupiedUnits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((summary.occupiedUnits / summary.totalUnits) * 100).toFixed(1)}% occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vacant Units</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.vacantUnits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(summary.totalLostRent)} potential lost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalActualRent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatCurrency(summary.totalPotentialRent)} potential
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Occupancy by Property</CardTitle>
          <CardDescription>Detailed breakdown for each property</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="text-center">Total Units</TableHead>
                <TableHead className="text-center">Occupied</TableHead>
                <TableHead className="text-center">Vacant</TableHead>
                <TableHead className="text-center">Occupancy Rate</TableHead>
                <TableHead className="text-right">Actual Rent</TableHead>
                <TableHead className="text-right">Lost Rent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property: any) => (
                <TableRow key={property.propertyId}>
                  <TableCell className="font-medium">{property.propertyName}</TableCell>
                  <TableCell className="text-center">{property.totalUnits}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {property.occupiedUnits}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {property.vacantUnits}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${property.occupancyRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {property.occupancyRate.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {formatCurrency(property.actualRent)}
                  </TableCell>
                  <TableCell className="text-right text-red-600 font-medium">
                    {formatCurrency(property.lostRent)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unit Details */}
      {properties.map((property: any) => (
        <Card key={`units-${property.propertyId}`}>
          <CardHeader>
            <CardTitle>{property.propertyName} - Unit Details</CardTitle>
            <CardDescription>Status of individual units</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead className="text-right">Rent Amount</TableHead>
                  <TableHead>Lease End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {property.units.map((unit: any) => (
                  <TableRow key={unit.unitNumber}>
                    <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          unit.status === "VACANT"
                            ? "bg-orange-100 text-orange-800"
                            : unit.status === "OCCUPIED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={unit.isOccupied ? "default" : "outline"}
                        className={unit.isOccupied ? "bg-green-600" : ""}
                      >
                        {unit.isOccupied ? "Occupied" : "Vacant"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(unit.rentAmount)}
                    </TableCell>
                    <TableCell>
                      {unit.currentLease?.endDate
                        ? new Date(unit.currentLease.endDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
