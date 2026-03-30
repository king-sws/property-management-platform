/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payments/payment-details-client.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft, Calendar, DollarSign, Home, FileText,
  CreditCard, Download, CheckCircle, Clock, XCircle,
  AlertCircle, Banknote, Mail, Phone,
} from "lucide-react";
import { format } from "date-fns";
import { LandlordConfirmCashDialog } from "./landlord-confirm-cash-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentDetailsClientProps {
  payment: any;
  userRole?: string;
}

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const typeLabels: Record<string, string> = {
  RENT: "Rent", DEPOSIT: "Security Deposit", LATE_FEE: "Late Fee",
  UTILITY: "Utility", PET_FEE: "Pet Fee", PARKING: "Parking",
  APPLICATION_FEE: "Application Fee", OTHER: "Other",
};

const methodLabels: Record<string, string> = {
  STRIPE_CARD: "Credit/Debit Card", STRIPE_ACH: "Bank Transfer (ACH)",
  CASH: "Cash", CHECK: "Check", BANK_TRANSFER: "Bank Transfer", OTHER: "Other",
};

const statusVariant: Record<string, { label: string; className: string; icon: any }> = {
  COMPLETED:  { label: "Completed",             icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" },
  PENDING:    { label: "Pending",               icon: Clock,       className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300" },
  PROCESSING: { label: "Awaiting Confirmation", icon: Clock,       className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  FAILED:     { label: "Failed",                icon: XCircle,     className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300" },
  REFUNDED:   { label: "Refunded",              icon: AlertCircle, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

export function PaymentDetailsClient({ payment, userRole }: PaymentDetailsClientProps) {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const sv = statusVariant[payment.status];
  const StatusIcon = sv?.icon;
  const isOverdue = payment.status === "PENDING" && payment.dueDate && new Date(payment.dueDate) < new Date();
  const isCashPending = payment.status === "PROCESSING" && payment.method === "CASH" && userRole === "LANDLORD";

  return (
    <div className="space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/payments")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={sv?.className ?? ""}>
            {StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
            {sv?.label ?? payment.status}
          </Badge>
          {payment.receiptUrl && (
            <Button variant="outline" size="sm" onClick={() => window.open(payment.receiptUrl, "_blank")}>
              <Download className="mr-2 h-4 w-4" />Receipt
            </Button>
          )}
        </div>
      </div>

      {/* ── Alert banners ── */}
      {isCashPending && (
        <Alert className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/50">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3">
              <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Cash Payment Awaiting Your Confirmation
              </p>
              <AlertDescription className="text-blue-800 dark:text-blue-200 mb-3">
                {payment.tenant?.user?.name || "Tenant"} confirmed paying{" "}
                <strong>{formatCurrency(payment.amount)}</strong> in cash. Please verify receipt.
              </AlertDescription>
              <Button size="sm" onClick={() => setShowConfirmDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Review & Confirm
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {payment.status === "PROCESSING" && payment.method === "CASH" && userRole === "TENANT" && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900 dark:text-yellow-100">
            Your cash payment confirmation is pending. Waiting for your landlord to verify receipt of{" "}
            <strong>{formatCurrency(payment.amount)}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: payment details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Payment info card */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{typeLabels[payment.type] ?? payment.type}</CardTitle>
                  <CardDescription className="font-mono text-xs mt-0.5">
                    {payment.id}
                  </CardDescription>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(payment.amount)}</p>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Amount breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 divide-x border-b">
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Amount</p>
                  <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                </div>
                {payment.fee > 0 && (
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Fee</p>
                    <p className="text-lg font-bold text-destructive">-{formatCurrency(payment.fee)}</p>
                  </div>
                )}
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Net</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(payment.netAmount)}</p>
                </div>
              </div>

              {/* Type + Method */}
              <div className="grid grid-cols-2 divide-x border-b">
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Type</p>
                  <Badge variant="outline">{typeLabels[payment.type] ?? payment.type}</Badge>
                </div>
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Method</p>
                  <div className="flex items-center gap-1.5">
                    {payment.method === "CASH"
                      ? <Banknote className="h-4 w-4 text-muted-foreground" />
                      : <CreditCard className="h-4 w-4 text-muted-foreground" />
                    }
                    <span className="text-sm font-medium">{methodLabels[payment.method] ?? payment.method}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {payment.description && (
                <div className="px-6 py-4 border-b">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{payment.description}</p>
                </div>
              )}

              {/* Notes */}
              {payment.notes && (
                <div className="px-6 py-4 border-b">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Tenant Notes</p>
                  <div className="rounded-md bg-muted/50 px-3 py-2">
                    <p className="text-sm leading-relaxed">{payment.notes}</p>
                  </div>
                </div>
              )}

              {/* Receipt / transaction IDs */}
              {(payment.receiptUrl || payment.stripePaymentIntentId || payment.stripeChargeId) && (
                <div className="px-6 py-4 space-y-2">
                  {payment.receiptUrl && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Receipt</p>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{payment.receiptUrl}</p>
                    </div>
                  )}
                  {payment.stripePaymentIntentId && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Payment Intent</p>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">{payment.stripePaymentIntentId}</p>
                    </div>
                  )}
                  {payment.stripeChargeId && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Charge ID</p>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">{payment.stripeChargeId}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Important dates for this payment</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="px-6 py-4 flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.createdAt ? format(new Date(payment.createdAt), "PPP 'at' p") : "—"}
                    </p>
                  </div>
                </div>

                {payment.dueDate && (
                  <div className={`px-6 py-4 flex items-center gap-4 ${isOverdue ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isOverdue ? "bg-red-100 dark:bg-red-900/30" : "bg-muted"}`}>
                      <Calendar className={`h-4 w-4 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Due Date{isOverdue && <span className="text-destructive ml-1">(Overdue)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.dueDate), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}

                {payment.paidAt && (
                  <div className="px-6 py-4 flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Paid</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.paidAt), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}

                {payment.failedAt && (
                  <div className="px-6 py-4 flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Failed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.failedAt), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}

                {payment.periodStart && payment.periodEnd && (
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Billing Period</p>
                    <p className="text-sm">
                      {format(new Date(payment.periodStart), "PP")} – {format(new Date(payment.periodEnd), "PP")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property / Lease card */}
          {payment.lease && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Property & Lease</CardTitle>
                <CardDescription>Associated property information</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                  <div className="px-6 py-4 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Property</p>
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{payment.lease.unit?.property?.name || "Property"}</p>
                        <p className="text-xs text-muted-foreground">Unit {payment.lease.unit?.unitNumber || "N/A"}</p>
                        {payment.lease.unit?.property?.address && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {payment.lease.unit.property.address}
                            {payment.lease.unit.property.city && `, ${payment.lease.unit.property.city}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lease</p>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Rent</p>
                      <p className="text-sm font-semibold">{formatCurrency(payment.lease.rentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="outline" className="mt-0.5">{payment.lease.status}</Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/leases/${payment.lease.id}`)}>
                      View Lease
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Tenant card */}
          {payment.tenant && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Tenant</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 py-4 flex items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={payment.tenant.user?.avatar || payment.tenant.user?.image} />
                    <AvatarFallback className="text-base">
                      {payment.tenant.user?.name ? getInitials(payment.tenant.user.name) : "TN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{payment.tenant.user?.name || "Unknown Tenant"}</p>
                  </div>
                </div>
                <div className="px-6 pb-4 space-y-1.5 border-t pt-3">
                  {payment.tenant.user?.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{payment.tenant.user.email}</span>
                    </div>
                  )}
                  {payment.tenant.user?.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {payment.tenant.user.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {isCashPending && (
                  <div className="px-6 py-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setShowConfirmDialog(true)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Cash Receipt
                    </Button>
                  </div>
                )}
                {payment.status === "PENDING" && !isCashPending && (
                  <>
                    <div className="px-6 py-3">
                      <Button className="w-full">
                        <DollarSign className="mr-2 h-4 w-4" />Process Payment
                      </Button>
                    </div>
                    <div className="px-6 py-3">
                      <Button variant="outline" className="w-full">Send Reminder</Button>
                    </div>
                  </>
                )}
                {payment.status === "COMPLETED" && (
                  <div className="px-6 py-3">
                    <Button variant="outline" className="w-full" onClick={() => payment.receiptUrl && window.open(payment.receiptUrl, "_blank")}>
                      <Download className="mr-2 h-4 w-4" />
                      {payment.receiptUrl ? "Download Receipt" : "Generate Receipt"}
                    </Button>
                  </div>
                )}
                <div className="px-6 py-3">
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />View Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showConfirmDialog && (
        <LandlordConfirmCashDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          payment={payment}
        />
      )}
    </div>
  );
}