/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/invoices/invoice-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { updateInvoice } from "@/actions/invoices";
import { toast } from "sonner";
import { 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Loader2,
  CreditCard,
  Banknote,
  Building2,
  Info
} from "lucide-react";

interface InvoiceActionsProps {
  invoice: any;
  role: "vendor" | "landlord";
}

export function InvoiceActions({ invoice, role }: InvoiceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Dialogs state
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Form state
  const [rejectionReason, setRejectionReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    try {
      const result = await updateInvoice(invoice.id, {
        status: "APPROVED",
      });

      if (result.success) {
        toast.success("Invoice approved successfully");
        setShowApproveDialog(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to approve invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    try {
      const result = await updateInvoice(invoice.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason,
      });

      if (result.success) {
        toast.success("Invoice rejected");
        setShowRejectDialog(false);
        setRejectionReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to reject invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!paymentDate) {
      toast.error("Please select payment date");
      return;
    }

    setLoading(true);
    try {
      // Build payment details for notes
      const paymentDetails = {
        method: getPaymentMethodLabel(paymentMethod),
        date: paymentDate,
        reference: paymentReference || "N/A",
        notes: paymentNotes || "None",
      };

      const result = await updateInvoice(invoice.id, {
        status: "PAID",
        paidAt: new Date(paymentDate).toISOString(),
        notes: `${invoice.notes ? invoice.notes + "\n\n" : ""}--- PAYMENT RECORDED ---\nMethod: ${paymentDetails.method}\nDate: ${paymentDetails.date}\nReference: ${paymentDetails.reference}${paymentDetails.notes !== "None" ? `\nNotes: ${paymentDetails.notes}` : ""}`,
      });

      if (result.success) {
        toast.success("Invoice marked as paid successfully");
        setShowPaymentDialog(false);
        setPaymentMethod("");
        setPaymentReference("");
        setPaymentNotes("");
        setPaymentDate(new Date().toISOString().split('T')[0]);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methods: { [key: string]: string } = {
      BANK_TRANSFER: "Bank Transfer / ACH",
      CHECK: "Check",
      CREDIT_CARD: "Credit Card",
      DEBIT_CARD: "Debit Card", 
      CASH: "Cash",
      ONLINE_PAYMENT: "Online Payment",
      OTHER: "Other",
    };
    return methods[method] || method;
  };

  // Vendor actions
  if (role === "vendor") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {invoice.status === "DRAFT" && (
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/vendor/invoices/${invoice.id}/edit`)}
            >
              Edit Invoice
            </DropdownMenuItem>
          )}
          {(invoice.status === "DRAFT" || invoice.status === "REJECTED") && (
            <DropdownMenuItem
              onClick={async () => {
                setLoading(true);
                const result = await updateInvoice(invoice.id, { status: "PENDING" });
                if (result.success) {
                  toast.success("Invoice submitted for approval");
                  router.refresh();
                } else {
                  toast.error(result.error);
                }
                setLoading(false);
              }}
            >
              Submit for Approval
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Landlord actions
  return (
    <>
      <div className="flex gap-2">
        {invoice.status === "PENDING" && (
          <>
            <Button
              onClick={() => setShowApproveDialog(true)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => setShowRejectDialog(true)}
              disabled={loading}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </>
        )}

        {invoice.status === "APPROVED" && (
          <Button 
            onClick={() => setShowPaymentDialog(true)} 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        )}
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve invoice <strong>{invoice.invoiceNumber}</strong> for{" "}
              <strong>${invoice.total.toFixed(2)}</strong>.
              <br /><br />
              This will notify the vendor that the invoice has been approved and is ready for payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Invoice</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this invoice. The vendor will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="e.g., Prices don't match our agreement, missing documentation, incorrect items..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={loading}
                variant="destructive"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Recording Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment details for invoice <strong>{invoice.invoiceNumber}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Amount Display */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Payment Amount</p>
              <p className="text-2xl font-bold">${invoice.total.toFixed(2)}</p>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="How did you pay the vendor?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4" />
                      Bank Transfer / ACH / Wire
                    </div>
                  </SelectItem>
                  <SelectItem value="CHECK">
                    <div className="flex items-center">
                      <Banknote className="mr-2 h-4 w-4" />
                      Check
                    </div>
                  </SelectItem>
                  <SelectItem value="CREDIT_CARD">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Credit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="DEBIT_CARD">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Debit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="CASH">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="ONLINE_PAYMENT">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Online Payment (PayPal, Venmo, Zelle)
                    </div>
                  </SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the method you used to pay this invoice
              </p>
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="paymentDate">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                When did you make this payment?
              </p>
            </div>

            {/* Payment Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference">
                Payment Reference (Optional)
              </Label>
              <Input
                id="reference"
                placeholder="e.g., Check #12345, Confirmation #ABC123"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Check number, transaction ID, or confirmation number
              </p>
            </div>

            {/* Payment Notes */}
            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="paymentNotes"
                placeholder="Any additional payment details or notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 space-y-1">
                <p className="font-medium">Manual Payment Recording</p>
                <p>
                  This records that you paid the vendor outside the system (via your bank, check, cash, etc.). 
                  The vendor will be notified that payment has been completed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setPaymentMethod("");
                  setPaymentReference("");
                  setPaymentNotes("");
                  setPaymentDate(new Date().toISOString().split('T')[0]);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkPaid}
                disabled={loading || !paymentMethod || !paymentDate}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}