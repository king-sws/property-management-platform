/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/maintenance-report-view.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock, DollarSign, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface MaintenanceReportViewProps {
  data: any;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const priorityClass: Record<string, string> = {
  URGENT: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  HIGH:   "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  LOW:    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusClass: Record<string, string> = {
  COMPLETED:   "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  OPEN:        "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  CANCELLED:   "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function MaintenanceReportView({ data }: MaintenanceReportViewProps) {
  const { summary, byStatus, byPriority, byCategory, byProperty, tickets } = data;

  return (
    <div className="space-y-6">

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalTickets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{summary.completedTickets}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((summary.completedTickets / summary.totalTickets) * 100).toFixed(0)}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.avgResolutionTime.toFixed(1)} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalActualCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Est. {formatCurrency(summary.totalEstimatedCost)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Status / Priority / Category breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>By Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Object.entries(byStatus).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between px-6 py-3">
                  <Badge className={statusClass[status] ?? "bg-gray-100 text-gray-800"}>
                    {status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>By Priority</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Object.entries(byPriority).map(([priority, count]: [string, any]) => (
                <div key={priority} className="flex items-center justify-between px-6 py-3">
                  <Badge className={priorityClass[priority] ?? "bg-gray-100 text-gray-800"}>
                    {priority}
                  </Badge>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Object.entries(byCategory).slice(0, 6).map(([category, count]: [string, any]) => (
                <div key={category} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm">{category}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── By property ── */}
      {byProperty.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Maintenance by Property</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden md:block">
              <div className="grid grid-cols-3 gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Property</span>
                <span className="text-center">Tickets</span>
                <span className="text-right">Total Cost</span>
              </div>
              {byProperty.map((property: any) => (
                <div key={property.propertyId} className="grid grid-cols-3 gap-4 px-6 py-3 border-b last:border-0 items-center">
                  <p className="text-sm font-medium">{property.propertyName}</p>
                  <p className="text-sm text-center">{property.ticketCount}</p>
                  <p className="text-sm font-medium text-right">{formatCurrency(property.totalCost)}</p>
                </div>
              ))}
            </div>
            <div className="md:hidden divide-y">
              {byProperty.map((property: any) => (
                <div key={property.propertyId} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{property.propertyName}</p>
                    <p className="text-xs text-muted-foreground">{property.ticketCount} tickets</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(property.totalCost)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recent tickets ── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>Latest maintenance requests</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_1.5fr_2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Date</span>
              <span>Property</span>
              <span>Title</span>
              <span>Category</span>
              <span>Priority</span>
              <span>Status</span>
              <span className="text-right">Cost</span>
            </div>
            {tickets.slice(0, 10).map((ticket: any) => (
              <div
                key={ticket.id}
                className="grid grid-cols-[1fr_1.5fr_2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-3 border-b last:border-0 items-center"
              >
                <p className="text-sm">{format(new Date(ticket.createdAt), "MMM d")}</p>
                <p className="text-sm truncate">{ticket.property.name}</p>
                <p className="text-sm truncate">{ticket.title}</p>
                <p className="text-sm">{ticket.category}</p>
                <Badge className={priorityClass[ticket.priority] ?? ""}>{ticket.priority}</Badge>
                <Badge className={statusClass[ticket.status] ?? ""}>{ticket.status.replace(/_/g, " ")}</Badge>
                <p className="text-sm text-right">
                  {ticket.actualCost
                    ? formatCurrency(Number(ticket.actualCost))
                    : ticket.estimatedCost
                    ? `~${formatCurrency(Number(ticket.estimatedCost))}`
                    : "—"}
                </p>
              </div>
            ))}
          </div>
          <div className="md:hidden divide-y">
            {tickets.slice(0, 10).map((ticket: any) => (
              <div key={ticket.id} className="px-6 py-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium truncate">{ticket.title}</p>
                  <Badge className={`${priorityClass[ticket.priority] ?? ""} shrink-0`}>{ticket.priority}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{ticket.property.name} · {format(new Date(ticket.createdAt), "MMM d")}</p>
                  <Badge className={statusClass[ticket.status] ?? ""}>{ticket.status.replace(/_/g, " ")}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}