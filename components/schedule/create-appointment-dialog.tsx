/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/schedule/create-appointment-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAppointment, getAvailableVendors } from "@/actions/schedules";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId?: string;
  defaultVendorId?: string;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  ticketId,
  defaultVendorId,
}: CreateAppointmentDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  
  const [formData, setFormData] = useState({
    vendorId: defaultVendorId || "",
    scheduledStart: "",
    scheduledEnd: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadVendors();
    }
  }, [open]);

  const loadVendors = async () => {
    setLoadingVendors(true);
    try {
      const result = await getAvailableVendors();
      if (result.success) {
        setVendors(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load vendors:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorId || !formData.scheduledStart || !formData.scheduledEnd) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await createAppointment({
        ticketId: ticketId || null,
        vendorId: formData.vendorId,
        scheduledStart: formData.scheduledStart,
        scheduledEnd: formData.scheduledEnd,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        router.refresh();
        
        // Reset form
        setFormData({
          vendorId: defaultVendorId || "",
          scheduledStart: "",
          scheduledEnd: "",
          notes: "",
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Create a new service appointment with a vendor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor Selection */}
          <div className="space-y-2">
            <Label htmlFor="vendor">
              Vendor <span className="text-red-500">*</span>
            </Label>
            {loadingVendors ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={formData.vendorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendorId: value })
                }
                disabled={!!defaultVendorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      <div className="flex flex-col">
                        <span>{vendor.businessName}</span>
                        <span className="text-xs text-muted-foreground">
                          {vendor.category.replace(/_/g, " ")}
                          {vendor.rating && ` • ${vendor.rating} ⭐`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Start Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="start">
              Start Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start"
              type="datetime-local"
              value={formData.scheduledStart}
              onChange={(e) =>
                setFormData({ ...formData, scheduledStart: e.target.value })
              }
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          {/* End Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="end">
              End Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end"
              type="datetime-local"
              value={formData.scheduledEnd}
              onChange={(e) =>
                setFormData({ ...formData, scheduledEnd: e.target.value })
              }
              min={formData.scheduledStart || new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions or notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}