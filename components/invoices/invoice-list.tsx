/* eslint-disable @typescript-eslint/no-explicit-any */
// components/invoices/invoice-list.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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
import { Search, Filter, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  PAID: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
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
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to first page on filter change
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    updateParams("search", searchTerm);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateParams("status", value);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export functionality coming soon!");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, vendor, or ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              Search
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-37.5">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchParams.get("search") || (statusFilter && statusFilter !== "ALL")) && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchParams.get("search") && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchParams.get("search")}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    updateParams("search", "");
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {statusFilter && statusFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter}
                <button
                  onClick={() => handleStatusChange("ALL")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {invoices.length} of {pagination.total} invoices
        </p>
        {role === "landlord" && (
          <p>
            {invoices.filter((inv: any) => inv.status === "PENDING").length} pending approval
          </p>
        )}
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No invoices found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchParams.get("search") || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : role === "vendor"
              ? "Create your first invoice to get started"
              : "No invoices have been submitted yet"}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice: any) => (
            <Card
              key={invoice.id}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => router.push(`/dashboard/${role === "vendor" ? "vendor/" : ""}invoices/${invoice.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                    <Badge className={statusColors[invoice.status]}>
                      {invoice.status}
                    </Badge>
                    {invoice.status === "PENDING" && role === "landlord" && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Action Required
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {role === "landlord" ? invoice.vendor?.businessName : "Vendor Invoice"}
                    </p>
                    {invoice.ticket && (
                      <p className="text-sm text-muted-foreground">
                        📋 {invoice.ticket.title}
                      </p>
                    )}
                    {invoice.ticket?.property && (
                      <p className="text-xs text-muted-foreground">
                        🏠 {invoice.ticket.property.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span>Created: {format(new Date(invoice.createdAt), "MMM dd, yyyy")}</span>
                    {invoice.dueDate && (
                      <span>Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}</span>
                    )}
                    {invoice.paidAt && (
                      <span className="text-green-600">
                        Paid: {format(new Date(invoice.paidAt), "MMM dd, yyyy")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <p className="text-2xl font-bold">
                    ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/${role === "vendor" ? "vendor/" : ""}invoices/${invoice.id}`);
                    }}
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Show rejection reason if rejected */}
              {invoice.status === "REJECTED" && invoice.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs font-medium text-red-900">Rejection Reason:</p>
                  <p className="text-sm text-red-800 mt-1">{invoice.rejectionReason}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => goToPage(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => goToPage(pagination.page + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}