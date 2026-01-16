/* eslint-disable @typescript-eslint/no-explicit-any */
// components/lease/lease-payments.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Download, CreditCard } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface LeasePaymentsProps {
  leaseId: string;
  payments: any[];
  nextRentDue: Date;
  rentAmount: number;
}

export function LeasePayments({
  payments,
  nextRentDue,
  rentAmount,
}: LeasePaymentsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Next Payment Due */}
      <Card className="border-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Next Payment Due
              </div>
              <div className="text-3xl font-bold flex items-center">
                <DollarSign className="h-8 w-8" />
                {rentAmount.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {format(nextRentDue, "MMMM d, yyyy")}
              </div>
            </div>
            <Link href="/dashboard/payments/pay">
              <Button size="lg">
                <CreditCard className="h-5 w-5 mr-2" />
                Pay Rent
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Paid</div>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">
              Payments Made
            </div>
            <div className="text-2xl font-bold">
              {payments.filter((p) => p.status === "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">On-Time Rate</div>
            <div className="text-2xl font-bold">
              {payments.length > 0
                ? Math.round(
                    (payments.filter(
                      (p) =>
                        p.status === "COMPLETED" &&
                        p.dueDate &&
                        p.paidAt &&
                        new Date(p.paidAt) <= new Date(p.dueDate)
                    ).length /
                      payments.filter((p) => p.status === "COMPLETED")
                        .length) *
                      100
                  )
                : 100}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No payment history yet
              </p>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {payment.type.replace("_", " ")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.paidAt
                          ? format(new Date(payment.paidAt), "MMM d, yyyy")
                          : payment.dueDate
                          ? `Due ${format(new Date(payment.dueDate), "MMM d, yyyy")}`
                          : "No date"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">
                        ${payment.amount.toLocaleString()}
                      </div>
                      {payment.method && (
                        <div className="text-xs text-muted-foreground">
                          {payment.method.replace("_", " ")}
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                    {payment.receiptUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

