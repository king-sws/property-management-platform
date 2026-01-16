/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payments/payment-details-client.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Home,
  User,
  FileText,
  CreditCard,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { format } from "date-fns";
import { LandlordConfirmCashDialog } from "./landlord-confirm-cash-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentDetailsClientProps {
  payment: any;
  userRole?: string;
}

export function PaymentDetailsClient({ payment, userRole }: PaymentDetailsClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 dark:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="dark:bg-gray-700">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-blue-500 dark:bg-blue-600">
            <Clock className="mr-1 h-3 w-3" />
            Awaiting Confirmation
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge variant="outline" className="dark:border-gray-700">
            <AlertCircle className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      RENT: "Rent",
      DEPOSIT: "Security Deposit",
      LATE_FEE: "Late Fee",
      UTILITY: "Utility",
      PET_FEE: "Pet Fee",
      PARKING: "Parking",
      APPLICATION_FEE: "Application Fee",
      OTHER: "Other",
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      STRIPE_CARD: "Credit/Debit Card",
      STRIPE_ACH: "Bank Transfer (ACH)",
      CASH: "Cash",
      CHECK: "Check",
      BANK_TRANSFER: "Bank Transfer",
      OTHER: "Other",
    };
    return labels[method] || method;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue = payment.status === "PENDING" && 
    payment.dueDate && 
    new Date(payment.dueDate) < new Date();

  // Check if this is a cash payment pending landlord confirmation
  const isCashPendingConfirmation = 
    payment.status === "PROCESSING" && 
    payment.method === "CASH" &&
    userRole === "LANDLORD";

  // Debug log to see what we're getting
  console.log("Payment Debug:", {
    status: payment.status,
    method: payment.method,
    userRole: userRole,
    isCashPendingConfirmation: isCashPendingConfirmation
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/payments")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
            <p className="text-muted-foreground">
              {getPaymentTypeLabel(payment.type)} • {payment.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(payment.status)}
          {payment.receiptUrl && (
            <Button variant="outline" size="sm" className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Receipt
            </Button>
          )}
        </div>
      </div>

      {/* LANDLORD: Cash Payment Confirmation Alert - PROMINENT DISPLAY */}
      {isCashPendingConfirmation && (
        <Alert className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-500 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3">
              <Banknote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">
                Cash Payment Awaiting Your Confirmation
              </h3>
              <AlertDescription className="text-blue-800 dark:text-blue-200 mb-4">
                {payment.tenant?.user?.name || "Tenant"} has confirmed they paid{" "}
                <strong className="font-bold">{formatCurrency(payment.amount)}</strong> in cash.
                Please verify you received this payment.
              </AlertDescription>
              <Button 
                size="default"
                onClick={() => setShowConfirmDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 px-6"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Review & Confirm Payment
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* TENANT: Waiting for landlord confirmation */}
      {payment.status === "PROCESSING" && payment.method === "CASH" && userRole === "TENANT" && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 dark:border-yellow-500">
          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-900 dark:text-yellow-100">
            Your cash payment confirmation has been sent to your landlord. 
            Waiting for them to verify receipt of <strong>{formatCurrency(payment.amount)}</strong>.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Payment Information */}
          <Card className="shadow-sm dark:shadow-none dark:border-gray-800">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-xl">Payment Information</CardTitle>
              <CardDescription>Details about this payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-3xl font-bold tracking-tight">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-500 tracking-tight">
                    {formatCurrency(payment.netAmount)}
                  </p>
                </div>
              </div>

              {payment.fee && payment.fee > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Processing Fee</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-500">
                    -{formatCurrency(payment.fee)}
                  </p>
                </div>
              )}

              <Separator className="dark:bg-gray-800" />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge variant="outline" className="dark:border-gray-700">
                    {getPaymentTypeLabel(payment.type)}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Method</p>
                  <div className="flex items-center gap-2">
                    {payment.method === "CASH" ? (
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {getPaymentMethodLabel(payment.method)}
                    </span>
                  </div>
                </div>
              </div>

              {payment.description && (
                <>
                  <Separator className="dark:bg-gray-800" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Description
                    </p>
                    <p className="text-sm leading-relaxed">{payment.description}</p>
                  </div>
                </>
              )}

              {payment.notes && (
                <>
                  <Separator className="dark:bg-gray-800" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Tenant Notes
                    </p>
                    <div className="rounded-lg border dark:border-gray-700 p-4 bg-muted/50 dark:bg-gray-900/50">
                      <p className="text-sm leading-relaxed">{payment.notes}</p>
                    </div>
                  </div>
                </>
              )}

              {payment.receiptUrl && (
                <>
                  <Separator className="dark:bg-gray-800" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Receipt Number
                    </p>
                    <p className="text-sm font-mono bg-muted dark:bg-gray-900 p-2 rounded">
                      {payment.receiptUrl}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-sm dark:shadow-none dark:border-gray-800">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-xl">Payment Timeline</CardTitle>
              <CardDescription>Important dates for this payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-muted dark:bg-gray-800 p-3">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.createdAt
                      ? format(new Date(payment.createdAt), "PPP 'at' p")
                      : "N/A"}
                  </p>
                </div>
              </div>

              {payment.dueDate && (
                <div className="flex items-start gap-4">
                  <div className={`rounded-full p-3 ${
                    isOverdue ? "bg-red-100 dark:bg-red-900/30" : "bg-muted dark:bg-gray-800"
                  }`}>
                    <Calendar className={`h-5 w-5 ${
                      isOverdue ? "text-red-600 dark:text-red-400" : ""
                    }`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold">
                      Due Date {isOverdue && <span className="text-red-600 dark:text-red-400">(Overdue)</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.dueDate), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              )}

              {payment.paidAt && (
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold">Paid</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.paidAt), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              )}

              {payment.failedAt && (
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold">Failed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.failedAt), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              )}

              {payment.periodStart && payment.periodEnd && (
                <>
                  <Separator className="dark:bg-gray-800" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Billing Period</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.periodStart), "PP")} -{" "}
                      {format(new Date(payment.periodEnd), "PP")}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Property & Lease Information */}
          {payment.lease && (
            <Card className="shadow-sm dark:shadow-none dark:border-gray-800">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-xl">Property & Lease Details</CardTitle>
                <CardDescription>Associated property information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <Home className="h-6 w-6 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">
                      {payment.lease.unit?.property?.name || "Property"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Unit {payment.lease.unit?.unitNumber || "N/A"}
                    </p>
                    {payment.lease.unit?.property?.address && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {payment.lease.unit.property.address}
                        {payment.lease.unit.property.city && (
                          <>, {payment.lease.unit.property.city}</>
                        )}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/leases/${payment.lease.id}`)
                    }
                    className="h-10"
                  >
                    View Lease
                  </Button>
                </div>

                <Separator className="dark:bg-gray-800" />

                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Monthly Rent</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(payment.lease.rentAmount)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Lease Status</p>
                    <Badge variant="outline" className="dark:border-gray-700">
                      {payment.lease.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tenant Information */}
          {payment.tenant && (
            <Card className="shadow-sm dark:shadow-none dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle>Tenant Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={
                        payment.tenant.user?.avatar ||
                        payment.tenant.user?.image
                      }
                      alt={payment.tenant.user?.name || "Tenant"}
                    />
                    <AvatarFallback className="text-lg">
                      {payment.tenant.user?.name
                        ? getInitials(payment.tenant.user.name)
                        : "TN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold text-base">
                      {payment.tenant.user?.name || "Unknown Tenant"}
                    </p>
                    {payment.tenant.user?.email && (
                      <p className="text-sm text-muted-foreground">
                        {payment.tenant.user.email}
                      </p>
                    )}
                    {payment.tenant.user?.phone && (
                      <p className="text-sm text-muted-foreground">
                        {payment.tenant.user.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="shadow-sm dark:shadow-none dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isCashPendingConfirmation && (
                <Button 
                  className="w-full h-11 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                  onClick={() => setShowConfirmDialog(true)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Cash Receipt
                </Button>
              )}
              
              {payment.status === "PENDING" && !isCashPendingConfirmation && (
                <>
                  <Button className="w-full h-11" disabled={isProcessing}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Process Payment
                  </Button>
                  <Button variant="outline" className="w-full h-11">
                    Send Reminder
                  </Button>
                </>
              )}
              
              {payment.status === "COMPLETED" && (
                <>
                  {payment.receiptUrl ? (
                    <Button
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => window.open(payment.receiptUrl, "_blank")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Receipt
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full h-11">
                      <Download className="mr-2 h-4 w-4" />
                      Generate Receipt
                    </Button>
                  )}
                </>
              )}
              
              <Button variant="outline" className="w-full h-11">
                <FileText className="mr-2 h-4 w-4" />
                View Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Transaction IDs */}
          {(payment.stripePaymentIntentId || payment.stripeChargeId) && (
            <Card className="shadow-sm dark:shadow-none dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payment.stripePaymentIntentId && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Payment Intent ID
                    </p>
                    <p className="text-xs font-mono break-all bg-muted dark:bg-gray-900 p-2 rounded">
                      {payment.stripePaymentIntentId}
                    </p>
                  </div>
                )}
                {payment.stripeChargeId && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Charge ID</p>
                    <p className="text-xs font-mono break-all bg-muted dark:bg-gray-900 p-2 rounded">
                      {payment.stripeChargeId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      

      {/* Landlord Confirm Dialog - Placed at root level */}
      {/* <Button>TEST TEST
      <LandlordConfirmCashDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        payment={payment}
      /></Button> */}
    </div>
  );
}