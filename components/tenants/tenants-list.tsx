/* eslint-disable @typescript-eslint/no-explicit-any */
// components/tenants/tenants-list.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import { deleteTenant } from "@/actions/tenants";
import { toast } from "sonner";

interface TenantsListProps {
  initialData: {
    tenants: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function TenantsList({ initialData }: TenantsListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Are you sure you want to delete ${tenantName}? This action cannot be undone.`)) return;
    setIsDeleting(tenantId);
    const result = await deleteTenant(tenantId);
    if (result.success) {
      toast.success("Tenant deleted successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete tenant");
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

  const getLeaseStatusVariant = (status?: string): any => {
    switch (status) {
      case "ACTIVE": return "default";
      case "EXPIRING_SOON": return "destructive";
      case "EXPIRED": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Tenants</CardTitle>
            <CardDescription>
              {initialData.pagination.total} tenant{initialData.pagination.total !== 1 ? "s" : ""} total
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full sm:w-52"
              />
            </div>
            <Button onClick={() => router.push("/dashboard/tenants/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {initialData.tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding your first tenant
            </p>
            <Button onClick={() => router.push("/dashboard/tenants/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop — matches TenantPaymentOverview grid style */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Tenant</span>
                <span>Contact</span>
                <span>Property / Unit</span>
                <span>Lease Status</span>
                <span>Last Payment</span>
                <span />
              </div>

              {initialData.tenants.map((tenant: any) => {
                const activeLease = tenant.leaseMembers?.[0];
                const lastPayment = tenant.payments?.[0];

                return (
                  <div
                    key={tenant.id}
                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b last:border-0 items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* Tenant */}
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={tenant.user.avatar || tenant.user.image} />
                        <AvatarFallback className="text-xs">
                          {getInitials(tenant.user.name || "TN")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{tenant.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Since {format(new Date(tenant.createdAt), "MMM yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{tenant.user.email}</span>
                      </div>
                      {tenant.user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          {tenant.user.phone}
                        </div>
                      )}
                    </div>

                    {/* Property */}
                    <div>
                      {activeLease ? (
                        <>
                          <p className="text-sm font-medium truncate">
                            {activeLease.lease.unit.property.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unit {activeLease.lease.unit.unitNumber}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">No active lease</p>
                      )}
                    </div>

                    {/* Lease status */}
                    <div>
                      {activeLease ? (
                        <Badge variant={getLeaseStatusVariant(activeLease.lease.status)}>
                          {activeLease.lease.status.replace("_", " ")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No Lease</Badge>
                      )}
                    </div>

                    {/* Last payment */}
                    <div>
                      {lastPayment ? (
                        <>
                          <p className="text-sm font-medium">
                            ${Number(lastPayment.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lastPayment.paidAt
                              ? format(new Date(lastPayment.paidAt), "MMM d, yyyy")
                              : "Pending"}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">No payments</p>
                      )}
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
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(tenant.id, tenant.user.name)}
                          disabled={isDeleting === tenant.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting === tenant.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {initialData.tenants.map((tenant: any) => {
                const activeLease = tenant.leaseMembers?.[0];
                const lastPayment = tenant.payments?.[0];

                return (
                  <div key={tenant.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={tenant.user.avatar || tenant.user.image} />
                          <AvatarFallback className="text-xs">
                            {getInitials(tenant.user.name || "TN")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{tenant.user.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.user.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(tenant.id, tenant.user.name)}
                            disabled={isDeleting === tenant.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting === tenant.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between">
                      {activeLease ? (
                        <p className="text-xs text-muted-foreground">
                          {activeLease.lease.unit.property.name} · Unit {activeLease.lease.unit.unitNumber}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">No active lease</p>
                      )}
                      {activeLease ? (
                        <Badge variant={getLeaseStatusVariant(activeLease.lease.status)} className="text-xs">
                          {activeLease.lease.status.replace("_", " ")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">No Lease</Badge>
                      )}
                    </div>

                    {lastPayment && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last payment</span>
                        <span className="font-medium">
                          ${Number(lastPayment.amount).toLocaleString()} ·{" "}
                          {lastPayment.paidAt
                            ? format(new Date(lastPayment.paidAt), "MMM d")
                            : "Pending"}
                        </span>
                      </div>
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