/* eslint-disable @typescript-eslint/no-explicit-any */
// components/tenants/tenants-card-view.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserPlus,
  Home,
  DollarSign,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { deleteTenant } from "@/actions/tenants";
import { toast } from "sonner";

interface TenantsCardViewProps {
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

export function TenantsCardView({ initialData }: TenantsCardViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(window.location.search);
    if (value) { params.set("search", value); } else { params.delete("search"); }
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => router.push("/dashboard/tenants/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {initialData.tenants.length === 0 ? (
        <Card>
  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
    <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-5 mb-3">
      <UserPlus className="h-8 w-8 text-muted-foreground/40" />
    </div>
    <p className="text-sm font-medium text-muted-foreground mb-1">No tenants found</p>
    <p className="text-xs text-muted-foreground/60 max-w-[220px] mb-4">
      Get started by adding your first tenant to manage leases and payments.
    </p>
    <Button onClick={() => router.push("/dashboard/tenants/new")}>
      <UserPlus className="mr-2 h-4 w-4" />
      Add Tenant
    </Button>
  </CardContent>
</Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialData.tenants.map((tenant: any) => {
              const activeLease = tenant.leaseMembers?.[0];

              return (
                <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                  {/* Header: avatar + name + menu */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                        onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={tenant.user.avatar || tenant.user.image} />
                          <AvatarFallback>{getInitials(tenant.user.name || "TN")}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{tenant.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Since {format(new Date(tenant.createdAt), "MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
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
                  </CardHeader>

                  {/* Body */}
                  <CardContent className="space-y-3 pb-3">
                    {/* Contact */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{tenant.user.email}</span>
                      </div>
                      {tenant.user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {tenant.user.phone}
                        </div>
                      )}
                    </div>

                    {/* Lease info */}
                    <div className="pt-2 border-t space-y-1.5">
                      {activeLease ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Home className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <p className="text-sm font-medium truncate">
                              {activeLease.lease.unit.property.name}
                              <span className="font-normal text-muted-foreground">
                                {" "}· Unit {activeLease.lease.unit.unitNumber}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">
                              ${Number(activeLease.lease.rentAmount).toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-1">
                          No active lease
                        </p>
                      )}
                    </div>

                    {/* Payments */}
                    {(tenant.lastPayment || tenant.nextPayment) && (
                      <div className="pt-2 border-t space-y-1.5">
                        {tenant.nextPayment && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>Next due</span>
                            </div>
                            <span className="font-medium">
                              ${Number(tenant.nextPayment.amount).toLocaleString()}
                              {tenant.nextPayment.dueDate && (
                                <span className="font-normal text-muted-foreground">
                                  {" · "}{format(new Date(tenant.nextPayment.dueDate), "MMM dd")}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {tenant.lastPayment && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="h-3.5 w-3.5 shrink-0" />
                              <span>Last paid</span>
                            </div>
                            <span className="font-medium">
                              ${Number(tenant.lastPayment.amount).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  {/* Footer */}
                  <CardFooter className="pt-3 border-t flex items-center justify-between">
                    {activeLease ? (
                      <Badge variant={getLeaseStatusVariant(activeLease.lease.status)}>
                        {activeLease.lease.status.replace("_", " ")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No Lease</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
                    >
                      View Details
                      <Eye className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {initialData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                {(initialData.pagination.page - 1) * initialData.pagination.limit + 1}–
                {Math.min(
                  initialData.pagination.page * initialData.pagination.limit,
                  initialData.pagination.total
                )}{" "}
                of {initialData.pagination.total} tenants
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
    </div>
  );
}