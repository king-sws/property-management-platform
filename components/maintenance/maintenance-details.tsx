/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/maintenance/maintenance-details-improved.tsx
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building2,
  User,
  DollarSign,
  MessageSquare,
  Loader2,
  Send,
  Wrench,
  Star,
  AlertCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  updateMaintenanceTicket,
  addTicketUpdate,
} from "@/actions/maintenance";
import { ScheduleAppointmentDialog } from "@/components/maintenance/schedule-appointment-dialog";
import { AssignVendorDialog } from "./assign-vendor-dialog";
import { VendorResponseDialog } from "./vendor-response-dialog";

interface MaintenanceDetailsProps {
  ticket: any;
  userRole: string | undefined;
}

const statusVariant: Record<string, { label: string; className: string }> = {
  OPEN:           { label: "Open",           className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  IN_PROGRESS:    { label: "In Progress",    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300" },
  WAITING_VENDOR: { label: "Waiting Vendor", className: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300" },
  WAITING_PARTS:  { label: "Waiting Parts",  className: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300" },
  SCHEDULED:      { label: "Scheduled",      className: "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300" },
  COMPLETED:      { label: "Completed",      className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" },
  CANCELLED:      { label: "Cancelled",      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

const priorityVariant: Record<string, { label: string; className: string }> = {
  LOW:    { label: "Low",    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  MEDIUM: { label: "Medium", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  HIGH:   { label: "High",   className: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300" },
};

export function MaintenanceDetailsImproved({ ticket, userRole }: MaintenanceDetailsProps) {
  const router = useRouter();
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [updateMessage, setUpdateMessage] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(ticket.estimatedCost?.toString() || "");
  const [actualCost, setActualCost] = useState(ticket.actualCost?.toString() || "");

  const isLandlord = userRole === "LANDLORD" || userRole === "ADMIN";
  const isVendor = userRole === "VENDOR";
  const needsVendorResponse = ticket.status === "WAITING_VENDOR" && isVendor;
  const canSchedule = ticket.status === "IN_PROGRESS" && isLandlord && ticket.vendorId;

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    try {
      const updateData: any = { status: newStatus };
      if (estimatedCost) updateData.estimatedCost = parseFloat(estimatedCost);
      if (actualCost) updateData.actualCost = parseFloat(actualCost);
      const result = await updateMaintenanceTicket(ticket.id, updateData);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setIsUpdateStatusOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!updateMessage.trim()) { toast.error("Please enter a message"); return; }
    setIsLoading(true);
    try {
      const result = await addTicketUpdate(ticket.id, { message: updateMessage, isInternal: false });
      if (result.success) {
        toast.success(result.message);
        setUpdateMessage("");
        router.refresh();
        setIsAddUpdateOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge className={priorityVariant[ticket.priority]?.className ?? ""}>
            {priorityVariant[ticket.priority]?.label ?? ticket.priority}
          </Badge>
          <Badge className={statusVariant[ticket.status]?.className ?? ""}>
            {statusVariant[ticket.status]?.label ?? ticket.status.replace(/_/g, " ")}
          </Badge>
          {isLandlord && !ticket.vendorId && (
            <AssignVendorDialog
              ticketId={ticket.id}
              currentVendorId={ticket.vendorId}
              ticketCategory={ticket.category}
            />
          )}
          {isLandlord && ticket.status !== "COMPLETED" && ticket.status !== "CANCELLED" && (
            <Button onClick={() => setIsUpdateStatusOpen(true)}>
              Update Status
            </Button>
          )}
          {isVendor && ticket.status !== "COMPLETED" && ticket.status !== "CANCELLED" && ticket.status !== "WAITING_VENDOR" && (
            <Button onClick={() => setIsUpdateStatusOpen(true)}>
              Update Status
            </Button>
          )}
        </div>
      </div>

      {/* ── Alert banners ── */}
      {needsVendorResponse && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-3">
              <p className="font-medium">You've been assigned to this job. Please review and respond.</p>
              <VendorResponseDialog
                ticketId={ticket.id}
                ticketTitle={ticket.title}
                propertyName={ticket.property.name}
              />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {ticket.status === "WAITING_VENDOR" && isLandlord && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 font-medium">
            Waiting for {ticket.vendor?.businessName || "vendor"} to accept or decline this job.
          </AlertDescription>
        </Alert>
      )}

      {canSchedule && (
        <Card className="border border-teal-200 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/30">
  <CardContent>
    <div className="flex items-center justify-between gap-4">
      
      <div className="space-y-1">
        <p className="font-medium text-teal-900 dark:text-teal-300">
          Ready to Schedule?
        </p>

        <p className="text-sm text-teal-700 dark:text-teal-400">
          Create an appointment for{" "}
          <span className="font-medium text-teal-900 dark:text-teal-200">
            {ticket.vendor?.businessName}
          </span>{" "}
          to complete this job.
        </p>
      </div>

      <ScheduleAppointmentDialog
        ticketId={ticket.id}
        vendorId={ticket.vendorId}
        vendorName={ticket.vendor?.businessName || "Vendor"}
      />
      
    </div>
  </CardContent>
</Card>
      )}

      {/* ── Main detail card ── */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{ticket.title}</CardTitle>
            <CardDescription>
              Created {format(new Date(ticket.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Description */}
          <div className="px-6 py-4 border-b">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Description
            </p>
            <p className="text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b">
            <div className="px-6 py-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Category
              </p>
              <p className="text-sm font-medium">{ticket.category}</p>
            </div>
            {ticket.location && (
              <div className="px-6 py-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-sm font-medium">{ticket.location}</p>
              </div>
            )}
            {ticket.scheduledDate && (
              <div className="px-6 py-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Scheduled
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(ticket.scheduledDate), "MMM dd, yyyy")}
                </p>
              </div>
            )}
            {(ticket.estimatedCost || ticket.actualCost) && (
              <div className="px-6 py-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Cost
                </p>
                {ticket.estimatedCost && (
                  <p className="text-sm text-muted-foreground">
                    Est. <span className="font-medium text-foreground">${Number(ticket.estimatedCost).toLocaleString()}</span>
                  </p>
                )}
                {ticket.actualCost && (
                  <p className="text-sm text-muted-foreground">
                    Actual <span className="font-medium text-foreground">${Number(ticket.actualCost).toLocaleString()}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Property + Requester + Vendor — horizontal row */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">

            {/* Property */}
            <div className="px-6 py-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Property
              </p>
              <p className="text-sm font-medium">{ticket.property.name}</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {ticket.property.address}
                </p>
                <p className="text-xs text-muted-foreground pl-4">
                  {ticket.property.city}, {ticket.property.state}
                </p>
              </div>
            </div>

            {/* Requester */}
            <div className="px-6 py-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Requested By
              </p>
              <p className="text-sm font-medium">{ticket.createdBy.name}</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0" />
                  {ticket.createdBy.email}
                </p>
                {ticket.createdBy.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3 w-3 shrink-0" />
                    {ticket.createdBy.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Vendor */}
            <div className="px-6 py-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                Assigned Vendor
              </p>
              {ticket.vendor ? (
                <>
                  <p className="text-sm font-medium">{ticket.vendor.businessName}</p>
                  <div className="space-y-1">
                    {ticket.vendor.user?.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        {ticket.vendor.user.email}
                      </p>
                    )}
                    {ticket.vendor.user?.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        {ticket.vendor.user.phone}
                      </p>
                    )}
                    {ticket.vendor.rating && (
                      <div className="flex items-center gap-1 pt-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">
                          {Number(ticket.vendor.rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({ticket.vendor.reviewCount} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not assigned</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Updates timeline ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Updates
              </CardTitle>
              <CardDescription className='pt-1'>
                {ticket.updates?.length ?? 0} update{(ticket.updates?.length ?? 0) !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsAddUpdateOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Add Update
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {ticket.updates && ticket.updates.length > 0 ? (
            <div className="divide-y">
              {ticket.updates.map((update: any, index: number) => (
                <div key={update.id} className="px-6 py-4 flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    {index < ticket.updates.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(update.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <p className="text-sm">{update.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No updates yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Update Status Dialog ── */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Ticket Status</DialogTitle>
            <DialogDescription>
              Change the status and update cost information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WAITING_PARTS">Waiting Parts</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(isLandlord || isVendor) && (
              <>
                <div className="space-y-2">
                  <Label>Estimated Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Actual Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Update Dialog ── */}
      <Dialog open={isAddUpdateOpen} onOpenChange={setIsAddUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Update</DialogTitle>
            <DialogDescription>
              Provide an update on this maintenance ticket
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Message</Label>
            <Textarea
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              placeholder="Enter your update message..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUpdateOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}