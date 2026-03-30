/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/rent-roll-view.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";

interface RentRollViewProps {
  data: any;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export function RentRollView({ data }: RentRollViewProps) {
  const { summary, rentRoll } = data;

  if (!summary || !rentRoll) {
    return <div className="text-center py-12 text-sm text-muted-foreground">No rent roll data available</div>;
  }

  const fixedTerm   = rentRoll.filter((l: any) => l.leaseEndDate).length;
  const monthToMonth = rentRoll.filter((l: any) => !l.leaseEndDate).length;

  const rentRanges = [
    { label: "Under $1,000",    min: 0,    max: 1000 },
    { label: "$1,000 – $1,500", min: 1000, max: 1500 },
    { label: "$1,500 – $2,000", min: 1500, max: 2000 },
    { label: "Over $2,000",     min: 2000, max: Infinity },
  ];

  return (
    <div className="space-y-6">

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalLeases}</p>
            <p className="text-xs text-muted-foreground mt-1">Current active leases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalMonthlyRent)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total monthly income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalDeposits)}</p>
            <p className="text-xs text-muted-foreground mt-1">Security deposits held</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Rent roll table ── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Current Rent Roll</CardTitle>
          <CardDescription>Complete list of active leases and tenants</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rentRoll.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No active leases found</div>
          ) : (
            <>
              <div className="hidden lg:block">
                <div className="grid grid-cols-[1.5fr_0.8fr_1.2fr_1.2fr_1fr_1fr_1fr_1fr_0.8fr] gap-3 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>Property</span>
                  <span>Unit</span>
                  <span>Tenant</span>
                  <span>Contact</span>
                  <span>Start</span>
                  <span>End</span>
                  <span className="text-right">Rent</span>
                  <span className="text-right">Deposit</span>
                  <span>Status</span>
                </div>
                {rentRoll.map((lease: any, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1.5fr_0.8fr_1.2fr_1.2fr_1fr_1fr_1fr_1fr_0.8fr] gap-3 px-6 py-3 border-b last:border-0 items-center"
                  >
                    <p className="text-sm font-medium truncate">{lease.propertyName}</p>
                    <p className="text-sm">{lease.unitNumber}</p>
                    <p className="text-sm font-medium truncate">{lease.tenantName}</p>
                    <p className="text-xs text-muted-foreground truncate">{lease.tenantEmail}</p>
                    <p className="text-sm">{format(new Date(lease.leaseStartDate), "MMM d, yyyy")}</p>
                    <p className="text-sm">
                      {lease.leaseEndDate ? format(new Date(lease.leaseEndDate), "MMM d, yyyy") : "M-t-M"}
                    </p>
                    <p className="text-sm font-medium text-right text-green-600">{formatCurrency(lease.monthlyRent)}</p>
                    <p className="text-sm text-right">{formatCurrency(lease.deposit)}</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 text-xs">
                      {lease.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="lg:hidden divide-y">
                {rentRoll.map((lease: any, index: number) => (
                  <div key={index} className="px-6 py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{lease.tenantName}</p>
                        <p className="text-xs text-muted-foreground">{lease.propertyName} · Unit {lease.unitNumber}</p>
                      </div>
                      <p className="text-sm font-semibold text-green-600 shrink-0">{formatCurrency(lease.monthlyRent)}/mo</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(lease.leaseStartDate), "MMM d, yyyy")} →{" "}
                      {lease.leaseEndDate ? format(new Date(lease.leaseEndDate), "MMM d, yyyy") : "Month-to-month"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Lease term + rent range distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Lease Terms</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { label: "Fixed Term",     count: fixedTerm,    color: "bg-blue-600" },
                { label: "Month-to-Month", count: monthToMonth, color: "bg-green-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 px-6 py-4">
                  <span className="text-sm font-medium w-36 shrink-0">{item.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className={`${item.color} h-1.5 rounded-full`}
                      style={{ width: `${rentRoll.length ? (item.count / rentRoll.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right shrink-0">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Rent Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {rentRanges.map((range) => {
                const count = rentRoll.filter(
                  (l: any) => l.monthlyRent >= range.min && l.monthlyRent < range.max
                ).length;
                return (
                  <div key={range.label} className="flex items-center justify-between gap-4 px-6 py-4">
                    <span className="text-sm font-medium w-36 shrink-0">{range.label}</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full"
                        style={{ width: `${rentRoll.length ? (count / rentRoll.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}