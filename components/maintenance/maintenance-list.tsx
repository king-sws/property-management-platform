/* eslint-disable @typescript-eslint/no-explicit-any */
// components/maintenance/maintenance-list.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  Eye,
  Wrench,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

interface MaintenanceListProps {
  initialData: {
    tickets: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
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

export function MaintenanceList({ initialData }: MaintenanceListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [priority, setPriority] = useState(searchParams.get("priority") || "ALL");

  const { tickets, pagination } = initialData;

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

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") { params.set("priority", value); } else { params.delete("priority"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Card>
      {/* Header + filters */}
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>
              {pagination.total} ticket{pagination.total !== 1 ? "s" : ""} total
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full sm:w-48"
              />
            </div>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="WAITING_VENDOR">Waiting Vendor</SelectItem>
                <SelectItem value="WAITING_PARTS">Waiting Parts</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Wrench className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No maintenance tickets found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            {/* Desktop — grid rows */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Title</span>
                <span>Property</span>
                <span>Category</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Created</span>
                <span />
              </div>

              {tickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b last:border-0 items-center hover:bg-muted/30 transition-colors"
                >
                  {/* Title */}
                  <div
                    className="cursor-pointer min-w-0"
                    onClick={() => router.push(`/dashboard/maintenance/${ticket.id}`)}
                  >
                    <p className="text-sm font-medium truncate">{ticket.title}</p>
                    {ticket.location && (
                      <p className="text-xs text-muted-foreground truncate">
                        {ticket.location}
                      </p>
                    )}
                  </div>

                  {/* Property */}
                  <div>
                    <p className="text-sm font-medium truncate">{ticket.property.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.property.city}, {ticket.property.state}
                    </p>
                  </div>

                  {/* Category */}
                  <p className="text-sm truncate">{ticket.category}</p>

                  {/* Priority */}
                  <div>
                    <Badge className={priorityVariant[ticket.priority]?.className ?? ""}>
                      {priorityVariant[ticket.priority]?.label ?? ticket.priority}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge className={statusVariant[ticket.status]?.className ?? ""}>
                      {statusVariant[ticket.status]?.label ?? ticket.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Created */}
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                  </p>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/maintenance/${ticket.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {tickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => router.push(`/dashboard/maintenance/${ticket.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.property.name} · {ticket.property.city}
                      </p>
                    </div>
                    <Badge className={priorityVariant[ticket.priority]?.className ?? ""}>
                      {priorityVariant[ticket.priority]?.label ?? ticket.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={statusVariant[ticket.status]?.className ?? ""}>
                      {statusVariant[ticket.status]?.label ?? ticket.status.replace(/_/g, " ")}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>

                  {ticket.location && (
                    <p className="text-xs text-muted-foreground">{ticket.location}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
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