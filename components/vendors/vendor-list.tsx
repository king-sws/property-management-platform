/* eslint-disable @typescript-eslint/no-explicit-any */
// components/vendors/vendor-list.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Stack, Grid } from "@/components/ui/container";
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
  PLUMBER: "bg-blue-100 text-blue-800",
  ELECTRICIAN: "bg-yellow-100 text-yellow-800",
  HVAC: "bg-purple-100 text-purple-800",
  LANDSCAPING: "bg-green-100 text-green-800",
  CLEANING: "bg-pink-100 text-pink-800",
  PEST_CONTROL: "bg-orange-100 text-orange-800",
  GENERAL_CONTRACTOR: "bg-indigo-100 text-indigo-800",
  HANDYMAN: "bg-gray-100 text-gray-800",
  APPLIANCE_REPAIR: "bg-red-100 text-red-800",
  LOCKSMITH: "bg-teal-100 text-teal-800",
  PAINTER: "bg-cyan-100 text-cyan-800",
  ROOFER: "bg-amber-100 text-amber-800",
  OTHER: "bg-slate-100 text-slate-800",
};

export function VendorList({ initialData }: VendorListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("isActive") || "ALL");

  const { vendors } = initialData;

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "ALL") {
      params.set("isActive", value);
    } else {
      params.delete("isActive");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <Stack spacing="lg">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
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
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendors Grid */}
      {vendors.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">No vendors found</p>
          </div>
        </Card>
      ) : (
        <Grid cols={3} gap="lg">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={vendor.user.avatar || vendor.user.image} />
                      <AvatarFallback>
                        {vendor.businessName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{vendor.businessName}</h3>
                      <p className="text-sm text-muted-foreground">{vendor.user.name}</p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Category & Status */}
                <div className="flex items-center gap-2">
                  <Badge className={categoryColors[vendor.category]}>
                    {vendor.category.replace(/_/g, " ")}
                  </Badge>
                  {vendor.isActive ? (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <XCircle className="h-3 w-3 text-gray-600" />
                      Inactive
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                {vendor.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{vendor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({vendor.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Services */}
                {vendor.services.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Services:</p>
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

                {/* Contact Info */}
                <div className="space-y-2 pt-2 border-t">
                  {vendor.city && vendor.state && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {vendor.city}, {vendor.state}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {vendor.user.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {vendor.user.email}
                  </div>
                </div>

                {/* Active Jobs */}
                {vendor.tickets.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <span className="font-medium">{vendor.tickets.length}</span>{" "}
                      <span className="text-muted-foreground">active jobs</span>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </Stack>
  );
}