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
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Mail,
  Phone,
  Edit,
  Trash2,
  UserPlus,
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
    if (!confirm(`Are you sure you want to delete ${tenantName}? This action cannot be undone.`)) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Tenants</CardTitle>
            <CardDescription>
              Manage your tenant information and lease details
            </CardDescription>
          </div>
          <Button onClick={() => router.push("/dashboard/tenants/new")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {initialData.tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Current Property</TableHead>
                    <TableHead>Lease Status</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialData.tenants.map((tenant) => {
                    const activeLease = tenant.leaseMembers?.[0];
                    const lastPayment = tenant.payments?.[0];
                    
                    return (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={tenant.user.avatar || tenant.user.image} 
                                alt={tenant.user.name || ""} 
                              />
                              <AvatarFallback>
                                {getInitials(tenant.user.name || "TN")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {tenant.user.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Member since {format(new Date(tenant.createdAt), "MMM yyyy")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-50">
                                {tenant.user.email}
                              </span>
                            </div>
                            {tenant.user.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {tenant.user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {activeLease ? (
                            <div>
                              <div className="font-medium">
                                {activeLease.lease.unit.property.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Unit {activeLease.lease.unit.unitNumber}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No active lease
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getLeaseStatusBadge(tenant)}</TableCell>
                        <TableCell>
                          {lastPayment ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                ${Number(lastPayment.amount).toLocaleString()}
                              </div>
                              <div className="text-muted-foreground">
                                {lastPayment.paidAt
                                  ? format(new Date(lastPayment.paidAt), "MMM d, yyyy")
                                  : "Pending"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No payments
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {initialData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((initialData.pagination.page - 1) * initialData.pagination.limit) + 1} to{" "}
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
                    onClick={() => handlePageChange(initialData.pagination.page - 1)}
                    disabled={initialData.pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(initialData.pagination.page + 1)}
                    disabled={
                      initialData.pagination.page >= initialData.pagination.totalPages
                    }
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