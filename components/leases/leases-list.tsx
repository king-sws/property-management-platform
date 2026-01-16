/* eslint-disable @typescript-eslint/no-explicit-any */
// components/leases/leases-list.tsx
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
  Calendar,
  DollarSign,
  Home,
  Plus,
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
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "ALL") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (leaseId: string, unitNumber: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the lease for Unit ${unitNumber}? This action cannot be undone.`
      )
    ) {
      return;
    }

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

  const getLeaseStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        );
      case "EXPIRING_SOON":
        return <Badge variant="destructive">Expiring Soon</Badge>;
      case "PENDING_SIGNATURE":
        return <Badge variant="secondary">Pending Signature</Badge>;
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      case "TERMINATED":
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const days = differenceInDays(new Date(endDate), new Date());
    return days;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Leases</CardTitle>
            <CardDescription>
              Manage lease agreements and tenant contracts
            </CardDescription>
          </div>
          <Button onClick={() => router.push("/dashboard/leases/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Lease
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by unit, property, or tenant..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full md:w-50">
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

        {initialData.leases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property & Unit</TableHead>
                    <TableHead>Tenant(s)</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialData.leases.map((lease) => {
                    const daysRemaining = getDaysRemaining(lease.endDate);
                    const primaryTenant = lease.tenants.find(
                      (t: any) => t.isPrimaryTenant
                    );

                    return (
                      <TableRow key={lease.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {lease.unit.property.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Unit {lease.unit.unitNumber}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {primaryTenant && (
                              <>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={
                                      primaryTenant.tenant.user.avatar ||
                                      primaryTenant.tenant.user.image
                                    }
                                    alt={primaryTenant.tenant.user.name || ""}
                                  />
                                  <AvatarFallback>
                                    {getInitials(
                                      primaryTenant.tenant.user.name || "TN"
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium">
                                    {primaryTenant.tenant.user.name}
                                  </div>
                                  {lease.tenants.length > 1 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{lease.tenants.length - 1} more
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(lease.startDate), "MMM d, yyyy")}
                            </div>
                            <div className="text-muted-foreground">
                              to{" "}
                              {lease.endDate
                                ? format(new Date(lease.endDate), "MMM d, yyyy")
                                : "Month-to-month"}
                            </div>
                            {daysRemaining !== null && daysRemaining > 0 && (
                              <div className="text-xs mt-1">
                                <Badge
                                  variant={
                                    daysRemaining <= 30
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {daysRemaining} days left
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {Number(lease.rentAmount).toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              /mo
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Due day {lease.rentDueDay}
                          </div>
                        </TableCell>
                        <TableCell>{getLeaseStatusBadge(lease.status)}</TableCell>
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
                                  router.push(`/dashboard/leases/${lease.id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/leases/${lease.id}/edit`)
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {lease.status === "DRAFT" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleDelete(lease.id, lease.unit.unitNumber)
                                    }
                                    disabled={isDeleting === lease.id}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isDeleting === lease.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </DropdownMenuItem>
                                </>
                              )}
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
                  Showing{" "}
                  {(initialData.pagination.page - 1) *
                    initialData.pagination.limit +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    initialData.pagination.page * initialData.pagination.limit,
                    initialData.pagination.total
                  )}{" "}
                  of {initialData.pagination.total} leases
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
      </CardContent>
    </Card>
  );
}