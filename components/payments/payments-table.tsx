/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payments/payments-table.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreVertical,
  Eye,
  Download,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Banknote,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { landlordConfirmCashPayment, landlordRejectCashPayment } from "@/actions/cash-payments";

interface PaymentsTableProps {
  payments: any[];
  role?: "LANDLORD" | "TENANT";
}

const statusVariant: Record<string, { label: string; className: string; icon: any }> = {
  COMPLETED:  { label: "Completed",  icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" },
  PENDING:    { label: "Pending",    icon: Clock,       className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300" },
  PROCESSING: { label: "Processing", icon: Clock,       className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  FAILED:     { label: "Failed",     icon: XCircle,     className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300" },
  REFUNDED:   { label: "Refunded",   icon: AlertCircle, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  CANCELLED:  { label: "Cancelled",  icon: XCircle,     className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

const typeLabels: Record<string, string> = {
  RENT: "Rent", DEPOSIT: "Deposit", LATE_FEE: "Late Fee",
  UTILITY: "Utility", PET_FEE: "Pet Fee", PARKING: "Parking",
  APPLICATION_FEE: "App Fee", OTHER: "Other",
};

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export function PaymentsTable({ payments, role = "LANDLORD" }: PaymentsTableProps) {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isOverdue = (payment: any) =>
    payment.status === "PENDING" && payment.dueDate && new Date(payment.dueDate) < new Date();

  const handleConfirmCash = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    try {
      const result = await landlordConfirmCashPayment({ paymentId: selectedPayment.id });
      if (result.success) {
        toast.success(result.message || "Cash payment confirmed");
        setShowConfirmDialog(false);
        setSelectedPayment(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to confirm");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCash = async () => {
    if (!selectedPayment || !rejectReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setIsProcessing(true);
    try {
      const result = await landlordRejectCashPayment(selectedPayment.id, rejectReason);
      if (result.success) {
        toast.success(result.message || "Payment rejected");
        setShowRejectDialog(false);
        setSelectedPayment(null);
        setRejectReason("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reject");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No payments found</p>
        <p className="text-xs text-muted-foreground mt-1">
          {role === "LANDLORD"
            ? "Create your first payment charge to get started"
            : "No payments to display at this time"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop — grid rows */}
      <div className="hidden md:block">
        <div className={`grid gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide ${
          role === "LANDLORD"
            ? "grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]"
            : "grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
        }`}>
          {role === "LANDLORD" ? <span>Tenant</span> : <span>Property</span>}
          <span>Type</span>
          <span>Amount</span>
          <span>Due Date</span>
          <span>Status</span>
          {role === "LANDLORD" && <span>Paid</span>}
          <span />
        </div>

        {payments.map((payment: any) => {
          const sv = statusVariant[payment.status];
          const StatusIcon = sv?.icon;
          const overdue = isOverdue(payment);
          const isCashProcessing = payment.status === "PROCESSING" && payment.method === "CASH";

          return (
            <div
              key={payment.id}
              onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
              className={`grid gap-4 px-6 py-4 border-b last:border-0 items-center cursor-pointer hover:bg-muted/30 transition-colors ${
                overdue ? "bg-red-50/50 dark:bg-red-950/10" : ""
              } ${isCashProcessing ? "bg-blue-50/50 dark:bg-blue-950/10" : ""} ${
                role === "LANDLORD"
                  ? "grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]"
                  : "grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
              }`}
            >
              {/* Tenant / Property */}
              {role === "LANDLORD" ? (
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={payment.tenant?.user?.avatar || payment.tenant?.user?.image} />
                    <AvatarFallback className="text-xs">
                      {payment.tenant?.user?.name ? getInitials(payment.tenant.user.name) : "TN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {payment.tenant?.user?.name || "Unknown"}
                    </p>
                    {payment.lease?.unit && (
                      <p className="text-xs text-muted-foreground">
                        Unit {payment.lease.unit.unitNumber}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {payment.lease?.unit?.property?.name || "Property"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unit {payment.lease?.unit?.unitNumber || "N/A"}
                  </p>
                </div>
              )}

              {/* Type */}
              <div>
                <Badge variant="outline" className="text-xs">
                  {typeLabels[payment.type] ?? payment.type}
                </Badge>
              </div>

              {/* Amount */}
              <div>
                <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                {payment.fee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Net: {formatCurrency(payment.netAmount)}
                  </p>
                )}
              </div>

              {/* Due date */}
              <div>
                {payment.dueDate ? (
                  <>
                    <p className={`text-sm ${overdue ? "text-destructive font-medium" : ""}`}>
                      {format(new Date(payment.dueDate), "MMM d, yyyy")}
                    </p>
                    {overdue && (
                      <p className="text-xs text-destructive">Overdue</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">—</p>
                )}
              </div>

              {/* Status */}
              <div>
                <Badge className={sv?.className ?? ""}>
                  {StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
                  {sv?.label ?? payment.status}
                </Badge>
                {isCashProcessing && (
                  <div className="flex items-center gap-1 mt-1">
                    <Banknote className="h-3 w-3 text-blue-600" />
                    <p className="text-xs text-blue-600">Cash</p>
                  </div>
                )}
              </div>

              {/* Paid date (landlord only) */}
              {role === "LANDLORD" && (
                <p className="text-sm text-muted-foreground">
                  {payment.paidAt
                    ? format(new Date(payment.paidAt), "MMM d, yyyy")
                    : "—"}
                </p>
              )}

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/payments/${payment.id}`); }}>
                    <Eye className="mr-2 h-4 w-4" />View Details
                  </DropdownMenuItem>
                  {isCashProcessing && role === "LANDLORD" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-green-600 focus:text-green-600"
                        onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); setShowConfirmDialog(true); }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />Confirm Receipt
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); setShowRejectDialog(true); }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />Reject Payment
                      </DropdownMenuItem>
                    </>
                  )}
                  {payment.status === "PENDING" && role === "LANDLORD" && (
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Send className="mr-2 h-4 w-4" />Send Reminder
                    </DropdownMenuItem>
                  )}
                  {payment.receiptUrl && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(payment.receiptUrl, "_blank"); }}>
                      <Download className="mr-2 h-4 w-4" />Download Receipt
                    </DropdownMenuItem>
                  )}
                  {payment.status === "COMPLETED" && !payment.receiptUrl && (
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Download className="mr-2 h-4 w-4" />Generate Receipt
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y">
        {payments.map((payment: any) => {
          const sv = statusVariant[payment.status];
          const StatusIcon = sv?.icon;
          const overdue = isOverdue(payment);

          return (
            <div
              key={payment.id}
              onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
              className={`p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                overdue ? "bg-red-50/50 dark:bg-red-950/10" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                {role === "LANDLORD" ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={payment.tenant?.user?.avatar || payment.tenant?.user?.image} />
                      <AvatarFallback className="text-xs">
                        {payment.tenant?.user?.name ? getInitials(payment.tenant.user.name) : "TN"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{payment.tenant?.user?.name || "Unknown"}</p>
                      {payment.lease?.unit && (
                        <p className="text-xs text-muted-foreground">Unit {payment.lease.unit.unitNumber}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{payment.lease?.unit?.property?.name || "Property"}</p>
                    <p className="text-xs text-muted-foreground">Unit {payment.lease?.unit?.unitNumber || "N/A"}</p>
                  </div>
                )}
                <Badge className={`${sv?.className ?? ""} shrink-0`}>
                  {StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
                  {sv?.label ?? payment.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{typeLabels[payment.type] ?? payment.type}</span>
                <span className="font-medium">{formatCurrency(payment.amount)}</span>
              </div>
              {payment.dueDate && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Due</span>
                  <span className={overdue ? "text-destructive font-medium" : ""}>
                    {format(new Date(payment.dueDate), "MMM d, yyyy")}
                    {overdue && " · Overdue"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cash Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm receipt of {formatCurrency(selectedPayment?.amount || 0)} in cash from{" "}
              {selectedPayment?.tenant?.user?.name || "this tenant"}? This marks it as completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCash} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
              {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Confirming...</> : "Confirm Receipt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Cash Payment</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payment from{" "}
              {selectedPayment?.tenant?.user?.name || "this tenant"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reason">Reason for Rejection</Label>
            <Input
              id="reason"
              placeholder="e.g., Payment not received, incorrect amount..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectReason(""); }} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleRejectCash} disabled={isProcessing || !rejectReason.trim()} className="bg-red-600 hover:bg-red-700">
              {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rejecting...</> : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}