/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/applications/application-detail-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { reviewApplication, withdrawApplication } from "@/actions/applications";
import { toast } from "sonner";
import { ConvertToLeaseButton } from "./convert-to-lease-button";

const reviewFormSchema = z.object({
  status: z.enum(["APPROVED", "CONDITIONALLY_APPROVED", "DENIED"]),
  denialReason: z.string().optional(),
  notes: z.string().optional(),
});

interface ApplicationDetailActionsProps {
  application: any;
  isLandlord: boolean;
  isTenant: boolean;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  SUBMITTED: "default",
  UNDER_REVIEW: "default",
  SCREENING_IN_PROGRESS: "default",
  APPROVED: "default",
  CONDITIONALLY_APPROVED: "default",
  DENIED: "destructive",
  WITHDRAWN: "secondary",
  EXPIRED: "secondary",
  CONVERTED_TO_LEASE: "default",
};

const statusIcons: Record<string, any> = {
  APPROVED: CheckCircle,
  CONDITIONALLY_APPROVED: AlertCircle,
  DENIED: XCircle,
};

export function ApplicationDetailActions({
  application,
  isLandlord,
  isTenant,
}: ApplicationDetailActionsProps) {
  const router = useRouter();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      status: "APPROVED",
      denialReason: "",
      notes: "",
    },
  });

  const watchStatus = form.watch("status");

  const handleReview = async (data: z.infer<typeof reviewFormSchema>) => {
    setIsLoading(true);

    try {
      const result = await reviewApplication(application.id, data);

      if (result.success) {
        toast.success(result.message || "Application reviewed successfully");
        setShowReviewDialog(false);
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
        toast.success(result.message || "Application withdrawn");
        setShowWithdrawDialog(false);
        router.push("/dashboard/applications");
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

  const StatusIcon = statusIcons[application.status];

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <Badge variant={statusColors[application.status]} className="gap-1">
          {StatusIcon && <StatusIcon className="h-3 w-3" />}
          {application.status.replace("_", " ")}
        </Badge>

        {/* Landlord Actions */}
        {isLandlord && (
          <>
            {/* Convert to Lease Button (only for approved apps) */}
            {(application.status === "APPROVED" || 
              application.status === "CONDITIONALLY_APPROVED") && (
              <ConvertToLeaseButton application={application} />
            )}

            {/* Review Button */}
            {(application.status === "SUBMITTED" ||
              application.status === "UNDER_REVIEW" ||
              application.status === "SCREENING_IN_PROGRESS") && (
              <Button onClick={() => setShowReviewDialog(true)}>
                Review Application
              </Button>
            )}

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReviewDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Review Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Application
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Tenant Actions */}
        {isTenant && (
          <>
            {application.status === "DRAFT" && (
              <Button onClick={() => router.push(`/dashboard/applications/${application.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Application
              </Button>
            )}

            {(application.status === "SUBMITTED" ||
              application.status === "UNDER_REVIEW") && (
              <Button
                variant="destructive"
                onClick={() => setShowWithdrawDialog(true)}
              >
                Withdraw Application
              </Button>
            )}
          </>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Make a decision on {application.tenant.user.name}'s application
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleReview)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decision *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APPROVED">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Approve</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CONDITIONALLY_APPROVED">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span>Conditionally Approve</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="DENIED">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>Deny</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchStatus === "DENIED" && (
                <FormField
                  control={form.control}
                  name="denialReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Denial *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a reason..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes for your records..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Decision
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw this application? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Withdraw Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}