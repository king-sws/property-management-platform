/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// components/maintenance/schedule-appointment-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader2, AlertCircle } from "lucide-react";
import { scheduleAppointmentForTicket, getVendorAvailability } from "@/actions/maintenance-improved";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ScheduleAppointmentDialogProps {
  ticketId: string;
  vendorId: string;
  vendorName: string;
}

export function ScheduleAppointmentDialog({
  ticketId,
  vendorId,
  vendorName,
}: ScheduleAppointmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [notes, setNotes] = useState("");

  // Check availability when date changes
  useEffect(() => {
    if (scheduledStart && vendorId) {
      checkAvailability();
    }
  }, [scheduledStart]);

  const checkAvailability = async () => {
    setCheckingAvailability(true);
    try {
      const result = await getVendorAvailability(vendorId, scheduledStart);
      if (result.success) {
        setAvailability(result.data);
      }
    } catch (error) {
      console.error("Failed to check availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledStart || !scheduledEnd) {
      toast.error("Please select start and end times");
      return;
    }

    setLoading(true);
    try {
      const result = await scheduleAppointmentForTicket(ticketId, {
        scheduledStart,
        scheduledEnd,
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
      toast.error("Failed to schedule appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Schedule a service appointment with {vendorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vendor Info */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-sm font-medium">Vendor: {vendorName}</p>
            {availability && (
              <div className="mt-2 flex gap-2">
                <Badge variant={availability.isAvailable ? "default" : "secondary"}>
                  {availability.isAvailable ? "Available" : `${availability.appointments.length} appointment(s)`}
                </Badge>
                {availability.activeTickets > 0 && (
                  <Badge variant="outline">
                    {availability.activeTickets} active job(s)
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Start Time */}
          <div>
            <Label htmlFor="start">
              Start Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start"
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          {/* End Time */}
          <div>
            <Label htmlFor="end">
              End Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end"
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              min={scheduledStart || new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          {/* Availability Warning */}
          {availability && !availability.isAvailable && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vendor has {availability.appointments.length} appointment(s) on this day. 
                Please check for time conflicts.
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions..."
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
          <Button onClick={handleSchedule} disabled={loading || checkingAvailability}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Schedule Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}