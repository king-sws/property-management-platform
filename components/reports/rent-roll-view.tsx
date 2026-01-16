/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/rent-roll-view.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface RentRollViewProps {
  data: any;
}

export function RentRollView({ data }: RentRollViewProps) {
  const { summary, rentRoll } = data;

  // Guard against undefined data
  if (!summary || !rentRoll) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No rent roll data available
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalLeases}</div>
            <p className="text-xs text-muted-foreground mt-1">Current active leases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalMonthlyRent)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total monthly income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalDeposits)}</div>
            <p className="text-xs text-muted-foreground mt-1">Security deposits held</p>
          </CardContent>
        </Card>
      </div>

      {/* Rent Roll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Rent Roll</CardTitle>
          <CardDescription>Complete list of active leases and tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Lease Start</TableHead>
                <TableHead>Lease End</TableHead>
                <TableHead className="text-right">Monthly Rent</TableHead>
                <TableHead className="text-right">Deposit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentRoll.map((lease: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{lease.propertyName}</TableCell>
                  <TableCell>{lease.unitNumber}</TableCell>
                  <TableCell>{lease.tenantName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lease.tenantEmail}
                  </TableCell>
                  <TableCell>{format(new Date(lease.leaseStartDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {lease.leaseEndDate
                      ? format(new Date(lease.leaseEndDate), "MMM d, yyyy")
                      : "Month-to-Month"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(lease.monthlyRent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(lease.deposit)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {lease.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rentRoll.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No active leases found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lease Terms Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const fixedTerm = rentRoll.filter((l: any) => l.leaseEndDate).length;
                const monthToMonth = rentRoll.filter((l: any) => !l.leaseEndDate).length;

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fixed Term Leases</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(fixedTerm / rentRoll.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {fixedTerm}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Month-to-Month</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(monthToMonth / rentRoll.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {monthToMonth}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rent Range Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const ranges = [
                  { label: "Under $1,000", min: 0, max: 1000 },
                  { label: "$1,000 - $1,500", min: 1000, max: 1500 },
                  { label: "$1,500 - $2,000", min: 1500, max: 2000 },
                  { label: "Over $2,000", min: 2000, max: Infinity },
                ];

                return ranges.map((range) => {
                  const count = rentRoll.filter(
                    (l: any) => l.monthlyRent >= range.min && l.monthlyRent < range.max
                  ).length;

                  return (
                    <div key={range.label} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{range.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(count / rentRoll.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">{count}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
