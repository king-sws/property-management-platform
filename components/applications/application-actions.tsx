/* eslint-disable @typescript-eslint/no-explicit-any */
// components/applications/application-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  Send,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  submitApplication,
  reviewApplication,
  withdrawApplication,
} from "@/actions/applications";
import { ConvertToLeaseButton } from "./convert-to-lease-button";
import { toast } from "sonner";

interface ApplicationActionsProps {
  application: any;
  isLandlord: boolean;
  isTenant: boolean;
}

export function ApplicationActions({
  application,
  isLandlord,
  isTenant,
}: ApplicationActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "CONDITIONALLY_APPROVED" | "DENIED" | null>(null);
  const [denialReason, setDenialReason] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = isTenant && application.status === "DRAFT";
  const canEdit = isTenant && application.status === "DRAFT";
  const canWithdraw =
    isTenant &&
    ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"].includes(
      application.status
    );
  const canReview =
    isLandlord &&
    ["SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"].includes(
      application.status
    );
  const canConvert = 
    isLandlord && 
    (application.status === "APPROVED" || application.status === "CONDITIONALLY_APPROVED");

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await submitApplication(application.id);

      if (result.success) {
        toast.success(result.message || "Application submitted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewAction) return;

    if (reviewAction === "DENIED" && !denialReason.trim()) {
      toast.error("Please provide a reason for denial");
      return;
    }

    setIsLoading(true);
    try {
      const result = await reviewApplication(application.id, {
        status: reviewAction,
        denialReason: reviewAction === "DENIED" ? denialReason : undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success(result.message || "Application reviewed successfully");
        setShowReviewDialog(false);
        setDenialReason("");
        setNotes("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to review application");
      }
    } catch (error) {
      console.error("Review error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      const result = await withdrawApplication(application.id);

      if (result.success) {
        toast.success(result.message || "Application withdrawn successfully");
        setShowWithdrawDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to withdraw application");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/applications/${application.id}/edit`);
  };

  if (!canSubmit && !canEdit && !canWithdraw && !canReview && !canConvert) {
    return null;
  }

  const getDialogTitle = () => {
    switch (reviewAction) {
      case "APPROVED":
        return "Approve Application";
      case "CONDITIONALLY_APPROVED":
        return "Conditionally Approve Application";
      case "DENIED":
        return "Deny Application";
      default:
        return "Review Application";
    }
  };

  const getDialogDescription = () => {
    switch (reviewAction) {
      case "APPROVED":
        return "This will approve the application and notify the tenant.";
      case "CONDITIONALLY_APPROVED":
        return "This application will be approved with conditions. Please specify any requirements in the notes.";
      case "DENIED":
        return "Please provide a reason for denying this application.";
      default:
        return "";
    }
  };

  const getButtonColor = () => {
    switch (reviewAction) {
      case "APPROVED":
        return "bg-green-600 hover:bg-green-700";
      case "CONDITIONALLY_APPROVED":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "DENIED":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            {isTenant && "Manage your application"}
            {isLandlord && "Review and process this application"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Tenant Actions */}
            {canSubmit && (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}

            {canEdit && (
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Application
              </Button>
            )}

            {canWithdraw && (
              <Button
                variant="outline"
                onClick={() => setShowWithdrawDialog(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Withdraw Application
              </Button>
            )}

            {/* Landlord Actions */}
            {canReview && (
              <>
                <Button
                  onClick={() => {
                    setReviewAction("APPROVED");
                    setShowReviewDialog(true);
                  }}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>

                <Button
                  onClick={() => {
                    setReviewAction("CONDITIONALLY_APPROVED");
                    setShowReviewDialog(true);
                  }}
                  disabled={isLoading}
                  variant="outline"
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Conditional Approval
                </Button>

                <Button
                  onClick={() => {
                    setReviewAction("DENIED");
                    setShowReviewDialog(true);
                  }}
                  disabled={isLoading}
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Deny
                </Button>
              </>
            )}

            {/* Convert to Lease Button (only for landlords with approved apps) */}
            {canConvert && (
              <ConvertToLeaseButton application={application} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {reviewAction === "DENIED" && (
              <div className="space-y-2">
                <Label htmlFor="denialReason">
                  Reason for Denial <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="denialReason"
                  placeholder="Provide a clear reason for denying this application..."
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {reviewAction === "CONDITIONALLY_APPROVED" && (
              <div className="space-y-2">
                <Label htmlFor="conditionalNotes">
                  Conditions Required <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="conditionalNotes"
                  placeholder="List the conditions that must be met for full approval..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  These conditions will be visible to the tenant
                </p>
              </div>
            )}

            {reviewAction === "APPROVED" && (
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any internal notes about this decision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  These notes are only visible to landlords
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewDialog(false);
                setDenialReason("");
                setNotes("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={isLoading}
              className={getButtonColor()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm{" "}
                  {reviewAction === "APPROVED"
                    ? "Approval"
                    : reviewAction === "CONDITIONALLY_APPROVED"
                    ? "Conditional Approval"
                    : "Denial"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your application will be withdrawn and you
              will need to submit a new application if you wish to apply again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw Application"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}