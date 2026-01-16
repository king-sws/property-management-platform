/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// app/(dashboard)/dashboard/tickets/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Save,
  Send,
  User,
} from "lucide-react";
import { getMaintenanceTicketById, updateMaintenanceTicket, addTicketUpdate } from "@/actions/maintenance";
import { format } from "date-fns";
import { toast } from "sonner";

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "WAITING_VENDOR" | "WAITING_PARTS" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  location?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
  vendor?: {
    id: string;
    businessName: string;
    category: string;
  };
  images: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  updates: Array<{
    id: string;
    message: string;
    isInternal: boolean;
    createdAt: string;
  }>;
};

export default function VendorTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Update form
  const [status, setStatus] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  // Update message
  const [updateMessage, setUpdateMessage] = useState("");
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [params.id]);

  const loadTicket = async () => {
    setLoading(true);
    const result = await getMaintenanceTicketById(params.id as string);

    if (result.success && result.data) {
      const ticketData = result.data;
      setTicket(ticketData);
      setStatus(ticketData.status);
      setEstimatedCost(ticketData.estimatedCost?.toString() || "");
      setActualCost(ticketData.actualCost?.toString() || "");
      setScheduledDate(ticketData.scheduledDate ? new Date(ticketData.scheduledDate).toISOString().split('T')[0] : "");
      setNotes(ticketData.notes || "");
    } else {
      toast("Failed to load ticket");
    }
    setLoading(false);
  };

  const handleUpdateTicket = async () => {
    if (!ticket) return;

    setUpdating(true);
    const result = await updateMaintenanceTicket(ticket.id, {
      status: status as any,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      actualCost: actualCost ? parseFloat(actualCost) : undefined,
      scheduledDate: scheduledDate || undefined,
      notes: notes || undefined,
    });

    if (result.success) {
      toast("Ticket updated successfully");
      loadTicket();
    } else {
      toast("Failed to update ticket");
        
    }
    setUpdating(false);
  };

  const handleAddUpdate = async () => {
    if (!ticket || !updateMessage.trim()) return;

    setIsAddingUpdate(true);
    const result = await addTicketUpdate(ticket.id, {
      message: updateMessage,
      isInternal: false,
    });

    if (result.success) {
      toast("Update added successfully");
      setUpdateMessage("");
      loadTicket();
    } else {
      toast("Failed to add update");
    }
    setIsAddingUpdate(false);
  };

  const handleStartWork = async () => {
    if (!ticket) return;

    setUpdating(true);
    const result = await updateMaintenanceTicket(ticket.id, {
      status: "IN_PROGRESS",
    });

    if (result.success) {
      toast("Started working on ticket");
      await addTicketUpdate(ticket.id, {
        message: "Started working on this ticket",
        isInternal: false,
      });
      loadTicket();
    } else {
      toast("Failed to start work");
    }
    setUpdating(false);
  };

  const handleCompleteTicket = async () => {
    if (!ticket) return;

    if (!actualCost) {
      toast("Please enter the actual cost before completing");
      return;
    }

    setUpdating(true);
    const result = await updateMaintenanceTicket(ticket.id, {
      status: "COMPLETED",
      actualCost: parseFloat(actualCost),
    });

    if (result.success) {
      toast("Ticket marked as completed");
      await addTicketUpdate(ticket.id, {
        message: `Completed work. Final cost: $${actualCost}`,
        isInternal: false,
      });
      loadTicket();
    } else {
      toast("Failed to complete ticket");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Ticket not found</CardTitle>
            <CardDescription className="mb-4">
              The ticket you're looking for doesn't exist or you don't have access to it
            </CardDescription>
            <Button onClick={() => router.push("/dashboard/tickets")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/tickets")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{ticket.title}</h1>
            <p className="text-muted-foreground">Ticket #{ticket.id.slice(-8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {ticket.status === "OPEN" && (
            <Button onClick={handleStartWork} disabled={updating}>
              <Clock className="mr-2 h-4 w-4" />
              Start Work
            </Button>
          )}
          {ticket.status === "IN_PROGRESS" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={updating}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Ticket</DialogTitle>
                  <DialogDescription>
                    Enter the final cost and mark this ticket as completed
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="final-cost">Actual Cost ($)</Label>
                    <Input
                      id="final-cost"
                      type="number"
                      step="0.01"
                      value={actualCost}
                      onChange={(e) => setActualCost(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCompleteTicket} disabled={updating}>
                    Complete Ticket
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ticket Details</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{ticket.priority}</Badge>
                  <Badge>{ticket.status.replace(/_/g, " ")}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{ticket.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {format(new Date(ticket.createdAt), "PPP")}
                  </p>
                </div>
                {ticket.scheduledDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="font-medium">
                      {format(new Date(ticket.scheduledDate), "PPP")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          {ticket.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ticket.images.map((image) => (
                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.caption || "Ticket image"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Updates Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Update Form */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add an update..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAddUpdate}
                  disabled={isAddingUpdate || !updateMessage.trim()}
                  size="sm"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Add Update
                </Button>
              </div>

              {/* Updates List */}
              <div className="space-y-4">
                {ticket.updates.map((update) => (
                  <div key={update.id} className="flex gap-3">
                    <div className="shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{update.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(update.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="WAITING_PARTS">Waiting for Parts</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estimated Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Actual Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes..."
                />
              </div>

              <Button
                onClick={handleUpdateTicket}
                disabled={updating}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle>Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{ticket.property.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.property.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.property.city}, {ticket.property.state} {ticket.property.zipCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle>Requested By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{ticket.createdBy.name}</p>
                  <p className="text-sm text-muted-foreground">{ticket.createdBy.email}</p>
                  {ticket.createdBy.phone && (
                    <p className="text-sm text-muted-foreground">{ticket.createdBy.phone}</p>
                  )}
                  <Badge variant="outline" className="mt-2">{ticket.createdBy.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated</span>
                <span className="font-medium">
                  {estimatedCost ? `$${parseFloat(estimatedCost).toFixed(2)}` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Actual</span>
                <span className="font-medium">
                  {actualCost ? `$${parseFloat(actualCost).toFixed(2)}` : "-"}
                </span>
              </div>
              {estimatedCost && actualCost && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="font-semibold">Variance</span>
                  <span className={`font-semibold ${
                    parseFloat(actualCost) > parseFloat(estimatedCost)
                      ? "text-red-600"
                      : "text-green-600"
                  }`}>
                    ${Math.abs(parseFloat(actualCost) - parseFloat(estimatedCost)).toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}