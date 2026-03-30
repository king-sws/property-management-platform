/* eslint-disable @typescript-eslint/no-explicit-any */
// components/schedule/appointment-list.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

const statusVariant: Record<string, { label: string; className: string }> = {
  SCHEDULED:   { label: "Scheduled",   className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  CONFIRMED:   { label: "Confirmed",   className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" },
  IN_PROGRESS: { label: "In Progress", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300" },
  COMPLETED:   { label: "Completed",   className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
  CANCELLED:   { label: "Cancelled",   className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  NO_SHOW:     { label: "No Show",     className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300" },
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
    if (value) { params.set("search", value); } else { params.delete("search"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") { params.set("status", value); } else { params.delete("status"); }
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
      if (newStatus === "IN_PROGRESS") updateData.actualStart = new Date().toISOString();
      if (newStatus === "COMPLETED") updateData.actualEnd = new Date().toISOString();
      const result = await updateAppointment(appointmentId, updateData);
      if (result.success) {
        toast.success(result.message || "Appointment updated");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update appointment");
      }
    } catch {
      toast.error("Failed to update appointment");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Card>
      {/* ── Header + filters ── */}
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>
              {pagination.total} appointment{pagination.total !== 1 ? "s" : ""} total
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
              />
            </div>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No appointments found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {appointments.map((appointment: any) => {
                const sv = statusVariant[appointment.status];

                return (
                  <div key={appointment.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                    {/* ── Row top: title + badge + menu ── */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {appointment.ticket
                            ? <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                            : <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          }
                          <p className="text-sm font-semibold truncate">
                            {appointment.ticket?.title ?? "General Appointment"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          {role === "landlord"
                            ? `Vendor: ${appointment.vendor?.businessName ?? "Unknown"}`
                            : appointment.ticket?.property
                              ? `Property: ${appointment.ticket.property.name ?? appointment.ticket.property.address}`
                              : null}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={sv?.className ?? ""}>
                          {sv?.label ?? appointment.status.replace(/_/g, " ")}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={updating === appointment.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {role === "vendor" && appointment.status === "SCHEDULED" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(appointment.id, "CONFIRMED")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            {role === "vendor" && appointment.status === "CONFIRMED" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(appointment.id, "IN_PROGRESS")}>
                                <Clock className="mr-2 h-4 w-4" />
                                Start Work
                              </DropdownMenuItem>
                            )}
                            {role === "vendor" && appointment.status === "IN_PROGRESS" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(appointment.id, "COMPLETED")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {(appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleUpdateStatus(appointment.id, "CANCELLED")}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* ── Row detail: date/time + location ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {format(new Date(appointment.scheduledStart), "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {format(new Date(appointment.scheduledStart), "h:mm a")} –{" "}
                        {format(new Date(appointment.scheduledEnd), "h:mm a")}
                      </div>
                      {appointment.ticket?.property && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>
                            {appointment.ticket.property.address},{" "}
                            {appointment.ticket.property.city},{" "}
                            {appointment.ticket.property.state}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Notes ── */}
                    {appointment.notes && (
                      <div className="mt-3 pl-6 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Notes: </span>
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* ── Actual times (if started/completed) ── */}
                    {(appointment.actualStart || appointment.actualEnd) && (
                      <div className="mt-3 pl-6 pt-3 border-t flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {appointment.actualStart && (
                          <span>
                            <span className="font-medium text-foreground">Started: </span>
                            {format(new Date(appointment.actualStart), "h:mm a")}
                          </span>
                        )}
                        {appointment.actualEnd && (
                          <span>
                            <span className="font-medium text-foreground">Completed: </span>
                            {format(new Date(appointment.actualEnd), "h:mm a")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}