/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/user-status-actions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Ban, CheckCircle, Loader2 } from "lucide-react";
import { updateUserStatus, deleteUser } from "@/actions/admin/users";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserStatusActionsProps {
  userId: string;
  currentStatus: string;
}

export function UserStatusActions({ userId, currentStatus }: UserStatusActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<"suspend" | "activate" | "delete" | null>(null);
  const [newStatus, setNewStatus] = useState<string>("SUSPENDED");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAction = async () => {
    if (!action) return;

    setIsLoading(true);

    try {
      let result;

      if (action === "delete") {
        result = await deleteUser(userId, reason);
      } else {
        const status = action === "suspend" ? "SUSPENDED" : newStatus;
        result = await updateUserStatus(userId, status as any, reason);
      }

      if (result.success) {
        toast(`User ${action === "delete" ? "deleted" : "updated"} successfully`);

        if (action === "delete") {
          router.push("/dashboard/users");
        } else {
          router.refresh();
        }

        setIsOpen(false);
        setReason("");
      } else {
        toast("An error occurred");
      }
    } catch (error) {
      toast("Failed to perform action");
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (actionType: "suspend" | "activate" | "delete") => {
    setAction(actionType);
    setIsOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        {currentStatus === "ACTIVE" ? (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => openDialog("suspend")}
          >
            <Ban className="mr-2 h-4 w-4" />
            Suspend User
          </Button>
        ) : currentStatus === "SUSPENDED" ? (
          <Button
            variant="default"
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => openDialog("activate")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate User
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => openDialog("activate")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Change Status
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-600 hover:text-red-700"
          onClick={() => openDialog("delete")}
        >
          Delete User
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "delete"
                ? "Delete User"
                : action === "suspend"
                ? "Suspend User"
                : "Activate User"}
            </DialogTitle>
            <DialogDescription>
              {action === "delete"
                ? "This will permanently delete the user account. This action cannot be undone."
                : action === "suspend"
                ? "This will suspend the user account and prevent them from accessing the system."
                : "This will reactivate the user account."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {action === "activate" && (
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason {action === "delete" ? "(Required)" : "(Optional)"}
              </Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant={action === "delete" || action === "suspend" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {action === "delete" ? "Delete" : action === "suspend" ? "Suspend" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}