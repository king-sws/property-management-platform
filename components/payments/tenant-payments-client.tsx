/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payments/tenant-payments-client.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle2,
  CreditCard,
  Calendar,
  Banknote
} from "lucide-react";
import { PaymentsTable } from "./payments-table";
import { CashPaymentDialog } from "./cash-payment-dialog";
import { format } from "date-fns";

interface TenantPaymentsClientProps {
  initialPayments: any[];
  statistics: any;
}

export function TenantPaymentsClient({ 
  initialPayments, 
  statistics 
}: TenantPaymentsClientProps) {
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const pendingPayments = initialPayments.filter(p => p.status === "PENDING");
  const upcomingPayment = pendingPayments.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  })[0];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(statistics.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time payments</p>
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
              <p className="text-xs text-muted-foreground mt-1">
                {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statistics.nextPayment ? (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(statistics.nextPayment.amount)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due {format(new Date(statistics.nextPayment.dueDate), "MMM d, yyyy")}
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">N/A</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Next Payment Card */}
      {upcomingPayment && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Payment</CardTitle>
                <CardDescription>
                  Your next payment is due soon
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Due {format(new Date(upcomingPayment.dueDate), "MMM d")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {upcomingPayment.type} - {upcomingPayment.lease?.unit?.property?.name}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(upcomingPayment.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Unit {upcomingPayment.lease?.unit?.unitNumber}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setSelectedPayment(upcomingPayment);
                    setShowCashDialog(true);
                  }}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Pay Cash
                </Button>
                <Button size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Online
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View all your past and pending payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsTable payments={initialPayments} role="TENANT" />
        </CardContent>
      </Card>

      {/* Cash Payment Dialog */}
      <CashPaymentDialog
        open={showCashDialog}
        onOpenChange={setShowCashDialog}
        payment={selectedPayment}
      />
    </div>
  );
}