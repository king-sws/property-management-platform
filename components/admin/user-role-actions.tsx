/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/user-role-actions.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog, Loader2 } from "lucide-react";
import { updateUserRole } from "@/actions/admin/users";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserRoleActionsProps {
  userId: string;
  currentRole: string;
}

export function UserRoleActions({ userId, currentRole }: UserRoleActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async () => {
    if (newRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateUserRole(userId, newRole as any);

      if (result.success) {
        toast("User role updated successfully");
        router.refresh();
        setIsOpen(false);
      } else {
        toast("Failed to update user role");
      }
    } catch (error) {
      toast("An error occurred while updating user role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <UserCog className="mr-2 h-4 w-4" />
        Change Role
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Changing the user role will affect their permissions and available features.
              The appropriate profile will be created automatically if it doesn't exist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Current Role: <strong>{currentRole}</strong></Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newRole">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="LANDLORD">Landlord</SelectItem>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> This action will:
              </p>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 list-disc list-inside mt-2">
                <li>Update the user's role immediately</li>
                <li>Create the necessary profile if it doesn't exist</li>
                <li>Send a notification to the user</li>
                <li>Log this action in the activity log</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isLoading || newRole === currentRole}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}