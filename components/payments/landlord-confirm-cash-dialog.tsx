/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// components/payments/landlord-confirm-cash-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Banknote } from "lucide-react";
import { landlordConfirmCashPayment, landlordRejectCashPayment } from "@/actions/cash-payments";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LandlordConfirmCashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
}

export function LandlordConfirmCashDialog({
  open,
  onOpenChange,
  payment,
}: LandlordConfirmCashDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  async function handleConfirm() {
    setIsLoading(true);

    try {
      const result = await landlordConfirmCashPayment({
        paymentId: payment.id,
      });

      if (result.success) {
        toast.success(result.message || "Cash payment confirmed");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to confirm payment");
      }
    } catch (error) {
      console.error("Confirm cash payment error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsLoading(true);

    try {
      const result = await landlordRejectCashPayment(
        payment.id,
        rejectionReason
      );

      if (result.success) {
        toast.success(result.message || "Payment rejection recorded");
        onOpenChange(false);
        setIsRejecting(false);
        setRejectionReason("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Reject cash payment error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 dark:border-gray-800">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <Banknote className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl">Confirm Cash Payment</DialogTitle>
              <DialogDescription className="text-base">
                {payment?.tenant?.user?.name} has paid {formatCurrency(payment?.amount || 0)} in cash
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!isRejecting ? (
          <div className="space-y-6 pt-2">
            <Alert className="dark:border-gray-800 dark:bg-gray-900/50">
              <AlertDescription className="text-base">
                Did you receive {formatCurrency(payment?.amount || 0)} in cash from this tenant?
              </AlertDescription>
            </Alert>

            {payment?.notes && (
              <div className="rounded-lg border dark:border-gray-800 p-4 bg-muted/50 dark:bg-gray-900/50 space-y-2">
                <Label className="text-sm font-semibold">Tenant Notes:</Label>
                <p className="text-sm text-muted-foreground leading-relaxed">{payment.notes}</p>
              </div>
            )}

            {payment?.receiptUrl && (
              <div className="rounded-lg border dark:border-gray-800 p-4 space-y-2">
                <Label className="text-sm font-semibold">Receipt Number:</Label>
                <p className="text-sm font-mono text-muted-foreground">{payment.receiptUrl}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setIsRejecting(true)}
                disabled={isLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Not Received
              </Button>
              <Button
                className="flex-1 h-11 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Confirm Received
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <Alert variant="destructive" className="dark:border-red-800">
              <AlertDescription className="text-base">
                You're about to reject this cash payment confirmation.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Label htmlFor="reason" className="text-sm font-semibold">
                Reason for Rejection
              </Label>
              <Textarea
                id="reason"
                placeholder="Explain why you didn't receive this payment..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                className="resize-none dark:border-gray-800"
              />
              <p className="text-xs text-muted-foreground">
                This reason will be shared with the tenant.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => {
                  setIsRejecting(false);
                  setRejectionReason("");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-11"
                onClick={handleReject}
                disabled={isLoading || !rejectionReason.trim()}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject Payment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
