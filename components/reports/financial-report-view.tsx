/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/financial-report-view.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { format } from "date-fns";

interface FinancialReportViewProps {
  data: any;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export function FinancialReportView({ data }: FinancialReportViewProps) {
  const { summary, incomeByType, expensesByCategory, byProperty, payments, expenses } = data;

  return (
    <div className="space-y-6">

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Income",   value: formatCurrency(summary.totalIncome),   valueClass: "text-green-600", icon: DollarSign },
          { title: "Total Expenses", value: formatCurrency(summary.totalExpenses),  valueClass: "text-destructive", icon: Wallet },
          {
            title: "Net Income",
            value: formatCurrency(summary.netIncome),
            valueClass: summary.netIncome >= 0 ? "text-green-600" : "text-destructive",
            icon: summary.netIncome >= 0 ? TrendingUp : TrendingDown,
          },
          { title: "Profit Margin",  value: `${summary.profitMargin.toFixed(1)}%`, valueClass: "", icon: TrendingUp },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${card.valueClass}`}>{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Income + Expenses breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Income by Type</CardTitle>
            <CardDescription>Breakdown of income sources</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Object.entries(incomeByType).map(([type, amount]: [string, any]) => (
                <div key={type} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm font-medium">{type}</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Breakdown of expenses</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Object.entries(expensesByCategory).map(([category, amount]: [string, any]) => (
                <div key={category} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm font-semibold text-destructive">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Performance by property ── */}
      {byProperty.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Performance by Property</CardTitle>
            <CardDescription>Financial breakdown for each property</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden md:block">
              <div className="grid grid-cols-4 gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Property</span>
                <span className="text-right">Income</span>
                <span className="text-right">Expenses</span>
                <span className="text-right">Net Income</span>
              </div>
              {byProperty.map((property: any) => (
                <div
                  key={property.propertyId}
                  className="grid grid-cols-4 gap-4 px-6 py-3 border-b last:border-0 items-center"
                >
                  <p className="text-sm font-medium">{property.propertyName}</p>
                  <p className="text-sm text-right text-green-600">{formatCurrency(property.income)}</p>
                  <p className="text-sm text-right text-destructive">{formatCurrency(property.expenses)}</p>
                  <p className={`text-sm text-right font-semibold ${property.netIncome >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {formatCurrency(property.netIncome)}
                  </p>
                </div>
              ))}
            </div>
            <div className="md:hidden divide-y">
              {byProperty.map((property: any) => (
                <div key={property.propertyId} className="px-6 py-4 space-y-2">
                  <p className="text-sm font-semibold">{property.propertyName}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Income</span>
                    <span className="text-green-600 font-medium">{formatCurrency(property.income)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Expenses</span>
                    <span className="text-destructive font-medium">{formatCurrency(property.expenses)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Net</span>
                    <span className={`font-semibold ${property.netIncome >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {formatCurrency(property.netIncome)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recent payments ── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Date</span>
              <span>Property</span>
              <span>Type</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>
            {payments.slice(0, 10).map((payment: any) => (
              <div
                key={payment.id}
                className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b last:border-0 items-center"
              >
                <p className="text-sm">{format(new Date(payment.createdAt), "MMM d, yyyy")}</p>
                <p className="text-sm truncate">{payment.lease?.unit?.property?.name || "N/A"}</p>
                <p className="text-sm">{payment.type}</p>
                <div>
                  <Badge className={
                    payment.status === "COMPLETED" ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" :
                    payment.status === "FAILED"    ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300" :
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300"
                  }>
                    {payment.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-right">{formatCurrency(Number(payment.netAmount))}</p>
              </div>
            ))}
          </div>
          <div className="md:hidden divide-y">
            {payments.slice(0, 10).map((payment: any) => (
              <div key={payment.id} className="px-6 py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{payment.lease?.unit?.property?.name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(payment.createdAt), "MMM d, yyyy")} · {payment.type}</p>
                </div>
                <p className="text-sm font-semibold shrink-0">{formatCurrency(Number(payment.netAmount))}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Recent expenses ── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Latest expense records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_1.5fr_1fr_2fr_1fr] gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Date</span>
              <span>Property</span>
              <span>Category</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
            </div>
            {expenses.slice(0, 10).map((expense: any) => (
              <div
                key={expense.id}
                className="grid grid-cols-[1fr_1.5fr_1fr_2fr_1fr] gap-4 px-6 py-3 border-b last:border-0 items-center"
              >
                <p className="text-sm">{format(new Date(expense.date), "MMM d, yyyy")}</p>
                <p className="text-sm truncate">{expense.property?.name || "N/A"}</p>
                <p className="text-sm">{expense.category}</p>
                <p className="text-sm truncate">{expense.description}</p>
                <p className="text-sm font-medium text-right text-destructive">{formatCurrency(Number(expense.amount))}</p>
              </div>
            ))}
          </div>
          <div className="md:hidden divide-y">
            {expenses.slice(0, 10).map((expense: any) => (
              <div key={expense.id} className="px-6 py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(expense.date), "MMM d, yyyy")} · {expense.category}</p>
                </div>
                <p className="text-sm font-semibold text-destructive shrink-0">{formatCurrency(Number(expense.amount))}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}