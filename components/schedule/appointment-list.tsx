/* eslint-disable @typescript-eslint/no-explicit-any */
// components/schedule/appointment-list.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  MapPin,
  Wrench,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { updateAppointment } from "@/actions/schedules";
import { toast } from "sonner";

interface AppointmentListProps {
  initialData: {
    appointments: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  role: "vendor" | "landlord";
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  NO_SHOW: "bg-red-100 text-red-800",
};

export function AppointmentList({ initialData, role }: AppointmentListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const { appointments, pagination } = initialData;

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    setUpdating(appointmentId);
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "IN_PROGRESS") {
        updateData.actualStart = new Date().toISOString();
      } else if (newStatus === "COMPLETED") {
        updateData.actualEnd = new Date().toISOString();
      }

      const result = await updateAppointment(appointmentId, updateData);
      
      if (result.success) {
        toast.success(result.message || "Appointment updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update appointment");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">No appointments found</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {appointment.ticket ? (
                        <>
                          <Wrench className="h-4 w-4" />
                          {appointment.ticket.title}
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          General Appointment
                        </>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {role === "landlord" ? (
                        <span>Vendor: {appointment.vendor?.businessName || "Unknown"}</span>
                      ) : (
                        appointment.ticket?.property && (
                          <span>Property: {appointment.ticket.property.name || appointment.ticket.property.address}</span>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[appointment.status]}>
                      {appointment.status.replace(/_/g, " ")}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={updating === appointment.id}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {role === "vendor" && appointment.status === "SCHEDULED" && (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(appointment.id, "CONFIRMED")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {role === "vendor" && appointment.status === "CONFIRMED" && (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(appointment.id, "IN_PROGRESS")}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Start Work
                          </DropdownMenuItem>
                        )}
                        {role === "vendor" && appointment.status === "IN_PROGRESS" && (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(appointment.id, "COMPLETED")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        {(appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") && (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(appointment.id, "CANCELLED")}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Date and Time */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(appointment.scheduledStart), "MMM dd, yyyy")}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(appointment.scheduledStart), "h:mm a")} - 
                      {format(new Date(appointment.scheduledEnd), "h:mm a")}
                    </span>
                  </div>
                </div>

                {/* Property Address */}
                {appointment.ticket?.property && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{appointment.ticket.property.address}</p>
                      <p className="text-muted-foreground">
                        {appointment.ticket.property.city}, {appointment.ticket.property.state}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {appointment.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Actual Times */}
                {(appointment.actualStart || appointment.actualEnd) && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">Actual Times:</p>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                      {appointment.actualStart && (
                        <div>
                          Started: {format(new Date(appointment.actualStart), "h:mm a")}
                        </div>
                      )}
                      {appointment.actualEnd && (
                        <div>
                          Completed: {format(new Date(appointment.actualEnd), "h:mm a")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} appointments
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}