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

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  WAITING_VENDOR: "bg-purple-100 text-purple-800",
  WAITING_PARTS: "bg-orange-100 text-orange-800",
  SCHEDULED: "bg-teal-100 text-teal-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
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
  const isCreator = userRole === "TENANT";

  // Check if vendor needs to respond
  const needsVendorResponse = ticket.status === "WAITING_VENDOR" && isVendor;
  
  // Check if ticket is ready for scheduling
  const canSchedule = ticket.status === "IN_PROGRESS" && isLandlord && ticket.vendorId;

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    try {
      const updateData: any = {
        status: newStatus,
      };
      
      if (estimatedCost) {
        updateData.estimatedCost = parseFloat(estimatedCost);
      }
      
      if (actualCost) {
        updateData.actualCost = parseFloat(actualCost);
      }

      const result = await updateMaintenanceTicket(ticket.id, updateData);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setIsUpdateStatusOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!updateMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);
    try {
      const result = await addTicketUpdate(ticket.id, {
        message: updateMessage,
        isInternal: false,
      });
      if (result.success) {
        toast.success(result.message);
        setUpdateMessage("");
        router.refresh();
        setIsAddUpdateOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge className={priorityColors[ticket.priority]}>
            {ticket.priority}
          </Badge>
          <Badge className={statusColors[ticket.status]}>
            {ticket.status.replace(/_/g, " ")}
          </Badge>
          
          {isLandlord && (
            <>
              {!ticket.vendorId && (
                <AssignVendorDialog
                  ticketId={ticket.id}
                  currentVendorId={ticket.vendorId}
                  ticketCategory={ticket.category}
                />
              )}
              
              {ticket.status !== "COMPLETED" && ticket.status !== "CANCELLED" && (
                <Button onClick={() => setIsUpdateStatusOpen(true)}>
                  Update Status
                </Button>
              )}
            </>
          )}
          
          {isVendor && ticket.status !== "COMPLETED" && ticket.status !== "CANCELLED" && ticket.status !== "WAITING_VENDOR" && (
            <Button onClick={() => setIsUpdateStatusOpen(true)}>
              Update Status
            </Button>
          )}
        </div>
      </div>

      {/* VENDOR RESPONSE NEEDED ALERT */}
      {needsVendorResponse && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-3">
              <p className="font-medium">
                You've been assigned to this job. Please review and respond.
              </p>
              <VendorResponseDialog
                ticketId={ticket.id}
                ticketTitle={ticket.title}
                propertyName={ticket.property.name}
              />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* WAITING FOR VENDOR RESPONSE ALERT (Landlord View) */}
      {ticket.status === "WAITING_VENDOR" && isLandlord && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <p className="font-medium">
              Waiting for {ticket.vendor?.businessName || "vendor"} to accept or decline this job.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* SCHEDULE APPOINTMENT BUTTON */}
      {canSchedule && (
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-teal-900">Ready to Schedule?</p>
                <p className="text-sm text-teal-700">
                  Create an appointment for {ticket.vendor?.businessName} to complete this job.
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

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <CardTitle>{ticket.title}</CardTitle>
          <CardDescription>
            Created on {format(new Date(ticket.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="text-sm">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{ticket.category}</p>
            </div>
            {ticket.location && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{ticket.location}</p>
              </div>
            )}
            {ticket.scheduledDate && (
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">
                  {format(new Date(ticket.scheduledDate), "MMM dd, yyyy")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{ticket.property.name}</p>
            <p className="text-sm text-muted-foreground">
              {ticket.property.address}
            </p>
            <p className="text-sm text-muted-foreground">
              {ticket.property.city}, {ticket.property.state}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Requester Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Requested By
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{ticket.createdBy.name}</p>
            <p className="text-sm text-muted-foreground">{ticket.createdBy.email}</p>
            {ticket.createdBy.phone && (
              <p className="text-sm text-muted-foreground">{ticket.createdBy.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Vendor */}
      {ticket.vendor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Assigned Vendor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{ticket.vendor.businessName}</p>
              <p className="text-sm text-muted-foreground">
                {ticket.vendor.user?.name}
              </p>
              {ticket.vendor.user?.email && (
                <p className="text-sm text-muted-foreground">
                  {ticket.vendor.user.email}
                </p>
              )}
              {ticket.vendor.user?.phone && (
                <p className="text-sm text-muted-foreground">
                  {ticket.vendor.user.phone}
                </p>
              )}
              {ticket.vendor.rating && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {Number(ticket.vendor.rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({ticket.vendor.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Information */}
      {(ticket.estimatedCost || ticket.actualCost || isLandlord) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ticket.estimatedCost && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="font-medium text-lg">
                    ${ticket.estimatedCost.toLocaleString()}
                  </p>
                </div>
              )}
              {ticket.actualCost && (
                <div>
                  <p className="text-sm text-muted-foreground">Actual Cost</p>
                  <p className="font-medium text-lg">
                    ${ticket.actualCost.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Updates Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Updates
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddUpdateOpen(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Add Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ticket.updates && ticket.updates.length > 0 ? (
            <div className="space-y-4">
              {ticket.updates.map((update: any) => (
                <div
                  key={update.id}
                  className="border-l-2 border-muted pl-4 pb-4 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium">Update</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(update.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{update.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No updates yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Ticket Status</DialogTitle>
            <DialogDescription>
              Change the status and update cost information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
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
                <div>
                  <Label>Estimated Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>

                <div>
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
            <Button
              variant="outline"
              onClick={() => setIsUpdateStatusOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Update Dialog */}
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
            <Button
              variant="outline"
              onClick={() => setIsAddUpdateOpen(false)}
              disabled={isLoading}
            >
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