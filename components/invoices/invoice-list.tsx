/* eslint-disable @typescript-eslint/no-explicit-any */
// components/invoices/invoice-list.tsx
"use client";

import { useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Wrench,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusVariant: Record<string, { label: string; className: string }> = {
  DRAFT:     { label: "Draft",     className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  PENDING:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300" },
  APPROVED:  { label: "Approved",  className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" },
  PAID:      { label: "Paid",      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
  REJECTED:  { label: "Rejected",  className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

interface InvoiceListProps {
  initialData: any;
  role: "vendor" | "landlord";
}

export function InvoiceList({ initialData, role }: InvoiceListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { invoices, pagination } = initialData;

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") { params.set(key, value); } else { params.delete(key); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => updateParams("search", searchTerm);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateParams("status", value);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const detailPath = (id: string) =>
    `/dashboard/${role === "vendor" ? "vendor/" : ""}invoices/${id}`;

  const pendingCount = invoices.filter((inv: any) => inv.status === "PENDING").length;

  return (
    <Card>
      {/* ── Header + filters ── */}
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>
              {pagination.total} invoice{pagination.total !== 1 ? "s" : ""} total
              {role === "landlord" && pendingCount > 0 && (
                <span className="ml-2 text-yellow-600 font-medium">
                  · {pendingCount} pending approval
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 w-full sm:w-52"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary" size="default">
                Search
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => alert("Export coming soon!")}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(searchParams.get("search") || (statusFilter && statusFilter !== "ALL")) && (
          <div className="flex flex-wrap gap-2 pt-3 border-t mt-2">
            <span className="text-xs text-muted-foreground self-center">Active filters:</span>
            {searchParams.get("search") && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Search: {searchParams.get("search")}
                <button onClick={() => { setSearchTerm(""); updateParams("search", ""); }} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {statusFilter && statusFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Status: {statusFilter}
                <button onClick={() => handleStatusChange("ALL")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No invoices found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchParams.get("search") || statusFilter !== "ALL"
                ? "Try adjusting your filters"
                : role === "vendor"
                ? "Create your first invoice to get started"
                : "No invoices have been submitted yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop — grid rows */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Invoice</span>
                <span>{role === "landlord" ? "Vendor / Ticket" : "Ticket / Property"}</span>
                <span>Total</span>
                <span>Due Date</span>
                <span>Status</span>
                <span />
              </div>

              {invoices.map((invoice: any) => {
                const sv = statusVariant[invoice.status];
                return (
                  <div
                    key={invoice.id}
                    onClick={() => router.push(detailPath(invoice.id))}
                    className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b last:border-0 items-center cursor-pointer hover:bg-muted/30 transition-colors ${
                      invoice.status === "PENDING" && role === "landlord"
                        ? "bg-yellow-50/50 dark:bg-yellow-950/10"
                        : ""
                    }`}
                  >
                    {/* Invoice number + created */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>

                    {/* Vendor / ticket */}
                    <div className="min-w-0 space-y-0.5">
                      {role === "landlord" && invoice.vendor && (
                        <p className="text-sm font-medium truncate">{invoice.vendor.businessName}</p>
                      )}
                      {invoice.ticket && (
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">{invoice.ticket.title}</p>
                        </div>
                      )}
                      {invoice.ticket?.property && (
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">{invoice.ticket.property.name}</p>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <p className="text-sm font-semibold">
                      ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>

                    {/* Due date */}
                    <div>
                      {invoice.dueDate ? (
                        <p className="text-sm">{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</p>
                      ) : invoice.paidAt ? (
                        <p className="text-xs text-green-600">
                          Paid {format(new Date(invoice.paidAt), "MMM dd")}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">—</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                      <Badge className={sv?.className ?? ""}>
                        {sv?.label ?? invoice.status}
                      </Badge>
                      {invoice.status === "PENDING" && role === "landlord" && (
                        <span className="text-xs text-yellow-600 font-medium">Action Required</span>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(detailPath(invoice.id)); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {invoices.map((invoice: any) => {
                const sv = statusVariant[invoice.status];
                return (
                  <div
                    key={invoice.id}
                    onClick={() => router.push(detailPath(invoice.id))}
                    className={`p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                      invoice.status === "PENDING" && role === "landlord"
                        ? "bg-yellow-50/50 dark:bg-yellow-950/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{invoice.invoiceNumber}</p>
                        {role === "landlord" && invoice.vendor && (
                          <p className="text-xs text-muted-foreground">{invoice.vendor.businessName}</p>
                        )}
                        {invoice.ticket && (
                          <p className="text-xs text-muted-foreground truncate">{invoice.ticket.title}</p>
                        )}
                      </div>
                      <Badge className={`${sv?.className ?? ""} shrink-0`}>
                        {sv?.label ?? invoice.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                      </span>
                      <span className="font-semibold">
                        ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {invoice.status === "REJECTED" && invoice.rejectionReason && (
                      <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2">
                        <p className="text-xs text-red-800 dark:text-red-300">{invoice.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => goToPage(pagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />Previous
                  </Button>
                  <div className="hidden sm:flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) pageNum = i + 1;
                      else if (pagination.page <= 3) pageNum = i + 1;
                      else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                      else pageNum = pagination.page - 2 + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline" size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => goToPage(pagination.page + 1)}
                  >
                    Next<ChevronRight className="h-4 w-4" />
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