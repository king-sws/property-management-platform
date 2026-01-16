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
  MapPin,
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
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (tenantId: string, tenantName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${tenantName}? This action cannot be undone.`
      )
    ) {
      return;
    }

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLeaseStatusBadge = (tenant: any) => {
    const activeLease = tenant.leaseMembers?.[0];
    if (!activeLease) {
      return <Badge variant="secondary">No Active Lease</Badge>;
    }

    const status = activeLease.lease.status;
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "EXPIRING_SOON":
        return <Badge variant="destructive">Expiring Soon</Badge>;
      case "EXPIRED":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
            <div className="rounded-full bg-muted p-4 mb-4">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tenants found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Get started by adding your first tenant to manage their
              information, leases, and payments
            </p>
            <Button onClick={() => router.push("/dashboard/tenants/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {initialData.tenants.map((tenant) => {
              const activeLease = tenant.leaseMembers?.[0];
              const lastPayment = tenant.payments?.[0];

              return (
                <Card
                  key={tenant.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={tenant.user.avatar || tenant.user.image}
                            alt={tenant.user.name || ""}
                          />
                          <AvatarFallback>
                            {getInitials(tenant.user.name || "TN")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-base leading-none mb-1">
                            {tenant.user.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Since {format(new Date(tenant.createdAt), "MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/tenants/${tenant.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/tenants/${tenant.id}/edit`)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleDelete(tenant.id, tenant.user.name)
                            }
                            disabled={isDeleting === tenant.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting === tenant.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{tenant.user.email}</span>
                      </div>
                      {tenant.user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{tenant.user.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Property Info */}
                    {activeLease ? (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <Home className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {activeLease.lease.unit.property.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Unit {activeLease.lease.unit.unitNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium">
                            ${Number(activeLease.lease.rentAmount).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No active lease
                        </p>
                      </div>
                    )}

                    {/* Last Payment */}
                    {lastPayment && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Last Payment
                            </p>
                            <p className="text-sm font-medium">
                              ${Number(lastPayment.amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            lastPayment.status === "COMPLETED"
                              ? "default"
                              : lastPayment.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {lastPayment.status}
                        </Badge>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-3 border-t">
                    <div className="flex items-center justify-between w-full">
                      {getLeaseStatusBadge(tenant)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/tenants/${tenant.id}`)
                        }
                      >
                        View Details
                        <Eye className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {initialData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {(initialData.pagination.page - 1) *
                  initialData.pagination.limit +
                  1}{" "}
                to{" "}
                {Math.min(
                  initialData.pagination.page * initialData.pagination.limit,
                  initialData.pagination.total
                )}{" "}
                of {initialData.pagination.total} tenants
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(initialData.pagination.page - 1)
                  }
                  disabled={initialData.pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(initialData.pagination.page + 1)
                  }
                  disabled={
                    initialData.pagination.page >=
                    initialData.pagination.totalPages
                  }
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