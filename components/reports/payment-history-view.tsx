/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/payment-history-view.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface PaymentHistoryViewProps {
  data: any;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const statusClass: Record<string, string> = {
  COMPLETED:  "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  FAILED:     "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  PENDING:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
};

export function PaymentHistoryView({ data }: PaymentHistoryViewProps) {
  const { summary, byStatus, byMethod, payments } = data;

  if (!summary || !payments) {
    return <div className="text-center py-12 text-sm text-muted-foreground">No payment data available</div>;
  }

  return (
    <div className="space-y-6">

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalPayments}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg {formatCurrency(summary.avgPaymentAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">Net {formatCurrency(summary.netAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{summary.completedPayments}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((summary.completedPayments / summary.totalPayments) * 100).toFixed(0)}% success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{summary.failedPayments}</p>
            <p className="text-xs text-muted-foreground mt-1">Processing issues</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Status + method breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Object.entries(byStatus).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between gap-4 px-6 py-4">
                  <Badge className={statusClass[status] ?? "bg-gray-100 text-gray-800"}>
                    {status}
                  </Badge>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${(count / summary.totalPayments) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Breakdown by payment method</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Object.entries(byMethod).map(([method, count]: [string, any]) => (
                <div key={method} className="flex items-center justify-between gap-4 px-6 py-4">
                  <span className="text-sm font-medium w-36 shrink-0">
                    {method.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{ width: `${(count / summary.totalPayments) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Payment history table ── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Complete payment transaction log</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No payments found for this period
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <div className="grid grid-cols-[1fr_1.2fr_1.5fr_0.8fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>Date</span>
                  <span>Tenant</span>
                  <span>Property</span>
                  <span>Unit</span>
                  <span>Type</span>
                  <span>Method</span>
                  <span>Status</span>
                  <span className="text-right">Amount</span>
                </div>
                {payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="grid grid-cols-[1fr_1.2fr_1.5fr_0.8fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-3 border-b last:border-0 items-center"
                  >
                    <p className="text-sm">{format(new Date(payment.date), "MMM d, yyyy")}</p>
                    <p className="text-sm font-medium truncate">{payment.tenantName}</p>
                    <p className="text-sm truncate">{payment.propertyName}</p>
                    <p className="text-sm">{payment.unitNumber}</p>
                    <p className="text-sm">{payment.type}</p>
                    <p className="text-xs text-muted-foreground">{payment.method.replace(/_/g, " ")}</p>
                    <Badge className={statusClass[payment.status] ?? "bg-gray-100 text-gray-800"}>
                      {payment.status}
                    </Badge>
                    <p className="text-sm font-medium text-right">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
              <div className="md:hidden divide-y">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="px-6 py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{payment.tenantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.propertyName} · Unit {payment.unitNumber}
                        </p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.date), "MMM d, yyyy")} · {payment.type}
                      </p>
                      <Badge className={`${statusClass[payment.status] ?? ""} text-xs`}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}