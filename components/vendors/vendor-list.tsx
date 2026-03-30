/* eslint-disable @typescript-eslint/no-explicit-any */
// components/vendors/vendor-list.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Wrench,
  Star,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";

interface VendorListProps {
  initialData: {
    vendors: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const categoryColors: Record<string, string> = {
  PLUMBER:            "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  ELECTRICIAN:        "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  HVAC:               "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  LANDSCAPING:        "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  CLEANING:           "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300",
  PEST_CONTROL:       "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  GENERAL_CONTRACTOR: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
  HANDYMAN:           "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  APPLIANCE_REPAIR:   "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  LOCKSMITH:          "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
  PAINTER:            "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300",
  ROOFER:             "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  OTHER:              "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

export function VendorList({ initialData }: VendorListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("isActive") || "ALL");

  const { vendors, pagination } = initialData;

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set("search", value); } else { params.delete("search"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") { params.set("category", value); } else { params.delete("category"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "ALL") { params.set("isActive", value); } else { params.delete("isActive"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">

      {/* ── Filters card ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Vendors</CardTitle>
              <CardDescription>
                {pagination.total} vendor{pagination.total !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 w-full sm:w-48"
                />
              </div>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="PLUMBER">Plumber</SelectItem>
                  <SelectItem value="ELECTRICIAN">Electrician</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="LANDSCAPING">Landscaping</SelectItem>
                  <SelectItem value="CLEANING">Cleaning</SelectItem>
                  <SelectItem value="PEST_CONTROL">Pest Control</SelectItem>
                  <SelectItem value="GENERAL_CONTRACTOR">General Contractor</SelectItem>
                  <SelectItem value="HANDYMAN">Handyman</SelectItem>
                  <SelectItem value="APPLIANCE_REPAIR">Appliance Repair</SelectItem>
                  <SelectItem value="LOCKSMITH">Locksmith</SelectItem>
                  <SelectItem value="PAINTER">Painter</SelectItem>
                  <SelectItem value="ROOFER">Roofer</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={handleActiveFilterChange}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── Vendor cards grid ── */}
      {vendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Wrench className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No vendors found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor: any) => (
              <Card
                key={vendor.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
              >
                {/* ── Card header: avatar + name + menu ── */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={vendor.user.avatar || vendor.user.image} />
                        <AvatarFallback>
                          {vendor.businessName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {vendor.businessName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {vendor.user.name}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/vendors/${vendor.id}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* ── Category + status + rating ── */}
                  <div className="px-6 pb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={categoryColors[vendor.category] ?? ""}>
                        {vendor.category.replace(/_/g, " ")}
                      </Badge>
                      {vendor.isActive ? (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {vendor.rating && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {Number(vendor.rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({vendor.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Services ── */}
                  {vendor.services?.length > 0 && (
                    <div className="px-6 py-3 border-t">
                      <div className="flex flex-wrap gap-1">
                        {vendor.services.slice(0, 3).map((service: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {vendor.services.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{vendor.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Contact + location ── */}
                  <div className="px-6 py-3 border-t space-y-1.5">
                    {vendor.city && vendor.state && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {vendor.city}, {vendor.state}
                      </div>
                    )}
                    {vendor.user.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {vendor.user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{vendor.user.email}</span>
                    </div>
                  </div>

                  {/* ── Active jobs ── */}
                  {vendor.tickets?.length > 0 && (
                    <div className="px-6 py-3 border-t flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {vendor.tickets.length}
                        </span>{" "}
                        active job{vendor.tickets.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Pagination ── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
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
    </div>
  );
}