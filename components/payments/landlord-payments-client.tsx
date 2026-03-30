/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payments/landlord-payments-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, TrendingUp, Clock, AlertCircle,
  Plus, Download, Filter, Banknote,
} from "lucide-react";
import { PaymentsTable } from "./payments-table";
import { CreatePaymentDialog } from "./create-payment-dialog";
import { RecordManualPaymentDialog } from "./record-manual-payment-dialog";
import { Alert, AlertDescription } from "../ui/alert";

interface LandlordPaymentsClientProps {
  initialPayments: any[];
  statistics: any;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export function LandlordPaymentsClient({ initialPayments, statistics }: LandlordPaymentsClientProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredPayments = initialPayments.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return p.status === "PENDING";
    if (activeTab === "completed") return p.status === "COMPLETED";
    if (activeTab === "overdue") return p.status === "PENDING" && p.dueDate && new Date(p.dueDate) < new Date();
    return true;
  });

  const pendingCashPayments = initialPayments.filter(
    (p) => p.status === "PROCESSING" && p.method === "CASH"
  );

  const overdueCount = initialPayments.filter(
    (p) => p.status === "PENDING" && p.dueDate && new Date(p.dueDate) < new Date()
  ).length;

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Collected",
              value: formatCurrency(statistics.totalCollected),
              sub: "All time",
              icon: DollarSign,
              valueClass: "text-green-600",
            },
            {
              title: "This Month",
              value: formatCurrency(statistics.thisMonthCollected),
              sub: "Current month",
              icon: TrendingUp,
              valueClass: "",
            },
            {
              title: "Pending",
              value: formatCurrency(statistics.pendingAmount),
              sub: "Awaiting payment",
              icon: Clock,
              valueClass: "text-yellow-600",
            },
            {
              title: "Overdue",
              value: statistics.overdueCount,
              sub: "Past due date",
              icon: AlertCircle,
              valueClass: "text-destructive",
            },
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
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Cash pending alert ── */}
      {pendingCashPayments.length > 0 && (
        <Alert className="flex items-center gap-3 border-blue-500/40 bg-blue-50 text-blue-900 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200">
          <Banknote className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <strong>{pendingCashPayments.length}</strong> cash payment
              {pendingCashPayments.length !== 1 ? "s" : ""} waiting for confirmation
            </span>
            <Button size="sm" variant="secondary" onClick={() => router.push(`/dashboard/payments/${pendingCashPayments[0].id}`)}>
              Review Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Main payments card ── */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Create charges, record payments, and track income
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowManualDialog(true)}>
                Record Payment
              </Button>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />Create Charge
              </Button>
            </div>
          </div>

          {/* Tabs inside header */}
          <div className="pt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-1.5 text-xs">{initialPayments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <Badge variant="secondary" className="ml-1.5 text-xs">
                    {initialPayments.filter((p) => p.status === "PENDING").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  <Badge variant="secondary" className="ml-1.5 text-xs">
                    {initialPayments.filter((p) => p.status === "COMPLETED").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  Overdue
                  {overdueCount > 0 && (
                    <Badge variant="destructive" className="ml-1.5 text-xs">{overdueCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <PaymentsTable payments={filteredPayments} role="LANDLORD" />
        </CardContent>
      </Card>

      <CreatePaymentDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      <RecordManualPaymentDialog open={showManualDialog} onOpenChange={setShowManualDialog} />
    </div>
  );
}