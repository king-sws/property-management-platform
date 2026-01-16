/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payments/landlord-payments-client.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Plus,
  Download,
  Filter,
  Banknote
} from "lucide-react";
import { PaymentsTable } from "./payments-table";
import { CreatePaymentDialog } from "./create-payment-dialog";
import { RecordManualPaymentDialog } from "./record-manual-payment-dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { useRouter } from "next/navigation";

interface LandlordPaymentsClientProps {
  initialPayments: any[];
  statistics: any;
}

export function LandlordPaymentsClient({ 
  initialPayments, 
  statistics 
}: LandlordPaymentsClientProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredPayments = initialPayments.filter((payment) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return payment.status === "PENDING";
    if (activeTab === "completed") return payment.status === "COMPLETED";
    if (activeTab === "overdue") {
      return (
        payment.status === "PENDING" &&
        payment.dueDate &&
        new Date(payment.dueDate) < new Date()
      );
    }
    return true;
  });

  const pendingCashPayments = initialPayments.filter(
  p => p.status === "PROCESSING" && p.method === "CASH"
);

  const router = useRouter();


  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(statistics.totalCollected)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.thisMonthCollected)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Current month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(statistics.pendingAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.overdueCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Past due date</p>
            </CardContent>
          </Card>
        </div>
      )}


{pendingCashPayments.length > 0 && (
  <Alert
    className="
      flex items-center gap-3
      border-blue-500/40 bg-blue-50 text-blue-900
      dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200
    "
  >
    <Banknote className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

    <AlertDescription className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span>
        You have <strong>{pendingCashPayments.length}</strong> cash payment
        {pendingCashPayments.length !== 1 ? 's' : ''} waiting for confirmation
      </span>

      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          router.push(`/dashboard/payments/${pendingCashPayments[0].id}`)
        }
      >
        Review Now
      </Button>
    </AlertDescription>
  </Alert>
)}




      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Create charges, record payments, and track income
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualDialog(true)}
              >
                Record Payment
              </Button>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Charge
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All ({initialPayments.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending (
                {initialPayments.filter((p) => p.status === "PENDING").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed (
                {initialPayments.filter((p) => p.status === "COMPLETED").length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue (
                {
                  initialPayments.filter(
                    (p) =>
                      p.status === "PENDING" &&
                      p.dueDate &&
                      new Date(p.dueDate) < new Date()
                  ).length
                }
                )
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <PaymentsTable payments={filteredPayments} role="LANDLORD" />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreatePaymentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      <RecordManualPaymentDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
      />
    </div>
  );
}