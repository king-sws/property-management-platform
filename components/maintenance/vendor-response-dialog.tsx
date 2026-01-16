/* eslint-disable @typescript-eslint/no-unused-vars */
// components/maintenance/vendor-response-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { respondToTicketAssignment } from "@/actions/maintenance-improved";
import { toast } from "sonner";

interface VendorResponseDialogProps {
  ticketId: string;
  ticketTitle: string;
  propertyName: string;
}

export function VendorResponseDialog({
  ticketId,
  ticketTitle,
  propertyName,
}: VendorResponseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accepting, setAccepting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");

  const handleResponse = async () => {
    setLoading(true);
    try {
      const result = await respondToTicketAssignment(ticketId, {
        accept: accepting,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to respond to assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setAccepting(true);
            setOpen(true);
          }}
          className="flex-1"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Accept Job
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setAccepting(false);
            setOpen(true);
          }}
          className="flex-1"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Decline Job
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accepting ? "Accept Job" : "Decline Job"}
            </DialogTitle>
            <DialogDescription>
              {accepting
                ? "Provide details about the job"
                : "Let the landlord know why you're declining"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Job</Label>
              <p className="text-sm">{ticketTitle}</p>
              <p className="text-xs text-muted-foreground">{propertyName}</p>
            </div>

            {accepting && (
              <div>
                <Label htmlFor="cost">Estimated Cost (Optional)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">
                {accepting ? "Notes (Optional)" : "Reason (Optional)"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  accepting
                    ? "Add any notes about the job..."
                    : "Let the landlord know why you're declining..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResponse}
              disabled={loading}
              variant={accepting ? "default" : "destructive"}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {accepting ? "Accept Job" : "Decline Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}