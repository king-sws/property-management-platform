/* eslint-disable @typescript-eslint/no-explicit-any */
// components/leases/leases-list.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileText,
  Plus,
  Home,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { deleteLease } from "@/actions/leases";
import { toast } from "sonner";

interface LeasesListProps {
  initialData: {
    leases: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function LeasesList({ initialData }: LeasesListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(window.location.search);
    if (value) { params.set("search", value); } else { params.delete("search"); }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "ALL") { params.set("status", value); } else { params.delete("status"); }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (leaseId: string, unitNumber: string) => {
    if (!confirm(`Are you sure you want to delete the lease for Unit ${unitNumber}? This action cannot be undone.`)) return;
    setIsDeleting(leaseId);
    const result = await deleteLease(leaseId);
    if (result.success) {
      toast.success("Lease deleted successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete lease");
    }
    setIsDeleting(null);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case "ACTIVE": return "default";
      case "EXPIRING_SOON": return "destructive";
      case "PENDING_SIGNATURE": return "secondary";
      case "DRAFT": return "outline";
      case "EXPIRED": return "secondary";
      case "TERMINATED": return "destructive";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Active";
      case "EXPIRING_SOON": return "Expiring Soon";
      case "PENDING_SIGNATURE": return "Pending Signature";
      case "DRAFT": return "Draft";
      case "EXPIRED": return "Expired";
      case "TERMINATED": return "Terminated";
      default: return status;
    }
  };

  return (
    <Card>
      {/* Card header — title + filters side by side */}
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Leases</CardTitle>
            <CardDescription>
              {initialData.pagination.total} lease{initialData.pagination.total !== 1 ? "s" : ""} total
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leases..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="EXPIRING_SOON">Expiring Soon</SelectItem>
                <SelectItem value="PENDING_SIGNATURE">Pending Signature</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {initialData.leases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No leases found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first lease agreement
            </p>
            <Button onClick={() => router.push("/dashboard/leases/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Lease
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop — same grid-row style as TenantPaymentOverview */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Property / Unit</span>
                <span>Tenant(s)</span>
                <span>Term</span>
                <span>Rent</span>
                <span>Status</span>
                <span />
              </div>

              {initialData.leases.map((lease: any) => {
                const primaryTenant = lease.tenants.find((t: any) => t.isPrimaryTenant);
                const daysRemaining = lease.endDate
                  ? differenceInDays(new Date(lease.endDate), new Date())
                  : null;

                return (
                  <div
                    key={lease.id}
                    className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b last:border-0 items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* Property / Unit */}
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => router.push(`/dashboard/leases/${lease.id}`)}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Home className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {lease.unit.property.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Unit {lease.unit.unitNumber}
                        </p>
                      </div>
                    </div>

                    {/* Tenant(s) */}
                    <div className="flex items-center gap-2.5">
                      {primaryTenant ? (
                        <>
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage
                              src={primaryTenant.tenant.user.avatar || primaryTenant.tenant.user.image}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(primaryTenant.tenant.user.name || "TN")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {primaryTenant.tenant.user.name}
                            </p>
                            {lease.tenants.length > 1 && (
                              <p className="text-xs text-muted-foreground">
                                +{lease.tenants.length - 1} more
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">No tenant</p>
                      )}
                    </div>

                    {/* Term */}
                    <div>
                      <p className="text-sm">
                        {format(new Date(lease.startDate), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lease.endDate
                          ? `→ ${format(new Date(lease.endDate), "MMM d, yyyy")}`
                          : "Month-to-month"}
                      </p>
                      {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 60 && (
                        <Badge
                          variant={daysRemaining <= 30 ? "destructive" : "secondary"}
                          className="mt-1 text-xs"
                        >
                          {daysRemaining}d left
                        </Badge>
                      )}
                    </div>

                    {/* Rent */}
                    <div>
                      <p className="text-sm font-medium">
                        ${Number(lease.rentAmount).toLocaleString()}/mo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due day {lease.rentDueDay}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <Badge variant={getStatusVariant(lease.status)}>
                        {getStatusLabel(lease.status)}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/leases/${lease.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/leases/${lease.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {lease.status === "DRAFT" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(lease.id, lease.unit.unitNumber)}
                              disabled={isDeleting === lease.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isDeleting === lease.id ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {initialData.leases.map((lease: any) => {
                const primaryTenant = lease.tenants.find((t: any) => t.isPrimaryTenant);
                const daysRemaining = lease.endDate
                  ? differenceInDays(new Date(lease.endDate), new Date())
                  : null;

                return (
                  <div key={lease.id} className="p-4 space-y-3">
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer min-w-0"
                        onClick={() => router.push(`/dashboard/leases/${lease.id}`)}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Home className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {lease.unit.property.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unit {lease.unit.unitNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getStatusVariant(lease.status)} className="text-xs">
                          {getStatusLabel(lease.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/leases/${lease.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/leases/${lease.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />Edit
                            </DropdownMenuItem>
                            {lease.status === "DRAFT" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(lease.id, lease.unit.unitNumber)}
                                  disabled={isDeleting === lease.id}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {isDeleting === lease.id ? "Deleting..." : "Delete"}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Tenant */}
                    {primaryTenant && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={primaryTenant.tenant.user.avatar || primaryTenant.tenant.user.image} />
                          <AvatarFallback className="text-xs">
                            {getInitials(primaryTenant.tenant.user.name || "TN")}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground truncate">
                          {primaryTenant.tenant.user.name}
                          {lease.tenants.length > 1 && ` +${lease.tenants.length - 1} more`}
                        </p>
                      </div>
                    )}

                    {/* Rent + term */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(lease.startDate), "MMM d, yyyy")}
                        {lease.endDate ? ` → ${format(new Date(lease.endDate), "MMM d, yyyy")}` : " · Month-to-month"}
                      </span>
                      <span className="font-medium">
                        ${Number(lease.rentAmount).toLocaleString()}/mo
                      </span>
                    </div>

                    {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 60 && (
                      <Badge variant={daysRemaining <= 30 ? "destructive" : "secondary"} className="text-xs">
                        {daysRemaining} days left
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {initialData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  {(initialData.pagination.page - 1) * initialData.pagination.limit + 1}–
                  {Math.min(
                    initialData.pagination.page * initialData.pagination.limit,
                    initialData.pagination.total
                  )}{" "}
                  of {initialData.pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(initialData.pagination.page - 1)}
                    disabled={initialData.pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(initialData.pagination.page + 1)}
                    disabled={initialData.pagination.page >= initialData.pagination.totalPages}
                  >
                    Next
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