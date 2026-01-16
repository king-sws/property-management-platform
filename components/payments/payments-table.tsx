/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payments/payments-table.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { landlordConfirmCashPayment, landlordRejectCashPayment } from "@/actions/cash-payments";

interface PaymentsTableProps {
  payments: any[];
  role?: "LANDLORD" | "TENANT";
}

export function PaymentsTable({ payments, role = "LANDLORD" }: PaymentsTableProps) {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge variant="secondary" className="bg-blue-500 text-white">
            <Clock className="mr-1 h-3 w-3" />
            Processing
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
          <Badge variant="outline">
            <AlertCircle className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      RENT: "Rent",
      DEPOSIT: "Deposit",
      LATE_FEE: "Late Fee",
      UTILITY: "Utility",
      PET_FEE: "Pet Fee",
      PARKING: "Parking",
      APPLICATION_FEE: "App Fee",
      OTHER: "Other",
    };
    return labels[type] || type;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue = (payment: any) => {
    return (
      payment.status === "PENDING" &&
      payment.dueDate &&
      new Date(payment.dueDate) < new Date()
    );
  };

  const handleRowClick = (paymentId: string) => {
    router.push(`/dashboard/payments/${paymentId}`);
  };

  const handleConfirmCashPayment = async () => {
    if (!selectedPayment) return;
    
    setIsProcessing(true);
    try {
      const result = await landlordConfirmCashPayment({
        paymentId: selectedPayment.id,
      });

      if (result.success) {
        toast.success(result.message || "Cash payment confirmed successfully");
        setShowConfirmDialog(false);
        setSelectedPayment(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to confirm payment");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCashPayment = async () => {
    if (!selectedPayment || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await landlordRejectCashPayment(
        selectedPayment.id,
        rejectReason
      );

      if (result.success) {
        toast.success(result.message || "Cash payment rejected");
        setShowRejectDialog(false);
        setSelectedPayment(null);
        setRejectReason("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
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
        <h3 className="text-lg font-semibold mb-2">No payments found</h3>
        <p className="text-sm text-muted-foreground">
          {role === "LANDLORD"
            ? "Create your first payment charge to get started"
            : "No payments to display at this time"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {role === "LANDLORD" && <TableHead>Tenant</TableHead>}
              {role === "TENANT" && <TableHead>Property</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow
                key={payment.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(payment.id)}
              >
                {/* Tenant Column (Landlord View) */}
                {role === "LANDLORD" && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            payment.tenant?.user?.avatar ||
                            payment.tenant?.user?.image
                          }
                          alt={payment.tenant?.user?.name || "Tenant"}
                        />
                        <AvatarFallback>
                          {payment.tenant?.user?.name
                            ? getInitials(payment.tenant.user.name)
                            : "TN"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {payment.tenant?.user?.name || "Unknown"}
                        </div>
                        {payment.lease?.unit && (
                          <div className="text-xs text-muted-foreground">
                            Unit {payment.lease.unit.unitNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                )}

                {/* Property Column (Tenant View) */}
                {role === "TENANT" && (
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {payment.lease?.unit?.property?.name || "Property"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Unit {payment.lease?.unit?.unitNumber || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                )}

                {/* Type */}
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {getPaymentTypeLabel(payment.type)}
                  </Badge>
                </TableCell>

                {/* Amount */}
                <TableCell>
                  <div className="font-medium">
                    {formatCurrency(payment.amount)}
                  </div>
                  {payment.fee && payment.fee > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Net: {formatCurrency(payment.netAmount)}
                    </div>
                  )}
                </TableCell>

                {/* Due Date */}
                <TableCell>
                  {payment.dueDate ? (
                    <div
                      className={`text-sm ${
                        isOverdue(payment) ? "text-red-600 font-medium" : ""
                      }`}
                    >
                      {format(new Date(payment.dueDate), "MMM d, yyyy")}
                      {isOverdue(payment) && (
                        <div className="text-xs">Overdue</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>{getStatusBadge(payment.status)}</TableCell>

                {/* Date */}
                <TableCell>
                  <div className="text-sm">
                    {payment.paidAt
                      ? format(new Date(payment.paidAt), "MMM d, yyyy")
                      : payment.createdAt
                      ? format(new Date(payment.createdAt), "MMM d, yyyy")
                      : "N/A"}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(payment.id);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      {/* Landlord: Confirm/Reject Cash Payment */}
                      {payment.status === "PROCESSING" && 
                       payment.method === "CASH" && 
                       role === "LANDLORD" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
                              setShowConfirmDialog(true);
                            }}
                            className="text-green-600 focus:text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
                              setShowRejectDialog(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Payment
                          </DropdownMenuItem>
                        </>
                      )}

                      {payment.status === "PENDING" && role === "LANDLORD" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle send reminder
                          }}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Reminder
                        </DropdownMenuItem>
                      )}

                      {payment.receiptUrl && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(payment.receiptUrl, "_blank");
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Receipt
                        </DropdownMenuItem>
                      )}

                      {payment.status === "COMPLETED" && !payment.receiptUrl && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle generate receipt
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Generate Receipt
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirm Cash Payment Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cash Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm receipt of {formatCurrency(selectedPayment?.amount || 0)} in cash from {selectedPayment?.tenant?.user?.name || "this tenant"}?
              This will mark the payment as completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCashPayment}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm Receipt"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Cash Payment Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Cash Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this cash payment claim from {selectedPayment?.tenant?.user?.name || "this tenant"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Input
                id="reason"
                placeholder="e.g., Payment not received, incorrect amount..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectCashPayment}
              disabled={isProcessing || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}